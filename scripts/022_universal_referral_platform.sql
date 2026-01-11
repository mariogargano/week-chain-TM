-- Sistema Universal de Referidos para TODA la plataforma
-- TODOS los usuarios pueden referir y ganar comisiones
-- Estructura multinivel de 3 niveles: 3% - 2% - 1%
-- Elite status a las 24 semanas vendidas (1 semana de recompensa)
-- 48 semanas vendidas = 2 semanas de recompensa

-- Actualizar tabla profiles para todos los usuarios
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_weeks_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS elite_weeks_earned INTEGER DEFAULT 0;

-- Actualizar función de comisiones para TODOS los usuarios (no solo brokers)
CREATE OR REPLACE FUNCTION get_universal_commission_rate(p_referral_level INTEGER DEFAULT 1)
RETURNS NUMERIC AS $$
BEGIN
  -- TODOS los usuarios tienen sistema multinivel 3%-2%-1%
  CASE p_referral_level
    WHEN 1 THEN RETURN 0.03;    -- 3% para nivel 1 (directo)
    WHEN 2 THEN RETURN 0.02;    -- 2% para nivel 2
    WHEN 3 THEN RETURN 0.01;    -- 1% para nivel 3
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para rastrear árbol de referidos (hasta 3 niveles) para TODOS
CREATE OR REPLACE FUNCTION track_universal_referral_tree(
  p_referred_user_id UUID,
  p_direct_referrer_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_level INTEGER := 1;
  v_current_referrer UUID := p_direct_referrer_id;
BEGIN
  -- Rastrear hasta 3 niveles para TODOS los usuarios
  WHILE v_current_referrer IS NOT NULL AND v_level <= 3 LOOP
    INSERT INTO referral_tree (broker_id, referred_user_id, level)
    VALUES (v_current_referrer, p_referred_user_id, v_level)
    ON CONFLICT (broker_id, referred_user_id) DO NOTHING;
    
    -- Obtener siguiente nivel de referidor
    SELECT referred_by INTO v_current_referrer
    FROM profiles
    WHERE id = v_current_referrer;
    
    v_level := v_level + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada para distribuir comisiones universales
CREATE OR REPLACE FUNCTION distribute_universal_commissions(
  p_reservation_id UUID,
  p_sale_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
  v_user_wallet TEXT;
  v_referred_user_id UUID;
  v_referral RECORD;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
BEGIN
  -- Obtener información del comprador
  SELECT r.user_wallet, p.id
  INTO v_user_wallet, v_referred_user_id
  FROM reservations r
  LEFT JOIN profiles p ON p.wallet_address = r.user_wallet
  WHERE r.id = p_reservation_id;
  
  -- Si no hay perfil, salir
  IF v_referred_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Distribuir comisiones a todos los niveles del árbol de referidos
  FOR v_referral IN
    SELECT rt.broker_id, rt.level
    FROM referral_tree rt
    WHERE rt.referred_user_id = v_referred_user_id
    ORDER BY rt.level
  LOOP
    v_commission_rate := get_universal_commission_rate(v_referral.level);
    v_commission_amount := p_sale_amount * v_commission_rate;
    
    -- Insertar comisión
    INSERT INTO user_referral_commissions (
      referrer_id,
      referred_user_id,
      reservation_id,
      sale_amount_usdc,
      commission_rate,
      commission_amount_usdc,
      status,
      metadata
    ) VALUES (
      v_referral.broker_id,
      v_referred_user_id,
      p_reservation_id,
      p_sale_amount,
      v_commission_rate,
      v_commission_amount,
      'pending',
      jsonb_build_object('level', v_referral.level)
    );
    
    -- Actualizar contador de semanas vendidas del referidor
    UPDATE profiles
    SET total_weeks_sold = total_weeks_sold + 1
    WHERE id = v_referral.broker_id;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para otorgar status Elite y recompensas
CREATE OR REPLACE FUNCTION check_and_grant_elite_status(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_weeks_sold INTEGER;
  v_is_elite BOOLEAN;
  v_weeks_earned INTEGER;
BEGIN
  -- Obtener semanas vendidas actuales
  SELECT total_weeks_sold, is_elite, elite_weeks_earned
  INTO v_weeks_sold, v_is_elite, v_weeks_earned
  FROM profiles
  WHERE id = p_user_id;
  
  -- Otorgar Elite status y recompensas según semanas vendidas
  IF v_weeks_sold >= 48 AND v_weeks_earned < 2 THEN
    -- 48+ semanas = 2 semanas de recompensa
    UPDATE profiles
    SET 
      is_elite = TRUE,
      elite_weeks_earned = 2
    WHERE id = p_user_id;
    
    -- Crear beneficios de 2 semanas
    INSERT INTO broker_elite_benefits (broker_id, benefit_type, ownership_percentage, status)
    VALUES 
      (p_user_id, 'low_season_week', 50.00, 'available'),
      (p_user_id, 'low_season_week', 50.00, 'available')
    ON CONFLICT DO NOTHING;
    
  ELSIF v_weeks_sold >= 24 AND NOT v_is_elite THEN
    -- 24+ semanas = Elite status + 1 semana de recompensa
    UPDATE profiles
    SET 
      is_elite = TRUE,
      elite_weeks_earned = 1
    WHERE id = p_user_id;
    
    -- Crear beneficio de 1 semana
    INSERT INTO broker_elite_benefits (broker_id, benefit_type, ownership_percentage, status)
    VALUES (p_user_id, 'low_season_week', 50.00, 'available')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar Elite status después de cada venta
CREATE OR REPLACE FUNCTION trigger_check_elite_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar status Elite para todos los referidores en el árbol
  PERFORM check_and_grant_elite_status(rt.broker_id)
  FROM referral_tree rt
  WHERE rt.referred_user_id = (
    SELECT p.id FROM profiles p
    JOIN reservations r ON r.user_wallet = p.wallet_address
    WHERE r.id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en reservations
DROP TRIGGER IF EXISTS trigger_elite_status_check ON reservations;
CREATE TRIGGER trigger_elite_status_check
AFTER INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION trigger_check_elite_status();

-- Generar códigos de referido para TODOS los usuarios existentes
UPDATE profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Comentarios
COMMENT ON FUNCTION get_universal_commission_rate IS 'Comisiones universales para TODOS: 3% nivel 1, 2% nivel 2, 1% nivel 3';
COMMENT ON FUNCTION check_and_grant_elite_status IS 'Elite status: 24 semanas = 1 semana recompensa, 48 semanas = 2 semanas recompensa';
COMMENT ON COLUMN profiles.total_weeks_sold IS 'Total de semanas vendidas por referidos (para calcular Elite status)';
COMMENT ON COLUMN profiles.is_elite IS 'Elite status otorgado a las 24 semanas vendidas';
COMMENT ON COLUMN profiles.elite_weeks_earned IS 'Semanas de recompensa ganadas (1 a las 24, 2 a las 48)';
