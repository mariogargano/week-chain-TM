-- Audit Logs Table for WEEK-CHAIN
-- Run this migration in Supabase Dashboard

-- Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Política RLS (solo admin puede leer)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;

-- Create policy for admin access
CREATE POLICY "Admin can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM admin_users WHERE role = 'admin'
    )
    OR
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
  );

-- Allow insert for authenticated users (to log their own actions)
DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;

CREATE POLICY "Users can insert own audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE audit_logs IS 'Registro de auditoría para todas las acciones críticas en WEEK-CHAIN';
