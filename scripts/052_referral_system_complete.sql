-- Script para completar el sistema de referidos de brokers
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna referral_code a profiles si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
        ALTER TABLE profiles ADD COLUMN referral_code VARCHAR(20) UNIQUE;
    END IF;
END $$;

-- 2. Agregar columna referred_by a reservations si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'referred_by') THEN
        ALTER TABLE reservations ADD COLUMN referred_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- 3. Crear tabla referrals si no existe
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id),
    referred_id UUID NOT NULL REFERENCES profiles(id),
    referral_code VARCHAR(20) NOT NULL,
    level INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    total_sales INTEGER DEFAULT 0,
    commission_earned DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

-- 4. Función para generar código de referido único
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_code VARCHAR(20);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generar código: WC + 8 caracteres alfanuméricos
        new_code := 'WC' || upper(substr(md5(random()::text), 1, 8));
        
        -- Verificar si ya existe
        SELECT COUNT(*) INTO exists_count FROM profiles WHERE referral_code = new_code;
        
        IF exists_count = 0 THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para asignar código de referido automáticamente
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_referral_code ON profiles;
CREATE TRIGGER trigger_assign_referral_code
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_referral_code();

-- 6. Asignar códigos a perfiles existentes que no tienen
UPDATE profiles 
SET referral_code = generate_referral_code() 
WHERE referral_code IS NULL;

-- 7. Función para procesar comisiones de referido multinivel
CREATE OR REPLACE FUNCTION process_referral_commission(
    p_reservation_id UUID,
    p_sale_amount DECIMAL,
    p_buyer_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_referrer_id UUID;
    v_level1_id UUID;
    v_level2_id UUID;
    v_level3_id UUID;
    v_commission DECIMAL;
BEGIN
    -- Obtener el referidor directo del comprador
    SELECT referred_by INTO v_level1_id FROM profiles WHERE id = p_buyer_id;
    
    IF v_level1_id IS NOT NULL THEN
        -- Nivel 1: 5% comisión
        v_commission := p_sale_amount * 0.05;
        INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
        VALUES (v_level1_id, p_reservation_id, p_sale_amount, 0.05, v_commission, 1, 'pending');
        
        -- Actualizar total en referrals
        UPDATE referrals SET 
            total_sales = total_sales + 1,
            commission_earned = commission_earned + v_commission,
            updated_at = NOW()
        WHERE referrer_id = v_level1_id AND referred_id = p_buyer_id;
        
        -- Buscar nivel 2
        SELECT referred_by INTO v_level2_id FROM profiles WHERE id = v_level1_id;
        
        IF v_level2_id IS NOT NULL THEN
            -- Nivel 2: 2% comisión
            v_commission := p_sale_amount * 0.02;
            INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
            VALUES (v_level2_id, p_reservation_id, p_sale_amount, 0.02, v_commission, 2, 'pending');
            
            -- Buscar nivel 3
            SELECT referred_by INTO v_level3_id FROM profiles WHERE id = v_level2_id;
            
            IF v_level3_id IS NOT NULL THEN
                -- Nivel 3: 1% comisión
                v_commission := p_sale_amount * 0.01;
                INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
                VALUES (v_level3_id, p_reservation_id, p_sale_amount, 0.01, v_commission, 3, 'pending');
            END IF;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para registrar un referido
CREATE OR REPLACE FUNCTION register_referral(
    p_referral_code VARCHAR,
    p_new_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_referrer_id UUID;
BEGIN
    -- Buscar el referidor por su código
    SELECT id INTO v_referrer_id FROM profiles WHERE referral_code = p_referral_code;
    
    IF v_referrer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar el nuevo usuario con su referidor
    UPDATE profiles SET referred_by = v_referrer_id WHERE id = p_new_user_id;
    
    -- Crear registro en la tabla referrals
    INSERT INTO referrals (referrer_id, referred_id, referral_code, level, status)
    VALUES (v_referrer_id, p_new_user_id, p_referral_code, 1, 'active')
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Función para crear referido anónimo (para usuarios no registrados)
CREATE OR REPLACE FUNCTION create_anonymous_referral(
    p_visitor_fingerprint TEXT,
    p_visitor_ip TEXT DEFAULT NULL,
    p_visitor_country TEXT DEFAULT NULL,
    p_referrer_name TEXT DEFAULT NULL,
    p_referrer_email TEXT DEFAULT NULL,
    p_referrer_phone TEXT DEFAULT NULL
)
RETURNS TABLE(referral_code VARCHAR, referral_id UUID) AS $$
DECLARE
    v_referral_id UUID;
    v_referral_code VARCHAR(20);
BEGIN
    -- Verificar si ya existe un referido con este fingerprint
    SELECT ar.id, ar.referral_code INTO v_referral_id, v_referral_code
    FROM anonymous_referrals ar
    WHERE ar.visitor_fingerprint = p_visitor_fingerprint;
    
    IF v_referral_id IS NOT NULL THEN
        RETURN QUERY SELECT v_referral_code, v_referral_id;
        RETURN;
    END IF;
    
    -- Generar nuevo código
    v_referral_code := 'AR' || upper(substr(md5(random()::text), 1, 8));
    v_referral_id := gen_random_uuid();
    
    -- Insertar nuevo referido anónimo
    INSERT INTO anonymous_referrals (
        id, referral_code, visitor_fingerprint, visitor_ip, visitor_country,
        referrer_name, referrer_email, referrer_phone
    ) VALUES (
        v_referral_id, v_referral_code, p_visitor_fingerprint, p_visitor_ip, p_visitor_country,
        p_referrer_name, p_referrer_email, p_referrer_phone
    );
    
    RETURN QUERY SELECT v_referral_code, v_referral_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Vista para obtener estadísticas de broker
CREATE OR REPLACE VIEW broker_referral_stats AS
SELECT 
    p.id AS broker_id,
    p.referral_code,
    p.display_name,
    p.is_broker_elite,
    COUNT(DISTINCT r.referred_id) AS total_referrals,
    COALESCE(SUM(bc.commission_amount_usdc) FILTER (WHERE bc.referral_level = 1), 0) AS level1_earnings,
    COALESCE(SUM(bc.commission_amount_usdc) FILTER (WHERE bc.referral_level = 2), 0) AS level2_earnings,
    COALESCE(SUM(bc.commission_amount_usdc) FILTER (WHERE bc.referral_level = 3), 0) AS level3_earnings,
    COALESCE(SUM(bc.commission_amount_usdc), 0) AS total_earnings,
    COUNT(DISTINCT bc.reservation_id) AS total_sales
FROM profiles p
LEFT JOIN referrals r ON p.id = r.referrer_id
LEFT JOIN broker_commissions bc ON p.id = bc.broker_id
WHERE p.role IN ('broker', 'broker_elite')
GROUP BY p.id, p.referral_code, p.display_name, p.is_broker_elite;

-- 11. Índices para optimización
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_broker_commissions_broker_id ON broker_commissions(broker_id);
CREATE INDEX IF NOT EXISTS idx_reservations_referred_by ON reservations(referred_by);

-- 12. RLS Policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "System can insert referrals" ON referrals;
CREATE POLICY "System can insert referrals" ON referrals
    FOR INSERT WITH CHECK (true);
