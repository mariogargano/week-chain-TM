# FASE 1: Arquitectura, Entidades, Estados, Navegación y Wireframe Funcional

## 1. ENTIDADES PRINCIPALES Y SUS ESTADOS

### 1.1 Usuario (users + kyc_users + intermediary_profiles)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CICLO DE VIDA DEL USUARIO                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [visitor]                                                               │
│      │                                                                   │
│      ▼ signup (email/password)                                           │
│  [registered] ─────────────────────────────────────────────┐             │
│      │                                                     │             │
│      │ quiere_ser_agente=true                              │             │
│      ▼                                                     │             │
│  [agent_pending_kyc] ◄────────────────────────────────────┤             │
│      │                                                     │             │
│      │ kyc_approved                                        │             │
│      ▼                                                     │             │
│  [agent_active] ◄──────────────────────────────────────────┤             │
│                                                            │             │
│                    ┌───────────────────────────────────────┘             │
│                    │ compra_certificado                                  │
│                    ▼                                                     │
│  [registered] ─► [pre_holder] ─► [holder_pending_kyc] ─► [holder_active]│
│                    │                      │                    │         │
│                    │ pago_exitoso         │ kyc_approved       │         │
│                    ▼                      ▼                    ▼         │
│               stripe/conekta         persona.com          dashboard      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Estados del Usuario:**

| Estado | Descripción | Puede comprar | Puede reservar | Es agente |
|--------|-------------|---------------|----------------|-----------|
| `visitor` | No registrado | No | No | No |
| `registered` | Email verificado, sin certificado | Sí | No | No |
| `agent_pending_kyc` | Activó modo agente, KYC pendiente | Sí | No | Sí (sin cobrar) |
| `agent_active` | Agente con KYC aprobado | Sí | No | Sí (cobra) |
| `pre_holder` | Pago iniciado/pendiente | No (en proceso) | No | Depende |
| `holder_pending_kyc` | Pago exitoso, KYC del certificado pendiente | No | No | Depende |
| `holder_active` | Certificado emitido, KYC completo | Puede comprar otro | Sí | Depende |

### 1.2 Certificado SVC (user_certificates_v2 + certificate_products_v2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CICLO DE VIDA DEL CERTIFICADO                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [draft]                                                                 │
│      │ pago_completado                                                   │
│      ▼                                                                   │
│  [pending_kyc] ◄─── holder debe completar verificación Persona           │
│      │                                                                   │
│      │ kyc_approved                                                      │
│      ▼                                                                   │
│  [active] ─────────────────────────────────────────────────────────┐     │
│      │                                                             │     │
│      │ usuario_solicita_transferencia                              │     │
│      ▼                                                             │     │
│  [transfer_pending] ◄─── nuevo titular completa KYC                │     │
│      │                                                             │     │
│      │ admin_aprueba + nuevo_kyc_ok                                │     │
│      ▼                                                             │     │
│  [active] (nuevo titular)                                          │     │
│                                                                    │     │
│  [active] ───► 15 años transcurren ───► [expired]                  │     │
│      │                                                             │     │
│      │ refund_dentro_14_dias                                       │     │
│      ▼                                                             │     │
│  [refunded]                                                        │     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Estados del Certificado:**

| Estado | Descripción | Usuario puede reservar |
|--------|-------------|------------------------|
| `draft` | Checkout iniciado, pago no completado | No |
| `pending_payment` | Esperando confirmación de pago | No |
| `pending_kyc` | Pago OK, esperando KYC del titular | No |
| `active` | Certificado emitido y vigente | Sí |
| `suspended` | Pago fallido / chargeback | No |
| `transfer_pending` | En proceso de transferencia | No |
| `expired` | 15 años cumplidos | No |
| `refunded` | Devuelto dentro de 14 días | No |

### 1.3 Estancia / Reserva (confirmed_reservations)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CICLO DE VIDA DE LA ESTANCIA                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Usuario abre calendario ───► capacity engine muestra semanas           │
│      │                                                                   │
│      │ selecciona semana + destino                                       │
│      ▼                                                                   │
│  [lock_atomico] ───► validación en <5s                                  │
│      │                                                                   │
│      │ éxito                          │ fallo (sin inventario)          │
│      ▼                                ▼                                  │
│  [confirmed] ◄────────────────── [rejected] (vuelve a calendario)       │
│      │                                                                   │
│      │ check_in_date llega                                               │
│      ▼                                                                   │
│  [in_progress]                                                           │
│      │                                                                   │
│      │ check_out_date pasa                                               │
│      ▼                                                                   │
│  [completed]                                                             │
│                                                                          │
│  NOTA: Usuario NO puede cancelar. Solo admin puede reubicar.            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Comisión de Agente (commission_records)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CICLO DE VIDA DE LA COMISIÓN                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Venta atribuida al agente                                               │
│      │                                                                   │
│      ▼                                                                   │
│  [holding] ───► 14 días de ventana de devolución del certificado        │
│      │                                                                   │
│      │ certificado NO devuelto          │ certificado devuelto          │
│      ▼                                  ▼                                │
│  [available] ◄───────────────────── [reversed]                          │
│      │                                                                   │
│      │ día 1 o 15 del mes + agente tiene KYC aprobado                   │
│      ▼                                                                   │
│  [processing] ───► Stripe Connect o transferencia                       │
│      │                                                                   │
│      │ pago exitoso                     │ pago fallido                  │
│      ▼                                  ▼                                │
│  [paid]                              [failed] ───► retry en próximo ciclo│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA DE NAVEGACIÓN

### 2.1 Rutas Públicas (sin auth)

```
/                           Landing page principal
/auth                       Login + Registro (con checkbox "Quiero ser agente")
/auth/callback              OAuth/email verification callback
/certificates               Catálogo de SVC PAX2/4/6/8 (precios desde DB)
/certificates/checkout      Checkout embebido Stripe
/legal/terms                Términos y condiciones
/legal/privacy              Política de privacidad
/verify/[code]              Verificación pública de certificado
```

### 2.2 Rutas del Usuario (requiere auth)

```
/dashboard/member                    Dashboard principal del holder
  ├── /dashboard/member/certificate  Mi certificado activo (hero card)
  ├── /dashboard/member/calendar     Calendario de reservas (semanas)
  ├── /dashboard/member/reservations Mis estancias confirmadas
  ├── /dashboard/member/kyc          Estado de verificación Persona
  └── /dashboard/member/support      Soporte / tickets

/dashboard/agent                     Dashboard del agente
  ├── /dashboard/agent/link          Mi link de referido + QR
  ├── /dashboard/agent/stats         Clicks, leads, ventas
  ├── /dashboard/agent/commissions   Comisiones (holding/available/paid)
  ├── /dashboard/agent/materials     Biblioteca de marketing
  └── /dashboard/agent/kyc           KYC para cobrar comisiones
```

### 2.3 Rutas del Admin

```
/dashboard/admin                     Dashboard administrativo
  ├── /dashboard/admin/users         Gestión de usuarios + KYC
  ├── /dashboard/admin/certificates  Certificados emitidos
  ├── /dashboard/admin/payments      Pagos y conciliación
  ├── /dashboard/admin/reservations  Reservas y reubicaciones
  ├── /dashboard/admin/agents        Agentes y comisiones
  ├── /dashboard/admin/properties    Inventario de propiedades
  └── /dashboard/admin/reports       Reportes y auditoría

/dashboard/admin/super (solo corporativo@morises.com)
  ├── /dashboard/admin/super/products    Editar precios SVC
  ├── /dashboard/admin/super/settings    Configuración del sistema
  └── /dashboard/admin/super/audit       Auditoría de seguridad
```

---

## 3. WIREFRAME FUNCIONAL

### 3.1 Flujo de Compra Directa (Usuario Final)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. LANDING → CATÁLOGO                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Usuario visita /certificates                                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        ││
│  │  │ SVC PAX2   │ │ SVC PAX4   │ │ SVC PAX6   │ │ SVC PAX8   │        ││
│  │  │            │ │            │ │            │ │            │        ││
│  │  │ 2 personas │ │ 4 personas │ │ 6 personas │ │ 8 personas │        ││
│  │  │            │ │            │ │            │ │            │        ││
│  │  │ $X,XXX USD │ │ $X,XXX USD │ │ $X,XXX USD │ │ $X,XXX USD │        ││
│  │  │            │ │            │ │            │ │            │        ││
│  │  │ [Comprar]  │ │ [Comprar]  │ │ [Comprar]  │ │ [Comprar]  │        ││
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘        ││
│  │                                                                      ││
│  │  • 15 años de vigencia                                               ││
│  │  • 1 semana por año (7 noches)                                       ││
│  │  • 15 estancias totales                                              ││
│  │  • Transferible con KYC                                              ││
│  │  • 14 días de devolución total                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 2. CHECKOUT (Stripe Embedded)                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Si no está logueado → /auth?redirect=/certificates/checkout&product=X  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                      ││
│  │  Resumen de compra:                                                  ││
│  │  ────────────────────                                                ││
│  │  SVC PAX4 - 4 personas                                               ││
│  │  15 años de vacaciones garantizadas                                  ││
│  │                                                                      ││
│  │  Total: $12,000 USD                                                  ││
│  │                                                                      ││
│  │  ┌────────────────────────────────────────────┐                     ││
│  │  │          Stripe Checkout Embed              │                     ││
│  │  │                                             │                     ││
│  │  │  Tarjeta, OXXO, SPEI                       │                     ││
│  │  │                                             │                     ││
│  │  └────────────────────────────────────────────┘                     ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 3. POST-COMPRA EXITOSA                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /certificates/success?session_id=XXX                                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                      ││
│  │  ✓ ¡Bienvenido a WEEK-CHAIN!                                         ││
│  │                                                                      ││
│  │  Tu certificado ha sido emitido:                                     ││
│  │                                                                      ││
│  │  ┌──────────────────────────────────────┐                           ││
│  │  │  # WC-2025-000123                    │                           ││
│  │  │                                      │                           ││
│  │  │  SVC PAX4                            │                           ││
│  │  │  Vigencia: 2025-2040 (15 años)       │                           ││
│  │  │  Estancias disponibles: 15           │                           ││
│  │  │                                      │                           ││
│  │  │  [Descargar PDF]  [Apple Wallet]     │                           ││
│  │  └──────────────────────────────────────┘                           ││
│  │                                                                      ││
│  │  ⚠️ Completa tu verificación de identidad para activar              ││
│  │     tu certificado y poder reservar estancias.                       ││
│  │                                                                      ││
│  │  [Verificar Identidad]        [Ir al Dashboard]                      ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Dashboard del Holder (con certificado activo)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ /dashboard/member                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ HERO CARD ──────────────────────────────────────────────────────────┐
│  │                                                                      │
│  │  # WC-2025-000123                                      [QR Code]     │
│  │                                                                      │
│  │  SVC PAX4 - Certificado de Vacaciones                               │
│  │  ════════════════════════════════════                               │
│  │                                                                      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  │ Años         │  │ Semanas      │  │ Este Año     │              │
│  │  │ restantes    │  │ usadas       │  │ disponible   │              │
│  │  │              │  │              │  │              │              │
│  │  │    14/15     │  │    1/15      │  │    1/1       │              │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │
│  │                                                                      │
│  │  ┌───────────────────────────────────────────────────────────┐      │
│  │  │              SOLICITAR ESTANCIA                            │      │
│  │  │                                                            │      │
│  │  │  Selecciona una semana en el calendario para reservar     │      │
│  │  │  tu próxima vacación.                                      │      │
│  │  │                                                            │      │
│  │  │  [Abrir Calendario]                                        │      │
│  │  └───────────────────────────────────────────────────────────┘      │
│  │                                                                      │
│  └──────────────────────────────────────────────────────────────────────┘
│                                                                          │
│  ┌─ MIS ESTANCIAS ──────────────────────────────────────────────────────┐
│  │                                                                      │
│  │  ┌────────────────────────────────────────────────────────────────┐ │
│  │  │ Semana 24, 2025 (Jun 9-16)                                     │ │
│  │  │ Villa Tulum · 4 huéspedes                                      │ │
│  │  │ Estado: Confirmada ✓                                           │ │
│  │  │ [Ver detalles]                                                 │ │
│  │  └────────────────────────────────────────────────────────────────┘ │
│  │                                                                      │
│  │  No tienes más estancias programadas.                               │
│  │                                                                      │
│  └──────────────────────────────────────────────────────────────────────┘
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Calendario de Reservas (Capacity Engine)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ /dashboard/member/calendar                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Tu certificado: SVC PAX4 (hasta 4 personas)                            │
│  Mínimo 30 días de anticipación requerido                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐
│  │                         2025                                         │
│  │                                                                      │
│  │  ◄ Ene   Feb   Mar   Abr   May   Jun   Jul   Ago   Sep   Oct ►     │
│  │                                                                      │
│  │  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐     │
│  │  │ S1  │ S2  │ S3  │ S4  │ S5  │ S6  │ S7  │ S8  │ S9  │ S10 │     │
│  │  │ ░░░ │ ░░░ │ ░░░ │ ░░░ │ ░░░ │ ██  │ ██  │ ██  │ ██  │ ██  │     │
│  │  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘     │
│  │                                                                      │
│  │  ░░░ = Menos de 30 días (no disponible)                             │
│  │  ██  = Disponible para reservar                                      │
│  │  ▓▓  = Sin inventario para tu PAX                                   │
│  │                                                                      │
│  └──────────────────────────────────────────────────────────────────────┘
│                                                                          │
│  Semana seleccionada: S24 (Jun 9-16, 2025)                              │
│                                                                          │
│  Destinos disponibles para PAX4:                                        │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │ │
│  │  │ [Foto Villa]     │  │ [Foto Casa]      │  │ [Foto Depto]     │ │ │
│  │  │                  │  │                  │  │                  │ │ │
│  │  │ Villa Tulum      │  │ Casa Playa Carmen│  │ Loft CDMX        │ │ │
│  │  │ 4 personas       │  │ 4 personas       │  │ 4 personas       │ │ │
│  │  │ [Seleccionar]    │  │ [Seleccionar]    │  │ [Seleccionar]    │ │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘ │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  [Confirmar Reserva]                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. DECISIONES TÉCNICAS

### 4.1 Autenticación
- **Supabase Auth** con email/password
- Verificación de email obligatoria antes de comprar
- Callback `/auth/callback` maneja: creación de perfil, atribución de referido, activación de agente

### 4.2 KYC (Persona)
- Integración con Persona.com para verificación de identidad
- Dos flujos KYC separados:
  1. **KYC del Agente**: Requerido para cobrar comisiones
  2. **KYC del Holder**: Requerido para activar certificado post-compra
- Webhook de Persona actualiza `kyc_users.status`

### 4.3 Pagos
- **Stripe Checkout** (embebido) para tarjetas internacionales
- **Conekta** para métodos locales México (OXXO, SPEI) - secundario
- Webhook de Stripe:
  1. `checkout.session.completed` → crear certificado en estado `pending_kyc`
  2. Si KYC ya existe → activar certificado
  3. Crear comisión en estado `holding` si hay referral attribution

### 4.4 Capacity Engine
- Tabla `supply_properties` con propiedades activas
- Tabla `weeks` con disponibilidad por semana/propiedad
- Lock atómico vía transacción Supabase:
  ```sql
  BEGIN;
  SELECT * FROM weeks WHERE ... FOR UPDATE NOWAIT;
  -- validar
  INSERT INTO confirmed_reservations ...;
  UPDATE weeks SET status = 'reserved' ...;
  COMMIT;
  ```

### 4.5 Atribución de Referidos
- Cookie `week_chain_ref` con TTL 30 días
- Tabla `referral_attributions` con `expires_at`
- Self-referral bloqueado: `agent.user_id !== buyer.user_id`

---

## 5. RIESGOS ABIERTOS

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Persona.com no está integrado aún | Usuarios no pueden completar KYC | Fase 2: integrar webhook + UI |
| Conekta no validado en producción | Solo funciona Stripe | Fase 3: testing con sandbox Conekta |
| Calendario sin capacity engine real | Reservas manuales | Fase 4: implementar lock atómico |
| Apple Wallet pass no existe | Solo PDF descargable | Post-Fase 4: integrar pkpass |
| Rate limiting básico | Posible abuso de APIs | Documentado en SECURITY.md |

---

## 6. LO QUE FALTA PARA FASE 2

1. **Onboarding post-registro**: página de bienvenida con opciones (comprar / ser agente)
2. **Integración Persona**: webhook + componente de verificación
3. **Estados del usuario en DB**: campo `onboarding_status` en `users`
4. **Dashboard base del usuario**: versión funcional sin certificado (pre-holder)
5. **Flujo de activación de agente**: endpoint + UI para activar modo agente

---

## 7. CHECKLIST DE REVISIÓN MANUAL

- [ ] Revisar precios en `certificate_products_v2` (deben estar actualizados)
- [ ] Confirmar que `corporativo@morises.com` es el único super admin
- [ ] Validar que los 70+ archivos con tiers metálicos están marcados para limpieza futura
- [ ] Confirmar integración Persona.com tiene API keys en Vercel
- [ ] Revisar políticas RLS en tablas críticas (`user_certificates_v2`, `commission_records`)
