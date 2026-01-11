# Guía Completa de Testing de Autenticación WEEK-CHAIN

## Resumen del Sistema

WEEK-CHAIN utiliza **Supabase Auth** con soporte para:
- ✅ Email/Password tradicional
- ✅ Google OAuth
- ✅ Creación automática de profiles
- ✅ Sistema de roles (user, admin, broker, etc.)
- ✅ Admin panel con verificación estricta

---

## Pre-requisitos

### 1. Variables de Entorno Necesarias

Verifica que tengas estas variables en tu proyecto de Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (opcional pero recomendado)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Redirect URLs
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Ejecutar Scripts SQL

Ejecuta estos scripts en **Supabase Dashboard → SQL Editor** en este orden:

1. `095_fix_auth_profile_creation.sql` - Arregla creación de profiles
2. `093_email_automation_complete_setup.sql` - Sistema de emails (opcional)

---

## Testing Flow Completo

### FASE 1: Registro con Email/Password

#### 1.1 Crear Nueva Cuenta

1. Ve a `/auth/sign-up`
2. Completa el formulario:
   - Nombre: Juan Pérez
   - Email: juan.test@example.com
   - Password: MySecurePass123!
3. Haz clic en "Crear cuenta"

#### 1.2 Verificaciones Backend

Abre Supabase Dashboard y verifica:

**auth.users:**
```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'juan.test@example.com';
```

**profiles:**
```sql
SELECT id, username, display_name, email, role
FROM public.profiles
WHERE email = 'juan.test@example.com';
```

✅ **Resultado Esperado:**
- Usuario existe en auth.users
- Profile creado automáticamente con role='user'
- Username generado: `juan_perez_a1b2c3d4`

#### 1.3 Login

1. Ve a `/auth/login`
2. Ingresa credenciales
3. Verifica redirect a `/dashboard/user`

---

### FASE 2: Registro con Google OAuth

#### 2.1 Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea proyecto o usa existente
3. Habilita "Google+ API"
4. Crea credenciales OAuth 2.0:
   - **Authorized redirect URIs:**
     - `https://your-domain.com/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback` (dev)
5. Copia Client ID y Client Secret
6. Agrégalos a variables de entorno de Vercel

#### 2.2 Test Google Sign-Up

1. Ve a `/auth/sign-up`
2. Haz clic en "Registrar con Google"
3. Selecciona cuenta de Google
4. Acepta permisos

#### 2.3 Verificaciones Backend

```sql
-- Verificar usuario OAuth
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'provider' as provider,
  raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'tu-email-google@gmail.com';

-- Verificar profile
SELECT id, username, display_name, email, role, avatar_url
FROM public.profiles
WHERE email = 'tu-email-google@gmail.com';
```

✅ **Resultado Esperado:**
- Usuario con provider='google' en auth.users
- Profile creado con avatar de Google
- Username único generado
- Email verificado automáticamente

---

### FASE 3: Acceso al Admin Panel

#### 3.1 Configurar Admin

**Opción A: Usando el Script SQL**

Ejecuta `094_setup_admin_access.sql` después de cambiar el email a tu correo:

```sql
-- 1. Obtener tu user ID
SELECT id, email FROM auth.users WHERE email = 'TU_EMAIL_AQUI@example.com';

-- 2. Ejecutar el script con tu email
```

**Opción B: Manual via SQL**

```sql
-- Reemplaza 'tu-email@example.com' con tu email real
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'tu-email@example.com';

  IF admin_user_id IS NOT NULL THEN
    -- Update profile role
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = admin_user_id;

    -- Add to admin_users
    INSERT INTO public.admin_users (
      id, user_id, email, name, role, status, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_user_id,
      'tu-email@example.com',
      'Tu Nombre',
      'super_admin',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      role = 'super_admin',
      status = 'active';
  END IF;
END $$;
```

#### 3.2 Test Admin Access

1. Login con tu cuenta admin
2. Intenta acceder a `/dashboard/admin`
3. Verifica que NO seas redirigido

#### 3.3 Verificar Logs de Auditoria

```sql
SELECT 
  actor_email,
  action,
  entity_type,
  metadata,
  created_at
FROM admin_audit_log
WHERE actor_email = 'tu-email@example.com'
ORDER BY created_at DESC
LIMIT 10;
```

✅ **Resultado Esperado:**
- Log con action='ADMIN_ACCESS_GRANTED'
- metadata.accessed_path='/dashboard/admin'

---

### FASE 4: Test de Seguridad

#### 4.1 Test Usuario Normal Intentando Acceder Admin

1. Crea usuario de prueba: `test.user@example.com`
2. Login con esta cuenta
3. Intenta acceder manualmente a `/dashboard/admin`

✅ **Resultado Esperado:**
- Redirect automático a `/dashboard/user`
- Log creado con action='ADMIN_ACCESS_DENIED'

#### 4.2 Test Rate Limiting

1. Intenta hacer login 6 veces con password incorrecta
2. En el 6to intento deberías ver:
   ```
   "Too many signup attempts. Please try again in X minutes."
   ```

#### 4.3 Test Password Strength

1. Ve a `/auth/sign-up`
2. Intenta passwords débiles:
   - `12345` ❌ Muy corta
   - `password` ❌ Sin números/mayúsculas
   - `Password1` ✅ Válida

---

## Testing de Email Automation

### 1. Verificar Tablas de Email

```sql
-- Verificar templates
SELECT template_type, name, subject, active
FROM email_templates
WHERE active = true;

-- Verificar logs (después de enviar)
SELECT 
  template_type,
  recipient_email,
  status,
  sent_at,
  error_message
FROM email_logs
ORDER BY sent_at DESC
LIMIT 10;
```

### 2. Test Welcome Email

```sql
-- Simular envío manual
INSERT INTO email_logs (
  template_type,
  recipient_email,
  recipient_name,
  status,
  sent_at
) VALUES (
  'welcome',
  'test@example.com',
  'Test User',
  'sent',
  NOW()
);
```

---

## Troubleshooting Común

### Problema 1: Profile No se Crea Automáticamente

**Síntoma:** Usuario existe en auth.users pero no en profiles

**Solución:**
```sql
-- Verificar trigger existe
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si no existe, ejecutar 095_fix_auth_profile_creation.sql

-- Crear profiles manualmente para usuarios existentes
INSERT INTO public.profiles (id, username, display_name, email, role, created_at, updated_at)
SELECT 
  au.id,
  LOWER(REPLACE(split_part(au.email, '@', 1), '.', '_')) || '_' || substr(au.id::text, 1, 8),
  split_part(au.email, '@', 1),
  au.email,
  'user',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
```

### Problema 2: Google OAuth No Funciona

**Síntomas:**
- Error "Google authentication is not configured"
- Redirect loop

**Solución:**
1. Verifica variables de entorno:
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```
2. Verifica Authorized Redirect URIs en Google Console
3. Checa logs del API:
   ```
   /api/auth/google → debe mostrar logs en consola
   ```

### Problema 3: No Puedo Acceder a Admin Panel

**Síntomas:**
- Redirect a /dashboard/user
- "Access Denied"

**Diagnóstico:**
```sql
-- 1. Verificar tu rol
SELECT id, email, role FROM profiles WHERE email = 'tu-email@example.com';

-- 2. Verificar admin_users
SELECT user_id, email, role, status 
FROM admin_users 
WHERE email = 'tu-email@example.com';

-- 3. Verificar logs
SELECT action, metadata 
FROM admin_audit_log 
WHERE actor_email = 'tu-email@example.com'
ORDER BY created_at DESC LIMIT 5;
```

**Solución:**
- Ejecuta `094_setup_admin_access.sql` con tu email
- Verifica que `role = 'super_admin'` y `status = 'active'`

---

## Checklist Final

Antes de lanzar a producción, verifica:

- [ ] Trigger de profiles funciona (test con nuevo usuario)
- [ ] Google OAuth configurado y testeado
- [ ] Admin access funciona correctamente
- [ ] Rate limiting activo
- [ ] Email templates creados y activos
- [ ] Resend API configurada (si usas emails)
- [ ] Middleware protege rutas correctamente
- [ ] Logs de auditoria funcionan
- [ ] Password strength validando
- [ ] Terms acceptance dialog funciona

---

## Contacto

Si encuentras problemas no documentados aquí:

1. Revisa logs en Vercel: `vercel logs`
2. Revisa logs en Supabase: Dashboard → Logs
3. Busca `[v0]` en la consola del navegador
4. Abre issue en el repo con logs completos

---

**Última actualización:** Diciembre 2024
**Versión:** 1.0.0
