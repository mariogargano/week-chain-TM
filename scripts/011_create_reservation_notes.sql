-- Crear tabla para notas de gestión de reservas
CREATE TABLE IF NOT EXISTS reservation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reservation_notes_reservation_id ON reservation_notes(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_notes_created_at ON reservation_notes(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_reservation_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reservation_notes_updated_at
  BEFORE UPDATE ON reservation_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_notes_updated_at();

-- Comentarios
COMMENT ON TABLE reservation_notes IS 'Notas de gestión para reservas de holders';
COMMENT ON COLUMN reservation_notes.created_by IS 'Wallet address del usuario que creó la nota (management team)';
