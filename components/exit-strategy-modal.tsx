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
import { TrendingUp, Users, Building2, Heart, Shield, Briefcase } from "lucide-react"

export function ExitStrategyModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="border-2 border-[#FFB7B2] text-slate-700 hover:bg-[#FFB7B2]/10 hover:border-[#ffa7a2] text-base font-semibold h-14 px-8 rounded-2xl transition-all duration-300 glass bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg"
        >
          <TrendingUp className="mr-2 h-5 w-5" />
          Exit Strategy (15 Años)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-slate-900">Nuda Propiedad + Distribución</DialogTitle>
          <DialogDescription className="text-lg text-slate-600">
            Al venderse las 48 semanas, la propiedad se escritura a WEEK-CHAIN y se pone en venta como nuda propiedad
            con protección de 15 años para holders
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-[#C7CEEA]" />
              <h3 className="text-xl font-bold text-slate-900">Proceso Simple y Transparente</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Cuando se venden las 48 semanas de una propiedad, esta se escritura a nombre de WEEK-CHAIN Company. Desde
              el primer día, la propiedad se pone en venta como <strong>nuda propiedad</strong> con una cláusula de
              protección que garantiza los 15 años de uso para todos los holders del certificado digital. Una vez
              vendida la nuda propiedad, el monto se distribuye de forma transparente.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
              <CardHeader className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-4xl font-bold text-amber-600">50%</div>
                </div>
                <CardTitle className="text-lg text-slate-900 mb-2">Bonus Vacaciones Holders</CardTitle>
                <CardDescription className="text-slate-600">
                  La mitad del valor de venta se distribuye entre todos los holders de certificados digitales como bonus
                  vacacional
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-white">
              <CardHeader className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-green-600">10%</div>
                </div>
                <CardTitle className="text-lg text-slate-900 mb-2">Broker Retirement Bonus</CardTitle>
                <CardDescription className="text-slate-600">
                  Plan de retiro para brokers que participaron en la venta inicial. Primera plataforma con este
                  beneficio
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
              <CardHeader className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-blue-600">30%</div>
                </div>
                <CardTitle className="text-lg text-slate-900 mb-2">WEEK-CHAIN Company</CardTitle>
                <CardDescription className="text-slate-600">
                  Para operación de la plataforma, desarrollo continuo y expansión del ecosistema
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
              <CardHeader className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-4xl font-bold text-purple-600">10%</div>
                </div>
                <CardTitle className="text-lg text-slate-900 mb-2">ONG - Gobernanza DAO</CardTitle>
                <CardDescription className="text-slate-600">
                  Fondo para causas sociales administrado democráticamente por la comunidad de holders
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="p-6 bg-gradient-to-br from-[#B5EAD7]/10 to-white rounded-xl border-2 border-[#B5EAD7]/30">
            <h4 className="text-lg font-bold text-slate-900 mb-3">Ejemplo de Distribución</h4>
            <p className="text-slate-600 mb-4">
              Si la nuda propiedad se vende por <span className="font-bold text-slate-900">$400,000 USD</span>:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span>
                  <strong className="text-slate-900">$200,000</strong> bonus vacaciones para holders (50%)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>
                  <strong className="text-slate-900">$40,000</strong> broker retirement bonus (10%)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>
                  <strong className="text-slate-900">$120,000</strong> WEEK-CHAIN Company (30%)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>
                  <strong className="text-slate-900">$40,000</strong> ONG bajo gobernanza DAO (10%)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
