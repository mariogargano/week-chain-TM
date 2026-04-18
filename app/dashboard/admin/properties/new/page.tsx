"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building2, DollarSign, ImageIcon, Loader2, Calendar, Shield, Info } from "lucide-react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Badge } from "@/components/ui/badge"

// Modelo de negocio WEEK-CHAIN:
// - 52 semanas por propiedad al año
// - 48 semanas vendibles como SVC
// - 4 semanas reservadas (mantenimiento/empresa)
// - Precio UNIFORME por semana (sin temporadas)

const TOTAL_WEEKS = 52
const SELLABLE_WEEKS = 48
const RESERVED_WEEKS = 4 // Mantenimiento + Empresa

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
  const [maxPax, setMaxPax] = useState("6")
  const [bedrooms, setBedrooms] = useState("3")
  const [bathrooms, setBathrooms] = useState("2")
  const [propertyType, setPropertyType] = useState("villa")

  // Calculos automaticos basados en el modelo de negocio
  const calculations = useMemo(() => {
    const total = Number.parseFloat(valorTotal) || 0
    if (total <= 0) return null

    const pricePerWeek = total / SELLABLE_WEEKS // Dividido entre las 48 semanas vendibles
    const totalSellableValue = pricePerWeek * SELLABLE_WEEKS

    return {
      pricePerWeek,
      totalSellableValue,
      reservedWeeks: RESERVED_WEEKS,
      sellableWeeks: SELLABLE_WEEKS,
    }
  }, [valorTotal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
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
          price_per_week_usd: calculations?.pricePerWeek || 0,
          image_url: imageUrl || null,
          max_pax: Number.parseInt(maxPax),
          bedrooms: Number.parseInt(bedrooms),
          bathrooms: Number.parseInt(bathrooms),
          property_type: propertyType,
          // Modelo de capacidad WEEK-CHAIN
          total_weeks: TOTAL_WEEKS,
          sellable_weeks: SELLABLE_WEEKS,
          reserved_weeks: RESERVED_WEEKS,
          pricing_strategy: "uniform", // Precio uniforme, SIN temporadas
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create property")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/admin/properties")
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the property"
      setError(errorMessage)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Agregar Nueva Propiedad</h1>
          <p className="text-slate-500">
            Crea una propiedad con el modelo SVC (48 semanas vendibles + 4 reservadas)
          </p>
        </div>
      </div>

      {/* Info Banner - Modelo de Negocio */}
      <Card className="border-sky-200 bg-sky-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 rounded-lg shrink-0">
              <Info className="h-5 w-5 text-sky-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sky-900 mb-1">Modelo de Capacidad WEEK-CHAIN</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-sky-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span><strong>52</strong> semanas totales/año</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span><strong>48</strong> semanas vendibles (SVC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span><strong>4</strong> semanas reservadas</span>
                </div>
              </div>
              <p className="text-xs text-sky-600 mt-2">
                Precio uniforme por semana. Las 4 semanas reservadas son para mantenimiento y uso de la empresa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-sky-600" />
            Informacion de la Propiedad
          </CardTitle>
          <CardDescription>Completa los detalles para crear una nueva propiedad</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Nombre de la Propiedad *</Label>
                <Input
                  id="name"
                  placeholder="ej., Villa Paraiso Cancun"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicacion *</Label>
                <Input
                  id="location"
                  placeholder="ej., Cancun, Mexico"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Tipo de Propiedad *</Label>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="condo">Condominio</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Descripcion *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la propiedad, sus caracteristicas y amenidades..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPax">Capacidad (PAX)</Label>
                <Input
                  id="maxPax"
                  type="number"
                  min="1"
                  max="20"
                  value={maxPax}
                  onChange={(e) => setMaxPax(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Habitaciones</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="1"
                  max="20"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Banos</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="1"
                  max="20"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                />
              </div>
            </div>

            {/* Pricing - Modelo Uniforme */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <DollarSign className="h-5 w-5 text-sky-600" />
                Precio (Modelo Uniforme)
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total de la Propiedad (USD) *</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ej., 480000"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">
                  El valor total se divide entre las 48 semanas vendibles para calcular el precio por SVC
                </p>
              </div>

              {calculations && (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Valor Total de la Propiedad:</span>
                        <span className="text-lg font-bold text-slate-900">
                          ${Number.parseFloat(valorTotal).toLocaleString()} USD
                        </span>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Semanas Vendibles (SVC):</span>
                          <Badge variant="secondary">{SELLABLE_WEEKS} semanas</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Semanas Reservadas:</span>
                        <Badge variant="outline">{RESERVED_WEEKS} semanas</Badge>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Precio por Semana (SVC):</span>
                          <span className="text-xl font-bold text-sky-600">
                            ${calculations.pricePerWeek.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} USD
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Precio uniforme para todas las 48 semanas vendibles
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Image */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <ImageIcon className="h-5 w-5 text-sky-600" />
                Imagen Principal
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
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
                Propiedad creada exitosamente con 48 semanas SVC + 4 reservadas. Redirigiendo...
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/properties")}
                disabled={isLoading}
                className="sm:flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name || !location || !description || !valorTotal}
                className="sm:flex-1 bg-sky-500 hover:bg-sky-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Propiedad...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Crear Propiedad (48+4 Semanas)
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
