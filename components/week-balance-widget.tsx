"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, Plus, ArrowUpRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/lib/wallet/wallet-provider"

export function WeekBalanceWidget() {
  const [balance, setBalance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { connected, publicKey } = useWallet()

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/week-balance/get")
      const data = await response.json()
      if (data.success) {
        setBalance(data.balance)
      }
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      alert("Por favor ingresa una cantidad válida")
      return
    }

    if (!connected || !publicKey) {
      alert("Por favor conecta tu wallet primero")
      return
    }

    setIsDepositing(true)
    try {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 15)}`

      const response = await fetch("/api/week-balance/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_usdc: Number.parseFloat(depositAmount),
          transaction_hash: mockTxHash,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setBalance(data.balance)
        setDepositAmount("")
        setDialogOpen(false)
        alert(`¡Éxito! Has depositado ${data.week_amount} WEEK tokens`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Deposit error:", error)
      alert("Error al depositar. Por favor intenta de nuevo.")
    } finally {
      setIsDepositing(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-[#C7CEEA]">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#C7CEEA]" />
        </CardContent>
      </Card>
    )
  }

  const availableBalance = balance?.balance || 0
  const lockedBalance = balance?.locked_balance || 0
  const totalBalance = availableBalance + lockedBalance

  return (
    <Card className="border-2 border-[#C7CEEA] bg-gradient-to-br from-[#C7CEEA]/10 to-[#B5EAD7]/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#C7CEEA]" />
            Balance WEEK
          </CardTitle>
          <Badge variant="outline" className="bg-white">
            Token Interno
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">{availableBalance.toLocaleString()}</span>
            <span className="text-lg text-slate-600">WEEK</span>
          </div>
          <p className="text-sm text-slate-600">Disponible para reservar semanas</p>
        </div>

        {lockedBalance > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-800">Bloqueado en reservas</span>
              <span className="font-semibold text-amber-900">{lockedBalance.toLocaleString()} WEEK</span>
            </div>
          </div>
        )}

        <div className="pt-2 space-y-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-[#C7CEEA] to-[#B5EAD7] hover:opacity-90 text-slate-900">
                <Plus className="h-4 w-4 mr-2" />
                Depositar USDC
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Depositar USDC para WEEK Tokens</DialogTitle>
                <DialogDescription>
                  Convierte USDC a tokens WEEK para reservar semanas vacacionales. Ratio 1:1
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Cantidad USDC</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    step="1"
                  />
                  <p className="text-sm text-muted-foreground">Recibirás: {depositAmount || "0"} WEEK tokens</p>
                </div>

                {!connected && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-sm text-amber-800">Conecta tu wallet Solana para continuar</p>
                  </div>
                )}

                <Button onClick={handleDeposit} disabled={isDepositing || !connected} className="w-full">
                  {isDepositing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Depositar {depositAmount || "0"} USDC
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-center text-slate-500">
            Los tokens WEEK se convierten a NFTs al completar reservas
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
