-- Improved 120-hour Refund System
-- Supports both booking_id and voucher_id for flexibility
-- Complies with NOM-029-SE-2021 (Periodo de reflexión de 5 días)

-- Add booking_id column to cancellation_requests if it doesn't exist
ALTER TABLE cancellation_requests 
ADD COLUMN IF NOT EXISTS booking_id UUID;

-- Create index for booking_id
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_booking ON cancellation_requests(booking_id);

-- Improved function: Check if a booking/voucher is within 120-hour refund window
-- This version works with booking_id
CREATE OR REPLACE FUNCTION can_refund_120h(b_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE 
  v_created_at TIMESTAMPTZ;
  hours_elapsed NUMERIC;
BEGIN
  -- Try to find in bookings table first (if it exists)
  BEGIN
    SELECT created_at INTO v_created_at 
    FROM bookings 
    WHERE id = b_id;
  EXCEPTION WHEN undefined_table THEN
    -- If bookings table doesn't exist, try purchase_vouchers
    SELECT created_at INTO v_created_at 
    FROM purchase_vouchers 
    WHERE id = b_id;
  END;
  
  -- If no record found, return false
  IF v_created_at IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate hours elapsed
  hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600;
  
  -- Return true if within 120 hours (5 days)
  RETURN hours_elapsed <= 120;
END;
$$;

-- Overloaded function for voucher_id (maintains backward compatibility)
CREATE OR REPLACE FUNCTION can_refund_120h_voucher(p_voucher_id UUID)
RETURNS BOOLEAN 
LANGUAGE SQL
AS $$
  SELECT (NOW() - pv.created_at) <= INTERVAL '120 hours'
  FROM purchase_vouchers pv 
  WHERE pv.id = p_voucher_id;
$$;

-- Improved auto-approve function with better logic
CREATE OR REPLACE FUNCTION auto_approve_120h()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
  within_period BOOLEAN := FALSE;
BEGIN
  -- Check booking_id first if provided
  IF NEW.booking_id IS NOT NULL THEN
    within_period := can_refund_120h(NEW.booking_id);
  -- Otherwise check voucher_id
  ELSIF NEW.voucher_id IS NOT NULL THEN
    within_period := can_refund_120h_voucher(NEW.voucher_id);
  END IF;
  
  -- Auto-approve if within 120-hour reflection period
  IF within_period THEN
    NEW.status := 'approved';
    NEW.within_reflection_period := TRUE;
    NEW.processed_at := NOW();
    NEW.notes := COALESCE(NEW.notes, '') || ' [Auto-aprobado: dentro del periodo de reflexión de 120h según NOM-029-SE-2021]';
  ELSE
    NEW.within_reflection_period := FALSE;
    NEW.notes := COALESCE(NEW.notes, '') || ' [Requiere revisión manual: fuera del periodo de reflexión de 120h]';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS trg_auto_approve_refund ON cancellation_requests;
DROP TRIGGER IF EXISTS trg_auto_approve_120h ON cancellation_requests;

CREATE TRIGGER trg_auto_approve_120h
  BEFORE INSERT ON cancellation_requests
  FOR EACH ROW 
  EXECUTE FUNCTION auto_approve_120h();

-- Function to get refund eligibility details (useful for UI)
CREATE OR REPLACE FUNCTION get_refund_eligibility(p_id UUID, p_type TEXT DEFAULT 'voucher')
RETURNS TABLE(
  eligible BOOLEAN,
  hours_remaining NUMERIC,
  deadline TIMESTAMPTZ,
  reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_created_at TIMESTAMPTZ;
  v_hours_elapsed NUMERIC;
  v_hours_remaining NUMERIC;
BEGIN
  -- Get created_at based on type
  IF p_type = 'booking' THEN
    BEGIN
      SELECT created_at INTO v_created_at FROM bookings WHERE id = p_id;
    EXCEPTION WHEN undefined_table THEN
      SELECT created_at INTO v_created_at FROM purchase_vouchers WHERE id = p_id;
    END;
  ELSE
    SELECT created_at INTO v_created_at FROM purchase_vouchers WHERE id = p_id;
  END IF;
  
  IF v_created_at IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, NULL::TIMESTAMPTZ, 'Registro no encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate hours
  v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600;
  v_hours_remaining := GREATEST(0, 120 - v_hours_elapsed);
  
  -- Return eligibility details
  IF v_hours_elapsed <= 120 THEN
    RETURN QUERY SELECT 
      TRUE,
      v_hours_remaining,
      v_created_at + INTERVAL '120 hours',
      'Elegible para reembolso automático según NOM-029-SE-2021'::TEXT;
  ELSE
    RETURN QUERY SELECT 
      FALSE,
      0::NUMERIC,
      v_created_at + INTERVAL '120 hours',
      'Periodo de reflexión expirado. Requiere revisión manual.'::TEXT;
  END IF;
END;
$$;

-- Comments for documentation
COMMENT ON FUNCTION can_refund_120h IS 'Verifica si un booking/voucher está dentro del periodo de reflexión de 120 horas (5 días) según NOM-029-SE-2021. Soporta tanto booking_id como voucher_id.';
COMMENT ON FUNCTION can_refund_120h_voucher IS 'Versión específica para vouchers. Mantiene compatibilidad con código existente.';
COMMENT ON FUNCTION auto_approve_120h IS 'Auto-aprueba cancelaciones dentro del periodo de reflexión de 120h. Soporta tanto booking_id como voucher_id.';
COMMENT ON FUNCTION get_refund_eligibility IS 'Obtiene detalles de elegibilidad de reembolso incluyendo horas restantes y fecha límite. Útil para mostrar en UI.';

-- Create a view for easy monitoring of refund requests
CREATE OR REPLACE VIEW refund_requests_summary AS
SELECT 
  cr.id,
  cr.user_id,
  cr.voucher_id,
  cr.booking_id,
  cr.status,
  cr.within_reflection_period,
  cr.refund_amount,
  cr.requested_at,
  cr.processed_at,
  CASE 
    WHEN cr.voucher_id IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (NOW() - pv.created_at)) / 3600
    ELSE NULL
  END as hours_since_purchase,
  CASE 
    WHEN cr.voucher_id IS NOT NULL THEN 
      GREATEST(0, 120 - EXTRACT(EPOCH FROM (NOW() - pv.created_at)) / 3600)
    ELSE NULL
  END as hours_remaining,
  cr.reason,
  cr.notes
FROM cancellation_requests cr
LEFT JOIN purchase_vouchers pv ON cr.voucher_id = pv.id
ORDER BY cr.requested_at DESC;

COMMENT ON VIEW refund_requests_summary IS 'Vista consolidada de solicitudes de reembolso con cálculos de tiempo en tiempo real';
