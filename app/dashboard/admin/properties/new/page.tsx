"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building2, DollarSign, ImageIcon, Loader2, TrendingUp } from "lucide-react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Badge } from "@/components/ui/badge"

const SEASONS = [
  {
    id: "ultra-high",
    name: "Temporada Ultra Alta",
    multiplier: 2.0,
    color: "bg-red-500",
    weeks: [52, 1, 14, 15],
  },
  {
    id: "high",
    name: "Temporada Alta",
    multiplier: 1.5,
    color: "bg-orange-500",
    weeks: [2, 3, 4, 5, 6, 7, 8, 26, 27, 28, 29, 30, 31, 32],
  },
  {
    id: "mid",
    name: "Temporada Media",
    multiplier: 1.0,
    color: "bg-blue-500",
    weeks: [9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
  },
  {
    id: "low",
    name: "Temporada Baja",
    multiplier: 0.7,
    color: "bg-green-500",
    weeks: [21, 22, 23, 24, 25, 47, 48, 49, 50, 51],
  },
]

function isDemoMode() {
  // Implement your logic to check if the demo mode is active
  return true // Placeholder for demo mode check
}

export default function NewPropertyPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <NewPropertyContent />
    </RoleGuard>
  )
}

function NewPropertyContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [valorTotal, setValorTotal] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const basePricePerWeek = useMemo(() => {
    if (!valorTotal || Number.parseFloat(valorTotal) <= 0) return 0
    return Number.parseFloat(valorTotal) / 52
  }, [valorTotal])

  const seasonPricing = useMemo(() => {
    return SEASONS.map((season) => ({
      ...season,
      pricePerWeek: basePricePerWeek * season.multiplier,
      totalRevenue: basePricePerWeek * season.multiplier * season.weeks.length,
    }))
  }, [basePricePerWeek])

  const totalRevenue = useMemo(() => {
    return seasonPricing.reduce((sum, season) => sum + season.totalRevenue, 0)
  }, [seasonPricing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("[v0] Submitting new property...")

      const response = await fetch("/api/admin/properties/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          location,
          description,
          valor_total_usd: Number.parseFloat(valorTotal),
          image_url: imageUrl || null,
          weeks_target: 52,
          pricing_strategy: "seasonal",
          seasonal_pricing: seasonPricing.map((season) => ({
            season_id: season.id,
            multiplier: season.multiplier,
            weeks: season.weeks,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create property")
      }

      console.log("[v0] Property created successfully:", data)
      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/admin/properties")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Error creating property:", err)
      setError(err.message || "An error occurred while creating the property")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/admin/properties")}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Agregar Nueva Propiedad Real</h1>
          <p className="text-muted-foreground">
            Crea una propiedad real con precios por temporada. El sistema generará automáticamente 52 semanas
            tokenizadas.
          </p>
        </div>
        {isDemoMode() && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Modo Demo Activo
          </Badge>
        )}
      </div>

      {isDemoMode() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Creando Propiedad Real en Modo Demo</h4>
                <p className="text-sm text-blue-700">
                  Estás creando una propiedad REAL que funcionará normalmente en el marketplace. El modo demo solo
                  afecta los pagos (que serán simulados). La propiedad, semanas y toda la gestión funcionan
                  completamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Propiedad
          </CardTitle>
          <CardDescription>Completa los detalles para crear una nueva propiedad</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Propiedad *</Label>
                <Input
                  id="name"
                  placeholder="ej., Villa de Lujo en Cancún"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  placeholder="ej., Cancún, México"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la propiedad, sus características y amenidades..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5" />
                Precio
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total de la Propiedad (USD) *</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ej., 520000"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">El valor total de la propiedad que será tokenizada</p>
              </div>

              {valorTotal && Number.parseFloat(valorTotal) > 0 && (
                <div className="space-y-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Valor Total de la Propiedad:</span>
                          <span className="text-lg font-bold">${Number.parseFloat(valorTotal).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Precio Base por Semana:</span>
                          <span className="text-lg font-bold">
                            $
                            {basePricePerWeek.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-sm font-medium">Ingresos Totales Estimados:</span>
                          <span className="text-lg font-bold text-primary">
                            $
                            {totalRevenue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Precios por Temporada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {seasonPricing.map((season) => (
                          <div key={season.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${season.color}`} />
                              <div>
                                <p className="font-medium text-sm">{season.name}</p>
                                <p className="text-xs text-muted-foreground">{season.weeks.length} semanas</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                $
                                {season.pricePerWeek.toLocaleString("en-US", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                x{season.multiplier}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <ImageIcon className="h-5 w-5" />
                Imagen de la Propiedad
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de la Imagen</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Proporciona una URL de la imagen principal de la propiedad
                </p>
              </div>

              {imageUrl && (
                <div className="rounded-lg border overflow-hidden">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Vista previa de la propiedad"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                ¡Propiedad creada exitosamente! Redirigiendo...
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/properties")}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name || !location || !description || !valorTotal}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Propiedad...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Crear Propiedad
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
