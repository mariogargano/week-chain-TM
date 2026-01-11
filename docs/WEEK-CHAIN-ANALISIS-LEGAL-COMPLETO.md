# WEEK-CHAIN - ANÁLISIS INTEGRAL PARA REVISIÓN LEGAL

**Fecha:** 7 de diciembre de 2025  
**Confidencialidad:** Documento Privado  
**Versión:** 2.0 (Sin blockchain como core business)

---

## 1. RESUMEN EJECUTIVO

| Aspecto | Descripción |
|---------|-------------|
| **Nombre** | WEEK-CHAIN |
| **Modelo de Negocio** | Marketplace digital de tiempo compartido vacacional con certificación NOM-151 |
| **Regulación Principal** | NOM-029-SCFI-2010 (Tiempo Compartido), NOM-151-SCFI-2016 (Certificación Digital) |
| **Producto** | Semanas vacacionales (1/52 por año) con contrato de cesión de uso por 15 años |
| **Stack Técnico** | Next.js 14, Supabase PostgreSQL, Stripe/Conekta/PayPal |
| **Certificación** | Legalario (NOM-151 autorizado) |
| **KYC** | Persona (verificación de identidad) |
| **Blockchain** | Solo registro opcional de hash de documentos (NO tokenización, NO NFTs) |

---

## 2. MARCO LEGAL

| Legislación | Aplicación | Status |
|-------------|-----------|--------|
| **NOM-029-SCFI-2010** | Servicios de Tiempo Compartido | ✅ Implementado |
| **NOM-151-SCFI-2016** | Certificación Digital de Contratos | ✅ Implementado vía Legalario |
| **Código Civil Federal** | Contratos de cesión de uso | ✅ Aplicable |
| **LFPDPPP** | Protección de Datos Personales | ⚠️ Revisar aviso de privacidad |
| **Ley Federal Protección Consumidor** | Período de reflexión, cancelaciones | ✅ Implementado |
| **Código Fiscal (SAT)** | CFDI 4.0, ISR, IVA | ✅ Implementado |

---

## 3. DOCUMENTACIÓN LEGAL GENERADA

| Documento | Descripción | Certificación | Almacenamiento |
|-----------|-------------|---------------|----------------|
| **Contrato de Compraventa** | Cesión de uso de semana vacacional por 15 años | NOM-151 vía Legalario | Supabase Storage |
| **Certificado NOM-151** | Folio oficial de certificación digital | Legalario | Supabase Storage |
| **Recibo de Pago** | Comprobante fiscal (CFDI 4.0 opcional) | Firmado digitalmente | Supabase Storage |
| **Términos y Condiciones** | Versión aceptada con timestamp | Registro en BD | Supabase Storage |
| **Manifiesto de Integridad** | SHA-256 checksums de todos los docs | JSON | Incluido en ZIP |
| **Hash Blockchain (opcional)** | Registro inmutable de existencia | Blockchain pública | Explorador público |

---

## 4. FLUJO DE COMPRA COMPLETO

| Paso | Acción | Sistema | Tiempo |
|------|--------|---------|--------|
| **1. Selección** | Usuario elige semana específica (1-52) | Frontend | Inmediato |
| **2. Registro** | Crear cuenta o login (Supabase Auth) | Backend | 1-2 min |
| **3. KYC** | Verificación identidad (obligatorio >$10K USD) | Persona API | 5-30 min |
| **4. Checkout** | Selección método de pago | Frontend | 2-5 min |
| **5. Pago** | Procesamiento (Stripe/Conekta/PayPal) | Pasarela | 10-30 seg |
| **6. Confirmación** | Webhook confirma pago exitoso | Backend | Inmediato |
| **7. Generación Contrato** | PDF personalizado enviado a Legalario | Backend | 1-2 min |
| **8. Firma Electrónica** | Usuario firma en portal Legalario | Legalario | 5-15 min |
| **9. Certificación** | Folio NOM-151 generado | Legalario | Inmediato |
| **10. Entrega Docs** | ZIP con todos los documentos | Email + Dashboard | Inmediato |
| **11. Período Reflexión** | 5 días hábiles para cancelar sin costo | Sistema | 5 días |
| **12. Venta Firme** | Después de 5 días, venta irreversible | Sistema | Automático |

---

## 5. MÉTODOS DE PAGO

| Método | Proveedor | Comisión Aprox. | Tiempo Confirmación | Región |
|--------|-----------|-----------------|---------------------|--------|
| **Tarjeta Crédito/Débito** | Conekta + Stripe | 3.6% + IVA | Inmediato | MX + INT |
| **Apple Pay** | Stripe | 3.6% + IVA | Inmediato | iOS/Safari |
| **Google Pay** | Stripe | 3.6% + IVA | Inmediato | Android/Chrome |
| **PayPal** | PayPal | 4.0% + $3 MXN | Inmediato | Global |
| **OXXO** | Conekta | 3% + $11 MXN | 1-3 días | Solo MX |
| **SPEI** | Conekta | 0.8% | Minutos-horas | Solo MX |
| **Transferencia Directa** | Manual | 0% | 1-2 días | Manual |

---

## 6. SISTEMA DE BROKERS - 3 NIVELES

| Nivel | Tag | Comisión Directa | Requisitos | Beneficios Adicionales |
|-------|-----|------------------|------------|------------------------|
| **1** | BROKER | 4% | Registro aprobado | Dashboard básico |
| **2** | SILVER_BROKER | 5% | 12+ semanas vendidas, 4+ afiliados directos | Analytics mejorado |
| **3** | BROKER_ELITE | 6% | 24+ semanas vendidas, 9+ afiliados directos | Retirement Bonus 10%, Semanas gratis anuales |

### 6.1 Comisiones Multinivel (3 Profundidades)

| Nivel Referido | Comisión | Ejemplo en Venta $5,000 USD |
|----------------|----------|------------------------------|
| **Nivel 1** (Venta directa) | 4-6% según nivel broker | $300 USD (6% Elite) |
| **Nivel 2** (Sub-broker) | 1% fijo | $50 USD |
| **Nivel 3** (Sub-sub-broker) | 0.5% fijo | $25 USD |
| **TOTAL** | 5.5-7.5% | $375 USD |

### 6.2 Broker Retirement Bonus (Solo Elite)

| Condición | Requisito | Pago |
|-----------|-----------|------|
| **Broker Elite** | 24+ semanas vendidas de una propiedad | 10% del valor final de venta al año 15 |
| **Ejemplo** | Propiedad se vende por $500,000 USD | Broker Elite recibe $50,000 USD |
| **Adicional** | Semanas gratis por antigüedad | 1 semana gratis por cada año activo |

---

## 7. ESTRUCTURA DE BASE DE DATOS

### 7.1 Tablas Principales (20 más relevantes de 67 totales)

| Tabla | Descripción | Campos Críticos |
|-------|-------------|-----------------|
| **properties** | Propiedades vacacionales | id, name, location, owner_id, total_weeks (52), status |
| **weeks** | 52 semanas por propiedad | id, property_id, week_number (1-52), season, base_price_usd, status, current_owner_id |
| **profiles** | Usuarios principales | id, email, full_name, role, broker_level_id, referral_code, kyc_verified |
| **reservations** | Compras de semanas | id, week_id, user_id, payment_method, amount_usd, status, contract_id |
| **legalario_contracts** | Contratos certificados | id, reservation_id, nom151_folio, status, signed_document_url, blockchain_hash (opcional) |
| **broker_levels** | Niveles de brokers | id, tag (BROKER/SILVER/ELITE), direct_commission_rate, retirement_bonus_rate |
| **broker_commissions** | Comisiones generadas | id, broker_id, reservation_id, referral_level (1/2/3), commission_amount_usd, status |
| **referral_tree** | Árbol de referidos | broker_id, referred_user_id, level (1/2/3) |
| **broker_time_bonuses** | Semanas gratis por antigüedad | broker_id, bonus_type, status (pending/claimed) |
| **kyc_users** | Verificación identidad | user_id, persona_inquiry_id, status, verified_at |
| **payments** | Registro transacciones | reservation_id, provider, payment_method, amount, status |
| **nft_management** | Gestión de rentas (renombrar) | week_id, management_enabled, base_price_per_night_usd, management_fee_percentage |
| **rental_income** | Ingresos por rentas | week_id, gross_income_usd, platform_fee_usd, management_fee_usd, net_income_usd |
| **week_rentals** | Integración OTAs | week_id, platform (airbnb/vrbo/booking), ical_url, sync_status |
| **week_seasons** | Precios por temporada | property_id, season (low/mid/high/peak), multiplier |

### 7.2 Estados (Status) Importantes

| Entidad | Estados Posibles |
|---------|------------------|
| **properties.status** | draft, active, sold_out, inactive |
| **weeks.status** | available, reserved, sold |
| **reservations.status** | pending, confirmed, cancelled, refunded |
| **legalario_contracts.status** | draft, pending_signature, signed, expired, cancelled |
| **broker_commissions.status** | pending, approved, paid, cancelled |
| **kyc_users.status** | pending, approved, rejected, requires_review |
| **payments.status** | pending, completed, failed, refunded |

---

## 8. ASPECTOS FISCALES

### 8.1 Para WEEK-CHAIN (la empresa)

| Concepto | Tratamiento Fiscal | Tasa | Obligación |
|----------|-------------------|------|------------|
| **Comisión por venta** | Ingreso gravable | ISR Régimen General + IVA 16% | CFDI 4.0 |
| **Management fee** | Ingreso gravable | ISR + IVA 16% | CFDI 4.0 |
| **Exit Strategy (10%)** | Ingreso gravable | ISR + IVA (verificar) | CFDI 4.0 |

### 8.2 Para Compradores (Holders de Semanas)

| Concepto | Tratamiento Fiscal | Observaciones |
|----------|-------------------|---------------|
| **Compra de semana** | Servicio turístico (IVA incluido) | NO es propiedad inmobiliaria |
| **Ingresos por renta** | Arrendamiento (ISR + IVA 16%) | Deducibles: mantenimiento, comisiones |
| **Venta de semana** | Ganancia de capital | ISR sobre utilidad al momento de vender |
| **Exit Strategy (70%)** | Ganancia de capital | Al finalizar 15 años si se vende propiedad |

### 8.3 Para Brokers

| Concepto | Tratamiento Fiscal | Obligación |
|----------|-------------------|------------|
| **Comisiones** | Actividad empresarial | RIF o RESICO |
| **Facturación** | Obligatorio para recibir pago | CFDI 4.0 |
| **Retención ISR** | 10% si no emite factura | WEEK-CHAIN retiene |
| **IVA** | 16% trasladado | Incluido en factura |

---

## 9. GESTIÓN DE RENTAS

### 9.1 Modelo de Ingresos por Renta

| Concepto | Porcentaje | Ejemplo ($1,400 USD) |
|----------|-----------|----------------------|
| **Gross Income** | 100% | $1,400 USD |
| **Platform Fee (OTA)** | 10-15% | -$140 USD |
| **Management Fee (WC)** | 15% del neto | -$189 USD |
| **Net Income (Owner)** | ~76% | $1,071 USD |

### 9.2 Integración con OTAs

| Plataforma | Integración | Sincronización | Comisión OTA |
|------------|-------------|----------------|--------------|
| **Airbnb** | iCal + API | Cada 6 horas | 10-15% |
| **Vrbo** | iCal | Cada 6 horas | 8-10% |
| **Booking.com** | iCal + API | Cada 6 horas | 15-18% |
| **Directo** | Dashboard WC | Manual | 0% |

---

## 10. ROLES Y PERMISOS

| Rol | Acceso Dashboard | Permisos Clave | Casos de Uso |
|-----|-----------------|----------------|--------------|
| **user** | `/dashboard/user` | Comprar semanas, gestionar reservas, activar management | Comprador/propietario de semana |
| **broker** | `/dashboard/broker` | Vender semanas, generar referidos, ver comisiones | Vendedor afiliado |
| **admin** | `/dashboard/admin` | Acceso total, aprobar KYC, gestionar propiedades | Equipo WEEK-CHAIN |
| **notary** | `/dashboard/notaria` | Revisar contratos, certificar documentos | Validación legal |
| **owner** | `/dashboard/owner` | Subir propiedades, configurar precios, ver ventas | Dueño de inmueble |
| **management** | `/dashboard/management` | Gestionar calendarios, bookings, atender huéspedes | Gestor de rentas |

---

## 11. RIESGOS LEGALES Y MITIGACIONES

| Riesgo | Nivel | Impacto | Mitigación Actual | Status |
|--------|-------|---------|-------------------|--------|
| **Incumplimiento NOM-029** | 🔴 ALTO | Multas PROFECO, cierre | Certificación Legalario NOM-151, período 5 días | ✅ Mitigado |
| **Fraude en pagos** | 🟡 MEDIO | Pérdidas financieras | 3D Secure, KYC >$10K, fraud detection | ✅ Mitigado |
| **Lavado de dinero (AML)** | 🔴 ALTO | Multas UIF, cierre | KYC Persona, límites transacción | ⚠️ Mejorar reporting |
| **Doble venta semana** | 🟡 MEDIO | Disputas legales | Status en BD, transacciones atómicas | ✅ Mitigado |
| **Incumplimiento LFPDPPP** | 🟡 MEDIO | Multas INAI | RLS, consentimiento explícito | ⚠️ Revisar aviso |
| **Disputas contractuales** | 🟡 MEDIO | Demandas, reputación | Contratos NOM-151, arbitraje | ✅ Parcial |
| **Pérdida documentos** | 🟢 BAJO | Inconvenientes | Storage Supabase, backups, blockchain hash | ✅ Mitigado |
| **Cancelaciones fraudulentas** | 🟡 MEDIO | Pérdidas operativas | Verificación identidad, límites | ⚠️ Reforzar |

---

## 12. CUMPLIMIENTO REGULATORIO

### 12.1 Auditorías y Reportes

| Tipo | Frecuencia | Responsable | Status |
|------|-----------|-------------|--------|
| **Auditoría Legal** | Trimestral | Abogado externo | ⚠️ Pendiente contratar |
| **Auditoría Financiera** | Anual | Contador externo | ⚠️ Pendiente |
| **Penetration Testing** | Semestral | Empresa seguridad | ❌ No iniciado |
| **Reporte UIF** | Por operación >$500K MXN | Admin/Compliance | ✅ Proceso definido |
| **Reporte CONDUSEF** | Por queja | Admin | ⚠️ Registro pendiente |
| **CFDI 4.0** | Por transacción | Sistema automático | ✅ Implementado |

### 12.2 Registros Pendientes

| Registro | Entidad | Plazo | Prioridad |
|----------|---------|-------|-----------|
| **CONDUSEF** | Comisión Nacional Protección Usuarios | 30-60 días | 🔴 ALTA |
| **PROFECO** | Procuraduría Federal del Consumidor | 30 días | 🔴 ALTA |
| **Aviso Privacidad INAI** | Instituto Acceso Información | Inmediato | 🔴 ALTA |
| **Póliza RC Profesional** | Aseguradora | 15 días | 🟡 MEDIA |

---

## 13. ROADMAP LEGAL

### 13.1 Corto Plazo (0-3 meses)

| Tarea | Responsable | Prioridad | Costo Estimado |
|-------|-------------|-----------|----------------|
| Registro CONDUSEF | Abogado externo | 🔴 ALTA | $50K-100K MXN |
| Aviso privacidad LFPDPPP completo | Abogado datos personales | 🔴 ALTA | $30K MXN |
| Póliza RC Profesional $5M MXN | Broker seguros | 🔴 ALTA | $80K-150K MXN/año |
| Contratar firma legal externa | CEO | 🔴 ALTA | $50K-100K MXN/trimestre |
| Formalizar acuerdo Legalario | Legal | 🟡 MEDIA | Incluido |

### 13.2 Mediano Plazo (3-12 meses)

| Tarea | Responsable | Prioridad | Costo Estimado |
|-------|-------------|-----------|----------------|
| Manual procedimientos disputas | Legal + Ops | 🟡 MEDIA | $20K MXN |
| Cláusula arbitraje CANACO | Abogado | 🟡 MEDIA | $15K MXN |
| Certificación ISO 27001 | CTO + consultor | 🟡 MEDIA | $300K-500K MXN |
| Programa capacitación brokers | HR + Legal | 🟢 BAJA | $30K MXN |
| Due diligence propiedades | Legal | 🟡 MEDIA | Por propiedad |

### 13.3 Largo Plazo (12+ meses)

| Tarea | Responsable | Prioridad |
|-------|-------------|-----------|
| Expansión internacional (USA, EU, CA) | CEO + Legal | 🟢 BAJA |
| Licencias estatales timeshare | Legal | 🟢 BAJA |
| Membresía AMDETUR | CEO | 🟢 BAJA |

---

## 14. ACLARACIONES SOBRE BLOCKCHAIN

### 14.1 USO LIMITADO Y OPCIONAL

| Concepto | ❌ NO SE USA | ✅ SÍ SE USA (OPCIONAL) |
|----------|-------------|------------------------|
| **NFTs** | NO hay tokenización de semanas | Solo registro de hash de documento |
| **Crypto Payments** | NO es método principal | Solo registro de existencia |
| **Escrow Multifirma** | NO hay smart contracts | Timestamp inmutable |
| **Tokenización** | NO hay tokens de semanas | Prueba de existencia del contrato |
| **DAO** | NO hay gobernanza on-chain | Transparencia adicional |
| **Smart Contracts** | NO se usan para transacciones | Verificación independiente |

### 14.2 Registro de Hash (Opcional)

```
Contrato firmado PDF → SHA-256 hash → Registro en blockchain pública
                                    → Explorador muestra registro
                                    → Usuario puede verificar existencia
```

**Importante:** El valor legal del contrato deriva de la certificación NOM-151 de Legalario, NO del registro en blockchain.

---

## 15. PREGUNTAS FRECUENTES PARA EL ABOGADO

| Pregunta | Respuesta |
|----------|-----------|
| **¿Es legal el sistema multinivel de brokers?** | SÍ, siempre que: 1) El pago sea por ventas reales, no reclutamiento. 2) No supere 3 niveles. 3) Comisiones sean razonables (<10% total). 4) Brokers emitan factura. |
| **¿Cumple con NOM-029?** | SÍ, implementa certificación NOM-151 y período de reflexión de 5 días. Pendiente registro CONDUSEF. |
| **¿Qué pasa si el comprador pierde acceso a la plataforma?** | Conserva sus documentos legales (PDF firmados). El contrato es válido independientemente de la plataforma. |
| **¿Qué ocurre al finalizar 15 años?** | Puede renovar, vender su derecho de uso, o participar en exit strategy si la propiedad se vende. |
| **¿Es necesario registro ITF (Ley Fintech)?** | Posiblemente NO, si WEEK-CHAIN no custodia fondos directamente (todo va a pasarelas certificadas). Revisar con abogado fintech. |
| **¿Blockchain tiene validez legal en México?** | El registro en blockchain NO otorga validez legal. Solo la certificación NOM-151 de Legalario es válida oficialmente. |
| **¿Qué jurisdicción aplica?** | Legislación mexicana federal. Se recomienda cláusula de arbitraje CANACO o AMCHAM. |

---

## 16. CONTACTOS Y RECURSOS

| Concepto | Contacto | Uso |
|----------|----------|-----|
| **Legal General** | legal@week-chain.com | Consultas legales generales |
| **Privacidad LFPDPPP** | privacy@week-chain.com | Derechos ARCO, consentimientos |
| **Soporte Usuario** | support@week-chain.com | Atención al cliente |
| **Legalario** | API + Webhook | Certificación NOM-151 automática |
| **Persona KYC** | API | Verificación de identidad |
| **Stripe** | API | Pagos internacionales |
| **Conekta** | API | Pagos México (tarjeta, OXXO, SPEI) |
| **PayPal** | API | Pagos globales |

---

## 17. CONCLUSIONES FINALES

### 17.1 Fortalezas

✅ Certificación digital NOM-151 automática  
✅ Período de reflexión 5 días implementado  
✅ KYC robusto con Persona  
✅ Múltiples métodos de pago (inclusión)  
✅ Sistema comisiones transparente y trazable  
✅ Contratos legales tradicionales (NO depende de blockchain)  

### 17.2 Riesgos Críticos a Resolver

⚠️ Registro CONDUSEF pendiente (URGENTE)  
⚠️ Aviso de privacidad LFPDPPP incompleto  
⚠️ Póliza RC Profesional no contratada  
⚠️ Procedimientos de disputas no formalizados  
⚠️ Contratos con proveedores (Legalario, Persona) sin formalizar  

### 17.3 Recomendación General

**La plataforma tiene una base legal sólida con NOM-151, pero DEBE completar registros regulatorios antes de escalar. Contratar abogado especializado en tiempo compartido y fintech es crítico en los próximos 30 días.**

---

## 18. ANEXOS DISPONIBLES

- Anexo A: Diagrama de Flujo de Compra Visual
- Anexo B: Esquema Completo Base de Datos (67 tablas)
- Anexo C: Plantilla Contrato Cesión de Uso
- Anexo D: Checklist Cumplimiento NOM-029
- Anexo E: Matriz de Riesgos Detallada
- Anexo F: Plantilla Aviso de Privacidad LFPDPPP
- Anexo G: Plantilla Términos y Condiciones

---

**FIN DEL DOCUMENTO**

---

**Preparado por:** Equipo Técnico WEEK-CHAIN  
**Versión:** 2.0 Final  
**Fecha:** 7 de diciembre de 2025  
**Clasificación:** Confidencial - Solo Revisión Legal  
**Páginas:** 18
