# WeekChain: Roadmap a Producción

## Estado Actual
- ✅ Prototipo funcional completo
- ✅ Sistema de vouchers implementado
- ✅ Marketplace de servicios
- ✅ Sistema de referidos multinivel
- ✅ Panel de administración completo
- ⏳ Smart contracts (pendiente)
- ⏳ Cumplimiento legal (pendiente)
- ⏳ Producción (pendiente)

## Prioridades Inmediatas

### 1. Base de Datos en Producción
**Scripts SQL a ejecutar:**
- `scripts/018_purchase_voucher_system.sql`
- `scripts/021_fix_fiat_payments_and_demo.sql`
- `scripts/022_universal_referral_platform.sql`
- `scripts/023_services_marketplace.sql`
- `scripts/024_seed_vacation_services.sql`

### 2. Integraciones Críticas
- [ ] KYC: Implementar Persona o Onfido
- [ ] Pagos: Stripe producción + Oxxo/SPEI
- [ ] Email: Resend para notificaciones
- [ ] Blockchain: Wallet adapter Solana

### 3. Smart Contracts Necesarios

#### Property NFT Contract
```rust
// Estructura básica Solana
pub struct PropertyWeek {
    pub property_id: Pubkey,
    pub week_number: u8,
    pub year: u16,
    pub owner: Pubkey,
    pub metadata_uri: String,
}
