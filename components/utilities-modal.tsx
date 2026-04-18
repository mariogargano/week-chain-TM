"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Vote, Info } from "lucide-react"
import { VaFiIcon } from "@/components/icons/vafi-icon"

export function UtilitiesModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="border-2 border-[#C7CEEA] text-slate-700 hover:bg-[#C7CEEA]/10 hover:border-[#b7beda] text-base font-semibold h-14 px-8 rounded-2xl transition-all duration-300 glass bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg"
        >
          <Info className="mr-2 h-5 w-5" />
          Utilidades Adicionales
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-slate-900">Más Allá del Uso Vacacional</DialogTitle>
          <DialogDescription className="text-lg text-slate-600">
            Tu certificado digital no solo te da derecho a vacaciones, también ofrece utilidades adicionales
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          <Card className="border-2 border-[#B5EAD7]/30 bg-gradient-to-br from-[#B5EAD7]/5 to-white">
            <CardHeader className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#B5EAD7]/20 flex-shrink-0">
                  <Home className="h-7 w-7" style={{ color: "#B5EAD7" }} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 text-slate-900">Renta tu Semana</CardTitle>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    Si no usas tu semana, puedes rentarla en plataformas como Airbnb y Booking.com. Genera ingresos
                    pasivos de tu certificado digital mientras mantienes la propiedad del mismo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#C7CEEA]/30 bg-gradient-to-br from-[#C7CEEA]/5 to-white">
            <CardHeader className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#C7CEEA]/20 flex-shrink-0">
                  <VaFiIcon className="h-9 w-9" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 text-slate-900">VA-FI Protocollo</CardTitle>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    Protocollo revolucionario que te permite usar tu certificado digital como colateral para obtener
                    liquidez inmediata en efectivo. Accede a capital sin vender tu derecho de uso. Mantén tu certificado
                    mientras obtienes recursos.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#FFB7B2]/30 bg-gradient-to-br from-[#FFB7B2]/5 to-white">
            <CardHeader className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFB7B2]/20 flex-shrink-0">
                  <Vote className="h-7 w-7" style={{ color: "#FFB7B2" }} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 text-slate-900">Gobernanza DAO</CardTitle>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    Participa en decisiones importantes sobre la gestión de propiedades, parámetros del sistema y el
                    futuro del ecosistema. Tu voz cuenta en la comunidad WEEK-CHAIN™.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
