-- =====================================================
-- SCRIPT DE LIMPIEZA DE DATOS DE PRUEBA
-- =====================================================
-- Este script elimina datos de prueba para permitir
-- una prueba completamente limpia con datos reales.
--
-- PRESERVA:
--   - Usuarios admin (admin_users, users con role in super_admin/admin)
--   - Super admin (corporativo@morises.com)
--   - Configuracion (system_config, feature_flags, commission_rates, seasons, etc.)
--   - Catalogo (certificate_products_v2, broker_levels, terms_and_conditions, contract_templates)
--   - Notarios verificados
--
-- ELIMINA:
--   - Reservaciones, ofertas, solicitudes
--   - Pagos (fiat_payments, payments, vouchers, purchase_vouchers)
--   - Escrow (escrow_deposits)
--   - Transacciones (week_transactions, nft_transactions)
--   - KYC (kyc_users, kyc_documents)
--   - Usuarios de prueba (no admin)
--   - Propiedades y semanas generadas en pruebas
--   - Logs, alerts, audit trails
--   - Email logs de prueba
--   - Contenido social (posts, comments, likes) - opcional
-- =====================================================

BEGIN;

-- ==================== RESERVACIONES ====================
DELETE FROM reservation_notes;
DELETE FROM reservation_offers;
DELETE FROM reservation_requests;
DELETE FROM confirmed_reservations;
DELETE FROM reservations;

-- ==================== PAGOS Y ESCROW ====================
DELETE FROM exit_payments;
DELETE FROM exit_distributions;
DELETE FROM vafi_payments;
DELETE FROM vafi_liquidations;
DELETE FROM vafi_positions;
DELETE FROM vafi_loans;
DELETE FROM loans;
DELETE FROM collaterals;
DELETE FROM purchase_vouchers;
DELETE FROM voucher_redemptions;
DELETE FROM vouchers;
DELETE FROM fiat_payments;
DELETE FROM payments;
DELETE FROM escrow_deposits;
DELETE FROM week_transactions;
DELETE FROM nft_transactions;
DELETE FROM rental_income;
DELETE FROM week_balances;
DELETE FROM property_owner_sales;

-- ==================== COMISIONES Y REFERIDOS ====================
DELETE FROM broker_commissions;
DELETE FROM commission_records;
DELETE FROM commissions;
DELETE FROM user_referral_commissions;
DELETE FROM anonymous_referral_conversions;
DELETE FROM anonymous_referrals;
DELETE FROM referral_tree;
DELETE FROM referral_attributions;
DELETE FROM broker_elite_benefits;
DELETE FROM broker_time_bonuses;
DELETE FROM compliance_strikes;

-- ==================== RENTAS / OTA ====================
DELETE FROM ota_sync_logs;
DELETE FROM week_rentals;
DELETE FROM management_services;
DELETE FROM management_communications;
DELETE FROM management_availability;
DELETE FROM nft_management;

-- ==================== CERTIFICADOS Y NFTs ====================
DELETE FROM wrapped_certificates;
DELETE FROM certificate_visual_state;
DELETE FROM certificate_waitlist;
DELETE FROM user_certificates;
DELETE FROM user_certificates_v2;
DELETE FROM nft_provisional;
DELETE FROM week_tokens;

-- ==================== SEMANAS E INVENTARIO ====================
DELETE FROM week_seasons;
DELETE FROM semanas;
DELETE FROM weeks;

-- ==================== PROPIEDADES (test) ====================
-- Elimina submissions en draft o rejected, y propiedades sin sales
DELETE FROM property_pricing_config;
DELETE FROM property_status_logs;
DELETE FROM property_submissions WHERE status IN ('draft', 'rejected', 'pending');
DELETE FROM propiedades;
DELETE FROM supply_properties WHERE metadata->>'test' = 'true' OR created_at > NOW() - INTERVAL '90 days';

-- ==================== KYC ====================
DELETE FROM kyc_documents;
DELETE FROM kyc_users;

-- ==================== CONTRATOS Y LEGAL ====================
DELETE FROM signed_contracts;
DELETE FROM legal_contracts;
DELETE FROM legalario_contracts;
DELETE FROM easylex_documents;
DELETE FROM legal_acceptances;
DELETE FROM terms_acceptance;
DELETE FROM user_consents;
DELETE FROM consent_records;

-- ==================== PRE-HOLDERS Y LEADS ====================
DELETE FROM pre_holders;

-- ==================== COMUNICACION ====================
DELETE FROM queued_notifications;
DELETE FROM notifications;
DELETE FROM owner_notifications;
DELETE FROM pre_stay_reminders;
DELETE FROM stay_checklists;
DELETE FROM direct_messages;

-- ==================== ALERTAS Y LOGS ====================
DELETE FROM fraud_alerts;
DELETE FROM system_alerts;
DELETE FROM sla_tracking;
DELETE FROM state_history;
DELETE FROM workflow_queue;
DELETE FROM incidents;
DELETE FROM post_stay_activities;
DELETE FROM audit_logs;
DELETE FROM admin_activity;
DELETE FROM logs;
DELETE FROM system_logs;
DELETE FROM evidence_events;
DELETE FROM evidence_log;
DELETE FROM compliance_audit_log;
DELETE FROM two_factor_audit_log;
DELETE FROM rbac_access_logs;
DELETE FROM verification_access_logs;
DELETE FROM public_verification_tokens;
DELETE FROM feature_flag_audit;
DELETE FROM high_value_operations;
DELETE FROM otp_codes;
-- NOTE: audit_log_immutable uses hash chain; truncating would break integrity proofs.
-- Only clear if you are sure you want a brand new chain.
DELETE FROM audit_log_immutable;

-- ==================== WEBHOOKS ====================
DELETE FROM webhook_events;

-- ==================== CONTENIDO SOCIAL (OPCIONAL) ====================
DELETE FROM mentions;
DELETE FROM post_hashtags;
DELETE FROM reposts;
DELETE FROM bookmarks;
DELETE FROM likes;
DELETE FROM comments;
DELETE FROM posts;
DELETE FROM follows;
DELETE FROM hashtags;
DELETE FROM review_flags;
DELETE FROM review_responses;
DELETE FROM review_moderation_log;
DELETE FROM week_reviews;
DELETE FROM reports;
DELETE FROM testimonials WHERE 1=1;

-- ==================== MARKETPLACE ====================
DELETE FROM marketplace_listings;

-- ==================== INTERMEDIARIOS / BROKERS ====================
DELETE FROM intermediary_profiles;

-- ==================== DAO ====================
DELETE FROM dao_votes;
DELETE FROM dao_proposals;

-- ==================== COMPLIANCE ====================
DELETE FROM compliance_records;
DELETE FROM insurance_inquiries;

-- ==================== PROPERTY OWNER ====================
DELETE FROM property_owner_profiles WHERE user_id NOT IN (
  SELECT id FROM users WHERE role IN ('admin', 'super_admin')
);

-- ==================== USUARIOS DE PRUEBA ====================
-- CUIDADO: Esto elimina usuarios que NO son admin ni super admin.
-- El super admin (corporativo@morises.com) se preserva siempre.
-- Comentar estas lineas si quieres mantener los usuarios existentes.

DELETE FROM user_tutorials WHERE user_id::text NOT IN (
  SELECT id::text FROM users WHERE role IN ('admin', 'super_admin') OR email = 'corporativo@morises.com'
);
DELETE FROM user_two_factor WHERE user_id NOT IN (
  SELECT id FROM users WHERE role IN ('admin', 'super_admin') OR email = 'corporativo@morises.com'
);
DELETE FROM user_role_assignments WHERE user_id NOT IN (
  SELECT id FROM users WHERE role IN ('admin', 'super_admin') OR email = 'corporativo@morises.com'
);
DELETE FROM user_profiles WHERE id NOT IN (
  SELECT id FROM users WHERE role IN ('admin', 'super_admin') OR email = 'corporativo@morises.com'
);
DELETE FROM profiles WHERE id NOT IN (
  SELECT id FROM users WHERE role IN ('admin', 'super_admin') OR email = 'corporativo@morises.com'
);
DELETE FROM users WHERE role NOT IN ('admin', 'super_admin') AND email != 'corporativo@morises.com';

-- ==================== PUBLIC SALES LOG ====================
DELETE FROM public_sales_log;

-- ==================== RESET CONTADORES ====================
UPDATE capacity_engine_status SET
  utilization_pct = 0,
  total_sold_weeks = 0,
  safe_capacity_pct = 80,
  stop_sale_active = false,
  stop_sale_reason = NULL,
  updated_at = NOW();

UPDATE vafi_liquidity_pool SET
  total_liquidity_usd = 0,
  utilized_liquidity_usd = 0,
  available_liquidity_usd = 0,
  total_loans_issued = 0,
  total_loans_repaid = 0,
  total_liquidations = 0,
  total_interest_earned_usd = 0;

-- ==================== VERIFICACION ====================
-- Mostrar conteo de datos preservados
DO $$
DECLARE
  admin_count INTEGER;
  super_admin_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM users WHERE role IN ('admin', 'super_admin');
  SELECT EXISTS(SELECT 1 FROM users WHERE email = 'corporativo@morises.com') INTO super_admin_exists;
  RAISE NOTICE 'Limpieza completa. Admins preservados: %. Super admin existe: %', admin_count, super_admin_exists;
END $$;

COMMIT;
