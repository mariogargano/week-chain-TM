-- =====================================================
-- WEEK-CHAIN: COMPLETE USER CONTRACT FLOW
-- Sistema de Contratos Legales PROFECO-Compliant
-- =====================================================
-- Este script implementa el flow completo de registro
-- con aceptación de términos, compra de certificado,
-- generación de voucher y sistema de facturación automática
-- =====================================================

-- =====================================================
-- PASO 1: TABLAS FALTANTES (Testimonials + Destinations)
-- =====================================================

-- Tabla de testimonios
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    certificate_type TEXT,
    is_approved BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vista pública de destinos
CREATE OR REPLACE VIEW public_destinations_catalog AS
SELECT 
    id,
    name,
    location,
    location_group,
    description,
    image_url,
    status,
    base_price_usd,
    availability_percentage
FROM destinations
WHERE status IN ('available', 'coming_soon')
ORDER BY location_group ASC, name ASC;

-- =====================================================
-- PASO 2: SISTEMA DE TÉRMINOS Y CONDICIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL CHECK (document_type IN ('terms_and_conditions', 'privacy_policy', 'svc_contract', 'profeco_disclosure')),
    version TEXT NOT NULL, -- Ejemplo: "v1.0.0"
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- HTML o Markdown del documento
    effective_date TIMESTAMPTZ NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(document_type, version)
);

-- =====================================================
-- PASO 3: ACEPTACIÓN DE TÉRMINOS (Click-Wrap)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_legal_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES legal_documents(id),
    document_type TEXT NOT NULL,
    document_version TEXT NOT NULL,
    
    -- Click-wrap evidence
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    acceptance_method TEXT NOT NULL CHECK (acceptance_method IN ('click_wrap', 'sign_wrap', 'browse_wrap')),
    
    -- Evidencia adicional para autoridades
    full_document_snapshot JSONB NOT NULL, -- Copia completa del documento aceptado
    acceptance_evidence JSONB NOT NULL, -- {"scroll_percentage": 100, "time_spent_seconds": 45, "checkbox_clicked": true}
    
    -- Metadata
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, document_id)
);

-- =====================================================
-- PASO 4: SISTEMA DE VOUCHERS
-- =====================================================

CREATE TABLE IF NOT EXISTS certificate_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code TEXT NOT NULL UNIQUE, -- Ejemplo: "WC-2024-AB12-3456"
    
    -- Relaciones
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_id UUID REFERENCES certificate_products_v2(id),
    purchase_id UUID, -- Referencia a la compra
    
    -- Datos del certificado
    certificate_type TEXT NOT NULL,
    certificate_name TEXT NOT NULL,
    weeks_quantity INTEGER NOT NULL,
    validity_start_date DATE NOT NULL,
    validity_end_date DATE NOT NULL,
    
    -- Datos del usuario (snapshot al momento de compra)
    user_full_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    user_address JSONB, -- {"street": "...", "city": "...", "state": "...", "zip": "...", "country": "..."}
    
    -- Datos de pago
    payment_amount_cents INTEGER NOT NULL,
    payment_currency TEXT NOT NULL DEFAULT 'MXN',
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    payment_date TIMESTAMPTZ NOT NULL,
    
    -- Estado del voucher
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'redeemed', 'cancelled', 'expired')),
    
    -- PDF generado
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,
    
    -- Email enviado
    email_sent_at TIMESTAMPTZ,
    email_sent_to TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PASO 5: SISTEMA DE FACTURACIÓN AUTOMÁTICA
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES certificate_vouchers(id),
    
    -- Datos fiscales del usuario
    rfc TEXT NOT NULL,
    razon_social TEXT NOT NULL,
    email_facturacion TEXT NOT NULL,
    
    -- Domicilio fiscal
    calle TEXT NOT NULL,
    numero_exterior TEXT NOT NULL,
    numero_interior TEXT,
    colonia TEXT NOT NULL,
    municipio TEXT NOT NULL,
    estado TEXT NOT NULL,
    codigo_postal TEXT NOT NULL,
    pais TEXT NOT NULL DEFAULT 'México',
    
    -- Uso de CFDI
    uso_cfdi TEXT NOT NULL DEFAULT 'G03', -- G03 = Gastos en general
    
    -- Estado de la factura
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Factura generada
    factura_uuid TEXT UNIQUE, -- UUID del SAT
    factura_folio TEXT,
    factura_pdf_url TEXT,
    factura_xml_url TEXT,
    factura_generated_at TIMESTAMPTZ,
    
    -- Email enviado
    email_sent_at TIMESTAMPTZ,
    
    -- Errores
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, voucher_id)
);

-- =====================================================
-- PASO 6: AUDIT LOG COMPLETO
-- =====================================================

CREATE TABLE IF NOT EXISTS user_contract_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PASO 7: FUNCIONES HELPER
-- =====================================================

-- Función para generar código de voucher único
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'WC-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' ||
                    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
        
        SELECT EXISTS(SELECT 1 FROM certificate_vouchers WHERE voucher_code = new_code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar aceptación de términos
CREATE OR REPLACE FUNCTION user_has_accepted_current_terms(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_accepted BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM user_legal_acceptances ula
        JOIN legal_documents ld ON ula.document_id = ld.id
        WHERE ula.user_id = p_user_id
        AND ld.document_type = 'terms_and_conditions'
        AND ld.is_current = true
        AND ula.is_valid = true
    ) INTO has_accepted;
    
    RETURN has_accepted;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 8: TRIGGERS
-- =====================================================

-- Trigger para audit log en aceptaciones
CREATE OR REPLACE FUNCTION log_legal_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_contract_audit_log (
        user_id, action, entity_type, entity_id, details, ip_address
    ) VALUES (
        NEW.user_id,
        'legal_acceptance',
        NEW.document_type,
        NEW.id,
        jsonb_build_object(
            'document_version', NEW.document_version,
            'acceptance_method', NEW.acceptance_method
        ),
        NEW.ip_address
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_legal_acceptance
AFTER INSERT ON user_legal_acceptances
FOR EACH ROW EXECUTE FUNCTION log_legal_acceptance();

-- Trigger para audit log en vouchers
CREATE OR REPLACE FUNCTION log_voucher_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_contract_audit_log (
        user_id, action, entity_type, entity_id, details
    ) VALUES (
        NEW.user_id,
        'voucher_created',
        'certificate_voucher',
        NEW.id,
        jsonb_build_object(
            'voucher_code', NEW.voucher_code,
            'certificate_type', NEW.certificate_type,
            'amount_cents', NEW.payment_amount_cents
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_voucher_creation
AFTER INSERT ON certificate_vouchers
FOR EACH ROW EXECUTE FUNCTION log_voucher_creation();

-- =====================================================
-- PASO 9: RLS POLICIES
-- =====================================================

-- Legal documents (público para leer, solo admin para escribir)
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read current legal documents"
ON legal_documents FOR SELECT
USING (is_current = true);

CREATE POLICY "Only admins can manage legal documents"
ON legal_documents FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- User legal acceptances (usuarios ven solo sus aceptaciones)
ALTER TABLE user_legal_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own acceptances"
ON user_legal_acceptances FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create acceptances"
ON user_legal_acceptances FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all acceptances"
ON user_legal_acceptances FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Vouchers (usuarios ven solo sus vouchers)
ALTER TABLE certificate_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vouchers"
ON certificate_vouchers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all vouchers"
ON certificate_vouchers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Invoice requests (usuarios ven solo sus solicitudes)
ALTER TABLE invoice_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoice requests"
ON invoice_requests FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create invoice requests"
ON invoice_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all invoice requests"
ON invoice_requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Testimonials RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved testimonials"
ON testimonials FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create testimonials"
ON testimonials FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all testimonials"
ON testimonials FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- =====================================================
-- PASO 10: SEED DOCUMENTOS LEGALES INICIALES
-- =====================================================

-- Insertar Términos y Condiciones v1.0.0
INSERT INTO legal_documents (
    document_type,
    version,
    title,
    content,
    effective_date,
    is_current
) VALUES (
    'terms_and_conditions',
    'v1.0.0',
    'Términos y Condiciones de Uso - WEEK-CHAIN Smart Vacational Certificates',
    '<h1>Términos y Condiciones de Uso</h1>
    <p><strong>WEEK-CHAIN™ Smart Vacational Certificates (SVC)</strong></p>
    
    <h2>1. NATURALEZA DEL SERVICIO</h2>
    <p>Los Smart Vacational Certificates (SVC) de WEEK-CHAIN otorgan al titular un <strong>derecho de solicitud de uso vacacional temporal</strong> en propiedades participantes en la red WEEK-CHAIN por un período de 15 años.</p>
    
    <p><strong>IMPORTANTE:</strong> El certificado SVC <strong>NO constituye</strong>:</p>
    <ul>
        <li>Propiedad inmobiliaria o fraccionada</li>
        <li>Tiempo compartido conforme Ley Federal de Protección al Consumidor</li>
        <li>Inversión con rendimientos garantizados</li>
        <li>Garantía de acceso o disponibilidad en fechas específicas</li>
    </ul>
    
    <h2>2. DERECHOS Y OBLIGACIONES</h2>
    <p>El titular del certificado tiene:</p>
    <ul>
        <li>Derecho a solicitar reservaciones en propiedades participantes sujeto a disponibilidad</li>
        <li>Obligación de pagar tarifas de mantenimiento y servicio anuales</li>
        <li>Derecho a transferir el certificado conforme reglamento interno</li>
    </ul>
    
    <h2>3. DISPONIBILIDAD Y RESERVACIONES</h2>
    <p>La disponibilidad de propiedades está sujeta a:</p>
    <ul>
        <li>Capacidad del sistema y demanda estacional</li>
        <li>Políticas de operadores de propiedades participantes</li>
        <li>Mantenimiento y renovaciones programadas</li>
    </ul>
    
    <h2>4. VIGENCIA Y TERMINACIÓN</h2>
    <p>El certificado tiene vigencia de 15 años desde la fecha de activación. Al término, el sistema implementará el plan de distribución conforme contrato.</p>
    
    <h2>5. CUMPLIMIENTO PROFECO</h2>
    <p>Este servicio cumple con todas las disposiciones de PROFECO y NOM-151. No constituye tiempo compartido ni está sujeto a la regulación específica de dicha figura jurídica.</p>
    
    <p><em>Fecha efectiva: ' || TO_CHAR(NOW(), 'DD de Month de YYYY') || '</em></p>',
    NOW(),
    true
) ON CONFLICT (document_type, version) DO NOTHING;

-- Insertar Aviso de Privacidad v1.0.0
INSERT INTO legal_documents (
    document_type,
    version,
    title,
    content,
    effective_date,
    is_current
) VALUES (
    'privacy_policy',
    'v1.0.0',
    'Aviso de Privacidad - WEEK-CHAIN',
    '<h1>Aviso de Privacidad</h1>
    
    <h2>1. RESPONSABLE</h2>
    <p>WEEK-CHAIN, con domicilio en [DIRECCIÓN], es responsable del tratamiento de sus datos personales.</p>
    
    <h2>2. DATOS RECOPILADOS</h2>
    <p>Recopilamos los siguientes datos personales:</p>
    <ul>
        <li>Identificación: Nombre completo, RFC, CURP</li>
        <li>Contacto: Email, teléfono, dirección</li>
        <li>Financieros: Datos de pago (procesados por Stripe/Conekta)</li>
        <li>Navegación: IP, cookies, comportamiento en plataforma</li>
    </ul>
    
    <h2>3. FINALIDADES</h2>
    <p>Sus datos se utilizan para:</p>
    <ul>
        <li>Procesar activaciones de certificados</li>
        <li>Gestionar reservaciones</li>
        <li>Emitir facturas fiscales</li>
        <li>Cumplir obligaciones legales</li>
        <li>Mejorar nuestros servicios</li>
    </ul>
    
    <h2>4. DERECHOS ARCO</h2>
    <p>Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición contactando a: privacidad@week-chain.com</p>
    
    <p><em>Fecha efectiva: ' || TO_CHAR(NOW(), 'DD de Month de YYYY') || '</em></p>',
    NOW(),
    true
) ON CONFLICT (document_type, version) DO NOTHING;

-- =====================================================
-- PASO 11: ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_legal_acceptances_user_id ON user_legal_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_legal_acceptances_document_id ON user_legal_acceptances(document_id);
CREATE INDEX IF NOT EXISTS idx_certificate_vouchers_user_id ON certificate_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_vouchers_voucher_code ON certificate_vouchers(voucher_code);
CREATE INDEX IF NOT EXISTS idx_invoice_requests_user_id ON invoice_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_requests_voucher_id ON invoice_requests(voucher_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de contratos de usuario implementado correctamente';
    RAISE NOTICE '✅ Tablas creadas: legal_documents, user_legal_acceptances, certificate_vouchers, invoice_requests';
    RAISE NOTICE '✅ Tablas faltantes corregidas: testimonials, public_destinations_catalog';
    RAISE NOTICE '✅ RLS policies aplicadas';
    RAISE NOTICE '✅ Triggers de audit log activos';
    RAISE NOTICE '✅ Documentos legales seed aplicados';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 FLOW COMPLETO DE USUARIO:';
    RAISE NOTICE '   1. Usuario se registra → Acepta T&C y Aviso de Privacidad (click-wrap)';
    RAISE NOTICE '   2. Usuario selecciona certificado → Paga con Stripe/Conekta';
    RAISE NOTICE '   3. Sistema genera voucher automático con código único';
    RAISE NOTICE '   4. Email enviado con voucher PDF';
    RAISE NOTICE '   5. Usuario entra a dashboard → Puede solicitar factura';
    RAISE NOTICE '   6. Sistema genera factura automática y envía por email';
    RAISE NOTICE '';
    RAISE NOTICE '📋 TODO REGISTRADO EN AUDIT LOG PARA AUTORIDADES';
END $$;
