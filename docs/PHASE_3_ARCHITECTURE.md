# FASE 3: Pagos Conekta, Conciliación y Admin Dashboard

## Qué construí

### 1. Payment Reconciliation Flow
- `lib/flows/payment-reconciliation.ts`: Lógica para conciliar estados pending → completed → refunded
- Idempotente: múltiples webhooks no crean duplicados
- Sincronización entre Stripe y Conekta (dual payment gateway)

### 2. Admin Payments Dashboard
- Búsqueda y filtros por usuario, método, estado, fecha
- Acciones: retry, refund, suspend certificate
- Webhook log para auditar todas las transacciones

### 3. Admin Certificates Management
- Listado de certificados por usuario
- Transferencia con KYC approval
- Suspensión por falta de pago
- Reissuance manual

### 4. Admin KYC Approvals
- Queue de KYC pending
- Botones: approve/reject con notas
- Auditoría de todas las decisiones

## Lo que falta (para Fase 4)

- Apple Wallet pass generation
- Email templates para notificaciones
- Casos manuales (disputes, chargeback handling)
- Timeline de auditoría completa
- REQUEST → OFFER → CONFIRM calendar UI

## Decisiones que tomé

1. **Dual gateway**: Stripe primario, Conekta secundario con fallback
2. **Webhook race condition protection**: Clave única por transaction ID
3. **Certificate suspension automática**: Si pago falla 3x, suspender
4. **KYC rejection reasons**: Admin puede guardar notas para el usuario

## Riesgos abiertos

- Rate limiting en admin actions (falta Upstash)
- Email notifications a usuarios (templates pendientes)
- Chargeback handling incompleto
- Refund reconciliation asíncrona (puede tomar 5-7 días en Stripe)
