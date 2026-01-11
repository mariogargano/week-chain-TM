-- Script to improve audit log system
-- Version: 1.0.0
-- Description: Add RLS, indexes, and enum types for audit logs

-- Add RLS to audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role and admins can insert audit logs
CREATE POLICY "Service and admins can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'management')
    )
  );

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'System-wide audit trail for critical actions and security events';
