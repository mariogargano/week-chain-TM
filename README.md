# WEEK-CHAIN Platform

Plataforma digital de Smart Vacational Certificates (SVC) - certificados de derecho de uso vacacional con validez legal conforme a NOM-151.

## Descripcion

WEEK-CHAIN ofrece certificados digitales de derecho personal y temporal para solicitar uso vacacional durante hasta 15 anos en destinos participantes, sujeto a disponibilidad. 

**Importante:** NO constituye propiedad inmobiliaria, tiempo compartido tradicional ni instrumento de inversion.

## Stack Tecnologico

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Pagos:** Stripe
- **Storage:** Vercel Blob
- **Deployment:** Vercel

## Caracteristicas Principales

- Smart Vacational Certificates (SVC) con validez de hasta 15 anos
- Sistema de reservaciones REQUEST -> OFFER -> CONFIRM
- Panel de administracion completo
- Oficina Virtual con agentes de IA especializados
- Programa Pre-Holder con depositos reembolsables
- Red de WEEK-AGENTS (brokers) con comision fija del 4%
- Documentacion digital conforme a NOM-151

## Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_BASE_URL=https://www.week-chain.com
NEXT_PUBLIC_ADMIN_EMAIL=
```

## Desarrollo

El proyecto usa **pnpm** como gestor de paquetes. No uses npm ni yarn para evitar conflictos de lockfile.

```bash
# Instalar dependencias (respeta pnpm-lock.yaml)
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Build de produccion
pnpm build

# Type-check sin compilar
pnpm exec tsc --noEmit
```

## Estructura del Proyecto

```
app/
  dashboard/
    admin/         # Panel de administracion
    user/          # Dashboard de usuarios
    broker/        # Panel de brokers/agentes
  api/             # API routes
  pre-holder/      # Programa Pre-Holder
components/        # Componentes React
lib/
  agents/          # Sistema de agentes IA
  auth/            # Autenticacion y roles
  security/        # Rate limiting, validacion
scripts/           # Migraciones SQL
docs/              # Documentacion tecnica
```

## Seguridad

- Autenticacion via Supabase Auth + Google OAuth
- Rate limiting en endpoints sensibles
- Validacion de inputs con whitelists
- RLS policies en base de datos
- Generacion segura de contrasenas (crypto.randomBytes)

## Licencia

Propiedad de WEEK-CHAIN. Todos los derechos reservados.
