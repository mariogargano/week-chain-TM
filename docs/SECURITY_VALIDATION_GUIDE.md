# WEEK-CHAIN™ - Security & Validation Guide

## 📋 Tabla de Contenidos

1. [Row Level Security (RLS)](#row-level-security)
2. [Rate Limiting](#rate-limiting)
3. [Input Validation](#input-validation)
4. [Security Best Practices](#security-best-practices)

---

## 🔒 Row Level Security (RLS)

### Políticas Implementadas

#### Bookings
- **SELECT**: Usuarios ven solo sus propias reservas
- **INSERT**: Usuarios pueden crear sus propias reservas
- **UPDATE**: Solo reservas en estado `pending` o `confirmed`
- **ADMIN**: Admins y management ven todas las reservas

#### Legal Contracts
- **SELECT**: Usuarios ven solo sus contratos
- **INSERT**: Solo service role o funciones seguras
- **ADMIN**: Admins, notarios y management ven todos

#### NFT Mints
- **SELECT**: Usuarios ven solo sus NFTs
- **INSERT**: Solo service role
- **ADMIN**: Admins ven todos los NFTs

#### KYC Verifications
- **SELECT**: Usuarios ven solo su KYC
- **INSERT**: Usuarios pueden crear su KYC
- **UPDATE**: Solo admins y compliance

### Funciones Helper

\`\`\`sql
-- Verificar si es admin
SELECT is_admin();

-- Verificar si es propietario
SELECT is_owner('user-uuid-here');

-- Verificar rol específico
SELECT has_role('notaria');
\`\`\`

---

## ⏱️ Rate Limiting

### Configuraciones por Endpoint

| Tipo | Límite | Ventana | Uso |
|------|--------|---------|-----|
| Default | 120 req | 1 min | Endpoints generales |
| Auth | 5 req | 1 min | Login, registro |
| Payment | 10 req | 1 min | Pagos, reembolsos |
| API | 60 req | 1 min | APIs públicas |
| Webhook | 1000 req | 1 min | Webhooks externos |
| Admin | 200 req | 1 min | Panel admin |

### Uso en Endpoints

\`\`\`typescript
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS } from "@/lib/middleware/rate-limit"

export async function POST(req: NextRequest) {
  // Aplicar rate limit
  const rateLimitResponse = rateLimitMiddleware(req, RATE_LIMIT_CONFIGS.payment)
  if (rateLimitResponse) return rateLimitResponse

  // Continuar con la lógica...
}
\`\`\`

### Headers de Rate Limit

Todos los responses incluyen:
- `X-RateLimit-Limit`: Límite máximo
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset

---

## ✅ Input Validation

### Schemas Disponibles

#### Autenticación
\`\`\`typescript
import { LoginSchema, RegisterSchema } from "@/lib/validation/schemas"

const result = LoginSchema.safeParse(data)
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 })
}
\`\`\`

#### Bookings
\`\`\`typescript
import { CreateBookingSchema, CancelBookingSchema } from "@/lib/validation/schemas"

const validation = validateRequest(CreateBookingSchema, await req.json())
if (!validation.success) {
  return NextResponse.json(
    { error: formatValidationError(validation.error) },
    { status: 400 }
  )
}
\`\`\`

#### Pagos
\`\`\`typescript
import { CreatePaymentSchema } from "@/lib/validation/schemas"

const { data, error } = CreatePaymentSchema.safeParse(body)
\`\`\`

#### Reembolsos
\`\`\`typescript
import { RefundRequestSchema } from "@/lib/validation/schemas"

const validation = validateRequest(RefundRequestSchema, data)
\`\`\`

### Validación Personalizada

\`\`\`typescript
import { z } from "zod"

const CustomSchema = z.object({
  field: z.string().refine(
    (val) => customValidation(val),
    { message: "Validación personalizada falló" }
  )
})
\`\`\`

---

## 🛡️ Security Best Practices

### 1. Siempre Validar Input

\`\`\`typescript
// ❌ MAL
const { booking_id } = await req.json()
const booking = await supabase.from("bookings").select().eq("id", booking_id)

// ✅ BIEN
const validation = validateRequest(CancelBookingSchema, await req.json())
if (!validation.success) {
  return NextResponse.json({ error: "Invalid input" }, { status: 400 })
}
const { booking_id } = validation.data
\`\`\`

### 2. Usar RLS en Todas las Tablas Sensibles

\`\`\`sql
-- Siempre habilitar RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Crear políticas específicas
CREATE POLICY "users_own_data" ON my_table
FOR SELECT USING (auth.uid() = user_id);
\`\`\`

### 3. Aplicar Rate Limiting

\`\`\`typescript
// En todos los endpoints públicos
const rateLimitResponse = rateLimitMiddleware(req)
if (rateLimitResponse) return rateLimitResponse
\`\`\`

### 4. Auditar Accesos Críticos

\`\`\`typescript
// Registrar acciones importantes
await supabase.rpc("log_security_event", {
  p_action: "refund_requested",
  p_resource_type: "booking",
  p_resource_id: booking_id,
  p_success: true,
})
\`\`\`

### 5. Verificar Autenticación

\`\`\`typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
\`\`\`

### 6. Verificar Autorización

\`\`\`typescript
// Verificar que el usuario tiene permiso
const { data: booking } = await supabase
  .from("bookings")
  .select()
  .eq("id", booking_id)
  .eq("user_id", user.id)
  .single()

if (!booking) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
\`\`\`

---

## 📊 Monitoreo de Seguridad

### Consultar Log de Auditoría

\`\`\`sql
-- Ver eventos recientes
SELECT * FROM security_audit_log
ORDER BY created_at DESC
LIMIT 100;

-- Ver intentos fallidos
SELECT * FROM security_audit_log
WHERE success = false
ORDER BY created_at DESC;

-- Ver acciones por usuario
SELECT action, COUNT(*) as count
FROM security_audit_log
WHERE user_id = 'user-uuid'
GROUP BY action;
\`\`\`

### Alertas Recomendadas

1. **Múltiples intentos fallidos de login** (>5 en 5 min)
2. **Rate limit excedido frecuentemente** (>10 veces/hora)
3. **Accesos a recursos no autorizados** (403 errors)
4. **Cambios en roles de usuario**
5. **Reembolsos aprobados** (>$1000 USD)

---

## 🚀 Checklist de Implementación

### Para Nuevos Endpoints

- [ ] Aplicar rate limiting apropiado
- [ ] Validar input con Zod schema
- [ ] Verificar autenticación (si requiere)
- [ ] Verificar autorización (RLS o manual)
- [ ] Registrar eventos críticos en audit log
- [ ] Manejar errores apropiadamente
- [ ] Agregar tests de seguridad

### Para Nuevas Tablas

- [ ] Habilitar RLS
- [ ] Crear políticas de SELECT
- [ ] Crear políticas de INSERT (si aplica)
- [ ] Crear políticas de UPDATE (si aplica)
- [ ] Crear políticas de DELETE (si aplica)
- [ ] Agregar índices para optimizar RLS
- [ ] Documentar políticas

---

## 📞 Soporte

Para dudas sobre seguridad:
- **Email**: security@week-chain.com
- **Slack**: #security-team
- **Docs**: https://docs.week-chain.com/security

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
