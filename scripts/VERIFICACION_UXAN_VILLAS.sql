-- Verificar que las 4 villas de UXAN están en la base de datos
-- Ejecutar ANTES de la presentación

SELECT 
  id,
  name,
  location,
  price,
  status,
  created_at
FROM properties
WHERE name LIKE '%UXAN%' 
  OR name LIKE '%Villa%' 
  OR name LIKE '%Loft Saasil%'
ORDER BY name;

-- Debería mostrar:
-- 1. Villa Aruma - $15,900
-- 2. Villa Naab - $14,800
-- 3. Villa Cora - $12,500
-- 4. Loft Saasil - $9,500

-- Si no aparecen, ejecutar:
-- scripts/INSERT_UXAN_VILLAS.sql
