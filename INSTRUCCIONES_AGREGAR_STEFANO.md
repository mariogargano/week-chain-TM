# Instrucciones para Agregar a Stefano Cionini al Equipo

## Paso 1: Ejecutar el Script SQL

Para que Avv. Stefano Cionini aparezca en la sección de equipo del workspace, necesitas ejecutar el script SQL en tu base de datos Supabase.

### Opción A: Desde v0 (Recomendado)

1. El script ya está creado en: `scripts/030_add_stefano_cionini.sql`
2. v0 puede ejecutar este script automáticamente
3. Solo necesitas confirmar la ejecución

### Opción B: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a "SQL Editor" en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `scripts/030_add_stefano_cionini.sql`
5. Haz clic en "Run" para ejecutar el script

## Paso 2: Verificar en el Workspace

1. Ve a la Oficina Virtual: `/dashboard/workspace`
2. Verifica que Stefano Cionini aparezca en la sección "Equipo"
3. Su rol debe aparecer como "Of Counsel Internacional"

## Información del Miembro

**Nombre:** Avv. Stefano Cionini  
**Rol:** Of Counsel Internacional - Trust & Expansion  
**Email:** stefano.cionini@weekchain.com  
**Especialidad:** Derecho internacional, fideicomisos, compliance financiero y expansión global  
**Ubicaciones:** Italia · Brasil · Emiratos Árabes

## Responsabilidades

- Estrategia legal global de WEEKCHAIN
- Creación del trust internacional (liquidación año 15)
- Expansión corporativa a Europa, Brasil y Medio Oriente
- Enlace estratégico entre SAPI mexicana y Morises LLC (Wyoming)
- Asesoría a instituciones financieras

## Experiencia

Más de 30 años de experiencia en:
- Derecho comercial internacional
- Derecho financiero
- Estructuración internacional
- Asesoría a instituciones como Bandenia Group, AMBANK UK y Sure Trustee Company

## Notas

- El email `stefano.cionini@weekchain.com` se usa como identificador en la tabla `admin_wallets`
- Para que Stefano pueda iniciar sesión en el workspace, necesitará crear una cuenta en Supabase Auth con este email
- El rol `of_counsel` ya está configurado en el sistema con los permisos apropiados
