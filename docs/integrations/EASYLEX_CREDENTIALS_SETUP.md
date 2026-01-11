# EasyLex - Configuración de Credenciales

## Variables de Entorno Requeridas

Para habilitar la integración de EasyLex en WEEK-CHAIN, debes agregar las siguientes variables de entorno en la sección **Vars** del sidebar de v0:

### Credenciales de Sandbox

```
EASYLEX_API_KEY=bd70840c-65ce-4466-a629-80771870c3a8
EASYLEX_API_SECRET=77194297-19b7-4ef1-b402-0b87ca4f3490
EASYLEX_ENVIRONMENT=sandbox
EASYLEX_API_URL=https://sandboxapi.easylex.com
EASYLEX_WIDGET_URL=https://sandboxwg.easylex.com
```

### Credenciales de Producción

Cuando estés listo para producción, reemplaza con las credenciales de producción:

```
EASYLEX_API_KEY=<tu-llave-publica-produccion>
EASYLEX_API_SECRET=<tu-llave-privada-produccion>
EASYLEX_ENVIRONMENT=production
EASYLEX_API_URL=https://api.easylex.com
EASYLEX_WIDGET_URL=https://widget.easylex.com
```

## Webhook Configuration

EasyLex enviará notificaciones de firma completada a:

```
https://tu-dominio.com/api/easylex/webhook
```

Debes configurar esta URL en tu panel de EasyLex y agregar el webhook secret:

```
EASYLEX_WEBHOOK_SECRET=<tu-webhook-secret>
```

## Pasos de Configuración

1. **Agregar Variables de Entorno en v0**
   - Abre el sidebar de v0
   - Ve a la sección **Vars**
   - Agrega cada variable con su valor correspondiente

2. **Configurar Webhook en EasyLex**
   - Inicia sesión en tu panel de EasyLex
   - Ve a Settings → Webhooks
   - Agrega la URL del webhook de tu aplicación
   - Copia el webhook secret y agrégalo a tus variables de entorno

3. **Verificar la Integración**
   - Una vez configuradas las variables, reinicia la aplicación
   - Prueba crear un certificado o reservación
   - Verifica que el widget de firma se cargue correctamente

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca compartas tus llaves privadas públicamente
- Las llaves mostradas arriba son de sandbox y deben ser reemplazadas en producción
- El webhook secret debe ser único y secreto
- Todas las credenciales deben estar en variables de entorno, NUNCA en el código

## Endpoints que Usan EasyLex

Los siguientes endpoints requieren las credenciales de EasyLex:

- `/api/certificates/issue` - Emisión de certificados con firma electrónica
- `/api/reservations/request` - Solicitud de reservaciones con consentimiento firmado
- `/api/offers/accept` - Aceptación de ofertas con firma electrónica
- `/api/easylex/webhook` - Recepción de notificaciones de firma completada

## Testing

Para probar la integración en sandbox:

1. Crea un certificado o reservación
2. El widget de EasyLex debe aparecer
3. Completa el proceso de firma en el widget
4. Verifica que el webhook reciba la notificación
5. Confirma que el estado del certificado/reservación se actualice a `signed`

## Soporte

- Documentación oficial: https://docs.easylex.com
- API Reference: https://docs.easylex.com/api
- Soporte: soporte@easylex.com
```

```ts file="" isHidden
