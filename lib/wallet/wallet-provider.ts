import type React from "react"
export function useWallet() {
  return {
    connected: false,
    publicKey: null,
    connect: async () => {},
    disconnect: async () => {},
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return children
}
