# Política de Reembolso de 120 Horas - WEEK-CHAIN™

## Cumplimiento Legal

Esta política cumple con **NOM-029-SE-2021** (Periodo de reflexión de 5 días para comercio electrónico en México).

## Resumen

Los usuarios tienen **120 horas (5 días)** desde la compra para solicitar un reembolso completo sin necesidad de justificación.

## Implementación Técnica

### 1. Funciones SQL

#### `can_refund_120h(b_id UUID)`
Verifica si un booking/voucher está dentro del periodo de 120 horas.

```sql
SELECT can_refund_120h('uuid-del-booking');
-- Retorna: true o false
```

#### `get_refund_eligibility(p_id UUID, p_type TEXT)`
Obtiene detalles completos de elegibilidad incluyendo horas restantes.

```sql
SELECT * FROM get_refund_eligibility('uuid-del-voucher', 'voucher');
-- Retorna: eligible, hours_remaining, deadline, reason
```

### 2. Trigger Automático

El trigger `trg_auto_approve_120h` se ejecuta automáticamente cuando se inserta una solicitud de cancelación:

- ✅ **Dentro de 120h**: Auto-aprueba la cancelación
- ❌ **Fuera de 120h**: Marca para revisión manual

### 3. API Endpoints

#### Verificar Elegibilidad
```
GET /api/legal/check-refund-eligibility?id={id}&type={type}
```

**Respuesta:**
```json
{
  "eligible": true,
  "hours_remaining": 87,
  "deadline": "2025-01-15T10:30:00Z",
  "reason": "Elegible para reembolso automático según NOM-029-SE-2021",
  "can_auto_approve": true,
  "message": "Tienes 87 horas restantes para cancelar con reembolso automático"
}
```

#### Solicitar Cancelación
```
POST /api/legal/request-cancellation
```

**Body:**
```json
{
  "escrow_tx": "uuid-del-voucher",
  "reason": "Cambio de planes"
}
```

### 4. Componente UI

```tsx
import { RefundEligibilityBadge } from "@/components/refund-eligibility-badge"

<RefundEligibilityBadge 
  id={voucherId} 
  type="voucher" 
/>
```

## Flujo de Usuario

### Dentro de 120 horas

1. Usuario solicita cancelación
2. Sistema verifica automáticamente el tiempo transcurrido
3. ✅ Auto-aprueba la cancelación
4. Procesa reembolso inmediatamente
5. Notifica al usuario

### Fuera de 120 horas

1. Usuario solicita cancelación
2. Sistema verifica el tiempo transcurrido
3. ❌ Marca para revisión manual
4. Equipo de soporte revisa el caso
5. Decisión manual de aprobación/rechazo
6. Notifica al usuario

## Vista de Monitoreo

```sql
SELECT * FROM refund_requests_summary
WHERE status = 'pending'
ORDER BY hours_remaining ASC;
```

Esta vista muestra:
- Todas las solicitudes de reembolso
- Horas transcurridas desde la compra
- Horas restantes en el periodo de 120h
- Estado de auto-aprobación

## Mejores Prácticas

### Para Desarrolladores

1. **Siempre verificar elegibilidad antes de mostrar botón de cancelación**
   ```tsx
   const { eligible } = await checkRefundEligibility(voucherId)
   if (eligible) {
     // Mostrar botón "Cancelar con reembolso automático"
   }
   ```

2. **Mostrar countdown en UI**
   ```tsx
   <RefundEligibilityBadge id={voucherId} />
   ```

3. **Registrar en audit log**
   Todas las solicitudes se registran automáticamente en `compliance_audit_log`

### Para Soporte

1. Revisar `refund_requests_summary` diariamente
2. Priorizar solicitudes con `within_reflection_period = false`
3. Documentar razones de aprobación/rechazo manual

## Compliance Checklist

- ✅ Periodo de 120 horas implementado
- ✅ Auto-aprobación automática dentro del periodo
- ✅ Registro de auditoría completo
- ✅ Notificaciones al usuario
- ✅ Vista de monitoreo para soporte
- ✅ Documentación legal en términos y condiciones
- ✅ Badge visual en UI mostrando elegibilidad

## Referencias Legales

- **NOM-029-SE-2021**: Comercio electrónico - Periodo de reflexión
- **PROFECO**: Protección al consumidor
- **Código de Comercio**: Artículos aplicables a comercio electrónico

## Soporte

Para dudas sobre la política de reembolso:
- Email: legal@weekchain.mx
- Teléfono: +52 (55) 1234-5678
- Horario: Lunes a Viernes, 9:00 - 18:00 hrs
