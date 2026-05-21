"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Share2, CheckCircle, Loader2, ArrowRight } from "lucide-react"

export default function IntermediaryOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company_name: "",
    tax_id: "",
    address: "",
    city: "",
    state: "",
    country: "Mexico",
    experience_years: "",
    motivation: "",
    accept_terms: false,
    accept_commission_policy: false,
  })

  const generateReferralCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = "WC"
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }

      // Check if already registered
      const { data: existing } = await supabase
        .from("intermediary_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (existing) {
        router.push("/dashboard/intermediary")
        return
      }

      // Generate unique referral code
      let referralCode = generateReferralCode()
      let codeExists = true
      let attempts = 0

      while (codeExists && attempts < 10) {
        const { data: codeCheck } = await supabase
          .from("intermediary_profiles")
          .select("id")
          .eq("referral_code", referralCode)
          .maybeSingle()
        
        if (!codeCheck) {
          codeExists = false
        } else {
          referralCode = generateReferralCode()
          attempts++
        }
      }

      // Create intermediary profile
      const { error: insertError } = await supabase.from("intermediary_profiles").insert({
        user_id: user.id,
        email: user.email,
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: formData.company_name || null,
        tax_id: formData.tax_id || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        referral_code: referralCode,
        status: "pending_kyc",
        kyc_status: "pending",
        commission_rate: 0.04, // 4%
        experience_years: parseInt(formData.experience_years) || 0,
        motivation: formData.motivation,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("[v0] Error creating intermediary profile:", insertError)
        setError(insertError.message)
        return
      }

      // Update user role
      await supabase.from("users").update({ 
        role: "intermediary",
        is_intermediary: true 
      }).eq("id", user.id)

      router.push("/dashboard/intermediary")
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      setError("Error inesperado. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Programa de Agentes
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">
            Conviertete en Agente WEEK-CHAIN
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Gana comisiones del 4% por cada certificado vendido a traves de tu link de referido
          </p>
        </div>

        {/* Benefits */}
        {step === 1 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <Share2 className="h-10 w-10 text-blue-400 mb-2" />
                <CardTitle>Link Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Recibe tu link unico de referido para compartir con clientes potenciales
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-emerald-400 mb-2" />
                <CardTitle>4% Comision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Gana 4% del valor de cada certificado vendido a traves de tu referido
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <Users className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle>Dashboard Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Monitorea leads, ventas y comisiones en tiempo real desde tu panel
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form */}
        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Informacion Personal"}
              {step === 2 && "Informacion de Negocio"}
              {step === 3 && "Terminos y Condiciones"}
            </CardTitle>
            <CardDescription>
              Paso {step} de 3
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Juan Perez Garcia"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+52 55 1234 5678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Direccion *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle, Numero, Colonia"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ciudad de Mexico"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="CDMX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pais</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Mexico"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => setStep(2)}
                  disabled={!formData.full_name || !formData.phone || !formData.city}
                >
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nombre de Empresa (opcional)</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Mi Agencia de Viajes SA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_id">RFC (opcional)</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      placeholder="XAXX010101000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience_years">Anos de Experiencia en Ventas</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">Por que quieres ser agente WEEK-CHAIN?</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Cuentanos sobre tu experiencia y motivacion..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Atras
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold">Resumen de Comisiones</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      Comision del 4% sobre el valor del certificado vendido
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      Periodo de retencion de 14 dias (ventana de devolucion)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      Pago quincenal (dias 1 y 15 del mes)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      Requiere KYC aprobado para liberar pagos
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      Self-referral prohibido (no puedes ganar comision comprando con tu propio codigo)
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="accept_terms"
                      checked={formData.accept_terms}
                      onCheckedChange={(checked) => setFormData({ ...formData, accept_terms: checked as boolean })}
                    />
                    <Label htmlFor="accept_terms" className="text-sm leading-relaxed">
                      Acepto los <a href="/legal/terms" className="text-blue-600 underline">Terminos y Condiciones</a> del programa de agentes WEEK-CHAIN
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="accept_commission_policy"
                      checked={formData.accept_commission_policy}
                      onCheckedChange={(checked) => setFormData({ ...formData, accept_commission_policy: checked as boolean })}
                    />
                    <Label htmlFor="accept_commission_policy" className="text-sm leading-relaxed">
                      Entiendo y acepto la politica de comisiones y pagos descrita arriba
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Atras
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                    onClick={handleSubmit}
                    disabled={loading || !formData.accept_terms || !formData.accept_commission_policy}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Activar Mi Cuenta de Agente
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
