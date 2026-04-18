"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, DollarSign, TrendingUp, Calendar, Info, FileText, Percent } from "lucide-react"
import { useState, useMemo } from "react"
import { RoleGuard } from "@/components/role-guard"

// Definición de temporadas
const SEASONS = [
  {
    id: "ultra-high",
    name: "Temporada Ultra Alta",
    multiplier: 2.0,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    weeks: [52, 1, 14, 15],
    description: "Navidad, Año Nuevo, Semana Santa",
  },
  {
    id: "high",
    name: "Temporada Alta",
    multiplier: 1.5,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    weeks: [2, 3, 4, 5, 6, 7, 8, 26, 27, 28, 29, 30, 31, 32],
    description: "Verano, vacaciones escolares",
  },
  {
    id: "mid",
    name: "Temporada Media",
    multiplier: 1.0,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    weeks: [9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    description: "Primavera, otoño",
  },
  {
    id: "low",
    name: "Temporada Baja",
    multiplier: 0.7,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    weeks: [21, 22, 23, 24, 25, 47, 48, 49, 50, 51],
    description: "Temporada baja, días laborables",
  },
]

export default function PricingCalculatorPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <PricingCalculatorContent />
    </RoleGuard>
  )
}

function PricingCalculatorContent() {
  const [propertyValue, setPropertyValue] = useState("")
  const [notarialFees, setNotarialFees] = useState("3") // % del valor
  const [weekChainCommission, setWeekChainCommission] = useState("15") // % del valor
  const [annualMaintenance, setAnnualMaintenance] = useState("") // USD por año
  const [propertyTax, setPropertyTax] = useState("1") // % del valor anual
  const [insurance, setInsurance] = useState("") // USD por año
  const [managementFee, setManagementFee] = useState("10") // % de ingresos

  // Calcular costos totales
  const costs = useMemo(() => {
    const propValue = Number.parseFloat(propertyValue || "0")
    const notarial = (propValue * Number.parseFloat(notarialFees || "0")) / 100
    const commission = (propValue * Number.parseFloat(weekChainCommission || "0")) / 100
    const maintenance = Number.parseFloat(annualMaintenance || "0")
    const tax = (propValue * Number.parseFloat(propertyTax || "0")) / 100
    const insuranceCost = Number.parseFloat(insurance || "0")

    const totalInitialCosts = notarial + commission
    const totalAnnualCosts = maintenance + tax + insuranceCost

    return {
      notarial,
      commission,
      maintenance,
      tax,
      insuranceCost,
      totalInitialCosts,
      totalAnnualCosts,
      totalCosts: totalInitialCosts + totalAnnualCosts,
    }
  }, [propertyValue, notarialFees, weekChainCommission, annualMaintenance, propertyTax, insurance])

  // Calcular precio base ajustado por costos
  const basePricePerWeek = useMemo(() => {
    if (!propertyValue || Number.parseFloat(propertyValue) <= 0) return 0
    const propValue = Number.parseFloat(propertyValue)
    const adjustedValue = propValue + costs.totalInitialCosts + costs.totalAnnualCosts
    return adjustedValue / 52
  }, [propertyValue, costs])

  // Calcular precios por temporada
  const seasonPricing = useMemo(() => {
    return SEASONS.map((season) => {
      const pricePerWeek = basePricePerWeek * season.multiplier
      const managementFeeAmount = (pricePerWeek * Number.parseFloat(managementFee || "0")) / 100
      const netPricePerWeek = pricePerWeek - managementFeeAmount

      return {
        ...season,
        pricePerWeek,
        managementFeeAmount,
        netPricePerWeek,
        totalRevenue: pricePerWeek * season.weeks.length,
        netRevenue: netPricePerWeek * season.weeks.length,
      }
    })
  }, [basePricePerWeek, managementFee])

  // Calcular totales
  const totals = useMemo(() => {
    const totalRevenue = seasonPricing.reduce((sum, season) => sum + season.totalRevenue, 0)
    const totalNetRevenue = seasonPricing.reduce((sum, season) => sum + season.netRevenue, 0)
    const totalManagementFees = totalRevenue - totalNetRevenue
    const averagePrice = totalRevenue / 52
    const netProfit = totalNetRevenue - costs.totalCosts
    const roi = propertyValue ? (netProfit / Number.parseFloat(propertyValue)) * 100 : 0

    return {
      totalRevenue,
      totalNetRevenue,
      totalManagementFees,
      averagePrice,
      netProfit,
      roi,
    }
  }, [seasonPricing, costs, propertyValue])

  // Obtener temporada de una semana específica
  const getSeasonForWeek = (weekNumber: number) => {
    return SEASONS.find((season) => season.weeks.includes(weekNumber))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calculadora de Precios Administrativa</h1>
        <p className="text-muted-foreground">
          Calcula los precios de las semanas considerando todos los costos operativos
        </p>
      </div>

      {/* Input Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valor de Propiedad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valor de la Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="propertyValue">Valor Total del Inmueble (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="propertyValue"
                  type="number"
                  step="1000"
                  min="0"
                  placeholder="520000"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Costos Iniciales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Costos Iniciales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notarialFees">Gastos Notariales (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="notarialFees"
                  type="number"
                  step="0.1"
                  min="0"
                  value={notarialFees}
                  onChange={(e) => setNotarialFees(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ${costs.notarial.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekChainCommission">Comisión WEEK-CHAIN (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="weekChainCommission"
                  type="number"
                  step="0.1"
                  min="0"
                  value={weekChainCommission}
                  onChange={(e) => setWeekChainCommission(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ${costs.commission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Total Costos Iniciales:</span>
              <span className="text-lg font-bold text-primary">
                ${costs.totalInitialCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Costos Anuales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Costos Anuales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="annualMaintenance">Mantenimiento Anual (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="annualMaintenance"
                  type="number"
                  step="100"
                  min="0"
                  placeholder="5000"
                  value={annualMaintenance}
                  onChange={(e) => setAnnualMaintenance(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyTax">Impuesto Predial (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="propertyTax"
                  type="number"
                  step="0.1"
                  min="0"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ${costs.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance">Seguro Anual (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="insurance"
                  type="number"
                  step="100"
                  min="0"
                  placeholder="2000"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Total Costos Anuales:</span>
              <span className="text-lg font-bold text-primary">
                ${costs.totalAnnualCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fee de Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fee de Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="managementFee">Comisión WEEK Management (% de ingresos)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="managementFee"
                  type="number"
                  step="0.1"
                  min="0"
                  value={managementFee}
                  onChange={(e) => setManagementFee(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">Se aplica sobre los ingresos brutos de cada semana</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {basePricePerWeek > 0 && (
        <>
          {/* Resumen de Costos */}
          <Card className="border-amber-500/50 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Costos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Costos Iniciales</p>
                  <p className="text-2xl font-bold text-amber-700">
                    ${costs.totalInitialCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Costos Anuales</p>
                  <p className="text-2xl font-bold text-amber-700">
                    ${costs.totalAnnualCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Precio Base por Semana</p>
                  <p className="text-2xl font-bold text-primary">
                    ${basePricePerWeek.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing by Season */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Precios por Temporada
              </CardTitle>
              <CardDescription>Desglose de precios con fee de management incluido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seasonPricing.map((season) => (
                  <div key={season.id} className={`rounded-lg border p-4 ${season.bgColor}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${season.color}`} />
                        <div>
                          <h3 className={`font-semibold ${season.textColor}`}>{season.name}</h3>
                          <p className="text-sm text-muted-foreground">{season.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">x{season.multiplier}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Precio Bruto</p>
                        <p className={`text-lg font-bold ${season.textColor}`}>
                          ${season.pricePerWeek.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fee Management</p>
                        <p className="text-lg font-bold text-amber-700">
                          -${season.managementFeeAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Precio Neto</p>
                        <p className={`text-lg font-bold ${season.textColor}`}>
                          ${season.netPricePerWeek.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ingresos Netos</p>
                        <p className={`text-lg font-bold ${season.textColor}`}>
                          ${season.netRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-current/10">
                      <p className="text-xs text-muted-foreground">{season.weeks.length} semanas incluidas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen Financiero Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Valor Propiedad</p>
                    <p className="text-xl font-bold">
                      ${Number.parseFloat(propertyValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ingresos Brutos</p>
                    <p className="text-xl font-bold text-green-600">
                      ${totals.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fees Management</p>
                    <p className="text-xl font-bold text-amber-600">
                      -${totals.totalManagementFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ingresos Netos</p>
                    <p className="text-xl font-bold text-primary">
                      ${totals.totalNetRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Costos Totales</p>
                    <p className="text-xl font-bold text-red-600">
                      -${costs.totalCosts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                    <p className={`text-2xl font-bold ${totals.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {totals.netProfit >= 0 ? "+" : ""}$
                      {Math.abs(totals.netProfit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Precio Promedio/Semana</p>
                    <p className="text-xl font-semibold">
                      ${totals.averagePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ROI Estimado</p>
                    <p className={`text-xl font-semibold ${totals.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {totals.roi >= 0 ? "+" : ""}
                      {totals.roi.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">Notas Importantes</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Los precios incluyen todos los costos operativos</li>
                        <li>• El fee de management se aplica sobre ingresos brutos</li>
                        <li>• Los costos anuales se distribuyen entre las 52 semanas</li>
                        <li>• El ROI es estimado y puede variar según ocupación real</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Week Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendario de Precios (52 Semanas)
              </CardTitle>
              <CardDescription>Vista detallada de precios netos por semana del año</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => {
                  const season = getSeasonForWeek(week)
                  if (!season) return null

                  const seasonData = seasonPricing.find((s) => s.id === season.id)
                  if (!seasonData) return null

                  return (
                    <div
                      key={week}
                      className={`rounded-lg p-3 border ${season.bgColor} hover:shadow-md transition-shadow`}
                      title={`Semana ${week} - ${season.name}\nPrecio Neto: $${seasonData.netPricePerWeek.toFixed(2)}`}
                    >
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground">S{week}</p>
                        <div className={`w-2 h-2 rounded-full ${season.color} mx-auto my-1`} />
                        <p className={`text-xs font-bold ${season.textColor}`}>
                          $
                          {seasonData.netPricePerWeek.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
