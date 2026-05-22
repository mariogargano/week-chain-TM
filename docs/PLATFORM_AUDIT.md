# WEEK-CHAIN Platform Audit Report

**Fecha:** 2025-05-21
**Auditor:** v0

## RESUMEN EJECUTIVO

### Errores TypeScript Encontrados: 74+
- **Criticos (bloqueantes):** 4 API routes con params async
- **Importantes:** ~50 errores de tipo 'any' implícito
- **Menores:** Errores de propiedades en i18n

---

## 1. ERRORES CRITICOS (Next.js 15 Params)

En Next.js 15, los `params` en API routes son `Promise<{...}>`. Deben usar `await`.

### Archivos afectados:
- [ ] `app/api/admin/email-templates/[id]/route.ts`
- [ ] `app/api/loans/[id]/route.ts`
- [ ] `app/api/notaries/[propertyId]/route.ts`
- [ ] `app/api/properties/[id]/route.ts`

### Fix requerido:
```typescript
// ANTES (Next.js 14)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
}

// DESPUES (Next.js 15)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

---

## 2. FLUJOS CRITICOS A VERIFICAR

### A. Admin Super Admin (corporativo@morises.com)
- [ ] Login como super_admin
- [ ] Acceso a /dashboard/admin
- [ ] Panel de certificados
- [ ] Panel de KYC approvals
- [ ] Panel de pagos
- [ ] Panel de agentes/intermediarios
- [ ] Configuración de productos SVC

### B. Registro de Agente (Intermediary)
- [ ] Signup como agent
- [ ] Dashboard de agente con link referral
- [ ] Tracking de comisiones
- [ ] Materiales de marketing
- [ ] KYC del agente

### C. Wallet Pass (Apple/Google)
- [ ] Generación de .pkpass para Apple Wallet
- [ ] Generación de pass para Google Pay
- [ ] Descarga desde dashboard member

---

## 3. ARCHIVOS WALLET ENCONTRADOS

```
app/api/wallet/apple-pass/route.ts
app/api/wallet/google-pass/route.ts
lib/wallet/apple-pass-generator.ts
lib/wallet/google-pass-generator.ts
```

### Dependencias requeridas:
- Apple: Certificados PassKit (.p12, .pem)
- Google: Service Account JSON + Issuer ID

---

## 4. TABLA DE USUARIOS EN DB

Campos requeridos para el flujo completo:
- `id` (uuid)
- `email` (text)
- `role` (text: visitor | member | agent | admin | super_admin)
- `onboarding_status` (text: registered | holder_verified | certificate_holder)
- `kyc_status` (text: pending | approved | rejected)
- `persona_inquiry_id` (text, nullable)
- `referral_code` (text, nullable) - para agentes
- `referred_by` (uuid, nullable) - quien lo refirio

---

## 5. TABLA DE CERTIFICADOS EN DB

Campos requeridos:
- `id` (uuid)
- `user_id` (uuid)
- `certificate_number` (text: WC-YYYY-XXXXXX)
- `pax_capacity` (int: 2, 4, 6, 8)
- `status` (text: pending_payment | pending_kyc | active | suspended | expired)
- `issued_at` (timestamp)
- `expires_at` (timestamp)
- `years_remaining` (int)
- `weeks_used_this_year` (int)

---

## 6. INTEGRACIONES REQUERIDAS

| Integración | Estado | Env Vars |
|-------------|--------|----------|
| Supabase | ✅ Conectado | SUPABASE_* |
| Stripe | ✅ Conectado | STRIPE_* |
| Persona KYC | ⚠️ Verificar | PERSONA_API_KEY, PERSONA_WEBHOOK_SECRET |
| Resend Email | ✅ Conectado | RESEND_API_KEY |
| Conekta | ⚠️ Verificar | CONEKTA_* |
| Apple Wallet | ❌ Pendiente | APPLE_PASS_* |
| Google Wallet | ❌ Pendiente | GOOGLE_* |

---

## 7. ACCIONES INMEDIATAS

1. Corregir 4 API routes con params async
2. Verificar tabla users tiene todos los campos
3. Crear usuario super_admin corporativo@morises.com
4. Verificar API de agentes/intermediarios
5. Implementar Apple/Google Wallet passes

---

## 8. SIGUIENTE PASO

Ejecutar correcciones de API routes y verificar flows en browser.
