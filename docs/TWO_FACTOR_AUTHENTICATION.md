# Sistema de Autenticación de Dos Factores (2FA)

## Descripción General

WEEK-CHAIN™ implementa un sistema robusto de autenticación de dos factores (2FA) basado en TOTP (Time-based One-Time Password) para proteger las cuentas de usuarios, especialmente aquellas con roles administrativos.

## Características

- ✅ **TOTP (RFC 6238)**: Códigos de 6 dígitos que cambian cada 30 segundos
- ✅ **Códigos de Respaldo**: 10 códigos de un solo uso para recuperación
- ✅ **Obligatorio para Roles Críticos**: Admin, Super Admin, Management, Notaría
- ✅ **Auditoría Completa**: Log de todos los eventos 2FA
- ✅ **QR Code**: Configuración fácil con apps de autenticación
- ✅ **Middleware Protection**: Verificación automática en rutas protegidas

## Arquitectura

### Base de Datos

#### Tabla `user_two_factor`
```sql
CREATE TABLE user_two_factor (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    secret TEXT NOT NULL,           -- TOTP secret (base32)
    backup_codes TEXT[],            -- Array de códigos de respaldo
    enabled BOOLEAN DEFAULT false,
    enabled_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

#### Tabla `two_factor_audit_log`
```sql
CREATE TABLE two_factor_audit_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,           -- 'setup', 'enable', 'disable', 'verify_success', 'verify_fail'
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN,
    created_at TIMESTAMPTZ
);
```

### Funciones SQL

#### `has_two_factor_enabled(user_uuid UUID)`
Verifica si un usuario tiene 2FA habilitado.

#### `require_two_factor_for_role()`
Trigger que valida que usuarios con roles críticos tengan 2FA habilitado.

## Flujo de Usuario

### 1. Configuración Inicial

```typescript
// Usuario navega a /auth/setup-2fa
1. Sistema genera secreto TOTP
2. Sistema genera 10 códigos de respaldo
3. Usuario escanea QR code con app de autenticación
4. Usuario ingresa código de verificación
5. Sistema valida código y habilita 2FA
6. Usuario guarda códigos de respaldo
```

### 2. Login con 2FA

```typescript
// Usuario con 2FA habilitado intenta acceder a ruta protegida
1. Usuario inicia sesión normalmente
2. Middleware detecta que requiere 2FA
3. Redirige a /auth/verify-2fa
4. Usuario ingresa código de 6 dígitos
5. Sistema valida código
6. Establece cookie de sesión 2FA (24h)
7. Redirige a destino original
```

### 3. Uso de Código de Respaldo

```typescript
// Usuario perdió acceso a app de autenticación
1. En pantalla de verificación, click "Usar código de respaldo"
2. Ingresa uno de los 10 códigos
3. Sistema valida y remueve código usado
4. Acceso concedido
```

## APIs

### POST `/api/auth/2fa/generate`
Genera secreto TOTP y códigos de respaldo.

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "otpauth://totp/WEEK-CHAIN:user@example.com?secret=...",
  "backupCodes": ["A1B2C3D4", "E5F6G7H8", ...]
}
```

### POST `/api/auth/2fa/enable`
Habilita 2FA después de verificar código.

**Request:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST `/api/auth/2fa/verify`
Verifica código TOTP durante login.

**Request:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true
}
```

### GET `/api/auth/2fa/status`
Obtiene estado de 2FA del usuario actual.

**Response:**
```json
{
  "enabled": true,
  "enabled_at": "2025-01-29T10:00:00Z",
  "last_used_at": "2025-01-29T15:30:00Z"
}
```

### POST `/api/auth/2fa/disable`
Deshabilita 2FA (requiere confirmación).

**Response:**
```json
{
  "success": true
}
```

## Middleware

El middleware en `middleware.ts` verifica automáticamente:

1. **Autenticación**: Usuario debe estar logueado
2. **Rol**: Si el rol requiere 2FA
3. **Estado 2FA**: Si tiene 2FA habilitado
4. **Sesión 2FA**: Si ya verificó 2FA en esta sesión (cookie 24h)

```typescript
// Rutas protegidas
const protectedRoutes = [
  "/admin",
  "/dashboard/admin",
  "/management",
  "/notaria"
]

// Roles que requieren 2FA
const rolesRequiring2FA = [
  "admin",
  "super_admin",
  "management",
  "notaria"
]
```

## Seguridad

### Encriptación
- Secretos TOTP almacenados en base32
- Códigos de respaldo hasheados (recomendado)
- Comunicación HTTPS obligatoria

### Rate Limiting
- Máximo 5 intentos fallidos por minuto
- Bloqueo temporal después de 10 intentos fallidos

### Auditoría
- Todos los eventos 2FA registrados
- IP y User-Agent capturados
- Alertas para intentos fallidos múltiples

### Row Level Security (RLS)
- Usuarios solo ven su propia configuración
- Admins pueden ver todas las configuraciones
- Service role para operaciones del sistema

## Apps de Autenticación Compatibles

- ✅ Google Authenticator
- ✅ Microsoft Authenticator
- ✅ Authy
- ✅ 1Password
- ✅ Bitwarden
- ✅ LastPass Authenticator

## Páginas de Usuario

### `/dashboard/user/security`
Panel de control de seguridad del usuario:
- Estado de 2FA
- Habilitar/Deshabilitar 2FA
- Reconfigurar 2FA
- Cambiar contraseña
- Ver sesiones activas

### `/auth/setup-2fa`
Configuración inicial de 2FA:
- Paso 1: Escanear QR code
- Paso 2: Verificar código
- Paso 3: Guardar códigos de respaldo

### `/auth/verify-2fa`
Verificación de 2FA durante login:
- Ingresar código de 6 dígitos
- Opción de usar código de respaldo

## Panel de Administración

### `/dashboard/admin/security`
Dashboard de seguridad para administradores:
- Estadísticas de 2FA
- Lista de usuarios con/sin 2FA
- Filtros por rol y estado 2FA
- Exportar reporte CSV
- Alertas para admins sin 2FA

## Testing

### Unit Tests
```bash
npm run test:unit -- two-factor
```

### Integration Tests
```bash
npm run test:integration -- 2fa
```

### E2E Tests
```bash
npm run test:e2e -- auth/2fa
```

## Troubleshooting

### "Código inválido"
- Verificar que el reloj del dispositivo esté sincronizado
- Intentar con el código anterior o siguiente (window=1)
- Usar código de respaldo si persiste

### "2FA requerido para este rol"
- Navegar a `/auth/setup-2fa`
- Completar configuración de 2FA
- Intentar acceder nuevamente

### "Perdí acceso a mi app de autenticación"
- Usar código de respaldo
- Contactar soporte si no tiene códigos
- Admin puede deshabilitar 2FA temporalmente

## Mejoras Futuras

- [ ] SMS como método alternativo
- [ ] Biometric authentication
- [ ] Hardware keys (YubiKey, etc.)
- [ ] Notificaciones push
- [ ] Gestión de dispositivos confiables
- [ ] Recuperación por email

## Referencias

- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
- [RFC 4226 - HOTP](https://tools.ietf.org/html/rfc4226)
- [OWASP 2FA Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)

---

**Última actualización:** 2025-01-29  
**Versión:** 1.0  
**Autor:** WEEK-CHAIN Development Team
