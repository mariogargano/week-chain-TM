# 🏠 Guía: Subir la Primera Propiedad Real a WEEK-CHAIN

## ✅ Estado Actual de la Plataforma

La plataforma está **LISTA** para recibir propiedades reales mientras mantiene el entorno en modo demo:

- ✅ Modo Demo activo (pagos simulados)
- ✅ Sistema de creación de propiedades funcional
- ✅ Generación automática de 52 semanas tokenizadas
- ✅ Cálculo automático de precios por temporada
- ✅ Base de datos Supabase configurada
- ✅ Propiedades reales y demo pueden coexistir

---

## 📋 Requisitos Previos

### 1. Acceso de Administrador
- Tener una cuenta con rol "admin"
- Wallet conectada y registrada en `admin_wallets`

### 2. Información de la Propiedad
Prepara la siguiente información:

**Básica:**
- Nombre de la propiedad
- Ubicación completa (ciudad, estado, país)
- Descripción detallada (mínimo 100 caracteres)

**Financiera:**
- Valor total de la propiedad en USD
- Estrategia de precios (estacional recomendado)

**Visual:**
- URL de imagen principal (puedes usar Imgur, Cloudinary, etc.)
- Imágenes adicionales (opcional)

**Detalles (opcional pero recomendado):**
- Tipo de propiedad (casa vacacional, departamento, villa, etc.)
- Número de habitaciones
- Número de baños
- Metros cuadrados
- Amenidades (piscina, gym, playa, etc.)

---

## 🚀 Proceso de Creación

### Opción 1: Dashboard Moderno (Recomendado)

**Ruta:** `/dashboard/admin/properties/new`

**Características:**
- Interfaz moderna y visual
- Precios estacionales automáticos
- Vista previa de ingresos estimados
- Validaciones en tiempo real

**Pasos:**

1. **Accede al Dashboard Admin**
   ```
   https://tu-dominio.com/dashboard/admin
   ```

2. **Click en "Agregar Nueva Propiedad"**
   - O navega directamente a `/dashboard/admin/properties/new`

3. **Completa el Formulario**

   **Información Básica:**
   - Nombre: "Villa Paraíso Tulum"
   - Ubicación: "Tulum, Quintana Roo, México"
   - Descripción: Descripción completa y atractiva

   **Precio:**
   - Valor Total: $520,000 USD
   - El sistema calculará automáticamente:
     - Precio base por semana: $10,000
     - Precios por temporada:
       - Ultra Alta (x2.0): $20,000
       - Alta (x1.5): $15,000
       - Media (x1.0): $10,000
       - Baja (x0.7): $7,000

   **Imagen:**
   - URL de imagen principal
   - Vista previa automática

4. **Revisa el Resumen**
   - Verifica precios calculados
   - Revisa distribución de temporadas
   - Confirma ingresos estimados

5. **Click en "Crear Propiedad"**
   - El sistema creará:
     - ✅ Propiedad en la base de datos
     - ✅ 52 semanas tokenizadas
     - ✅ Precios por temporada
     - ✅ Estado "active"

6. **Confirmación**
   - Mensaje de éxito
   - Redirección automática a lista de propiedades

### Opción 2: Formulario Clásico

**Ruta:** `/admin/properties/new`

**Características:**
- Interfaz simple y directa
- Precio uniforme por semana
- Generación automática de 52 semanas

**Pasos similares pero con precio único por semana**

---

## 📊 Distribución de Temporadas

El sistema usa la siguiente distribución automática:

### Temporada Ultra Alta (4 semanas) - Multiplicador 2.0x
- Semanas: 52, 1, 14, 15
- Fechas: Año Nuevo, Semana Santa
- Precio: Base × 2.0

### Temporada Alta (14 semanas) - Multiplicador 1.5x
- Semanas: 2-8, 26-32
- Fechas: Enero-Febrero, Junio-Agosto
- Precio: Base × 1.5

### Temporada Media (24 semanas) - Multiplicador 1.0x
- Semanas: 9-13, 16-20, 33-46
- Fechas: Marzo, Mayo, Septiembre-Noviembre
- Precio: Base × 1.0

### Temporada Baja (10 semanas) - Multiplicador 0.7x
- Semanas: 21-25, 47-51
- Fechas: Mayo-Junio, Diciembre
- Precio: Base × 0.7

---

## 🔍 Verificación Post-Creación

### 1. Verifica en el Dashboard Admin
```
/dashboard/admin/properties
```

Deberías ver:
- ✅ Tu nueva propiedad listada
- ✅ Estado "active"
- ✅ Valor total correcto
- ✅ Progreso de presale en 0%

### 2. Verifica en el Marketplace
```
/properties
```

La propiedad debería aparecer:
- ✅ En el listado público
- ✅ Con imagen y descripción
- ✅ Con precio visible
- ✅ Clickeable para ver detalles

### 3. Verifica las Semanas
```
/properties/[id-de-tu-propiedad]
```

Deberías ver:
- ✅ Calendario con 52 semanas
- ✅ Precios por temporada
- ✅ Todas las semanas en estado "available"
- ✅ Opción de compra funcional

### 4. Prueba el Flujo de Compra (Modo Demo)
- Selecciona una semana
- Inicia el proceso de compra
- Verifica que el pago en modo demo funcione
- Confirma que se cree el voucher

---

## 🎯 Modo Demo vs Producción

### En Modo Demo (Estado Actual)

**Lo que funciona normalmente:**
- ✅ Creación de propiedades reales
- ✅ Generación de semanas tokenizadas
- ✅ Visualización en marketplace
- ✅ Selección y reserva de semanas
- ✅ Gestión de propiedades
- ✅ Dashboards y reportes

**Lo que está simulado:**
- 🧪 Pagos con Stripe (test mode)
- 🧪 Pagos con Conekta (demo mode)
- 🧪 Transacciones blockchain (devnet)
- 🧪 Minting de NFTs (devnet)

### Cuando Actives Producción

Solo necesitarás:
1. Configurar claves de producción de Stripe
2. Configurar clave de producción de Conekta
3. Desplegar contratos a Solana mainnet
4. Cambiar `DEMO_MODE=false`

**Las propiedades que crees ahora seguirán funcionando en producción**

---

## 💡 Mejores Prácticas

### Nombres de Propiedades
- ✅ "Villa Paraíso Tulum"
- ✅ "Penthouse Luxury Cancún"
- ❌ "Propiedad 1"
- ❌ "Casa Test"

### Descripciones
- Mínimo 200 caracteres
- Incluye características únicas
- Menciona amenidades
- Describe la ubicación
- Agrega información de acceso

### Imágenes
- Usa URLs permanentes (no temporales)
- Resolución mínima: 1200x800px
- Formato: JPG o PNG
- Servicios recomendados:
  - Imgur (gratis)
  - Cloudinary (gratis tier)
  - AWS S3
  - Vercel Blob

### Precios
- Investiga el mercado local
- Considera temporadas turísticas
- Ajusta multiplicadores según demanda
- Revisa competencia en Airbnb/VRBO

---

## 🔧 Solución de Problemas

### "No puedo acceder al dashboard admin"
- Verifica que tu wallet esté en `admin_wallets`
- Confirma que tu rol sea "admin"
- Intenta desconectar y reconectar wallet

### "La propiedad no aparece en el marketplace"
- Verifica que el estado sea "active"
- Refresca la página
- Revisa la consola del navegador

### "Las semanas no se generaron"
- Verifica en Supabase tabla `weeks`
- Busca por `property_id`
- Deberían ser exactamente 52 registros

### "Error al crear propiedad"
- Verifica que todos los campos requeridos estén completos
- Confirma que el valor total sea > 0
- Revisa que la URL de imagen sea válida
- Checa los logs del navegador

---

## 📞 Soporte

Si encuentras algún problema:

1. **Revisa los logs del navegador** (F12 → Console)
2. **Verifica la base de datos** en Supabase
3. **Consulta esta guía** para pasos específicos
4. **Documenta el error** con screenshots

---

## ✨ Próximos Pasos

Después de crear tu primera propiedad:

1. **Prueba el flujo completo** en modo demo
2. **Ajusta precios** si es necesario
3. **Agrega más propiedades** siguiendo el mismo proceso
4. **Prepara documentación legal** para cada propiedad
5. **Configura KYC** para verificación de usuarios
6. **Planea el lanzamiento** a producción

---

## 🎉 ¡Listo!

Tu plataforma está preparada para recibir propiedades reales. El modo demo te permite:
- Probar todo el flujo sin riesgo
- Mostrar a inversionistas cómo funciona
- Validar el modelo de negocio
- Ajustar precios y estrategias

Cuando estés listo para producción, solo necesitas cambiar las configuraciones de pago y blockchain. **Todas las propiedades que crees ahora seguirán funcionando.**
