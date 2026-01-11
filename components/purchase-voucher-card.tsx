"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Gift, MapPin } from "lucide-react"
import { format } from "date-fns"

interface PurchaseVoucherCardProps {
  voucher: {
    id: string
    voucher_code: string
    status: string
    amount_usdc: number
    payment_method: string
    created_at: string
    confirmed_at: string | null
    nft_mint_address: string | null
    properties: {
      name: string
      location: string
      presale_sold: number
      presale_target: number
      presale_progress: number
    }
    weeks: {
      week_number: number
    }
    can_redeem?: boolean
  }
  onRedeem?: (voucherId: string) => void
}

export function PurchaseVoucherCard({ voucher, onRedeem }: PurchaseVoucherCardProps) {
  const getStatusBadge = () => {
    switch (voucher.status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmado</Badge>
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      case "redeemed":
        return <Badge className="bg-blue-500">Canjeado</Badge>
      case "refunded":
        return <Badge variant="destructive">Reembolsado</Badge>
      default:
        return <Badge variant="secondary">{voucher.status}</Badge>
    }
  }

  const getPaymentMethodLabel = () => {
    switch (voucher.payment_method) {
      case "usdc_crypto":
        return "USDC"
      case "conekta_card":
        return "Tarjeta"
      case "conekta_spei":
        return "SPEI"
      case "conekta_oxxo":
        return "Oxxo"
      default:
        return voucher.payment_method
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{voucher.properties.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {voucher.properties.location}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Código de Voucher</span>
            <span className="font-mono font-bold">{voucher.voucher_code}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Semana</span>
            <span className="font-medium">Semana {voucher.weeks.week_number}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monto</span>
            <span className="font-bold">${voucher.amount_usdc.toLocaleString()} USD</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Método de Pago</span>
            <span>{getPaymentMethodLabel()}</span>
          </div>
        </div>

        {voucher.status === "confirmed" && !voucher.nft_mint_address && (
          <div className="space-y-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">Esperando Preventa</p>
                  <p className="text-xs text-blue-700">
                    {voucher.properties.presale_sold} de {voucher.properties.presale_target} semanas vendidas (
                    {voucher.properties.presale_progress.toFixed(1)}%)
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-blue-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${voucher.properties.presale_progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {voucher.can_redeem && (
              <Button onClick={() => onRedeem?.(voucher.id)} className="w-full" size="lg">
                <Gift className="mr-2 h-4 w-4" />
                Obtener Certificado Digital
              </Button>
            )}

            {!voucher.can_redeem && (
              <div className="text-center">
                <p className="text-xs text-slate-600 mb-2">
                  Tu certificado digital estará disponible cuando la preventa complete
                </p>
              </div>
            )}
          </div>
        )}

        {voucher.nft_mint_address && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900">Certificado Digital Emitido</p>
                <p className="text-xs text-green-700 font-mono break-all">{voucher.nft_mint_address}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Comprado el {format(new Date(voucher.created_at), "dd/MM/yyyy")}
        </div>
      </CardContent>
    </Card>
  )
}
