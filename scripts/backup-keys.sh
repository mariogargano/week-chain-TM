#!/usr/bin/env bash
set -euo pipefail

# WEEK-CHAIN™ - Script de Backup de Claves
# Crea un backup encriptado de todas las variables de entorno

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}💾 WEEK-CHAIN™ - Backup de Claves${NC}"
echo "===================================="
echo ""

ENVIRONMENT="${1:-production}"
BACKUP_DIR="backups/keys"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/keys_${ENVIRONMENT}_${TIMESTAMP}.enc"

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

echo "Exportando variables de entorno de $ENVIRONMENT..."

# Exportar todas las variables
vercel env pull "$BACKUP_DIR/.env.$ENVIRONMENT" --environment="$ENVIRONMENT" 2>/dev/null

if [ -f "$BACKUP_DIR/.env.$ENVIRONMENT" ]; then
  echo -e "${GREEN}✓ Variables exportadas${NC}"
  
  # Encriptar el archivo
  echo ""
  echo "Encriptando backup..."
  read -sp "Contraseña para encriptar: " PASSWORD
  echo ""
  
  openssl enc -aes-256-cbc -salt -pbkdf2 \
    -in "$BACKUP_DIR/.env.$ENVIRONMENT" \
    -out "$BACKUP_FILE" \
    -pass pass:"$PASSWORD"
  
  # Eliminar archivo sin encriptar
  rm "$BACKUP_DIR/.env.$ENVIRONMENT"
  
  echo -e "${GREEN}✓ Backup encriptado guardado en: $BACKUP_FILE${NC}"
  echo ""
  echo -e "${YELLOW}IMPORTANTE:${NC}"
  echo "1. Guarda este archivo en un lugar seguro"
  echo "2. NO subas este archivo a Git"
  echo "3. Guarda la contraseña en 1Password"
  echo ""
  echo "Para restaurar:"
  echo "  openssl enc -aes-256-cbc -d -pbkdf2 -in $BACKUP_FILE -out .env"
else
  echo -e "${RED}✗ Error al exportar variables${NC}"
  exit 1
fi
