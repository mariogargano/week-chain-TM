# AUDITORÍA INTEGRAL WEEK-CHAIN 2025

**Fecha**: Abril 2026  
**Auditor**: Auditoría Integral de Producto + Operaciones + Compliance  
**Plataforma**: WEEK-WORLD / WEEK-CHAIN (REaaS)  
**Operador**: WEEK-CHAIN SAPI de CV (México)  
**Holding**: MORISES LLC

---

## 1. RESUMEN EJECUTIVO

**Estado General**: AMARILLO (Operativo con gaps críticos)

### Estado por Dominio
| Dominio | Estado | Notas |
|---------|--------|-------|
| Producto y UX | AMARILLO | Requiere revisión de copy marketing |
| Flujo REQUEST→OFFER→CONFIRM | VERDE | Implementado correctamente |
| Operación | AMARILLO | Falta playbook de no-show y overbooking |
| Compliance (PROFECO/NOM-151/LFPDPPP) | AMARILLO | Faltan tablas de consent y evidence |
| Emisión de SVC | VERDE | Funcional con folio único |
| Data/Seguridad | VERDE | Fixes aplicados (rate limit, KYC, passwords) |
| Finanzas | VERDE | Integración Conekta/Stripe activa |
| Integraciones | AMARILLO | Falta fallback en webhooks |
| **Internacionalización (i18n)** | **VERDE** | **Sistema unificado y funcional** |

### 5 Riesgos Principales
1. **Tabla `user_consents` no existe** (P0) - Bloquea trazabilidad PROFECO
2. **Tabla `evidence_events` no existe** (P0) - Sin cumplimiento NOM-151
3. **Copy de marketing usa lenguaje ambiguo** (P1) - Riesgo legal
4. **Playbooks operativos no documentados** (P1) - No-show/Overbooking
5. **Refund 120h no automático** (P2) - Solo manual

---

## 2. MATRIZ DE CUMPLIMIENTO NEGOCIO ↔ PLATAFORMA

### A. Producto y propuesta de valor
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| SVC = derecho personal de uso | `lib/constants/legal-copy.ts` | Cumple | - |
| Evitar lenguaje de "inversión" | Landing + certificates page | Parcial | P1 |
| Disclaimers visibles | Footer y Terms page | Cumple | - |
| Traducción a múltiples idiomas | Sistema i18n (ES/EN/IT/FR) | **Cumple** | - |

### B. Flujo REQUEST → OFFER → CONFIRM
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| REQUEST captura intención | `/api/reservations/request` | Cumple | - |
| OFFER con vigencia | `/api/reservations/generate-offer` | Cumple | - |
| CONFIRM con emisión SVC | `/api/reservations/respond-to-offer` | Cumple | - |
| Trazabilidad por paso | `audit_logs` table | Parcial | P1 |
| Expiraciones automáticas | Cron jobs | Falta | P1 |

### C. Operación
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| Onboarding propiedades | `/dashboard/admin/properties` | Cumple | - |
| Gestión inventario | `properties + availability` tables | Cumple | - |
| Check-in/out digital | Falta implementar | No cumple | P2 |
| Playbook no-show | No documentado | Falta | P1 |

### D. Compliance México
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| PROFECO contratos | Terms page + checkout | Cumple | - |
| NOM-151 evidencia | Tabla `evidence_events` faltante | **No cumple** | **P0** |
| LFPDPPP privacy | `/privacy` + avisos | Cumple | - |
| KYC/AML | Integración Persona | Cumple | - |
| Webhook KYC firma | HMAC-SHA256 verificación | Cumple | - |

### E. Emisión/gestión del SVC
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| Folio único | UUID en `certificates` | Cumple | - |
| Vigencia definida | Campo `expires_at` | Cumple | - |
| Anti-duplicidad | Constraint DB | Cumple | - |
| Apple/Google Wallet | APIs implementadas | Cumple | - |

### F. Data, seguridad y trazabilidad
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| Audit log completo | `audit_logs` table | Cumple | - |
| Control de accesos RBAC | `lib/auth/roles.ts` | Cumple | - |
| Rate limiting | `lib/security/rate-limiter.ts` | Cumple | - |
| Protección PII | RLS policies | Cumple | - |
| Password hashing | bcrypt + crypto.randomBytes | Cumple | - |

### G. Facturación y cobros
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| Pagos Conekta/Stripe | `/api/payments/*` | Cumple | - |
| Comprobantes | Emisión automática | Cumple | - |
| Reembolso 120h | Manual (debe ser automático) | Parcial | P2 |

### H. Integraciones
| Requisito | Evidencia | Estado | Prioridad |
|-----------|-----------|--------|-----------|
| Pagos | Conekta + Stripe | Cumple | - |
| Email (Resend) | Configurado | Cumple | - |
| WhatsApp | Webhook implementado | Cumple | - |
| Fallback en fallos | Falta colas de retry | Falta | P1 |

---

## 3. GAPS POR DOMINIO

### Compliance (CRÍTICO)
- **P0**: Crear tablas `user_consents` y `evidence_events` para NOM-151 y PROFECO
- **P1**: Agregar sello de tiempo confiable en evidencias (TSP)
- **P1**: Generar hash SHA-256 de contratos firmados

### Internacionalización (RESUELTO)
- **VERDE**: Sistema unificado (`lib/i18n/use-translations.ts`)
- **VERDE**: 4 idiomas completos (ES/EN/IT/FR)
- **VERDE**: Claves de navbar, ecosistema, auth, dashboards
- **VERDE**: Selector de idioma funcional sin reload

### Operación (MEDIO)
- **P1**: Documentar playbooks de no-show, overbooking, cancelación
- **P1**: SLA automáticos con alertas
- **P2**: Check-in/out digital

### Seguridad (RESUELTO)
- **VERDE**: Rate limiting en endpoints sensibles
- **VERDE**: Validación de inputs con whitelist
- **VERDE**: Generación segura de passwords
- **VERDE**: Firma HMAC en webhook KYC

---

## 4. BACKLOG RECOMENDADO

### P0 - BLOQUEANTES
1. **Crear tabla `user_consents`** (M) - Ejecutar migration 001
2. **Crear tabla `evidence_events`** (M) - Ejecutar migration 001
3. **Integrar TSP para NOM-151** (L) - Proveedor certificado

### P1 - IMPORTANTES
4. **Revisar copy marketing** (S) - Eliminar "inversión", "rentabilidad"
5. **Implementar cron de expiraciones** (M) - Cancelar offers vencidos
6. **Queue de retry para webhooks** (M) - Upstash Redis
7. **Playbook no-show documentado** (S) - Markdown en docs/
8. **Playbook overbooking** (M) - Con lógica automática
9. **Alertas SLA** (M) - Notificaciones admin
10. **Separación contable WEEK-CHAIN vs MORISES** (L) - Reportes

### P2 - DESEABLES
11. **Refund 120h automático** (M) - Cron job
12. **Check-in/out digital** (L) - Nueva feature
13. **Dashboard financiero en tiempo real** (M)
14. **Integración Conciliación bancaria** (L)
15. **Auditoría externa anual** (XL) - Planificar
16. **Pruebas E2E automatizadas** (L) - Playwright
17. **Documentación API pública** (M) - Swagger
18. **Programa partner onboarding** (L)
19. **App móvil nativa** (XL)
20. **Backup geográfico** (M)

---

## 5. CHECKLIST GO-LIVE (P0 ÚNICAMENTE)

### DB Migrations
- [ ] Ejecutar `scripts/migrations/001_create_missing_compliance_tables.sql` en Supabase

### Variables de Entorno (Vercel)
- [ ] `PERSONA_WEBHOOK_SECRET` configurado
- [ ] `ADMIN_EMAIL` configurado (no hardcoded)
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL` configurado
- [ ] `RESEND_API_KEY` activo
- [ ] `CONEKTA_PRIVATE_KEY` activo

### Validación Funcional
- [x] Flujo REQUEST → OFFER → CONFIRM probado
- [x] Sistema de idiomas (i18n) funcional
- [x] Rate limiting activo
- [x] RLS policies aplicadas
- [ ] Pruebas de consent en REQUEST
- [ ] Pruebas de evidence en CONFIRM

### Legal
- [x] Terms page publicado
- [x] Privacy page publicado
- [x] Refund policy clara
- [x] Disclaimer "no inversión" visible

### Seguridad
- [x] Middleware X-Frame-Options configurado
- [x] CSP con frame-ancestors
- [x] Rate limiting
- [x] KYC webhook signature verification
- [x] Password hashing seguro

---

## 6. ESCENARIOS DE PRUEBA

### Caso 1: Flujo ideal
- Usuario registra → selecciona destino → REQUEST → recibe OFFER → paga → SVC emitido
- **Estado**: Funcional

### Caso 2: Cambio de fechas
- Cliente solicita cambio → admin aprueba → SVC actualizado
- **Estado**: Funcional

### Caso 3: Cancelación <120h
- Cliente cancela antes de 120h → refund 100% automático
- **Estado**: Parcial (manual)

### Caso 4: No-show
- Cliente no se presenta → SVC marcado como no-show → no refund
- **Estado**: Falta playbook

### Caso 5: Overbooking
- Dos reservas mismo week → admin resuelve manualmente
- **Estado**: Falta lógica automática

### Caso 6: Error de pago
- Pago falla → offer se mantiene válido → retry permitido
- **Estado**: Funcional

### Caso 7: Disputa por servicio
- Cliente reclama → ticket → mediación → resolución
- **Estado**: Falta sistema de tickets formal

---

## 7. CAMBIOS APLICADOS EN ESTA REVISIÓN

### Sistema de Internacionalización (Abril 2026)
- Unificado sistema dual (`LanguageProvider` + `useTranslations`)
- Expandido a 4 idiomas completos: ES/EN/IT/FR
- Agregadas claves: `nav.*`, `ecosystem.*`, `auth.*`, `dashboard.*`
- Reemplazados strings hardcodeados en Navbar
- Selector de idioma funcional sin reload de página
- Persistencia en localStorage + cookie

### Seguridad
- Rate limiter implementado (`lib/security/rate-limiter.ts`)
- Validación de inputs con whitelist
- Generación segura de passwords con `crypto.randomBytes`
- Verificación HMAC-SHA256 en webhook KYC Persona
- Eliminado email admin hardcoded
- Sanitización HTML en plantillas de email

### Limpieza
- Eliminados 40+ archivos obsoletos de documentación
- README.md actualizado
- Estructura de `/docs/` reorganizada

---

**Fin del Reporte**

Para ejecutar las correcciones P0, ejecutar:
```bash
# En Supabase Dashboard > SQL Editor
# Abrir: scripts/migrations/001_create_missing_compliance_tables.sql
```
