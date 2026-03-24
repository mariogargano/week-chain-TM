-- =====================================================
-- WEEK-CHAIN RBAC - Role-Based Access Control System
-- Matriz completa de permisos segun documento arquitectura
-- =====================================================

-- 1. ROLES ENUM (expanded from document)
DO $$ BEGIN
  CREATE TYPE user_role_v2 AS ENUM (
    'super_admin',
    'admin',
    'legal',
    'compliance',
    'finance',
    'treasury',
    'operations',
    'service',
    'sales',
    'marketing',
    'agent_manager',
    'agent_external',
    'broker',
    'broker_elite',
    'owner_portal',
    'partner',
    'notaria',
    'of_counsel',
    'auditor',
    'readonly',
    'user',
    'member'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. RESOURCES ENUM
DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM (
    'users',
    'leads',
    'holders',
    'svc_certificates',
    'properties',
    'weeks',
    'requests',
    'offers',
    'bookings',
    'payments',
    'escrow',
    'commissions',
    'payouts',
    'contracts',
    'compliance_records',
    'kyc_records',
    'incidents',
    'reviews',
    'reports',
    'system_config',
    'audit_logs',
    'alerts',
    'workflows',
    'integrations'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. ACTIONS ENUM
DO $$ BEGIN
  CREATE TYPE action_type AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'approve',
    'reject',
    'export',
    'import',
    'execute',
    'configure',
    'audit'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS rbac_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

-- 5. ROLE HIERARCHY TABLE
CREATE TABLE IF NOT EXISTS rbac_role_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_role TEXT NOT NULL,
  child_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_role, child_role)
);

-- 6. USER ROLE ASSIGNMENTS (extends users table)
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, role)
);

-- 7. ACCESS LOGS TABLE
CREATE TABLE IF NOT EXISTS rbac_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_id UUID,
  allowed BOOLEAN NOT NULL,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rbac_permissions_role ON rbac_permissions(role);
CREATE INDEX IF NOT EXISTS idx_rbac_permissions_resource ON rbac_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_access_logs_user ON rbac_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_access_logs_created ON rbac_access_logs(created_at DESC);

-- =====================================================
-- 8. POPULATE PERMISSIONS MATRIX (from document)
-- =====================================================

-- Clear existing permissions for clean insert
TRUNCATE rbac_permissions CASCADE;

-- SUPER_ADMIN - Full access to everything
INSERT INTO rbac_permissions (role, resource, action) VALUES
('super_admin', 'users', 'create'), ('super_admin', 'users', 'read'), ('super_admin', 'users', 'update'), ('super_admin', 'users', 'delete'), ('super_admin', 'users', 'approve'),
('super_admin', 'leads', 'create'), ('super_admin', 'leads', 'read'), ('super_admin', 'leads', 'update'), ('super_admin', 'leads', 'delete'),
('super_admin', 'holders', 'create'), ('super_admin', 'holders', 'read'), ('super_admin', 'holders', 'update'), ('super_admin', 'holders', 'delete'),
('super_admin', 'svc_certificates', 'create'), ('super_admin', 'svc_certificates', 'read'), ('super_admin', 'svc_certificates', 'update'), ('super_admin', 'svc_certificates', 'delete'), ('super_admin', 'svc_certificates', 'approve'),
('super_admin', 'properties', 'create'), ('super_admin', 'properties', 'read'), ('super_admin', 'properties', 'update'), ('super_admin', 'properties', 'delete'), ('super_admin', 'properties', 'approve'),
('super_admin', 'weeks', 'create'), ('super_admin', 'weeks', 'read'), ('super_admin', 'weeks', 'update'), ('super_admin', 'weeks', 'delete'),
('super_admin', 'requests', 'create'), ('super_admin', 'requests', 'read'), ('super_admin', 'requests', 'update'), ('super_admin', 'requests', 'delete'), ('super_admin', 'requests', 'approve'),
('super_admin', 'offers', 'create'), ('super_admin', 'offers', 'read'), ('super_admin', 'offers', 'update'), ('super_admin', 'offers', 'delete'), ('super_admin', 'offers', 'approve'),
('super_admin', 'bookings', 'create'), ('super_admin', 'bookings', 'read'), ('super_admin', 'bookings', 'update'), ('super_admin', 'bookings', 'delete'), ('super_admin', 'bookings', 'approve'),
('super_admin', 'payments', 'create'), ('super_admin', 'payments', 'read'), ('super_admin', 'payments', 'update'), ('super_admin', 'payments', 'approve'),
('super_admin', 'escrow', 'create'), ('super_admin', 'escrow', 'read'), ('super_admin', 'escrow', 'update'), ('super_admin', 'escrow', 'approve'),
('super_admin', 'commissions', 'create'), ('super_admin', 'commissions', 'read'), ('super_admin', 'commissions', 'update'), ('super_admin', 'commissions', 'approve'),
('super_admin', 'payouts', 'create'), ('super_admin', 'payouts', 'read'), ('super_admin', 'payouts', 'update'), ('super_admin', 'payouts', 'approve'),
('super_admin', 'contracts', 'create'), ('super_admin', 'contracts', 'read'), ('super_admin', 'contracts', 'update'), ('super_admin', 'contracts', 'approve'),
('super_admin', 'compliance_records', 'create'), ('super_admin', 'compliance_records', 'read'), ('super_admin', 'compliance_records', 'update'), ('super_admin', 'compliance_records', 'approve'),
('super_admin', 'kyc_records', 'create'), ('super_admin', 'kyc_records', 'read'), ('super_admin', 'kyc_records', 'update'), ('super_admin', 'kyc_records', 'approve'),
('super_admin', 'incidents', 'create'), ('super_admin', 'incidents', 'read'), ('super_admin', 'incidents', 'update'), ('super_admin', 'incidents', 'delete'),
('super_admin', 'reviews', 'create'), ('super_admin', 'reviews', 'read'), ('super_admin', 'reviews', 'update'), ('super_admin', 'reviews', 'delete'),
('super_admin', 'reports', 'create'), ('super_admin', 'reports', 'read'), ('super_admin', 'reports', 'export'),
('super_admin', 'system_config', 'create'), ('super_admin', 'system_config', 'read'), ('super_admin', 'system_config', 'update'), ('super_admin', 'system_config', 'configure'),
('super_admin', 'audit_logs', 'read'), ('super_admin', 'audit_logs', 'export'),
('super_admin', 'alerts', 'create'), ('super_admin', 'alerts', 'read'), ('super_admin', 'alerts', 'update'),
('super_admin', 'workflows', 'create'), ('super_admin', 'workflows', 'read'), ('super_admin', 'workflows', 'update'), ('super_admin', 'workflows', 'execute'),
('super_admin', 'integrations', 'create'), ('super_admin', 'integrations', 'read'), ('super_admin', 'integrations', 'update'), ('super_admin', 'integrations', 'configure');

-- ADMIN - Almost full access, no system_config delete
INSERT INTO rbac_permissions (role, resource, action) VALUES
('admin', 'users', 'create'), ('admin', 'users', 'read'), ('admin', 'users', 'update'), ('admin', 'users', 'approve'),
('admin', 'leads', 'create'), ('admin', 'leads', 'read'), ('admin', 'leads', 'update'), ('admin', 'leads', 'delete'),
('admin', 'holders', 'create'), ('admin', 'holders', 'read'), ('admin', 'holders', 'update'),
('admin', 'svc_certificates', 'create'), ('admin', 'svc_certificates', 'read'), ('admin', 'svc_certificates', 'update'), ('admin', 'svc_certificates', 'approve'),
('admin', 'properties', 'create'), ('admin', 'properties', 'read'), ('admin', 'properties', 'update'), ('admin', 'properties', 'approve'),
('admin', 'weeks', 'create'), ('admin', 'weeks', 'read'), ('admin', 'weeks', 'update'),
('admin', 'requests', 'create'), ('admin', 'requests', 'read'), ('admin', 'requests', 'update'), ('admin', 'requests', 'approve'),
('admin', 'offers', 'create'), ('admin', 'offers', 'read'), ('admin', 'offers', 'update'), ('admin', 'offers', 'approve'),
('admin', 'bookings', 'create'), ('admin', 'bookings', 'read'), ('admin', 'bookings', 'update'), ('admin', 'bookings', 'approve'),
('admin', 'payments', 'read'), ('admin', 'payments', 'update'), ('admin', 'payments', 'approve'),
('admin', 'escrow', 'read'), ('admin', 'escrow', 'update'), ('admin', 'escrow', 'approve'),
('admin', 'commissions', 'read'), ('admin', 'commissions', 'update'), ('admin', 'commissions', 'approve'),
('admin', 'payouts', 'read'), ('admin', 'payouts', 'approve'),
('admin', 'contracts', 'create'), ('admin', 'contracts', 'read'), ('admin', 'contracts', 'update'), ('admin', 'contracts', 'approve'),
('admin', 'compliance_records', 'read'), ('admin', 'compliance_records', 'update'), ('admin', 'compliance_records', 'approve'),
('admin', 'kyc_records', 'read'), ('admin', 'kyc_records', 'update'), ('admin', 'kyc_records', 'approve'),
('admin', 'incidents', 'create'), ('admin', 'incidents', 'read'), ('admin', 'incidents', 'update'),
('admin', 'reviews', 'read'), ('admin', 'reviews', 'update'),
('admin', 'reports', 'read'), ('admin', 'reports', 'export'),
('admin', 'system_config', 'read'), ('admin', 'system_config', 'update'),
('admin', 'audit_logs', 'read'),
('admin', 'alerts', 'read'), ('admin', 'alerts', 'update'),
('admin', 'workflows', 'read'), ('admin', 'workflows', 'execute');

-- LEGAL - Contracts, compliance, KYC focus
INSERT INTO rbac_permissions (role, resource, action) VALUES
('legal', 'users', 'read'),
('legal', 'holders', 'read'),
('legal', 'svc_certificates', 'read'),
('legal', 'properties', 'read'),
('legal', 'contracts', 'create'), ('legal', 'contracts', 'read'), ('legal', 'contracts', 'update'), ('legal', 'contracts', 'approve'),
('legal', 'compliance_records', 'create'), ('legal', 'compliance_records', 'read'), ('legal', 'compliance_records', 'update'), ('legal', 'compliance_records', 'approve'),
('legal', 'kyc_records', 'read'), ('legal', 'kyc_records', 'update'), ('legal', 'kyc_records', 'approve'),
('legal', 'incidents', 'read'), ('legal', 'incidents', 'update'),
('legal', 'reports', 'read'), ('legal', 'reports', 'export'),
('legal', 'audit_logs', 'read');

-- COMPLIANCE - KYC, AML, PROFECO focus
INSERT INTO rbac_permissions (role, resource, action) VALUES
('compliance', 'users', 'read'),
('compliance', 'holders', 'read'),
('compliance', 'svc_certificates', 'read'),
('compliance', 'contracts', 'read'),
('compliance', 'compliance_records', 'create'), ('compliance', 'compliance_records', 'read'), ('compliance', 'compliance_records', 'update'), ('compliance', 'compliance_records', 'approve'),
('compliance', 'kyc_records', 'create'), ('compliance', 'kyc_records', 'read'), ('compliance', 'kyc_records', 'update'), ('compliance', 'kyc_records', 'approve'),
('compliance', 'incidents', 'read'),
('compliance', 'reports', 'read'), ('compliance', 'reports', 'export'),
('compliance', 'audit_logs', 'read'),
('compliance', 'alerts', 'read'), ('compliance', 'alerts', 'update');

-- FINANCE - Payments, escrow, commissions, payouts
INSERT INTO rbac_permissions (role, resource, action) VALUES
('finance', 'users', 'read'),
('finance', 'holders', 'read'),
('finance', 'svc_certificates', 'read'),
('finance', 'bookings', 'read'),
('finance', 'payments', 'create'), ('finance', 'payments', 'read'), ('finance', 'payments', 'update'), ('finance', 'payments', 'approve'),
('finance', 'escrow', 'create'), ('finance', 'escrow', 'read'), ('finance', 'escrow', 'update'), ('finance', 'escrow', 'approve'),
('finance', 'commissions', 'create'), ('finance', 'commissions', 'read'), ('finance', 'commissions', 'update'), ('finance', 'commissions', 'approve'),
('finance', 'payouts', 'create'), ('finance', 'payouts', 'read'), ('finance', 'payouts', 'update'), ('finance', 'payouts', 'approve'),
('finance', 'reports', 'create'), ('finance', 'reports', 'read'), ('finance', 'reports', 'export'),
('finance', 'audit_logs', 'read');

-- TREASURY - Similar to finance but with execute permissions
INSERT INTO rbac_permissions (role, resource, action) VALUES
('treasury', 'payments', 'read'), ('treasury', 'payments', 'approve'), ('treasury', 'payments', 'execute'),
('treasury', 'escrow', 'read'), ('treasury', 'escrow', 'approve'), ('treasury', 'escrow', 'execute'),
('treasury', 'payouts', 'read'), ('treasury', 'payouts', 'approve'), ('treasury', 'payouts', 'execute'),
('treasury', 'reports', 'read'), ('treasury', 'reports', 'export');

-- OPERATIONS - Properties, weeks, bookings
INSERT INTO rbac_permissions (role, resource, action) VALUES
('operations', 'users', 'read'),
('operations', 'holders', 'read'),
('operations', 'properties', 'create'), ('operations', 'properties', 'read'), ('operations', 'properties', 'update'),
('operations', 'weeks', 'create'), ('operations', 'weeks', 'read'), ('operations', 'weeks', 'update'),
('operations', 'requests', 'read'), ('operations', 'requests', 'update'),
('operations', 'offers', 'create'), ('operations', 'offers', 'read'), ('operations', 'offers', 'update'),
('operations', 'bookings', 'create'), ('operations', 'bookings', 'read'), ('operations', 'bookings', 'update'),
('operations', 'incidents', 'create'), ('operations', 'incidents', 'read'), ('operations', 'incidents', 'update'),
('operations', 'reports', 'read'),
('operations', 'alerts', 'read'), ('operations', 'alerts', 'update');

-- SERVICE - Guest services, incidents, reviews
INSERT INTO rbac_permissions (role, resource, action) VALUES
('service', 'users', 'read'),
('service', 'holders', 'read'),
('service', 'bookings', 'read'), ('service', 'bookings', 'update'),
('service', 'incidents', 'create'), ('service', 'incidents', 'read'), ('service', 'incidents', 'update'),
('service', 'reviews', 'read'), ('service', 'reviews', 'update'),
('service', 'alerts', 'read');

-- SALES - Leads, holders, SVC certificates
INSERT INTO rbac_permissions (role, resource, action) VALUES
('sales', 'users', 'read'),
('sales', 'leads', 'create'), ('sales', 'leads', 'read'), ('sales', 'leads', 'update'),
('sales', 'holders', 'read'),
('sales', 'svc_certificates', 'create'), ('sales', 'svc_certificates', 'read'),
('sales', 'properties', 'read'),
('sales', 'weeks', 'read'),
('sales', 'commissions', 'read'),
('sales', 'reports', 'read');

-- BROKER - External sales agents
INSERT INTO rbac_permissions (role, resource, action) VALUES
('broker', 'leads', 'create'), ('broker', 'leads', 'read'), ('broker', 'leads', 'update'),
('broker', 'holders', 'read'),
('broker', 'svc_certificates', 'read'),
('broker', 'properties', 'read'),
('broker', 'weeks', 'read'),
('broker', 'commissions', 'read'),
('broker', 'reports', 'read');

-- BROKER_ELITE - Higher tier broker with more access
INSERT INTO rbac_permissions (role, resource, action) VALUES
('broker_elite', 'leads', 'create'), ('broker_elite', 'leads', 'read'), ('broker_elite', 'leads', 'update'),
('broker_elite', 'holders', 'read'),
('broker_elite', 'svc_certificates', 'create'), ('broker_elite', 'svc_certificates', 'read'),
('broker_elite', 'properties', 'read'),
('broker_elite', 'weeks', 'read'),
('broker_elite', 'requests', 'create'), ('broker_elite', 'requests', 'read'),
('broker_elite', 'offers', 'read'),
('broker_elite', 'commissions', 'read'),
('broker_elite', 'reports', 'read'), ('broker_elite', 'reports', 'export');

-- OWNER_PORTAL - Property owners
INSERT INTO rbac_permissions (role, resource, action) VALUES
('owner_portal', 'properties', 'read'), ('owner_portal', 'properties', 'update'),
('owner_portal', 'weeks', 'read'), ('owner_portal', 'weeks', 'update'),
('owner_portal', 'bookings', 'read'),
('owner_portal', 'payments', 'read'),
('owner_portal', 'reports', 'read'),
('owner_portal', 'incidents', 'read');

-- MEMBER/USER - Basic holder access
INSERT INTO rbac_permissions (role, resource, action) VALUES
('member', 'svc_certificates', 'read'),
('member', 'properties', 'read'),
('member', 'weeks', 'read'),
('member', 'requests', 'create'), ('member', 'requests', 'read'),
('member', 'offers', 'read'),
('member', 'bookings', 'read'),
('member', 'incidents', 'create'), ('member', 'incidents', 'read'),
('member', 'reviews', 'create'), ('member', 'reviews', 'read');

INSERT INTO rbac_permissions (role, resource, action) VALUES
('user', 'svc_certificates', 'read'),
('user', 'properties', 'read'),
('user', 'weeks', 'read'),
('user', 'requests', 'create'), ('user', 'requests', 'read'),
('user', 'offers', 'read'),
('user', 'bookings', 'read'),
('user', 'incidents', 'create'), ('user', 'incidents', 'read'),
('user', 'reviews', 'create'), ('user', 'reviews', 'read');

-- AUDITOR - Read-only access to everything
INSERT INTO rbac_permissions (role, resource, action) VALUES
('auditor', 'users', 'read'),
('auditor', 'leads', 'read'),
('auditor', 'holders', 'read'),
('auditor', 'svc_certificates', 'read'),
('auditor', 'properties', 'read'),
('auditor', 'weeks', 'read'),
('auditor', 'requests', 'read'),
('auditor', 'offers', 'read'),
('auditor', 'bookings', 'read'),
('auditor', 'payments', 'read'),
('auditor', 'escrow', 'read'),
('auditor', 'commissions', 'read'),
('auditor', 'payouts', 'read'),
('auditor', 'contracts', 'read'),
('auditor', 'compliance_records', 'read'),
('auditor', 'kyc_records', 'read'),
('auditor', 'incidents', 'read'),
('auditor', 'reviews', 'read'),
('auditor', 'reports', 'read'), ('auditor', 'reports', 'export'),
('auditor', 'audit_logs', 'read'), ('auditor', 'audit_logs', 'export'),
('auditor', 'alerts', 'read');

-- =====================================================
-- 9. ROLE HIERARCHY
-- =====================================================

INSERT INTO rbac_role_hierarchy (parent_role, child_role) VALUES
('super_admin', 'admin'),
('admin', 'legal'),
('admin', 'compliance'),
('admin', 'finance'),
('admin', 'operations'),
('admin', 'service'),
('admin', 'sales'),
('finance', 'treasury'),
('sales', 'broker_elite'),
('broker_elite', 'broker'),
('operations', 'agent_manager'),
('agent_manager', 'agent_external')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. RBAC FUNCTIONS
-- =====================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_role TEXT;
  v_has_permission BOOLEAN := FALSE;
BEGIN
  -- Get user's role from users table
  SELECT role INTO v_user_role FROM public.users WHERE id = p_user_id;
  
  IF v_user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check direct permission
  SELECT EXISTS(
    SELECT 1 FROM rbac_permissions 
    WHERE role = v_user_role 
    AND resource = p_resource 
    AND action = p_action
  ) INTO v_has_permission;
  
  IF v_has_permission THEN
    RETURN TRUE;
  END IF;
  
  -- Check inherited permissions through hierarchy
  SELECT EXISTS(
    SELECT 1 FROM rbac_permissions p
    JOIN rbac_role_hierarchy h ON p.role = h.parent_role
    WHERE h.child_role = v_user_role
    AND p.resource = p_resource
    AND p.action = p_action
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log access attempt
CREATE OR REPLACE FUNCTION log_access(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_allowed BOOLEAN DEFAULT FALSE,
  p_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO rbac_access_logs (user_id, resource, action, resource_id, allowed, reason)
  VALUES (p_user_id, p_resource, p_action, p_resource_id, p_allowed, p_reason)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a role (including inherited)
CREATE OR REPLACE FUNCTION get_role_permissions(p_role TEXT)
RETURNS TABLE (resource TEXT, action TEXT, inherited_from TEXT) AS $$
BEGIN
  RETURN QUERY
  -- Direct permissions
  SELECT p.resource, p.action, p.role as inherited_from
  FROM rbac_permissions p
  WHERE p.role = p_role
  
  UNION
  
  -- Inherited permissions
  SELECT p.resource, p.action, h.parent_role as inherited_from
  FROM rbac_permissions p
  JOIN rbac_role_hierarchy h ON p.role = h.parent_role
  WHERE h.child_role = p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. RLS POLICIES FOR RBAC TABLES
-- =====================================================

ALTER TABLE rbac_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_access_logs ENABLE ROW LEVEL SECURITY;

-- Admins can manage permissions
CREATE POLICY "Admins can manage permissions" ON rbac_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage role hierarchy" ON rbac_role_hierarchy
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage role assignments" ON user_role_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can see own role assignments" ON user_role_assignments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view access logs" ON rbac_access_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'auditor'))
  );

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION check_permission TO authenticated;
GRANT EXECUTE ON FUNCTION log_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_role_permissions TO authenticated;
