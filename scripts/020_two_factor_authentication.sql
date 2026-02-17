-- =====================================================
-- WEEK-CHAIN™ - Two-Factor Authentication System
-- =====================================================
-- Descripción: Sistema de autenticación de dos factores
-- Autor: WEEK-CHAIN Development Team
-- Fecha: 2025-01-29
-- =====================================================

-- Tabla para almacenar configuración 2FA de usuarios
CREATE TABLE IF NOT EXISTS user_two_factor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    secret TEXT NOT NULL, -- TOTP secret (encrypted)
    backup_codes TEXT[], -- Array de códigos de respaldo
    enabled BOOLEAN DEFAULT false,
    enabled_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índices
CREATE INDEX idx_user_two_factor_user_id ON user_two_factor(user_id);
CREATE INDEX idx_user_two_factor_enabled ON user_two_factor(enabled) WHERE enabled = true;

-- RLS Policies
ALTER TABLE user_two_factor ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propia configuración 2FA
CREATE POLICY "Users can view own 2FA config"
    ON user_two_factor
    FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden insertar su propia configuración 2FA
CREATE POLICY "Users can insert own 2FA config"
    ON user_two_factor
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propia configuración 2FA
CREATE POLICY "Users can update own 2FA config"
    ON user_two_factor
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins pueden ver todas las configuraciones 2FA
CREATE POLICY "Admins can view all 2FA configs"
    ON user_two_factor
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Función para verificar si un usuario tiene 2FA habilitado
CREATE OR REPLACE FUNCTION has_two_factor_enabled(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_two_factor
        WHERE user_id = user_uuid
        AND enabled = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para requerir 2FA para roles específicos
CREATE OR REPLACE FUNCTION require_two_factor_for_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si el usuario tiene un rol que requiere 2FA
    IF NEW.role IN ('admin', 'super_admin', 'management', 'notaria') THEN
        -- Verificar si tiene 2FA habilitado
        IF NOT has_two_factor_enabled(NEW.id) THEN
            RAISE EXCEPTION '2FA is required for % role', NEW.role;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar 2FA al cambiar rol
CREATE TRIGGER check_two_factor_on_role_change
    BEFORE UPDATE OF role ON users
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION require_two_factor_for_role();

-- Tabla de auditoría para intentos de 2FA
CREATE TABLE IF NOT EXISTS two_factor_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'setup', 'enable', 'disable', 'verify_success', 'verify_fail'
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para auditoría
CREATE INDEX idx_two_factor_audit_user_id ON two_factor_audit_log(user_id);
CREATE INDEX idx_two_factor_audit_created_at ON two_factor_audit_log(created_at DESC);
CREATE INDEX idx_two_factor_audit_action ON two_factor_audit_log(action);

-- RLS para auditoría
ALTER TABLE two_factor_audit_log ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio log de auditoría
CREATE POLICY "Users can view own 2FA audit log"
    ON two_factor_audit_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins pueden ver todos los logs
CREATE POLICY "Admins can view all 2FA audit logs"
    ON two_factor_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Sistema puede insertar logs
CREATE POLICY "System can insert 2FA audit logs"
    ON two_factor_audit_log
    FOR INSERT
    WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE user_two_factor IS 'Configuración de autenticación de dos factores por usuario';
COMMENT ON TABLE two_factor_audit_log IS 'Log de auditoría de eventos 2FA';
COMMENT ON FUNCTION has_two_factor_enabled IS 'Verifica si un usuario tiene 2FA habilitado';
COMMENT ON FUNCTION require_two_factor_for_role IS 'Requiere 2FA para roles específicos';
