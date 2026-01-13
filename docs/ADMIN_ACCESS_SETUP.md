# Configuración de Acceso de Administrador

## Problema Resuelto

El sistema ahora tiene autenticación de administrador completamente funcional para `corporativo@morises.com`.

## ¿Qué se arregló?

### 1. **Script SQL para Admin User**
- Creado `scripts/CREATE_ADMIN_USER.sql` para insertar el usuario administrador directamente
- Elimina duplicados automáticamente antes de insertar
- Genera UUID automático para el ID

### 2. **RoleGuard Mejorado**
- Cambiado de `getSession()` a `getUser()` para verificación más confiable
- Usa `upsert()` en lugar de `insert()` para evitar errores de duplicado
- No falla si admin_users no se puede actualizar (el admin sigue teniendo acceso)
- Listener mejorado de auth state para manejar SIGNED_IN, TOKEN_REFRESHED, y SIGNED_OUT

### 3. **Flujo de Autenticación Simplificado**
- Si el email es `corporativo@morises.com` → acceso admin inmediato
- No depende de la tabla `admin_users` existiendo
- Mantiene sesión estable con refresh automático de tokens

## Cómo Usar

### Paso 1: Ejecutar Script SQL (OPCIONAL)
Si quieres ver el registro en `admin_users`:
```sql
-- Ejecutar en Supabase SQL Editor
\i scripts/CREATE_ADMIN_USER.sql
```

### Paso 2: Login Normal
1. Ve a `/auth`
2. Login con: `corporativo@morises.com`
3. El sistema detectará automáticamente que eres admin
4. Acceso completo al dashboard admin en `/dashboard/admin`

## Estado de Sesión

La sesión ahora se mantiene estable porque:
- `lib/supabase/middleware.ts` refresca tokens automáticamente
- `RoleGuard` escucha cambios de auth y mantiene sincronización
- No hay verificaciones redundantes de Supabase en el middleware raíz

## Debug

Si hay problemas, revisa la consola del navegador:
- `[v0] Checking authorization for: corporativo@morises.com`
- `[v0] Admin email detected - granting access`
- `[v0] Access granted`

Si ves errores de upsert, ignóralos - el admin tendrá acceso de todos modos.
