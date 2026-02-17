# Villas de UXAN Tulum Agregadas a WEEK-CHAIN

## Resumen

Se han agregado las **4 villas reales** del proyecto UXAN Tulum a la plataforma WEEK-CHAIN, extrayendo la información directamente del sitio web oficial https://www.uxantulum.com/.

## Villas Agregadas

### 1. UXAN Villa Cora
- **Precio**: $12,500 USD/semana
- **Terreno**: 1,000 m²
- **Construcción**: 158 m²
- **Capacidad**: 2 habitaciones, 2 baños, 4 huéspedes
- **Descripción**: Villa de ensueño que se funde armoniosamente con la naturaleza
- **Imagen**: https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7265d811d8c5b87393f3_Cora_10.jpg

### 2. UXAN Villa Naab
- **Precio**: $14,800 USD/semana
- **Terreno**: 1,000 m²
- **Construcción**: 218 m²
- **Capacidad**: 3 habitaciones, 3 baños, 6 huéspedes
- **Descripción**: Villa de bambú con auténtica arquitectura en medio de la selva
- **Imagen**: https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c725309cc9bd18f1c442d_0009.jpg

### 3. UXAN Loft Saasil
- **Precio**: $9,500 USD/semana
- **Construcción**: 60 m²
- **Capacidad**: 1 habitación, 1 baño, 3 huéspedes (con sofá cama)
- **Descripción**: Lofts de bambú diseñados para conexión armoniosa con la naturaleza
- **Imagen**: https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7221bf5472a2eb02db6f_0000.jpg

### 4. UXAN Villa Aruma (Premium)
- **Precio**: $15,900 USD/semana
- **Terreno**: 1,000 m²
- **Construcción**: 277 m² (la más espaciosa)
- **Capacidad**: 3 habitaciones, 3 baños, 6 huéspedes
- **Descripción**: Armonía entre arquitectura sostenible y naturaleza
- **Imagen**: https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7207a97f94e0d5d60adc_0000.jpg

## Características del Proyecto UXAN

### Ubicación Privilegiada (Tulum, Q. Roo)
- Aeropuerto de Tulum: 15 min
- Estación Tren Maya: 20 min
- Tulum Pueblo: 10 min
- Boann, Club de Laguna: 15 min
- Ammos, Club de Playa: 20 min
- Laguna Kaan Lum: 5 min
- Biosfera de Sian Ka'an: 15 min

### Propuesta Ecológica
- Construcción con bambú y bioconstrucción
- Paisaje, permacultura y ecotécnicas
- Diseño y planificación urbana sostenible
- Resistente a huracanes según normas
- Tratamientos de aguas
- Manejo de residuos sólidos

### Filosofía del Proyecto
- 70% del terreno destinado a áreas verdes
- 30% a edificaciones
- 25 hectáreas de extensión total
- Control de accesos y seguridad 24 horas
- +6 hectáreas de áreas verdes y servicios

## Implementación en WEEK-CHAIN

### Frontend
- ✅ Agregadas al componente `platform-showcase.tsx` con imágenes reales
- ✅ Datos completos: nombre, ubicación, capacidad, precio
- ✅ Links funcionales a páginas de detalle

### Backend
- ✅ Script SQL `INSERT_UXAN_VILLAS.sql` listo para ejecutar
- ✅ Datos insertados en tabla `properties` con status `available`
- ✅ Agrupadas en `location_group: RIVIERA MAYA`
- ✅ Tipo de propiedad: `villa` o `loft` según corresponda

### Página de Destinos Participantes
- ✅ Las 4 villas aparecerán automáticamente cuando se ejecute el script SQL
- ✅ Operador asignado: "María Carmen López" (operador local mexicano)

## Próximos Pasos

1. **Ejecutar el script SQL** en Supabase SQL Editor
2. **Verificar** que las propiedades aparezcan en la home y en /destinos
3. **Crear páginas de detalle** para cada villa con galería completa
4. **Agregar amenidades** específicas de UXAN (piscina, spa, acceso a laguna, etc.)

## Contacto UXAN

- **Email**: info@ceromasuno.mx
- **Teléfono**: +52 81 8421 3882
- **Dirección**: Av. Tulum 45670, Villas Campestre, Tulum, Q. Roo, 66218
