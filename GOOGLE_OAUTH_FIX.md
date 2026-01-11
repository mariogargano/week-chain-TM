# Solución para "Este contenido está bloqueado" - Google OAuth

El error "Este contenido está bloqueado" ocurre porque tu aplicación de Google Cloud Console está en modo de **Testing** (prueba) y el usuario que intenta iniciar sesión no está en la lista de usuarios de prueba.

## Solución Rápida (Recomendada)

### Opción 1: Agregar Usuarios de Prueba
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **OAuth consent screen**
4. En la sección **Test users**, haz clic en **+ ADD USERS**
5. Agrega los emails de los usuarios que necesitan acceso
6. Guarda los cambios

### Opción 2: Publicar la Aplicación (Producción)
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **OAuth consent screen**
4. Haz clic en **PUBLISH APP**
5. Confirma la publicación

**Nota:** Para publicar, necesitas tener completado:
- Nombre de la aplicación
- Email de soporte del usuario
- Logo de la aplicación (opcional pero recomendado)
- Política de privacidad (URL)
- Términos de servicio (URL)

## Verificar Configuración de URLs

### En Google Cloud Console:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://week-chain.com
https://preview-week-chain-tm-kzmixjw0ukn6nqfz0fw5.vusercontent.net
```

**Authorized redirect URIs:**
```
https://crntumktmfpgkyzfoewj.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
https://week-chain.com/auth/callback
https://preview-week-chain-tm-kzmixjw0ukn6nqfz0fw5.vusercontent.net/auth/callback
```

### En Supabase Dashboard:

1. Ve a **Authentication** → **URL Configuration**
2. **Site URL:** `https://week-chain.com` (o tu dominio de producción)
3. **Redirect URLs:** Agrega:
   ```
   http://localhost:3000/**
   https://week-chain.com/**
   https://preview-week-chain-tm-kzmixjw0ukn6nqfz0fw5.vusercontent.net/**
   https://*-tu-equipo.vercel.app/**
   ```

## Verificar que Google OAuth está Habilitado en Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard/project/crntumktmfpgkyzfoewj)
2. Ve a **Authentication** → **Providers**
3. Busca **Google** y verifica que esté **Enabled**
4. Verifica que tengas configurado:
   - **Client ID** (de Google Cloud Console)
   - **Client Secret** (de Google Cloud Console)

## Variables de Entorno

Verifica que tengas estas variables en tu proyecto:
```
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-client-id
```

## Testing

Una vez configurado:
1. Intenta iniciar sesión con un email que esté en la lista de usuarios de prueba
2. O publica la app para permitir cualquier usuario de Google

El código de la plataforma ya está correctamente configurado y funcionará automáticamente una vez que completes estos pasos.
