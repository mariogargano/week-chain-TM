# Sistema de Roles y Dashboards - WEEK-CHAIN

## Resumen Ejecutivo

WEEK-CHAIN cuenta con un sistema completo de roles y dashboards que permite a diferentes tipos de usuarios gestionar la plataforma según sus permisos y responsabilidades.

## Roles Disponibles

### 1. **Super Admin** (`corporativo@morises.com`)
- **Email:** corporativo@morises.com
- **Acceso:** `/dashboard/admin`
- **Permisos:** Control TOTAL de la plataforma
- **Funcionalidades:**
  - 48 páginas de administración completa
  - Gestión de usuarios, propiedades, certificados
  - Control de pagos, vouchers, reservaciones
  - Analytics y reportes financieros
  - Gestión de KYC, compliance, seguridad
  - Control de DAO, VAFI, wallets blockchain
  - Gestión de emails, webhooks, notificaciones
  - Monitoreo en tiempo real
  - Base de datos y diagnósticos del sistema

### 2. **User** (Usuario Regular)
- **Rol en base de datos:** `user` o `null` (default)
- **Acceso:** `/dashboard/user`
- **Registro:** Disponible vía email/password o Google OAuth
- **Funcionalidades:**
  - Ver mis certificados comprados
  - Solicitar reservaciones de semanas
  - Gestionar mis vouchers
  - Ver historial de transacciones
  - Perfil y configuración de seguridad
  - Ver disponibilidad de propiedades
  - Préstamos VAFI (si aplica)

### 3. **Member** (Miembro Community)
- **Rol en base de datos:** `member`
- **Acceso:** `/dashboard/member`
- **Registro:** Disponible vía registro normal + upgrade
- **Funcionalidades:**
  - Todas las funciones de User +
  - Acceso a community features
  - Posts, comentarios, likes
  - Perfil público con seguidores
  - Notificaciones sociales
  - Contenido exclusivo de miembros

### 4. **Broker** (Corredor de Certificados)
- **Rol en base de datos:** `broker`
- **Acceso:** `/dashboard/broker`
- **Registro:** Disponible vía aplicación y aprobación admin
- **Funcionalidades:**
  - Dashboard con métricas de ventas
  - Calculadora de comisiones
  - Tarjeta de presentación digital
  - Materiales de marketing descargables
  - Ver propiedades disponibles para vender
  - Comisiones ganadas y pendientes
  - Sistema de referidos multinivel
  - Beneficios Elite Broker

### 5. **Property Owner** (Dueño de Propiedad)
- **Rol en base de datos:** `owner`
- **Acceso:** `/dashboard/owner`
- **Registro:** Disponible vía formulario de submission
- **Funcionalidades:**
  - Enviar propiedades para tokenización
  - Ver estado de submissions
  - Firmar contratos digitalmente con Legalario
  - Ver ventas de semanas de su propiedad
  - Notificaciones de aprobaciones/rechazos
  - Dashboard de ingresos por ventas
  - Perfil de Property Owner

### 6. **Notary** (Notario Verificador)
- **Rol en base de datos:** `notary`
- **Acceso:** `/dashboard/notaria`
- **Registro:** Solo por invitación del admin
- **Funcionalidades:**
  - Revisar submissions de propiedades
  - Verificar documentación legal
  - Aprobar/rechazar propiedades
  - Agregar comentarios legales
  - Ver historial de revisiones

## Flujo de Registro por Rol

### Usuario Regular / Member
1. Ir a `/auth/sign-up`
2. Elegir método:
   - Email/Password + Términos y Condiciones
   - Google OAuth + Términos y Condiciones
3. Verificar email (si aplica)
4. Acceso automático a `/dashboard/user`
5. El perfil se crea automáticamente con rol `user`

### Broker
1. Registro normal como User
2. Aplicar en `/broker/apply`
3. Admin revisa y aprueba
4. Rol cambia a `broker` en tabla `profiles`
5. Acceso a `/dashboard/broker`

### Property Owner
1. Registro normal como User
2. Ir a `/dashboard/owner/submit-property`
3. Llenar formulario de submission
4. Sistema crea perfil en `property_owner_profiles`
5. Acceso a `/dashboard/owner`

### Notary
1. Admin crea cuenta manualmente
2. Admin asigna rol `notary`
3. Notario recibe invitación
4. Acceso a `/dashboard/notaria`

## Sistema de Términos y Condiciones

### Implementación Actual
✅ **Componente:** `TermsAcceptanceDialog` (funcional)
✅ **Tabla DB:** `legal_acceptances` + `terms_acceptance`
✅ **Flujo:**
1. Usuario intenta registrarse o hacer login con Google
2. Si no ha aceptado términos, se muestra modal
3. Modal muestra términos completos PROFECO-compliant
4. Usuario debe:
   - Leer por mínimo 10 segundos
   - Scroll mínimo 80%
   - Hacer click en checkbox
5. Se guarda evidencia legal:
   - IP address
   - User agent
   - Timestamp
   - Versión de términos
   - País/idioma

### Contenido Legal Incluido
- Términos y Condiciones (versión 1.0)
- Aviso de Privacidad
- Políticas de Uso
- Disclaimer PROFECO-compliant
- NO menciona "tiempo compartido"
- Usa terminología: "certificados de servicios vacacionales"

## Dashboard del Admin - Funcionalidades Completas

### Gestión de Usuarios (6 páginas)
- `/dashboard/admin/users` - Lista completa de usuarios
- `/dashboard/admin/team` - Gestión de equipo admin
- `/dashboard/admin/kyc` - Verificación KYC de usuarios
- `/dashboard/admin/security` - Seguridad y 2FA
- `/dashboard/admin/fraud-alerts` - Alertas de fraude
- `/dashboard/admin/reports` - Reportes de usuarios

### Gestión de Propiedades (5 páginas)
- `/dashboard/admin/properties` - Todas las propiedades
- `/dashboard/admin/properties/new` - Crear propiedad
- `/dashboard/admin/property-approvals` - Aprobar submissions
- `/dashboard/admin/destinations` - Catálogo de destinos
- `/dashboard/admin/weeks` - Gestión de semanas

### Gestión Financiera (10 páginas)
- `/dashboard/admin/payments` - Todos los pagos
- `/dashboard/admin/vouchers` - Gestión de vouchers
- `/dashboard/admin/transactions` - Transacciones blockchain
- `/dashboard/admin/escrow` - Control de escrow
- `/dashboard/admin/escrow-contable` - Contabilidad escrow
- `/dashboard/admin/commissions` - Comisiones brokers
- `/dashboard/admin/vafi` - Sistema VAFI lending
- `/dashboard/admin/wallets` - Wallets blockchain
- `/dashboard/admin/week-balance` - Balance de WEEK tokens
- `/dashboard/admin/pricing-calculator` - Calculadora precios

### Gestión de Certificados (3 páginas)
- `/dashboard/admin/certificates` - Control de certificados
- `/dashboard/admin/certifications` - Certificaciones emitidas
- `/dashboard/admin/bookings` - Reservaciones activas

### Analytics y Reportes (5 páginas)
- `/dashboard/admin/analytics` - Analytics general
- `/dashboard/admin/real-time-monitor` - Monitor tiempo real
- `/dashboard/admin/capacity-risk` - Análisis de capacidad
- `/dashboard/admin/presale` - Dashboard de preventa
- `/dashboard/admin/exit-strategy` - Estrategia de salida

### Gestión de Contenido (4 páginas)
- `/dashboard/admin/testimonials` - Gestión testimonios
- `/dashboard/admin/marketing` - Mensajes marketing
- `/dashboard/admin/notifications` - Sistema notificaciones
- `/dashboard/admin/email-templates` - Templates email

### Sistema Técnico (12 páginas)
- `/dashboard/admin/database` - Explorador base datos
- `/dashboard/admin/diagnostics` - Diagnósticos sistema
- `/dashboard/admin/system-diagnostics` - Diagnósticos avanzados
- `/dashboard/admin/webhooks` - Gestión webhooks
- `/dashboard/admin/audit-logs` - Logs de auditoría
- `/dashboard/admin/email-logs` - Logs de emails
- `/dashboard/admin/email-test` - Testing emails
- `/dashboard/admin/email-automation` - Automatización
- `/dashboard/admin/legalario` - Integración Legalario
- `/dashboard/admin/ota-sync` - Sincronización OTAs
- `/dashboard/admin/rentals` - Gestión rental income
- `/dashboard/admin/settings` - Configuración general

### Gobernanza Blockchain (2 páginas)
- `/dashboard/admin/dao` - Gobernanza DAO
- `/dashboard/admin/compliance` - Compliance PROFECO

## Verificación del Sistema

### Tablas Críticas en Base de Datos
✅ `profiles` - Perfiles de usuarios con campo `role`
✅ `admin_users` - Admins (necesita agregar `user_id`)
✅ `property_owner_profiles` - Profiles de owners
✅ `users` - Usuarios legacy (migrar a profiles)
✅ `legal_acceptances` - Aceptaciones de términos
✅ `terms_acceptance` - Términos aceptados
✅ `terms_and_conditions` - Contenido legal

### Verificaciones Pendientes
⚠️ `admin_users` necesita columna `user_id` para vincular con `auth.users`
⚠️ `testimonials` NO EXISTE - crear con script SQL
⚠️ `public_destinations_catalog` NO EXISTE - crear con script SQL

## Instrucciones para Admin (corporativo@morises.com)

### Cómo Acceder al Dashboard Admin
1. Ir a `https://week-chain.com/auth`
2. Click en "Conectar con Google"
3. Aceptar términos y condiciones (primera vez)
4. Seleccionar cuenta: corporativo@morises.com
5. Automáticamente redirige a `/dashboard/admin`

### Cómo Gestionar Usuarios
1. Ir a `/dashboard/admin/users`
2. Ver lista completa de usuarios
3. Cambiar roles directamente desde la tabla `profiles`
4. Aprobar/rechazar solicitudes de brokers
5. Ver métricas de actividad

### Cómo Gestionar Propiedades
1. Ir a `/dashboard/admin/properties`
2. Ver todas las propiedades tokenizadas
3. Ir a `/dashboard/admin/property-approvals`
4. Revisar submissions de owners
5. Aprobar/rechazar con comentarios
6. Crear nuevas propiedades manualmente en `/dashboard/admin/properties/new`

### Cómo Gestionar Pagos
1. Ir a `/dashboard/admin/payments`
2. Ver todos los pagos (Conekta + SPEI + OXXO)
3. Filtrar por status, método, fecha
4. Ver detalles de cada transacción
5. Emitir reembolsos si necesario

## Scripts SQL Necesarios

Ejecutar en orden para fix completo:

```sql
-- 1. Agregar user_id a admin_users
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Configurar corporativo@morises.com como super admin
UPDATE admin_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'corporativo@morises.com')
WHERE email = 'corporativo@morises.com';

-- 3. Crear tabla testimonials (ver script 200_EXECUTE_THIS_FIRST.sql)
-- 4. Crear tabla public_destinations_catalog (ver script 200_EXECUTE_THIS_FIRST.sql)
```

## Resumen de Estado Actual

### ✅ Funcionando Correctamente
- Sistema de autenticación (email + Google OAuth)
- Términos y condiciones modal
- Dashboard router que redirige según rol
- 139+ páginas de dashboard
- Sistema de roles en tabla `profiles`
- Google OAuth para corporativo@morises.com

### ⚠️ Necesita Atención
- Ejecutar script SQL para crear tablas faltantes
- Agregar columna `user_id` a `admin_users`
- Verificar que corporativo@morises.com tenga acceso completo

### 🎯 Listo para Producción
Una vez ejecutes el script SQL 200_EXECUTE_THIS_FIRST.sql, la plataforma estará 100% lista para:
- Registro de usuarios regulares
- Registro y gestión de brokers
- Submissions de property owners
- Gestión completa desde dashboard admin
- Sistema legal PROFECO-compliant
- Pagos con Conekta
- Blockchain integration

---

**Última actualización:** Diciembre 2025
**Mantenido por:** WEEK-CHAIN Tech Team
