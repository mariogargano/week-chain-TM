-- Migration 060: Sistema de Notarios para Propiedades
-- Crea tabla de notarios y vincula con propiedades

-- Tabla de notarios/corredurías
CREATE TABLE IF NOT EXISTS notaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL, -- Ej: "Corredor Público No. 13"
  location TEXT NOT NULL,
  photo_url TEXT,
  license_number TEXT,
  specialty TEXT, -- Ej: "Bienes Raíces Vacacionales"
  phone TEXT,
  email TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna de notario a propiedades
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS notary_id UUID REFERENCES notaries(id);

-- Insertar notarios iniciales
INSERT INTO notaries (id, name, title, location, photo_url, license_number, specialty, verified)
VALUES 
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Lic. Roberto Fernández Castillo',
    'Corredor Público No. 13',
    'Playa del Carmen, Quintana Roo',
    '/images/notaries/correduria-13.jpg',
    'CRPQR-013-2015',
    'Bienes Raíces Vacacionales y Fideicomisos',
    true
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Lic. María Elena Gutiérrez Ramos',
    'Notaría Pública No. 45',
    'Tulum, Quintana Roo',
    '/images/notaries/notaria-45.jpg',
    'NPQR-045-2018',
    'Derecho Inmobiliario y Turístico',
    true
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Lic. Carlos Mendoza Villanueva',
    'Corredor Público No. 8',
    'Cancún, Quintana Roo',
    '/images/notaries/correduria-8.jpg',
    'CRPQR-008-2012',
    'Tiempo Compartido y Derechos de Uso',
    true
  )
ON CONFLICT DO NOTHING;

-- Actualizar propiedades existentes con notario de Playa del Carmen
UPDATE properties 
SET notary_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
WHERE location ILIKE '%playa del carmen%' OR location ILIKE '%riviera maya%';

-- Actualizar propiedades de Tulum
UPDATE properties 
SET notary_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
WHERE location ILIKE '%tulum%';

-- Actualizar propiedades de Cancún
UPDATE properties 
SET notary_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012'
WHERE location ILIKE '%cancun%' OR location ILIKE '%cancún%';

-- Crear tabla de registro público de ventas
CREATE TABLE IF NOT EXISTS public_sales_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id),
  property_id UUID REFERENCES properties(id),
  week_id UUID REFERENCES weeks(id),
  property_name TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  season TEXT,
  sale_amount_usd NUMERIC(12,2) NOT NULL,
  buyer_initials TEXT NOT NULL, -- Ej: "J.M.G."
  buyer_country TEXT,
  broker_initials TEXT, -- Si hubo broker
  notary_name TEXT,
  certificate_hash TEXT, -- Hash del certificado para verificación
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT true,
  public_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_public_sales_log_date ON public_sales_log(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_public_sales_log_property ON public_sales_log(property_id);
CREATE INDEX IF NOT EXISTS idx_public_sales_log_visible ON public_sales_log(public_visible) WHERE public_visible = true;

-- Función para registrar venta automáticamente
CREATE OR REPLACE FUNCTION log_public_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_property_name TEXT;
  v_week_number INTEGER;
  v_season TEXT;
  v_buyer_name TEXT;
  v_buyer_country TEXT;
  v_notary_name TEXT;
  v_buyer_initials TEXT;
BEGIN
  -- Solo registrar cuando la reservación se confirma
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Obtener datos de la propiedad
    SELECT p.name, n.name INTO v_property_name, v_notary_name
    FROM properties p
    LEFT JOIN notaries n ON p.notary_id = n.id
    WHERE p.id = NEW.property_id;
    
    -- Obtener datos de la semana
    SELECT week_number, season INTO v_week_number, v_season
    FROM weeks WHERE id = NEW.week_id;
    
    -- Obtener datos del comprador (de forma anónima)
    SELECT 
      COALESCE(pr.display_name, u.full_name, 'Usuario'),
      COALESCE(pr.location, 'México')
    INTO v_buyer_name, v_buyer_country
    FROM profiles pr
    LEFT JOIN users u ON pr.id = u.id
    WHERE pr.id::text = NEW.user_wallet OR u.wallet_address = NEW.user_wallet;
    
    -- Generar iniciales
    v_buyer_initials := CASE 
      WHEN v_buyer_name IS NOT NULL THEN
        regexp_replace(
          array_to_string(
            array_agg(substring(word from 1 for 1)),
            '.'
          ),
          '\s+', '', 'g'
        ) || '.'
      ELSE 'A.N.'
    END;
    
    -- Simplificar iniciales
    v_buyer_initials := UPPER(LEFT(SPLIT_PART(COALESCE(v_buyer_name, 'Anónimo'), ' ', 1), 1)) || '.' ||
                        UPPER(LEFT(SPLIT_PART(COALESCE(v_buyer_name, 'Anónimo'), ' ', 2), 1)) || '.';
    
    -- Insertar en el log público
    INSERT INTO public_sales_log (
      reservation_id,
      property_id,
      week_id,
      property_name,
      week_number,
      season,
      sale_amount_usd,
      buyer_initials,
      buyer_country,
      notary_name,
      certificate_hash,
      sale_date
    ) VALUES (
      NEW.id,
      NEW.property_id,
      NEW.week_id,
      COALESCE(v_property_name, 'Propiedad'),
      COALESCE(v_week_number, 0),
      v_season,
      COALESCE(NEW.usdc_equivalent, 0),
      v_buyer_initials,
      v_buyer_country,
      v_notary_name,
      encode(sha256(NEW.id::text::bytea), 'hex')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar ventas automáticamente
DROP TRIGGER IF EXISTS trigger_log_public_sale ON reservations;
CREATE TRIGGER trigger_log_public_sale
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION log_public_sale();

-- Insertar datos demo en el log de ventas
INSERT INTO public_sales_log (property_name, week_number, season, sale_amount_usd, buyer_initials, buyer_country, notary_name, certificate_hash, sale_date)
VALUES 
  ('POLO 54 PH 501', 12, 'high', 9500, 'J.M.G.', 'México', 'Lic. Roberto Fernández Castillo - Corredor Público No. 13', 'a1b2c3d4e5f6', NOW() - INTERVAL '2 days'),
  ('POLO 54 PH 501', 51, 'high', 9500, 'R.L.P.', 'Estados Unidos', 'Lic. Roberto Fernández Castillo - Corredor Público No. 13', 'b2c3d4e5f6a7', NOW() - INTERVAL '5 days'),
  ('AFLORA Tulum', 8, 'high', 7250, 'M.S.R.', 'Canadá', 'Lic. María Elena Gutiérrez Ramos - Notaría Pública No. 45', 'c3d4e5f6a7b8', NOW() - INTERVAL '7 days'),
  ('POLO 54 PH 501', 28, 'medium', 7000, 'A.C.V.', 'México', 'Lic. Roberto Fernández Castillo - Corredor Público No. 13', 'd4e5f6a7b8c9', NOW() - INTERVAL '10 days'),
  ('AFLORA Tulum', 35, 'medium', 5500, 'L.F.M.', 'España', 'Lic. María Elena Gutiérrez Ramos - Notaría Pública No. 45', 'e5f6a7b8c9d0', NOW() - INTERVAL '12 days'),
  ('POLO 54 PH 501', 45, 'low', 4143, 'P.G.H.', 'México', 'Lic. Roberto Fernández Castillo - Corredor Público No. 13', 'f6a7b8c9d0e1', NOW() - INTERVAL '15 days'),
  ('AFLORA Tulum', 22, 'low', 3500, 'D.R.S.', 'Argentina', 'Lic. María Elena Gutiérrez Ramos - Notaría Pública No. 45', 'a7b8c9d0e1f2', NOW() - INTERVAL '18 days'),
  ('POLO 54 PH 501', 3, 'high', 9500, 'C.M.L.', 'Italia', 'Lic. Roberto Fernández Castillo - Corredor Público No. 13', 'b8c9d0e1f2a3', NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- RLS para el log público (solo lectura para todos)
ALTER TABLE public_sales_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public sales"
  ON public_sales_log FOR SELECT
  USING (public_visible = true);

CREATE POLICY "Admins can manage sales log"
  ON public_sales_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

COMMENT ON TABLE notaries IS 'Notarios y corredores públicos verificados para las propiedades';
COMMENT ON TABLE public_sales_log IS 'Registro público de ventas para transparencia';
