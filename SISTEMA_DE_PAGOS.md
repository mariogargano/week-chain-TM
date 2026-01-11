# Sistema de Pagos y Escrow Contable WEEK-CHAIN

## Sistema de Pagos: Solo Conekta

WEEK-CHAIN utiliza **únicamente Conekta** como procesador de pagos para el mercado mexicano.

### Métodos de Pago Soportados:

1. **Tarjetas de Crédito/Débito** - Procesamiento inmediato vía Conekta
2. **OXXO** - Pagos en efectivo en tiendas OXXO (máximo $10,000 MXN por transacción)
3. **SPEI** - Transferencias bancarias mexicanas

### Características Especiales:

- **Pagos Parciales OXXO**: Compras mayores a $10,000 MXN se dividen automáticamente
- **Monedas Soportadas**: MXN, USD, EUR
- **Modo Demo**: Disponible para desarrollo con respuestas mock

---

## Escrow Contable SAPI

### ¿Qué es el Escrow Contable?

El **Escrow Contable** es un sistema de retención contable (NO blockchain) donde:

1. **Los pagos se reciben directamente en la cuenta bancaria de WEEK-CHAIN**
2. **Los fondos se mantienen CONTABLEMENTE separados** en el sistema
3. **NO se transfieren físicamente a una cuenta separada**
4. **Se registran como "fondos en escrow" en la contabilidad**

### Flujo del Escrow:

```
Cliente Paga → Conekta → Cuenta Bancaria WEEK-CHAIN → Registro Contable "En Escrow"
```

### Liberación de Fondos:

Los fondos en escrow se liberan cuando:

✅ **Se venden las 48 semanas de la propiedad** → Fondos liberados al vendedor
❌ **NO se venden las 48 semanas** → Fondos devueltos al comprador

### Estados del Escrow:

- `held` - Fondos retenidos contablemente, esperando venta de 48 semanas
- `released` - Fondos liberados al vendedor (48 semanas vendidas)
- `refunded` - Fondos devueltos al comprador (no se completó venta)

### Gestión:

Los administradores pueden gestionar el escrow desde:
`/dashboard/admin/escrow-contable`

---

## Arquitectura Técnica

### Base de Datos:

Tabla `escrow_contable`:
- `id` - UUID único
- `customer_name` - Nombre del cliente
- `customer_email` - Email del cliente
- `property_name` - Nombre de la propiedad
- `season` - Temporada (high/medium/low)
- `quantity` - Cantidad de semanas
- `amount_mxn` - Monto en MXN
- `amount_usd` - Monto en USD
- `status` - Estado (held/released/refunded)
- `created_at` - Fecha de creación
- `released_at` - Fecha de liberación (si aplica)
- `refunded_at` - Fecha de devolución (si aplica)

### API Endpoints de Conekta:

- `POST /api/payments/conekta/create-order` - Crear orden de pago
- `POST /api/payments/conekta/webhook` - Webhook de confirmación
- `POST /api/payments/oxxo/create-partial` - Crear pago parcial OXXO

---

## Variables de Entorno Requeridas

```bash
# Conekta (Único procesador de pagos)
CONEKTA_SECRET_KEY=key_xxx

# Supabase (Base de datos)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Google OAuth (Autenticación)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Resend (Emails)
RESEND_API_KEY=xxx
```

---

## Notas Importantes

⚠️ **El escrow es CONTABLE, no de blockchain**
- Los fondos permanecen en la cuenta bancaria de WEEK-CHAIN
- Se mantienen registros contables de fondos "en escrow"
- No hay transferencias a wallets multisig ni smart contracts

⚠️ **Solo Conekta**
- No se usa Stripe
- No se aceptan pagos con criptomonedas directamente
- Todo el procesamiento de pagos es vía Conekta

⚠️ **Límites de OXXO**
- Máximo $10,000 MXN por transacción
- Pagos mayores se dividen automáticamente
