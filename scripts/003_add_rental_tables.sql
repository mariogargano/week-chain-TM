-- Tabla para gestión de rentas de semanas
CREATE TABLE IF NOT EXISTS week_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES weeks(id),
  owner_wallet TEXT NOT NULL,
  rental_enabled BOOLEAN NOT NULL DEFAULT false,
  platform TEXT, -- airbnb, booking, direct
  listing_url TEXT,
  ical_url TEXT,
  sync_status TEXT DEFAULT 'pending', -- pending, synced, error
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla para ingresos de rentas
CREATE TABLE IF NOT EXISTS rental_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES week_rentals(id),
  week_id UUID NOT NULL REFERENCES weeks(id),
  owner_wallet TEXT NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  gross_income_usdc NUMERIC(20, 6) NOT NULL,
  platform_fee_usdc NUMERIC(20, 6) NOT NULL DEFAULT 0,
  management_fee_usdc NUMERIC(20, 6) NOT NULL DEFAULT 0,
  net_income_usdc NUMERIC(20, 6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla para sincronización con OTAs (Airbnb, Booking)
CREATE TABLE IF NOT EXISTS ota_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES week_rentals(id),
  platform TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- calendar, pricing, availability
  status TEXT NOT NULL, -- success, error
  error_message TEXT,
  synced_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_week_rentals_week ON week_rentals(week_id);
CREATE INDEX IF NOT EXISTS idx_week_rentals_owner ON week_rentals(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_rental_income_rental ON rental_income(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_income_owner ON rental_income(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_rental_income_status ON rental_income(status);

-- Comentarios
COMMENT ON TABLE week_rentals IS 'Configuración de rentas para NFT-Semanas';
COMMENT ON TABLE rental_income IS 'Ingresos generados por rentas de semanas';
COMMENT ON TABLE ota_sync_logs IS 'Logs de sincronización con plataformas OTA';
