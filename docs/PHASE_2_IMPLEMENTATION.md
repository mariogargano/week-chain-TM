# FASE 2: Implementación - Autenticación, Onboarding, Persona KYC, Estados del Usuario y Dashboard Base

**Estado**: EN PROGRESO
**Objetivo**: Usuarios registrados, KYC funcional, dashboard pre-holder, transición automática a holder post-compra

---

## 1. QUÉ EXISTE YA

### ✅ Lo que está listo
- Supabase Auth con Google OAuth
- Tabla `kyc_users` con estados: missing, pending, approved, failed
- Dashboard KYC visual bonito (`app/dashboard/member/kyc/page.tsx`)
- Cliente Persona JS (`lib/kyc/persona-client.ts`)
- Endpoint POST `/api/kyc/create-inquiry` que crea inquiry de Persona
- Auth callback (`app/auth/callback/route.ts`) que crea usuarios

### ❌ Lo que falta crítico
1. **Campo `onboarding_status` en tabla `users`**: visitor → registered → holder/agent
2. **Webhook de Persona**: `/api/kyc/webhook/route.ts` debe procesar eventos de Persona
3. **Persona JS widget funcional**: El inquiry debe abrir widget en la UI
4. **Dashboard pre-holder**: Lo que ve un usuario registrado sin certificado
5. **Auto-transición post-compra**: Stripe webhook → emisión certificado → actualización estado usuario

---

## 2. PLAN DE IMPLEMENTACIÓN FASE 2

### Step 1: Migración de BD - Agregar campos de onboarding
**Archivo**: `scripts/add-onboarding-status.sql`
```sql
-- Agregar column onboarding_status a users
ALTER TABLE users ADD COLUMN onboarding_status TEXT DEFAULT 'visitor';
-- Valores: visitor → registered → holder_pending_kyc → holder_verified → agent_pending_kyc → agent_verified

-- Agregar column for tracking
ALTER TABLE users ADD COLUMN holder_since TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN agent_since TIMESTAMP NULL;
```

### Step 2: Persona Webhook - Procesar decisiones KYC
**Archivo**: Actualizar `/api/kyc/webhook/route.ts`
- Recibe evento de Persona (approved/failed)
- Actualiza `kyc_users.status` y `kyc_users.verified_at`
- Trigger: si KYC se aprueba Y usuario tiene certificado en "pending_kyc" → transicionar a "active"
- Envía email de notificación

### Step 3: Persona Widget Funcional
**Archivo**: Actualizar `/app/dashboard/member/kyc/page.tsx`
- Cargar Persona JS SDK desde CDN
- En `startVerification()`, abrir widget con session token
- Widget redirige a callback de Persona (que Persona webhook procesará)

### Step 4: Dashboard Pre-Holder
**Archivo**: Crear `/app/dashboard/member/onboarding/page.tsx` O redirigir desde `/dashboard/member`
- Mostrar si usuario.onboarding_status = "registered"
- Mostrar:
  - Hero: "Bienvenido a WEEK-CHAIN"
  - Card: "Paso 1 - KYC" (completa primero)
  - Card: "Paso 2 - Compra certificado"
  - Card: "Paso 3 - Comienza a usar"
- Botón: "Completar verificacion KYC"

### Step 5: Auto-Transición Post-Compra
**Archivo**: Actualizar `/api/webhooks/stripe/route.ts` evento `checkout.session.completed`
1. Buscar usuario por email del checkout
2. Si usuario.kyc_users.status = "approved" → crear certificado activo + cambiar user.onboarding_status = "holder_verified"
3. Si usuario.kyc_users.status = "pending" → cambiar user.onboarding_status = "holder_pending_kyc" (espera webhook Persona)
4. Emitir certificado con número único WC-YYYY-XXXXXX
5. Enviar email de bienvenida + PDF

---

## 3. FLUJO DE ESTADOS USUARIO

```
┌─────────────────────────────────────────────────────┐
│ Visitor                                              │
│ - No autenticado                                     │
│ - Puede ver catálogo                                │
└──────────────────┬──────────────────────────────────┘
                   │ (Click "Comprar")
                   ↓
┌─────────────────────────────────────────────────────┐
│ Registered                                           │
│ - Email + password                                  │
│ - onboarding_status = "registered"                 │
│ - kyc_users.status = "missing"                     │
│ - Dashboard pre-holder                             │
└──────────────────┬──────────────────────────────────┘
                   │ (Inicia KYC)
                   ↓
┌─────────────────────────────────────────────────────┐
│ KYC Pending                                          │
│ - onboarding_status = "registered" (sin cambios)   │
│ - kyc_users.status = "pending"                     │
│ - Esperando decisión de Persona                    │
└──────────────────┬──────────────────────────────────┘
         ┌─────────┴──────────┐
         │ (Persona webhook)  │
         ↓                    ↓
    Approved            Failed
         │                    │
         ↓                    ↓
┌─────────────────────────────────────────────────────┐
│ KYC Verified (Buyer o Agent)                        │
│ - kyc_users.status = "approved"                    │
│ - onboarding_status = "registered" (esperando cto) │
│ - Puede comprar certificados                       │
└──────────────────┬──────────────────────────────────┘
                   │ (Compra certificado)
                   │ (Stripe paga)
                   ↓
┌─────────────────────────────────────────────────────┐
│ Holder - Active                                     │
│ - onboarding_status = "holder_verified"            │
│ - certificates.status = "active"                   │
│ - Puede hacer REQUEST de estancias                 │
│ - Si es agente también recibe comisiones           │
└─────────────────────────────────────────────────────┘
```

---

## 4. DECISIONES DE ARQUITECTURA FASE 2

### Decisión 1: KYC Split (Holder vs Agent)
- **Opción elegida**: Mismo KYC approve → puede ser buyer AND agent
- **Razon**: Simplifica: un usuario aprobado puede hacer ambas cosas
- **Alternativa rechazada**: KYC separado (más complejo sin beneficio)

### Decisión 2: Persona Webhook Secret
- Persona envía webhook con header `Persona-Signature`
- Validamos con `PERSONA_WEBHOOK_SECRET` desde env vars
- Sin validación = fraude (alguien podría manipular KYC status manualmente)

### Decisión 3: Certificado "Draft" vs "Pending"
- No hay estado "draft". Al pagar → certificado se emite automático (pending_kyc u active según KYC)
- Si pago se revierte (chargeback), certificado → "refunded" (no se borra)

### Decisión 4: Email Post-Compra
- Email con PDF del certificado
- Email con número único WC-YYYY-XXXXXX
- Email con link a dashboard
- Email con liga a descarga de Apple Wallet (post-Fase 4)

---

## 5. ARCHIVOS A CREAR/MODIFICAR

### CREAR
```
scripts/add-onboarding-status.sql
app/dashboard/member/onboarding/page.tsx
app/dashboard/member/onboarding/client.tsx
components/onboarding-steps.tsx
lib/flows/certificate-emission.ts
lib/email/templates/certificate-welcome.tsx
```

### MODIFICAR
```
app/api/kyc/webhook/route.ts (implementar validación + trigger)
app/api/webhooks/stripe/route.ts (auto-emitir certificado)
app/dashboard/member/kyc/page.tsx (agregar Persona JS widget)
app/auth/callback/route.ts (set onboarding_status = "registered")
```

---

## 6. RIESGOS ABIERTOS FASE 2

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Persona webhook no llega | KYC no se procesa | Dead-letter queue + retry en 24h |
| Stripe webhook falla | Certificado no se emite | Stripe dashboard retry, manual admin review |
| Usuario cancela en KYC widget | Queda en pending | Clean-up job: after 7 días pendiente → set missing |
| Persona API key inválida | KYC se bloquea | Fallback a manual review |

---

## 7. CHECKLIST MANUAL PARA REVISAR

- [ ] ¿Persona API key está en Vercel?
- [ ] ¿PERSONA_WEBHOOK_SECRET está en Vercel?
- [ ] ¿Email transaccional está configurado (RESEND)?
- [ ] ¿Dominio para redirects en Persona está correcto? (withpersona.com settings)
- [ ] ¿Tabla `kyc_users` tiene índices en (user_id, status)?
- [ ] ¿Stripe webhook está vinculado al evento checkout.session.completed?

---

**Próximos pasos**: Ejecutar Step 1 (migración SQL), luego Step 2-5 en paralelo.
