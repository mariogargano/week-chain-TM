"use client"

import type React from "react"

import { useRef } from "react"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Upload, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  User,
  FileText,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Phone,
  Mail,
  MapPin,
  Save,
  X,
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  date_of_birth?: string
  nationality?: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_country?: string
  id_type?: string
  id_number?: string
  id_front_url?: string
  id_back_url?: string
  selfie_url?: string
  proof_of_address_url?: string
  curp?: string
  rfc?: string
  occupation?: string
  bio?: string
  social_facebook?: string
  social_instagram?: string
  social_linkedin?: string
  social_twitter?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  profile_completed?: boolean
  referral_code?: string
  verification_status?: string
  [key: string]: any
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const router = useRouter()
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadField, setActiveUploadField] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }
      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error) throw error
      if (data) setProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Error al cargar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev) => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
    setHasChanges(true)
  }

  const uploadFile = async (file: File, field: string) => {
    if (!profile?.id) return

    setUploading(field)
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase()
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp", "pdf"]

      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        toast.error("Tipo de archivo no permitido. Use JPG, PNG, GIF, WEBP o PDF")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es muy grande. Máximo 5MB")
        return
      }

      // Use user's ID as folder for proper RLS
      const fileName = `${profile.id}/${field}-${Date.now()}.${fileExt}`

      console.log("[v0] Uploading file:", fileName, "to bucket: images")

      const { error: uploadError, data: uploadData } = await supabase.storage.from("images").upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })

      if (uploadError) {
        console.error("[v0] Upload error:", uploadError)
        throw uploadError
      }

      console.log("[v0] Upload success:", uploadData)

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName)

      console.log("[v0] Public URL:", publicUrl)

      // Update profile with new URL
      setProfile((prev) => (prev ? { ...prev, [field]: publicUrl } : null))
      setHasChanges(true)
      toast.success("Archivo subido correctamente")
    } catch (error: any) {
      console.error("[v0] Upload error details:", error)
      toast.error(error.message || "Error al subir el archivo")
    } finally {
      setUploading(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file, field)
    }
    // Reset input
    e.target.value = ""
  }

  const triggerFileInput = (field: string) => {
    setActiveUploadField(field)
    fileInputRef.current?.click()
  }

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      // Calculate profile completion
      const requiredFields = [
        "full_name",
        "phone",
        "date_of_birth",
        "address_street",
        "address_city",
        "address_state",
        "address_country",
      ]
      const docFields = ["id_front_url", "selfie_url"]
      const allFields = [...requiredFields, ...docFields]
      const completedFields = allFields.filter((f) => profile[f as keyof UserProfile])
      const isComplete = completedFields.length === allFields.length

      const updateData = {
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        date_of_birth: profile.date_of_birth || null,
        nationality: profile.nationality,
        address_street: profile.address_street,
        address_city: profile.address_city,
        address_state: profile.address_state,
        address_zip: profile.address_zip,
        address_country: profile.address_country,
        id_type: profile.id_type,
        id_number: profile.id_number,
        id_front_url: profile.id_front_url,
        id_back_url: profile.id_back_url,
        selfie_url: profile.selfie_url,
        proof_of_address_url: profile.proof_of_address_url,
        curp: profile.curp,
        rfc: profile.rfc,
        occupation: profile.occupation,
        bio: profile.bio,
        social_facebook: profile.social_facebook,
        social_instagram: profile.social_instagram,
        social_linkedin: profile.social_linkedin,
        social_twitter: profile.social_twitter,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        profile_completed: isComplete,
        profile_completed_at: isComplete ? new Date().toISOString() : null,
        verification_status: profile.id_front_url && profile.selfie_url ? "in_review" : "pending",
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("users").update(updateData).eq("id", profile.id)

      if (error) throw error

      setHasChanges(false)
      toast.success("Perfil guardado correctamente")

      if (isComplete && profile.verification_status === "pending") {
        toast.info("Tus documentos están en revisión")
      }
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error(error.message || "Error al guardar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const getProfileCompletion = () => {
    if (!profile) return 0
    const fields = [
      "full_name",
      "phone",
      "date_of_birth",
      "address_street",
      "address_city",
      "address_state",
      "id_front_url",
      "selfie_url",
    ]
    const completed = fields.filter((f) => profile[f as keyof UserProfile]).length
    return Math.round((completed / fields.length) * 100)
  }

  const getVerificationBadge = () => {
    switch (profile?.verification_status) {
      case "verified":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verificado
          </Badge>
        )
      case "in_review":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" /> En Revisión
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500">
            <X className="h-3 w-3 mr-1" /> Rechazado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" /> Pendiente
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const completion = getProfileCompletion()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => {
          if (activeUploadField) {
            handleFileSelect(e, activeUploadField)
          }
        }}
      />

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/member">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Mi Perfil</h1>
              <p className="text-sm text-muted-foreground">Completa tu información personal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getVerificationBadge()}
            <Button onClick={saveProfile} disabled={saving || !hasChanges}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile completion banner */}
        {completion < 100 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Completa tu perfil</span>
                </div>
                <span className="text-sm font-medium text-yellow-700">{completion}%</span>
              </div>
              <Progress value={completion} className="h-2" />
              <p className="text-sm text-yellow-700 mt-2">
                Completa tu perfil para acceder a todas las funcionalidades y verificar tu identidad.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={() => triggerFileInput("avatar_url")}
                  disabled={uploading === "avatar_url"}
                >
                  {uploading === "avatar_url" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{profile?.full_name || "Sin nombre"}</h2>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Mail className="h-4 w-4" /> {profile?.email}
                </p>
                {profile?.phone && (
                  <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="h-4 w-4" /> {profile.phone}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="outline" className="font-mono">
                    {profile?.referral_code}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Datos Personales</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentos</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Redes Sociales</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Data Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>Tu información básica de contacto</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    value={profile?.full_name || ""}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={profile?.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+52 555 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Fecha de Nacimiento *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile?.date_of_birth || ""}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidad</Label>
                  <Input
                    id="nationality"
                    value={profile?.nationality || ""}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    placeholder="Mexicana"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Ocupación</Label>
                  <Input
                    id="occupation"
                    value={profile?.occupation || ""}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    placeholder="Empresario, Ingeniero, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curp">CURP</Label>
                  <Input
                    id="curp"
                    value={profile?.curp || ""}
                    onChange={(e) => handleInputChange("curp", e.target.value.toUpperCase())}
                    placeholder="XXXX000000XXXXXX00"
                    maxLength={18}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={profile?.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección
                </CardTitle>
                <CardDescription>Tu dirección de residencia</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address_street">Calle y Número *</Label>
                  <Input
                    id="address_street"
                    value={profile?.address_street || ""}
                    onChange={(e) => handleInputChange("address_street", e.target.value)}
                    placeholder="Av. Reforma 123, Col. Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_city">Ciudad *</Label>
                  <Input
                    id="address_city"
                    value={profile?.address_city || ""}
                    onChange={(e) => handleInputChange("address_city", e.target.value)}
                    placeholder="Ciudad de México"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">Estado *</Label>
                  <Input
                    id="address_state"
                    value={profile?.address_state || ""}
                    onChange={(e) => handleInputChange("address_state", e.target.value)}
                    placeholder="CDMX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_zip">Código Postal</Label>
                  <Input
                    id="address_zip"
                    value={profile?.address_zip || ""}
                    onChange={(e) => handleInputChange("address_zip", e.target.value)}
                    placeholder="06600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_country">País *</Label>
                  <Input
                    id="address_country"
                    value={profile?.address_country || "México"}
                    onChange={(e) => handleInputChange("address_country", e.target.value)}
                    placeholder="México"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contacto de Emergencia
                </CardTitle>
                <CardDescription>Persona a contactar en caso de emergencia</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Nombre</Label>
                  <Input
                    id="emergency_contact_name"
                    value={profile?.emergency_contact_name || ""}
                    onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={profile?.emergency_contact_phone || ""}
                    onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                    placeholder="+52 555 123 4567"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verificación de Identidad
                </CardTitle>
                <CardDescription>
                  Sube tus documentos para verificar tu identidad. Esto es necesario para realizar transacciones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID Type Selection */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo de Identificación *</Label>
                    <Select
                      value={profile?.id_type || ""}
                      onValueChange={(value) => handleInputChange("id_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de ID" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ine">INE / IFE</SelectItem>
                        <SelectItem value="passport">Pasaporte</SelectItem>
                        <SelectItem value="license">Licencia de Conducir</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_number">Número de Identificación</Label>
                    <Input
                      id="id_number"
                      value={profile?.id_number || ""}
                      onChange={(e) => handleInputChange("id_number", e.target.value)}
                      placeholder="Número de tu ID"
                    />
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* ID Front */}
                  <div className="space-y-3">
                    <Label>Frente de Identificación *</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        profile?.id_front_url
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 hover:border-primary hover:bg-gray-50"
                      }`}
                      onClick={() => triggerFileInput("id_front_url")}
                    >
                      {profile?.id_front_url ? (
                        <div className="space-y-2">
                          <img
                            src={profile.id_front_url || "/placeholder.svg"}
                            alt="ID Front"
                            className="max-h-32 mx-auto rounded"
                          />
                          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Documento cargado
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          {uploading === "id_front_url" ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          )}
                          <p className="text-sm text-gray-500">Haz clic para subir</p>
                          <p className="text-xs text-gray-400">JPG, PNG o PDF hasta 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ID Back */}
                  <div className="space-y-3">
                    <Label>Reverso de Identificación</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        profile?.id_back_url
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 hover:border-primary hover:bg-gray-50"
                      }`}
                      onClick={() => triggerFileInput("id_back_url")}
                    >
                      {profile?.id_back_url ? (
                        <div className="space-y-2">
                          <img
                            src={profile.id_back_url || "/placeholder.svg"}
                            alt="ID Back"
                            className="max-h-32 mx-auto rounded"
                          />
                          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Documento cargado
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          {uploading === "id_back_url" ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          )}
                          <p className="text-sm text-gray-500">Haz clic para subir</p>
                          <p className="text-xs text-gray-400">JPG, PNG o PDF hasta 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selfie with ID */}
                  <div className="space-y-3">
                    <Label>Selfie con Identificación *</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        profile?.selfie_url
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 hover:border-primary hover:bg-gray-50"
                      }`}
                      onClick={() => triggerFileInput("selfie_url")}
                    >
                      {profile?.selfie_url ? (
                        <div className="space-y-2">
                          <img
                            src={profile.selfie_url || "/placeholder.svg"}
                            alt="Selfie"
                            className="max-h-32 mx-auto rounded"
                          />
                          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Foto cargada
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          {uploading === "selfie_url" ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                          ) : (
                            <Camera className="h-8 w-8 mx-auto text-gray-400" />
                          )}
                          <p className="text-sm text-gray-500">Selfie sosteniendo tu ID</p>
                          <p className="text-xs text-gray-400">Asegúrate de que ambos sean visibles</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proof of Address */}
                  <div className="space-y-3">
                    <Label>Comprobante de Domicilio</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        profile?.proof_of_address_url
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 hover:border-primary hover:bg-gray-50"
                      }`}
                      onClick={() => triggerFileInput("proof_of_address_url")}
                    >
                      {profile?.proof_of_address_url ? (
                        <div className="space-y-2">
                          <img
                            src={profile.proof_of_address_url || "/placeholder.svg"}
                            alt="Proof"
                            className="max-h-32 mx-auto rounded"
                          />
                          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Documento cargado
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          {uploading === "proof_of_address_url" ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                          ) : (
                            <FileText className="h-8 w-8 mx-auto text-gray-400" />
                          )}
                          <p className="text-sm text-gray-500">Recibo de luz, agua o teléfono</p>
                          <p className="text-xs text-gray-400">No mayor a 3 meses</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Status Info */}
                <div
                  className={`p-4 rounded-lg ${
                    profile?.verification_status === "verified"
                      ? "bg-green-50 border border-green-200"
                      : profile?.verification_status === "in_review"
                        ? "bg-yellow-50 border border-yellow-200"
                        : profile?.verification_status === "rejected"
                          ? "bg-red-50 border border-red-200"
                          : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {profile?.verification_status === "verified" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : profile?.verification_status === "in_review" ? (
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    ) : profile?.verification_status === "rejected" ? (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : (
                      <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {profile?.verification_status === "verified"
                          ? "Identidad Verificada"
                          : profile?.verification_status === "in_review"
                            ? "Documentos en Revisión"
                            : profile?.verification_status === "rejected"
                              ? "Verificación Rechazada"
                              : "Verificación Pendiente"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.verification_status === "verified"
                          ? "Tu identidad ha sido verificada exitosamente."
                          : profile?.verification_status === "in_review"
                            ? "Estamos revisando tus documentos. Esto puede tomar 24-48 horas."
                            : profile?.verification_status === "rejected"
                              ? "Por favor, sube nuevos documentos siguiendo las instrucciones."
                              : "Sube tus documentos para verificar tu identidad."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Redes Sociales
                </CardTitle>
                <CardDescription>Conecta tus perfiles de redes sociales (opcional)</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="social_facebook">Facebook</Label>
                  <Input
                    id="social_facebook"
                    value={profile?.social_facebook || ""}
                    onChange={(e) => handleInputChange("social_facebook", e.target.value)}
                    placeholder="https://facebook.com/tu-perfil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_instagram">Instagram</Label>
                  <Input
                    id="social_instagram"
                    value={profile?.social_instagram || ""}
                    onChange={(e) => handleInputChange("social_instagram", e.target.value)}
                    placeholder="@tu_usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_linkedin">LinkedIn</Label>
                  <Input
                    id="social_linkedin"
                    value={profile?.social_linkedin || ""}
                    onChange={(e) => handleInputChange("social_linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_twitter">Twitter / X</Label>
                  <Input
                    id="social_twitter"
                    value={profile?.social_twitter || ""}
                    onChange={(e) => handleInputChange("social_twitter", e.target.value)}
                    placeholder="@tu_usuario"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
