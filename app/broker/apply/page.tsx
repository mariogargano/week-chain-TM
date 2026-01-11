"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { User, Building2, ArrowLeft, AlertTriangle, CreditCard, Mail, Phone, MapPin, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { QRCodeSVG } from "qrcode.react"

const countries = [
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "NL", name: "Países Bajos", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪" },
  { code: "CH", name: "Suiza", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "SE", name: "Suecia", flag: "🇸🇪" },
  { code: "NO", name: "Noruega", flag: "🇳🇴" },
  { code: "DK", name: "Dinamarca", flag: "🇩🇰" },
  { code: "FI", name: "Finlandia", flag: "🇫🇮" },
  { code: "PL", name: "Polonia", flag: "🇵🇱" },
  { code: "CZ", name: "República Checa", flag: "🇨🇿" },
  { code: "GR", name: "Grecia", flag: "🇬🇷" },
  { code: "IE", name: "Irlanda", flag: "🇮🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "Nueva Zelanda", flag: "🇳🇿" },
  { code: "JP", name: "Japón", flag: "🇯🇵" },
  { code: "KR", name: "Corea del Sur", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "SG", name: "Singapur", flag: "🇸🇬" },
  { code: "AE", name: "Emiratos Árabes Unidos", flag: "🇦🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "ZA", name: "Sudáfrica", flag: "🇿🇦" },
  { code: "OTHER", name: "Otro país", flag: "🌍" },
]

function BrokerCardPreview({
  brokerType,
  formData,
}: {
  brokerType: "individual" | "company"
  formData: Record<string, string>
}) {
  const displayName =
    brokerType === "individual"
      ? `${formData.firstName || "Tu Nombre"} ${formData.lastName || "Apellido"}`
      : formData.companyName || "Nombre de Empresa"

  const email = brokerType === "individual" ? formData.email : formData.legalRepEmail
  const phone = brokerType === "individual" ? formData.phone : formData.companyPhone
  const countryCode = brokerType === "individual" ? formData.country : formData.companyCountry
  const city = brokerType === "individual" ? formData.city : formData.companyCity
  const country = countries.find((c) => c.code === countryCode) || countries[0]

  const previewCode =
    displayName !== "Tu Nombre Apellido" && displayName !== "Nombre de Empresa"
      ? displayName.split(" ")[0].toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 6).toUpperCase()
      : "TUCODIGO"

  return (
    <div className="sticky top-24">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Vista Previa de tu Tarjeta</h3>
        <p className="text-sm text-slate-500">Así se verá tu tarjeta digital WEEK-CHAIN™</p>
      </div>

      {/* Card Preview - Dark accent style */}
      <div className="relative mx-auto" style={{ maxWidth: "340px" }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF9AA2] to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#C7CEEA] to-transparent rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Header with Logo and Flag */}
          <div className="relative flex items-center justify-between mb-6">
            <div>
              <div className="text-xl font-bold text-white tracking-tight">
                WEEK-CHAIN<span className="text-[#FF9AA2] text-xs align-super">™</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Intermediario Autorizado</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{country.flag}</span>
            </div>
          </div>

          {/* Name and Type */}
          <div className="relative mb-6">
            <div className="text-xl font-semibold text-white truncate">{displayName}</div>
            <div className="flex items-center gap-2 mt-1">
              {brokerType === "company" ? (
                <Building2 className="h-3.5 w-3.5 text-[#C7CEEA]" />
              ) : (
                <User className="h-3.5 w-3.5 text-[#FF9AA2]" />
              )}
              <span className="text-xs text-slate-400">
                {brokerType === "company" ? "Agencia / Empresa" : "Intermediario Individual"}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="relative space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              <span className="truncate">{email || "tu@email.com"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              <span>{phone || "+XX XXX XXX XXXX"}</span>
            </div>
            {city && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {city}, {country.name}
                </span>
              </div>
            )}
          </div>

          {/* QR Code and Referral */}
          <div className="relative flex items-end justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Código de Referido</div>
              <div className="font-mono text-lg font-bold text-[#FF9AA2]">{previewCode}</div>
            </div>
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG
                value={`https://week-chain.com/ref/${previewCode}`}
                size={64}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA]" />
        </div>
      </div>

      <p className="text-xs text-center text-slate-400 mt-4">
        * Tu tarjeta se generará automáticamente al completar el registro
      </p>
    </div>
  )
}

function BrokerApplyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const referralCode = searchParams.get("ref") || ""

  const [brokerType, setBrokerType] = useState<"individual" | "company">("individual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "MX",
    city: "",
    state: "",
    idType: "",
    idNumber: "",
    taxId: "",
    experience: "",
    motivation: "",
    companyName: "",
    companyTaxId: "",
    companyCountry: "MX",
    companyCity: "",
    companyState: "",
    companyAddress: "",
    companyPhone: "",
    legalRepName: "",
    legalRepEmail: "",
    legalRepPhone: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptCommercial: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const supabase = createClient()

      const email = brokerType === "individual" ? formData.email : formData.legalRepEmail

      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin}/broker/complete-registration`,
          data: {
            broker_type: brokerType,
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.companyName,
            referral_code: referralCode,
          },
        },
      })

      if (signUpError) throw signUpError

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="max-w-md w-full border-0 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B5EAD7] to-[#E2F0CB] flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-slate-800" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">¡Revisa tu Correo!</h2>
              <p className="text-slate-600 mb-6">
                Hemos enviado un enlace de verificación a tu correo electrónico. Haz clic en el enlace para completar tu
                registro y crear tu contraseña.
              </p>
              <div className="p-4 bg-[#B5EAD7]/20 rounded-xl border border-[#B5EAD7]/30">
                <p className="text-sm text-slate-600">
                  <strong>Tip:</strong> Revisa tu carpeta de spam si no ves el correo en tu bandeja de entrada.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        {/* removed Footer component - already in global layout */}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="px-4 py-12 bg-gradient-to-br from-white via-[#FF9AA2]/5 to-[#C7CEEA]/10">
          <div className="container mx-auto max-w-6xl">
            <Link
              href="/broker-programa"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al programa
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-[#FF9AA2]/20 text-[#FF9AA2] border-[#FF9AA2]/30">
                <Sparkles className="h-4 w-4 mr-2" />
                Registro de Intermediario
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Únete al Equipo WEEK-CHAIN<span className="text-[#FF9AA2]">™</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Completa el formulario para convertirte en intermediario autorizado y recibir tu tarjeta digital
              personalizada.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Broker Type Selection */}
                  <div>
                    <Label className="text-base font-semibold text-slate-900 mb-4 block">Tipo de Registro</Label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setBrokerType("individual")}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          brokerType === "individual"
                            ? "border-[#FF9AA2] bg-[#FF9AA2]/5"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <User
                          className={`h-8 w-8 mb-3 ${brokerType === "individual" ? "text-[#FF9AA2]" : "text-slate-400"}`}
                        />
                        <div className="font-semibold text-slate-900">Persona Física</div>
                        <div className="text-sm text-slate-500 mt-1">Intermediario individual</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrokerType("company")}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          brokerType === "company"
                            ? "border-[#C7CEEA] bg-[#C7CEEA]/5"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Building2
                          className={`h-8 w-8 mb-3 ${brokerType === "company" ? "text-[#C7CEEA]" : "text-slate-400"}`}
                        />
                        <div className="font-semibold text-slate-900">Persona Moral</div>
                        <div className="text-sm text-slate-500 mt-1">Agencia o empresa</div>
                      </button>
                    </div>
                  </div>

                  {brokerType === "individual" ? (
                    <>
                      {/* Personal Info */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <User className="h-5 w-5 text-[#FF9AA2]" />
                          Información Personal
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Nombre(s) *</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Apellidos *</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Teléfono *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="country">País *</Label>
                            <Select value={formData.country} onValueChange={(v) => handleInputChange("country", v)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="state">Estado/Provincia *</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => handleInputChange("state", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">Ciudad *</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange("city", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">Experiencia (Opcional)</h3>
                        <div>
                          <Label htmlFor="experience">Experiencia en ventas o turismo</Label>
                          <Textarea
                            id="experience"
                            value={formData.experience}
                            onChange={(e) => handleInputChange("experience", e.target.value)}
                            placeholder="Cuéntanos sobre tu experiencia previa..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Company Info */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-[#C7CEEA]" />
                          Información de la Empresa
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor="companyName">Razón Social *</Label>
                            <Input
                              id="companyName"
                              value={formData.companyName}
                              onChange={(e) => handleInputChange("companyName", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyTaxId">ID Fiscal / RFC</Label>
                            <Input
                              id="companyTaxId"
                              value={formData.companyTaxId}
                              onChange={(e) => handleInputChange("companyTaxId", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyPhone">Teléfono de la Empresa *</Label>
                            <Input
                              id="companyPhone"
                              type="tel"
                              value={formData.companyPhone}
                              onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="companyCountry">País *</Label>
                            <Select
                              value={formData.companyCountry}
                              onValueChange={(v) => handleInputChange("companyCountry", v)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="companyState">Estado/Provincia *</Label>
                            <Input
                              id="companyState"
                              value={formData.companyState}
                              onChange={(e) => handleInputChange("companyState", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyCity">Ciudad *</Label>
                            <Input
                              id="companyCity"
                              value={formData.companyCity}
                              onChange={(e) => handleInputChange("companyCity", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Legal Rep */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">Representante Legal</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor="legalRepName">Nombre Completo *</Label>
                            <Input
                              id="legalRepName"
                              value={formData.legalRepName}
                              onChange={(e) => handleInputChange("legalRepName", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="legalRepEmail">Email *</Label>
                            <Input
                              id="legalRepEmail"
                              type="email"
                              value={formData.legalRepEmail}
                              onChange={(e) => handleInputChange("legalRepEmail", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="legalRepPhone">Teléfono *</Label>
                            <Input
                              id="legalRepPhone"
                              type="tel"
                              value={formData.legalRepPhone}
                              onChange={(e) => handleInputChange("legalRepPhone", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Legal Checkboxes */}
                  <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms as unknown as boolean}
                        onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                        required
                      />
                      <Label htmlFor="acceptTerms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                        Acepto los{" "}
                        <Link
                          href="/broker/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF9AA2] hover:underline font-medium"
                        >
                          Términos y Condiciones del Programa de Intermediarios
                        </Link>{" "}
                        de WEEK-CHAIN™ *
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="acceptPrivacy"
                        checked={formData.acceptPrivacy as unknown as boolean}
                        onCheckedChange={(checked) => handleInputChange("acceptPrivacy", checked as boolean)}
                        required
                      />
                      <Label htmlFor="acceptPrivacy" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                        Acepto el{" "}
                        <Link
                          href="/broker/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF9AA2] hover:underline font-medium"
                        >
                          Aviso de Privacidad para Intermediarios
                        </Link>{" "}
                        y autorizo el tratamiento de mis datos personales conforme a la LFPDPPP *
                      </Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="acceptCommercial"
                        checked={formData.acceptCommercial as unknown as boolean}
                        onCheckedChange={(checked) => handleInputChange("acceptCommercial", checked as boolean)}
                      />
                      <Label
                        htmlFor="acceptCommercial"
                        className="text-sm text-slate-600 leading-relaxed cursor-pointer"
                      >
                        Acepto recibir comunicaciones comerciales, actualizaciones del programa y materiales
                        promocionales (opcional)
                      </Label>
                    </div>

                    {/* Additional legal notice */}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500">
                        Al enviar esta solicitud, declaro bajo protesta de decir verdad que la información proporcionada
                        es veraz y completa. Entiendo que WEEK-CHAIN™ verificará mis datos antes de aprobar mi registro
                        como intermediario.
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Aviso Legal:</strong> WEEK-CHAIN™ es un programa de intermediación comercial para la
                        promoción de servicios de tiempo compartido vacacional. Los honorarios se generan únicamente por
                        ventas efectivas. Este programa no constituye una oferta de empleo ni implica relación laboral.
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">{error}</div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !formData.acceptTerms || !formData.acceptPrivacy}
                    className="w-full h-14 text-lg bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white"
                  >
                    {isSubmitting ? (
                      "Procesando..."
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Reclama tu Tarjeta y Conviértete en Intermediario
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Card Preview */}
              <div className="lg:col-span-2">
                <BrokerCardPreview brokerType={brokerType} formData={formData} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* removed Footer component - already in global layout */}
    </div>
  )
}

export default function BrokerApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9AA2]"></div>
        </div>
      }
    >
      <BrokerApplyContent />
    </Suspense>
  )
}
