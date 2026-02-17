#!/usr/bin/env bash
set -euo pipefail

# WEEK-CHAIN™ - Script de Verificación de Claves
# Verifica que todas las claves estén configuradas y sean válidas

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 WEEK-CHAIN™ - Verificación de Claves${NC}"
echo "========================================"
echo ""

ENVIRONMENT="${1:-production}"
MISSING_KEYS=()
INVALID_KEYS=()

# Función para verificar si una clave existe
check_key_exists() {
  local key_name=$1
  local description=$2
  
  echo -n "Verificando $description... "
  
  if vercel env ls "$ENVIRONMENT" 2>/dev/null | grep -q "^$key_name"; then
    echo -e "${GREEN}✓${NC}"
    return 0
  else
    echo -e "${RED}✗ FALTA${NC}"
    MISSING_KEYS+=("$key_name")
    return 1
  fi
}

# Verificar claves críticas
echo "Claves de Pagos:"
check_key_exists "STRIPE_SECRET_KEY" "Stripe Secret"
check_key_exists "STRIPE_PUBLISHABLE_KEY" "Stripe Publishable"
check_key_exists "CONEKTA_PRIVATE_KEY" "Conekta Private"
echo ""

echo "Claves Legales:"
check_key_exists "MIFIEL_API_KEY" "Mifiel API Key"
check_key_exists "MIFIEL_SECRET_KEY" "Mifiel Secret"
echo ""

echo "Claves de Base de Datos:"
check_key_exists "SUPABASE_URL" "Supabase URL"
check_key_exists "SUPABASE_ANON_KEY" "Supabase Anon Key"
check_key_exists "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Role"
check_key_exists "POSTGRES_URL" "Postgres URL"
echo ""

echo "Claves de Email:"
check_key_exists "RESEND_API_KEY" "Resend API Key"
echo ""

echo "Claves de Blockchain:"
check_key_exists "SOLANA_RPC_URL" "Solana RPC URL"
check_key_exists "SOLANA_PROGRAM_ID" "Solana Program ID"
echo ""

# Resumen
echo "========================================"
if [ ${#MISSING_KEYS[@]} -eq 0 ]; then
  echo -e "${GREEN}✓ Todas las claves están configuradas${NC}"
  exit 0
else
  echo -e "${RED}✗ Faltan ${#MISSING_KEYS[@]} clave(s):${NC}"
  for key in "${MISSING_KEYS[@]}"; do
    echo "  - $key"
  done
  echo ""
  echo "Ejecuta: ./scripts/rotate-keys.sh para configurarlas"
  exit 1
fi
