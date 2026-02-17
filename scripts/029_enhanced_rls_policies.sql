-- =====================================================
-- WEEK-CHAIN™ - Enhanced Row Level Security Policies
-- =====================================================
-- Políticas RLS adicionales para tablas críticas
-- Asegura que usuarios solo vean sus propios datos
-- =====================================================

-- Habilitar RLS en tablas que aún no lo tienen
ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legal_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nft_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BOOKINGS - Usuarios ven solo sus propias reservas
-- =====================================================

-- Política de lectura: usuarios ven solo sus bookings
CREATE POLICY "bookings_select_own" ON bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Política de inserción: usuarios pueden crear sus propios bookings
CREATE POLICY "bookings_insert_own" ON bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de actualización: solo a través de funciones seguras o service role
CREATE POLICY "bookings_update_restricted" ON bookings
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND status IN ('pending', 'confirmed')
);

-- Admins pueden ver todos los bookings
CREATE POLICY "bookings_admin_all" ON bookings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'management')
  )
);

-- =====================================================
-- LEGAL CONTRACTS - Usuarios ven solo sus contratos
-- =====================================================

-- Política de lectura: usuarios ven solo sus contratos
CREATE POLICY "legal_contracts_select_own" ON legal_contracts
FOR SELECT
USING (auth.uid() = user_id);

-- Política de inserción: solo service role o funciones seguras
CREATE POLICY "legal_contracts_insert_restricted" ON legal_contracts
FOR INSERT
WITH CHECK (false); -- Solo a través de funciones o service role

-- Admins y notarios pueden ver todos los contratos
CREATE POLICY "legal_contracts_admin_notary_all" ON legal_contracts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'notaria', 'management')
  )
);

-- =====================================================
-- NFT MINTS - Usuarios ven solo sus NFTs
-- =====================================================

-- Política de lectura: usuarios ven solo sus NFTs
CREATE POLICY "nft_mints_select_own" ON nft_mints
FOR SELECT
USING (auth.uid() = owner_id);

-- Política de inserción: solo service role
CREATE POLICY "nft_mints_insert_restricted" ON nft_mints
FOR INSERT
WITH CHECK (false); -- Solo a través de service role

-- Admins pueden ver todos los NFTs
CREATE POLICY "nft_mints_admin_all" ON nft_mints
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'management')
  )
);

-- =====================================================
-- KYC VERIFICATIONS - Usuarios ven solo su KYC
-- =====================================================

-- Política de lectura: usuarios ven solo su KYC
CREATE POLICY "kyc_select_own" ON kyc_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Política de inserción: usuarios pueden crear su propio KYC
CREATE POLICY "kyc_insert_own" ON kyc_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de actualización: solo admins y compliance
CREATE POLICY "kyc_update_admin" ON kyc_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'compliance')
  )
);

-- =====================================================
-- WALLET TRANSACTIONS - Usuarios ven solo sus transacciones
-- =====================================================

-- Política de lectura: usuarios ven solo sus transacciones
CREATE POLICY "wallet_transactions_select_own" ON wallet_transactions
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = from_user_id 
  OR auth.uid() = to_user_id
);

-- Política de inserción: solo a través de funciones seguras
CREATE POLICY "wallet_transactions_insert_restricted" ON wallet_transactions
FOR INSERT
WITH CHECK (false); -- Solo a través de funciones o service role

-- Admins pueden ver todas las transacciones
CREATE POLICY "wallet_transactions_admin_all" ON wallet_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'finance')
  )
);

-- =====================================================
-- FUNCIONES HELPER PARA VERIFICAR PERMISOS
-- =====================================================

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'management')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es el propietario
CREATE OR REPLACE FUNCTION is_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar rol específico
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS RLS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_contracts_user_id ON legal_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_owner_id ON nft_mints(owner_id);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- AUDITORÍA DE ACCESOS
-- =====================================================

CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver el log de auditoría
CREATE POLICY "security_audit_admin_only" ON security_audit_log
FOR SELECT
USING (is_admin());

-- Función para registrar accesos
CREATE OR REPLACE FUNCTION log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    success,
    error_message
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_success,
    p_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE security_audit_log IS 'Registro de auditoría de accesos y acciones de seguridad';
COMMENT ON FUNCTION log_security_event IS 'Registra eventos de seguridad para auditoría y compliance';
