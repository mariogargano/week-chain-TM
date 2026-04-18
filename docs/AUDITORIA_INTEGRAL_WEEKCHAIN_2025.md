# AUDITORIA INTEGRAL WEEK-CHAIN / WEEK-WORLD
## Plataforma REaaS - Smart Vacational Certificates (SVC)

**Fecha:** Abril 2025  
**Auditor:** Sistema Automatizado v0  
**Version:** 1.0  

---

# 1. RESUMEN EJECUTIVO

## Estado General: AMARILLO (Operativo con gaps criticos)

La plataforma WEEK-CHAIN tiene una base solida con el modelo de negocio bien definido y la arquitectura tecnica correcta. Sin embargo, existen gaps criticos que deben resolverse antes del go-live en produccion.

### 5 Riesgos Principales

| # | Riesgo | Severidad | Impacto |
|---|--------|-----------|---------|
| 1 | **Tabla `user_consents` no existe** - El validator de consent referencia una tabla que no existe en el schema | CRITICO | Bloquea el flujo REQUEST porque validateConsent() falla |
| 2 | **Tabla `evidence_events` no existe** - El logger de evidencia NOM-151 no puede persistir eventos | CRITICO | Sin trazabilidad legal, riesgo de incumplimiento NOM-151 |
| 3 | **Webhook KYC sin verificacion de firma** - El endpoint `/api/kyc/webhook` no valida la firma de Persona | ALTO | Vulnerabilidad de seguridad - cualquiera puede aprobar KYC |
| 4 | **Flujo OFFER no usa tabla `reservation_offers`** - Admin dashboard inserta en tabla diferente a la API | ALTO | Inconsistencia de datos, ofertas no se sincronizan |
| 5 | **Cancelacion 120h sin proceso de refund real** - El endpoint marca "auto-approved" pero tiene TODO para refund | MEDIO | Riesgo PROFECO - promesa de reembolso sin implementacion |

---

# 2. MATRIZ DE CUMPLIMIENTO NEGOCIO <-> PLATAFORMA

## A. PRODUCTO Y PROPUESTA DE VALOR

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| SVC = derecho personal de uso, NO propiedad | `lib/constants/legal-copy.ts` define claramente SVC_FULL y SVC_NOT_LIST | **CUMPLE** | Bajo | Mantener y auditar periodicamente | P2 |
| Evitar lenguaje de inversion | LEGAL_COPY y MARKETING_COPY con alternativas seguras | **CUMPLE** | Bajo | Verificar que todas las paginas usen estas constantes | P2 |
| FAQs con disclaimers correctos | `HomePageClient.tsx` incluye FAQs con lenguaje correcto | **CUMPLE** | Bajo | - | - |
| Landing page sin claims riesgosos | Homepage muestra "derecho de solicitud", "sujeto a disponibilidad" | **CUMPLE** | Bajo | - | - |
| Terminos y Condiciones completos | `/terms` con NOM-151, derecho de reflexion, jurisdiccion | **CUMPLE** | Bajo | Agregar clausula especifica de no-transferibilidad del SVC | P2 |
| Politica de Privacidad LFPDPPP | `/privacy` con ARCO, finalidades, transferencias | **CUMPLE** | Bajo | - | - |

## B. FLUJO REQUEST -> OFFER -> CONFIRM

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| REQUEST captura preferencias completas | `reservation_requests` tiene destination_preference, dates, pax, accessibility_needs | **CUMPLE** | Bajo | - | - |
| Validacion de consent previo a REQUEST | `validateConsent()` en `/api/reservations/request` | **NO CUMPLE** | CRITICO | Crear tabla `user_consents` con schema correcto | P0 |
| Evidence logging en REQUEST | `logEvidenceEvent()` llamado correctamente | **NO CUMPLE** | CRITICO | Crear tabla `evidence_events` para NOM-151 | P0 |
| OFFER generada por admin | `/api/reservations/generate-offer` valida admin, verifica conflictos | **CUMPLE** | Bajo | - | - |
| OFFER con expiracion configurable | `offer_expires_at` calculado dinamicamente | **CUMPLE** | Bajo | - | - |
| Usuario puede ACCEPT o DECLINE | `/api/reservations/respond-to-offer` con logica completa | **CUMPLE** | Bajo | - | - |
| Race condition protection en CONFIRM | Verificacion de conflictos antes de confirmar | **CUMPLE** | Bajo | - | - |
| Decremento de estancias en certificado | Update a `annual_used_estancias` en confirmacion | **CUMPLE** | Bajo | - | - |
| Estados del flujo bien definidos | Workflow engine con state machines completos | **CUMPLE** | Bajo | - | - |
| Notificacion al usuario en cada paso | Inserts a tabla `notifications` en offer/confirm | **CUMPLE** | Bajo | Agregar notificacion WhatsApp ademas de email | P2 |

## C. OPERACION (SUPPLY + BOOKING + SERVICE)

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| Onboarding de propiedades | `property_submissions` con workflow admin/notary | **CUMPLE** | Bajo | - | - |
| Validacion de documentos de propiedad | `property_documents` como JSONB en submissions | **PARCIAL** | Medio | Agregar validacion de tipos de documento requeridos | P1 |
| Gestion de disponibilidad | `supply_properties`, `management_availability` | **CUMPLE** | Bajo | - | - |
| Prevencion de overbooking | Verificacion de `confirmed_reservations` antes de ofrecer | **CUMPLE** | Bajo | - | - |
| SLAs definidos | `SLA_DEFINITIONS` en workflow engine | **CUMPLE** | Bajo | - | - |
| Alertas de breach de SLA | `checkSLABreaches()` crea `system_alerts` | **CUMPLE** | Bajo | Implementar cron job para ejecutar periodicamente | P1 |
| Post-stay: reviews | `week_reviews` con moderation workflow | **CUMPLE** | Bajo | - | - |
| Incidentes y soporte | Tabla `incidents` con estados y SLAs | **CUMPLE** | Bajo | - | - |

## D. COMPLIANCE Y LEGAL (MEXICO)

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| **PROFECO - Derecho de reflexion 5 dias** | `/api/legal/request-cancellation` con logica 120h | **CUMPLE** | Bajo | Implementar proceso real de refund | P0 |
| **PROFECO - Informacion clara al consumidor** | Disclaimers en todas las paginas de compra | **CUMPLE** | Bajo | - | - |
| **PROFECO - Contrato adhesion** | Terminos aceptados con registro IP/timestamp | **CUMPLE** | Bajo | - | - |
| **NOM-151 - Integridad de documentos** | `evidence_log`, `audit_log_immutable` con hashes SHA-256 | **PARCIAL** | ALTO | Tabla `evidence_events` no existe - CREAR | P0 |
| **NOM-151 - Sellado de tiempo** | `logEvidenceEvent` genera hash pero no sella externo | **NO CUMPLE** | ALTO | Integrar con TSP (Timestamp Authority) | P1 |
| **LFPDPPP - Aviso de privacidad** | `/privacy` completo con ARCO | **CUMPLE** | Bajo | - | - |
| **LFPDPPP - Consentimiento explicito** | Registro en `consent_records`, `terms_acceptance` | **CUMPLE** | Bajo | - | - |
| **LFPDPPP - Transferencias a terceros** | Documentado en politica de privacidad | **CUMPLE** | Bajo | - | - |
| **KYC - Verificacion de identidad** | Integracion con Persona, tabla `kyc_users` | **CUMPLE** | Bajo | - | - |
| **KYC - Webhook seguro** | `/api/kyc/webhook` SIN verificacion de firma | **NO CUMPLE** | ALTO | Agregar validacion de firma Persona | P0 |
| **AML - Deteccion de fraude** | `/api/compliance/check-fraud` basico | **PARCIAL** | Medio | Agregar validacion contra listas negras | P1 |

## E. EMISION/GESTION DEL SVC

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| Estructura del SVC completa | `user_certificates_v2` con tier, pax, estancias, vigencia | **CUMPLE** | Bajo | - | - |
| Folio unico | `order_id` y `id` UUID | **CUMPLE** | Bajo | - | - |
| Proceso de emision | Workflow state machine: draft -> paid -> issued -> active | **CUMPLE** | Bajo | - | - |
| Google Wallet Pass | `/api/google-wallet/create-pass` implementado | **CUMPLE** | Bajo | - | - |
| Transferencia controlada | Estado `transferred` en state machine | **PARCIAL** | Medio | Implementar flujo completo de transferencia | P2 |
| Prevencion de duplicidad | UUID y constraints en DB | **CUMPLE** | Bajo | - | - |
| Visual state del certificado | `certificate_visual_state` con metadata dinamica | **CUMPLE** | Bajo | - | - |

## F. DATA, SEGURIDAD Y TRAZABILIDAD

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| Audit log inmutable | `audit_log_immutable` con hash chain | **CUMPLE** | Bajo | - | - |
| RLS en todas las tablas sensibles | 147 tablas, mayoria con RLS enabled | **CUMPLE** | Bajo | Auditar tablas sin RLS: `consent_records`, `easylex_documents` | P1 |
| Control de acceso por rol | `rbac_permissions`, `user_role_assignments` | **CUMPLE** | Bajo | - | - |
| 2FA disponible | `user_two_factor`, `/api/auth/2fa/*` | **CUMPLE** | Bajo | - | - |
| Rate limiting | `lib/security/rate-limiter.ts` implementado | **CUMPLE** | Bajo | - | - |
| Password hashing | Supabase Auth usa bcrypt | **CUMPLE** | Bajo | - | - |
| Encriptacion en transito | HTTPS via Vercel | **CUMPLE** | Bajo | - | - |

## G. FACTURACION, COBROS Y CONCILIACION

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| Multiples metodos de pago | Stripe, Conekta (OXXO, SPEI, tarjeta) | **CUMPLE** | Bajo | - | - |
| Registro de pagos | `fiat_payments`, `payments` con estados | **CUMPLE** | Bajo | - | - |
| Comisiones a brokers | `broker_commissions`, `commission_records` | **CUMPLE** | Bajo | - | - |
| Revenue share documentado | `commission_rates` por tier | **CUMPLE** | Bajo | - | - |
| Pagos parciales (OXXO) | `is_partial_payment`, `amount_paid_so_far` | **CUMPLE** | Bajo | - | - |
| Refunds | Estado en payments pero SIN proceso real | **NO CUMPLE** | ALTO | Implementar refund via Stripe/Conekta | P0 |

## H. INTEGRACIONES Y PUNTOS DE FALLA

| Requisito | Evidencia en Plataforma | Estado | Riesgo | Recomendacion | Prioridad |
|-----------|------------------------|--------|--------|---------------|-----------|
| Webhooks con retry | `webhook_events` con `retry_count` | **CUMPLE** | Bajo | - | - |
| Webhooks con logging | `failed_webhooks_recent` | **CUMPLE** | Bajo | - | - |
| Firma de webhooks (Stripe) | Verificacion en `/api/webhooks/stripe` | **VERIFICAR** | Alto | Confirmar que se valida `stripe-signature` | P1 |
| Firma de webhooks (Persona) | NO implementado en `/api/kyc/webhook` | **NO CUMPLE** | ALTO | Agregar validacion inmediata | P0 |
| Fallback para email | Queued notifications con retry | **CUMPLE** | Bajo | - | - |
| Health checks | `/api/health` endpoint | **CUMPLE** | Bajo | - | - |

---

# 3. GAPS POR DOMINIO

## PRODUCTO
- **GAP-P1**: Algunas paginas pueden no estar usando las constantes de `LEGAL_COPY` - hacer busqueda exhaustiva
- **GAP-P2**: Falta seccion explicita de "Lo que NO es un SVC" en la pagina de certificados

## OPERACION
- **GAP-O1**: SLA breach checker no tiene cron job configurado
- **GAP-O2**: No hay playbook documentado para casos de overbooking
- **GAP-O3**: No hay sistema de escalamiento automatico para incidentes

## COMPLIANCE
- **GAP-C1 (CRITICO)**: Tabla `user_consents` no existe - bloquea validacion de consent
- **GAP-C2 (CRITICO)**: Tabla `evidence_events` no existe - bloquea trazabilidad NOM-151
- **GAP-C3**: No hay integracion con TSP para sellado de tiempo NOM-151
- **GAP-C4**: Webhook KYC sin verificacion de firma
- **GAP-C5**: No hay validacion contra listas OFAC/PEP

## DATA/SEGURIDAD
- **GAP-S1**: Tablas `consent_records`, `easylex_documents`, `evidence_log` sin RLS
- **GAP-S2**: No hay politica de retencion de datos documentada
- **GAP-S3**: No hay proceso de borrado ARCO automatizado

## FINANZAS
- **GAP-F1 (CRITICO)**: Proceso de refund no implementado (solo marca status)
- **GAP-F2**: No hay conciliacion automatica Stripe <-> DB

## INTEGRACIONES
- **GAP-I1**: Firma de webhook Persona no validada
- **GAP-I2**: No hay alertas cuando Stripe/Conekta fallan

---

# 4. BACKLOG RECOMENDADO

## P0 - BLOQUEAN GO-LIVE

| # | Historia de Usuario | Criterios de Aceptacion | Dependencias | Estimacion |
|---|---------------------|------------------------|--------------|------------|
| 1 | Como sistema, necesito la tabla `user_consents` para validar consentimientos | Tabla creada con RLS, validator funciona sin errores | - | S |
| 2 | Como sistema, necesito la tabla `evidence_events` para registrar eventos NOM-151 | Tabla creada, logEvidenceEvent() persiste correctamente | - | S |
| 3 | Como admin, necesito que el webhook de Persona valide la firma | Webhook rechaza requests sin firma valida, log de intentos fallidos | - | S |
| 4 | Como usuario, necesito que mi reembolso se procese automaticamente dentro de 120h | Refund via Stripe/Conekta ejecutado, voucher marcado cancelled, email enviado | Integracion Stripe | M |
| 5 | Como sistema, necesito que las ofertas de admin se sincronicen con la API | Una sola tabla `reservation_offers` usada consistentemente | - | S |

## P1 - CRITICOS PARA COMPLIANCE

| # | Historia de Usuario | Criterios de Aceptacion | Dependencias | Estimacion |
|---|---------------------|------------------------|--------------|------------|
| 6 | Como compliance officer, necesito integracion con TSP para NOM-151 | Documentos firmados tienen timestamp certificado | Proveedor TSP | L |
| 7 | Como compliance officer, necesito validacion OFAC/PEP en KYC | Nuevos usuarios validados contra listas, alertas generadas | API de listas | M |
| 8 | Como admin, necesito un cron que verifique SLA breaches cada hora | Alertas creadas automaticamente, notificaciones enviadas | - | S |
| 9 | Como DPO, necesito que todas las tablas sensibles tengan RLS | `consent_records`, `easylex_documents` con policies | - | S |
| 10 | Como sistema, necesito verificar firma de webhooks Stripe | Requests sin firma valida rechazados con log | - | S |

## P2 - MEJORAS OPERATIVAS

| # | Historia de Usuario | Criterios de Aceptacion | Dependencias | Estimacion |
|---|---------------------|------------------------|--------------|------------|
| 11 | Como usuario, necesito notificacion WhatsApp cuando recibo una oferta | WhatsApp enviado via Twilio/Meta, entrega confirmada | API WhatsApp | M |
| 12 | Como admin, necesito playbook de overbooking en el sistema | Documentacion en Notion/wiki, enlaces desde admin | - | S |
| 13 | Como usuario, necesito ver "Lo que NO es un SVC" en pagina de certificados | Seccion visible con los 6 puntos de SVC_NOT_LIST | - | S |
| 14 | Como holder, necesito poder transferir mi SVC a otro usuario | Flujo completo: solicitud, validacion, transferencia, notificaciones | - | L |
| 15 | Como admin, necesito escalamiento automatico de incidentes | Incidentes sin respuesta en 4h se escalan al siguiente nivel | - | M |
| 16 | Como DPO, necesito proceso automatizado para solicitudes ARCO | Endpoint que anonimiza/elimina datos, genera reporte | - | L |
| 17 | Como finance, necesito conciliacion automatica Stripe <-> DB | Job diario que compara y genera alertas de discrepancias | - | M |
| 18 | Como sistema, necesito politica de retencion de datos implementada | Datos >7 anos archivados, >10 anos eliminados | - | L |
| 19 | Como admin, necesito alertas cuando integraciones de pago fallan | Alerta a Slack/email cuando webhook falla 3+ veces | - | S |
| 20 | Como usuario, necesito version movil del certificado en Apple Wallet | Integracion PKPass para iOS | - | M |

---

# 5. CHECKLIST DE GO-LIVE (P0 UNICAMENTE)

## Pre-requisitos Tecnicos

- [ ] **Crear tabla `user_consents`** con schema:
  ```sql
  CREATE TABLE user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    consent_type TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT now(),
    ip_address INET,
    user_agent TEXT
  );
  -- RLS
  ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users read own consents" ON user_consents FOR SELECT USING (auth.uid() = user_id);
  ```

- [ ] **Crear tabla `evidence_events`** con schema:
  ```sql
  CREATE TABLE evidence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    actor_role TEXT NOT NULL,
    payload_canonical JSONB NOT NULL,
    hash_sha256 TEXT NOT NULL,
    document_version TEXT,
    occurred_at TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  -- RLS
  ALTER TABLE evidence_events ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Admins read all" ON evidence_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt()->>'email')
  );
  CREATE POLICY "Service inserts" ON evidence_events FOR INSERT WITH CHECK (true);
  ```

- [ ] **Agregar verificacion de firma en webhook KYC** (`/api/kyc/webhook/route.ts`):
  ```typescript
  import crypto from 'crypto'
  
  const signature = request.headers.get('persona-signature')
  const payload = await request.text()
  const expectedSig = crypto
    .createHmac('sha256', process.env.PERSONA_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex')
  
  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  ```

- [ ] **Implementar refund real en cancelacion** (`/api/legal/request-cancellation/route.ts`):
  ```typescript
  // Despues de aprobar cancelacion
  if (voucher.stripe_payment_intent_id) {
    await stripe.refunds.create({
      payment_intent: voucher.stripe_payment_intent_id,
      reason: 'requested_by_customer'
    })
  }
  ```

- [ ] **Unificar uso de `reservation_offers`** - Verificar que admin dashboard y API usen la misma tabla

## Pre-requisitos de Negocio

- [ ] Contrato legal revisado por abogado mexicano
- [ ] Aviso de privacidad revisado por DPO
- [ ] Proceso de atencion PROFECO documentado
- [ ] Canal de soporte configurado (email + WhatsApp)
- [ ] Cuenta Stripe verificada y activa
- [ ] Cuenta Conekta verificada y activa
- [ ] Dominio week-chain.com con SSL

## Pre-requisitos de Monitoreo

- [ ] Alertas configuradas para errores 5xx
- [ ] Dashboard de metricas de negocio
- [ ] Log aggregation configurado
- [ ] Backup de base de datos verificado

---

# ANEXO: ESCENARIOS DE PRUEBA

## Caso Ideal
1. Usuario se registra -> KYC aprobado -> Compra certificado -> Pago exitoso -> Certificado emitido
2. Solicita reservacion -> Admin envia oferta -> Usuario acepta -> Reservacion confirmada
3. Check-in -> Estancia -> Check-out -> Review

**Estado actual:** Flujo completo implementado, falla en consent validation (tabla faltante)

## Caso: Cambio de Fechas
1. Usuario con reservacion confirmada solicita cambio
2. Admin genera nueva oferta
3. Usuario acepta/rechaza

**Estado actual:** No hay flujo especifico de modificacion - se debe cancelar y crear nueva solicitud

## Caso: Cancelacion
1. Usuario dentro de 120h solicita cancelacion
2. Sistema aprueba automaticamente
3. Refund procesado

**Estado actual:** Aprobacion funciona, refund NO se procesa (solo marca estado)

## Caso: No Show
1. Usuario no se presenta en check-in
2. Sistema marca como no-show
3. Semana NO se devuelve al usuario

**Estado actual:** Estado `no_show` definido en state machine, falta trigger automatico

## Caso: Overbooking
1. Dos ofertas para mismas fechas
2. Ambas aceptadas simultaneamente

**Estado actual:** Verificacion de conflictos existe pero race condition posible - agregar lock optimista

## Caso: Error de Pago
1. Usuario intenta pagar
2. Pago falla
3. Sistema notifica y permite reintentar

**Estado actual:** Estados de pago tracked, retry UI no implementado

## Caso: Disputa por Servicio
1. Usuario reporta problema durante estancia
2. Incidente creado
3. Escalamiento si no se resuelve

**Estado actual:** Sistema de incidentes implementado, escalamiento automatico faltante

---

**FIN DEL REPORTE**

*Este documento debe ser revisado y actualizado despues de cada sprint de desarrollo.*
