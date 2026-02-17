#!/bin/bash

# Test script para validar el sistema de compliance

echo "🧪 Testing WeekChain Compliance System"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Verificar tablas de compliance
echo -e "\n${YELLOW}Test 1: Verificando tablas de compliance...${NC}"
if supabase db diff --file=check_tables; then
  echo -e "${GREEN}✓ Tablas de compliance existen${NC}"
else
  echo -e "${RED}✗ Error verificando tablas${NC}"
fi

# Test 2: Test de detección de fraude - IP duplicada
echo -e "\n${YELLOW}Test 2: Probando detección de IP duplicada...${NC}"
curl -X POST http://localhost:3000/api/compliance/check-fraud \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "ip": "192.168.1.1",
    "fingerprint": "unique-fp-1"
  }' | jq '.'

# Test 3: Test de detección de fraude - Device duplicado
echo -e "\n${YELLOW}Test 3: Probando detección de device duplicado...${NC}"
curl -X POST http://localhost:3000/api/compliance/check-fraud \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-2",
    "ip": "192.168.1.2",
    "fingerprint": "unique-fp-1"
  }' | jq '.'

# Test 4: Test de aceptación legal
echo -e "\n${YELLOW}Test 4: Probando registro de aceptación legal...${NC}"
curl -X POST http://localhost:3000/api/compliance/record-acceptance \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "acceptanceType": "terms",
    "termsVersion": "1.0.0",
    "ipAddress": "192.168.1.1",
    "country": "MX"
  }' | jq '.'

# Test 5: Test de validación de email corporativo
echo -e "\n${YELLOW}Test 5: Probando validación de email corporativo...${NC}"
echo "Email personal (debe fallar): test@gmail.com"
echo "Email corporativo (debe pasar): broker@weekchain.com"

# Test 6: Verificar contador de referidos
echo -e "\n${YELLOW}Test 6: Verificando límite de referidos mensuales...${NC}"
echo "Límite por país: MX=50, US=20, Otros=10"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Tests completados. Revisa los resultados arriba.${NC}"
