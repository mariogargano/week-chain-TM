"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Search, Plus, Edit, TrendingUp, Calendar, DollarSign, Eye, Trash2, Save, X, Upload, FileText, Users, Briefcase, CalendarDays, ChevronLeft, ChevronRight, CheckCircle, Loader2,  } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  spv_name: string
  spv_rfc: string
  owner_id: string
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
  spv_name: "",
  spv_rfc: "",
  owner_id: "",
}

const WEEK_STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
  reserved: "bg-amber-100 text-amber-700 border-amber-200",
  sold: "bg-sky-100 text-sky-700 border-sky-200",
  blocked: "bg-slate-200 text-slate-500 border-slate-300",
  maintenance: "bg-red-100 text-red-700 border-red-200",
  company: "bg-purple-100 text-purple-700 border-purple-200",
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [weeks, setWeeks] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("list")
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [propertyForm, setPropertyForm] = useState<PropertyForm>(DEFAULT_PROPERTY)
  const [saving, setSaving] = useState(false)
  const [amenityInput, setAmenityInput] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [documents, setDocuments] = useState<any[]>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const fetchData = async () => {
    const supabase = createClient()
    
    const [propsRes, weeksRes, ownersRes, docsRes] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("weeks").select("*"),
      supabase.from("users").select("id, email, full_name").eq("role", "owner"),
      supabase.from("property_documents").select("*").order("created_at", { ascending: false }),
    ])

    if (propsRes.data) setProperties(propsRes.data)
    if (weeksRes.data) setWeeks(weeksRes.data)
    if (ownersRes.data) setOwners(ownersRes.data)
    if (docsRes.data) setDocuments(docsRes.data)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredProperties = properties.filter(
    (property) =>
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPropertyWeeks = (propertyId: string) => {
    return weeks.filter(w => w.property_id === propertyId && w.year === selectedYear)
  }

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
      spv_name: propertyForm.spv_name,
      spv_rfc: propertyForm.spv_rfc,
      owner_id: propertyForm.owner_id || null,
      valor_total_usd: propertyForm.price_high * 16 + propertyForm.price_medium * 18 + propertyForm.price_low * 14,
    }

    if (editingProperty) {
      const { error } = await supabase.from("properties").update(propertyData).eq("id", editingProperty.id)
      if (!error) {
        await fetchData()
        setEditingProperty(null)
        setIsAddDialogOpen(false)
        setPropertyForm(DEFAULT_PROPERTY)
      }
    } else {
      const { data, error } = await supabase.from("properties").insert([propertyData]).select().single()
      if (!error && data) {
        // Create 52 weeks for the property (48 sellable + 4 company)
        const weeksToCreate = []
        const currentYear = new Date().getFullYear()
        for (let i = 1; i <= 52; i++) {
          weeksToCreate.push({
            property_id: data.id,
            week_number: i,
            year: currentYear,
            status: i <= 48 ? "available" : "company",
            season: i <= 16 ? "high" : i <= 34 ? "medium" : "low",
          })
        }
        await supabase.from("weeks").insert(weeksToCreate)
        await fetchData()
        setIsAddDialogOpen(false)
        setPropertyForm(DEFAULT_PROPERTY)
      }
    }

    setSaving(false)
  }

  const handleWeekStatusChange = async (weekId: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from("weeks").update({ status: newStatus }).eq("id", weekId)
    await fetchData()
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Esta accion eliminara la propiedad y todas sus semanas. Continuar?")) return
    const supabase = createClient()
    await supabase.from("weeks").delete().eq("property_id", id)
    await supabase.from("properties").delete().eq("id", id)
    await fetchData()
    setSelectedProperty(null)
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
      spv_name: property.spv_name || "",
      spv_rfc: property.spv_rfc || "",
      owner_id: property.owner_id || "",
    })
    setIsAddDialogOpen(true)
  }

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setPropertyForm((prev) => ({ ...prev, amenities: [...prev.amenities, amenityInput.trim()] }))
      setAmenityInput("")
    }
  }

  const removeAmenity = (index: number) => {
    setPropertyForm((prev) => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }))
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, propertyId: string, docType: string) => {
    const file = e.target.files?.[0]
    if (!file || !propertyId) return

    setUploadingDoc(true)
    const supabase = createClient()
    
    const fileName = `${propertyId}/${docType}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("property-documents")
      .upload(fileName, file)

    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage.from("property-documents").getPublicUrl(fileName)
      
      await supabase.from("property_documents").insert({
        property_id: propertyId,
        document_type: docType,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
      })
      
      await fetchData()
    }
    
    setUploadingDoc(false)
  }

  const getPropertyDocuments = (propertyId: string) => {
    return documents.filter(d => d.property_id === propertyId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion de Propiedades</h1>
          <p className="text-slate-500">Administra propiedades, SPVs, semanas y documentos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProperty(null); setPropertyForm(DEFAULT_PROPERTY) }} className="bg-sky-500 hover:bg-sky-600">
              <Plus className="h-4 w-4 mr-2" /> Nueva Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="basic">Basico</TabsTrigger>
                <TabsTrigger value="spv">SPV / Owner</TabsTrigger>
                <TabsTrigger value="pricing">Precios</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Propiedad *</Label>
                    <Input placeholder="Ej: AFLORA Tulum" value={propertyForm.name} onChange={(e) => setPropertyForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ubicacion *</Label>
                    <Input placeholder="Ej: Tulum, Quintana Roo" value={propertyForm.location} onChange={(e) => setPropertyForm((p) => ({ ...p, location: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripcion</Label>
                  <Textarea placeholder="Describe la propiedad..." value={propertyForm.description} onChange={(e) => setPropertyForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>URL Imagen Principal</Label>
                    <Input placeholder="https://..." value={propertyForm.image_url} onChange={(e) => setPropertyForm((p) => ({ ...p, image_url: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={propertyForm.status} onValueChange={(v) => setPropertyForm((p) => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="coming_soon">Proximamente</SelectItem>
                        <SelectItem value="sold_out">Agotada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="spv" className="space-y-4 mt-4">
                <Card className="border-sky-500/20 bg-sky-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-sky-600" /> Datos del SPV
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre SPV / Razon Social</Label>
                        <Input placeholder="WEEK-CHAIN SPV 001 S.A. de C.V." value={propertyForm.spv_name} onChange={(e) => setPropertyForm((p) => ({ ...p, spv_name: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>RFC del SPV</Label>
                        <Input placeholder="WCS010101ABC" value={propertyForm.spv_rfc} onChange={(e) => setPropertyForm((p) => ({ ...p, spv_rfc: e.target.value }))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-500/20 bg-emerald-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-600" /> Owner / Propietario
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Seleccionar Owner</Label>
                      <Select value={propertyForm.owner_id} onValueChange={(v) => setPropertyForm((p) => ({ ...p, owner_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar owner..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin owner asignado</SelectItem>
                          {owners.map((o) => (
                            <SelectItem key={o.id} value={o.id}>{o.full_name || o.email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  <strong>Modelo 48+4:</strong> 48 semanas vendibles (16 alta + 18 media + 14 baja) + 4 semanas empresa/mantenimiento
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-amber-700">Temporada Alta (16 sem)</Label>
                    <Input type="number" placeholder="9500" value={propertyForm.price_high || ""} onChange={(e) => setPropertyForm((p) => ({ ...p, price_high: Number(e.target.value) }))} className="border-amber-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sky-700">Temporada Media (18 sem)</Label>
                    <Input type="number" placeholder="7000" value={propertyForm.price_medium || ""} onChange={(e) => setPropertyForm((p) => ({ ...p, price_medium: Number(e.target.value) }))} className="border-sky-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-700">Temporada Baja (14 sem)</Label>
                    <Input type="number" placeholder="4143" value={propertyForm.price_low || ""} onChange={(e) => setPropertyForm((p) => ({ ...p, price_low: Number(e.target.value) }))} className="border-emerald-200" />
                  </div>
                </div>
                {propertyForm.price_high > 0 && propertyForm.price_medium > 0 && propertyForm.price_low > 0 && (
                  <div className="bg-slate-100 rounded-lg p-4">
                    <p className="text-lg font-semibold text-slate-900">
                      Valor Total: ${(propertyForm.price_high * 16 + propertyForm.price_medium * 18 + propertyForm.price_low * 14).toLocaleString()} USD
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="specs" className="space-y-4 mt-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Recamaras</Label>
                    <Input type="number" value={propertyForm.bedrooms || ""} onChange={(e) => setPropertyForm((p) => ({ ...p, bedrooms: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Banos</Label>
                    <Input type="number" value={propertyForm.bathrooms || ""} onChange={(e) => setPropertyForm((p) => ({ ...p, bathrooms: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tamano (m2)</Label>
                    <Input placeholder="98m2" value={propertyForm.size || ""} onChange={(e) => setPropertyForm((p) => ({ ...p, size: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amenidades</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Agregar amenidad..." value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())} />
                    <Button type="button" variant="outline" onClick={addAmenity}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {propertyForm.amenities.map((a, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">{a}<button onClick={() => removeAmenity(i)}><X className="h-3 w-3" /></button></Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setIsAddDialogOpen(false); setEditingProperty(null); setPropertyForm(DEFAULT_PROPERTY) }}>Cancelar</Button>
              <Button className="flex-1 bg-sky-500 hover:bg-sky-600" onClick={handleSaveProperty} disabled={saving || !propertyForm.name || !propertyForm.location}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingProperty ? "Actualizar" : "Crear Propiedad"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 rounded-xl"><Building2 className="h-5 w-5 text-sky-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{properties.length}</p>
                <p className="text-xs text-slate-500">Total Propiedades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{properties.filter((p) => p.status === "active").length}</p>
                <p className="text-xs text-slate-500">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl"><Calendar className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{weeks.filter(w => w.status === "available").length}</p>
                <p className="text-xs text-slate-500">Semanas Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-xl"><DollarSign className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">${(properties.reduce((s, p) => s + (p.valor_total_usd || 0), 0) / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-slate-500">Valor Total USD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur-xl border border-sky-500/20">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario Semanas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Buscar propiedad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-sky-500/20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-sky-500/20 bg-white hover:shadow-md transition-all gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-16 w-16 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {property.image_url ? (
                          <img src={property.image_url} alt={property.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8 text-sky-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 truncate">{property.name}</h3>
                          <Badge className={property.status === "active" ? "bg-emerald-100 text-emerald-700" : property.status === "coming_soon" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}>
                            {property.status === "active" ? "Activa" : property.status === "coming_soon" ? "Proximamente" : property.status === "sold_out" ? "Agotada" : "Borrador"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{property.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>{property.total_weeks || 48} semanas</span>
                          {property.spv_name && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{property.spv_name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedProperty(property); setActiveTab("calendar") }} className="flex-1 sm:flex-none border-sky-500/20">
                        <CalendarDays className="h-4 w-4 mr-1" /> Semanas
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(property)} className="border-sky-500/20"><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(property.id)} className="border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {filteredProperties.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No hay propiedades registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-sky-500" />
                    Calendario de Semanas {selectedProperty ? `- ${selectedProperty.name}` : ""}
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Gestiona disponibilidad y estado de cada semana</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedProperty?.id || ""} onValueChange={(v) => setSelectedProperty(properties.find(p => p.id === v) || null)}>
                    <SelectTrigger className="w-[200px] border-sky-500/20"><SelectValue placeholder="Seleccionar propiedad" /></SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedYear(y => y - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="px-3 font-semibold text-slate-700">{selectedYear}</span>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedYear(y => y + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <Badge className="bg-emerald-100 text-emerald-700">Disponible</Badge>
                    <Badge className="bg-amber-100 text-amber-700">Reservada</Badge>
                    <Badge className="bg-sky-100 text-sky-700">Vendida</Badge>
                    <Badge className="bg-slate-200 text-slate-500">Bloqueada</Badge>
                    <Badge className="bg-red-100 text-red-700">Mantenimiento</Badge>
                    <Badge className="bg-purple-100 text-purple-700">Empresa</Badge>
                  </div>
                  
                  {/* Weeks Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-13 gap-2">
                    {Array.from({ length: 52 }, (_, i) => {
                      const weekNum = i + 1
                      const week = getPropertyWeeks(selectedProperty.id).find(w => w.week_number === weekNum)
                      const status = week?.status || "available"
                      
                      return (
                        <div key={weekNum} className="relative group">
                          <Select value={status} onValueChange={(v) => week && handleWeekStatusChange(week.id, v)}>
                            <SelectTrigger className={`h-12 w-full text-xs font-medium border ${WEEK_STATUS_COLORS[status]}`}>
                              <span>S{weekNum}</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Disponible</SelectItem>
                              <SelectItem value="reserved">Reservada</SelectItem>
                              <SelectItem value="sold">Vendida</SelectItem>
                              <SelectItem value="blocked">Bloqueada</SelectItem>
                              <SelectItem value="maintenance">Mantenimiento</SelectItem>
                              <SelectItem value="company">Empresa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6 pt-6 border-t">
                    {[
                      { label: "Disponibles", status: "available", color: "emerald" },
                      { label: "Reservadas", status: "reserved", color: "amber" },
                      { label: "Vendidas", status: "sold", color: "sky" },
                      { label: "Bloqueadas", status: "blocked", color: "slate" },
                      { label: "Mantenimiento", status: "maintenance", color: "red" },
                      { label: "Empresa", status: "company", color: "purple" },
                    ].map((item) => (
                      <div key={item.status} className="text-center">
                        <p className={`text-2xl font-bold text-${item.color}-600`}>
                          {getPropertyWeeks(selectedProperty.id).filter(w => w.status === item.status).length}
                        </p>
                        <p className="text-xs text-slate-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Selecciona una propiedad para ver el calendario de semanas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky-500" /> Documentos de Propiedades
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Contratos, escrituras, seguros y anexos</p>
                </div>
                <Select value={selectedProperty?.id || ""} onValueChange={(v) => setSelectedProperty(properties.find(p => p.id === v) || null)}>
                  <SelectTrigger className="w-[200px] border-sky-500/20"><SelectValue placeholder="Seleccionar propiedad" /></SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <div className="space-y-6">
                  {/* Upload Section */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { type: "escritura", label: "Escritura", icon: FileText },
                      { type: "contrato_owner", label: "Contrato Owner", icon: Briefcase },
                      { type: "seguro", label: "Poliza Seguro", icon: CheckCircle },
                      { type: "anexo", label: "Anexos", icon: Upload },
                    ].map((doc) => (
                      <div key={doc.type} className="border-2 border-dashed border-sky-200 rounded-xl p-4 text-center hover:border-sky-400 transition-colors">
                        <doc.icon className="h-8 w-8 mx-auto mb-2 text-sky-400" />
                        <p className="font-medium text-slate-700 mb-2">{doc.label}</p>
                        <label className="cursor-pointer">
                          <Input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleDocumentUpload(e, selectedProperty.id, doc.type)} disabled={uploadingDoc} />
                          <Button variant="outline" size="sm" className="border-sky-500/20" asChild>
                            <span>{uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mr-1" /> Subir</>}</span>
                          </Button>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Documents List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">Documentos Cargados</h4>
                    {getPropertyDocuments(selectedProperty.id).length > 0 ? (
                      <div className="space-y-2">
                        {getPropertyDocuments(selectedProperty.id).map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-sky-500" />
                              <div>
                                <p className="font-medium text-slate-900">{doc.file_name}</p>
                                <p className="text-xs text-slate-500">{doc.document_type} - {(doc.file_size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4 mr-1" /> Ver</a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm py-4">No hay documentos cargados para esta propiedad</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Selecciona una propiedad para gestionar documentos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
