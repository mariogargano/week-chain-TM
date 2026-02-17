-- =====================================================
-- ADMIN ACCESS CONTROL - Single Email Enforcement
-- Purpose: Restrict all admin access to corporativo@morises.com
-- Security Level: MAXIMUM
-- =====================================================

-- Drop existing admin RLS policies to rebuild them
DROP POLICY IF EXISTS "Super admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can view supply properties" ON supply_properties;
DROP POLICY IF EXISTS "Only admins can view capacity status" ON capacity_engine_status;

-- =====================================================
-- HELPER FUNCTION: Strict Admin Check
-- Only corporativo@morises.com can be admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_corporativo_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.email() = 'corporativo@morises.com'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.status = 'active'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN_USERS TABLE - Locked to corporativo@morises.com
-- =====================================================

-- Only corporativo@morises.com can view admin_users
CREATE POLICY "Only corporativo admin can view admin users"
  ON admin_users FOR SELECT
  USING (public.is_corporativo_admin());

-- Only corporativo@morises.com can manage admin_users
CREATE POLICY "Only corporativo admin can manage admin users"
  ON admin_users FOR ALL
  USING (public.is_corporativo_admin());

-- =====================================================
-- SUPPLY PROPERTIES - Admin Only Access
-- =====================================================

CREATE POLICY "Only corporativo admin can view supply properties"
  ON supply_properties FOR SELECT
  USING (public.is_corporativo_admin());

CREATE POLICY "Only corporativo admin can manage supply properties"
  ON supply_properties FOR ALL
  USING (public.is_corporativo_admin());

-- =====================================================
-- CAPACITY ENGINE STATUS - Admin Only Access
-- =====================================================

CREATE POLICY "Only corporativo admin can view capacity status"
  ON capacity_engine_status FOR SELECT
  USING (public.is_corporativo_admin());

CREATE POLICY "Only corporativo admin can manage capacity status"
  ON capacity_engine_status FOR ALL
  USING (public.is_corporativo_admin());

-- =====================================================
-- CERTIFICATE PRODUCTS V2 - Admin Only Management
-- =====================================================

CREATE POLICY "Only corporativo admin can manage certificate products"
  ON certificate_products_v2 FOR ALL
  USING (public.is_corporativo_admin());

-- =====================================================
-- BETA CONFIG - Admin Only Management
-- =====================================================

CREATE POLICY "Only corporativo admin can manage beta config"
  ON beta_config FOR ALL
  USING (public.is_corporativo_admin());

-- =====================================================
-- ADMIN AUDIT LOG - Admin Only Access
-- =====================================================

-- Admin can view all audit logs
CREATE POLICY "Only corporativo admin can view audit logs"
  ON admin_audit_log FOR SELECT
  USING (public.is_corporativo_admin());

-- System (service role) can insert audit logs
-- No UPDATE or DELETE allowed (immutable audit trail)

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.is_corporativo_admin() IS 
'Strict admin check - only corporativo@morises.com with active super_admin role in admin_users table';

COMMENT ON POLICY "Only corporativo admin can view admin users" ON admin_users IS 
'Admin access restricted to corporativo@morises.com via Google OAuth only';

COMMENT ON POLICY "Only corporativo admin can manage admin users" ON admin_users IS 
'Only corporativo@morises.com can create/modify admin users';
