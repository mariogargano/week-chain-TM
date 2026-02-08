# WEEK-CHAIN - GO-LIVE CHECKLIST
**Test Run Date: Tomorrow**  
**Admin Email: corporativo@morises.com**  
**Access Method: Google OAuth**

---

## PASO 1: EJECUTAR SCRIPT SQL (5 minutos)

### En Supabase Dashboard:

1. Ve a **SQL Editor**
2. Copia el contenido de `scripts/104_FINAL_PRODUCTION_FIX.sql`
3. Click en **Run**
4. Verifica que aparezcan los mensajes:
   \`\`\`
   Testimonials table created with 3 records
   Destinations catalog created with 6 records
   Admin configured: true
   ✅ WEEK-CHAIN PRODUCTION FIX COMPLETED SUCCESSFULLY!
   \`\`\`

---

## PASO 2: CONFIGURAR ADMIN ACCESS (2 minutos)

### Acceso al Admin Panel:

1. Ve a `https://[tu-dominio]/auth/login`
2. Click en **"Iniciar con Google"**
3. Selecciona la cuenta `corporativo@morises.com`
4. **IMPORTANTE**: La primera vez que te conectes con Google:
   - Se creará automáticamente tu usuario en `auth.users`
   - Se creará automáticamente tu profile en `profiles`
   - Se configurará automáticamente como super_admin en `admin_users`
5. Serás redirigido a `/dashboard/admin`

---

## PASO 3: TEST RUN CON TU EQUIPO

### A. Test de Registro y Términos (Usuario Normal)

#### 3.1 Registro con Email
\`\`\`
✅ Ir a /auth/sign-up
✅ Completar formulario
✅ DEBE aparecer el diálogo de términos y condiciones
✅ DEBE mostrar:
   - Términos y Condiciones completos
   - Aviso de Privacidad
   - Checkbox de aceptación
   - Links a /terms y /privacy
✅ Aceptar términos
✅ Verificar email de bienvenida
✅ Login exitoso
\`\`\`

#### 3.2 Registro con Google OAuth
\`\`\`
✅ Ir a /auth/sign-up
✅ Click "Registrar con Google"
✅ DEBE aparecer el diálogo de términos ANTES de redirigir a Google
✅ Aceptar términos
✅ Completar OAuth de Google
✅ Redirigir a dashboard de usuario
\`\`\`

### B. Test de Login (Usuario Existente)

\`\`\`
✅ Ir a /auth/login
✅ Ingresar credenciales
✅ SI no ha aceptado términos: mostrar diálogo
✅ SI ya aceptó términos: login directo
✅ Redirigir a dashboard correcto según rol
\`\`\`

### C. Test de Admin Panel

\`\`\`
✅ Login como corporativo@morises.com (Google)
✅ Verificar redirección a /dashboard/admin
✅ Verificar acceso a:
   - Analytics
   - Testimonios (ver los 3 demo)
   - Destinos (ver los 6 destinos)
   - Contactos
   - Email Automation
   - System Diagnostics
   - Todas las demás secciones admin
\`\`\`

### D. Test de Homepage

\`\`\`
✅ Visitar /
✅ Ver Navbar funcionando
✅ Ver Hero animado
✅ Ver sección de Testimonios (3 testimonios)
✅ Ver sección de Destinos (6 destinos mexicanos)
✅ Ver sección de Certificados
✅ Ver Footer con disclaimers PROFECO
\`\`\`

---

## PASO 4: VERIFICAR BASE DE DATOS

### Verificaciones Críticas:

\`\`\`sql
-- 1. Verificar que testimonials existe
SELECT COUNT(*) FROM public.testimonials;
-- Debe retornar: 3

-- 2. Verificar que destinations existe
SELECT COUNT(*) FROM public.public_destinations_catalog;
-- Debe retornar: 6

-- 3. Verificar admin configurado
SELECT * FROM public.admin_users WHERE email = 'corporativo@morises.com';
-- Debe mostrar: role = 'super_admin', status = 'active'

-- 4. Verificar profiles de usuarios
SELECT COUNT(*) FROM public.profiles;
-- Debe ser > 0

-- 5. Verificar términos aceptados
SELECT COUNT(*) FROM public.legal_acceptances;
-- Debe incrementar con cada registro nuevo
\`\`\`

---

## PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "No veo la plataforma"
**Solución**: Las tablas `testimonials` y `public_destinations_catalog` no existen. Ejecuta el script SQL del PASO 1.

### Problema 2: "No puedo acceder al admin panel"
**Causas posibles**:
1. No usaste el email `corporativo@morises.com`
2. No te has conectado por primera vez con Google (necesario para crear el usuario)
3. La tabla `admin_users` no tiene la columna `user_id`

**Solución**: Ejecuta el script SQL del PASO 1 que agrega la columna y configura todo automáticamente.

### Problema 3: "No aparecen los términos y condiciones"
**Verificar**:
\`\`\`sql
SELECT * FROM public.terms_and_conditions;
\`\`\`
Si está vacía, el componente mostrará términos por defecto del código.

### Problema 4: "Error: relation does not exist"
**Solución**: Ejecuta el script SQL completo. Alguna tabla no se creó.

---

## FLUJO COMPLETO DE USUARIO (LO QUE NECESITAS)

### 1. REGISTRO
\`\`\`
Usuario → /auth/sign-up
↓
Completa formulario
↓
[MODAL] Términos y Condiciones aparece
↓
Lee términos (scroll tracking)
↓
Acepta con checkbox
↓
Click "Aceptar y Continuar"
↓
Se guarda en legal_acceptances con:
  - IP address
  - User agent
  - Timestamp
  - Versión de términos
↓
Se crea cuenta
↓
Redirige a dashboard
\`\`\`

### 2. SELECCIÓN DE CERTIFICADO
\`\`\`
Usuario autenticado → /certificates
↓
Ve catálogo de certificados
↓
Selecciona certificado
↓
Procede a checkout
↓
Paga (Stripe/Conekta)
↓
Sistema genera voucher automático con:
  - Código único (WC-YYYY-XXXX-XXXX)
  - Datos del certificado
  - Datos del usuario
  - PDF descargable
↓
Envío de email con voucher
\`\`\`

### 3. FACTURACIÓN EN DASHBOARD
\`\`\`
Usuario → /dashboard/my-certificates
↓
Ve su certificado con voucher
↓
Click "Solicitar Factura"
↓
[MODAL] Datos fiscales:
  - RFC
  - Razón Social
  - Domicilio Fiscal
  - Uso de CFDI
↓
Submit solicitud
↓
Se guarda en invoice_requests
↓
Admin procesa y envía factura
\`\`\`

---

## MÉTRICAS A MONITOREAR MAÑANA

### Durante el Test Run:

1. **Conversión de Registro**
   - ¿Cuántos completan el formulario?
   - ¿Cuántos aceptan términos?
   - ¿Cuántos terminan el registro?

2. **Tiempo en Términos**
   - ¿Cuánto tiempo leen los términos?
   - ¿Hacen scroll completo?

3. **Errores**
   - ¿Aparecen errores 404?
   - ¿Fallan las APIs?
   - ¿Se caen las conexiones?

4. **Performance**
   - ¿Carga rápido la homepage?
   - ¿Responden rápido las APIs?

---

## CONTACTO DE EMERGENCIA

Si algo falla durante el test run:

1. Revisa logs de Supabase
2. Revisa console del navegador (F12)
3. Verifica que el script SQL se ejecutó completamente
4. Confirma que `corporativo@morises.com` se conectó al menos una vez con Google

---

## CHECKLIST FINAL PRE-LAUNCH

\`\`\`
☐ Script SQL ejecutado exitosamente
☐ Admin puede acceder a /dashboard/admin
☐ Homepage se ve correctamente con todos los componentes
☐ Términos y condiciones aparecen al registrarse
☐ Google OAuth funciona correctamente
☐ Email/password auth funciona
☐ Tablas de base de datos verificadas
☐ Equipo informado del proceso
☐ Backup de base de datos realizado
☐ Variables de entorno verificadas
\`\`\`

---

**¡LA PLATAFORMA ESTÁ LISTA PARA EL GO-LIVE! 🚀**

**IMPORTANTE**: El admin (`corporativo@morises.com`) DEBE conectarse por primera vez con Google OAuth para que se cree su usuario y se configure automáticamente como super_admin.
