-- PHASE 1C: SUPABASE RLS LOCKDOWN
-- Lock down supply_properties, capacity_engine_status, and legacy tables to admin-only access

-- ====================
-- SUPPLY_PROPERTIES: ADMIN-ONLY
-- ====================

-- Drop existing public policies
DROP POLICY IF EXISTS "Anyone can view active supply properties" ON supply_properties;
DROP POLICY IF EXISTS "Public can view supply properties" ON supply_properties;
DROP POLICY IF EXISTS "Enable read access for all users" ON supply_properties;

-- Create admin-only policies
CREATE POLICY "Only admins can view supply properties"
ON supply_properties
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

CREATE POLICY "Only admins can insert supply properties"
ON supply_properties
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
    AND admin_users.role IN ('super_admin', 'ops')
  )
);

CREATE POLICY "Only admins can update supply properties"
ON supply_properties
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
    AND admin_users.role IN ('super_admin', 'ops')
  )
);

-- ====================
-- CAPACITY_ENGINE_STATUS: ADMIN-ONLY
-- ====================

-- Drop existing public policies
DROP POLICY IF EXISTS "Anyone can view latest capacity status" ON capacity_engine_status;
DROP POLICY IF EXISTS "Public can view capacity status" ON capacity_engine_status;

-- Create admin-only policies
CREATE POLICY "Only admins can view capacity status"
ON capacity_engine_status
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

CREATE POLICY "Only admins can insert capacity status"
ON capacity_engine_status
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
    AND admin_users.role IN ('super_admin', 'ops')
  )
);

-- ====================
-- LEGACY TABLES: ADMIN-ONLY
-- ====================

-- WEEKS table
DROP POLICY IF EXISTS "Enable read access for all users" ON weeks;
DROP POLICY IF EXISTS "Users can view their own weeks" ON weeks;

CREATE POLICY "Only admins can view weeks table"
ON weeks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- VOUCHERS table
DROP POLICY IF EXISTS "Users can view their own vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public can view vouchers" ON vouchers;

CREATE POLICY "Only admins can view vouchers table"
ON vouchers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- NFT_PROVISIONAL table
DROP POLICY IF EXISTS "Users can view their own NFTs" ON nft_provisional;

CREATE POLICY "Only admins can view nft_provisional table"
ON nft_provisional
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- NFT_MINTS table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nft_mints') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own mints" ON nft_mints';
    EXECUTE 'CREATE POLICY "Only admins can view nft_mints table" ON nft_mints FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
        AND admin_users.status = ''active''
      )
    )';
  END IF;
END $$;

-- BROKER_LEVELS table (MLM structure - deprecated)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'broker_levels') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Brokers can view their levels" ON broker_levels';
    EXECUTE 'CREATE POLICY "Only admins can view broker_levels table" ON broker_levels FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
        AND admin_users.status = ''active''
      )
    )';
  END IF;
END $$;

-- ====================
-- RESERVATION_REQUESTS: Authenticated users can view their own
-- ====================

CREATE POLICY "Users can view their own reservation requests"
ON reservation_requests
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

CREATE POLICY "Users can create their own reservation requests"
ON reservation_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ====================
-- USER_CERTIFICATES: Users can view their own certificates
-- ====================

CREATE POLICY "Users can view their own certificates"
ON user_certificates
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.status = 'active'
  )
);

-- ====================
-- CERTIFICATE_PRODUCTS: Public can view available tiers
-- ====================

CREATE POLICY "Anyone can view available certificate products"
ON certificate_products
FOR SELECT
USING (status = 'active');

-- ====================
-- AUDIT LOG
-- ====================

COMMENT ON POLICY "Only admins can view supply properties" ON supply_properties IS 'PHASE 1C: RLS lockdown - supply data is admin-only';
COMMENT ON POLICY "Only admins can view capacity status" ON capacity_engine_status IS 'PHASE 1C: RLS lockdown - capacity metrics are admin-only';
COMMENT ON POLICY "Only admins can view weeks table" ON weeks IS 'PHASE 1C: RLS lockdown - legacy week sales data is admin-only';
COMMENT ON POLICY "Only admins can view vouchers table" ON vouchers IS 'PHASE 1C: RLS lockdown - legacy voucher data is admin-only';
COMMENT ON POLICY "Only admins can view nft_provisional table" ON nft_provisional IS 'PHASE 1C: RLS lockdown - legacy NFT data is admin-only';
