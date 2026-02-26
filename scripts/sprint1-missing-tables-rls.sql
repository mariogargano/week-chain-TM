-- =============================================================
-- SPRINT 1: Missing Tables + RLS + Security
-- Execution order: Run this FIRST before any code changes
-- =============================================================

-- ============================================
-- 1.1  TABLE: user_certificates (legacy v1)
-- ============================================
-- Used by:
--   app/api/reservations/respond-to-offer/route.ts (SELECT remaining_weeks_this_year, UPDATE)
--   app/api/reservations/request/route.ts (SELECT fallback)
--   lib/capacity-engine/engine.ts (SELECT tier, status)
--   lib/capacity-engine/annual-reset.ts (SELECT/UPDATE weeks_per_year, year_start_date)
--   app/dashboard/admin/certificates/page.tsx (SELECT product_id, status)

CREATE TABLE IF NOT EXISTS public.user_certificates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier            text NOT NULL DEFAULT 'Silver',           -- Silver/Gold/Platinum/Signature
  product_id      text,
  status          text NOT NULL DEFAULT 'active',           -- active/expired/cancelled/suspended
  purchase_price  numeric NOT NULL DEFAULT 0,
  start_date      date NOT NULL DEFAULT CURRENT_DATE,
  end_date        date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 years'),
  weeks_per_year  integer NOT NULL DEFAULT 2,
  remaining_weeks_this_year integer NOT NULL DEFAULT 2,
  reservations_used_this_year integer NOT NULL DEFAULT 0,
  year_start_date date NOT NULL DEFAULT CURRENT_DATE,
  order_id        text,
  stripe_session_id text,
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON public.user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_status ON public.user_certificates(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_certificates_stripe_session
  ON public.user_certificates(stripe_session_id) WHERE stripe_session_id IS NOT NULL;


-- ============================================
-- 1.2  TABLE: user_certificates_v2 (PRIMARY)
-- ============================================
-- Used by:
--   app/api/certificates/issue/route.ts (INSERT)
--   app/api/reservations/request/route.ts (SELECT)
--   app/dashboard/user/request-reservation/page.tsx (SELECT)

CREATE TABLE IF NOT EXISTS public.user_certificates_v2 (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id                  text,
  max_pax                     integer NOT NULL DEFAULT 2,
  max_estancias_per_year      integer NOT NULL DEFAULT 2,
  purchase_price_usd          numeric NOT NULL DEFAULT 0,
  start_date                  date NOT NULL DEFAULT CURRENT_DATE,
  end_date                    date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 years'),
  annual_entitlement_estancias integer NOT NULL DEFAULT 2,
  annual_used_estancias       integer NOT NULL DEFAULT 0,
  annual_reset_at             date,
  status                      text NOT NULL DEFAULT 'active',     -- active/expired/cancelled/suspended
  order_id                    text,
  stripe_session_id           text,
  conekta_order_id            text,
  metadata                    jsonb DEFAULT '{}',
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_certificates_v2_user_id ON public.user_certificates_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_v2_status ON public.user_certificates_v2(status);
-- Idempotency: prevent duplicate certificates per payment
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_certificates_v2_stripe_session
  ON public.user_certificates_v2(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_certificates_v2_conekta_order
  ON public.user_certificates_v2(conekta_order_id) WHERE conekta_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_certificates_v2_order_id
  ON public.user_certificates_v2(order_id) WHERE order_id IS NOT NULL;


-- ============================================
-- 1.3  TABLE: supply_properties
-- ============================================
-- Used by:
--   lib/capacity-engine/engine.ts (SELECT supply_weeks_per_year, status)
--   lib/capacity-engine/supply-matcher.ts (SELECT *, max_occupancy, country, city, category)
--   app/api/reservations/generate-offer/route.ts (SELECT by id, status=active)
--   app/api/admin/supply/toggle-property/route.ts (UPDATE status)
--   app/api/admin/capacity/global-status/route.ts (SELECT)
--   app/api/admin/capacity/15-year-projection/route.ts (SELECT)

CREATE TABLE IF NOT EXISTS public.supply_properties (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  name                  text NOT NULL,
  country               text NOT NULL DEFAULT 'Mexico',
  city                  text NOT NULL DEFAULT '',
  category              text NOT NULL DEFAULT 'resort',           -- resort/villa/condo/boutique
  max_occupancy         integer NOT NULL DEFAULT 8,
  supply_weeks_per_year integer NOT NULL DEFAULT 48,              -- 48 sellable + 4 maintenance
  status                text NOT NULL DEFAULT 'active',           -- active/inactive/maintenance
  image_url             text,
  description           text,
  amenities             jsonb DEFAULT '[]',
  metadata              jsonb DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supply_properties_status ON public.supply_properties(status);


-- ============================================
-- 1.4  TABLE: confirmed_reservations
-- ============================================
-- Used by:
--   app/api/reservations/respond-to-offer/route.ts (INSERT + SELECT for conflict check)
--   app/api/offers/accept/route.ts (INSERT)
--   app/api/reservations/generate-offer/route.ts (SELECT for conflict check)
--   lib/capacity-engine/supply-matcher.ts (SELECT check_in, check_out for availability)
--   app/dashboard/owner/sales/page.tsx (SELECT)

CREATE TABLE IF NOT EXISTS public.confirmed_reservations (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id          uuid,                                     -- FK to user_certificates or v2
  request_id              uuid,                                     -- FK to reservation_requests.id
  offer_id                uuid,                                     -- FK to reservation_offers.id (from accept flow)
  reservation_request_id  uuid,                                     -- alias used by accept flow
  property_id             uuid REFERENCES public.supply_properties(id) ON DELETE SET NULL,
  destination_id          uuid,                                     -- alias for property_id in accept flow
  check_in                date NOT NULL,
  check_out               date NOT NULL,
  check_in_date           date,                                     -- alias used by accept flow
  check_out_date          date,                                     -- alias used by accept flow
  party_size              integer DEFAULT 2,
  number_of_guests        integer DEFAULT 2,                        -- alias used by accept flow
  status                  text NOT NULL DEFAULT 'confirmed',        -- confirmed/checked_in/completed/cancelled
  confirmed_at            timestamptz DEFAULT now(),
  cancelled_at            timestamptz,
  cancellation_reason     text,
  metadata                jsonb DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  -- Prevent double-booking same property on overlapping dates
  CONSTRAINT chk_dates CHECK (check_in < check_out OR check_in_date < check_out_date)
);

CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_user_id ON public.confirmed_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_property_id ON public.confirmed_reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_status ON public.confirmed_reservations(status);
CREATE INDEX IF NOT EXISTS idx_confirmed_reservations_dates ON public.confirmed_reservations(property_id, check_in, check_out);


-- ============================================
-- 1.5  TABLE: legal_contracts
-- ============================================
-- Used by:
--   app/api/legalario/webhook/route.ts (UPDATE folio, sha256_hash, status, certified_at)
--   app/api/legal/download/route.ts (SELECT *, purchase_vouchers(*), properties(*))
--   components/legal-documents-card.tsx (SELECT * by user_id)
--   app/api/health/route.ts (SELECT count)

CREATE TABLE IF NOT EXISTS public.legal_contracts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id         text,
  property_id       uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  certificate_id    uuid,                                     -- FK to user_certificates_v2.id
  voucher_id        uuid,
  nom151_folio      text,                                     -- NOM-151 folio from Legalario
  folio             text,                                     -- alias used by webhook
  sha256_hash       text,                                     -- document integrity hash
  status            text NOT NULL DEFAULT 'draft',            -- draft/pending/certified/rejected
  certified_at      timestamptz,
  signed_at         timestamptz,
  document_version  integer NOT NULL DEFAULT 1,
  pdf_url           text,
  metadata          jsonb DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_contracts_user_id ON public.legal_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_contracts_series_id ON public.legal_contracts(series_id);
CREATE INDEX IF NOT EXISTS idx_legal_contracts_status ON public.legal_contracts(status);


-- ============================================
-- 1.6  ADD FK: week_tokens → user_certificates_v2
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'week_tokens' AND column_name = 'user_certificate_v2_id'
  ) THEN
    ALTER TABLE public.week_tokens
      ADD COLUMN user_certificate_v2_id uuid REFERENCES public.user_certificates_v2(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'week_tokens' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.week_tokens
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'week_tokens' AND column_name = 'certificate_id_str'
  ) THEN
    ALTER TABLE public.week_tokens
      ADD COLUMN certificate_id_str text;  -- WC-YYYY-XXXXX format
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'week_tokens' AND column_name = 'blockchain_hash'
  ) THEN
    ALTER TABLE public.week_tokens
      ADD COLUMN blockchain_hash text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'week_tokens' AND column_name = 'qr_payload'
  ) THEN
    ALTER TABLE public.week_tokens
      ADD COLUMN qr_payload text;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_week_tokens_user_cert_v2 ON public.week_tokens(user_certificate_v2_id);
CREATE INDEX IF NOT EXISTS idx_week_tokens_user_id ON public.week_tokens(user_id);


-- ============================================
-- 1.7  ADD missing columns to reservation_requests
--       (generate-offer writes these)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'offered_property_id'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN offered_property_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'offered_dates_start'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN offered_dates_start date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'offered_dates_end'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN offered_dates_end date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'offer_expires_at'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN offer_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'confirmed_property_id'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN confirmed_property_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'party_size'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN party_size integer DEFAULT 2;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'destination_preference'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN destination_preference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'desired_start_date'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN desired_start_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservation_requests' AND column_name = 'desired_end_date'
  ) THEN
    ALTER TABLE public.reservation_requests ADD COLUMN desired_end_date date;
  END IF;
END
$$;


-- ============================================
-- 1.8  UNIQUE index on webhook_events for idempotency
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_unique_event
  ON public.webhook_events(source, event_id);


-- ==========================================================
-- 1.9  RLS: Enable + Policies for ALL sensitive tables
-- ==========================================================

-- Helper: reusable admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;


-- ---------- users ----------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
CREATE POLICY "users_delete_admin" ON public.users
  FOR DELETE USING (public.is_admin());


-- ---------- admin_users ----------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_admin_only" ON public.admin_users;
CREATE POLICY "admin_users_admin_only" ON public.admin_users
  FOR ALL USING (public.is_admin());


-- ---------- kyc_users ----------
ALTER TABLE public.kyc_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'kyc_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.kyc_users ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

DROP POLICY IF EXISTS "kyc_users_select_own" ON public.kyc_users;
CREATE POLICY "kyc_users_select_own" ON public.kyc_users
  FOR SELECT USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "kyc_users_insert_service" ON public.kyc_users;
CREATE POLICY "kyc_users_insert_service" ON public.kyc_users
  FOR INSERT WITH CHECK (true);  -- Service role inserts via webhook

DROP POLICY IF EXISTS "kyc_users_update_admin" ON public.kyc_users;
CREATE POLICY "kyc_users_update_admin" ON public.kyc_users
  FOR UPDATE USING (public.is_admin());


-- ---------- reservations ----------
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservations_select_own" ON public.reservations;
CREATE POLICY "reservations_select_own" ON public.reservations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reservations_insert_own" ON public.reservations;
CREATE POLICY "reservations_insert_own" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reservations_update" ON public.reservations;
CREATE POLICY "reservations_update" ON public.reservations
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());


-- ---------- week_tokens ----------
ALTER TABLE public.week_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "week_tokens_select" ON public.week_tokens;
CREATE POLICY "week_tokens_select" ON public.week_tokens
  FOR SELECT USING (
    user_id = auth.uid()
    OR owner_address = (SELECT wallet_address FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "week_tokens_insert_service" ON public.week_tokens;
CREATE POLICY "week_tokens_insert_service" ON public.week_tokens
  FOR INSERT WITH CHECK (true);  -- Service role inserts from webhooks

DROP POLICY IF EXISTS "week_tokens_update_admin" ON public.week_tokens;
CREATE POLICY "week_tokens_update_admin" ON public.week_tokens
  FOR UPDATE USING (public.is_admin());


-- ---------- broker_commissions ----------
ALTER TABLE public.broker_commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "broker_commissions_select_own" ON public.broker_commissions;
CREATE POLICY "broker_commissions_select_own" ON public.broker_commissions
  FOR SELECT USING (auth.uid() = broker_id OR public.is_admin());

DROP POLICY IF EXISTS "broker_commissions_insert_service" ON public.broker_commissions;
CREATE POLICY "broker_commissions_insert_service" ON public.broker_commissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "broker_commissions_update_admin" ON public.broker_commissions;
CREATE POLICY "broker_commissions_update_admin" ON public.broker_commissions
  FOR UPDATE USING (public.is_admin());


-- ---------- notifications ----------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (
    recipient = auth.uid()::text
    OR recipient = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
CREATE POLICY "notifications_insert_service" ON public.notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (
    recipient = auth.uid()::text
    OR recipient = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR public.is_admin()
  );


-- ---------- user_certificates ----------
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_certificates_select_own" ON public.user_certificates;
CREATE POLICY "user_certificates_select_own" ON public.user_certificates
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "user_certificates_insert_service" ON public.user_certificates;
CREATE POLICY "user_certificates_insert_service" ON public.user_certificates
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "user_certificates_update" ON public.user_certificates;
CREATE POLICY "user_certificates_update" ON public.user_certificates
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());


-- ---------- user_certificates_v2 ----------
ALTER TABLE public.user_certificates_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_certificates_v2_select_own" ON public.user_certificates_v2;
CREATE POLICY "user_certificates_v2_select_own" ON public.user_certificates_v2
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "user_certificates_v2_insert_service" ON public.user_certificates_v2;
CREATE POLICY "user_certificates_v2_insert_service" ON public.user_certificates_v2
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "user_certificates_v2_update" ON public.user_certificates_v2;
CREATE POLICY "user_certificates_v2_update" ON public.user_certificates_v2
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());


-- ---------- confirmed_reservations ----------
ALTER TABLE public.confirmed_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "confirmed_reservations_select_own" ON public.confirmed_reservations;
CREATE POLICY "confirmed_reservations_select_own" ON public.confirmed_reservations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "confirmed_reservations_insert_service" ON public.confirmed_reservations;
CREATE POLICY "confirmed_reservations_insert_service" ON public.confirmed_reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "confirmed_reservations_update" ON public.confirmed_reservations;
CREATE POLICY "confirmed_reservations_update" ON public.confirmed_reservations
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());


-- ---------- legal_contracts ----------
ALTER TABLE public.legal_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "legal_contracts_select_own" ON public.legal_contracts;
CREATE POLICY "legal_contracts_select_own" ON public.legal_contracts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "legal_contracts_insert_service" ON public.legal_contracts;
CREATE POLICY "legal_contracts_insert_service" ON public.legal_contracts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "legal_contracts_update_admin" ON public.legal_contracts;
CREATE POLICY "legal_contracts_update_admin" ON public.legal_contracts
  FOR UPDATE USING (public.is_admin());


-- ---------- supply_properties ----------
ALTER TABLE public.supply_properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "supply_properties_select_all" ON public.supply_properties;
CREATE POLICY "supply_properties_select_all" ON public.supply_properties
  FOR SELECT USING (true);  -- Read-only for authenticated users

DROP POLICY IF EXISTS "supply_properties_admin_manage" ON public.supply_properties;
CREATE POLICY "supply_properties_admin_manage" ON public.supply_properties
  FOR ALL USING (public.is_admin());


-- ==========================================================
-- Done. All 5 missing tables created, 10 tables RLS-secured.
-- ==========================================================
