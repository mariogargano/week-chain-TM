-- =====================================================
-- WEEK-CHAIN: State Machines Complete Architecture
-- Based on Arquitectura de Workflows 360° REaaS
-- =====================================================

-- =====================================================
-- 1. ENUM TYPES FOR ALL STATE MACHINES
-- =====================================================

-- Lead/Holder Lifecycle States
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'lead',           -- Contacto inicial
    'prospecto',      -- Interesado, en nurturing
    'cliente',        -- Compro al menos 1 SVC
    'holder_activo',  -- Tiene SVC activos, en goce
    'holder_inactivo', -- SVC expirados, sin renovacion
    'renovacion',     -- En proceso de renovar
    'churned'         -- Perdido definitivamente
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- SVC Certificate Lifecycle States
DO $$ BEGIN
  CREATE TYPE svc_status AS ENUM (
    'draft',          -- Borrador, pre-pago
    'pending_payment', -- Esperando pago
    'issued',         -- Pagado, pendiente activacion
    'active',         -- Activo, en goce
    'suspended',      -- Suspendido por incumplimiento
    'expired',        -- Vencido naturalmente
    'cancelled',      -- Cancelado por usuario o admin
    'transferred'     -- Transferido a otro holder
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Request Lifecycle States (WEEK-BOOKING)
DO $$ BEGIN
  CREATE TYPE request_status AS ENUM (
    'received',       -- Solicitud recibida
    'validating',     -- Validando disponibilidad/holder
    'queued',         -- En cola de procesamiento
    'offer_sent',     -- Oferta(s) enviada(s)
    'offer_accepted', -- Oferta aceptada, pendiente confirmar
    'offer_rejected', -- Oferta rechazada por holder
    'offer_expired',  -- Oferta expiro (>24h)
    'confirmed',      -- Reserva confirmada
    'cancelled'       -- Solicitud cancelada
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Booking Lifecycle States
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending',        -- Pendiente de confirmacion final
    'confirmed',      -- Confirmada, esperando check-in
    'checked_in',     -- En curso, huesped en propiedad
    'checked_out',    -- Completada, huesped salio
    'post_stay',      -- Post-estancia (review, follow-up)
    'completed',      -- Ciclo completo
    'no_show',        -- No se presento
    'cancelled'       -- Cancelada
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Incident/Ticket Lifecycle States
DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM (
    'open',           -- Abierto
    'triage',         -- En evaluacion inicial
    'in_progress',    -- En proceso de resolucion
    'pending_user',   -- Esperando respuesta del usuario
    'pending_vendor', -- Esperando proveedor externo
    'resolved',       -- Resuelto
    'closed',         -- Cerrado definitivamente
    'reopened'        -- Reabierto
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Compliance Status
DO $$ BEGIN
  CREATE TYPE compliance_status AS ENUM (
    'pending',        -- Pendiente de validacion
    'validated',      -- Validado/Aprobado
    'alerted',        -- Con alertas menores
    'blocked',        -- Bloqueado por compliance
    'expired'         -- Documentacion expirada
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Incident Priority
DO $$ BEGIN
  CREATE TYPE incident_priority AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Incident Category
DO $$ BEGIN
  CREATE TYPE incident_category AS ENUM (
    'maintenance',    -- Problema de mantenimiento
    'cleaning',       -- Problema de limpieza
    'amenity',        -- Amenidad faltante/rota
    'access',         -- Problema de acceso
    'safety',         -- Problema de seguridad
    'noise',          -- Ruido/vecinos
    'billing',        -- Problema de facturacion
    'other'           -- Otro
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 2. STATE TRANSITION RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'lead', 'svc', 'request', 'booking', 'incident', 'compliance'
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  allowed_roles TEXT[] NOT NULL DEFAULT '{}', -- Roles that can perform this transition
  requires_approval BOOLEAN DEFAULT false,
  auto_trigger TEXT, -- Event that auto-triggers this transition
  validation_fn TEXT, -- PostgreSQL function to validate transition
  side_effects TEXT[], -- Actions to perform on transition
  sla_minutes INTEGER, -- SLA for this transition (if applicable)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_type, from_state, to_state)
);

-- =====================================================
-- 3. STATE HISTORY/AUDIT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS state_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  triggered_by UUID REFERENCES auth.users(id),
  trigger_type TEXT DEFAULT 'manual', -- 'manual', 'auto', 'system', 'webhook'
  trigger_event TEXT, -- Event that triggered the transition
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_state_history_entity ON state_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_state_history_created ON state_history(created_at DESC);

-- =====================================================
-- 4. SLA TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  sla_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  breached BOOLEAN DEFAULT false,
  breach_notified BOOLEAN DEFAULT false,
  current_state TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sla_tracking_deadline ON sla_tracking(deadline_at) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sla_tracking_entity ON sla_tracking(entity_type, entity_id);

-- =====================================================
-- 5. INCIDENTS TABLE (Complete)
-- =====================================================

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  booking_id UUID REFERENCES confirmed_reservations(id),
  property_id UUID REFERENCES properties(id),
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  status incident_status DEFAULT 'open',
  priority incident_priority DEFAULT 'medium',
  category incident_category DEFAULT 'other',
  title TEXT NOT NULL,
  description TEXT,
  resolution TEXT,
  resolution_time_minutes INTEGER,
  sla_deadline TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  escalation_level INTEGER DEFAULT 0,
  internal_notes TEXT,
  attachments TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_booking ON incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_incidents_property ON incidents(property_id);

-- =====================================================
-- 6. COMPLIANCE RECORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'user', 'property', 'contract', 'transaction'
  entity_id UUID NOT NULL,
  compliance_type TEXT NOT NULL, -- 'kyc', 'kyb', 'aml', 'profeco', 'nom151', 'lfpdppp'
  status compliance_status DEFAULT 'pending',
  validation_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  validator_id UUID REFERENCES auth.users(id),
  validation_notes TEXT,
  documents JSONB DEFAULT '[]', -- Array of document references
  alerts JSONB DEFAULT '[]', -- Array of alerts/warnings
  risk_score INTEGER DEFAULT 0, -- 0-100
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_entity ON compliance_records(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_records(status);
CREATE INDEX IF NOT EXISTS idx_compliance_expiry ON compliance_records(expiry_date) WHERE status = 'validated';

-- =====================================================
-- 7. WORKFLOW QUEUE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  current_step TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  priority INTEGER DEFAULT 50, -- 0-100, higher = more urgent
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  payload JSONB DEFAULT '{}',
  result JSONB,
  created_by UUID REFERENCES auth.users(id),
  processed_by TEXT, -- Worker/service that processed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_queue_pending ON workflow_queue(scheduled_at) 
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_workflow_queue_entity ON workflow_queue(entity_type, entity_id);

-- =====================================================
-- 8. POPULATE STATE TRANSITIONS
-- =====================================================

-- Lead/Holder Transitions
INSERT INTO state_transitions (entity_type, from_state, to_state, allowed_roles, auto_trigger, side_effects) VALUES
  ('lead', 'lead', 'prospecto', ARRAY['admin', 'sales', 'agent_mgr'], NULL, ARRAY['send_welcome_email']),
  ('lead', 'prospecto', 'cliente', ARRAY['admin', 'sales', 'system'], 'payment_completed', ARRAY['send_purchase_confirmation', 'create_holder_profile']),
  ('lead', 'cliente', 'holder_activo', ARRAY['admin', 'system'], 'svc_activated', ARRAY['enable_booking_access']),
  ('lead', 'holder_activo', 'renovacion', ARRAY['admin', 'system'], 'svc_expiring_soon', ARRAY['send_renewal_reminder']),
  ('lead', 'renovacion', 'holder_activo', ARRAY['admin', 'sales', 'system'], 'renewal_completed', ARRAY['extend_svc_validity']),
  ('lead', 'holder_activo', 'holder_inactivo', ARRAY['admin', 'system'], 'all_svc_expired', ARRAY['disable_booking_access', 'send_winback_campaign']),
  ('lead', 'holder_inactivo', 'churned', ARRAY['admin'], NULL, ARRAY['archive_profile'])
ON CONFLICT (entity_type, from_state, to_state) DO NOTHING;

-- SVC Certificate Transitions
INSERT INTO state_transitions (entity_type, from_state, to_state, allowed_roles, auto_trigger, sla_minutes, side_effects) VALUES
  ('svc', 'draft', 'pending_payment', ARRAY['admin', 'sales', 'user'], 'checkout_initiated', 30, ARRAY['reserve_week', 'create_payment_intent']),
  ('svc', 'pending_payment', 'issued', ARRAY['admin', 'system'], 'payment_confirmed', NULL, ARRAY['generate_certificate', 'create_week_token']),
  ('svc', 'pending_payment', 'draft', ARRAY['admin', 'system'], 'payment_failed', NULL, ARRAY['release_week_reservation']),
  ('svc', 'issued', 'active', ARRAY['admin', 'system'], 'holder_verified', NULL, ARRAY['enable_booking', 'send_activation_email']),
  ('svc', 'active', 'suspended', ARRAY['admin', 'compliance'], NULL, NULL, ARRAY['disable_booking', 'send_suspension_notice']),
  ('svc', 'suspended', 'active', ARRAY['admin', 'compliance'], 'compliance_resolved', NULL, ARRAY['enable_booking', 'send_reactivation_notice']),
  ('svc', 'active', 'expired', ARRAY['admin', 'system'], 'validity_ended', NULL, ARRAY['disable_booking', 'send_expiry_notice', 'trigger_renewal_flow']),
  ('svc', 'active', 'transferred', ARRAY['admin', 'legal'], 'transfer_completed', NULL, ARRAY['update_holder', 'generate_transfer_deed']),
  ('svc', 'active', 'cancelled', ARRAY['admin', 'legal'], NULL, NULL, ARRAY['process_refund', 'void_certificate'])
ON CONFLICT (entity_type, from_state, to_state) DO NOTHING;

-- Request Transitions (WEEK-BOOKING with SLAs)
INSERT INTO state_transitions (entity_type, from_state, to_state, allowed_roles, auto_trigger, sla_minutes, side_effects) VALUES
  ('request', 'received', 'validating', ARRAY['admin', 'ops', 'system'], 'request_created', 15, ARRAY['validate_holder_status', 'check_week_balance']),
  ('request', 'validating', 'queued', ARRAY['admin', 'ops', 'system'], 'validation_passed', 30, ARRAY['search_availability']),
  ('request', 'validating', 'cancelled', ARRAY['admin', 'ops', 'system'], 'validation_failed', NULL, ARRAY['send_rejection_notice']),
  ('request', 'queued', 'offer_sent', ARRAY['admin', 'ops', 'system'], 'offers_generated', 240, ARRAY['send_offer_email', 'start_offer_sla']),
  ('request', 'offer_sent', 'offer_accepted', ARRAY['admin', 'ops', 'user'], 'offer_selected', NULL, ARRAY['reserve_dates', 'create_booking']),
  ('request', 'offer_sent', 'offer_rejected', ARRAY['admin', 'ops', 'user'], 'all_offers_rejected', NULL, ARRAY['release_holds', 'trigger_retry']),
  ('request', 'offer_sent', 'offer_expired', ARRAY['admin', 'system'], 'offer_timeout_24h', NULL, ARRAY['release_holds', 'send_expiry_notice']),
  ('request', 'offer_accepted', 'confirmed', ARRAY['admin', 'ops', 'system'], 'booking_confirmed', 1440, ARRAY['send_confirmation', 'create_calendar_event']),
  ('request', 'offer_accepted', 'cancelled', ARRAY['admin', 'ops', 'user'], 'booking_cancelled', NULL, ARRAY['release_dates', 'refund_if_applicable'])
ON CONFLICT (entity_type, from_state, to_state) DO NOTHING;

-- Booking Transitions
INSERT INTO state_transitions (entity_type, from_state, to_state, allowed_roles, auto_trigger, side_effects) VALUES
  ('booking', 'pending', 'confirmed', ARRAY['admin', 'ops', 'system'], 'payment_confirmed', ARRAY['send_confirmation', 'notify_property']),
  ('booking', 'confirmed', 'checked_in', ARRAY['admin', 'ops', 'service'], 'guest_arrived', ARRAY['log_arrival', 'trigger_welcome_flow']),
  ('booking', 'checked_in', 'checked_out', ARRAY['admin', 'ops', 'service'], 'guest_departed', ARRAY['log_departure', 'trigger_checkout_inspection']),
  ('booking', 'checked_out', 'post_stay', ARRAY['admin', 'system'], 'checkout_complete', ARRAY['send_review_request', 'process_damages_if_any']),
  ('booking', 'post_stay', 'completed', ARRAY['admin', 'system'], 'post_stay_complete', ARRAY['archive_booking', 'update_holder_stats']),
  ('booking', 'confirmed', 'no_show', ARRAY['admin', 'ops'], 'no_show_confirmed', ARRAY['process_no_show_penalty', 'release_dates']),
  ('booking', 'confirmed', 'cancelled', ARRAY['admin', 'ops', 'user'], 'cancellation_requested', ARRAY['process_cancellation', 'apply_policy'])
ON CONFLICT (entity_type, from_state, to_state) DO NOTHING;

-- Incident Transitions
INSERT INTO state_transitions (entity_type, from_state, to_state, allowed_roles, auto_trigger, sla_minutes, side_effects) VALUES
  ('incident', 'open', 'triage', ARRAY['admin', 'ops', 'service'], 'incident_assigned', 30, ARRAY['assign_priority', 'calculate_sla']),
  ('incident', 'triage', 'in_progress', ARRAY['admin', 'ops', 'service'], 'work_started', NULL, ARRAY['notify_reporter']),
  ('incident', 'in_progress', 'pending_user', ARRAY['admin', 'ops', 'service'], 'info_requested', NULL, ARRAY['send_info_request']),
  ('incident', 'pending_user', 'in_progress', ARRAY['admin', 'ops', 'service', 'user'], 'info_provided', NULL, ARRAY['resume_work']),
  ('incident', 'in_progress', 'pending_vendor', ARRAY['admin', 'ops', 'service'], 'vendor_dispatched', NULL, ARRAY['create_vendor_ticket']),
  ('incident', 'pending_vendor', 'in_progress', ARRAY['admin', 'ops', 'service'], 'vendor_completed', NULL, ARRAY['log_vendor_resolution']),
  ('incident', 'in_progress', 'resolved', ARRAY['admin', 'ops', 'service'], 'resolution_applied', NULL, ARRAY['notify_reporter', 'log_resolution_time']),
  ('incident', 'resolved', 'closed', ARRAY['admin', 'ops', 'service', 'user'], 'resolution_accepted', NULL, ARRAY['archive_incident', 'update_metrics']),
  ('incident', 'resolved', 'reopened', ARRAY['admin', 'ops', 'service', 'user'], 'issue_persists', NULL, ARRAY['escalate_if_needed'])
ON CONFLICT (entity_type, from_state, to_state) DO NOTHING;

-- =====================================================
-- 9. STATE TRANSITION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION transition_state(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_to_state TEXT,
  p_triggered_by UUID DEFAULT NULL,
  p_trigger_type TEXT DEFAULT 'manual',
  p_trigger_event TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_current_state TEXT;
  v_transition RECORD;
  v_user_role TEXT;
  v_result JSONB;
BEGIN
  -- Get current state based on entity type
  CASE p_entity_type
    WHEN 'svc' THEN
      SELECT status::TEXT INTO v_current_state 
      FROM user_certificates_v2 WHERE id = p_entity_id;
    WHEN 'request' THEN
      SELECT status::TEXT INTO v_current_state 
      FROM reservation_requests WHERE id = p_entity_id;
    WHEN 'booking' THEN
      SELECT status::TEXT INTO v_current_state 
      FROM confirmed_reservations WHERE id = p_entity_id;
    WHEN 'incident' THEN
      SELECT status::TEXT INTO v_current_state 
      FROM incidents WHERE id = p_entity_id;
    WHEN 'lead' THEN
      SELECT lead_status::TEXT INTO v_current_state 
      FROM users WHERE id = p_entity_id;
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Unknown entity type');
  END CASE;

  IF v_current_state IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Entity not found');
  END IF;

  -- Check if transition is allowed
  SELECT * INTO v_transition
  FROM state_transitions
  WHERE entity_type = p_entity_type
    AND from_state = v_current_state
    AND to_state = p_to_state;

  IF v_transition IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Transition from %s to %s not allowed', v_current_state, p_to_state)
    );
  END IF;

  -- Check user role if triggered by user
  IF p_triggered_by IS NOT NULL THEN
    SELECT role INTO v_user_role FROM users WHERE id = p_triggered_by;
    IF NOT (v_user_role = ANY(v_transition.allowed_roles) OR 'system' = ANY(v_transition.allowed_roles)) THEN
      RETURN jsonb_build_object('success', false, 'error', 'User role not authorized for this transition');
    END IF;
  END IF;

  -- Perform the transition
  CASE p_entity_type
    WHEN 'svc' THEN
      UPDATE user_certificates_v2 SET status = p_to_state, updated_at = now() WHERE id = p_entity_id;
    WHEN 'request' THEN
      UPDATE reservation_requests SET status = p_to_state, updated_at = now() WHERE id = p_entity_id;
    WHEN 'booking' THEN
      UPDATE confirmed_reservations SET status = p_to_state, updated_at = now() WHERE id = p_entity_id;
    WHEN 'incident' THEN
      UPDATE incidents SET status = p_to_state::incident_status, updated_at = now() WHERE id = p_entity_id;
    WHEN 'lead' THEN
      UPDATE users SET lead_status = p_to_state::lead_status, updated_at = now() WHERE id = p_entity_id;
  END CASE;

  -- Record in history
  INSERT INTO state_history (
    entity_type, entity_id, from_state, to_state,
    triggered_by, trigger_type, trigger_event, notes, metadata
  ) VALUES (
    p_entity_type, p_entity_id, v_current_state, p_to_state,
    p_triggered_by, p_trigger_type, p_trigger_event, p_notes, p_metadata
  );

  -- Create SLA tracking if applicable
  IF v_transition.sla_minutes IS NOT NULL THEN
    INSERT INTO sla_tracking (
      entity_type, entity_id, sla_name, 
      deadline_at, current_state
    ) VALUES (
      p_entity_type, p_entity_id, 
      format('%s_%s_to_%s', p_entity_type, v_current_state, p_to_state),
      now() + (v_transition.sla_minutes || ' minutes')::INTERVAL,
      p_to_state
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'from_state', v_current_state,
    'to_state', p_to_state,
    'side_effects', v_transition.side_effects
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. SLA BREACH CHECK FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION check_sla_breaches() RETURNS INTEGER AS $$
DECLARE
  v_breach_count INTEGER := 0;
  v_sla RECORD;
BEGIN
  FOR v_sla IN 
    SELECT * FROM sla_tracking 
    WHERE completed_at IS NULL 
      AND breached = false 
      AND deadline_at < now()
  LOOP
    UPDATE sla_tracking 
    SET breached = true, updated_at = now()
    WHERE id = v_sla.id;
    
    -- Create alert for breach
    INSERT INTO system_alerts (
      alert_type, severity, entity_type, entity_id,
      title, message, metadata
    ) VALUES (
      'sla_breach', 'critical', v_sla.entity_type, v_sla.entity_id,
      format('SLA Breach: %s', v_sla.sla_name),
      format('SLA %s has been breached. Deadline was %s', v_sla.sla_name, v_sla.deadline_at),
      jsonb_build_object('sla_id', v_sla.id, 'sla_name', v_sla.sla_name)
    );
    
    v_breach_count := v_breach_count + 1;
  END LOOP;
  
  RETURN v_breach_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. SYSTEM ALERTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  message TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  auto_resolve BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON system_alerts(created_at DESC) 
  WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity) 
  WHERE resolved = false;

-- =====================================================
-- 12. ADD lead_status TO USERS TABLE
-- =====================================================

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS lead_status lead_status DEFAULT 'lead';
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- =====================================================
-- 13. RLS POLICIES FOR NEW TABLES
-- =====================================================

ALTER TABLE state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_transitions ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin full access state_history" ON state_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admin full access sla_tracking" ON sla_tracking FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admin full access incidents" ON incidents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'ops', 'service')));

CREATE POLICY "Admin full access compliance_records" ON compliance_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'compliance', 'legal')));

CREATE POLICY "Admin full access workflow_queue" ON workflow_queue FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admin full access system_alerts" ON system_alerts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'ops')));

CREATE POLICY "Read state_transitions" ON state_transitions FOR SELECT TO authenticated USING (true);

-- User can see their own incidents
CREATE POLICY "Users view own incidents" ON incidents FOR SELECT TO authenticated
  USING (reported_by = auth.uid());

-- Service role bypass
ALTER TABLE state_history FORCE ROW LEVEL SECURITY;
ALTER TABLE sla_tracking FORCE ROW LEVEL SECURITY;
ALTER TABLE incidents FORCE ROW LEVEL SECURITY;
ALTER TABLE compliance_records FORCE ROW LEVEL SECURITY;
ALTER TABLE workflow_queue FORCE ROW LEVEL SECURITY;
ALTER TABLE system_alerts FORCE ROW LEVEL SECURITY;

-- Grant to service_role
GRANT ALL ON state_history TO service_role;
GRANT ALL ON sla_tracking TO service_role;
GRANT ALL ON incidents TO service_role;
GRANT ALL ON compliance_records TO service_role;
GRANT ALL ON workflow_queue TO service_role;
GRANT ALL ON system_alerts TO service_role;
GRANT ALL ON state_transitions TO service_role;

-- =====================================================
-- 14. TICKET NUMBER SEQUENCE
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS incident_ticket_seq START 1000;

CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TEXT AS $$
BEGIN
  RETURN 'INC-' || TO_CHAR(now(), 'YYYYMM') || '-' || LPAD(nextval('incident_ticket_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_incident_ticket_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incident_ticket_number ON incidents;
CREATE TRIGGER trg_incident_ticket_number
  BEFORE INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION set_incident_ticket_number();
