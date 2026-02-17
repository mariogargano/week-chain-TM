"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Building2, CreditCard, CheckCircle, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OwnerProfilePage() {
  return (
    <RoleGuard allowedRoles={["property_owner", "admin"]}>
      <OwnerProfileContent />
    </RoleGuard>
  )
}

function OwnerProfileContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>({
    company_name: "",
    tax_id: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    bank_name: "",
    bank_account_number: "",
    bank_routing_number: "",
    virtual_office_enabled: false,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase.from("property_owner_profiles").select("*").eq("user_id", user.id).single()

    if (!error && data) {
      setProfile(data)
    } else if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create it
      await supabase.from("property_owner_profiles").insert({ user_id: user.id })
    }

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev: any) => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("property_owner_profiles").update(profile).eq("user_id", user.id)

    setSaving(false)

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el perfil", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Perfil actualizado correctamente" })
    }
  }

  const enableVirtualOffice = async () => {
    setSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("property_owner_profiles")
      .update({ virtual_office_enabled: true })
      .eq("user_id", user.id)

    setSaving(false)

    if (error) {
      toast({ title: "Error", description: "No se pudo activar la oficina virtual", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Oficina virtual activada" })
      setProfile((prev: any) => ({ ...prev, virtual_office_enabled: true }))
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </>
    )
  }

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
                Mi Perfil
              </h1>
              <p className="text-slate-600">Gestiona tu información personal y bancaria</p>
            </div>
          </div>

          {/* Company Information */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-500" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nombre de la Empresa</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={profile.company_name || ""}
                    onChange={handleInputChange}
                    placeholder="Mi Empresa S.A."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_id">RFC / Tax ID</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    value={profile.tax_id || ""}
                    onChange={handleInputChange}
                    placeholder="ABC123456XYZ"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleInputChange}
                  placeholder="+52 984 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={profile.address || ""}
                  onChange={handleInputChange}
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    name="city"
                    value={profile.city || ""}
                    onChange={handleInputChange}
                    placeholder="Cancún"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    value={profile.state || ""}
                    onChange={handleInputChange}
                    placeholder="Quintana Roo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Código Postal</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={profile.postal_code || ""}
                    onChange={handleInputChange}
                    placeholder="77500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  value={profile.country || ""}
                  onChange={handleInputChange}
                  placeholder="México"
                />
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Información Bancaria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  Esta información es necesaria para recibir los pagos de tus ventas. Todos los datos están encriptados
                  y seguros.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  value={profile.bank_name || ""}
                  onChange={handleInputChange}
                  placeholder="BBVA, Santander, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Número de Cuenta</Label>
                <Input
                  id="bank_account_number"
                  name="bank_account_number"
                  type="password"
                  value={profile.bank_account_number || ""}
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_routing_number">CLABE Interbancaria</Label>
                <Input
                  id="bank_routing_number"
                  name="bank_routing_number"
                  value={profile.bank_routing_number || ""}
                  onChange={handleInputChange}
                  placeholder="012345678901234567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Virtual Office */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Oficina Virtual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.virtual_office_enabled ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-900">Oficina Virtual Activada</p>
                      <p className="text-sm text-green-700">Tienes acceso completo a la oficina virtual</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/virtual-office")}
                    className="border-green-500 text-green-700 hover:bg-green-50"
                  >
                    Acceder
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">¿Qué es la Oficina Virtual?</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      La Oficina Virtual te da acceso a herramientas exclusivas para gestionar tus propiedades,
                      comunicarte con el equipo, y acceder a recursos adicionales.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      <li>Comunicación directa con el equipo</li>
                      <li>Acceso a documentos y recursos</li>
                      <li>Soporte prioritario</li>
                      <li>Reportes avanzados</li>
                    </ul>
                  </div>
                  <Button
                    onClick={enableVirtualOffice}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {saving ? "Activando..." : "Activar Oficina Virtual"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={saveProfile}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </>
  )
}
