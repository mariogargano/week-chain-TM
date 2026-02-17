-- =====================================================
-- WEEK-CHAIN: Sistema Completo de Contratos Legales
-- Para cumplimiento PROFECO y test run de producción
-- =====================================================

-- 1. TABLA: Documentos Legales Versionados
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(100) NOT NULL, -- 'terms_and_conditions', 'privacy_policy', 'contract_template'
    version VARCHAR(20) NOT NULL, -- '1.0', '1.1', '2.0'
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Contenido completo del documento
    effective_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    requires_acceptance BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    UNIQUE(document_type, version)
);

CREATE INDEX idx_legal_documents_active ON legal_documents(document_type, is_active) WHERE is_active = true;

-- 2. TABLA: Aceptaciones de Términos con Evidencia Click-Wrap
CREATE TABLE IF NOT EXISTS user_legal_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES legal_documents(id),
    document_type VARCHAR(100) NOT NULL,
    document_version VARCHAR(20) NOT NULL,
    
    -- Evidencia click-wrap completa
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    scroll_percentage INTEGER CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100),
    time_spent_seconds INTEGER, -- Tiempo que el usuario pasó leyendo
    explicit_checkbox_checked BOOLEAN DEFAULT true,
    
    -- Metadata adicional
    acceptance_method VARCHAR(50) DEFAULT 'web_clickwrap', -- 'web_clickwrap', 'mobile_app', 'api'
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    
    UNIQUE(user_id, document_id)
);

CREATE INDEX idx_user_legal_acceptances_user ON user_legal_acceptances(user_id);
CREATE INDEX idx_user_legal_acceptances_document ON user_legal_acceptances(document_id);

-- 3. TABLA: Vouchers de Certificados con Código Único
CREATE TABLE IF NOT EXISTS certificate_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code VARCHAR(50) UNIQUE NOT NULL, -- Formato: WC-2024-XXXX-XXXX
    
    -- Referencias
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    certificate_purchase_id UUID, -- Referencia a la compra
    certificate_product_id UUID, -- Referencia al producto
    
    -- Datos del certificado
    certificate_type VARCHAR(100) NOT NULL, -- 'essential_24', 'preferred_36', etc.
    certificate_name VARCHAR(255) NOT NULL,
    validity_years INTEGER NOT NULL DEFAULT 15,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    
    -- Datos de pago
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50), -- 'stripe', 'conekta_card', 'conekta_oxxo'
    payment_date TIMESTAMPTZ NOT NULL,
    payment_reference VARCHAR(255),
    
    -- Datos del titular
    holder_full_name VARCHAR(255) NOT NULL,
    holder_email VARCHAR(255) NOT NULL,
    holder_phone VARCHAR(50),
    holder_country VARCHAR(100),
    
    -- Estado y tracking
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'revoked', 'suspended'
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    pdf_generated BOOLEAN DEFAULT false,
    pdf_url TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificate_vouchers_user ON certificate_vouchers(user_id);
CREATE INDEX idx_certificate_vouchers_code ON certificate_vouchers(voucher_code);
CREATE INDEX idx_certificate_vouchers_status ON certificate_vouchers(status);

-- 4. TABLA: Solicitudes de Factura
CREATE TABLE IF NOT EXISTS invoice_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES certificate_vouchers(id) ON DELETE CASCADE,
    
    -- Datos fiscales (México SAT)
    rfc VARCHAR(13) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    regimen_fiscal VARCHAR(10) NOT NULL, -- '601', '612', etc.
    uso_cfdi VARCHAR(10) NOT NULL, -- 'G01', 'G03', etc.
    
    -- Domicilio fiscal
    calle VARCHAR(255) NOT NULL,
    numero_exterior VARCHAR(50) NOT NULL,
    numero_interior VARCHAR(50),
    colonia VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pais VARCHAR(100) DEFAULT 'México',
    
    -- Datos de contacto
    email_facturacion VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    
    -- Estado de la factura
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'issued', 'rejected'
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    issued_at TIMESTAMPTZ,
    
    -- Datos de la factura emitida
    factura_uuid UUID,
    factura_folio VARCHAR(100),
    factura_serie VARCHAR(50),
    factura_pdf_url TEXT,
    factura_xml_url TEXT,
    
    -- Notas y errores
    notes TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_requests_user ON invoice_requests(user_id);
CREATE INDEX idx_invoice_requests_voucher ON invoice_requests(voucher_id);
CREATE INDEX idx_invoice_requests_status ON invoice_requests(status);

-- 5. TABLA: Audit Log de Contratos
CREATE TABLE IF NOT EXISTS contract_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action_type VARCHAR(100) NOT NULL, -- 'terms_accepted', 'voucher_generated', 'invoice_requested'
    entity_type VARCHAR(50) NOT NULL, -- 'legal_document', 'voucher', 'invoice'
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contract_audit_log_user ON contract_audit_log(user_id);
CREATE INDEX idx_contract_audit_log_action ON contract_audit_log(action_type);
CREATE INDEX idx_contract_audit_log_created ON contract_audit_log(created_at);

-- =====================================================
-- FUNCIONES HELPER
-- =====================================================

-- Función para generar código único de voucher
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_code VARCHAR(50);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Formato: WC-2024-XXXX-XXXX
        new_code := 'WC-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        SELECT EXISTS(SELECT 1 FROM certificate_vouchers WHERE voucher_code = new_code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Función para validar aceptación de términos antes de compra
CREATE OR REPLACE FUNCTION validate_terms_acceptance(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    terms_accepted BOOLEAN;
    privacy_accepted BOOLEAN;
BEGIN
    -- Verificar aceptación de términos y condiciones
    SELECT EXISTS(
        SELECT 1 FROM user_legal_acceptances ula
        JOIN legal_documents ld ON ula.document_id = ld.id
        WHERE ula.user_id = p_user_id 
        AND ld.document_type = 'terms_and_conditions'
        AND ld.is_active = true
        AND ula.is_valid = true
    ) INTO terms_accepted;
    
    -- Verificar aceptación de aviso de privacidad
    SELECT EXISTS(
        SELECT 1 FROM user_legal_acceptances ula
        JOIN legal_documents ld ON ula.document_id = ld.id
        WHERE ula.user_id = p_user_id 
        AND ld.document_type = 'privacy_policy'
        AND ld.is_active = true
        AND ula.is_valid = true
    ) INTO privacy_accepted;
    
    RETURN terms_accepted AND privacy_accepted;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para audit log cuando se acepta un documento legal
CREATE OR REPLACE FUNCTION log_legal_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO contract_audit_log (
        user_id, action_type, entity_type, entity_id, 
        details, ip_address, user_agent
    ) VALUES (
        NEW.user_id, 'terms_accepted', 'legal_document', NEW.document_id,
        jsonb_build_object(
            'document_type', NEW.document_type,
            'document_version', NEW.document_version,
            'scroll_percentage', NEW.scroll_percentage,
            'time_spent_seconds', NEW.time_spent_seconds
        ),
        NEW.ip_address, NEW.user_agent
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_legal_acceptance
    AFTER INSERT ON user_legal_acceptances
    FOR EACH ROW
    EXECUTE FUNCTION log_legal_acceptance();

-- Trigger para audit log cuando se genera voucher
CREATE OR REPLACE FUNCTION log_voucher_generation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO contract_audit_log (
        user_id, action_type, entity_type, entity_id,
        details
    ) VALUES (
        NEW.user_id, 'voucher_generated', 'voucher', NEW.id,
        jsonb_build_object(
            'voucher_code', NEW.voucher_code,
            'certificate_type', NEW.certificate_type,
            'payment_amount', NEW.payment_amount,
            'payment_currency', NEW.payment_currency
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_voucher_generation
    AFTER INSERT ON certificate_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION log_voucher_generation();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Legal Documents: Todos pueden leer documentos activos
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "legal_documents_public_read" ON legal_documents
    FOR SELECT USING (is_active = true);

CREATE POLICY "legal_documents_admin_all" ON legal_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- User Legal Acceptances: Solo el usuario puede ver sus aceptaciones
ALTER TABLE user_legal_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_legal_acceptances_own_read" ON user_legal_acceptances
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_legal_acceptances_own_insert" ON user_legal_acceptances
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_legal_acceptances_admin_all" ON user_legal_acceptances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Certificate Vouchers: Usuario puede ver sus propios vouchers
ALTER TABLE certificate_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificate_vouchers_own_read" ON certificate_vouchers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "certificate_vouchers_admin_all" ON certificate_vouchers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Invoice Requests: Usuario puede ver y crear sus propias solicitudes
ALTER TABLE invoice_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_requests_own_read" ON invoice_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "invoice_requests_own_insert" ON invoice_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoice_requests_admin_all" ON invoice_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- SEED: Documentos Legales PROFECO-Compliant
-- =====================================================

INSERT INTO legal_documents (document_type, version, title, content, effective_date, is_active) VALUES
-- Términos y Condiciones v1.0
('terms_and_conditions', '1.0', 
 'Términos y Condiciones del Smart Vacational Certificate (SVC)', 
 '# TÉRMINOS Y CONDICIONES DEL SMART VACATIONAL CERTIFICATE (SVC)

## 1. NATURALEZA DEL CERTIFICADO

El presente Smart Vacational Certificate (en adelante "SVC" o "Certificado") otorga al titular un derecho personal, temporal y revocable de solicitar uso vacacional anual durante un período de 15 años, sujeto a disponibilidad del sistema WEEK-CHAIN.

**IMPORTANTE:** Este certificado NO constituye:
- Propiedad inmobiliaria ni derechos reales sobre bienes inmuebles
- Tiempo compartido conforme a la NOM-029-SCFI-2010
- Inversión financiera ni producto de ahorro
- Garantía de acceso a fechas, destinos o propiedades específicas

## 2. MODELO DE SOLICITUD: REQUEST → OFFER → CONFIRM

El titular acepta que el sistema opera bajo el siguiente modelo:

a) **REQUEST (Solicitud):** El titular envía una solicitud de uso vacacional indicando preferencias de destino, fechas y ocupantes.

b) **OFFER (Oferta):** WEEK-CHAIN revisa la solicitud y, sujeto a disponibilidad, envía una oferta con destino, fechas y alojamiento disponibles.

c) **CONFIRM (Confirmación):** El titular tiene 48 horas para aceptar o declinar la oferta. La aceptación confirma la reservación.

## 3. DERECHOS DEL TITULAR

El titular del SVC tiene derecho a:
- Enviar una (1) solicitud de uso vacacional por año durante 15 años
- Recibir ofertas de destinos participantes sujeto a disponibilidad
- Acceder a su panel digital con información del certificado
- Solicitar gestión operativa de renta a través de WEEK-Management (servicio opcional separado)

## 4. LIMITACIONES Y OBLIGACIONES

El titular reconoce y acepta que:
- Las solicitudes están sujetas a disponibilidad sin garantía de confirmación
- WEEK-CHAIN no garantiza destinos, fechas ni propiedades específicas
- El servicio de gestión de renta es opcional, no garantizado y sujeto a comisiones
- Los ingresos por renta (si aplica) no constituyen rendimiento de inversión
- El certificado es personal e intransferible salvo autorización expresa

## 5. VIGENCIA Y RENOVACIÓN

- Vigencia: 15 años desde la fecha de emisión
- No hay cuotas anuales de mantenimiento
- Al término de la vigencia, el derecho expira automáticamente
- No hay opción de renovación automática

## 6. JURISDICCIÓN Y LEY APLICABLE

Este contrato se rige por las leyes de México y la jurisdicción de los tribunales de [Ciudad], México.

**Última actualización:** ' || NOW() || '
**Versión:** 1.0',
NOW(), true),

-- Aviso de Privacidad v1.0
('privacy_policy', '1.0',
 'Aviso de Privacidad WEEK-CHAIN',
 '# AVISO DE PRIVACIDAD WEEK-CHAIN

## Responsable del Tratamiento de Datos Personales

WEEK-CHAIN™ con domicilio en [Dirección], es responsable del tratamiento de sus datos personales.

## Datos Personales que Recabamos

- **Datos de identificación:** Nombre completo, fecha de nacimiento, nacionalidad
- **Datos de contacto:** Correo electrónico, teléfono, domicilio
- **Datos fiscales:** RFC, razón social, domicilio fiscal (para facturación)
- **Datos financieros:** Información de tarjeta de crédito, número de cuenta (procesados por terceros)
- **Datos de navegación:** Dirección IP, cookies, user agent

## Finalidades del Tratamiento

Sus datos personales serán utilizados para:
- Identificación y verificación del titular del certificado
- Procesamiento de pagos y emisión de comprobantes fiscales
- Envío de ofertas de destinos vacacionales
- Cumplimiento de obligaciones contractuales
- Gestión de solicitudes de uso vacacional

## Transferencia de Datos

Sus datos pueden ser compartidos con:
- Procesadores de pago (Stripe, Conekta)
- Destinos participantes para confirmación de reservaciones
- Autoridades fiscales cuando sea legalmente requerido

## Derechos ARCO

Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, contacte a: privacidad@week-chain.com

**Última actualización:** ' || NOW() || '
**Versión:** 1.0',
NOW(), true);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

COMMENT ON TABLE legal_documents IS 'Documentos legales versionados con evidencia de aceptación click-wrap';
COMMENT ON TABLE user_legal_acceptances IS 'Registro de aceptaciones de términos con metadata completa para evidencia legal';
COMMENT ON TABLE certificate_vouchers IS 'Vouchers de certificados con código único y datos completos';
COMMENT ON TABLE invoice_requests IS 'Solicitudes de factura con datos fiscales del SAT';
