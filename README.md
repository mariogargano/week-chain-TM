# WEEK-CHAIN Platform

Plataforma de certificados digitales vacacionales con escrow contable y procesamiento de pagos vía Conekta.

## Sistema de Pagos

**Procesador de Pagos:** Conekta (único)

### Métodos Soportados:
- 💳 Tarjetas de crédito/débito
- 🏪 OXXO (efectivo, máx $10,000 MXN)
- 🏦 SPEI (transferencias bancarias)

## Escrow Contable

Los pagos se reciben en la cuenta bancaria de WEEK-CHAIN y se mantienen **contablemente separados** hasta:

✅ **Venta de 48 semanas** → Fondos liberados
❌ **No se completa venta** → Fondos devueltos

**Importante:** El escrow es contable, NO blockchain. Los fondos permanecen en la cuenta bancaria.

## Variables de Entorno

```bash
# Conekta (Pagos)
CONEKTA_SECRET_KEY=

# Supabase (Base de datos)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Autenticación
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Email
RESEND_API_KEY=

# Legal (EasyLex)
EASYLEX_API_KEY=
EASYLEX_WEBHOOK_SECRET=
```

Ver `SISTEMA_DE_PAGOS.md` para documentación completa.
