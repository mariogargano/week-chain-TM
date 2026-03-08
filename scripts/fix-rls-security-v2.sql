-- =====================================================
-- WEEK-CHAIN Security Fix: Enable RLS on all tables
-- Version 2 - Corrected for actual table structures
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1. SYSTEM/CONFIG TABLES (Admin only)
-- =====================================================

-- admin_permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_permissions_admin_only" ON public.admin_permissions
  FOR ALL USING (public.is_admin());

-- admin_wallets
ALTER TABLE public.admin_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_wallets_admin_only" ON public.admin_wallets
  FOR ALL USING (public.is_admin());

-- audit_logs (admin can view all)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_admin_view" ON public.audit_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_logs_service_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- broker_levels (public read)
ALTER TABLE public.broker_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broker_levels_public_read" ON public.broker_levels
  FOR SELECT USING (true);
CREATE POLICY "broker_levels_admin_manage" ON public.broker_levels
  FOR ALL USING (public.is_admin());

-- commission_rates (public read)
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commission_rates_public_read" ON public.commission_rates
  FOR SELECT USING (true);
CREATE POLICY "commission_rates_admin_manage" ON public.commission_rates
  FOR ALL USING (public.is_admin());

-- contract_templates (admin only)
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contract_templates_admin_only" ON public.contract_templates
  FOR ALL USING (public.is_admin());

-- dao_parameters (public read, admin write)
ALTER TABLE public.dao_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dao_parameters_public_read" ON public.dao_parameters
  FOR SELECT USING (true);
CREATE POLICY "dao_parameters_admin_manage" ON public.dao_parameters
  FOR ALL USING (public.is_admin());

-- logs (admin only)
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_admin_only" ON public.logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "logs_service_insert" ON public.logs
  FOR INSERT WITH CHECK (true);

-- notaries (public read)
ALTER TABLE public.notaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notaries_public_read" ON public.notaries
  FOR SELECT USING (true);
CREATE POLICY "notaries_admin_manage" ON public.notaries
  FOR ALL USING (public.is_admin());

-- seasons (public read)
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seasons_public_read" ON public.seasons
  FOR SELECT USING (true);
CREATE POLICY "seasons_admin_manage" ON public.seasons
  FOR ALL USING (public.is_admin());

-- system_config (admin only)
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_config_admin_only" ON public.system_config
  FOR ALL USING (public.is_admin());

-- system_logs (admin only)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_logs_admin_view" ON public.system_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "system_logs_service_insert" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- 2. BROKER/REFERRAL TABLES
-- =====================================================

-- anonymous_referral_conversions
ALTER TABLE public.anonymous_referral_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_ref_conv_admin" ON public.anonymous_referral_conversions
  FOR ALL USING (public.is_admin());

-- anonymous_referrals
ALTER TABLE public.anonymous_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_ref_claimed_user" ON public.anonymous_referrals
  FOR SELECT USING (claimed_by_user_id = auth.uid());
CREATE POLICY "anon_ref_admin" ON public.anonymous_referrals
  FOR ALL USING (public.is_admin());

-- broker_elite_benefits
ALTER TABLE public.broker_elite_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broker_elite_own" ON public.broker_elite_benefits
  FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "broker_elite_admin" ON public.broker_elite_benefits
  FOR ALL USING (public.is_admin());

-- broker_time_bonuses
ALTER TABLE public.broker_time_bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broker_bonus_own" ON public.broker_time_bonuses
  FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "broker_bonus_admin" ON public.broker_time_bonuses
  FOR ALL USING (public.is_admin());

-- referral_tree
ALTER TABLE public.referral_tree ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_tree_own" ON public.referral_tree
  FOR SELECT USING (broker_id = auth.uid() OR referred_user_id = auth.uid());
CREATE POLICY "referral_tree_admin" ON public.referral_tree
  FOR ALL USING (public.is_admin());

-- user_referral_commissions
ALTER TABLE public.user_referral_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_ref_comm_own" ON public.user_referral_commissions
  FOR SELECT USING (referrer_id = auth.uid());
CREATE POLICY "user_ref_comm_admin" ON public.user_referral_commissions
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 3. PROPERTY TABLES
-- =====================================================

-- properties (public read for active)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties_public_read" ON public.properties
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "properties_owner_manage" ON public.properties
  FOR ALL USING (owner_id = auth.uid() OR public.is_admin());

-- propiedades (legacy, admin only)
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "propiedades_admin" ON public.propiedades
  FOR ALL USING (public.is_admin());

-- property_pricing_config
ALTER TABLE public.property_pricing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "property_pricing_admin" ON public.property_pricing_config
  FOR ALL USING (public.is_admin());

-- property_status_logs
ALTER TABLE public.property_status_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "property_status_admin" ON public.property_status_logs
  FOR ALL USING (public.is_admin());

-- semanas (legacy)
ALTER TABLE public.semanas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "semanas_admin" ON public.semanas
  FOR ALL USING (public.is_admin());

-- weeks
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weeks_public_read" ON public.weeks
  FOR SELECT USING (true);
CREATE POLICY "weeks_admin_manage" ON public.weeks
  FOR ALL USING (public.is_admin());

-- week_seasons
ALTER TABLE public.week_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "week_seasons_public_read" ON public.week_seasons
  FOR SELECT USING (true);
CREATE POLICY "week_seasons_admin" ON public.week_seasons
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 4. ESCROW/FINANCIAL TABLES
-- =====================================================

-- escrow_deposits
ALTER TABLE public.escrow_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "escrow_own" ON public.escrow_deposits
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "escrow_admin" ON public.escrow_deposits
  FOR ALL USING (public.is_admin());

-- exit_distributions
ALTER TABLE public.exit_distributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exit_dist_admin" ON public.exit_distributions
  FOR ALL USING (public.is_admin());

-- exit_payments
ALTER TABLE public.exit_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exit_pay_admin" ON public.exit_payments
  FOR ALL USING (public.is_admin());

-- week_balances
ALTER TABLE public.week_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "week_bal_admin" ON public.week_balances
  FOR ALL USING (public.is_admin());

-- week_transactions
ALTER TABLE public.week_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "week_trans_admin" ON public.week_transactions
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 5. RENTAL/MANAGEMENT TABLES
-- =====================================================

-- management_availability
ALTER TABLE public.management_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mgmt_avail_admin" ON public.management_availability
  FOR ALL USING (public.is_admin());

-- management_communications
ALTER TABLE public.management_communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mgmt_comm_admin" ON public.management_communications
  FOR ALL USING (public.is_admin());

-- management_services
ALTER TABLE public.management_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mgmt_serv_admin" ON public.management_services
  FOR ALL USING (public.is_admin());

-- nft_management
ALTER TABLE public.nft_management ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nft_mgmt_admin" ON public.nft_management
  FOR ALL USING (public.is_admin());

-- ota_sync_logs
ALTER TABLE public.ota_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ota_sync_admin" ON public.ota_sync_logs
  FOR ALL USING (public.is_admin());

-- rental_income
ALTER TABLE public.rental_income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rental_income_admin" ON public.rental_income
  FOR ALL USING (public.is_admin());

-- week_rentals
ALTER TABLE public.week_rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "week_rentals_admin" ON public.week_rentals
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 6. NFT/MARKETPLACE TABLES
-- =====================================================

-- marketplace_listings (public read)
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marketplace_public_read" ON public.marketplace_listings
  FOR SELECT USING (true);
CREATE POLICY "marketplace_admin" ON public.marketplace_listings
  FOR ALL USING (public.is_admin());

-- nft_provisional
ALTER TABLE public.nft_provisional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nft_prov_own" ON public.nft_provisional
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "nft_prov_admin" ON public.nft_provisional
  FOR ALL USING (public.is_admin());

-- nft_transactions (public read)
ALTER TABLE public.nft_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nft_trans_public" ON public.nft_transactions
  FOR SELECT USING (true);
CREATE POLICY "nft_trans_admin" ON public.nft_transactions
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 7. VAFI/LENDING TABLES
-- =====================================================

-- vafi_liquidations
ALTER TABLE public.vafi_liquidations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vafi_liq_admin" ON public.vafi_liquidations
  FOR ALL USING (public.is_admin());

-- vafi_liquidity_pool (public read)
ALTER TABLE public.vafi_liquidity_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vafi_pool_public" ON public.vafi_liquidity_pool
  FOR SELECT USING (true);
CREATE POLICY "vafi_pool_admin" ON public.vafi_liquidity_pool
  FOR ALL USING (public.is_admin());

-- vafi_loans
ALTER TABLE public.vafi_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vafi_loans_admin" ON public.vafi_loans
  FOR ALL USING (public.is_admin());

-- vafi_payments
ALTER TABLE public.vafi_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vafi_pay_admin" ON public.vafi_payments
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 8. KYC/DOCUMENTS TABLES
-- =====================================================

-- kyc_documents
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kyc_docs_admin" ON public.kyc_documents
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 9. CONTRACT/SIGNING TABLES
-- =====================================================

-- signed_contracts
ALTER TABLE public.signed_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed_own" ON public.signed_contracts
  FOR SELECT USING (signer_id = auth.uid());
CREATE POLICY "signed_admin" ON public.signed_contracts
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 10. RESERVATION/NOTES TABLES
-- =====================================================

-- reservation_notes
ALTER TABLE public.reservation_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "res_notes_admin" ON public.reservation_notes
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 11. USER/PROFILE TABLES
-- =====================================================

-- user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_own" ON public.user_profiles
  FOR ALL USING (id = auth.uid());
CREATE POLICY "user_profiles_public_read" ON public.user_profiles
  FOR SELECT USING (true);

-- user_tutorials
ALTER TABLE public.user_tutorials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_tutorials_own" ON public.user_tutorials
  FOR ALL USING (user_id::uuid = auth.uid());

-- =====================================================
-- 12. FIX VIEWS (Remove SECURITY DEFINER)
-- =====================================================

-- Drop and recreate webhook_stats without SECURITY DEFINER
DROP VIEW IF EXISTS public.webhook_stats;
CREATE VIEW public.webhook_stats AS
SELECT 
  source,
  event_type,
  status,
  COUNT(*) as total_events,
  MAX(created_at) as last_event_at,
  AVG(retry_count) as avg_retries
FROM public.webhook_events
GROUP BY source, event_type, status;

-- Drop and recreate failed_webhooks_recent without SECURITY DEFINER
DROP VIEW IF EXISTS public.failed_webhooks_recent;
CREATE VIEW public.failed_webhooks_recent AS
SELECT 
  id,
  source,
  event_type,
  event_id,
  error_message,
  retry_count,
  created_at
FROM public.webhook_events
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 100;

-- =====================================================
-- DONE
-- =====================================================
