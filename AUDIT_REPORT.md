# WEEK-CHAIN / WEEK-WORLD - Auditoria Tecnica Completa

**Fecha:** 25 de Febrero 2026  
**Autor:** Arquitecto Principal + QA Lead  
**Estado General: 🟡 PARCIAL (~45% completitud real para MVP operacional)**

---

## 1. REPORTE EJECUTIVO

### Completitud por Modulo

| Modulo | % | Estado |
|---|---|---|
| A) Auth + Roles | 75% | 🟡 |
| B) Base de datos y migraciones | 70% | 🟡 |
| C) RLS (Row Level Security) | 40% | 🔴 |
| D) Flujo de compra SVC (end-to-end) | 55% | 🟡 |
| E) KYC Persona | 50% | 🟡 |
| F) Legal / NOM-151 / EasyLex | 45% | 🟡 |
| G) Reservaciones REQUEST > OFFER > CONFIRM | 60% | 🟡 |
| H) Propiedades + semanas (inventory) | 65% | 🟡 |
| I) Broker / Comisiones 4% | 55% | 🟡 |
| J) Admin Dashboard | 70% | 🟡 |
| K) Notificaciones | 20% | 🔴 |
| L) Portales externos | 15% | 🔴 |

### Top 10 Blockers para Lanzar

1. **Tablas faltantes en BD**: `user_certificates`, `user_certificates_v2`, `supply_properties`, `confirmed_reservations`, `legal_contracts` - referenciadas en el codigo pero NO existen en la BD live. Esto rompe el flujo de reservaciones y compra.
2. **RLS deshabilitado en tablas criticas**: `users`, `reservations`, `week_tokens`, `properties`, `admin_users` no tienen RLS. Cualquier usuario autenticado puede leer/escribir datos de otros.
3. **Stripe env vars no configuradas**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` faltan. El checkout no funciona.
4. **Conekta sin credenciales**: `CONEKTA_SECRET_KEY` no configurada. Pagos fiat (OXXO/SPEI/tarjeta) no operan.
5. **KYC Persona sin API key**: `PERSONA_API_KEY` no configurada. No se puede verificar identidad de usuarios.
6. **EasyLex/Legalario sin credenciales**: Sin `LEGALARIO_API_KEY` ni `EASYLEX_API_KEY`. Contratos y NOM-151 no operan.
7. **`generate-offer` referencia `admin_users.user_id`**: La tabla `admin_users` NO tiene columna `user_id`, solo `id`. La verificacion de admin falla.
8. **`respond-to-offer` referencia tablas inexistentes**: `confirmed_reservations` y `user_certificates` no existen en la BD.
9. **Notifications sin triggers**: La tabla `notifications` existe pero no hay triggers ni funciones que inserten notificaciones automaticamente.
10. **No hay email transaccional configurado**: Los endpoints de email (`/api/email/send-*`) existen pero no hay proveedor (Resend, SendGrid, etc.) configurado.

### Que se puede probar HOY en staging

- Login/registro con email y password (funciona)
- Login con Google OAuth (funciona si Google provider esta habilitado en Supabase)
- Navegacion de dashboards por rol (funciona con redirecciones)
- Ver listado de propiedades (funciona si hay datos seed)
- Admin dashboard general (funciona, datos parcialmente mock)
- Broker dashboard (funciona, datos de comisiones mock)
- DAO proposals vista (funciona)
- Flujo de onboarding/perfil (funciona parcialmente)

### Requiere Credenciales Externas

| Servicio | Env Vars Necesarias | Estado |
|---|---|---|
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | 🔴 Sin configurar |
| Conekta | `CONEKTA_SECRET_KEY`, `CONEKTA_WEBHOOK_SECRET` | 🔴 Sin configurar |
| Persona (KYC) | `PERSONA_API_KEY`, `PERSONA_TEMPLATE_ID` | 🔴 Sin configurar |
| Legalario (NOM-151) | `LEGALARIO_API_KEY`, `LEGALARIO_WEBHOOK_SECRET` | 🔴 Sin configurar |
| EasyLex | `EASYLEX_API_KEY`, `EASYLEX_WEBHOOK_SECRET` | 🔴 Sin configurar |
| Email (Resend) | `RESEND_API_KEY` | 🔴 Sin configurar |

### Estimacion MVP (si se trabaja por prioridades)

- Semana 1-2: Crear tablas faltantes + habilitar RLS + configurar Stripe
- Semana 3-4: Flujo completo de compra end-to-end + KYC
- Semana 5-6: Reservaciones REQUEST>OFFER>CONFIRM + Notificaciones
- Semana 7-8: Legal/NOM-151 + Comisiones reales + QA
- **Estimacion total: ~8 semanas para MVP operacional**

---

## 2. CHECKLIST POR MODULOS

---

### A) Auth + Roles

#### 1) Que existe

- **Login/registro email+password**: `app/auth/page.tsx` - Formulario completo con tabs login/registro/magic link
- **Google OAuth**: Usa `supabase.auth.signInWithOAuth({ provider: "google" })` correctamente
- **Auth callback**: `app/auth/callback/route.ts` - Intercambia code por session, crea perfil en `users` y `profiles` automaticamente
- **Middleware RBAC**: `middleware.ts` - Protege rutas por rol, redirige segun role del usuario
- **RoleGuard component**: `components/role-guard.tsx` - Protege dashboards client-side
- **Roles soportados**: admin, super_admin, broker, broker_elite, management, notaria, of_counsel, service_provider, vafi_manager, dao_member, property_owner, user, staff
- **Admin hardcodeado**: `corporativo@morises.com` tiene acceso admin en middleware, callback y RoleGuard
- **Tabla `users`**: Columna `role` (varchar), sin enum constraint
- **Tabla `profiles`**: Columna `role` (varchar), duplicada de `users.role`
- **Signout**: `app/auth/signout/route.ts`
- **2FA**: Tablas `user_two_factor`, `two_factor_audit_log` y endpoints API completos (`/api/auth/2fa/*`)
- **Terms acceptance**: `terms_acceptance` tabla con RLS

#### 2) Que falta

- **Email confirmation flow**: No hay pagina `/auth/verify-email` funcional (existe pero no maneja el token)
- **Password reset flow**: `app/auth/reset-password/page.tsx` existe pero redirige a `/auth`
- **Role consistency**: `users.role` y `profiles.role` pueden estar desincronizados. No hay trigger que los mantenga iguales.
- **`users` tabla sin RLS**: Cualquier usuario autenticado puede leer/modificar datos de otros
- **No hay validacion de role values**: El campo `role` es varchar libre, no hay enum constraint

#### 3) Como se prueba

1. Ir a `/auth`
2. Registrar con email+password -> debe crear fila en `users` y `profiles`
3. Login con Google -> debe redirigir a `/dashboard/member` (o `/dashboard/admin` si es `corporativo@morises.com`)
4. Intentar acceder a `/dashboard/admin` con usuario regular -> debe redirigir a `/dashboard/member`
5. Verificar que `corporativo@morises.com` accede a `/dashboard/admin`

#### 4) Riesgos

- **CRITICO**: `users` tabla sin RLS - fuga de datos PII (email, CURP, RFC, direccion)
- **MEDIO**: Doble fuente de verdad para roles (`users.role` vs `profiles.role`)
- **BAJO**: No hay rate limiting en registro (podrian crear cuentas masivamente)

#### 5) Owner: Backend/DB

---

### B) Base de datos y migraciones

#### 1) Que existe

- **101 tablas** en el schema `public` (confirmado via live schema)
- **~120+ scripts SQL** en `/scripts/` con DDL, seeds, y fixes
- **3 migrations** en `/supabase/migrations/`
- **Tablas principales confirmadas**: users, profiles, properties, weeks, week_tokens, reservations, reservation_requests, reservation_offers, payments, fiat_payments, broker_commissions, commissions, kyc_users, notifications, audit_logs, webhook_events, dao_proposals, dao_votes, vafi_loans, etc.

#### 2) Que falta (tablas referenciadas en codigo pero AUSENTES en BD)

| Tabla | Referenciada en | Impacto |
|---|---|---|
| `user_certificates` | `api/reservations/respond-to-offer/route.ts`, `api/reservations/request/route.ts` | Rompe flujo de reservaciones |
| `user_certificates_v2` | `api/reservations/request/route.ts`, `api/certificates/issue/route.ts` | Rompe compra de certificados |
| `supply_properties` | `api/reservations/generate-offer/route.ts`, `api/admin/supply/toggle-property/route.ts` | Rompe generacion de ofertas |
| `confirmed_reservations` | `api/reservations/respond-to-offer/route.ts`, `api/reservations/generate-offer/route.ts` | Rompe confirmacion de reservas |
| `legal_contracts` | `api/legalario/webhook/route.ts` | Rompe flujo legal/NOM-151 |

- **No hay migraciones reproducibles**: Los scripts SQL no estan numerados de forma atomica ni tienen rollbacks
- **No hay seeds automatizados**: Los datos de demo requieren ejecucion manual de multiples scripts
- **FKs inconsistentes**: `admin_users.id` es UUID pero `admin_permissions.admin_id` es integer
- **Tablas duplicadas**: `propiedades` y `properties`, `semanas` y `weeks` (legacy vs current)

#### 3) Como se prueba

1. Verificar en Supabase que las 101 tablas existen
2. Intentar crear una reservacion -> fallara por tablas faltantes
3. Verificar integridad referencial: `SELECT * FROM weeks WHERE property_id NOT IN (SELECT id FROM properties)`

#### 4) Riesgos

- **CRITICO**: Tablas faltantes rompen flujos core
- **ALTO**: Sin migraciones atomicas, reconstruir la BD es manual y fragil
- **MEDIO**: Tablas legacy (`propiedades`, `semanas`) confunden al equipo

#### 5) Owner: DB/Backend

---

### C) RLS (Row Level Security)

#### 1) Que existe

Tablas con RLS habilitado y policies (confirmado del schema live):

| Tabla | Policies | Correcto? |
|---|---|---|
| `profiles` | 5 (select_all, insert_own, update_own, delete_own, admins_manage) | OK |
| `posts` | 5 (select_all, insert_own, update_own, delete_own, admins_manage) | OK |
| `comments` | 5 | OK |
| `likes` | 3 | OK |
| `bookmarks` | 3 | OK |
| `follows` | 3 | OK |
| `reservation_requests` | 4 (select_own, insert_own, update_own, admins_manage) | OK |
| `reservation_offers` | 3 (select for user requests, update respond, admins manage) | OK |
| `payments` | 3 (select_own, insert_own, admins_manage) | OK |
| `fiat_payments` | 3 | OK |
| `commissions` | 4 (select_own_referrer, admins_view, admins_update, system_create) | OK |
| `certificate_visual_state` | 2 (select_own, update_own) | OK |
| `webhook_events` | 3 (insert, update, admins_select) | OK |
| `terms_acceptance` | 3 | OK |
| `compliance_audit_log` | 2 | OK |
| `property_submissions` | 6 | OK |
| `dao_proposals` | 3 | OK |

#### 2) Tablas SIN RLS (CRITICAS)

| Tabla | Datos sensibles | Riesgo |
|---|---|---|
| **`users`** | Email, CURP, RFC, direccion, ID documents | CRITICO - PII expuesta |
| **`admin_users`** | Emails de admins, password hashes | CRITICO |
| **`reservations`** | Datos de reservas de todos los usuarios | ALTO |
| **`week_tokens`** | Propiedad de NFTs | ALTO |
| **`properties`** | Datos de propiedades | MEDIO |
| **`weeks`** | Calendario de semanas | MEDIO |
| **`broker_commissions`** | Montos de comisiones | ALTO |
| **`kyc_users`** | Datos KYC | CRITICO |
| **`notifications`** | Mensajes privados | MEDIO |
| **`audit_logs`** | Logs de admin | MEDIO |

#### 3) Como se prueba

1. Desde el browser, como usuario regular, ejecutar: `supabase.from('users').select('*')` -> si devuelve TODOS los usuarios, RLS falla
2. Probar `supabase.from('admin_users').select('*')` -> no deberia ser accesible
3. Probar `supabase.from('kyc_users').select('*')` -> datos KYC de todos

#### 4) Riesgos

- **CRITICO**: Sin RLS en `users`, cualquier usuario autenticado puede leer CURP, RFC, direcciones de TODOS los usuarios. Violacion directa de LFPDPPP (Ley Federal de Proteccion de Datos Personales)
- **CRITICO**: Sin RLS en `kyc_users`, datos de verificacion de identidad expuestos

#### 5) Owner: DB

---

### D) Flujo de compra SVC (end-to-end)

#### 1) Que existe

- **Calculadora PAX**: `app/dashboard/admin/pricing-calculator/page.tsx` - Calcula precios por PAX y estancias
- **Catalogo de certificados**: Scripts SQL `040_certificate_catalog_v2.sql` y `060_pax_certificate_catalog.sql` definen productos
- **Checkout page**: `app/payments/checkout/page.tsx` usa `<UnifiedCheckout />` component
- **Stripe webhook**: `app/api/webhooks/stripe/route.ts` - Procesa `checkout.session.completed`, crea certificado y comision
- **Conekta webhook**: `app/api/webhooks/conekta/route.ts` - Procesa `order.paid`, crea voucher
- **Certificate issue API**: `app/api/certificates/issue/route.ts` - Emite certificado
- **Certificate create-checkout**: `app/api/certificates/create-checkout/route.ts` - Crea sesion Stripe
- **Conekta payment endpoints**: Card (`/api/payments/conekta/card`), OXXO (`/api/payments/conekta/oxxo`), SPEI (`/api/payments/conekta/spei`)
- **Commission flow**: `lib/flows/commission-creation.ts` - Calcula y crea comisiones de broker
- **Anti-fraud hold**: `lib/flows/anti-fraud-hold.ts` - Revierte comisiones en refunds/disputes

#### 2) Que falta

- **Stripe sin credenciales**: `STRIPE_SECRET_KEY` no esta configurada
- **Conekta sin credenciales**: `CONEKTA_SECRET_KEY` no esta configurada
- **Tabla `user_certificates_v2` no existe**: El API de issue falla
- **No hay manejo de duplicados en webhook**: Si Stripe envia el mismo evento 2 veces, se crea certificado duplicado
- **No hay idempotency key** en el webhook de Stripe
- **PDF/voucher generation**: No hay generacion real de PDF. Solo se crea un registro en BD
- **OXXO partial payments**: El endpoint existe (`/api/payments/oxxo/create-partial`) pero no hay test de integracion

#### 3) Como se prueba

1. Configurar `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY`
2. Ir a `/payments/checkout`
3. Seleccionar un certificado y pagar con tarjeta de prueba
4. Verificar que webhook procesa y crea certificado
5. Sin credenciales: TODO falla con error 500

#### 4) Riesgos

- **CRITICO**: Sin idempotency en webhooks, pagos duplicados generan certificados duplicados
- **ALTO**: Conekta webhook no verifica firma (`signatureValid: true` hardcoded)
- **MEDIO**: No hay reconciliacion entre pagos y certificados emitidos

#### 5) Owner: Backend

---

### E) KYC Persona (end-to-end)

#### 1) Que existe

- **Create inquiry API**: `app/api/kyc/create-inquiry/route.ts` - Crea inquiry en Persona
- **Generate token API**: `app/api/kyc/generate-token/route.ts`
- **KYC webhook**: `app/api/kyc/webhook/route.ts` - Procesa `inquiry.completed/approved/failed`
- **Persona widget**: `components/persona-kyc-widget.tsx` - Widget inline
- **KYC page**: `app/kyc/page.tsx`
- **Admin KYC page**: `app/dashboard/admin/kyc/page.tsx`
- **Admin approve/reject**: `app/api/admin/kyc/approve/route.ts`, `app/api/admin/kyc/reject/route.ts`
- **Tabla**: `kyc_users` con campos: persona_inquiry_id, status, country, email, name
- **Tabla**: `kyc_documents` con campos: type, url, kyc_id
- **Email notification**: Webhook envia email cuando KYC cambia de status

#### 2) Que falta

- **`PERSONA_API_KEY` no configurada**: Todo el flujo falla sin credenciales
- **No hay bloqueo de producto si KYC != approved**: El checkout no verifica status KYC
- **Webhook sin verificacion de firma**: No valida que el webhook viene de Persona
- **`kyc_users` sin RLS**: Datos KYC de todos los usuarios expuestos
- **No hay link user_id <> kyc_users**: La tabla usa `wallet` y `email` pero no `user_id` como FK

#### 3) Como se prueba

1. Configurar `PERSONA_API_KEY` y `PERSONA_TEMPLATE_ID`
2. Ir a `/kyc` como usuario autenticado
3. Completar verificacion con datos de prueba de Persona
4. Verificar que webhook actualiza `kyc_users.status`
5. Sin credenciales: El widget no carga

#### 4) Riesgos

- **CRITICO**: Webhook sin verificacion de firma -> cualquiera puede aprobar KYC falso
- **ALTO**: Sin bloqueo de compra por KYC, usuarios no verificados pueden comprar
- **ALTO**: `kyc_users` sin RLS

#### 5) Owner: Backend/Integraciones

---

### F) Legal / NOM-151 / EasyLex / Legalario

#### 1) Que existe

- **Legalario client**: `lib/legalario/client.ts` - API client completo
- **Legalario webhook**: `app/api/legalario/webhook/route.ts` - Procesa `contract.certified` y `contract.rejected` con verificacion HMAC, rate limiting, IP allowlist
- **Legalario init contract**: `app/api/legalario/init-contract/route.ts`
- **EasyLex client**: `lib/easylex/client.ts` - API client
- **EasyLex webhook**: `app/api/easylex/webhook/route.ts`
- **Tablas**: `contract_templates`, `signed_contracts`, `legalario_contracts`
- **Evidence system**: `lib/evidence/logger.ts`, `lib/legal/evidence-helpers.ts` - Logging de evidencia para NOM-151
- **Legal pages**: `app/legal/terms/page.tsx`, `app/legal/privacy/page.tsx`, `app/legal/cancellations/page.tsx`
- **Terms acceptance**: `app/api/legal/accept-terms/route.ts`, `app/api/legal/check-terms/route.ts`
- **Download package**: `app/api/legal/download-package/route.ts`
- **Consent system**: `app/api/consent/record/route.ts` con evidencia NOM-151

#### 2) Que falta

- **`legal_contracts` tabla NO existe en BD**: El webhook de Legalario fallara
- **`LEGALARIO_API_KEY` no configurada**: Firma digital no opera
- **`EASYLEX_API_KEY` no configurada**: Alternativa legal no opera
- **No hay generacion de contrato desde plantilla**: `contract_templates` existe pero no hay API que genere PDF desde template
- **No hay flujo de firma completo en UI**: El admin tiene `/dashboard/admin/legalario/page.tsx` pero no hay flujo para que el usuario firme
- **Hash/timestamp NOM-151 no se persisten**: El webhook espera columnas `folio`, `sha256_hash` en `legal_contracts` que no existe
- **Document versioning**: `contract_templates.version` existe pero no hay logica de versionado

#### 3) Como se prueba

Sin credenciales de Legalario/EasyLex, no se puede probar end-to-end.

#### 4) Riesgos

- **CRITICO (Compliance)**: Sin NOM-151, los contratos no tienen valor legal en Mexico
- **ALTO**: Sin firma digital, no hay consentimiento verificable
- **MEDIO**: Sin versionado de documentos, no se puede auditar cambios

#### 5) Owner: Backend/Legal

---

### G) Reservaciones REQUEST > OFFER > CONFIRM

#### 1) Que existe

- **Request API**: `app/api/reservations/request/route.ts` - Crea request, valida certificado (v1 y v2), PAX, consent
- **Generate offer API**: `app/api/reservations/generate-offer/route.ts` - Admin crea oferta con propiedad y fechas
- **Respond to offer API**: `app/api/reservations/respond-to-offer/route.ts` - Accept/decline, crea confirmed_reservation
- **Accept offer API**: `app/api/offers/accept/route.ts`
- **Tablas BD**: `reservation_requests` (con RLS, 4 policies), `reservation_offers` (con RLS, 3 policies), `reservations`
- **Member reservation pages**: 
  - `app/dashboard/member/reservations/page.tsx`
  - `app/dashboard/member/reservations/request/page.tsx`
  - `app/dashboard/member/reservations/offers/page.tsx`
  - `app/dashboard/member/reservations/confirmed/page.tsx`
- **Admin reservation page**: `app/dashboard/admin/reservations/page.tsx`

#### 2) Que falta

- **`supply_properties` tabla NO existe**: generate-offer falla al verificar propiedad disponible
- **`confirmed_reservations` tabla NO existe**: respond-to-offer falla al crear confirmacion
- **`user_certificates` y `user_certificates_v2` tablas NO existen**: request y respond-to-offer fallan
- **generate-offer verifica `admin_users.user_id`**: Esa columna NO existe (la tabla tiene `id`)
- **No hay SLA de 48h implementado**: No hay cron job ni alerta si una request no recibe offer en 48h
- **No hay notificaciones**: Los TODOs en el codigo dicen "TODO: Send email notification" 
- **No hay bloqueo de semana en `weeks`**: Cuando se confirma reserva, no se actualiza `weeks.status`
- **No hay actualizacion del certificado visual**: `certificate_visual_state` no se actualiza al confirmar

#### 3) Como se prueba

Actualmente NO se puede probar end-to-end por tablas faltantes. Parcialmente:
1. POST `/api/reservations/request` con certificado valido -> falla por tabla inexistente
2. El UI en `/dashboard/member/reservations/request` esta implementado pero la API falla

#### 4) Riesgos

- **CRITICO**: Flujo core completamente roto por tablas faltantes
- **ALTO**: Sin bloqueo de semana, se pueden confirmar dos reservas para la misma semana
- **MEDIO**: Sin SLA enforcement, requests pueden quedar en limbo

#### 5) Owner: Full-stack + DB

---

### H) Propiedades + Semanas (Inventory)

#### 1) Que existe

- **Tablas**: `properties` (con 15+ columnas), `weeks` (con status, season, week_number), `week_tokens`, `week_seasons`, `seasons`
- **CRUD propiedades admin**: `app/dashboard/admin/properties/page.tsx`, `app/api/admin/properties/create/route.ts`, `app/api/properties/route.ts`
- **Properties page publica**: `app/properties/page.tsx`, `app/properties/[id]/page.tsx`, `app/property/[id]/page.tsx`
- **Propiedades especificas**: `app/properties/aflora-tulum/page.tsx`, `app/properties/polo-54/page.tsx`, `app/properties/monterrey-urban/page.tsx`
- **Seeds**: Multiples scripts SQL para insertar propiedades reales (Aflora Tulum, Polo 54, Uxan Villas, etc.)
- **Seasonal pricing**: `week_seasons` con `base_price_usd` y `final_price_usd` por semana
- **Progressive unlock**: Scripts `031_progressive_unlock_system.sql`, `036_progressive_unlock_system.sql` con logica de desbloqueo
- **Presale tracking**: `properties` tiene columnas `presale_target`, `presale_sold`, `presale_progress`
- **Admin supply**: `app/dashboard/admin/supply/page.tsx`

#### 2) Que falta

- **Generacion de 52 semanas**: No hay API/cron que genere automaticamente 52 semanas al crear propiedad. Los seeds lo hacen manualmente.
- **48 vs 4 (maintenance/empresa)**: No hay logica que reserve 4 semanas para mantenimiento/empresa. `weeks.status` no distingue esto.
- **Conflictos de calendario**: No hay validacion de conflictos al cambiar status de semana
- **`properties` sin RLS**: Datos de propiedades visibles para todos
- **Tabla `propiedades` legacy**: Existe duplicada y puede causar confusion

#### 3) Como se prueba

1. Ir a `/properties` -> debe mostrar listado
2. Ir a `/dashboard/admin/properties` -> CRUD de propiedades
3. Verificar en BD: `SELECT count(*) FROM weeks WHERE property_id = 'X'` -> debe ser 52
4. Verificar seasonal pricing: `SELECT * FROM week_seasons WHERE property_id = 'X'`

#### 4) Riesgos

- **ALTO**: Sin generacion automatica de semanas, agregar propiedad requiere SQL manual
- **MEDIO**: Sin reserva de 4 semanas empresa, todas las 52 son vendibles (posible overselling)
- **BAJO**: Tablas legacy causan confusion

#### 5) Owner: Backend/DB

---

### I) Broker / Comisiones 4%

#### 1) Que existe

- **Tablas**: `broker_commissions`, `commissions`, `broker_levels`, `broker_elite_benefits`, `broker_time_bonuses`, `referral_tree`, `anonymous_referrals`, `user_referral_commissions`
- **Commission creation**: `lib/flows/commission-creation.ts` - Calcula comision del 4%
- **Anti-fraud hold**: `lib/flows/anti-fraud-hold.ts` - Revierte comisiones en refunds
- **Broker dashboard**: `app/dashboard/broker/page.tsx` - Dashboard completo con metricas
- **Broker commissions page**: `app/dashboard/broker/commissions/page.tsx`
- **Broker calculator**: `app/dashboard/broker/calculator/page.tsx`
- **Broker materials**: `app/dashboard/broker/materials/page.tsx`
- **Broker card**: `app/dashboard/broker/card/page.tsx`
- **Admin approve commissions**: `app/api/admin/commissions/approve/route.ts`
- **Admin payout**: `app/api/admin/commissions/payout/route.ts`
- **Cron approve**: `app/api/cron/approve-commissions/route.ts`
- **Referral system**: `app/api/referral/generate/route.ts`, `app/api/referral/apply/route.ts`, `app/api/referral/stats/route.ts`
- **Broker levels**: `scripts/001-create-broker-levels.sql` con 5 niveles
- **Referral code en `users`**: Columna `referral_code`

#### 2) Que falta

- **`broker_commissions` sin RLS**: Montos visibles para todos
- **No hay payout real**: El endpoint de payout actualiza status pero no hace transferencia bancaria/crypto
- **Commission rate hardcoded**: No se lee de `broker_levels`, esta en `commission-creation.ts`
- **No hay UI admin de aprobacion/payout**: La pagina de admin commissions muestra datos pero el boton de approve puede fallar por RLS
- **Broker elite benefits**: Tabla existe pero no hay logica que los aplique

#### 3) Como se prueba

1. Registrar usuario con `?ref=CODE` -> verificar `referred_by` en `users`
2. Completar una compra -> verificar que se crea fila en `commissions`
3. Admin aprueba comision -> status cambia a `approved`
4. Sin Stripe/Conekta: No se puede generar comision real

#### 4) Riesgos

- **ALTO**: Sin payout real, las comisiones se acumulan sin pago
- **MEDIO**: Commission rate no coincide con broker level

#### 5) Owner: Backend

---

### J) Admin Dashboard

#### 1) Que existe (40+ paginas admin)

| Seccion | Ruta | Estado |
|---|---|---|
| Principal | `/dashboard/admin` | Datos reales de BD |
| Users | `/dashboard/admin/users` | Datos reales |
| Properties | `/dashboard/admin/properties` | Datos reales |
| Reservations | `/dashboard/admin/reservations` | Datos reales |
| Payments | `/dashboard/admin/payments` | Datos reales |
| KYC | `/dashboard/admin/kyc` | Datos reales |
| Commissions (approvals) | `/dashboard/admin/approvals` | Datos reales |
| Webhooks | `/dashboard/admin/webhooks` | Datos reales |
| Analytics | `/dashboard/admin/analytics` | Parcialmente mock |
| Audit logs | `/dashboard/admin/audit-logs` | Datos reales |
| Certificates | `/dashboard/admin/certificates` | Referencia tabla inexistente |
| Supply | `/dashboard/admin/supply` | Referencia tabla inexistente |
| Presale | `/dashboard/admin/presale` | Datos reales |
| Settings | `/dashboard/admin/settings` | Datos reales |
| Team | `/dashboard/admin/team` | Datos reales |
| Security | `/dashboard/admin/security` | Datos reales |
| Email automation | `/dashboard/admin/email-automation` | UI existe, sin proveedor |
| Legalario | `/dashboard/admin/legalario` | Sin credenciales |
| Diagnostics | `/dashboard/admin/diagnostics` | Datos reales |
| Pricing calculator | `/dashboard/admin/pricing-calculator` | Funcional |

#### 2) Que falta

- **Analytics real-time**: Parcialmente mock, no hay queries optimizadas
- **Audit logs filtrados**: La tabla existe pero no hay filtros avanzados
- **Supply management**: Referencia `supply_properties` que no existe
- **Certificate management**: Referencia `user_certificates_v2` que no existe

#### 3) Como se prueba

1. Login como `corporativo@morises.com`
2. Navegar a `/dashboard/admin`
3. Verificar que cada seccion carga datos reales de BD

#### 4) Riesgos

- **MEDIO**: Algunas secciones fallan silenciosamente por tablas faltantes
- **BAJO**: Analytics mock puede dar impresion equivocada de metricas

#### 5) Owner: Frontend

---

### K) Notificaciones

#### 1) Que existe

- **Tabla**: `notifications` con columnas: recipient, type, title, message, link, read, timestamp
- **Tabla**: `owner_notifications` con RLS (2 policies)
- **Admin notifications page**: `app/dashboard/admin/notifications/page.tsx`
- **Owner notifications page**: `app/dashboard/owner/notifications/page.tsx`

#### 2) Que falta

- **`notifications` sin RLS**: Cualquier usuario puede leer notificaciones de otros
- **No hay triggers automaticos**: No hay funciones que inserten notificaciones al:
  - Cambiar KYC status
  - Enviar offer
  - Confirmar reservacion
  - Aprobar comision
  - Procesar pago
- **No hay UI notification center**: No hay bell icon ni dropdown de notificaciones en el navbar
- **No hay websocket/realtime**: No se usa Supabase Realtime para push notifications
- **No hay email transaccional**: Los endpoints `/api/email/send-*` existen pero sin proveedor configurado

#### 3) Como se prueba

No se puede probar automaticamente. Las notificaciones solo se crean manualmente en BD.

#### 4) Riesgos

- **ALTO**: Sin notificaciones, los usuarios no saben cuando reciben ofertas o cambia su KYC status
- **MEDIO**: Sin RLS, un usuario puede ver notificaciones de otros

#### 5) Owner: Full-stack

---

### L) Portales Externos

#### 1) Que existe

| Portal | Ruta | Estado |
|---|---|---|
| WEEK-AGENT | `app/week-agent/page.tsx` | Landing informativa, NO portal funcional |
| WEEK-BOOKING B2B | `app/week-booking/page.tsx` | Landing informativa, NO portal funcional |
| WEEK-WEDDING | `app/week-wedding/page.tsx` | Landing informativa, NO portal funcional |
| WEEK-MANAGEMENT | `app/week-management/page.tsx` | Landing informativa con info page |
| WEEK-MARKET | `app/week-market/page.tsx` | Landing informativa |
| WEEK-REVIEW | `app/week-review/page.tsx` | Landing informativa |
| WEEK-SERVICE | `app/week-service/page.tsx` | Landing informativa |
| WEEK-FUNDACION | `app/week-fundacion/page.tsx` | Landing informativa |

#### 2) Que falta

Todos son paginas informativas/marketing. Ninguno es un portal funcional con login, dashboard, o flujos propios.

#### 3) Owner: Frontend/Product

---

## 3. EVIDENCIA

### Auth callback (funcional)
- Ruta: `app/auth/callback/route.ts`
- Crea usuario en `users` y `profiles` automaticamente
- Redirige segun rol

### Middleware RBAC (funcional)
- Ruta: `middleware.ts`
- Protege 14 prefijos de ruta por rol
- Admin email hardcoded: `corporativo@morises.com`

### Stripe webhook (parcial)
- Ruta: `app/api/webhooks/stripe/route.ts`
- Procesa: `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`
- Tabla: crea en `user_certificates_v2` (NO EXISTE) via `/api/certificates/issue`

### Conekta webhook (parcial)
- Ruta: `app/api/webhooks/conekta/route.ts`
- Procesa: `order.paid`, `order.pending_payment`, `order.expired`, `charge.paid`
- Tabla: crea en `vouchers`
- BUG: `signatureValid: true` hardcoded, NO verifica firma real

### KYC webhook (parcial)
- Ruta: `app/api/kyc/webhook/route.ts`
- Actualiza `kyc_users.status`
- BUG: No verifica firma del webhook

### Legalario webhook (bien implementado)
- Ruta: `app/api/legalario/webhook/route.ts`
- Verifica HMAC, rate limiting, IP allowlist
- BUG: Referencia tabla `legal_contracts` que NO existe

### Reservation request API (parcial)
- Ruta: `app/api/reservations/request/route.ts`
- Valida consent, certificado (v1/v2), PAX, crea evidence event
- BUG: Referencia `user_certificates_v2` que NO existe

---

## 4. MATRIZ IMPLEMENTADO vs FALTANTE

| Feature | Estado | Impacto | Dependencias | Estimacion | Notas |
|---|---|---|---|---|---|
| Login email/password | ✅ | Alto | Supabase | - | Funcional |
| Login Google OAuth | ✅ | Alto | Supabase Google provider | - | Funcional |
| Admin access corporativo@morises.com | ✅ | Alto | - | - | Hardcoded en 3 lugares |
| Role-based route protection | ✅ | Alto | users.role | - | Middleware + RoleGuard |
| Auto-create profile on signup | ✅ | Alto | - | - | En auth/callback |
| 2FA setup | ✅ | Medio | - | - | Tablas y APIs completas |
| RLS en tablas criticas (users, kyc) | 🔴 | Critico | DB migration | S | Fuga de PII |
| Tablas faltantes (certificates, supply) | 🔴 | Critico | DB migration | S | Rompe flujos core |
| Stripe checkout | 🟡 | Critico | STRIPE_SECRET_KEY | S | Codigo listo, sin keys |
| Conekta payments | 🟡 | Alto | CONEKTA_SECRET_KEY | S | Codigo listo, sin keys |
| KYC Persona | 🟡 | Alto | PERSONA_API_KEY | S | Codigo listo, sin keys |
| Legalario NOM-151 | 🟡 | Alto | LEGALARIO_API_KEY + tabla | M | Webhook bien hecho |
| Reservation REQUEST flow | 🟡 | Critico | Tablas faltantes | M | API existe, BD falta |
| Reservation OFFER flow | 🟡 | Critico | supply_properties + admin_users fix | M | Admin check buggy |
| Reservation CONFIRM flow | 🟡 | Critico | confirmed_reservations tabla | M | API existe, BD falta |
| Week locking on confirm | 🔴 | Alto | - | S | No implementado |
| Certificate visual update | 🔴 | Medio | - | S | No implementado |
| SLA 48h enforcement | 🔴 | Medio | Cron job | S | No implementado |
| Broker commissions | 🟡 | Alto | Stripe/Conekta | S | Logica existe |
| Broker payout | 🔴 | Alto | Payment provider | M | Solo cambia status |
| 52 weeks auto-generation | 🔴 | Alto | - | S | Manual via SQL |
| 48 vs 4 week reservation | 🔴 | Medio | - | S | No implementado |
| Notifications triggers | 🔴 | Alto | - | M | Tabla existe, sin triggers |
| Notification center UI | 🔴 | Medio | - | M | No implementado |
| Email transaccional | 🔴 | Alto | RESEND_API_KEY | S | Endpoints existen |
| PDF voucher generation | 🔴 | Medio | - | M | No implementado |
| Admin analytics real | 🟡 | Bajo | - | M | Parcialmente mock |
| WEEK-AGENT portal | 🔴 | Bajo | - | L | Solo landing |
| WEEK-BOOKING B2B | 🔴 | Bajo | - | L | Solo landing |
| WEEK-WEDDING gift cards | 🔴 | Bajo | - | L | Solo landing |
| Webhook idempotency | 🔴 | Alto | - | S | Duplicados posibles |
| Conekta signature verification | 🔴 | Critico | - | S | Hardcoded true |

---

## 5. SIGUIENTE PASO AUTOMATICO

### Backlog Priorizado (MVP Primero)

**Sprint 1 (CRITICO - Semana 1)**
- [ ] Crear tablas faltantes: `user_certificates`, `user_certificates_v2`, `supply_properties`, `confirmed_reservations`, `legal_contracts`
- [ ] Habilitar RLS en: `users`, `admin_users`, `kyc_users`, `reservations`, `week_tokens`, `broker_commissions`, `notifications`
- [ ] Configurar env vars: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Fix: `generate-offer` admin check (usa `admin_users.user_id` que no existe -> usar `users.role` como en middleware)
- [ ] Fix: Conekta webhook firma verificacion (no hardcodear `signatureValid: true`)

**Sprint 2 (ALTO - Semana 2-3)**
- [ ] Configurar Conekta: `CONEKTA_SECRET_KEY`, `CONEKTA_WEBHOOK_SECRET`
- [ ] Configurar KYC: `PERSONA_API_KEY`, `PERSONA_TEMPLATE_ID`
- [ ] Agregar idempotency a webhooks (check `webhook_events.event_id` before processing)
- [ ] Bloquear compra si KYC != approved
- [ ] Implementar week locking: cuando se confirma reserva, actualizar `weeks.status = 'reserved'`
- [ ] Configurar email: `RESEND_API_KEY` o similar

**Sprint 3 (MEDIO - Semana 4-5)**
- [ ] Crear triggers de notificaciones (KYC change, offer sent, reservation confirmed, payment received)
- [ ] Implementar notification center UI (bell icon en navbar)
- [ ] Implementar auto-generacion de 52 semanas al crear propiedad
- [ ] Implementar reserva de 4 semanas empresa/mantenimiento
- [ ] SLA 48h cron job para reservation requests

**Sprint 4 (COMPLIANCE - Semana 6-7)**
- [ ] Configurar Legalario: `LEGALARIO_API_KEY`
- [ ] Crear tabla `legal_contracts` con columnas esperadas
- [ ] Implementar flujo de firma en UI
- [ ] Implementar PDF generation para vouchers/certificados
- [ ] Agregar verificacion de firma en KYC webhook

**Sprint 5 (POLISH - Semana 8)**
- [ ] Admin analytics con queries reales
- [ ] Broker payout real (transferencia)
- [ ] Reconciliacion pagos vs certificados
- [ ] Eliminar tablas legacy (propiedades, semanas)

### Plan de Pruebas (Smoke Test) para MVP

1. **Auth smoke**: Registro -> Login -> Google OAuth -> Admin login `corporativo@morises.com`
2. **RBAC smoke**: User intenta `/dashboard/admin` -> redirige a `/dashboard/member`
3. **Checkout smoke**: Seleccionar certificado -> Pagar con Stripe test card -> Verificar certificado creado
4. **KYC smoke**: Iniciar verificacion -> Completar con datos test -> Verificar status update
5. **Reservation smoke**: Crear request -> Admin genera offer -> User acepta -> Verificar week locked
6. **Broker smoke**: Registrar con referral code -> Comprar -> Verificar comision creada
7. **Notification smoke**: Verificar que cada evento genera notificacion

### Recomendaciones de Refactor

1. **Unificar `users.role` y `profiles.role`**: Usar solo `users.role` como fuente de verdad. Trigger que sincronice o eliminar `profiles.role`.
2. **Eliminar tablas legacy**: `propiedades` y `semanas` son duplicados de `properties` y `weeks`.
3. **Crear FK en `kyc_users`**: Agregar `user_id UUID REFERENCES auth.users(id)` para linkear KYC con usuario.
4. **Normalizar `admin_permissions.admin_id`**: Cambiar de `integer` a `uuid` para consistencia con `admin_users.id`.
5. **`reservation_requests` vs `reservations`**: Clarificar: `reservation_requests` es el flujo REQUEST>OFFER>CONFIRM, `reservations` es legacy de compra directa. Considerar deprecar `reservations`.
6. **`generate-offer` debe verificar admin via `users.role`** en lugar de `admin_users` tabla (mantener consistencia con middleware).
7. **Agregar enum constraints a `users.role`**: Crear CHECK constraint con valores validos para evitar roles inventados.
