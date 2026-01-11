# Cómo Insertar las Propiedades en WEEK-CHAIN

## Problema Actual

La tabla `properties` en Supabase está **VACÍA**. Por eso:
- La home muestra propiedades hardcodeadas (fallback)
- La página `/destinos` muestra propiedades hardcodeadas (fallback)
- El API devuelve `{"total": 0}`

## Solución: Ejecutar el Script SQL

### Paso 1: Acceder a Supabase SQL Editor

1. Ve a la aplicación de WEEK-CHAIN en v0.dev
2. En el sidebar izquierdo, haz clic en **"Connect"**
3. Busca la integración de **Supabase**
4. Haz clic en **"Open Supabase Dashboard"**
5. En el dashboard de Supabase, ve a **SQL Editor** en el menú izquierdo

### Paso 2: Ejecutar el Script

1. Haz clic en **"New Query"**
2. Abre el archivo `scripts/EJECUTAR_INSERTAR_PROPIEDADES.sql`
3. **Copia TODO el contenido del script**
4. **Pega** el script completo en el SQL Editor de Supabase
5. Haz clic en **"RUN"** o presiona `Cmd/Ctrl + Enter`

### Paso 3: Verificar la Inserción

Deberías ver una tabla con 8 propiedades:

| name                 | location                          | price   | status    | location_group      |
|----------------------|-----------------------------------|---------|-----------|---------------------|
| Villa Positano       | Positano, Costa Amalfitana...    | 16500   | available | AMALFI COAST        |
| Vila Ksamil          | Ksamil, Riviera Albanesa...     | 11800   | available | BALKAN RIVIERA      |
| Casa Bacalar         | Bacalar, Quintana Roo...         | 9800    | available | CARIBBEAN MEXICO    |
| Finca Cholula        | Cholula, Puebla...               | 8900    | available | CENTRAL MEXICO      |
| Chalet Dolomiti      | Cortina d'Ampezzo...             | 14200   | available | ITALIAN ALPS        |
| Borgo di Civita      | Orvieto, Umbría...               | 13200   | available | ITALIAN COUNTRYSIDE |
| Bosphorus Yalı Villa | Bósforo, Estambul...             | 14900   | available | MEDITERRANEAN       |
| UXAN                 | Riviera Maya, Tulum...           | 12500   | available | RIVIERA MAYA        |

### Paso 4: Verificar en la Aplicación

1. Ve a la **home** de WEEK-CHAIN → Deberías ver las 8 propiedades en "Destinos Participantes"
2. Ve a `/destinos` → Deberías ver las 8 propiedades agrupadas por región con el diseño mejorado
3. El API `/api/destinations/list` ahora devuelve `{"total": 8}`

## Propiedades Insertadas

### 1. **UXAN** (Riviera Maya, México)
- Precio: $12,500 USD
- Capacidad: 8 huéspedes
- Arquitectura orgánica con celosía de madera

### 2. **Vila Ksamil** (Albania)
- Precio: $11,800 USD
- Capacidad: 10 huéspedes
- Villa moderna frente al mar Jónico

### 3. **Bosphorus Yalı Villa** (Turquía)
- Precio: $14,900 USD
- Capacidad: 12 huéspedes
- Mansión otomana en el Bósforo

### 4. **Borgo di Civita** (Italia - Umbría)
- Precio: $13,200 USD
- Capacidad: 8 huéspedes
- Borgo medieval en colinas toscanas

### 5. **Casa Bacalar** (México - Laguna)
- Precio: $9,800 USD
- Capacidad: 6 huéspedes
- Villa sobre la Laguna de los Siete Colores

### 6. **Villa Positano** (Italia - Amalfi)
- Precio: $16,500 USD
- Capacidad: 10 huéspedes
- Villa en acantilado sobre el Mediterráneo

### 7. **Chalet Dolomiti** (Italia - Alpes)
- Precio: $14,200 USD
- Capacidad: 8 huéspedes
- Chalet alpino con acceso a pistas de esquí

### 8. **Finca Cholula** (México - Puebla)
- Precio: $8,900 USD
- Capacidad: 12 huéspedes
- Hacienda colonial con vistas a la pirámide

## Sistema de Autenticación

El sistema de autenticación está **FUNCIONANDO CORRECTAMENTE**:

✅ **Google OAuth** configurado y habilitado
✅ **Email/Password** con validación
✅ **Registro** con checkbox de términos PROFECO-compliant
✅ **Middleware** simplificado sin loops de desconexión
✅ **Dashboard routing** por rol (admin → `/dashboard/admin`, users → `/dashboard/user`)

### Para Probar el Login:

1. Ve a `/auth/login` o `/auth`
2. Usa **Google OAuth** o **Email/Password**
3. Para admin: usa el email `corporativo@morises.com`
4. El sistema redirige automáticamente al dashboard correcto según el rol

## Notas Importantes

- Las propiedades NO tienen calendario de weeks porque WEEK-CHAIN usa el modelo **REQUEST → OFFER → CONFIRM**
- Los precios son referenciales - el sistema determina precios dinámicamente
- Las imágenes están almacenadas en `/public/` y algunas en Vercel Blob Storage
- El diseño de la página `/destinos` ahora es extremadamente atractivo con cards mejoradas y badges informativos

## Troubleshooting

### Si las propiedades no aparecen después de ejecutar el script:

1. **Verifica en Supabase** que la tabla `properties` tenga 8 registros:
   ```sql
   SELECT COUNT(*) FROM properties;
   ```

2. **Refresca la aplicación** (Cmd/Ctrl + R) para limpiar el caché

3. **Verifica el API** abriendo `/api/destinations/list` en el navegador - debería devolver `{"total": 8}`

4. **Revisa los logs** de v0 para ver si hay errores de fetch

### Si el login no funciona:

1. Verifica que las variables de entorno de Supabase estén configuradas
2. Revisa que Google OAuth esté habilitado en Supabase Dashboard → Authentication → Providers
3. Para admin, asegúrate que el usuario `corporativo@morises.com` exista en `auth.users`
