-- ============================================================
-- SMOKE TESTS: Sprint 1 + Sprint 2 validation
-- Run each query manually in Supabase SQL editor
-- Expected results are commented next to each query
-- ============================================================

-- =============================================
-- TEST 1: Verify all 5 missing tables exist
-- =============================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_certificates',
  'user_certificates_v2',
  'supply_properties',
  'confirmed_reservations',
  'legal_contracts'
)
ORDER BY table_name;
-- EXPECTED: 5 rows

-- =============================================
-- TEST 2: Verify FK column on week_tokens
-- =============================================
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'week_tokens' AND column_name = 'user_certificate_v2_id';
-- EXPECTED: 1 row, data_type = uuid

-- =============================================
-- TEST 3: Verify UNIQUE index for idempotency
-- =============================================
SELECT indexname FROM pg_indexes
WHERE tablename = 'user_certificates_v2'
AND indexdef LIKE '%stripe_session_id%';
-- EXPECTED: 1 row (idx_ucv2_stripe_session)

SELECT indexname FROM pg_indexes
WHERE tablename = 'user_certificates_v2'
AND indexdef LIKE '%provider_payment_id%';
-- EXPECTED: 1 row (idx_ucv2_provider_payment)

SELECT indexname FROM pg_indexes
WHERE tablename = 'webhook_events'
AND indexdef LIKE '%source%event_id%';
-- EXPECTED: 1 row (idx_webhook_events_source_event_unique)

-- =============================================
-- TEST 4: Verify RLS is enabled on sensitive tables
-- =============================================
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'admin_users', 'kyc_users', 'reservations',
  'week_tokens', 'broker_commissions', 'notifications',
  'user_certificates', 'user_certificates_v2',
  'confirmed_reservations', 'legal_contracts', 'supply_properties'
)
ORDER BY tablename;
-- EXPECTED: All rows should have rowsecurity = true

-- =============================================
-- TEST 5: Verify RLS policies exist
-- =============================================
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'admin_users', 'kyc_users',
  'user_certificates_v2', 'confirmed_reservations'
)
ORDER BY tablename, policyname;
-- EXPECTED: Multiple policies per table (select_own, admin_select_all, etc.)

-- =============================================
-- TEST 6: RLS enforcement - user can only see own data
-- Simulate: as a non-admin authenticated user, try to see others' data
-- =============================================
-- To test: Log in as a regular user and run:
--   SELECT * FROM users;
-- EXPECTED: Only returns the logged-in user's own row
-- (Cannot be tested via SQL editor which uses service role)

-- =============================================
-- TEST 7: Verify confirmed_reservations has unique constraint
-- =============================================
SELECT conname FROM pg_constraint
WHERE conrelid = 'confirmed_reservations'::regclass
AND conname LIKE '%unique%' OR conname LIKE '%property_checkin%';
-- EXPECTED: 1 row (prevents double-booking same property+checkin)

-- =============================================
-- TEST 8: Verify user_certificates_v2 columns match code expectations
-- =============================================
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_certificates_v2'
ORDER BY ordinal_position;
-- EXPECTED: id, user_id, product_id, max_pax, max_estancias_per_year,
--           purchase_price_usd, start_date, end_date,
--           annual_entitlement_estancias, annual_used_estancias,
--           annual_reset_at, status, order_id, stripe_session_id,
--           provider_payment_id, created_at, updated_at

-- =============================================
-- TEST 9: End-to-end certificate emission simulation
-- (Requires a test user_id - replace with real UUID)
-- =============================================
-- INSERT INTO user_certificates_v2 (
--   user_id, max_pax, max_estancias_per_year, purchase_price_usd,
--   start_date, end_date, annual_entitlement_estancias,
--   annual_used_estancias, annual_reset_at, status,
--   order_id, stripe_session_id
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001', 4, 2, 3500,
--   CURRENT_DATE, CURRENT_DATE + INTERVAL '15 years', 2,
--   0, CURRENT_DATE + INTERVAL '1 year', 'active',
--   'test-order-001', 'cs_test_unique_001'
-- )
-- ON CONFLICT (stripe_session_id) DO NOTHING
-- RETURNING id;
-- EXPECTED: 1 row on first run, 0 rows on second run (idempotent)

-- =============================================
-- TEST 10: Verify week_tokens FK constraint
-- =============================================
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'week_tokens'
AND constraint_name LIKE '%certificate_v2%';
-- EXPECTED: 1 row (foreign key)
