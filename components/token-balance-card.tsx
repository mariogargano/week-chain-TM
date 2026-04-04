"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, DollarSign } from "lucide-react"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { useEffect, useState } from "react"

export function TokenBalanceCard() {
  const { connected, publicKey } = useWallet()
  const [weekBalance, setWeekBalance] = useState(0)
  const [usdcBalance, setUsdcBalance] = useState(0)

  useEffect(() => {
    if (connected && publicKey) {
      // TODO: Fetch actual token balances from Solana
      // For now, using mock data
      setWeekBalance(0)
      setUsdcBalance(0)
    }
  }, [connected, publicKey])

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connect your wallet to view balances</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Token Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Coins className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">WEEK Tokens</p>
              <p className="text-xs text-muted-foreground">Internal currency</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{weekBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">WEEK</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">USDC</p>
              <p className="text-xs text-muted-foreground">Stablecoin</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{usdcBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">USDC</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
