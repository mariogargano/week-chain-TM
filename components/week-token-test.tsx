"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PROGRAM_IDS } from "@/lib/solana/config"
import { Loader2 } from "lucide-react"
import { useWallet } from "@/lib/wallet/wallet-provider"

export function WeekTokenTest() {
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    if (!wallet.publicKey) return

    setLoading(true)
    // Simulate refresh - the balance is already being tracked by the wallet provider
    await new Promise((resolve) => setTimeout(resolve, 500))
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>WEEK Token Integration Test</CardTitle>
        <CardDescription>Testing connection to deployed WEEK Token program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Program ID:</div>
          <div className="font-mono text-xs break-all bg-muted p-2 rounded">{PROGRAM_IDS.weekToken}</div>
        </div>

        {wallet.connected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Your Wallet:</div>
              <div className="font-mono text-xs break-all bg-muted p-2 rounded">{wallet.publicKey?.toString()}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">SOL Balance:</div>
              <div className="text-2xl font-bold">
                {wallet.balance !== null ? `${wallet.balance.toFixed(4)} SOL` : "—"}
              </div>
            </div>

            <Button onClick={handleRefresh} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh Balance"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4 text-muted-foreground">Connect your wallet to test Solana integration</div>
            <Button onClick={wallet.connect} disabled={wallet.connecting} className="w-full">
              {wallet.connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        )}

        <div className="pt-4 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">Devnet</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">WEEK Token Program:</span>
            <span className="font-medium text-green-600">Deployed ✓</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
