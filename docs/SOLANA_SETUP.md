# WEEK-CHAIN Solana Setup Guide

## Fase 1: Infraestructura Base de Solana

### Requisitos Previos

1. **Instalar Rust**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

2. **Instalar Solana CLI**
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
```

3. **Instalar Anchor CLI**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Configuración Inicial

1. **Configurar Solana para Devnet**
```bash
solana config set --url devnet
```

2. **Crear Wallet de Desarrollo**
```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

3. **Obtener SOL de Devnet (Airdrop)**
```bash
solana airdrop 2
```

4. **Verificar Balance**
```bash
solana balance
```

### Estructura del Proyecto

```
week-chain-mvp/
├── Anchor.toml                 # Configuración de Anchor
├── programs/
│   └── week-token/            # Programa del Token WEEK
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs         # Smart contract en Rust
├── lib/
│   └── solana/
│       ├── config.ts          # Configuración de Solana
│       └── week-token.ts      # Cliente TypeScript
└── docs/
    └── SOLANA_SETUP.md        # Esta guía
```

### Compilar y Desplegar

1. **Compilar el Programa**
```bash
anchor build
```

2. **Obtener el Program ID**
```bash
anchor keys list
```

3. **Actualizar Program ID en el código**
- Copiar el Program ID generado
- Actualizar en `programs/week-token/src/lib.rs` (línea `declare_id!`)
- Actualizar en `Anchor.toml`
- Actualizar en `lib/solana/config.ts`

4. **Desplegar a Devnet**
```bash
anchor deploy
```

5. **Inicializar el Token WEEK**
```bash
anchor run initialize-token
```

### Configuración del Token WEEK

- **Nombre**: WEEK Token
- **Símbolo**: WEEK
- **Decimales**: 9
- **Supply Inicial**: 1,000,000,000 WEEK
- **Uso**: Token nativo para el ecosistema WEEK-CHAIN

### Próximos Pasos

Una vez completada la Fase 1, procederemos con:

1. **Fase 2**: Implementar el programa de Escrow
2. **Fase 3**: Implementar el programa de NFT Minting
3. **Fase 4**: Integrar con el frontend de Next.js

### Comandos Útiles

```bash
# Ver logs del programa
solana logs <PROGRAM_ID>

# Ver balance de SOL
solana balance

# Ver balance de tokens WEEK
spl-token accounts

# Transferir tokens WEEK
spl-token transfer <TOKEN_ADDRESS> <AMOUNT> <RECIPIENT>
```

### Troubleshooting

**Error: Insufficient funds**
```bash
solana airdrop 2
```

**Error: Program deployment failed**
- Verificar que tienes suficiente SOL
- Verificar que el Program ID está actualizado en todos los archivos

**Error: Anchor build failed**
- Verificar versión de Rust: `rustc --version`
- Actualizar Anchor: `avm install latest`

### Recursos

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [SPL Token Program](https://spl.solana.com/token)
