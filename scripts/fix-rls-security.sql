-- =====================================================
-- WEEK-CHAIN Security Fix: Enable RLS on all tables
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Fix SECURITY DEFINER views (convert to SECURITY INVOKER)
-- =====================================================

-- Drop and recreate webhook_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.webhook_stats;
CREATE VIEW public.webhook_stats AS
SELECT 
  event_type,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  MAX(created_at) as last_event
FROM public.webhook_events
GROUP BY event_type;

-- Drop and recreate failed_webhooks_recent view without SECURITY DEFINER
DROP VIEW IF EXISTS public.failed_webhooks_recent;
CREATE VIEW public.failed_webhooks_recent AS
SELECT *
FROM public.webhook_events
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 100;

-- =====================================================
-- PART 2: Enable RLS on all tables without it
-- =====================================================

-- Core tables
ALTER TABLE IF EXISTS public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nft_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.semanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.escrow_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.week_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.week_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vafi_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vafi_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vafi_liquidations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.week_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rental_income ENABLE ROW LEVEL SECURITY;

-- Additional tables that might be missing RLS
ALTER TABLE IF EXISTS public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.signed_contracts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: Create RLS Policies
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR email = 'corporativo@morises.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN-ONLY TABLES (only admins can read/write)
-- =====================================================

-- admin_wallets: Admin only
DROP POLICY IF EXISTS "admin_wallets_admin_all" ON public.admin_wallets;
CREATE POLICY "admin_wallets_admin_all" ON public.admin_wallets
  FOR ALL USING (public.is_admin());

-- admin_permissions: Admin only
DROP POLICY IF EXISTS "admin_permissions_admin_all" ON public.admin_permissions;
CREATE POLICY "admin_permissions_admin_all" ON public.admin_permissions
  FOR ALL USING (public.is_admin());

-- system_config: Admin only
DROP POLICY IF EXISTS "system_config_admin_all" ON public.system_config;
CREATE POLICY "system_config_admin_all" ON public.system_config
  FOR ALL USING (public.is_admin());

-- audit_logs: Admin read only
DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_service_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_service_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true); -- Service role can insert

-- system_logs: Admin read only
DROP POLICY IF EXISTS "system_logs_admin_read" ON public.system_logs;
CREATE POLICY "system_logs_admin_read" ON public.system_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "system_logs_service_insert" ON public.system_logs;
CREATE POLICY "system_logs_service_insert" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- logs: Admin read only
DROP POLICY IF EXISTS "logs_admin_read" ON public.logs;
CREATE POLICY "logs_admin_read" ON public.logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "logs_service_insert" ON public.logs;
CREATE POLICY "logs_service_insert" ON public.logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- USER-OWNED TABLES (users can see their own data)
-- =====================================================

-- kyc_documents: Users see their own, admins see all
DROP POLICY IF EXISTS "kyc_documents_user_own" ON public.kyc_documents;
CREATE POLICY "kyc_documents_user_own" ON public.kyc_documents
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "kyc_documents_user_insert" ON public.kyc_documents;
CREATE POLICY "kyc_documents_user_insert" ON public.kyc_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "kyc_documents_admin_update" ON public.kyc_documents;
CREATE POLICY "kyc_documents_admin_update" ON public.kyc_documents
  FOR UPDATE USING (public.is_admin());

-- user_profiles: Users see their own, admins see all
DROP POLICY IF EXISTS "user_profiles_user_own" ON public.user_profiles;
CREATE POLICY "user_profiles_user_own" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- user_tutorials: Users manage their own
DROP POLICY IF EXISTS "user_tutorials_user_own" ON public.user_tutorials;
CREATE POLICY "user_tutorials_user_own" ON public.user_tutorials
  FOR ALL USING (auth.uid() = user_id);

-- week_balances: Users see their own, admins see all
DROP POLICY IF EXISTS "week_balances_user_own" ON public.week_balances;
CREATE POLICY "week_balances_user_own" ON public.week_balances
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- week_transactions: Users see their own, admins see all
DROP POLICY IF EXISTS "week_transactions_user_own" ON public.week_transactions;
CREATE POLICY "week_transactions_user_own" ON public.week_transactions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id OR public.is_admin());

-- vafi_loans: Users see their own loans
DROP POLICY IF EXISTS "vafi_loans_user_own" ON public.vafi_loans;
CREATE POLICY "vafi_loans_user_own" ON public.vafi_loans
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- vafi_payments: Users see their own payments
DROP POLICY IF EXISTS "vafi_payments_user_own" ON public.vafi_payments;
CREATE POLICY "vafi_payments_user_own" ON public.vafi_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.vafi_loans WHERE id = loan_id AND user_id = auth.uid())
    OR public.is_admin()
  );

-- vafi_liquidations: Admin only
DROP POLICY IF EXISTS "vafi_liquidations_admin" ON public.vafi_liquidations;
CREATE POLICY "vafi_liquidations_admin" ON public.vafi_liquidations
  FOR ALL USING (public.is_admin());

-- week_rentals: Users see their own rentals
DROP POLICY IF EXISTS "week_rentals_user_own" ON public.week_rentals;
CREATE POLICY "week_rentals_user_own" ON public.week_rentals
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = renter_id OR public.is_admin());

-- rental_income: Users see their own income
DROP POLICY IF EXISTS "rental_income_user_own" ON public.rental_income;
CREATE POLICY "rental_income_user_own" ON public.rental_income
  FOR SELECT USING (auth.uid() = owner_id OR public.is_admin());

-- escrow_deposits: Users see their own escrow
DROP POLICY IF EXISTS "escrow_deposits_user_own" ON public.escrow_deposits;
CREATE POLICY "escrow_deposits_user_own" ON public.escrow_deposits
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- nft_transactions: Users see their own transactions
DROP POLICY IF EXISTS "nft_transactions_user_own" ON public.nft_transactions;
CREATE POLICY "nft_transactions_user_own" ON public.nft_transactions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id OR public.is_admin());

-- notifications: Users see their own notifications
DROP POLICY IF EXISTS "notifications_user_own" ON public.notifications;
CREATE POLICY "notifications_user_own" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- commission_records: Brokers see their own, admins see all
DROP POLICY IF EXISTS "commission_records_broker_own" ON public.commission_records;
CREATE POLICY "commission_records_broker_own" ON public.commission_records
  FOR SELECT USING (auth.uid() = broker_id OR public.is_admin());

-- referral_attributions: Users see their own referrals
DROP POLICY IF EXISTS "referral_attributions_user_own" ON public.referral_attributions;
CREATE POLICY "referral_attributions_user_own" ON public.referral_attributions
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR public.is_admin());

-- =====================================================
-- PUBLIC READ TABLES (anyone can read, admin can write)
-- =====================================================

-- propiedades: Public read, admin write
DROP POLICY IF EXISTS "propiedades_public_read" ON public.propiedades;
CREATE POLICY "propiedades_public_read" ON public.propiedades
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "propiedades_admin_write" ON public.propiedades;
CREATE POLICY "propiedades_admin_write" ON public.propiedades
  FOR ALL USING (public.is_admin());

-- semanas: Public read, admin write
DROP POLICY IF EXISTS "semanas_public_read" ON public.semanas;
CREATE POLICY "semanas_public_read" ON public.semanas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "semanas_admin_write" ON public.semanas;
CREATE POLICY "semanas_admin_write" ON public.semanas
  FOR ALL USING (public.is_admin());

-- weeks: Public read, admin write
DROP POLICY IF EXISTS "weeks_public_read" ON public.weeks;
CREATE POLICY "weeks_public_read" ON public.weeks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "weeks_admin_write" ON public.weeks;
CREATE POLICY "weeks_admin_write" ON public.weeks
  FOR ALL USING (public.is_admin());

-- property_status_logs: Admin only
DROP POLICY IF EXISTS "property_status_logs_admin" ON public.property_status_logs;
CREATE POLICY "property_status_logs_admin" ON public.property_status_logs
  FOR ALL USING (public.is_admin());

-- marketplace_listings: Public read active, owners manage own
DROP POLICY IF EXISTS "marketplace_listings_public_read" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_public_read" ON public.marketplace_listings
  FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR public.is_admin());

DROP POLICY IF EXISTS "marketplace_listings_owner_manage" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings_owner_manage" ON public.marketplace_listings
  FOR ALL USING (auth.uid() = seller_id OR public.is_admin());

-- =====================================================
-- CONTRACTS (sensitive - user own + admin)
-- =====================================================

-- legal_contracts: Users see their own contracts
DROP POLICY IF EXISTS "legal_contracts_user_own" ON public.legal_contracts;
CREATE POLICY "legal_contracts_user_own" ON public.legal_contracts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "legal_contracts_admin_manage" ON public.legal_contracts;
CREATE POLICY "legal_contracts_admin_manage" ON public.legal_contracts
  FOR ALL USING (public.is_admin());

-- signed_contracts: Users see their own signed contracts
DROP POLICY IF EXISTS "signed_contracts_user_own" ON public.signed_contracts;
CREATE POLICY "signed_contracts_user_own" ON public.signed_contracts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- =====================================================
-- WEBHOOKS & EMAIL (service role only via RLS bypass)
-- =====================================================

-- webhook_events: Admin read only
DROP POLICY IF EXISTS "webhook_events_admin_read" ON public.webhook_events;
CREATE POLICY "webhook_events_admin_read" ON public.webhook_events
  FOR SELECT USING (public.is_admin());

-- email_logs: Admin read only
DROP POLICY IF EXISTS "email_logs_admin_read" ON public.email_logs;
CREATE POLICY "email_logs_admin_read" ON public.email_logs
  FOR SELECT USING (public.is_admin());

-- =====================================================
-- VERIFICATION
-- =====================================================

-- List all tables and their RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
