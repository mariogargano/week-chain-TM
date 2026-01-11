# 🎯 WEEK-CHAIN - Guía Completa del Flujo Demo
## Del Pago al NFT - Proceso Paso a Paso

---

## 📋 Resumen del Flujo Completo

```
Usuario → Selecciona Semana → Elige Pago → Procesa Pago → Crea Voucher → Escrow → Admin Confirma → Mintea NFT → Usuario Recibe NFT
```

---

## 🚀 PASO 1: Selección de Propiedad y Semana

### Usuario navega a:
- **URL**: `/properties` o `/marketplace`
- **Acción**: Explora propiedades disponibles
- **Vista**: PropertyCard con progreso de preventa

### Selecciona una semana:
- **URL**: `/properties/[property_id]`
- **Componente**: `WeekCalendar`
- **Acción**: Click en semana disponible (verde)
- **Resultado**: Se abre `ReservationFlow` dialog

**Estado en DB**: Ninguno aún

---

## 💳 PASO 2: Selección de Método de Pago

### Componente: `PaymentMethodSelector`

**Opciones disponibles en DEMO:**

1. **💳 Tarjeta (Card)**
   - Procesador: Conekta (demo)
   - Flujo: Pago instantáneo simulado
   - No requiere redirect
   - ✅ Confirmación inmediata

2. **🏪 OXXO Pay**
   - Procesador: Conekta (demo)
   - Límite: $10,000 MXN por transacción
   - **NUEVO**: Pagos parciales automáticos si excede límite
   - Genera referencia de pago
   - ⏳ Requiere confirmación manual

3. **🏦 SPEI**
   - Procesador: Conekta (demo)
   - Transferencia bancaria simulada
   - Genera CLABE interbancaria
   - ⏳ Requiere confirmación manual

4. **₿ USDC (Crypto)**
   - Blockchain: Solana Devnet
   - Pago directo a escrow
   - ✅ Confirmación inmediata

**Validaciones:**
- ✅ Monto calculado (USD → MXN si aplica)
- ✅ Límites de OXXO verificados
- ✅ KYC check (deshabilitado en demo)

---

## 🔄 PASO 3: Procesamiento de Pago

### Opción A: Pago con Tarjeta (DEMO)

**API**: `/api/payments/conekta/create-order`

```typescript
// Request
{
  amount: 1000, // USD
  property_id: "uuid",
  week_id: "uuid",
  week_number: 23,
  payment_method: "card",
  user_email: "user@example.com"
}

// Response (DEMO MODE)
{
  success: true,
  order_id: "ord_demo_1234567890",
  demo_mode: true,
  payment_status: "paid",
  message: "Demo payment completed successfully"
}
```

**Flujo en Demo:**
1. ✅ Crea orden en Conekta (simulada)
2. ✅ NO redirige a checkout
3. ✅ Pago marcado como "paid" inmediatamente
4. ✅ Continúa a creación de voucher

**Estado en DB**: 
```sql
-- Tabla: fiat_payments (solo si no es demo)
status: 'succeeded'
processor: 'conekta'
payment_method: 'card'
```

---

### Opción B: Pago con OXXO (DEMO)

**API**: `/api/payments/oxxo/create-partial`

**Caso 1: Monto < $10,000 MXN**
```typescript
// Request
{
  amount: 500, // USD = $8,750 MXN
  payment_method: "oxxo"
}

// Response
{
  success: true,
  order_id: "ord_demo_xxx",
  payment_details: {
    reference: "9876543210" // Referencia OXXO
  },
  message: "Paga en cualquier Oxxo"
}
```

**Caso 2: Monto > $10,000 MXN (PAGOS PARCIALES)**
```typescript
// Request
{
  amount: 1500, // USD = $26,250 MXN
  payment_method: "oxxo"
}

// Response
{
  success: true,
  payment_group_id: "group_xxx",
  total_payments: 3,
  payments: [
    {
      sequence: 1,
      amount: 10000,
      reference: "REF001",
      order_id: "ord_1"
    },
    {
      sequence: 2,
      amount: 10000,
      reference: "REF002",
      order_id: "ord_2"
    },
    {
      sequence: 3,
      amount: 6250,
      reference: "REF003",
      order_id: "ord_3"
    }
  ]
}
```

**Componente**: `OxxoPartialPaymentsDialog`
- Muestra todas las referencias
- Tracking de pagos completados
- Progreso visual
- Auto-confirma cuando todos están pagados

**Estado en DB**:
```sql
-- Tabla: purchase_vouchers
status: 'pending'
metadata: {
  payment_group_id: "group_xxx",
  total_payments: 3,
  payments_completed: 0
}
```

---

### Opción C: Pago con USDC (Crypto)

**API**: `/api/escrow/deposit`

```typescript
// Request
{
  user_wallet: "wallet_address",
  amount_usdc: 1000,
  property_id: "uuid",
  week_id: "uuid",
  booking_id: "BOOK_xxx",
  solana_signature: "tx_signature"
}

// Response
{
  success: true,
  escrow: {
    id: "escrow_id",
    status: "confirmed",
    escrow_address: "ESCROW_PDA_xxx"
  }
}
```

**Flujo:**
1. ✅ Usuario conecta wallet (Phantom/Solflare)
2. ✅ Firma transacción en Solana Devnet
3. ✅ Sistema verifica transacción en blockchain
4. ✅ Crea registro en `escrow_deposits`
5. ✅ Status: "confirmed" inmediatamente

---

## 📜 PASO 4: Creación de Voucher

**API**: `/api/vouchers/create`

**Trigger**: Automático después de pago exitoso

```typescript
// Request
{
  user_wallet: "wallet_address",
  property_id: "uuid",
  week_id: "uuid",
  week_number: 23,
  payment_method: "card", // o "oxxo", "spei", "usdc_crypto"
  amount_usdc: 1000,
  amount_paid_currency: "USD",
  amount_paid: 1000,
  escrow_deposit_id: "escrow_id" // si es crypto
}

// Response
{
  success: true,
  voucher: {
    id: "voucher_id",
    voucher_code: "WEEK-PROP-W23-2025",
    status: "confirmed", // o "pending" si OXXO/SPEI
    issued_at: "2025-01-23T10:00:00Z"
  },
  reservation: {
    id: "reservation_id",
    status: "confirmed"
  }
}
```

**Estado en DB**:
```sql
-- Tabla: purchase_vouchers
INSERT INTO purchase_vouchers (
  voucher_code,
  user_wallet,
  property_id,
  week_id,
  payment_method,
  amount_usdc,
  status, -- 'confirmed' para crypto/card, 'pending' para OXXO/SPEI
  issued_at
)

-- Tabla: weeks
UPDATE weeks 
SET status = 'reserved', 
    owner_wallet = 'user_wallet'
WHERE id = week_id

-- Tabla: reservations
INSERT INTO reservations (
  week_id,
  property_id,
  user_wallet,
  status: 'confirmed',
  nft_issued: false
)
```

---

## 🔒 PASO 5: Sistema de Escrow (Solo Crypto)

**Para pagos USDC:**

### Escrow en Solana Devnet

**Componente**: `lib/solana/escrow.ts`

```typescript
// PDA (Program Derived Address)
const [escrowPDA] = getEscrowPDA(booking_id)

// Estructura del Escrow Account
{
  status: EscrowStatus.Pending, // 0
  amount: 1000_000000, // USDC (6 decimals)
  buyer: PublicKey,
  seller: PublicKey,
  property_id: "uuid",
  week_id: "uuid",
  created_at: timestamp
}
```

**Estados del Escrow:**
- `Pending` (0): Fondos depositados, esperando confirmación
- `Funded` (1): Confirmado por admin
- `Released` (2): Fondos liberados al vendedor
- `Refunded` (3): Fondos devueltos al comprador
- `Cancelled` (4): Cancelado

---

## ✅ PASO 6: Confirmación de Admin

**API**: `/api/escrow/confirm`

**Trigger**: Manual por admin o automático en demo

```typescript
// Request
{
  escrow_id: "escrow_id",
  booking_id: "BOOK_xxx",
  transaction_hash: "tx_hash" // opcional
}

// Response
{
  success: true,
  escrow: {
    id: "escrow_id",
    status: "confirmed",
    confirmed_at: "2025-01-23T10:05:00Z"
  },
  message: "Escrow confirmed and NFT minting initiated"
}
```

**Acciones automáticas:**
1. ✅ Actualiza `escrow_deposits.status = 'confirmed'`
2. ✅ Verifica estado en blockchain (si aplica)
3. ✅ **Dispara minting de NFT automáticamente**
4. ✅ Actualiza `reservations.status = 'completed'`

**Dashboard Admin**: `/dashboard/admin/escrow`
- Lista de escrows pendientes
- Botón "Confirm" para cada uno
- En demo: Auto-confirma después de 5 segundos

---

## 🎨 PASO 7: Minting de NFT

**API**: `/api/nft/mint`

**Trigger**: Automático desde `/api/escrow/confirm`

```typescript
// Request
{
  booking_id: "BOOK_xxx",
  property_id: "uuid",
  week_number: 23,
  year: 2025,
  owner_wallet: "wallet_address",
  metadata: {
    name: "Property Name - Week 23",
    description: "Vacation property week at Location",
    image: "https://...",
    attributes: [
      { trait_type: "Property", value: "Property Name" },
      { trait_type: "Week Number", value: 23 },
      { trait_type: "Location", value: "Cancún" }
    ]
  }
}

// Response
{
  success: true,
  nft: {
    id: "nft_id",
    wallet: "wallet_address",
    estado: "minted"
  },
  mint_address: "NFT_BOOK_xxx",
  transaction_hash: "TX1234567890",
  metadata_uri: "https://arweave.net/NFT_BOOK_xxx.json"
}
```

**Estado en DB**:
```sql
-- Tabla: nft_provisional
INSERT INTO nft_provisional (
  semana_id,
  wallet,
  estado: 'minted',
  metadata_uri,
  transaction_hash
)

-- Tabla: reservations
UPDATE reservations 
SET nft_issued = true,
    status = 'completed',
    nft_mint_address = 'NFT_BOOK_xxx'
WHERE booking_id = 'BOOK_xxx'

-- Tabla: weeks
UPDATE weeks 
SET status = 'sold',
    nft_minted = true,
    nft_token_id = 'NFT_BOOK_xxx'
WHERE id = week_id
```

---

## 🎁 PASO 8: Usuario Recibe NFT

### Dashboard del Usuario

**URL**: `/dashboard/my-weeks`

**Vista**:
```
┌─────────────────────────────────────┐
│ 🏖️ Property Name - Week 23         │
│                                     │
│ 📅 Dates: Jun 1-7, 2025            │
│ 🎫 Voucher: WEEK-PROP-W23-2025     │
│ ✅ Status: Confirmed                │
│                                     │
│ 🎨 NFT: NFT_BOOK_xxx               │
│ 📊 Presale: 35/52 weeks sold       │
│                                     │
│ [View NFT] [Add to Wallet]         │
└─────────────────────────────────────┘
```

**Acciones disponibles:**
1. **View NFT**: Ver metadata y atributos
2. **Add to Google Wallet**: Agregar pase digital
3. **List on OTA**: Publicar para renta (si habilitado)
4. **Redeem for Full NFT**: Cuando preventa complete (48+ semanas)

---

## 🔄 Webhooks y Confirmaciones

### Webhook de Stripe
**Endpoint**: `/api/payments/fiat/webhook`

**Eventos manejados:**
- `payment_intent.succeeded` → Crea voucher
- `payment_intent.payment_failed` → Marca como fallido

### Webhook de Conekta
**Endpoint**: `/api/payments/conekta/webhook`

**Eventos manejados:**
- `order.paid` → Confirma voucher
- `charge.paid` → Actualiza pago individual
- **NUEVO**: Detecta cuando todos los pagos parciales están completos

---

## 📊 Tracking del Progreso

### Para el Usuario

**Componente**: `components/reservation-flow.tsx`

**Pasos visuales:**
1. ✅ Seleccionar método de pago
2. ✅ Procesar pago
3. ✅ Confirmar reservación
4. ✅ Recibir certificado

### Para Admin

**Dashboard**: `/dashboard/admin`

**Métricas en tiempo real:**
- 💰 Total en Escrow
- 🎫 Vouchers emitidos
- 🎨 NFTs minteados
- 📈 Progreso de preventa por propiedad

---

## 🧪 Modo Demo - Características

### Pagos Simulados
- ✅ No se cobran tarjetas reales
- ✅ OXXO genera referencias fake
- ✅ SPEI genera CLABE fake
- ✅ Crypto usa Solana Devnet

### Auto-confirmaciones
- ✅ Pagos con tarjeta: Instantáneos
- ✅ Escrow: Auto-confirma después de 5 seg
- ✅ NFT: Mintea inmediatamente

### Indicadores Visuales
```
┌────────────────────────────────┐
│ 🧪 MODO DEMO                   │
│ Los pagos están en modo prueba │
└────────────────────────────────┘
```

### Logs de Debug
```typescript
console.log("[WEEK-CHAIN] [DEBUG] Payment processed in demo mode")
console.log("[WEEK-CHAIN] [INFO] Voucher created:", voucher_id)
console.log("[WEEK-CHAIN] [INFO] NFT minted:", mint_address)
```

---

## 🚀 Activar Modo Producción

### Checklist:

1. **Configurar Stripe Production**
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

2. **Configurar Conekta Production**
   ```bash
   CONEKTA_SECRET_KEY=key_xxx (no test)
   ```

3. **Desplegar Smart Contracts a Mainnet**
   ```bash
   # Solana mainnet-beta
   solana config set --url mainnet-beta
   anchor deploy
   ```

4. **Ejecutar Scripts SQL**
   ```bash
   # En Supabase SQL Editor
   - 025_full_property_purchase_system.sql
   - 027_terms_acceptance_system.sql
   - 028_oxxo_partial_payments.sql
   ```

5. **Configurar Webhooks**
   - Stripe: `https://tu-dominio.com/api/payments/fiat/webhook`
   - Conekta: `https://tu-dominio.com/api/payments/conekta/webhook`

6. **Verificar**
   ```bash
   npm run validate-env
   ```

---

## 📞 Soporte

**Documentación adicional:**
- `PRODUCTION_CHECKLIST.md` - Lista completa para producción
- `README_PRODUCTION.md` - Guía de deployment
- `DASHBOARD_AUDIT.md` - Auditoría de dashboards

**Logs y Debug:**
- Todos los logs usan el sistema centralizado `lib/config/logger.ts`
- Se desactivan automáticamente en producción
- Activar con `NEXT_PUBLIC_DEBUG=true`

---

## ✅ Resumen del Flujo Demo

```
1. Usuario selecciona semana → ReservationFlow abre
2. Elige método de pago → PaymentMethodSelector
3. Procesa pago (simulado) → API Conekta/Stripe/Escrow
4. Crea voucher automático → /api/vouchers/create
5. Deposita en escrow (si crypto) → /api/escrow/deposit
6. Admin confirma (auto en demo) → /api/escrow/confirm
7. Mintea NFT automático → /api/nft/mint
8. Usuario ve NFT → /dashboard/my-weeks
```

**Tiempo total en demo**: ~10 segundos
**Tiempo en producción**: 1-3 días (dependiendo del método de pago)

---

🎉 **¡Listo para probar el flujo completo en demo!**
