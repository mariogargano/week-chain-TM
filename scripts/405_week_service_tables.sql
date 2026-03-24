-- Pre-stay reminders tracking
CREATE TABLE IF NOT EXISTS public.pre_stay_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES confirmed_reservations(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('T-7', 'T-2', 'T-1', 'T-24h', 'T-6h', 'T-1h')),
  scheduled_at timestamp with time zone NOT NULL,
  sent_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retry_count int DEFAULT 0,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_pre_stay_reminders_status ON pre_stay_reminders(status);
CREATE INDEX idx_pre_stay_reminders_scheduled ON pre_stay_reminders(scheduled_at);
CREATE INDEX idx_pre_stay_reminders_booking ON pre_stay_reminders(booking_id);

-- Stay checklists
CREATE TABLE IF NOT EXISTS public.stay_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES confirmed_reservations(id) ON DELETE CASCADE,
  checklist_items jsonb NOT NULL DEFAULT '[]',
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_stay_checklists_booking ON stay_checklists(booking_id);

-- Queued notifications (email, SMS, push, WhatsApp)
CREATE TABLE IF NOT EXISTS public.queued_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text,
  recipient_phone text,
  recipient_user_id uuid,
  notification_type text NOT NULL,
  subject text,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  retry_count int DEFAULT 0,
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_queued_notifications_status ON queued_notifications(status);
CREATE INDEX idx_queued_notifications_type ON queued_notifications(notification_type);
CREATE INDEX idx_queued_notifications_created ON queued_notifications(created_at DESC);
CREATE INDEX idx_queued_notifications_recipient_email ON queued_notifications(recipient_email);

-- Post-stay activities (viewed by guest after check-out)
CREATE TABLE IF NOT EXISTS public.post_stay_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES confirmed_reservations(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('review_requested', 'review_submitted', 'issue_reported', 'support_contacted')),
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_post_stay_activities_booking ON post_stay_activities(booking_id);
CREATE INDEX idx_post_stay_activities_type ON post_stay_activities(activity_type);

-- RLS Policies
ALTER TABLE pre_stay_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stay_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE queued_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_stay_activities ENABLE ROW LEVEL SECURITY;

-- Allow guests to view their own pre-stay info and checklists
CREATE POLICY "Guests can view their own pre-stay reminders"
  ON pre_stay_reminders FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM confirmed_reservations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can view their own checklists"
  ON stay_checklists FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM confirmed_reservations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can update their own checklists"
  ON stay_checklists FOR UPDATE
  USING (
    booking_id IN (
      SELECT id FROM confirmed_reservations 
      WHERE user_id = auth.uid()
    )
  );

-- Admin can manage all
CREATE POLICY "Admins manage all pre-stay reminders"
  ON pre_stay_reminders FOR ALL
  USING (is_admin());

CREATE POLICY "Admins manage all checklists"
  ON stay_checklists FOR ALL
  USING (is_admin());

CREATE POLICY "Admins manage all notifications"
  ON queued_notifications FOR ALL
  USING (is_admin());

-- Trigger to create pre-stay reminders when booking is confirmed
CREATE OR REPLACE FUNCTION create_pre_stay_reminders_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Schedule reminders will be created by application logic
    INSERT INTO audit_log_immutable (user_id, action, metadata)
    VALUES (NEW.user_id, 'booking_confirmed_reminders_queued', jsonb_build_object('booking_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_pre_stay_reminders ON confirmed_reservations;
CREATE TRIGGER trigger_create_pre_stay_reminders
  AFTER UPDATE ON confirmed_reservations
  FOR EACH ROW
  EXECUTE FUNCTION create_pre_stay_reminders_on_booking();

-- Trigger to create checklists for new bookings
CREATE OR REPLACE FUNCTION create_checklist_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO stay_checklists (booking_id, checklist_items)
    VALUES (NEW.id, jsonb_build_array(
      jsonb_build_object('name', 'Identificación válida lista', 'completed', false, 'category', 'documentation'),
      jsonb_build_object('name', 'Confirmación de reserva descargada', 'completed', false, 'category', 'documentation'),
      jsonb_build_object('name', 'Pago completado', 'completed', false, 'category', 'payment'),
      jsonb_build_object('name', 'Revisar instrucciones de acceso', 'completed', false, 'category', 'setup'),
      jsonb_build_object('name', 'Descargar app WEEK-CHAIN', 'completed', false, 'category', 'setup'),
      jsonb_build_object('name', 'Revisar protocolos de seguridad', 'completed', false, 'category', 'safety'),
      jsonb_build_object('name', 'Contacto de emergencia registrado', 'completed', false, 'category', 'safety'),
      jsonb_build_object('name', 'Comunicarse con el anfitrión si es necesario', 'completed', false, 'category', 'communication')
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_checklist ON confirmed_reservations;
CREATE TRIGGER trigger_create_checklist
  AFTER UPDATE ON confirmed_reservations
  FOR EACH ROW
  EXECUTE FUNCTION create_checklist_on_booking();

GRANT ALL ON pre_stay_reminders TO authenticated;
GRANT ALL ON stay_checklists TO authenticated;
GRANT SELECT ON queued_notifications TO authenticated;
GRANT ALL ON post_stay_activities TO authenticated;
