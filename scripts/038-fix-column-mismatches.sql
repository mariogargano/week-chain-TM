-- Migration 038: Fix column mismatches between code and DB schema
-- Adds missing columns so existing code works without breaking existing data

-- 1. webhook_events: add 'processed' boolean + 'processed_at' timestamp + UNIQUE constraint
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS processed boolean DEFAULT false;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS processed_at timestamptz;

-- Add unique constraint on (source, event_id) for upsert idempotency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'webhook_events_source_event_id_key'
  ) THEN
    ALTER TABLE webhook_events ADD CONSTRAINT webhook_events_source_event_id_key UNIQUE (source, event_id);
  END IF;
END $$;

-- 2. user_certificates_v2: add 'provider_payment_id' for Conekta idempotency
ALTER TABLE user_certificates_v2 ADD COLUMN IF NOT EXISTS provider_payment_id text;

-- Add unique constraint for provider_payment_id upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_certificates_v2_provider_payment_id_key'
  ) THEN
    ALTER TABLE user_certificates_v2 ADD CONSTRAINT user_certificates_v2_provider_payment_id_key UNIQUE (provider_payment_id);
  END IF;
END $$;

-- 3. week_tokens: add 'certificate_id_str' alias column if not exists, 'qr_payload' already exists
-- The code writes to 'certificate_id' and 'qr_code' but table has 'certificate_id_str' and 'qr_payload'
-- We add the code-expected columns as aliases
ALTER TABLE week_tokens ADD COLUMN IF NOT EXISTS certificate_id text;
ALTER TABLE week_tokens ADD COLUMN IF NOT EXISTS qr_code text;
ALTER TABLE week_tokens ADD COLUMN IF NOT EXISTS metadata jsonb;

-- 4. certificate_visual_state: add the columns used by the code
-- Code uses: current_status, last_reservation_date, last_property_name, reservations_count
-- Table has: destination_name, destination_check_in, total_vacations_taken
ALTER TABLE certificate_visual_state ADD COLUMN IF NOT EXISTS current_status text DEFAULT 'active';
ALTER TABLE certificate_visual_state ADD COLUMN IF NOT EXISTS last_reservation_date timestamptz;
ALTER TABLE certificate_visual_state ADD COLUMN IF NOT EXISTS last_property_name text;
ALTER TABLE certificate_visual_state ADD COLUMN IF NOT EXISTS reservations_count integer DEFAULT 0;

-- 5. vouchers: add 'amount_paid' column (code writes amount_paid, table has 'amount')
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS amount_paid numeric;
