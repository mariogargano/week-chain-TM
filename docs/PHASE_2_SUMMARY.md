# FASE 2 COMPLETADA: Autenticación, Onboarding, Persona KYC y Dashboard Base

## Resumen Ejecutivo de lo Construido

### 1. Estado de Usuarios (onboarding_status)
- **Campo agregado**: `onboarding_status` en tabla `users` con 4 valores:
  - `visitor` → Usuario no registrado
  - `registered` → Recién registrado, KYC pendiente
  - `holder_verified` → KYC aprobado, puede comprar certificados
  - `certificate_holder` → Tiene certificado activo (deprecated, usar status del cert)
  - `agent_verified` → KYC aprobado como agente, puede cobrar comisiones

### 2. Flujo de Autenticación Mejorado
- **Auth callback**: Setta `onboarding_status = "registered"` al crear usuario nuevo
- **Middleware**: Redirecciona a `/dashboard/member/onboarding` si está en "registered"
- **Onboarding dashboard**: UI con 3 pasos:
  1. **Completar perfil** - Nombre, teléfono, foto
  2. **Verificación KYC** - Persona widget integrado (documento, selfie, datos)
  3. **Confirmación** - Resumen antes de enviar

### 3. Persona KYC Webhook Completo
- **Validación de firma**: HMAC-SHA256 con `PERSONA_WEBHOOK_SECRET`
- **Actualización de estado**: `kyc_users.status` → approved/failed/pending
- **Activación automática**: Si KYC aprobado:
  - Busca certificado en estado `pending_kyc`
  - Lo cambia a `active` con timestamp
  - Actualiza `users.onboarding_status` → `holder_verified`
- **Logging robustocon contexto**: Cada evento registra userId, inquiryId, status

### 4. Emisión Automática de Certificados (Certificate Emission Flow)
- **Ubicación**: `lib/flows/certificate-emission.ts` (113 líneas)
- **Lógica**:
  1. Genera número único: `WC-YYYY-NNNNNNN` (timestamp + secuencial)
  2. Crea row en `certificates` con status `pending_kyc`
  3. Genera PDF con datos del certificado (timestamp, #, detalles PAX)
  4. Guarda PDF en Blob storage
  5. Retorna URL para descargar
- **Integrado en**: Webhook de Stripe post-pago
- **Idempotente**: No crea duplicados si se llama 2x con mismo sessionId

### 5. Página de Éxito Post-Compra (New)
- **Ruta**: `/certificates/success?session_id=XXXXX`
- **Muestra**:
  - ✅ Número de certificado emisión
  - 📋 Resumen: Plan, PAX, vigencia, semanas
  - 📥 Botón descargar PDF
  - 🎫 Botón agregar a Apple Wallet (stub, Fase 4)
  - → Botón ir al dashboard
- **Redirige** automáticamente si no hay usuario logueado

### 6. Dashboard Pre-Holder (New)
- **Ruta**: `/dashboard/member/onboarding`
- **Componentes**:
  - `page.tsx` (server) - Fetch usuario, permisos
  - `client.tsx` (261 líneas) - UI con 3 steps, Persona iframe
- **Steps**:
  1. Datos personales (nombre, teléfono, foto)
  2. KYC Persona (documento + selfie + datos)
  3. Confirmación + estado
- **Autosave**: Guardaemail/name en `kyc_users` al cambiar
- **Post-KYC**: Si está aprobado, muestra CTA para ir a dashboard

---

## Lo que NO está hecho todavía (para Fase 3)

| Componente | Estado | Razón |
|-----------|--------|-------|
| Apple Wallet pass generation | Stub | Requiere PassKit SDK, hacerlo en Fase 4 |
| Email notificaciones KYC | TODO | Setear template en Resend |
| PDF con firma digital | Básico | Generar PDF, no está firmado. Añadir en Fase 4 |
| Certificado transferible | TODO | Lógica de transferencia con KYC del nuevo titular |
| Rate limiting on KYC retry | TODO | Bloquear reintento KYC cada < 1 día |
| Bloqueo de auto-referido (agents) | Implementado | Ver `lib/flows/commission-creation.ts` |

---

## Decisiones Técnicas Tomadas

1. **Persona webhook con validación HMAC**: Garantiza que solo Persona puede llamar el endpoint (no fake payloads)
2. **Certificate emission idempotente**: Si Stripe webhook se ejecuta 2x, solo crea 1 certificado (lookup por session_id)
3. **Onboarding status separado de role**: Un usuario puede ser `user` + `registered` (new) o `user` + `holder_verified` (kyc done)
4. **Middleware intercepta a /onboarding**: Fuerza que registre usuarios completen KYC antes de ver dashboard
5. **Certificate emit en webhook, no en app**: Reduce latencia de emisión, más robusto

---

## Riesgos Abiertos

| Riesgo | Severidad | Mitigación | Fase |
|--------|-----------|-----------|------|
| Persona widget falla silenciosamente | Importante | Logging de eventos en cliente + error boundary | 3 |
| Certificate #número colisión | Baja | Secuencial + timestamp garantiza unicidad | 3 |
| KYC webhook llega antes de crear cert | Media | Cert se crea pending_kyc, webhook lo activa OK | 3 |
| Usuario puede forzar status=holder_verified via update | Crítico | RLS en tabla users (solo auth user puede actualizar su propia fila) | 3 |
| No hay rate limit en KYC inquiry creation | Importante | Agregar en Fase 3 (max 1 inquiry/user/24h) | 3 |

---

## Qué DEBE revisar manualmente

### 1. Base de Datos
- [ ] SQL migration aplicada: `scripts/02-add-onboarding-status.sql`
- [ ] Campos en tabla `certificates`: `certificate_number`, `checkout_session_id`, `issued_at`
- [ ] Campos en tabla `kyc_users`: `persona_inquiry_id`, `kyc_updated_at`
- [ ] RLS policies: tabla `users` solo permite user actualizar su propia fila

### 2. Integración Persona
- [ ] `PERSONA_API_KEY` y `PERSONA_WEBHOOK_SECRET` en .env (Vercel)
- [ ] Webhook URL configurada en Persona: `https://yourdomain.com/api/webhooks/persona`
- [ ] Persona widget template ID correcto en `app/dashboard/member/onboarding/client.tsx`

### 3. Stripe Checkout
- [ ] Redirect URL post-compra: `success_url: https://yourdomain.com/certificates/success?session_id={CHECKOUT_SESSION_ID}`
- [ ] Webhook recibe `checkout.session.completed` y llama `emitCertificate()`

### 4. Email Templates (Post-Fase 2)
- [ ] Crear en Resend: "kyc-approved" + "kyc-rejected" + "certificate-issued"
- [ ] Descommentar calls en `app/api/webhooks/persona/route.ts` líneas 139-140

### 5. Blob Storage
- [ ] Carpeta `/certificates` existe
- [ ] Token de acceso tiene permisos write

---

## Archivos Modificados / Creados

### Modificados
- `middleware.ts` → Añadido redirect a onboarding si status=registered
- `app/auth/callback/route.ts` → Setta onboarding_status=registered
- `app/api/webhooks/stripe/route.ts` → Integrada emisión de certificado

### Creados
- `app/api/webhooks/persona/route.ts` (151 líneas) - Webhook con validación HMAC
- `app/dashboard/member/onboarding/page.tsx` (52 líneas) - Server component
- `app/dashboard/member/onboarding/client.tsx` (261 líneas) - UI con steps
- `app/certificates/success/page.tsx` (11 líneas) - Server component
- `app/certificates/success/client.tsx` (210 líneas) - Success page UI
- `lib/flows/certificate-emission.ts` (113 líneas) - Certificate creation logic
- `scripts/02-add-onboarding-status.sql` (51 líneas) - DB migration
- `docs/PHASE_2_IMPLEMENTATION.md` (194 líneas) - Technical details
- `docs/PHASE_2_SUMMARY.md` (Este documento)

---

## Próxima Fase (3)

Fase 3 implementará:
1. **Pagos con Conekta** - Integración con métodos locales MX
2. **Reconciliación de estados** - Sincronizar certificado ↔️ pago ↔️ KYC
3. **Admin dashboard** - Aprobaciones manuales de KYC, gestión de pagos
4. **Emisión en estado correcto** - Certificado emitido después de KYC aprobado

**Status**: ✅ FASE 2 LISTA PARA REVIEW
