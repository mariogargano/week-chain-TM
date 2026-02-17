#!/bin/bash

# Script de instalación automatizada de Solana para WEEK-CHAIN
# Uso: bash scripts/setup-solana.sh

set -e

echo "🚀 Iniciando instalación de ambiente Solana para WEEK-CHAIN..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Paso 1: Verificar/Instalar Rust
echo -e "${BLUE}[1/6] Verificando Rust...${NC}"
if command_exists rustc; then
    echo -e "${GREEN}✓ Rust ya está instalado: $(rustc --version)${NC}"
else
    echo "Instalando Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    echo -e "${GREEN}✓ Rust instalado correctamente${NC}"
fi
echo ""

# Paso 2: Verificar/Instalar Solana CLI
echo -e "${BLUE}[2/6] Verificando Solana CLI...${NC}"
if command_exists solana; then
    echo -e "${GREEN}✓ Solana CLI ya está instalado: $(solana --version)${NC}"
else
    echo "Instalando Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo -e "${GREEN}✓ Solana CLI instalado correctamente${NC}"
fi
echo ""

# Paso 3: Configurar Wallet de Desarrollo
echo -e "${BLUE}[3/6] Configurando wallet de desarrollo...${NC}"
mkdir -p ~/.config/solana
if [ ! -f ~/.config/solana/devnet.json ]; then
    echo "Generando nuevo keypair..."
    solana-keygen new --outfile ~/.config/solana/devnet.json --no-bip39-passphrase
    echo -e "${GREEN}✓ Keypair generado${NC}"
else
    echo -e "${GREEN}✓ Keypair ya existe${NC}"
fi

solana config set --keypair ~/.config/solana/devnet.json
solana config set --url devnet
echo -e "${GREEN}✓ Configuración actualizada${NC}"
echo ""

# Paso 4: Obtener SOL de prueba
echo -e "${BLUE}[4/6] Obteniendo SOL de prueba...${NC}"
BALANCE=$(solana balance | awk '{print $1}')
if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo "Solicitando airdrop..."
    solana airdrop 2 || echo -e "${RED}⚠ Airdrop falló. Intenta manualmente: solana airdrop 2${NC}"
else
    echo -e "${GREEN}✓ Ya tienes suficiente SOL: $BALANCE SOL${NC}"
fi
echo ""

# Paso 5: Verificar/Instalar Anchor
echo -e "${BLUE}[5/6] Verificando Anchor...${NC}"
if command_exists anchor; then
    echo -e "${GREEN}✓ Anchor ya está instalado: $(anchor --version)${NC}"
else
    echo "Instalando Anchor (esto puede tomar varios minutos)..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
    echo -e "${GREEN}✓ Anchor instalado correctamente${NC}"
fi
echo ""

# Paso 6: Instalar dependencias del proyecto
echo -e "${BLUE}[6/6] Instalando dependencias del proyecto...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# Resumen final
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Instalación completada exitosamente${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Configuración actual:"
solana config get
echo ""
echo "💰 Balance actual:"
solana balance
echo ""
echo -e "${BLUE}🎯 Próximos pasos:${NC}"
echo "1. Compilar el programa: anchor build"
echo "2. Deployar a devnet: anchor deploy"
echo "3. Copiar el Program ID y actualizar lib/solana/config.ts"
echo ""
echo -e "${BLUE}📚 Documentación completa en: docs/GUIA_INSTALACION_SOLANA.md${NC}"
