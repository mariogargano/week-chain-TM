# 🔒 Row Level Security (RLS) - Guía Completa

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura RLS](#arquitectura-rls)
3. [Políticas Implementadas](#políticas-implementadas)
4. [Testing y Verificación](#testing-y-verificación)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Row Level Security (RLS) es una característica de PostgreSQL/Supabase que permite controlar el acceso a filas individuales de una tabla basándose en el usuario que realiza la consulta.

### ¿Por qué RLS?

- **Seguridad por defecto**: Los datos están protegidos incluso si hay bugs en el código
- **Cumplimiento legal**: LFPDPPP, GDPR, NOM-151 requieren protección de datos personales
- **Defensa en profundidad**: Múltiples capas de seguridad
- **Auditoría**: Fácil verificar qué usuarios pueden acceder a qué datos

---

## 🏗️ Arquitectura RLS

### Niveles de Acceso

\`\`\`
┌─────────────────────────────────────────────────┐
│                  SERVICE ROLE                    │
│         (Acceso completo a todas las tablas)     │
└─────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────┐
│              ADMIN / MANAGEMENT                  │
│    (Acceso ampliado para administración)        │
└─────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────┐
│                AUTHENTICATED USER                │
│         (Solo sus propios datos)                 │
└─────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────┐
│                  ANONYMOUS                       │
│         (Solo datos públicos)                    │
└─────────────────────────────────────────────────┘
\`\`\`

### Tipos de Políticas

#### 1. **Self-Access (Acceso Propio)**
\`\`\`sql
CREATE POLICY "Users can view their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);
\`\`\`

#### 2. **Relationship-Based (Basado en Relaciones)**
\`\`\`sql
CREATE POLICY "Users can view related data"
ON table_name FOR SELECT
USING (
  parent_id IN (
    SELECT id FROM parent_table WHERE user_id = auth.uid()
  )
);
\`\`\`

#### 3. **Role-Based (Basado en Roles)**
\`\`\`sql
CREATE POLICY "Admins can view all data"
ON table_name FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);
\`\`\`

#### 4. **Public Access (Acceso Público)**
\`\`\`sql
CREATE POLICY "Anyone can view public data"
ON table_name FOR SELECT
USING (true);
\`\`\`

---

## 📊 Políticas Implementadas

### Categoría 1: Datos Financieros

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `escrow_deposits` | Self-access | Solo usuario ve sus depósitos |
| `week_balances` | Self-access | Solo usuario ve sus balances |
| `week_transactions` | Bidirectional | Usuario ve transacciones donde es from/to |
| `fiat_payments` | Self-access | Solo usuario ve sus pagos |
| `broker_commissions` | Self-access | Solo broker ve sus comisiones |

### Categoría 2: Préstamos y Colaterales

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `vafi_loans` | Self-access | Solo borrower ve sus préstamos |
| `vafi_payments` | Relationship | Usuario ve pagos de sus préstamos |
| `vafi_liquidations` | Relationship | Usuario ve liquidaciones de sus préstamos |
| `loans` | Self-access | Usuario ve sus préstamos DeFi |
| `collaterals` | Relationship | Usuario ve colaterales de sus préstamos |

### Categoría 3: Alquileres y Rentals

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `week_rentals` | Bidirectional | Owner y renter ven el rental |
| `rental_income` | Relationship | Owner ve ingresos de sus rentals |
| `ota_sync_logs` | Admin-only | Solo admins ven logs de OTA |

### Categoría 4: Referidos y Comisiones

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `referral_tree` | Bidirectional | Referrer y referred ven la relación |
| `broker_commissions` | Self-access | Broker ve sus comisiones |
| `broker_elite_benefits` | Self-access | Broker ve sus beneficios |
| `user_referral_commissions` | Self-access | Usuario ve sus comisiones |
| `anonymous_referrals` | Admin-only | Solo admins ven referidos anónimos |

### Categoría 5: NFTs y Gestión

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `nft_management` | Self-access | Owner ve su gestión de NFT |
| `management_services` | Relationship | Owner ve servicios de su gestión |
| `management_communications` | Relationship | Owner ve comunicaciones de su gestión |
| `management_availability` | Relationship | Owner gestiona disponibilidad |

### Categoría 6: Compras y Vouchers

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `purchase_vouchers` | Self-access | Usuario ve sus vouchers |
| `voucher_redemptions` | Relationship | Usuario ve redenciones de sus vouchers |
| `full_property_purchases` | Self-access | Buyer ve sus compras completas |
| `holder_refunds` | Self-access | Holder ve sus reembolsos |
| `full_purchase_payments` | Relationship | Buyer ve pagos de sus compras |

### Categoría 7: Legal y Compliance

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `legal_contracts` | Self-access | Usuario ve sus contratos |
| `terms_acceptance` | Self-access | Usuario ve sus aceptaciones |
| `cancellation_requests` | Self-access | Usuario ve sus cancelaciones |
| `refunds` | Self-access | Usuario ve sus reembolsos |
| `compliance_audit_log` | Self-access | Usuario ve su audit log |

### Categoría 8: Datos Públicos

| Tabla | Política | Descripción |
|-------|----------|-------------|
| `seasons` | Public read | Todos ven temporadas |
| `week_seasons` | Public read | Todos ven semanas por temporada |
| `property_pricing_config` | Public read | Todos ven configuración de precios |
| `service_categories` | Public read | Todos ven categorías de servicios |
| `nom151_documents` | Public read | Documentos NOM-151 públicos |

---

## 🧪 Testing y Verificación

### 1. Verificar RLS Habilitado

\`\`\`sql
-- Ver todas las tablas y su estado de RLS
SELECT * FROM verify_rls_enabled();
\`\`\`

**Resultado esperado:**
\`\`\`
table_name              | rls_enabled | policies_count
------------------------+-------------+---------------
escrow_deposits         | true        | 2
week_balances           | true        | 2
purchase_vouchers       | true        | 3
...
\`\`\`

### 2. Listar Tablas Sin RLS

\`\`\`sql
-- Ver tablas que NO tienen RLS (riesgo de seguridad)
SELECT * FROM tables_without_rls();
\`\`\`

**Resultado esperado:**
\`\`\`
table_name
-----------
(0 rows)  -- ¡Ideal! Todas las tablas tienen RLS
\`\`\`

### 3. Test Manual de Políticas

\`\`\`sql
-- Como usuario normal (usando anon key)
SELECT * FROM escrow_deposits;
-- Debe retornar solo los depósitos del usuario actual

-- Como admin (usando service role key)
SELECT * FROM escrow_deposits;
-- Debe retornar todos los depósitos
\`\`\`

### 4. Test de Inserción

\`\`\`sql
-- Intentar insertar datos de otro usuario (debe fallar)
INSERT INTO purchase_vouchers (user_id, property_id, ...)
VALUES ('otro-user-id', ...);
-- Error: new row violates row-level security policy
\`\`\`

---

## ✅ Mejores Prácticas

### 1. **Siempre Habilitar RLS en Tablas Nuevas**

\`\`\`sql
-- Al crear una tabla nueva
CREATE TABLE new_table (...);

-- INMEDIATAMENTE después
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Y crear políticas
CREATE POLICY "..." ON new_table ...;
\`\`\`

### 2. **Usar Service Role Solo en Backend**

\`\`\`typescript
// ❌ MAL: Usar service role en cliente
const supabase = createClient(url, SERVICE_ROLE_KEY) // NUNCA en cliente

// ✅ BIEN: Usar anon key en cliente
const supabase = createClient(url, ANON_KEY)

// ✅ BIEN: Service role solo en API routes
// app/api/admin/route.ts
const supabase = createClient(url, SERVICE_ROLE_KEY)
\`\`\`

### 3. **Verificar Políticas Antes de Deploy**

\`\`\`bash
# En CI/CD pipeline
psql $DATABASE_URL -c "SELECT * FROM tables_without_rls();"

# Si retorna filas, fallar el deploy
if [ $? -ne 0 ]; then
  echo "❌ Tablas sin RLS detectadas!"
  exit 1
fi
\`\`\`

### 4. **Auditar RLS Mensualmente**

\`\`\`sql
-- Crear recordatorio mensual
SELECT 
  table_name,
  rls_enabled,
  policies_count,
  CASE 
    WHEN policies_count = 0 THEN '⚠️ SIN POLÍTICAS'
    WHEN policies_count < 2 THEN '⚠️ POCAS POLÍTICAS'
    ELSE '✅ OK'
  END as status
FROM verify_rls_enabled()
WHERE rls_enabled = true
ORDER BY policies_count ASC;
\`\`\`

### 5. **Documentar Políticas Complejas**

\`\`\`sql
CREATE POLICY "Complex policy with business logic"
ON table_name FOR SELECT
USING (
  -- Explicar la lógica aquí
  auth.uid() = user_id 
  OR (
    -- Caso especial: admins pueden ver datos de su región
    (auth.jwt() ->> 'role')::text = 'admin'
    AND region_id = (auth.jwt() ->> 'region_id')::uuid
  )
);

COMMENT ON POLICY "Complex policy with business logic" ON table_name IS
'Permite acceso a usuarios propios y admins de la misma región';
\`\`\`

---

## 🔧 Troubleshooting

### Problema 1: "permission denied for table"

**Causa:** RLS habilitado pero sin políticas

**Solución:**
\`\`\`sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'nombre_tabla';

-- Si no hay políticas, crear una
CREATE POLICY "..." ON nombre_tabla FOR SELECT USING (...);
\`\`\`

### Problema 2: Usuario no puede ver sus propios datos

**Causa:** Política incorrecta o auth.uid() null

**Solución:**
\`\`\`sql
-- Verificar que auth.uid() funciona
SELECT auth.uid();

-- Si retorna null, el usuario no está autenticado
-- Verificar que se está usando el token correcto
\`\`\`

### Problema 3: Admin no puede ver todos los datos

**Causa:** Falta política para role admin

**Solución:**
\`\`\`sql
CREATE POLICY "Admins can view all data"
ON table_name FOR ALL
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);
\`\`\`

### Problema 4: Queries muy lentos después de RLS

**Causa:** Políticas con subqueries complejos sin índices

**Solución:**
\`\`\`sql
-- Agregar índices en columnas usadas en políticas
CREATE INDEX idx_table_user_id ON table_name(user_id);
CREATE INDEX idx_table_parent_id ON table_name(parent_id);

-- Analizar query plan
EXPLAIN ANALYZE SELECT * FROM table_name;
\`\`\`

---

## 📚 Referencias

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [LFPDPPP - Ley Federal de Protección de Datos Personales](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf)
- [NOM-151-SCFI-2016](https://www.dof.gob.mx/nota_detalle.php?codigo=5469949)

---

## 🎯 Checklist de Seguridad RLS

- [ ] Todas las tablas con datos sensibles tienen RLS habilitado
- [ ] Cada tabla tiene al menos 2 políticas (SELECT + INSERT/UPDATE)
- [ ] Service role key NUNCA se expone en cliente
- [ ] Políticas complejas tienen índices apropiados
- [ ] Se ejecuta `verify_rls_enabled()` mensualmente
- [ ] Se ejecuta `tables_without_rls()` antes de cada deploy
- [ ] Políticas están documentadas con COMMENT
- [ ] Tests automatizados verifican políticas
- [ ] Equipo está capacitado en RLS
- [ ] Existe proceso de revisión de políticas nuevas

---

**Última actualización:** 2025-01-29  
**Mantenido por:** Equipo de Seguridad WEEK-CHAIN™  
**Contacto:** security@weekchain.com
