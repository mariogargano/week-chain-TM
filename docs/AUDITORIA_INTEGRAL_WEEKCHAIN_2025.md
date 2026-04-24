# AUDITORÍA INTEGRAL WEEK-CHAIN 2025

**Fecha**: Abril 2026  
**Auditor**: Auditoría Integral de Producto + Operaciones + Compliance  
**Plataforma**: WEEK-WORLD / WEEK-CHAIN (REaaS)  
**Operador**: WEEK-CHAIN SAPI de CV (México)  
**Holding**: MORISES LLC

---

## 1. RESUMEN EJECUTIVO

**Estado General**: VERDE (Listo para producción con pendientes operativos)

### Estado por Dominio
| Dominio | Estado | Notas |
|---------|--------|-------|
| Producto y UX | AMARILLO | Requiere revisión de copy marketing |
| Flujo REQUEST→OFFER→CONFIRM | VERDE | Evidence logging NOM-151 agregado |
| Operación | AMARILLO | Falta playbook de no-show y overbooking |
| Compliance (PROFECO/NOM-151/LFPDPPP) | VERDE | Tablas creadas, evidencia activa |
| Emisión de SVC | VERDE | Funcional con folio único |
| Data/Seguridad | VERDE | Hardcoded emails eliminados, CSP OK |
| Finanzas | VERDE | Refund 120h automático operativo |
| Integraciones | AMARILLO | Falta fallback en webhooks |
| Internacionalización (i18n) | VERDE | Sistema unificado y funcional |

### 5 Riesgos Resueltos
1. ~~Tabla `user_consents` no existe~~ **RESUELTO** - Tabla creada con RLS
2. ~~Tabla `evidence_events` no existe~~ **RESUELTO** - Tabla creada + logging en REQUEST/OFFER/CONFIRM
3. ~~Hardcoded admin emails~~ **RESUELTO** - Todos usan `NEXT_PUBLIC_ADMIN_EMAIL`
4. ~~Refund 120h no automático~~ **RESUELTO** - Funciones `can_refund_120h` y `get_refund_eligibility`
5. ~~CSP bloquea v0 preview~~ **RESUELTO** - `frame-ancestors` permite v0/vercel

### Riesgos Restantes
- **P1**: Copy marketing requiere revisión legal ("inversión", "rentabilidad")
- **P1**: Playbooks operativos (no-show, overbooking) no documentados
- **P1**: Retry queue para webhooks no implementado
- **P2**: Check-in/out digital pendiente

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
- [x] Script `scripts/400_compliance_tables.sql` ejecutado
- [x] Tablas `user_consents` y `evidence_events` creadas con RLS
- [x] Funciones `can_refund_120h` y `get_refund_eligibility` creadas

### Variables de Entorno (Vercel)
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL` configurado (requerido para admin fallback)
- [ ] `PERSONA_WEBHOOK_SECRET` configurado
- [ ] `RESEND_API_KEY` activo
- [ ] `CONEKTA_PRIVATE_KEY` activo

### Validación Funcional
- [x] Flujo REQUEST → OFFER → CONFIRM con evidence logging
- [x] Sistema de idiomas (i18n) funcional ES/EN/IT/FR
- [x] Rate limiting activo
- [x] RLS policies aplicadas
- [x] Consent validado en REQUEST (con fallback graceful)
- [x] Evidence logged en REQUEST/OFFER/CONFIRM
- [x] Accept-terms guarda en `user_consents` + `evidence_events`
- [x] CSP permite v0 y Vercel preview (`frame-ancestors`)
- [x] Admin verification usa role DB + env (no hardcoded)

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
