#!/usr/bin/env bash
set -euo pipefail

# WEEK-CHAIN™ - Script de Rotación de Claves de Seguridad
# Uso: ./scripts/rotate-keys.sh [--service SERVICE] [--env ENV]

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_NAME="weekchain"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"
ENVIRONMENT="${1:-production}" # production, preview, development

echo -e "${GREEN}🔐 WEEK-CHAIN™ - Rotación de Claves de Seguridad${NC}"
echo "=================================================="
echo "Entorno: $ENVIRONMENT"
echo ""

# Verificar dependencias
command -v vercel >/dev/null 2>&1 || { echo -e "${RED}Error: Vercel CLI no instalado${NC}"; exit 1; }
command -v op >/dev/null 2>&1 || { echo -e "${YELLOW}Advertencia: 1Password CLI no instalado (opcional)${NC}"; }

# Función para rotar una clave
rotate_key() {
  local key_name=$1
  local vault_path=$2
  local description=$3
  
  echo -e "${YELLOW}Rotando: $description${NC}"
  
  # Obtener nueva clave de 1Password (si está disponible)
  if command -v op >/dev/null 2>&1; then
    NEW_VALUE=$(op read "$vault_path" 2>/dev/null || echo "")
    if [ -z "$NEW_VALUE" ]; then
      echo -e "${RED}  ⚠️  No se pudo obtener de 1Password. Ingresa manualmente:${NC}"
      read -sp "  Nueva clave para $key_name: " NEW_VALUE
      echo ""
    else
      echo -e "${GREEN}  ✓ Obtenida de 1Password${NC}"
    fi
  else
    read -sp "  Nueva clave para $key_name: " NEW_VALUE
    echo ""
  fi
  
  # Actualizar en Vercel
  if [ -n "$NEW_VALUE" ]; then
    echo "$NEW_VALUE" | vercel env add "$key_name" "$ENVIRONMENT" --force 2>/dev/null
    echo -e "${GREEN}  ✓ Actualizada en Vercel ($ENVIRONMENT)${NC}"
    
    # Registrar en log
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") - $key_name rotada en $ENVIRONMENT" >> logs/key-rotation.log
  else
    echo -e "${RED}  ✗ No se proporcionó valor${NC}"
  fi
  
  echo ""
}

# Crear directorio de logs si no existe
mkdir -p logs

echo "Selecciona las claves a rotar:"
echo "1) Todas las claves"
echo "2) Solo Stripe"
echo "3) Solo Mifiel"
echo "4) Solo Supabase"
echo "5) Solo Conekta"
echo "6) Solo Resend"
echo "7) Personalizado"
read -p "Opción: " option

case $option in
  1)
    echo -e "${GREEN}Rotando todas las claves...${NC}\n"
    rotate_key "STRIPE_SECRET_KEY" "op://vault/STRIPE_SECRET/credential" "Stripe Secret Key"
    rotate_key "STRIPE_PUBLISHABLE_KEY" "op://vault/STRIPE_PUBLISHABLE/credential" "Stripe Publishable Key"
    rotate_key "MIFIEL_API_KEY" "op://vault/MIFIEL_API_KEY/credential" "Mifiel API Key"
    rotate_key "MIFIEL_SECRET_KEY" "op://vault/MIFIEL_SECRET/credential" "Mifiel Secret Key"
    rotate_key "SUPABASE_SERVICE_ROLE_KEY" "op://vault/SUPABASE_SERVICE_ROLE/credential" "Supabase Service Role Key"
    rotate_key "CONEKTA_PRIVATE_KEY" "op://vault/CONEKTA_PRIVATE/credential" "Conekta Private Key"
    rotate_key "RESEND_API_KEY" "op://vault/RESEND_API_KEY/credential" "Resend API Key"
    ;;
  2)
    rotate_key "STRIPE_SECRET_KEY" "op://vault/STRIPE_SECRET/credential" "Stripe Secret Key"
    rotate_key "STRIPE_PUBLISHABLE_KEY" "op://vault/STRIPE_PUBLISHABLE/credential" "Stripe Publishable Key"
    ;;
  3)
    rotate_key "MIFIEL_API_KEY" "op://vault/MIFIEL_API_KEY/credential" "Mifiel API Key"
    rotate_key "MIFIEL_SECRET_KEY" "op://vault/MIFIEL_SECRET/credential" "Mifiel Secret Key"
    ;;
  4)
    rotate_key "SUPABASE_SERVICE_ROLE_KEY" "op://vault/SUPABASE_SERVICE_ROLE/credential" "Supabase Service Role Key"
    ;;
  5)
    rotate_key "CONEKTA_PRIVATE_KEY" "op://vault/CONEKTA_PRIVATE/credential" "Conekta Private Key"
    ;;
  6)
    rotate_key "RESEND_API_KEY" "op://vault/RESEND_API_KEY/credential" "Resend API Key"
    ;;
  7)
    read -p "Nombre de la clave: " custom_key
    read -p "Ruta en 1Password (opcional): " custom_path
    rotate_key "$custom_key" "$custom_path" "$custom_key"
    ;;
  *)
    echo -e "${RED}Opción inválida${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}=================================================="
echo "✓ Rotación completada"
echo "==================================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "1. Verifica que la aplicación funcione correctamente"
echo "2. Revoca las claves antiguas en los dashboards de cada servicio"
echo "3. Actualiza la documentación con las fechas de rotación"
echo "4. Programa la próxima rotación en 90 días"
echo ""
echo "Log guardado en: logs/key-rotation.log"
