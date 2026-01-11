# Propiedades Agregadas a WEEK-CHAIN

## Estado Actual

Las siguientes propiedades han sido configuradas en el sistema:

### 1. UXAN - Riviera Maya, México
- **Ubicación**: Tulum, Quintana Roo
- **Tipo**: Villa con arquitectura orgánica de celosía de madera
- **Capacidad**: 8 huéspedes, 4 recámaras, 4 baños
- **Precio Base**: $12,500 USD
- **Región**: RIVIERA MAYA
- **Características**: Arquitectura tipo domo, diseño bohemio-lujoso, materiales naturales
- **Imagen**: Real (proporcionada por el usuario)

### 2. Vila Ksamil - Riviera Albanesa, Albania
- **Ubicación**: Ksamil, Albania
- **Tipo**: Villa mediterránea de lujo
- **Capacidad**: 8 huéspedes, 4 recámaras, 3 baños
- **Precio Base**: $11,800 USD
- **Región**: BALKAN RIVIERA
- **Características**: Vistas al Mar Jónico, piscina infinita, acceso privado a playa
- **Imagen**: Generada con query específico para villa de lujo en la riviera albanesa

### 3. Bosphorus Yalı Villa - Bósforo, Turquía
- **Ubicación**: Estambul, Turquía
- **Tipo**: Yalı otomano restaurado
- **Capacidad**: 10 huéspedes, 5 recámaras, 5 baños
- **Precio Base**: $14,900 USD
- **Región**: MEDITERRANEAN
- **Características**: Arquitectura otomana, vistas al Bósforo, hammam tradicional, muelle privado
- **Imagen**: Generada con query específico para mansión yalı otomana en el Bósforo

### 4. Borgo di Civita - Umbría, Italia
- **Ubicación**: Orvieto, Italia
- **Tipo**: Borgo medieval restaurado
- **Capacidad**: 6 huéspedes, 3 recámaras, 3 baños
- **Precio Base**: $13,200 USD
- **Región**: MEDITERRANEAN
- **Características**: Arquitectura de piedra siglo XIII, viñedos propios, bodega subterránea, piscina panorámica
- **Imagen**: Generada con query específico para borgo medieval en Orvieto con viñedos

## Eliminado

- **POLO 54**: Eliminado por solicitud del usuario

## Cómo Ejecutar el Script

1. Abre Supabase Dashboard
2. Ve a "SQL Editor"
3. Copia el contenido de `scripts/INSERT_ALL_PROPERTIES.sql`
4. Click "Run"
5. Verifica que las 4 propiedades aparecen en la query de verificación

## Dónde Aparecen

- **Homepage**: Sección "Platform Showcase" muestra las 4 propiedades en un grid
- **Página /destinos**: Agrupa las propiedades por región:
  - RIVIERA MAYA: UXAN
  - BALKAN RIVIERA: Vila Ksamil
  - MEDITERRANEAN: Bosphorus Yalı Villa, Borgo di Civita

## Modelo de Negocio

Todas las propiedades funcionan bajo el modelo **REQUEST → OFFER → CONFIRM**:
- NO tienen calendario individual de weeks
- NO tienen precios fijos por semana específica
- Los usuarios solicitan mediante certificados
- El sistema ofrece opciones disponibles
- El usuario confirma la oferta
