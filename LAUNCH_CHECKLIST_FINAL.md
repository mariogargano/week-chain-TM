# WEEK-CHAIN Launch Checklist - Final

## Pre-Launch Verification (48h antes)

### Autenticación y Usuarios
- [ ] Registro de usuario funciona (email + password)
- [ ] Login funciona correctamente
- [ ] Magic link (sin contraseña) funciona
- [ ] Google OAuth funciona
- [ ] Email de confirmación se envía (revisar spam)
- [ ] Redirect por rol funciona (member → /dashboard/member, admin → /dashboard/admin, broker → /dashboard/broker)

### Perfiles y Roles
- [ ] Perfil de usuario se crea automáticamente al registrarse
- [ ] Rol "member" asignado por defecto
- [ ] Rol "admin" solo accesible via invitación
- [ ] Rol "broker" disponible en /broker/apply
- [ ] Referral code se genera automáticamente

### Admin Panel
- [ ] /dashboard/admin accesible solo para admins
- [ ] Feature flags visible en /dashboard/admin/feature-flags
- [ ] Puedo activar/desactivar flags
- [ ] Los cambios se reflejan en <2s

### Broker Flow
- [ ] /broker/apply accesible públicamente
- [ ] Formulario de registro broker completo
- [ ] Email de confirmación enviado
- [ ] Acceso a /dashboard/broker después confirmar
- [ ] Tarjeta digital generada con QR
- [ ] Google Wallet pass descargable
- [ ] Apple Wallet pass descargable

### Database
- [ ] RLS habilitado en todas las tablas críticas
- [ ] Users no pueden ver datos de otros users
- [ ] Admins pueden ver todo (excepto passwords)
- [ ] Brokers ven solo sus datos

### Pagos (Cuando esté habilitado)
- [ ] Stripe live keys configuradas (no test)
- [ ] Checkout funciona en producción
- [ ] Webhooks se reciben correctamente
- [ ] Orders se crean en base de datos
- [ ] Confirmación de pago funciona

## Pre-Deploy (4h antes)

- [ ] Database backup realizado
- [ ] Feature flags por defecto correctos (todos false excepto PUBLIC_SIGNUP_ENABLED)
- [ ] Monitoring configurado (Sentry, logs)
- [ ] Error tracking activo
- [ ] Team en standby para rollback

## Deploy (T=0)

- [ ] Código pusheado a main en GitHub
- [ ] Deploy en Vercel iniciado
- [ ] Esperando confirmación de deployment exitoso
- [ ] Health check: /api/health respondiendo 200

## Post-Deploy (Primera hora)

### T+5min
- [ ] Sitio carga correctamente
- [ ] Home page visible sin errores
- [ ] Auth page funciona

### T+10min
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Redirect por rol funciona

### T+15min
- [ ] Admin panel accesible
- [ ] Feature flags visibles
- [ ] Base de datos respondiendo

### T+20min
- [ ] Email confirmación llegando (revisar spam)
- [ ] No hay spike de errores en Sentry
- [ ] Latencia promedio <2s

### T+30min
- [ ] Monitoreo estable
- [ ] Errores <0.5%
- [ ] Usuarios registrados exitosamente
- [ ] Broker flow funcionando

## Rollout Gradual (Post Deploy)

### Fase 1 (Inmediato)
- [ ] PUBLIC_SIGNUP_ENABLED = true (ya está por defecto)
- [ ] Monitoreo por 30min

### Fase 2 (+15min)
- [ ] CERTIFICATE_ISSUANCE_ENABLED = true
- [ ] Monitoreo por 30min

### Fase 3 (+30min si todo OK)
- [ ] EMAILS_ENABLED = true
- [ ] Monitoreo por 30min

### Fase 4 (+1h si todo OK)
- [ ] KYC_ENABLED = true
- [ ] Monitoreo por 1h

### Fase 5 (+2h si todo OK)
- [ ] PAYMENTS_ENABLED = true (cuando esté ready)
- [ ] Monitoreo por 2h

## Go/No-Go Decision Points

### Go Criteria (Todos deben ser sí)
- [ ] Deploy exitoso sin errores
- [ ] Home page carga <2s
- [ ] Auth funciona (registro, login, magic link)
- [ ] Error rate <0.5% en T+20min
- [ ] Database respondiendo
- [ ] Email enviando (si habilitado)
- [ ] No RLS leaks
- [ ] Monitoring activo

### No-Go Criteria (Cualquiera = ROLLBACK)
- [ ] Deploy falló
- [ ] Home page 500 error
- [ ] Auth completamente roto
- [ ] Error rate >5%
- [ ] Database inaccessible
- [ ] RLS leak detectado
- [ ] Memory leak causando crashes
- [ ] External service crítico down (Supabase, Stripe si habilitado)

## Rollback Procedure (Si No-Go)

Si cualquiera de los No-Go criteria aplica:

1. Ejecutar: `git revert <commit-hash>`
2. Esperar deploy (5-10min)
3. Verificar: Home page carga correctamente
4. Esperar: Monitoreo estable <0.5% errors
5. Post-mortem: Analizar qué falló

## Success Metrics (24h después)

- [ ] 1000+ usuarios registrados
- [ ] Error rate <0.1%
- [ ] P95 latency <1.5s
- [ ] Zero RLS breaches
- [ ] Uptime 100%
- [ ] No critical issues abiertos

## Sign-Off

| Role | Name | Firma | Timestamp |
|------|------|-------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| DevOps | | | |
| QA Lead | | | |

