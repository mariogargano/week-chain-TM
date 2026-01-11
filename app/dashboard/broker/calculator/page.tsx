"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, DollarSign, TrendingUp } from "lucide-react"

export default function BrokerCalculatorPage() {
  const [weeksSold, setWeeksSold] = useState<number>(0)
  const [pricePerWeek, setPricePerWeek] = useState<number>(3750)

  const calculateCommissions = () => {
    const totalSales = weeksSold * pricePerWeek
    const immediateCommission = totalSales * 0.06
    const deferredCommission = totalSales * 0.1
    const totalCommission = immediateCommission + deferredCommission

    return {
      totalSales,
      immediateCommission,
      deferredCommission,
      totalCommission,
    }
  }

  const results = calculateCommissions()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calculadora de Comisiones</h1>
        <p className="text-muted-foreground">Calcula cuánto puedes ganar vendiendo semanas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Parámetros
            </CardTitle>
            <CardDescription>Ingresa el número de semanas y el precio promedio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weeks">Número de semanas vendidas</Label>
              <Input
                id="weeks"
                type="number"
                min="0"
                value={weeksSold}
                onChange={(e) => setWeeksSold(Number(e.target.value))}
                placeholder="Ej: 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio promedio por semana (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="100"
                value={pricePerWeek}
                onChange={(e) => setPricePerWeek(Number(e.target.value))}
                placeholder="Ej: 3750"
              />
              <p className="text-xs text-muted-foreground">Precio promedio: $3,750 USD</p>
            </div>

            <Button
              onClick={() => {
                setWeeksSold(0)
                setPricePerWeek(3750)
              }}
              variant="outline"
              className="w-full"
            >
              Resetear
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultados
            </CardTitle>
            <CardDescription>Tus comisiones estimadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de ventas</p>
              <p className="text-3xl font-bold">${results.totalSales.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <DollarSign className="h-4 w-4" />
                <p className="text-sm font-medium">Comisión Inmediata (6%)</p>
              </div>
              <p className="text-2xl font-bold text-green-700">${results.immediateCommission.toLocaleString()}</p>
              <p className="text-xs text-green-600">Se paga al completar la venta</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-blue-700">
                <DollarSign className="h-4 w-4" />
                <p className="text-sm font-medium">Comisión Diferida (10%)</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">${results.deferredCommission.toLocaleString()}</p>
              <p className="text-xs text-blue-600">Se distribuye durante 15 años</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Comisión Total</p>
              <p className="text-4xl font-bold text-purple-600">${results.totalCommission.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Comisión Inmediata</h3>
            <p className="text-sm text-muted-foreground">
              Recibes el 6% del precio de venta inmediatamente al cerrar la transacción
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Comisión Diferida</h3>
            <p className="text-sm text-muted-foreground">
              Recibes el 10% de los ingresos por renta de las 4 semanas retenidas durante 15 años
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Potencial de Ingreso</h3>
            <p className="text-sm text-muted-foreground">
              En total, ganas el 16% del valor de cada semana vendida (6% + 10%)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
