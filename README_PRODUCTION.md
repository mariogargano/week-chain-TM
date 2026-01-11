# WEEK-CHAIN - Guía de Producción

## Configuración del Entorno

WEEK-CHAIN utiliza un sistema centralizado de configuración que valida automáticamente todas las variables de entorno necesarias.

### Validar Configuración

Antes de desplegar a producción, ejecuta:

```bash
npm run validate-env
```

Este comando verificará:
- Variables de entorno críticas
- Configuración de procesadores de pago
- Estado de KYC y cumplimiento legal
- Configuración de blockchain

### Modo Demo vs Producción

El sistema detecta automáticamente el modo basándose en las API keys:

**Modo Demo (Desarrollo/Testing)**
- Stripe keys con `_test_`
- Conekta key = `demo_mode` o vacía
- Solana en devnet
- KYC deshabilitado
- Logs de debug habilitados

**Modo Producción**
- Stripe keys con `_live_`
- Conekta key de producción
- Solana en mainnet-beta
- KYC obligatorio
- Logs de debug deshabilitados (a menos que `NEXT_PUBLIC_DEBUG=true`)

### Sistema de Logging

El sistema usa un logger centralizado que:
- Se deshabilita automáticamente en producción
- Puede habilitarse con `NEXT_PUBLIC_DEBUG=true`
- Soporta niveles: debug, info, warn, error
- Configurable con `LOG_LEVEL`

```typescript
import { logger } from '@/lib/config/logger'

logger.debug('Mensaje de debug')
logger.info('Información general')
logger.warn('Advertencia')
logger.error('Error crítico')
```

### Variables de Entorno Requeridas

Ver `PRODUCTION_CHECKLIST.md` para la lista completa.

### Despliegue

1. Configurar todas las variables en Vercel
2. Ejecutar `npm run validate-env` localmente
3. Desplegar con `vercel --prod`
4. Verificar logs de inicio para confirmar configuración

### Monitoreo

El sistema imprime un resumen de configuración al iniciar:

```
🔧 WEEK-CHAIN Environment Configuration

Environment: production
Demo Mode: ❌ DISABLED
Production: ✅ YES

Payment Processors:
  Stripe: ✅ Production
  Conekta: ✅ Production

KYC Provider: persona
Blockchain: mainnet-beta

✅ Configuration validated successfully
```

### Troubleshooting

Si ves errores de configuración:
1. Revisa las variables de entorno en Vercel
2. Ejecuta `npm run validate-env` para ver detalles
3. Consulta `PRODUCTION_CHECKLIST.md`
4. Verifica los logs de inicio de la aplicación
```
