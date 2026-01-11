"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Building2,
  MapPin,
  Search,
  ArrowLeft,
  Plus,
  Edit,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  Trash2,
  Save,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPropertiesPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminPropertiesContent />
    </RoleGuard>
  )
}

interface PropertyForm {
  name: string
  location: string
  description: string
  image_url: string
  status: string
  total_weeks: number
  price_high: number
  price_medium: number
  price_low: number
  amenities: string[]
  bedrooms: number
  bathrooms: number
  size: string
  gallery: string[]
}

const DEFAULT_PROPERTY: PropertyForm = {
  name: "",
  location: "",
  description: "",
  image_url: "",
  status: "draft",
  total_weeks: 48,
  price_high: 0,
  price_medium: 0,
  price_low: 0,
  amenities: [],
  bedrooms: 2,
  bathrooms: 2,
  size: "",
  gallery: [],
}

function AdminPropertiesContent() {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [propertyForm, setPropertyForm] = useState<PropertyForm>(DEFAULT_PROPERTY)
  const [saving, setSaving] = useState(false)
  const [amenityInput, setAmenityInput] = useState("")

  const fetchProperties = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setProperties(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const filteredProperties = properties.filter(
    (property) =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSaveProperty = async () => {
    setSaving(true)
    const supabase = createClient()

    const propertyData = {
      name: propertyForm.name,
      location: propertyForm.location,
      description: propertyForm.description,
      image_url: propertyForm.image_url,
      status: propertyForm.status,
      total_weeks: propertyForm.total_weeks,
      price_high_season: propertyForm.price_high,
      price_medium_season: propertyForm.price_medium,
      price_low_season: propertyForm.price_low,
      amenities: propertyForm.amenities,
      bedrooms: propertyForm.bedrooms,
      bathrooms: propertyForm.bathrooms,
      size: propertyForm.size,
      gallery: propertyForm.gallery,
      // Calculate total value
      valor_total_usd: propertyForm.price_high * 16 + propertyForm.price_medium * 18 + propertyForm.price_low * 14,
      presale_target: propertyForm.total_weeks,
    }

    if (editingProperty) {
      const { error } = await supabase.from("properties").update(propertyData).eq("id", editingProperty.id)

      if (!error) {
        await fetchProperties()
        setEditingProperty(null)
        setIsAddDialogOpen(false)
        setPropertyForm(DEFAULT_PROPERTY)
      }
    } else {
      const { error } = await supabase.from("properties").insert([propertyData])

      if (!error) {
        await fetchProperties()
        setIsAddDialogOpen(false)
        setPropertyForm(DEFAULT_PROPERTY)
      }
    }

    setSaving(false)
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return

    const supabase = createClient()
    const { error } = await supabase.from("properties").delete().eq("id", id)

    if (!error) {
      await fetchProperties()
    }
  }

  const openEditDialog = (property: any) => {
    setEditingProperty(property)
    setPropertyForm({
      name: property.name || "",
      location: property.location || "",
      description: property.description || "",
      image_url: property.image_url || "",
      status: property.status || "draft",
      total_weeks: property.total_weeks || 48,
      price_high: property.price_high_season || 0,
      price_medium: property.price_medium_season || 0,
      price_low: property.price_low_season || 0,
      amenities: property.amenities || [],
      bedrooms: property.bedrooms || 2,
      bathrooms: property.bathrooms || 2,
      size: property.size || "",
      gallery: property.gallery || [],
    })
    setIsAddDialogOpen(true)
  }

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setPropertyForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }))
      setAmenityInput("")
    }
  }

  const removeAmenity = (index: number) => {
    setPropertyForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/admin")}
              className="bg-white shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Propiedades</h1>
              <p className="text-slate-600">Administra todas las propiedades de la plataforma</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingProperty(null)
                    setPropertyForm(DEFAULT_PROPERTY)
                  }}
                  className="bg-[#FF9AA2] hover:bg-[#FF9AA2]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Propiedad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de la Propiedad *</Label>
                      <Input
                        placeholder="Ej: AFLORA Tulum"
                        value={propertyForm.name}
                        onChange={(e) => setPropertyForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ubicación *</Label>
                      <Input
                        placeholder="Ej: Tulum, Quintana Roo, México"
                        value={propertyForm.location}
                        onChange={(e) => setPropertyForm((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      placeholder="Describe la propiedad..."
                      value={propertyForm.description}
                      onChange={(e) => setPropertyForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL de Imagen Principal</Label>
                      <Input
                        placeholder="https://..."
                        value={propertyForm.image_url}
                        onChange={(e) => setPropertyForm((prev) => ({ ...prev, image_url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={propertyForm.status}
                        onValueChange={(value) => setPropertyForm((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="active">Activa</SelectItem>
                          <SelectItem value="coming_soon">Próximamente</SelectItem>
                          <SelectItem value="sold_out">Agotada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Property Specs */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Especificaciones de la Propiedad
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Recámaras</Label>
                        <Input
                          type="number"
                          placeholder="2"
                          value={propertyForm.bedrooms || ""}
                          onChange={(e) => setPropertyForm((prev) => ({ ...prev, bedrooms: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Baños</Label>
                        <Input
                          type="number"
                          placeholder="2"
                          value={propertyForm.bathrooms || ""}
                          onChange={(e) => setPropertyForm((prev) => ({ ...prev, bathrooms: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tamaño (m²)</Label>
                        <Input
                          placeholder="98m²"
                          value={propertyForm.size || ""}
                          onChange={(e) => setPropertyForm((prev) => ({ ...prev, size: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precios por Temporada (USD por semana)
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Distribución: 16 semanas alta + 18 semanas media + 14 semanas baja = 48 semanas (4 reservadas
                      WEEK-CHAIN)
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-amber-700">Temporada Alta (16 sem)</Label>
                        <Input
                          type="number"
                          placeholder="9500"
                          value={propertyForm.price_high || ""}
                          onChange={(e) => setPropertyForm((prev) => ({ ...prev, price_high: Number(e.target.value) }))}
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-blue-700">Temporada Media (18 sem)</Label>
                        <Input
                          type="number"
                          placeholder="7000"
                          value={propertyForm.price_medium || ""}
                          onChange={(e) =>
                            setPropertyForm((prev) => ({ ...prev, price_medium: Number(e.target.value) }))
                          }
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-700">Temporada Baja (14 sem)</Label>
                        <Input
                          type="number"
                          placeholder="4143"
                          value={propertyForm.price_low || ""}
                          onChange={(e) => setPropertyForm((prev) => ({ ...prev, price_low: Number(e.target.value) }))}
                          className="border-emerald-200 focus:border-emerald-400"
                        />
                      </div>
                    </div>
                    {propertyForm.price_high > 0 && propertyForm.price_medium > 0 && propertyForm.price_low > 0 && (
                      <p className="text-sm text-slate-600 mt-3">
                        Valor total calculado:{" "}
                        <strong>
                          $
                          {(
                            propertyForm.price_high * 16 +
                            propertyForm.price_medium * 18 +
                            propertyForm.price_low * 14
                          ).toLocaleString()}{" "}
                          USD
                        </strong>{" "}
                        (48 semanas)
                      </p>
                    )}
                  </div>

                  {/* Weeks */}
                  <div className="space-y-2">
                    <Label>Total de Semanas</Label>
                    <Input
                      type="number"
                      value={propertyForm.total_weeks}
                      onChange={(e) => setPropertyForm((prev) => ({ ...prev, total_weeks: Number(e.target.value) }))}
                    />
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <Label>Amenidades</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Agregar amenidad..."
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                      />
                      <Button type="button" variant="outline" onClick={addAmenity}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {propertyForm.amenities.map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          {amenity}
                          <button onClick={() => removeAmenity(idx)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        setEditingProperty(null)
                        setPropertyForm(DEFAULT_PROPERTY)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-[#FF9AA2] hover:bg-[#FF9AA2]/90"
                      onClick={handleSaveProperty}
                      disabled={saving || !propertyForm.name || !propertyForm.location}
                    >
                      {saving ? (
                        "Guardando..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingProperty ? "Actualizar" : "Crear Propiedad"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{properties.length}</p>
                    <p className="text-xs text-slate-600">Total Propiedades</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{properties.filter((p) => p.status === "active").length}</p>
                    <p className="text-xs text-slate-600">Activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {properties.reduce((sum, p) => sum + (p.total_weeks || 48), 0)}
                    </p>
                    <p className="text-xs text-slate-600">Total Semanas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${(properties.reduce((sum, p) => sum + (p.valor_total_usd || 0), 0) / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-slate-600">Valor Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          {loading ? (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-slate-600">Cargando propiedades...</p>
              </CardContent>
            </Card>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {property.image_url && (
                    <div className="h-48 w-full overflow-hidden relative">
                      <img
                        src={property.image_url || "/placeholder.svg"}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                      <Badge
                        className={`absolute top-3 right-3 ${
                          property.status === "active"
                            ? "bg-emerald-500"
                            : property.status === "coming_soon"
                              ? "bg-amber-500"
                              : "bg-slate-500"
                        }`}
                      >
                        {property.status === "active"
                          ? "Activa"
                          : property.status === "coming_soon"
                            ? "Próximamente"
                            : property.status === "sold_out"
                              ? "Agotada"
                              : "Borrador"}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{property.name}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.location || "Sin ubicación"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <p className="text-xs text-amber-700">Alta</p>
                        <p className="font-bold text-amber-900">
                          ${(property.price_high_season || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">Media</p>
                        <p className="font-bold text-blue-900">
                          ${(property.price_medium_season || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <p className="text-xs text-emerald-700">Baja</p>
                        <p className="font-bold text-emerald-900">
                          ${(property.price_low_season || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => openEditDialog(property)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/properties/${property.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    {searchTerm ? "No se encontraron propiedades" : "No hay propiedades registradas"}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-[#FF9AA2] hover:bg-[#FF9AA2]/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primera Propiedad
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
