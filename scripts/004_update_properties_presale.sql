-- Actualizar tabla properties para tracking de preventa
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS presale_target INTEGER DEFAULT 48,
ADD COLUMN IF NOT EXISTS presale_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS presale_progress NUMERIC(5, 2) GENERATED ALWAYS AS (
  CASE 
    WHEN presale_target > 0 THEN (presale_sold::NUMERIC / presale_target::NUMERIC * 100)
    ELSE 0
  END
) STORED,
ADD COLUMN IF NOT EXISTS presale_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS presale_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS escrow_address TEXT,
ADD COLUMN IF NOT EXISTS total_escrow_usdc NUMERIC(20, 6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS property_duration_years INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS exit_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS exit_status TEXT DEFAULT 'active'; -- active, pending_sale, sold, distributed

-- Actualizar tabla weeks para mejor tracking
ALTER TABLE weeks
ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES reservations(id),
ADD COLUMN IF NOT EXISTS rental_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_used_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Actualizar tabla reservations para tracking de preventa
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS week_tokens_amount NUMERIC(20, 6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdc_equivalent NUMERIC(20, 6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS presale_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_completed_at TIMESTAMP WITH TIME ZONE;

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_properties_presale_status ON properties(estado, presale_progress);
CREATE INDEX IF NOT EXISTS idx_properties_exit_status ON properties(exit_status);
CREATE INDEX IF NOT EXISTS idx_weeks_rental_enabled ON weeks(rental_enabled);
CREATE INDEX IF NOT EXISTS idx_reservations_presale_confirmed ON reservations(presale_confirmed);

-- Comentarios
COMMENT ON COLUMN properties.presale_target IS 'Objetivo de semanas a vender (default: 48)';
COMMENT ON COLUMN properties.presale_sold IS 'Número de semanas vendidas en preventa';
COMMENT ON COLUMN properties.presale_progress IS 'Porcentaje de progreso de preventa (calculado)';
COMMENT ON COLUMN properties.property_duration_years IS 'Duración de la propiedad en años (default: 15)';
COMMENT ON COLUMN properties.exit_date IS 'Fecha de venta final del activo';
COMMENT ON COLUMN properties.exit_status IS 'Estado del proceso de salida/venta final';
