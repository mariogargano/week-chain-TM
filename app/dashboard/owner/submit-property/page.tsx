"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, FileText, CheckCircle, Building2, DollarSign, Home, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SubmitPropertyPage() {
  return (
    <RoleGuard allowedRoles={["property_owner", "admin"]}>
      <SubmitPropertyContent />
    </RoleGuard>
  )
}

function SubmitPropertyContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    property_name: "",
    property_description: "",
    property_location: "",
    property_address: "",
    property_type: "villa",
    total_area_sqm: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [] as string[],
    total_value_usd: "",
    weeks_to_tokenize: "52",
    price_per_week_usd: "",
    images: [] as string[],
    property_documents: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-calculate price per week
    if (name === "total_value_usd" || name === "weeks_to_tokenize") {
      const totalValue =
        name === "total_value_usd" ? Number.parseFloat(value) : Number.parseFloat(formData.total_value_usd)
      const weeks =
        name === "weeks_to_tokenize" ? Number.parseFloat(value) : Number.parseFloat(formData.weeks_to_tokenize)
      if (totalValue && weeks) {
        setFormData((prev) => ({ ...prev, price_per_week_usd: (totalValue / weeks).toFixed(2) }))
      }
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const saveDraft = async () => {
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión", variant: "destructive" })
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("property_submissions")
      .insert({
        owner_id: user.id,
        ...formData,
        total_area_sqm: Number.parseFloat(formData.total_area_sqm) || null,
        bedrooms: Number.parseInt(formData.bedrooms) || null,
        bathrooms: Number.parseInt(formData.bathrooms) || null,
        total_value_usd: Number.parseFloat(formData.total_value_usd),
        weeks_to_tokenize: Number.parseInt(formData.weeks_to_tokenize),
        price_per_week_usd: Number.parseFloat(formData.price_per_week_usd),
        status: "draft",
      })
      .select()

    setLoading(false)

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el borrador", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Borrador guardado correctamente" })
      router.push(`/dashboard/owner/submissions/${data[0].id}`)
    }
  }

  const submitForReview = async () => {
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión", variant: "destructive" })
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("property_submissions")
      .insert({
        owner_id: user.id,
        ...formData,
        total_area_sqm: Number.parseFloat(formData.total_area_sqm) || null,
        bedrooms: Number.parseInt(formData.bedrooms) || null,
        bathrooms: Number.parseInt(formData.bathrooms) || null,
        total_value_usd: Number.parseFloat(formData.total_value_usd),
        weeks_to_tokenize: Number.parseInt(formData.weeks_to_tokenize),
        price_per_week_usd: Number.parseFloat(formData.price_per_week_usd),
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()

    setLoading(false)

    if (error) {
      toast({ title: "Error", description: "No se pudo enviar la propiedad", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Propiedad enviada para revisión" })
      router.push(`/dashboard/owner/submissions/${data[0].id}/sign-contract`)
    }
  }

  const amenitiesList = [
    "Piscina",
    "Gimnasio",
    "Estacionamiento",
    "WiFi",
    "Aire Acondicionado",
    "Cocina Equipada",
    "Jardín",
    "Terraza",
    "Vista al Mar",
    "Seguridad 24/7",
    "Ascensor",
    "Lavandería",
  ]

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/owner")}
              className="bg-white/90 backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Enviar Nueva Propiedad
              </h1>
              <p className="text-slate-600">Completa la información de tu propiedad</p>
            </div>
          </div>

          {/* Progress Steps */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, label: "Información Básica", icon: Building2 },
                  { num: 2, label: "Detalles", icon: Home },
                  { num: 3, label: "Financiero", icon: DollarSign },
                  { num: 4, label: "Documentos", icon: FileText },
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          step >= s.num
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {step > s.num ? <CheckCircle className="h-6 w-6" /> : <s.icon className="h-6 w-6" />}
                      </div>
                      <p className="text-xs mt-2 text-slate-600 text-center">{s.label}</p>
                    </div>
                    {idx < 3 && (
                      <div
                        className={`h-1 flex-1 ${step > s.num ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-slate-200"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="property_name">Nombre de la Propiedad *</Label>
                  <Input
                    id="property_name"
                    name="property_name"
                    value={formData.property_name}
                    onChange={handleInputChange}
                    placeholder="Villa Paraíso"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_description">Descripción</Label>
                  <Textarea
                    id="property_description"
                    name="property_description"
                    value={formData.property_description}
                    onChange={handleInputChange}
                    placeholder="Describe tu propiedad..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_location">Ubicación *</Label>
                    <Input
                      id="property_location"
                      name="property_location"
                      value={formData.property_location}
                      onChange={handleInputChange}
                      placeholder="Cancún, México"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property_type">Tipo de Propiedad *</Label>
                    <select
                      id="property_type"
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleInputChange}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_address">Dirección Completa *</Label>
                  <Input
                    id="property_address"
                    name="property_address"
                    value={formData.property_address}
                    onChange={handleInputChange}
                    placeholder="Calle, número, colonia, código postal"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={saveDraft} disabled={loading}>
                    Guardar Borrador
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.property_name || !formData.property_location || !formData.property_address}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle>Detalles de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_area_sqm">Área Total (m²)</Label>
                    <Input
                      id="total_area_sqm"
                      name="total_area_sqm"
                      type="number"
                      value={formData.total_area_sqm}
                      onChange={handleInputChange}
                      placeholder="150"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Habitaciones</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amenidades</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          formData.amenities.includes(amenity)
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Anterior
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={saveDraft} disabled={loading}>
                      Guardar Borrador
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Financial */}
          {step === 3 && (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle>Información Financiera</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="total_value_usd">Valor Total de la Propiedad (USD) *</Label>
                  <Input
                    id="total_value_usd"
                    name="total_value_usd"
                    type="number"
                    value={formData.total_value_usd}
                    onChange={handleInputChange}
                    placeholder="500000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeks_to_tokenize">Número de Semanas a Certificar *</Label>
                  <Input
                    id="weeks_to_tokenize"
                    name="weeks_to_tokenize"
                    type="number"
                    value={formData.weeks_to_tokenize}
                    onChange={handleInputChange}
                    placeholder="52"
                    required
                  />
                  <p className="text-xs text-slate-500">Típicamente 52 semanas (1 año completo)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_week_usd">Precio por Semana (USD)</Label>
                  <Input
                    id="price_per_week_usd"
                    name="price_per_week_usd"
                    type="number"
                    value={formData.price_per_week_usd}
                    onChange={handleInputChange}
                    placeholder="9615"
                    disabled
                  />
                  <p className="text-xs text-slate-500">Calculado automáticamente</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Resumen Financiero</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valor Total:</span>
                      <span className="font-semibold">
                        ${Number.parseFloat(formData.total_value_usd || "0").toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Semanas:</span>
                      <span className="font-semibold">{formData.weeks_to_tokenize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Precio/Semana:</span>
                      <span className="font-semibold">
                        ${Number.parseFloat(formData.price_per_week_usd || "0").toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Anterior
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={saveDraft} disabled={loading}>
                      Guardar Borrador
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!formData.total_value_usd || !formData.weeks_to_tokenize}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle>Documentos e Imágenes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Imágenes de la Propiedad</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                    <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Arrastra imágenes aquí o haz clic para seleccionar</p>
                    <p className="text-xs text-slate-500">PNG, JPG hasta 10MB cada una</p>
                    <Button variant="outline" className="mt-4 bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Imágenes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Documentos Legales</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Escrituras, títulos de propiedad, etc.</p>
                    <p className="text-xs text-slate-500">PDF hasta 20MB cada uno</p>
                    <Button variant="outline" className="mt-4 bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Documentos
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Anterior
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={saveDraft} disabled={loading}>
                      Guardar Borrador
                    </Button>
                    <Button
                      onClick={submitForReview}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {loading ? "Enviando..." : "Enviar para Revisión"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
