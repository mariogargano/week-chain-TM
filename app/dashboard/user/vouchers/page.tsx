"use client"

import { useEffect, useState } from "react"
import { PurchaseVoucherCard } from "@/components/purchase-voucher-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, Ticket, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserAndVouchers()
  }, [])

  const fetchUserAndVouchers = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const response = await fetch(`/api/vouchers/list?user_id=${user.id}`)
        const data = await response.json()

        if (data.success) {
          setVouchers(data.vouchers)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching vouchers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (voucherId: string) => {
    try {
      const response = await fetch("/api/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_id: voucherId,
          user_id: userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("¡Voucher canjeado exitosamente!")
        fetchUserAndVouchers()
      } else {
        alert(data.error || "Error al canjear el voucher")
      }
    } catch (error) {
      console.error("[v0] Error redeeming voucher:", error)
      alert("Error al canjear el voucher")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Vouchers de Compra</h1>
          <p className="text-muted-foreground mt-2">
            Tus certificados de compra. Podrás canjearlos cuando se complete la preventa.
          </p>
        </div>
        <Alert>
          <Ticket className="h-4 w-4" />
          <AlertDescription>Inicia sesión para ver tus vouchers de compra.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Vouchers de Compra</h1>
        <p className="text-muted-foreground mt-2">
          Tus certificados de compra. Podrás canjearlos cuando se complete la preventa de cada destino participante.
        </p>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white text-xl">
            🏪
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Paga con Oxxo y más métodos</h3>
            <p className="text-sm text-slate-600 mt-1">
              Acepta tarjetas, SPEI, transferencias bancarias, pago en Oxxo. Recibe tu voucher al instante.
            </p>
          </div>
        </div>
      </div>

      {vouchers.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center bg-white">
          <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tienes vouchers aún</h3>
          <p className="text-muted-foreground mb-6">
            Compra una semana en cualquier destino participante para obtener tu primer certificado de compra.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
            <Link href="/properties">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Explorar Destinos
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((voucher) => (
            <PurchaseVoucherCard key={voucher.id} voucher={voucher} onRedeem={handleRedeem} />
          ))}
        </div>
      )}
    </div>
  )
}
