# 🔐 Guía de Rotación de Claves - WEEK-CHAIN™

## Resumen Ejecutivo

La rotación regular de claves de API es una práctica de seguridad crítica que reduce el riesgo de compromiso de credenciales y cumple con estándares de seguridad como PCI-DSS, SOC 2, e ISO 27001.

**Frecuencia recomendada:** Cada 90 días para claves críticas, cada 180 días para claves de menor riesgo.

---

## 📋 Inventario de Claves

### Claves Críticas (Rotación cada 90 días)

| Clave | Servicio | Uso | Riesgo |
|-------|----------|-----|--------|
| `STRIPE_SECRET_KEY` | Stripe | Procesamiento de pagos | 🔴 Crítico |
| `CONEKTA_PRIVATE_KEY` | Conekta | Pagos México | 🔴 Crítico |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Acceso admin DB | 🔴 Crítico |
| `MIFIEL_API_KEY` | Mifiel | Firma electrónica | 🟡 Alto |
| `MIFIEL_SECRET_KEY` | Mifiel | Webhooks | 🟡 Alto |

### Claves Estándar (Rotación cada 180 días)

| Clave | Servicio | Uso | Riesgo |
|-------|----------|-----|--------|
| `RESEND_API_KEY` | Resend | Envío de emails | 🟡 Medio |
| `SOLANA_RPC_URL` | Solana | Blockchain | 🟡 Medio |
| `STRIPE_PUBLISHABLE_KEY` | Stripe | Frontend | 🟢 Bajo |
| `SUPABASE_ANON_KEY` | Supabase | Frontend | 🟢 Bajo |

---

## 🚀 Proceso de Rotación

### Preparación (1 día antes)

1. **Notificar al equipo**
   \`\`\`bash
   # Enviar notificación en Slack/Discord
   "🔐 Rotación de claves programada para mañana a las 10:00 AM UTC"
   \`\`\`

2. **Crear backup**
   \`\`\`bash
   ./scripts/backup-keys.sh production
   \`\`\`

3. **Verificar estado actual**
   \`\`\`bash
   ./scripts/verify-keys.sh production
   \`\`\`

### Ejecución (Día de rotación)

#### Opción 1: Script Automatizado (Recomendado)

\`\`\`bash
# Rotar todas las claves
./scripts/rotate-keys.sh production

# O rotar servicio específico
./scripts/rotate-keys.sh production --service stripe
\`\`\`

#### Opción 2: Manual

##### 1. Stripe

\`\`\`bash
# 1. Generar nueva clave en Stripe Dashboard
# https://dashboard.stripe.com/apikeys

# 2. Actualizar en Vercel
vercel env add STRIPE_SECRET_KEY production
# Pegar nueva clave cuando se solicite

# 3. Verificar
curl https://api.stripe.com/v1/balance \
  -u sk_live_NEW_KEY:

# 4. Revocar clave antigua en Stripe Dashboard
\`\`\`

##### 2. Mifiel

\`\`\`bash
# 1. Generar nueva clave en Mifiel Dashboard
# https://app.mifiel.com/api-keys

# 2. Actualizar en Vercel
vercel env add MIFIEL_API_KEY production
vercel env add MIFIEL_SECRET_KEY production

# 3. Verificar webhook
curl -X POST https://weekchain.com/api/mifiel/callback \
  -H "Authorization: Basic $(echo -n 'NEW_KEY:NEW_SECRET' | base64)"

# 4. Revocar clave antigua
\`\`\`

##### 3. Supabase

\`\`\`bash
# 1. Generar nueva Service Role Key
# https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# 2. Actualizar en Vercel
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 3. Verificar
curl https://YOUR_PROJECT.supabase.co/rest/v1/users \
  -H "apikey: NEW_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer NEW_SERVICE_ROLE_KEY"

# 4. Revocar clave antigua (no disponible en Supabase, se sobrescribe)
\`\`\`

##### 4. Conekta

\`\`\`bash
# 1. Generar nueva clave en Conekta Dashboard
# https://admin.conekta.com/settings/keys

# 2. Actualizar en Vercel
vercel env add CONEKTA_PRIVATE_KEY production

# 3. Verificar
curl https://api.conekta.io/customers \
  -u NEW_PRIVATE_KEY:

# 4. Revocar clave antigua
\`\`\`

##### 5. Resend

\`\`\`bash
# 1. Generar nueva clave en Resend Dashboard
# https://resend.com/api-keys

# 2. Actualizar en Vercel
vercel env add RESEND_API_KEY production

# 3. Verificar
curl https://api.resend.com/emails \
  -H "Authorization: Bearer NEW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@weekchain.com","to":"test@example.com","subject":"Test","html":"Test"}'

# 4. Revocar clave antigua
\`\`\`

### Verificación Post-Rotación

\`\`\`bash
# 1. Verificar todas las claves
./scripts/verify-keys.sh production

# 2. Ejecutar health checks
curl https://weekchain.com/api/health

# 3. Verificar logs de errores
vercel logs --follow

# 4. Probar funcionalidades críticas
# - Crear un pago de prueba
# - Firmar un documento de prueba
# - Enviar un email de prueba
\`\`\`

### Revocación de Claves Antiguas (7 días después)

⚠️ **IMPORTANTE:** Espera 7 días antes de revocar las claves antiguas para asegurar que no haya problemas.

\`\`\`bash
# Registrar revocación
echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") - Claves antiguas revocadas" >> logs/key-rotation.log

# Revocar en cada servicio:
# - Stripe: Dashboard > API Keys > Revoke
# - Mifiel: Dashboard > API Keys > Delete
# - Conekta: Dashboard > Settings > Keys > Delete
# - Resend: Dashboard > API Keys > Delete
\`\`\`

---

## 📅 Calendario de Rotación 2025

| Fecha | Claves a Rotar | Responsable | Estado |
|-------|----------------|-------------|--------|
| 2025-02-01 | Todas (Críticas) | DevOps | ⏳ Pendiente |
| 2025-05-01 | Todas (Críticas) | DevOps | ⏳ Pendiente |
| 2025-08-01 | Todas | DevOps | ⏳ Pendiente |
| 2025-11-01 | Todas (Críticas) | DevOps | ⏳ Pendiente |

---

## 🚨 Rotación de Emergencia

Si una clave se ve comprometida, ejecuta inmediatamente:

\`\`\`bash
# 1. Revocar clave comprometida INMEDIATAMENTE
# (en el dashboard del servicio)

# 2. Generar y desplegar nueva clave
./scripts/rotate-keys.sh production --service [SERVICIO] --emergency

# 3. Notificar al equipo
# 4. Investigar el incidente
# 5. Actualizar documentación de seguridad
\`\`\`

---

## 📊 Checklist de Rotación

### Pre-Rotación
- [ ] Backup de claves actuales creado
- [ ] Equipo notificado
- [ ] Ventana de mantenimiento programada
- [ ] Health checks preparados

### Durante Rotación
- [ ] Nuevas claves generadas
- [ ] Variables de entorno actualizadas en Vercel
- [ ] Deployment verificado
- [ ] Health checks ejecutados
- [ ] Funcionalidades críticas probadas

### Post-Rotación
- [ ] Logs revisados (sin errores)
- [ ] Monitoreo activo por 24 horas
- [ ] Documentación actualizada
- [ ] Claves antiguas programadas para revocación (7 días)

### Revocación (7 días después)
- [ ] Claves antiguas revocadas en todos los servicios
- [ ] Log de rotación actualizado
- [ ] Próxima rotación programada

---

## 🔒 Mejores Prácticas

1. **Nunca** compartas claves por email, Slack, o mensajes no encriptados
2. **Siempre** usa 1Password o similar para almacenar claves
3. **Documenta** cada rotación en `logs/key-rotation.log`
4. **Verifica** que las claves antiguas se revoquen después de 7 días
5. **Monitorea** logs de errores durante 24 horas post-rotación
6. **Automatiza** el proceso usando los scripts proporcionados
7. **Prueba** el proceso de rotación en staging primero

---

## 📞 Contactos de Emergencia

| Servicio | Soporte | Teléfono | Email |
|----------|---------|----------|-------|
| Stripe | https://support.stripe.com | - | support@stripe.com |
| Mifiel | https://mifiel.com/soporte | +52 55 1234 5678 | soporte@mifiel.com |
| Supabase | https://supabase.com/support | - | support@supabase.io |
| Conekta | https://conekta.com/soporte | +52 55 8765 4321 | soporte@conekta.com |

---

## 📚 Referencias

- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [NIST SP 800-57: Key Management](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
- [PCI-DSS Requirement 3.6](https://www.pcisecuritystandards.org/)

---

**Última actualización:** 2025-01-29  
**Próxima revisión:** 2025-04-29
