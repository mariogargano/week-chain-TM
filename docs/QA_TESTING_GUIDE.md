# 🧪 Guía de Testing y QA - WEEK-CHAIN™

## 📋 Índice
1. [Scripts de Testing](#scripts-de-testing)
2. [Lighthouse Audits](#lighthouse-audits)
3. [Security Testing](#security-testing)
4. [Manual Testing Checklist](#manual-testing-checklist)
5. [Pre-Production Checklist](#pre-production-checklist)

---

## 🚀 Scripts de Testing

### Lighthouse Performance & Accessibility

```bash
# Producción - JSON output
npm run lh:prod

# Producción - HTML report (visual)
npm run lh:prod:html

# Local development
npm run lh:local

# Test accesibilidad (debe ser ≥95)
npm run test:a11y

# Test performance (debe ser ≥90)
npm run test:perf

# Ejecutar todos los tests
npm run test:all
```

### Security Testing

```bash
# Verificar vulnerabilidades
npm run security:check

# Intentar fix automático
npm run security:fix

# Verificar configuración de claves
npm run keys:verify

# Rotar claves (producción)
npm run keys:rotate

# Backup de claves
npm run keys:backup
```

### Pre-Deployment

```bash
# Validar variables de entorno
npm run validate-env

# Pre-commit checks
npm run precommit

# Pre-deploy checks (lint + build + env)
npm run predeploy
```

---

## 📊 Lighthouse Audits

### Criterios de Aceptación

| Categoría | Score Mínimo | Actual |
|-----------|--------------|--------|
| **Performance** | 90 | ✅ 92 |
| **Accessibility** | 95 | ✅ 96 |
| **Best Practices** | 90 | ✅ 94 |
| **SEO** | 90 | ✅ 91 |

### Cómo Interpretar Resultados

```bash
# Ejecutar audit
npm run lh:prod:html

# Abrir reporte
open lighthouse-report.html
```

**Métricas Clave:**
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TBT** (Total Blocking Time): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **SI** (Speed Index): < 3.4s

---

## 🔐 Security Testing

### 1. Verificar Secretos NO Expuestos

```bash
# Buscar claves hardcodeadas
grep -r "STRIPE_SECRET_KEY\|MIFIEL_API_KEY\|SUPABASE_SERVICE_ROLE_KEY" app/

# Resultado esperado: 0 matches en archivos client-side
```

### 2. Rate Limiting

```bash
# Test manual: hacer 121 requests en 1 minuto
for i in {1..121}; do
  curl -X POST https://v0-weekchainmvp.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' &
done

# Request #121 debe retornar 429 Too Many Requests
```

### 3. RLS (Row Level Security)

```sql
-- Conectar a Supabase como usuario normal (no service_role)
-- Intentar acceder a datos de otro usuario
SELECT * FROM bookings WHERE user_id != auth.uid();

-- Resultado esperado: 0 rows (RLS bloqueando acceso)
```

### 4. 2FA Enforcement

```bash
# 1. Crear admin sin 2FA
# 2. Navegar a /dashboard/admin
# 3. Debe redirigir a /auth/setup-2fa
# 4. Completar setup
# 5. Verificar cookie 2fa_verified presente
# 6. Acceso a /dashboard/admin permitido
```

---

## ✅ Manual Testing Checklist

### Flujo de Usuario Completo

- [ ] **Registro**
  - [ ] Email válido requerido
  - [ ] Password ≥8 caracteres
  - [ ] Confirmación de email enviada
  - [ ] Redirect a /dashboard después de confirmar

- [ ] **Login**
  - [ ] Credenciales correctas → dashboard
  - [ ] Credenciales incorrectas → error message
  - [ ] Rate limiting después de 5 intentos fallidos

- [ ] **2FA (Admin)**
  - [ ] Admin sin 2FA → redirect a /auth/setup-2fa
  - [ ] QR code generado correctamente
  - [ ] Códigos de respaldo mostrados (10)
  - [ ] Verificación con Google Authenticator funciona
  - [ ] Cookie 2fa_verified presente después de verificar
  - [ ] Acceso a rutas admin permitido

- [ ] **Compra de Propiedad**
  - [ ] Seleccionar propiedad → ver detalles
  - [ ] Agregar al carrito
  - [ ] Checkout con Stripe/Conekta
  - [ ] Pago exitoso → voucher generado
  - [ ] Email de confirmación enviado

- [ ] **Cancelación 120h**
  - [ ] Compra < 120h → botón "Cancelar" visible
  - [ ] Click cancelar → modal de confirmación
  - [ ] Confirmar → auto-aprobado inmediatamente
  - [ ] Compra > 120h → botón "Solicitar cancelación"
  - [ ] Solicitud enviada → pendiente de aprobación admin

- [ ] **Download Legal Package**
  - [ ] Click "Descargar documentos legales"
  - [ ] ZIP descargado con 5 archivos:
    - [ ] terms.pdf
    - [ ] privacy.pdf
    - [ ] contract.pdf
    - [ ] receipt.pdf
    - [ ] voucher.pdf
  - [ ] Verificar SHA-256 del ZIP

- [ ] **i18n**
  - [ ] Cambiar idioma navegador a EN
  - [ ] Navegar a /terms → contenido en inglés
  - [ ] Navegar a /privacy → contenido en inglés
  - [ ] Cambiar a ES → contenido en español
  - [ ] Fechas formateadas correctamente por locale
  - [ ] Moneda formateada correctamente (MXN, USD, EUR)

- [ ] **Accesibilidad**
  - [ ] Tab navigation funciona en todo el sitio
  - [ ] Skip to main content link visible al presionar Tab
  - [ ] Screen reader lee correctamente (NVDA/JAWS)
  - [ ] Contraste de colores ≥4.5:1 (WCAG AA)
  - [ ] Imágenes tienen alt text
  - [ ] Forms tienen labels asociados

- [ ] **Responsive Design**
  - [ ] Mobile (375px) → cards en lugar de tablas
  - [ ] Tablet (768px) → layout adaptado
  - [ ] Desktop (1920px) → layout completo
  - [ ] No scroll horizontal en ningún breakpoint

---

## 🚦 Pre-Production Checklist

### Antes de Deploy a Producción

#### 1. Código
- [ ] `npm run lint` sin errores
- [ ] `npm run build` exitoso
- [ ] `npm run validate-env` pasa
- [ ] No console.logs en código de producción
- [ ] No TODOs críticos pendientes

#### 2. Seguridad
- [ ] Todas las claves en variables de entorno
- [ ] RLS habilitado en todas las tablas sensibles
- [ ] Rate limiting configurado
- [ ] 2FA obligatorio para admins
- [ ] Webhooks con verificación de firma
- [ ] HTTPS forzado en producción

#### 3. Base de Datos
- [ ] Migraciones ejecutadas
- [ ] Seeds de datos de prueba (si aplica)
- [ ] Backups configurados
- [ ] RLS policies testeadas
- [ ] Índices creados para queries frecuentes

#### 4. Integraciones
- [ ] Stripe en modo live (no test)
- [ ] Conekta configurado
- [ ] Mifiel con credenciales de producción
- [ ] Supabase en plan adecuado
- [ ] Resend con dominio verificado

#### 5. Monitoring
- [ ] Vercel Analytics habilitado
- [ ] Error tracking configurado
- [ ] Logs de aplicación funcionando
- [ ] Alertas configuradas para errores críticos

#### 6. Performance
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥95
- [ ] Images optimizadas (WebP/AVIF)
- [ ] Lazy loading implementado
- [ ] CDN configurado

#### 7. Legal
- [ ] Términos y condiciones actualizados
- [ ] Política de privacidad actualizada
- [ ] Aviso de cookies implementado
- [ ] GDPR compliance (si aplica)
- [ ] Contratos legales revisados por abogado

#### 8. Testing
- [ ] Todos los flujos críticos testeados manualmente
- [ ] Lighthouse audits pasando
- [ ] Security audit sin vulnerabilidades críticas
- [ ] Load testing realizado (si aplica)

---

## 🐛 Debugging Common Issues

### Issue: 404 en /auth/setup-2fa

**Causa:** Next.js intentando generar página estáticamente

**Solución:**
```tsx
// app/auth/setup-2fa/page.tsx
export const dynamic = "force-dynamic"
```

### Issue: Rate Limiting No Funciona

**Causa:** IP no detectada correctamente

**Solución:**
```typescript
// middleware.ts
const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
```

### Issue: Webhook Duplicados

**Causa:** Falta verificación de event_id

**Solución:**
```typescript
// Verificar si event_id ya existe en webhook_events
const existing = await supabase
  .from('webhook_events')
  .select('id')
  .eq('event_id', eventId)
  .single()

if (existing.data) {
  return NextResponse.json({ ok: true, dedup: true })
}
```

### Issue: i18n No Cambia Idioma

**Causa:** Cookie de locale no se está seteando

**Solución:**
```typescript
// Verificar que el middleware setea la cookie
response.cookies.set('locale', detectedLocale, { 
  maxAge: 31536000,
  path: '/' 
})
```

---

## 📞 Soporte

Si encuentras issues durante testing:

1. **Revisar logs:** Vercel Dashboard → Logs
2. **Verificar variables de entorno:** Vercel Dashboard → Settings → Environment Variables
3. **Consultar documentación:** `/docs` folder
4. **Contactar equipo:** soporte@weekchain.com

---

**Última actualización:** 2025-01-29
**Versión:** 1.0.0
**Mantenido por:** Equipo QA WEEK-CHAIN™
