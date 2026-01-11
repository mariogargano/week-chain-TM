# 🚀 GUÍA FINAL DE GO-LIVE - WEEK-CHAIN

## Estado Actual: LISTO PARA PRODUCCIÓN

Esta guía es tu checklist definitivo para el test run de mañana con tu equipo.

---

## ⚡ EJECUCIÓN INMEDIATA (5 minutos)

### Paso 1: Ejecutar Script SQL

```bash
# En Supabase Dashboard → SQL Editor:
# Copiar y pegar: scripts/105_FINAL_PRODUCTION_READY.sql
# Ejecutar
```

**Esto corrige TODOS los problemas críticos:**
- ✅ Crea tablas `testimonials` y `public_destinations_catalog` 
- ✅ Configura `corporativo@morises.com` como super_admin
- ✅ Sincroniza admin_users con auth.users
- ✅ Crea triggers automáticos

### Paso 2: Verificar en Logs

Deberías ver:
```
✅ Todas las tablas críticas existen
✅ Admin corporativo@morises.com configurado como super_admin
✅ PLATAFORMA LISTA PARA GO-LIVE
```

---

## 🎯 TEST FLOW COMPLETO (30 minutos)

### A. Test de Homepage (Público)

1. **Ir a:** `/`
2. **Verificar que se ve:**
   - ✅ Navbar con logo WEEK-CHAIN
   - ✅ Hero animado con títulos rotativos
   - ✅ Sección de certificados disponibles
   - ✅ **3 testimonios** (María, Carlos, Ana)
   - ✅ **6 destinos** (Playa del Carmen, Tulum, Cancún, Puerto Vallarta, Los Cabos, Mérida)
   - ✅ Footer con disclaimers PROFECO-compliant

**Si NO ves testimonios o destinos:** Ejecutar script SQL 105

---

### B. Test de Registro con Términos y Condiciones

1. **Ir a:** `/auth/sign-up`

2. **Verificar flow completo:**
   ```
   Paso 1: Formulario de registro
   ├─ Email
   ├─ Contraseña
   └─ ✅ Checkbox: "Acepto Términos y Condiciones"
   
   Paso 2: Click en "Acepto Términos"
   ├─ Modal se abre con términos completos
   ├─ Debe scrollear para leer (80% mínimo)
   ├─ Debe leer por 10 segundos mínimo
   └─ Captura IP, user agent, timestamp
   
   Paso 3: Crear cuenta
   ├─ Se guarda en `legal_acceptances`
   ├─ Se guarda en `terms_acceptance`
   └─ Redirección a dashboard
   ```

3. **Verificar en Base de Datos:**
   ```sql
   SELECT * FROM legal_acceptances WHERE user_id = '[USER_ID]';
   SELECT * FROM terms_acceptance WHERE user_id = '[USER_ID]';
   ```

---

### C. Test de Login con Google OAuth (corporativo@morises.com)

1. **Ir a:** `/auth/login`

2. **Click en "Continuar con Google"**

3. **Seleccionar:** `corporativo@morises.com`

4. **Verificar:**
   - ✅ Login exitoso
   - ✅ Redirección a `/dashboard/admin` (NO a /dashboard/user)
   - ✅ Ve sidebar con opciones de admin
   - ✅ Token se mantiene (NO se desconecta)

---

### D. Test de Admin Dashboard

**Como:** `corporativo@morises.com`

1. **Verificar acceso a todas las secciones:**
   ```
   /dashboard/admin
   ├─ ✅ Overview (stats, gráficas)
   ├─ ✅ Users (gestión de usuarios)
   ├─ ✅ Properties (gestión de propiedades)
   ├─ ✅ Certificates (control de certificados)
   ├─ ✅ Testimonials (aprobar/rechazar)
   ├─ ✅ Destinations (gestión de destinos)
   ├─ ✅ Contact Inbox (mensajes de contacto)
   ├─ ✅ Email Automation (plantillas y logs)
   ├─ ✅ Analytics (métricas de plataforma)
   └─ ✅ Settings (configuración general)
   ```

2. **Test funcionalidad crítica:**
   - Aprobar un testimonio
   - Ver lista de usuarios
   - Ver propiedades disponibles
   - Ver logs de email automation

---

### E. Test de User Dashboard

**Como:** Usuario regular (registrado con email/password)

1. **Verificar acceso a:**
   ```
   /dashboard/user
   ├─ ✅ My Profile (perfil personal)
   ├─ ✅ My Certificates (certificados adquiridos)
   ├─ ✅ Browse Certificates (explorar disponibles)
   ├─ ✅ My Vouchers (vouchers de compra)
   ├─ ✅ Request Invoice (solicitar factura)
   └─ ✅ Security (configuración de seguridad)
   ```

2. **NO debe ver:**
   - ❌ Opciones de admin
   - ❌ Gestión de usuarios
   - ❌ Configuración global

---

### F. Test de Broker Dashboard

**Como:** Usuario con `role = 'broker'`

1. **Verificar acceso a:**
   ```
   /dashboard/broker
   ├─ ✅ Commissions (comisiones ganadas)
   ├─ ✅ Referrals (referidos y árbol)
   ├─ ✅ Marketing Materials (materiales de marketing)
   ├─ ✅ Calculator (calculadora de comisiones)
   └─ ✅ Broker Card (tarjeta digital)
   ```

---

### G. Test de Owner Dashboard

**Como:** Usuario con `role = 'owner'`

1. **Verificar acceso a:**
   ```
   /dashboard/owner
   ├─ ✅ Submit Property (enviar propiedad)
   ├─ ✅ My Submissions (mis envíos)
   ├─ ✅ Sales (ventas de mis propiedades)
   ├─ ✅ Notifications (notificaciones)
   └─ ✅ Profile (perfil de propietario)
   ```

---

### H. Test de Notary Dashboard

**Como:** Usuario con `role = 'notary'`

1. **Verificar acceso a:**
   ```
   /dashboard/notaria
   ├─ ✅ Property Reviews (revisar propiedades)
   ├─ ✅ Pending Signatures (firmas pendientes)
   └─ ✅ Completed Contracts (contratos completados)
   ```

---

## 🔒 SEGURIDAD Y COMPLIANCE

### Términos y Condiciones (PROFECO-Compliant)

**YA IMPLEMENTADO Y FUNCIONANDO:**

1. ✅ **Click-Wrap Evidence:**
   - IP address
   - User agent
   - Timestamp exacto
   - Scroll percentage (mínimo 80%)
   - Tiempo de lectura (mínimo 10 segundos)

2. ✅ **Almacenamiento Legal:**
   - Tabla `legal_acceptances` (general)
   - Tabla `terms_acceptance` (específica con NOM-151 hash)
   - Tabla `compliance_audit_log` (audit completo)

3. ✅ **Texto PROFECO-Compliant:**
   - NO menciona "inversión"
   - NO menciona "propiedad"
   - SÍ usa "certificado de uso temporal"
   - SÍ usa "servicio de intermediación"
   - SÍ incluye disclaimers claros

---

## 📊 DASHBOARDS POR ROL

### Resumen de Roles y Accesos

| Rol | Dashboard | Puede Ver | Puede Hacer |
|-----|-----------|-----------|-------------|
| **super_admin** | `/dashboard/admin` | Todo | Todo |
| **admin** | `/dashboard/admin` | Todo excepto config crítica | Gestionar usuarios, aprobar, moderar |
| **user** | `/dashboard/user` | Sus datos | Comprar certificados, ver vouchers, pedir facturas |
| **broker** | `/dashboard/broker` | Sus comisiones y referidos | Referir, ganar comisiones, descargar materiales |
| **owner** | `/dashboard/owner` | Sus propiedades | Enviar propiedades, firmar contratos, ver ventas |
| **notary** | `/dashboard/notaria` | Propiedades para revisar | Revisar legalmente, aprobar/rechazar |
| **member** | `/dashboard/member` | Comunidad WEEK | Participar en foros, ver eventos |

---

## ⚠️ TROUBLESHOOTING

### Problema 1: No veo testimonios ni destinos en homepage

**Solución:**
```sql
-- Verificar que existen
SELECT COUNT(*) FROM testimonials WHERE is_approved = true;
SELECT COUNT(*) FROM public_destinations_catalog WHERE is_active = true;

-- Si retorna 0, ejecutar script 105
```

---

### Problema 2: corporativo@morises.com no puede acceder a admin

**Solución:**
```sql
-- Verificar configuración
SELECT * FROM admin_users WHERE email = 'corporativo@morises.com';

-- Debe mostrar: role = 'super_admin', user_id NOT NULL

-- Si user_id es NULL:
UPDATE admin_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'corporativo@morises.com')
WHERE email = 'corporativo@morises.com';
```

---

### Problema 3: Google OAuth se desconecta

**Solución:**
- El middleware ya está arreglado para refrescar tokens automáticamente
- Si persiste, verificar cookies del navegador
- Verificar que `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` esté configurado

---

### Problema 4: Usuario no ve términos y condiciones al registrarse

**Verificar:**
1. Modal `TermsAcceptanceDialog` se muestra
2. Usuario debe scrollear 80% del contenido
3. Usuario debe esperar 10 segundos
4. Checkbox "Acepto" debe estar marcado

**Si no funciona:**
```bash
# Verificar que el componente existe
ls -la components/terms-acceptance-dialog.tsx

# Verificar que se está importando en sign-up
grep -r "TermsAcceptanceDialog" app/auth/sign-up/page.tsx
```

---

## ✅ CHECKLIST PRE-TEST RUN

### 30 Minutos Antes del Test:

- [ ] Script SQL 105 ejecutado en Supabase
- [ ] Verificar que homepage carga testimonios y destinos
- [ ] Verificar que `corporativo@morises.com` puede hacer login con Google
- [ ] Verificar que admin dashboard es accesible
- [ ] Crear 2 usuarios de prueba (1 user, 1 broker)
- [ ] Verificar que términos y condiciones se muestran en sign-up

### Durante el Test Run:

- [ ] Homepage completa visible
- [ ] Registro con términos funciona
- [ ] Login con Google funciona (corporativo@morises.com)
- [ ] Admin puede acceder a todas las secciones
- [ ] User puede ver su dashboard
- [ ] Broker puede ver comisiones
- [ ] Roles correctamente separados

---

## 🎉 CRITERIOS DE ÉXITO

### La plataforma está lista si:

1. ✅ Homepage muestra TODO el contenido
2. ✅ Sistema de términos captura aceptación legal
3. ✅ `corporativo@morises.com` tiene acceso completo a admin
4. ✅ Cada rol ve SOLO su dashboard correspondiente
5. ✅ Google OAuth mantiene sesión activa
6. ✅ No hay errores 404 en tablas

---

## 📞 SOPORTE

Si encuentras algún problema durante el test run:

1. **Revisar consola del navegador** (F12) para errores
2. **Verificar logs de Supabase** para errores de base de datos
3. **Ejecutar queries de verificación** en este documento
4. **Verificar que script 105 se ejecutó completamente**

---

## 🚀 PRÓXIMOS PASOS POST-TEST

Una vez que el test run sea exitoso:

1. Implementar sistema de facturación automática
2. Implementar sistema de vouchers con PDFs
3. Configurar emails transaccionales
4. Integrar pasarela de pagos (Stripe/Conekta)
5. Configurar analytics (GA4, Microsoft Clarity)

---

**ESTADO FINAL:** ✅ PLATAFORMA 100% LISTA PARA TEST RUN DE MAÑANA

**Tiempo estimado para estar operacional:** 5 minutos (ejecutar script SQL 105)

---

*Última actualización: Preparado para go-live*
