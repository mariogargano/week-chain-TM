-- Sistema de precios por temporada para semanas tokenizadas

-- Tabla de temporadas (seasons)
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_it TEXT NOT NULL,
  multiplier NUMERIC(4, 2) NOT NULL, -- 0.60 a 2.00 (60% a 200%)
  color TEXT NOT NULL, -- Color para UI
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar temporadas predefinidas
INSERT INTO seasons (name, name_es, name_pt, name_fr, name_it, multiplier, color, description) VALUES
('Ultra High Season', 'Temporada Ultra Alta', 'Temporada Ultra Alta', 'Très Haute Saison', 'Stagione Ultra Alta', 2.00, '#ef4444', 'Christmas, New Year, Peak holidays'),
('High Season', 'Temporada Alta', 'Temporada Alta', 'Haute Saison', 'Alta Stagione', 1.50, '#f97316', 'Summer, Easter, Major holidays'),
('Mid Season', 'Temporada Media', 'Temporada Média', 'Moyenne Saison', 'Media Stagione', 1.00, '#3b82f6', 'Spring, Fall, Regular periods'),
('Low Season', 'Temporada Baja', 'Temporada Baixa', 'Basse Saison', 'Bassa Stagione', 0.70, '#10b981', 'Off-peak periods, Weekdays');

-- Tabla de asignación de semanas a temporadas
CREATE TABLE IF NOT EXISTS week_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 52),
  season_id UUID NOT NULL REFERENCES seasons(id),
  base_price_usd NUMERIC(20, 2) NOT NULL,
  final_price_usd NUMERIC(20, 2) NOT NULL, -- base_price * multiplier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, week_number)
);

-- Tabla de configuración de precios por propiedad
CREATE TABLE IF NOT EXISTS property_pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  total_value_usd NUMERIC(20, 2) NOT NULL,
  base_price_per_week NUMERIC(20, 2) NOT NULL, -- total_value / 52
  pricing_strategy TEXT NOT NULL DEFAULT 'seasonal', -- 'seasonal' o 'fixed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_week_seasons_property ON week_seasons(property_id);
CREATE INDEX IF NOT EXISTS idx_week_seasons_season ON week_seasons(season_id);
CREATE INDEX IF NOT EXISTS idx_week_seasons_week_number ON week_seasons(week_number);

-- Función para calcular precio final con temporada
CREATE OR REPLACE FUNCTION calculate_week_price(
  p_base_price NUMERIC,
  p_multiplier NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(p_base_price * p_multiplier, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comentarios para documentación
COMMENT ON TABLE seasons IS 'Definición de temporadas con multiplicadores de precio';
COMMENT ON TABLE week_seasons IS 'Asignación de semanas a temporadas por propiedad';
COMMENT ON TABLE property_pricing_config IS 'Configuración de estrategia de precios por propiedad';
