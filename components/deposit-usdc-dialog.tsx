"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet/wallet-provider"
import { ReservationFlow } from "@/components/reservation-flow"

interface DepositUSDCDialogProps {
  weekId: string
  propertyId: string
  weekPrice: number
  weekNumber: number
  propertyName: string
}

export function DepositUSDCDialog({ weekId, propertyId, weekPrice, weekNumber, propertyName }: DepositUSDCDialogProps) {
  const { connected } = useWallet()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          {connected ? "Reservar Semana" : "Reservar con USDC, Tarjeta o Oxxo"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reservar Semana {weekNumber}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 text-sm text-muted-foreground mt-2">
              <p>
                Completa el proceso de pago para recibir tu certificado de compra. Podrás canjearlo por NFT cuando se complete la preventa.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-2">
                  <span>Términos del Pre‑Holder Program:</span>
                  <a href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline">Consultar Términos</a>
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                  <li>Depósito de $100 USD 100% reembolsable a solicitud del titular.</li>
                  <li>Plazo máximo de reembolso: dentro de 60 días naturales desde la solicitud.</li>
                  <li>El Pre‑Holder es una reserva preferente; no constituye la compra ni la emisión del SVC.</li>
                  <li>El descuento y el crédito se aplican únicamente a la compra de un SVC, bajo las reglas vigentes y sujeto a disponibilidad.</li>
                </ul>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ReservationFlow
          weekId={weekId}
          propertyId={propertyId}
          weekNumber={weekNumber}
          weekPrice={weekPrice}
          propertyName={propertyName}
          onComplete={() => {
            setTimeout(() => setOpen(false), 3000)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
