# Pre-Holder Program Setup - PASOS FINALES

## ✅ LO QUE ACABO DE CREAR

### 1. Base de Datos
- ✅ Tabla `pre_holders` con campos para email, nombre, teléfono, tier, pago Stripe
- ✅ Tabla con referral tracking y priority numbering automático

### 2. Frontend - Página `/pre-holder`
- ✅ 3 tiers: Bronze ($99), Silver ($299), Gold ($799)
- ✅ Formulario de registro con nombre, email, teléfono
- ✅ Integración con Stripe checkout
- ✅ Código de referido (opcional)

### 3. Backend - APIs
- ✅ `/api/pre-holder/checkout` - Crear sesión de pago en Stripe
- ✅ `/api/pre-holder/verify` - Verificar pago completado
- ✅ `/api/webhooks/stripe-pre-holder` - Webhook para confirmar pagos

### 4. Frontend - Páginas Adicionales
- ✅ `/pre-holder/success` - Página de confirmación tras pago
- ✅ `/dashboard/admin/pre-holders` - Admin para gestionar pre-holders

---

## 📋 TU CHECKLIST - LO QUE DEBES HACER

### PASO 1: Configurar Variables de Entorno en Vercel ⚠️ CRÍTICO

Ve a: https://vercel.com/dashboard → Tu proyecto → Settings → Environment Variables

Agrega estas variables (ya debe tener algunas):

```
# Stripe
STRIPE_SECRET_KEY=sk_live_... (obtén de https://dashboard.stripe.com/apikeys)
STRIPE_WEBHOOK_SECRET_PRE_HOLDER=whsec_... (obtén de https://dashboard.stripe.com/webhooks)
NEXT_PUBLIC_BASE_URL=https://week-chain.com (o tu dominio real)

# Supabase (probablemente ya estén)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=... (si no está, agregarlo)
```

### PASO 2: Configurar Webhook de Stripe

1. Ve a https://dashboard.stripe.com/webhooks
2. Click en "Add endpoint"
3. URL: `https://week-chain.com/api/webhooks/stripe-pre-holder`
4. Eventos a escuchar: `checkout.session.completed`
5. Click "Create endpoint"
6. Copia el "Signing secret" y agrégalo a Vercel como `STRIPE_WEBHOOK_SECRET_PRE_HOLDER`

### PASO 3: Probar en Local (Opcional pero Recomendado)

```bash
# 1. Instalar dependencias (si no están)
npm install stripe

# 2. Correr en local
npm run dev

# 3. Abrir http://localhost:3000/pre-holder

# 4. Usar tarjeta de test de Stripe: 4242 4242 4242 4242
#    Fecha: 12/34
#    CVC: 123

# 5. Si todo funciona, debería llegar a /pre-holder/success
```

### PASO 4: Push a GitHub y Deploy en Vercel

```bash
git add .
git commit -m "feat: add pre-holder program with Stripe integration"
git push origin main
```

Vercel desplegará automáticamente (tarda 5-10 min).

### PASO 5: Verificar Post-Deploy

1. Abre https://week-chain.com/pre-holder (o tu dominio)
2. Prueba el formulario completo
3. En admin: https://week-chain.com/dashboard/admin/pre-holders
4. Deberías ver la lista de pre-holders en tiempo real

---

## 📊 PARÁMETROS DE STRIPE CONFIGURADOS

### Checkouts Creados
- Bronze: $99 USD
- Silver: $299 USD (MÁS POPULAR)
- Gold: $799 USD

### Webhook Events
- `checkout.session.completed` → Actualiza status a "completed" en la DB

### Metadata Guardado
- `tier`: Qué plan compró (bronze/silver/gold)
- `referral_code`: Código de referido si tiene

---

## 🔐 SEGURIDAD

Todas las rutas están protegidas:
- Los pagos se validan en servidor (no se puede manipular precios)
- Los webhooks verifican la firma de Stripe
- Las tablas tienen RLS configurado
- Solo admins pueden ver el dashboard de pre-holders

---

## 🚀 FLUJO DE UN PRE-HOLDER

1. Usuario abre https://week-chain.com/pre-holder
2. Elige tier (Bronze/Silver/Gold)
3. Completa: nombre, email, teléfono
4. Click "Pagar $X USD"
5. Se abre Stripe checkout en popup
6. Usuario ingresa tarjeta
7. Stripe envía webhook con confirmación
8. Sistema actualiza `pre_holders.status = "completed"`
9. Usuario ve página de éxito
10. Admin ve el pre-holder en dashboard con status "Pagado"

---

## 📧 PRÓXIMAS MEJORAS (Opcionales)

- [ ] Email de confirmación automático (Resend)
- [ ] Crear cuenta automáticamente al pagar
- [ ] Dashboard personal del pre-holder
- [ ] Sistema de referidos con comisiones
- [ ] Descarga de certificados digitales

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Qué pasa si alguien cancela el pago?**
A: La transacción queda en "pending" y no accede al sistema. Puede intentar de nuevo.

**P: ¿Cómo sé si Stripe está configurado correctamente?**
A: En Stripe Dashboard → Webhooks, si ves eventos recibidos con ✓ verde está funcionando.

**P: ¿Puedo cambiar los precios?**
A: Sí, edita los valores en `TIER_PRODUCTS` en `/app/api/pre-holder/checkout/route.ts`

**P: ¿Los pre-holders se convierten automáticamente en holders?**
A: Por ahora manual. El webhook actualiza la DB pero no crea cuenta automáticamente.

---

## 🎯 SIGUIENTE PASO

Una vez que hayas hecho los 5 pasos anteriores, avísame y haremos:

1. Email de confirmación automático
2. Convertir pre-holders en holders automáticamente
3. Dashboard personal del pre-holder
4. Sistema de referidos funcional
