# Configuración de Google OAuth para WEEK-CHAIN

## Paso 1: Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services > Credentials**
4. Haz clic en **Create Credentials > OAuth 2.0 Client ID**
5. Configura la pantalla de consentimiento OAuth si aún no lo has hecho
6. Selecciona **Web application** como tipo de aplicación
7. Agrega las siguientes **Authorized redirect URIs**:
   ```
   https://crntumktmfpgkyzfoewj.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
8. Guarda el **Client ID** y **Client Secret**

## Paso 2: Configurar Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard/project/crntumktmfpgkyzfoewj)
2. Ve a **Authentication > Providers**
3. Busca **Google** en la lista de providers
4. Habilita el toggle de Google
5. Pega el **Client ID** de Google
6. Pega el **Client Secret** de Google
7. Haz clic en **Save**

## Paso 3: Configurar Authorized Domains

En Google Cloud Console, agrega estos dominios autorizados:
- `localhost`
- `week-chain.com` (o tu dominio de producción)
- `crntumktmfpgkyzfoewj.supabase.co`

## Paso 4: Variables de Entorno

Asegúrate de tener estas variables en tu proyecto:
```
NEXT_PUBLIC_SUPABASE_URL=https://crntumktmfpgkyzfoewj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
```

## Verificación

Una vez completado, el botón "Continuar con Google" aparecerá automáticamente en la página de autenticación.

Si ves el error "Unsupported provider", verifica que:
1. Google está habilitado en Supabase Dashboard
2. El Client ID y Secret están correctamente configurados
3. Las redirect URIs coinciden exactamente

## Soporte

Si tienes problemas, revisa los logs en la consola del navegador (console.log("[v0]..."))
