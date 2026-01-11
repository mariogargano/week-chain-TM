# TAREAS PENDIENTES - WEEKCHAIN

## CRÍTICAS (Hacer AHORA)

### 1. Ejecutar Scripts SQL en Supabase
**Tiempo estimado:** 30 minutos
**Prioridad:** 🔴 CRÍTICA

**Scripts a ejecutar en orden:**
1. `scripts/018_purchase_voucher_system.sql`
2. `scripts/019_demo_environment_setup.sql`
3. `scripts/020_fiat_payments_table.sql`
4. `scripts/021_fix_fiat_payments_and_demo.sql`
5. `scripts/022_universal_referral_platform.sql`
6. `scripts/023_services_marketplace.sql`
7. `scripts/024_seed_vacation_services.sql`
8. `scripts/025_legal_compliance_module.sql`
9. `scripts/026_mifiel_nom151_integration.sql`
10. `scripts/027_defi_loans_system.sql`

**Pasos:**
```bash
1. Ir a Supabase Dashboard → SQL Editor
2. Abrir cada script
3. Copiar contenido completo
4. Pegar en SQL Editor
5. Click "Run"
6. Verificar "Success" sin errores
7. Repetir para cada script
```

**Verificación:**
- Todas las tablas creadas
- Triggers funcionando
- RLS policies activas
- Funciones SQL disponibles

---

### 2. Configurar Credenciales Mifiel
**Tiempo estimado:** 15 minutos
**Prioridad:** 🔴 CRÍTICA

**Variables a agregar en Vercel:**
```env
MIFIEL_APP_ID=tu_app_id_aqui
MIFIEL_SECRET_KEY=tu_secret_key_aqui
MIFIEL_WEBHOOK_USER=tu_webhook_user_aqui
MIFIEL_WEBHOOK_SECRET=tu_webhook_secret_aqui
```

**Pasos:**
1. Crear cuenta en https://mifiel.com
2. Ir a Settings → API
3. Generar App ID y Secret Key
4. Crear credenciales de webhook
5. Agregar en Vercel → Settings → Environment Variables
6. Redeploy la aplicación

**Webhook URL:**
```
https://tu-dominio.vercel.app/api/mifiel/callback
```

---

### 3. Testing de Flujos Críticos
**Tiempo estimado:** 2 horas
**Prioridad:** 🔴 CRÍTICA

**Checklist de pruebas:**

#### Flujo de Registro
- [ ] Abrir plataforma sin estar logueado
- [ ] Verificar que aparece modal de términos
- [ ] Intentar cerrar modal (debe estar bloqueado)
- [ ] Scroll completo de términos
- [ ] Aceptar términos y privacidad
- [ ] Registrarse con email
- [ ] Verificar email recibido
- [ ] Confirmar cuenta

#### Flujo de Compra
- [ ] Explorar propiedades
- [ ] Seleccionar una semana
- [ ] Ver calendario de disponibilidad
- [ ] Crear reserva
- [ ] Seleccionar método de pago
- [ ] Completar pago (usar modo test)
- [ ] Verificar voucher creado
- [ ] Verificar certificación NOM-151 iniciada

#### Flujo de Certificación
- [ ] Esperar callback de Mifiel (o simular)
- [ ] Verificar folio generado
- [ ] Verificar hash SHA-256
- [ ] Verificar status "certified"
- [ ] Intentar mintear NFT (debe funcionar)

#### Flujo de Cancelación (Dentro de 120h)
- [ ] Crear voucher nuevo
- [ ] Inmediatamente solicitar cancelación
- [ ] Verificar auto-aprobación
- [ ] Verificar reembolso procesado
- [ ] Verificar registro en audit log

#### Flujo de Cancelación (Fuera de 120h)
- [ ] Usar voucher con más de 5 días
- [ ] Solicitar cancelación
- [ ] Verificar error 409
- [ ] Verificar mensaje "Plazo de 120h vencido"

#### Flujo de Referidos
- [ ] Crear usuario A
- [ ] Generar código de referido
- [ ] Crear usuario B con código de A
- [ ] Usuario B compra semana
- [ ] Verificar comisión 3% para A
- [ ] Crear usuario C con código de B
- [ ] Usuario C compra semana
- [ ] Verificar comisión 2% para A, 3% para B

#### Flujo de VA-FI
- [ ] Usuario con NFT solicita préstamo
- [ ] Ingresar monto, APR, LTV
- [ ] Verificar colateral congelado
- [ ] Intentar transferir NFT (debe fallar)
- [ ] Pagar préstamo
- [ ] Verificar colateral descongelado

---

## IMPORTANTES (Primera Semana)

### 4. Agregar Más Propiedades
**Tiempo estimado:** 3 horas
**Prioridad:** 🟡 IMPORTANTE

**Objetivo:** 20-30 propiedades

**Opciones:**

**Opción A: Manual (recomendado para primeras 10)**
1. Ir a `/dashboard/admin/properties/new`
2. Llenar formulario completo
3. Subir imágenes de calidad
4. Agregar amenidades
5. Configurar precios por temporada
6. Publicar

**Opción B: Script SQL (para bulk)**
1. Crear script `seed-more-properties.sql`
2. Copiar estructura de `seed-properties-and-weeks.sql`
3. Agregar 20-30 propiedades
4. Ejecutar en Supabase

**Propiedades sugeridas:**
- Cancún (5 propiedades)
- Playa del Carmen (5 propiedades)
- Tulum (3 propiedades)
- Los Cabos (3 propiedades)
- Puerto Vallarta (3 propiedades)
- Riviera Nayarit (2 propiedades)
- Huatulco (2 propiedades)
- Mazatlán (2 propiedades)

---

### 5. Crear Documentación de Usuario
**Tiempo estimado:** 4 horas
**Prioridad:** 🟡 IMPORTANTE

**Documentos a crear:**

#### Guía de Inicio Rápido
- Cómo registrarse
- Cómo explorar propiedades
- Cómo hacer una reserva
- Cómo pagar
- Cómo recibir tu NFT

#### FAQ Extendido
- ¿Qué es WeekChain?
- ¿Cómo funciona el sistema de semanas?
- ¿Qué es un NFT?
- ¿Puedo cancelar mi compra?
- ¿Cómo funciona el sistema de referidos?
- ¿Qué es VA-FI?
- ¿Cómo obtengo préstamos?

#### Guía de Referidos
- Cómo generar tu código
- Cómo compartir tu código
- Cómo ganar comisiones
- Estructura multinivel explicada
- Cómo llegar a Elite Broker

#### Guía Legal
- Términos y condiciones explicados
- Derechos del consumidor
- Periodo de reflexión (120h)
- Certificación NOM-151
- Protección de datos

---

### 6. Configurar Monitoreo
**Tiempo estimado:** 2 horas
**Prioridad:** 🟡 IMPORTANTE

**Herramientas a configurar:**

#### Sentry (Errores)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configurar:**
- Error tracking
- Performance monitoring
- Alertas por email/Slack

#### Vercel Analytics
```bash
# Ya incluido en Vercel
# Solo activar en dashboard
```

**Métricas a monitorear:**
- Page views
- Unique visitors
- Conversion rate
- Bounce rate

#### Alertas Personalizadas
Crear alertas para:
- Transacciones fallidas
- Certificaciones NOM-151 fallidas
- Rate limiting activado
- Errores 500
- Tiempo de respuesta > 3s

---

## OPCIONALES (Mejoras Futuras)

### 7. Optimizaciones de Performance
**Tiempo estimado:** 1 semana
**Prioridad:** 🟢 OPCIONAL

- Implementar Redis para caching
- Optimizar queries SQL con índices
- Lazy loading de imágenes
- Code splitting por ruta
- Preload de datos críticos
- Service Worker para PWA

---

### 8. Features Adicionales
**Tiempo estimado:** 2-4 semanas
**Prioridad:** 🟢 OPCIONAL

- Chat en vivo (Intercom/Crisp)
- Notificaciones push
- App móvil React Native
- Integración con más blockchains
- Más métodos de pago (PayPal, etc)
- Sistema de reviews
- Programa de lealtad

---

### 9. Marketing y Growth
**Tiempo estimado:** Continuo
**Prioridad:** 🟢 OPCIONAL

- SEO optimization
- Blog de contenido
- Redes sociales
- Email marketing
- Programa de afiliados
- Partnerships con hoteles
- Campañas de ads

---

## RESUMEN DE PRIORIDADES

### HOY (Día 1)
1. ✅ Ejecutar scripts SQL (30 min)
2. ✅ Configurar Mifiel (15 min)
3. ✅ Testing básico (1 hora)

### ESTA SEMANA (Días 2-7)
4. ✅ Testing exhaustivo (2 horas)
5. ✅ Agregar 10 propiedades (3 horas)
6. ✅ Documentación básica (4 horas)
7. ✅ Configurar monitoreo (2 horas)

### PRÓXIMO MES
8. ⏳ Optimizaciones
9. ⏳ Features adicionales
10. ⏳ Marketing

---

## CHECKLIST DE LANZAMIENTO

### Pre-Lanzamiento
- [ ] Scripts SQL ejecutados
- [ ] Mifiel configurado
- [ ] Testing completo
- [ ] 20+ propiedades agregadas
- [ ] Documentación creada
- [ ] Monitoreo configurado
- [ ] Dominio configurado
- [ ] SSL activo
- [ ] Backups automáticos
- [ ] Revisión legal

### Lanzamiento
- [ ] Deploy a producción
- [ ] Verificación post-deploy
- [ ] Monitoreo activo
- [ ] Equipo de soporte listo
- [ ] Anuncio oficial

### Post-Lanzamiento
- [ ] Monitoreo diario
- [ ] Recopilación de feedback
- [ ] Resolución de bugs
- [ ] Mejoras continuas

---

**Última actualización:** Enero 2025
**Estado:** LISTO PARA EJECUTAR
