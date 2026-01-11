-- Sistema completo de WEEK Management para Simonetta Brun
-- Permite gestionar NFTs bajo management y sus reservas

-- Tabla para tracking de NFTs bajo management
CREATE TABLE IF NOT EXISTS nft_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_wallet TEXT NOT NULL,
  management_enabled BOOLEAN DEFAULT false,
  management_started_at TIMESTAMP WITH TIME ZONE,
  management_ended_at TIMESTAMP WITH TIME ZONE,
  management_fee_percentage NUMERIC(5, 2) DEFAULT 15.00, -- 15% fee por defecto
  auto_accept_bookings BOOLEAN DEFAULT true,
  min_stay_nights INTEGER DEFAULT 3,
  max_stay_nights INTEGER DEFAULT 14,
  pricing_strategy TEXT DEFAULT 'dynamic', -- 'fixed', 'dynamic', 'seasonal'
  base_price_per_night NUMERIC(10, 2),
  cleaning_fee NUMERIC(10, 2) DEFAULT 50.00,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para servicios de management
CREATE TABLE IF NOT EXISTS management_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_management_id UUID NOT NULL REFERENCES nft_management(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'cleaning', 'maintenance', 'concierge', 'inspection'
  service_date TIMESTAMP WITH TIME ZONE NOT NULL,
  service_provider TEXT,
  cost_usdc NUMERIC(10, 2),
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  notes TEXT,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para comunicación con propietarios
CREATE TABLE IF NOT EXISTS management_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_management_id UUID NOT NULL REFERENCES nft_management(id) ON DELETE CASCADE,
  owner_wallet TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'booking_notification', 'maintenance_update', 'payment_notification', 'general'
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Tabla para calendario de disponibilidad
CREATE TABLE IF NOT EXISTS management_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_management_id UUID NOT NULL REFERENCES nft_management(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN DEFAULT true,
  price_per_night NUMERIC(10, 2),
  min_stay INTEGER DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nft_management_id, date)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_nft_management_week ON nft_management(week_id);
CREATE INDEX IF NOT EXISTS idx_nft_management_owner ON nft_management(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_nft_management_enabled ON nft_management(management_enabled);
CREATE INDEX IF NOT EXISTS idx_management_services_date ON management_services(service_date);
CREATE INDEX IF NOT EXISTS idx_management_availability_date ON management_availability(date);

-- Función para calcular ingresos de management
CREATE OR REPLACE FUNCTION calculate_management_revenue(
  p_nft_management_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_revenue NUMERIC,
  management_fee NUMERIC,
  owner_payout NUMERIC,
  booking_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ri.gross_income_usdc), 0) as total_revenue,
    COALESCE(SUM(ri.management_fee_usdc), 0) as management_fee,
    COALESCE(SUM(ri.net_income_usdc), 0) as owner_payout,
    COUNT(*)::INTEGER as booking_count
  FROM rental_income ri
  JOIN nft_management nm ON ri.week_id = nm.week_id
  WHERE nm.id = p_nft_management_id
    AND ri.booking_date BETWEEN p_start_date AND p_end_date
    AND ri.status = 'paid';
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE nft_management IS 'NFTs bajo gestión de WEEK Management';
COMMENT ON TABLE management_services IS 'Servicios realizados por WEEK Management';
COMMENT ON TABLE management_communications IS 'Comunicaciones entre WEEK Management y propietarios';
COMMENT ON TABLE management_availability IS 'Calendario de disponibilidad para NFTs bajo management';
