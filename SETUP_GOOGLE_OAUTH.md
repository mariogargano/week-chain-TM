# Configuración de Google OAuth para Week-Chain

## Problema Actual
El error "Este contenido está bloqueado" ocurre porque Google OAuth no está completamente configurado.

## Pasos para Habilitar Google OAuth

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services > OAuth consent screen**
4. Configura la pantalla de consentimiento:
   - **Application name**: Week-Chain
   - **User support email**: tu@email.com
   - **Developer contact email**: tu@email.com
   - **Authorized domains**: week-chain.com, vercel.app

5. Ve a **APIs & Services > Credentials**
6. Click **Create Credentials > OAuth 2.0 Client ID**
7. Configura:
   - **Application type**: Web application
   - **Name**: Week-Chain Web Client
   - **Authorized JavaScript origins**:
     - `https://week-chain.com`
     - `https://your-project.vercel.app`
     - `http://localhost:3000` (para desarrollo)
   - **Authorized redirect URIs**:
     - `https://crntumktmfpgkyzfoewj.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (para desarrollo)

8. Guarda y copia el **Client ID** y **Client Secret**

### 2. Configurar Supabase

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard/project/crntumktmfpgkyzfoewj)
2. Ve a **Authentication > Providers**
3. Busca **Google** y habilítalo
4. Pega el **Client ID** y **Client Secret** de Google Cloud Console
5. Asegúrate de que estos scopes estén incluidos:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `openid`
6. Guarda los cambios

### 3. Variables de Entorno

Asegúrate de que estas variables estén configuradas (ya las tienes):
```
NEXT_PUBLIC_SUPABASE_URL=https://crntumktmfpgkyzfoewj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
```

### 4. Testing

1. Guarda todos los cambios en Google Cloud Console y Supabase
2. Espera 5-10 minutos para que los cambios se propaguen
3. Intenta hacer login con Google en: https://week-chain.com/auth

## Scopes Requeridos

El código ahora solicita explícitamente estos scopes:
- `https://www.googleapis.com/auth/userinfo.email` - Para obtener el email del usuario
- `https://www.googleapis.com/auth/userinfo.profile` - Para obtener nombre y foto del usuario

## Solución Temporal

Mientras configuras Google OAuth, los usuarios pueden:
- Usar email y contraseña para registro/login
- El sistema detecta automáticamente si Google está disponible

## Documentación Oficial

- [Supabase Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
