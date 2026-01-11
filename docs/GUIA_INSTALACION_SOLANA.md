# 🚀 Guía de Instalación de Solana para WEEK-CHAIN

Esta guía te llevará paso a paso para configurar tu ambiente de desarrollo de Solana.

## 📋 Requisitos Previos

- Sistema Operativo: macOS, Linux, o Windows con WSL2
- Node.js 18+ instalado
- Git instalado
- Al menos 20GB de espacio en disco

---

## Paso 1: Instalar Rust (15 minutos)

### En macOS/Linux:

```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Seguir las instrucciones en pantalla (presiona 1 para instalación por defecto)

# Recargar tu terminal
source $HOME/.cargo/env

# Verificar instalación
rustc --version
cargo --version
```

### En Windows (WSL2):

```bash
# Primero instala WSL2 desde PowerShell como administrador:
# wsl --install

# Luego dentro de WSL2, ejecuta:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**✅ Checkpoint:** Deberías ver algo como `rustc 1.75.0` cuando ejecutes `rustc --version`

---

## Paso 2: Instalar Solana CLI (10 minutos)

```bash
# Instalar Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Agregar Solana al PATH (agrega esto a tu ~/.bashrc o ~/.zshrc)
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Recargar terminal
source ~/.bashrc  # o source ~/.zshrc si usas zsh

# Verificar instalación
solana --version
```

**✅ Checkpoint:** Deberías ver `solana-cli 1.18.0`

---

## Paso 3: Configurar Wallet de Desarrollo (5 minutos)

```bash
# Crear directorio de configuración si no existe
mkdir -p ~/.config/solana

# Generar un nuevo keypair para desarrollo
solana-keygen new --outfile ~/.config/solana/devnet.json

# IMPORTANTE: Guarda la seed phrase que te muestra en un lugar seguro
# (solo para desarrollo, NO uses este wallet en mainnet)

# Configurar Solana CLI para usar este wallet
solana config set --keypair ~/.config/solana/devnet.json

# Configurar para usar devnet
solana config set --url devnet

# Verificar configuración
solana config get
```

**✅ Checkpoint:** Deberías ver:
```
Config File: /Users/tu-usuario/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/
Keypair Path: /Users/tu-usuario/.config/solana/devnet.json
```

---

## Paso 4: Obtener SOL de Prueba (2 minutos)

```bash
# Solicitar 2 SOL de prueba (necesarios para deployar)
solana airdrop 2

# Verificar balance
solana balance

# Si el airdrop falla, intenta de nuevo o usa el faucet web:
# https://faucet.solana.com/
```

**✅ Checkpoint:** Deberías ver `2 SOL` en tu balance

---

## Paso 5: Instalar Anchor Framework (10 minutos)

```bash
# Instalar AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Esto puede tomar 5-10 minutos, sé paciente

# Instalar la última versión de Anchor
avm install latest
avm use latest

# Verificar instalación
anchor --version
```

**✅ Checkpoint:** Deberías ver `anchor-cli 0.29.0` o superior

---

## Paso 6: Preparar el Proyecto WEEK-CHAIN (5 minutos)

```bash
# Navega a tu proyecto (ajusta la ruta según donde lo tengas)
cd /ruta/a/tu/proyecto/week-chain-mvp

# Instalar dependencias de Node.js
npm install

# Verificar que Anchor reconoce el proyecto
anchor build
```

**✅ Checkpoint:** El build debería completarse sin errores y crear una carpeta `target/`

---

## Paso 7: Deploy del Token WEEK a Devnet (5 minutos)

```bash
# Asegúrate de estar en la raíz del proyecto
cd /ruta/a/tu/proyecto/week-chain-mvp

# Deploy del programa
anchor deploy

# IMPORTANTE: Copia el Program ID que aparece
# Se verá algo así: Program Id: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

**✅ Checkpoint:** Deberías ver un mensaje como:
```
Deploying workspace: https://explorer.solana.com/address/[PROGRAM_ID]?cluster=devnet
Deploy success
```

---

## Paso 8: Actualizar Configuración con Program ID

Después del deploy, necesitas actualizar el archivo de configuración:

1. Copia el **Program ID** que obtuviste en el paso anterior
2. Abre el archivo `lib/solana/config.ts` en v0
3. Reemplaza el Program ID placeholder con tu Program ID real
4. Guarda el archivo

---

## 🎉 ¡Listo!

Tu ambiente de desarrollo de Solana está configurado. Ahora puedes:

- ✅ Compilar programas de Solana
- ✅ Deployar a devnet
- ✅ Interactuar con el blockchain desde el frontend

---

## 🆘 Solución de Problemas Comunes

### Error: "command not found: solana"
**Solución:** Agrega Solana al PATH en tu `~/.bashrc` o `~/.zshrc`:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### Error: "Airdrop failed"
**Solución:** El faucet de devnet a veces está saturado. Intenta:
1. Esperar 1 minuto y volver a intentar
2. Usar el faucet web: https://faucet.solana.com/

### Error: "Insufficient funds for deploy"
**Solución:** Necesitas más SOL:
```bash
solana airdrop 2
```

### Error al compilar Rust
**Solución:** Actualiza Rust:
```bash
rustup update
```

---

## 📚 Recursos Adicionales

- [Documentación de Solana](https://docs.solana.com/)
- [Documentación de Anchor](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)

---

## 🔄 Próximos Pasos

Una vez completada esta guía, estarás listo para:
1. Desarrollar el programa de Escrow
2. Crear el sistema de NFTs para semanas
3. Integrar todo con el frontend

¿Preguntas? Vuelve a v0 y pregúntame lo que necesites.
