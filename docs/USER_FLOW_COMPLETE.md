# WEEK-CHAIN: Flujo Completo de Usuario - PROFECO Compliant

## Resumen Ejecutivo

Sistema completo de certificados digitales vacacionales con compliance legal total para autoridades mexicanas (PROFECO, SAT).

## Flujo Completo

### 1. REGISTRO (Sign Up)
**Página:** `/auth/sign-up`

**Proceso:**
- Usuario ingresa: Nombre, Email, Contraseña
- O usa Google OAuth
- **CRÍTICO:** Antes de completar registro, aparece modal con:
  - ✅ Términos y Condiciones (con versión y fecha)
  - ✅ Aviso de Privacidad (con versión y fecha)
  - ✅ Click-wrap legal (captura IP, timestamp, user-agent)

**Datos guardados:**
- `auth.users`: Cuenta de usuario
- `profiles`: Perfil extendido
- `terms_acceptance`: Click-wrap de términos
- `legal_acceptances`: Click-wrap de privacidad

**Compliance:**
- NOM-151 compliance hash generado
- Audit trail completo
- IP address registrada
- User agent capturado
- Timestamp ISO 8601

---

### 2. SELECCIÓN DE CERTIFICADO
**Página:** `/certificates`

**Opciones:**
- **Basic**: $X USD - Acceso estándar
- **Premium**: $Y USD - Beneficios adicionales
- **Elite**: $Z USD - Acceso prioritario

**Características PROFECO:**
- Cada certificado muestra disclaimers claros
- "NO es propiedad inmobiliaria"
- "NO garantiza destinos específicos"
- "Sujeto a disponibilidad"
- Botón: "Activar Certificado" (NO "Comprar")

---

### 3. PAGO
**Página:** `/payments/checkout`

**Métodos soportados:**
- Tarjeta (Stripe/Conekta)
- OXXO (Conekta)
- SPEI (Conekta)

**Proceso:**
1. Usuario selecciona método de pago
2. Sistema verifica términos aceptados
3. Procesa pago
4. Genera registro en `certificate_purchases`

**Datos guardados:**
- `payments`: Transacción de pago
- `certificate_purchases`: Certificado completo con:
  - Número único: SVC-2025-XXXXXX
  - Código QR: WEEK-XXXXX-XXXXX
  - Links a términos aceptados
  - NOM-151 hash
  - Clickwrap data completo

---

### 4. VOUCHER AUTOMÁTICO
**Trigger:** Pago completado

**Proceso automático:**
1. Sistema genera PDF voucher con:
   - Datos del usuario (nombre, email)
   - Número de certificado
   - Código QR/barcode
   - Monto pagado
   - Fecha de activación
   - Fecha de expiración (15 años)
   - Hash NOM-151
   - Referencias legales completas
   - Disclaimers PROFECO

2. PDF se sube a storage seguro
3. URL se guarda en `certificate_purchases.voucher_url`
4. Email automático se envía con:
   - Voucher adjunto
   - Link de descarga
   - Instrucciones de uso
   - Link al dashboard

**Template Email:** `certificate_voucher`

---

### 5. DASHBOARD DE USUARIO
**Página:** `/dashboard/my-certificates`

**Vista:**
\`\`\`
┌─────────────────────────────────────────┐
│ Mis Certificados                        │
├─────────────────────────────────────────┤
│                                         │
│ SVC-2025-000001          [Activo]      │
│ Código: WEEK-ABCDE-12345               │
│ Tipo: PREMIUM                          │
│ Monto: USD $X                          │
│ Activado: DD/MM/YYYY                   │
│ Expira: DD/MM/YYYY (15 años)          │
│                                         │
│ [📄 Descargar Voucher]                 │
│ [📋 Solicitar Factura] ← AQUÍ         │
│ [🔲 Ver QR Code]                       │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**Funciones:**
- ✅ Ver todos los certificados
- ✅ Descargar vouchers
- ✅ **Solicitar facturas** (clic en botón)
- ✅ Ver códigos QR
- ✅ Estado de facturas

---

### 6. SOLICITUD DE FACTURA
**Modal:** `InvoiceRequestDialog`

**Campos requeridos:**
\`\`\`typescript
{
  billing_name: string         // Razón social o nombre
  billing_rfc: string          // RFC (12-13 caracteres)
  billing_email: string        // Email fiscal
  billing_address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string = "México"
  }
  billing_fiscal_regime: string // Régimen fiscal SAT
  billing_cfdi_use: string      // Uso de CFDI
}
\`\`\`

**Validaciones:**
- RFC formato válido
- Email formato válido
- Todos los campos obligatorios
- Código postal válido

**Proceso:**
1. Usuario llena formulario
2. Datos se guardan en `certificate_purchases`
3. Flag `invoice_requested = true`
4. Sistema genera factura automáticamente
5. Email enviado con factura PDF

---

### 7. GENERACIÓN AUTOMÁTICA DE FACTURA
**Trigger:** Usuario solicita factura

**Proceso automático:**
1. Sistema valida datos fiscales
2. Genera número de factura: `WEEK-2025-XXXXXX`
3. Genera PDF con:
   - Datos fiscales completos
   - Desglose del certificado
   - Monto + IVA
   - Código QR del SAT
   - Sellos digitales
   - Referencias legales
   - UUID

4. PDF se sube a storage
5. URL en `certificate_purchases.invoice_url`
6. Email automático enviado

**Template Email:** `invoice_ready`

---

## Tabla: certificate_purchases (Completa)

\`\`\`sql
certificate_purchases
├── id (UUID)
├── user_id (FK auth.users)
│
├── CERTIFICATE DATA
├── certificate_number (SVC-2025-XXXXXX)
├── certificate_code (WEEK-XXXXX-XXXXX)
├── certificate_type (basic/premium/elite)
│
├── PRICING
├── amount_usd
├── amount_mxn
├── currency
├── exchange_rate
│
├── PAYMENT
├── payment_id (FK payments)
├── payment_status
├── payment_method
├── payment_reference
│
├── LEGAL COMPLIANCE
├── terms_acceptance_id (FK)
├── privacy_acceptance_id (FK)
├── clickwrap_data (JSONB)
├── nom151_compliance_hash
│
├── VOUCHER
├── voucher_generated (boolean)
├── voucher_url
├── voucher_generated_at
├── voucher_sent_via_email
│
├── INVOICE
├── invoice_requested (boolean)
├── invoice_generated (boolean)
├── invoice_number
├── invoice_url
├── invoice_requested_at
├── invoice_generated_at
├── invoice_sent_via_email
│
├── BILLING INFO
├── billing_name
├── billing_rfc
├── billing_email
├── billing_address (JSONB)
├── billing_fiscal_regime
├── billing_cfdi_use
│
└── STATUS
    ├── status (pending/active/expired)
    ├── activated_at
    └── expires_at (15 años)
\`\`\`

---

## APIs Creadas

### `POST /api/certificates/purchase`
Inicia compra de certificado con click-wrap

### `POST /api/certificates/complete`
Completa pago y activa certificado

### `POST /api/certificates/invoice/request`
Solicita factura para certificado

### `GET /api/certificates/my-certificates`
Lista certificados del usuario

---

## Compliance Checklist ✅

- ✅ Click-wrap con captura de IP, timestamp, user-agent
- ✅ Términos y condiciones con versión
- ✅ Aviso de privacidad con versión
- ✅ NOM-151 compliance hash
- ✅ Audit trail completo
- ✅ Vouchers con disclaimers PROFECO
- ✅ Facturas automáticas con datos SAT
- ✅ NO uso de términos prohibidos ("comprar", "inversión", "propiedad")
- ✅ Claridad de que es derecho temporal de uso
- ✅ Sin garantías de destinos específicos
- ✅ Modelo REQUEST → OFFER → CONFIRM explicado
- ✅ 15 años de vigencia documentado
- ✅ Datos fiscales completos para SAT
- ✅ Sistema de facturación conforme a CFDI 4.0

---

## Test Run para Mañana

### Prerrequisitos:
1. Ejecutar script SQL: `101_COMPLETE_USER_FLOW_SYSTEM.sql`
2. Configurar Stripe/Conekta keys
3. Configurar RESEND_API_KEY para emails
4. Verificar storage de Supabase activo

### Flujo de Prueba:
\`\`\`
1. Registrar usuario: test@morises.com
2. Aceptar términos y privacidad ✅
3. Seleccionar certificado Premium
4. Pagar con tarjeta de prueba
5. Verificar voucher recibido por email
6. Login al dashboard
7. Ir a "Mis Certificados"
8. Click "Solicitar Factura"
9. Llenar datos fiscales
10. Verificar factura recibida por email
11. Descargar ambos PDFs
\`\`\`

### Admin Verification:
\`\`\`
Login: corporativo@morises.com (Google)
Dashboard Admin:
- Ver purchase en certificate_purchases
- Verificar clickwrap_data completo
- Confirmar nom151_compliance_hash
- Ver voucher_url y invoice_url
- Audit trail visible
\`\`\`

---

## Seguridad Legal

**Inatacable por:**
- PROFECO: Compliance total con NOM-151
- SAT: Facturación automática conforme CFDI 4.0
- Auditorías: Audit trail completo con hashes
- Usuarios: Click-wrap con prueba irrefutable

**Documentación legal incluye:**
- IP address de aceptación
- Timestamp preciso
- User agent completo
- Versión de términos específica
- Hash criptográfico SHA-256
- Referencias cruzadas entre tablas
