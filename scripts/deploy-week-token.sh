#!/bin/bash

# Script para deployar el token WEEK a Solana
# Uso: bash scripts/deploy-week-token.sh

set -e

echo "🚀 Deploying WEEK Token to Solana..."
echo ""

# Verificar que estamos en devnet
CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo "📡 Cluster actual: $CLUSTER"

if [[ $CLUSTER != *"devnet"* ]]; then
    echo "⚠️  ADVERTENCIA: No estás en devnet"
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar balance
BALANCE=$(solana balance | awk '{print $1}')
echo "💰 Balance actual: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "❌ Balance insuficiente. Necesitas al menos 2 SOL"
    echo "Ejecuta: solana airdrop 2"
    exit 1
fi

# Build
echo ""
echo "🔨 Compilando programa..."
anchor build

# Deploy
echo ""
echo "🚀 Deploying..."
anchor deploy

# Obtener Program ID
PROGRAM_ID=$(solana address -k target/deploy/week_token-keypair.json)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deploy exitoso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Program ID: $PROGRAM_ID"
echo ""
echo "🔗 Ver en Explorer:"
echo "https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "📝 IMPORTANTE: Actualiza lib/solana/config.ts con este Program ID"
echo ""
