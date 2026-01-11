# WEEK-CHAIN - Guía de Autenticación

## Sistema de Autenticación Simplificado

WEEK-CHAIN usa **Supabase Auth** con dos métodos principales:

### 1. Google OAuth (Recomendado para Admin)
- Email: `corporativo@morises.com`
- **NO requiere contraseña**
- Login directo con cuenta de Google

### 2. Email + Password
- Para usuarios regulares
- Registro con términos y condiciones

---

## Acceso al Admin Dashboard

### Email Admin
```
corporativo@morises.com
```

### Método de Login
1. Ve a `/auth/login` o `/auth`
2. Haz click en "Iniciar con Google"
3. Selecciona la cuenta `corporativo@morises.com`
4. Automáticamente serás redirigido a `/dashboard/admin`

### Qué hace el sistema automáticamente

1. **Middleware** (`middleware.ts`):
   - Detecta ruta `/dashboard/admin`
   - Verifica que el usuario esté autenticado
   - Compara email con `corporativo@morises.com`
   - Si no coincide → redirige a `/dashboard/user`
   - Si coincide → permite acceso

2. **Admin Dashboard** (`app/dashboard/admin/page.tsx`):
   - Verifica sesión de Supabase
   - Busca en tabla `admin_users` por email
   - Si NO existe pero email es correcto → **auto-crea** entrada
   - Carga métricas y dashboard

3. **Google OAuth Callback** (`app/api/auth/google/callback/route.ts`):
   - Recibe código de Google
   - Obtiene información del usuario
   - Busca o crea usuario en Supabase
   - Crea profile automáticamente
   - **Trigger automático** sincroniza con `admin_users`

---

## Flujo Completo de Autenticación

### Para Admin (corporativo@morises.com)

```
1. Usuario hace click en "Iniciar con Google"
   ↓
2. Redirige a Google OAuth
   ↓
3. Google valida y devuelve código
   ↓
4. Callback crea/actualiza usuario en Supabase
   ↓
5. Trigger automático crea profile
   ↓
6. Si email = corporativo@morises.com
   → Actualiza admin_users.user_id
   ↓
7. Middleware verifica email en próxima navegación
   ↓
8. Admin Dashboard auto-crea entrada si falta
   ↓
9. ✓ Acceso completo al dashboard admin
```

### Para Usuarios Regulares

```
1. Usuario se registra con email + password
   ↓
2. Supabase crea entrada en auth.users
   ↓
3. Trigger automático crea profile con role = 'user'
   ↓
4. Usuario recibe email de confirmación
   ↓
5. Confirma email (si requerido)
   ↓
6. Login y acceso a /dashboard/user
```

---

## Configuración de Base de Datos

### Tablas Involucradas

1. **`auth.users`** (Supabase Auth)
   - Gestiona autenticación
   - Almacena emails y passwords hasheados
   - Maneja tokens y sesiones

2. **`profiles`** (public)
   - Un perfil por usuario
   - Vinculado a `auth.users` por `id`
   - Contiene `role` (user, broker, admin, etc.)

3. **`admin_users`** (public)
   - Lista de administradores autorizados
   - Columnas: `email`, `name`, `role`, `status`, `user_id`
   - **`user_id`** vincula con `auth.users.id`

### Trigger Automático

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear profile para nuevo usuario
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (NEW.id, NEW.email, NEW.email, 'user')
  ON CONFLICT (id) DO UPDATE SET email = NEW.email;

  -- Si es admin, sincronizar con admin_users
  IF NEW.email = 'corporativo@morises.com' THEN
    UPDATE public.admin_users
    SET user_id = NEW.id
    WHERE email = 'corporativo@morises.com';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Troubleshooting

### Problema: No puedo acceder al admin dashboard

**Solución 1**: Verificar que el script SQL se ejecutó
```sql
SELECT * FROM admin_users WHERE email = 'corporativo@morises.com';
```

Debe mostrar:
- `email`: corporativo@morises.com
- `role`: super_admin
- `status`: active
- `user_id`: UUID o NULL (se actualizará al login)

**Solución 2**: Login con Google y verificar
```sql
SELECT 
  au.email,
  au.role,
  au.status,
  au.user_id,
  u.email as auth_email
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
WHERE au.email = 'corporativo@morises.com';
```

**Solución 3**: Verificar middleware
- El middleware debe permitir paso si `user.email === 'corporativo@morises.com'`
- No requiere verificación de tabla si el email coincide

### Problema: Google OAuth falla

**Verificar**:
1. Variables de entorno configuradas:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_SITE_URL`

2. Configuración de Google OAuth:
   - Redirect URI: `https://tu-dominio.com/api/auth/google/callback`

### Problema: Sesión se pierde después de login

**Causa**: Middleware no está refrescando sesión
**Solución**: El script incluye fix en `lib/supabase/middleware.ts`

---

## Sistema de Términos y Condiciones

### Flujo de Aceptación

1. Usuario intenta registrarse o login
2. Si NO ha aceptado términos → muestra dialog
3. Usuario debe:
   - Scrollear hasta 80% del documento
   - Esperar mínimo 10 segundos
   - Hacer click en checkbox explícito
4. Sistema captura:
   - IP address
   - User agent
   - Timestamp
   - Términos version
5. Guarda en tabla `legal_acceptances` o `terms_acceptance`
6. Permite continuar con registro/login

### Cumplimiento PROFECO

- ✓ Click-wrap agreement (evidencia legal)
- ✓ Versioning de términos
- ✓ Timestamp de aceptación
- ✓ Datos de navegador e IP
- ✓ Scroll y tiempo mínimo de lectura

---

## Testing del Sistema

### 1. Test de Google OAuth Admin

```bash
# 1. Ir a /auth/login
# 2. Click "Iniciar con Google"
# 3. Seleccionar corporativo@morises.com
# 4. Debe redirigir a /dashboard/admin
# 5. Dashboard debe cargar sin errores
```

### 2. Test de Registro de Usuario

```bash
# 1. Ir a /auth/sign-up
# 2. Ver dialog de términos
# 3. Scrollear y esperar 10 seg
# 4. Aceptar términos
# 5. Completar registro
# 6. Verificar email
# 7. Login y acceso a /dashboard/user
```

### 3. Test de Base de Datos

```sql
-- Verificar admin configurado
SELECT * FROM admin_users WHERE email = 'corporativo@morises.com';

-- Verificar trigger funciona
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM auth.users;
-- Deben tener números similares

-- Verificar términos aceptados
SELECT * FROM legal_acceptances ORDER BY accepted_at DESC LIMIT 5;
```

---

## Próximos Pasos

1. **Ejecutar script SQL**: `107_FINAL_COMPLETE_PRODUCTION_FIX.sql`
2. **Verificar variables de entorno** están configuradas
3. **Test de Google OAuth** con `corporativo@morises.com`
4. **Test de registro** de usuario regular
5. **Verificar dashboards** funcionan correctamente

---

## Soporte

Si encuentras problemas:
1. Revisa los logs de la consola del navegador
2. Revisa logs de Supabase
3. Verifica que el script SQL se ejecutó completamente
4. Confirma que las variables de entorno están correctas
