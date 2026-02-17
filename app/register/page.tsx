"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  Gift,
  Shield,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

function RegisterRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const refCode = searchParams.get("ref")

  useEffect(() => {
    // Redirect to auth page with ref parameter preserved
    if (refCode) {
      router.replace(`/auth?ref=${refCode}`)
    } else {
      router.replace("/auth")
    }
  }, [refCode, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto mb-4" />
        <p className="text-white">Redirigiendo...</p>
      </div>
    </div>
  )
}

export default function ReferralRegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const refCode = searchParams.get("ref")

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [referrerName, setReferrerName] = useState<string | null>(null)
  const [referrerId, setReferrerId] = useState<string | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    accountType: "individual" as "individual" | "company",
    companyName: "",
    companyRfc: "",
    termsAccepted: false,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Fetch referrer info
  useEffect(() => {
    const fetchReferrer = async () => {
      if (!refCode) return

      const { data, error } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("referral_code", refCode.toUpperCase())
        .single()

      if (data && !error) {
        setReferrerName(data.full_name)
        setReferrerId(data.id)
      }
    }

    fetchReferrer()
  }, [refCode, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.termsAccepted) {
      toast.error("Debes aceptar los términos y condiciones")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard/member`,
          data: {
            full_name: formData.fullName,
            referred_by: referrerId,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Generate unique referral code for new user
        const newReferralCode = `WC${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        // 3. Create user profile in public.users
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          account_type: formData.accountType,
          company_name: formData.accountType === "company" ? formData.companyName : null,
          company_rfc: formData.accountType === "company" ? formData.companyRfc : null,
          role: "user",
          broker_level: "entry",
          referral_code: newReferralCode,
          referred_by: referrerId,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          member_since: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }

        // 4. Update referrer's total_referrals count
        if (referrerId) {
          await supabase.rpc("increment_referrals", { user_id: referrerId })
        }

        setRegistrationComplete(true)
        toast.success("Cuenta creada exitosamente")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      toast.error(error.message || "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  // Success screen after registration
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Registro Exitoso</h1>
            <p className="text-slate-400 mb-6">
              Hemos enviado un correo de confirmación a <span className="text-white">{formData.email}</span>. Por favor,
              verifica tu correo para activar tu cuenta.
            </p>
            <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-300">
                Una vez verificado, podrás acceder a tu dashboard y comenzar a explorar las propiedades disponibles.
              </p>
            </div>
            <Button
              onClick={() => router.push("/auth")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        {/* Minimal header - NO navigation */}
        <div className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-2xl font-bold text-white tracking-tight">
              WEEK-CHAIN<sup className="text-xs">™</sup>
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Benefits */}
            <div className="hidden lg:block space-y-8">
              {/* Referrer badge */}
              {referrerName && (
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Invitación Especial</span>
                  </div>
                  <p className="text-white text-lg">
                    <span className="font-bold">{referrerName}</span> te ha invitado a unirte a WEEK-CHAIN
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Código de referido: <span className="text-emerald-400 font-mono">{refCode?.toUpperCase()}</span>
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">
                  Únete a la revolución del <span className="text-emerald-400">timeshare digital</span>
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Sistema Certificado</h3>
                      <p className="text-slate-400 text-sm">
                        Certificados digitales con respaldo legal NOM-151 y contratos de adhesión registrados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Gana Comisiones</h3>
                      <p className="text-slate-400 text-sm">
                        Refiere amigos y gana hasta 6% en comisiones por cada venta
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Beneficios Exclusivos</h3>
                      <p className="text-slate-400 text-sm">Accede a semanas de cortesía y beneficios según tu nivel</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Registro gratuito</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sin compromisos</span>
                </div>
              </div>
            </div>

            {/* Right side - Registration form */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
              {/* Mobile referrer badge */}
              {referrerName && (
                <div className="lg:hidden bg-emerald-500/10 rounded-xl p-4 mb-6 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Gift className="w-4 h-4" />
                    <span>
                      Invitado por <strong>{referrerName}</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h1>
                <p className="text-slate-400">Completa tus datos para comenzar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Type */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Tipo de Cuenta</Label>
                  <RadioGroup
                    value={formData.accountType}
                    onValueChange={(value: "individual" | "company") =>
                      setFormData((prev) => ({ ...prev, accountType: value }))
                    }
                    className="grid grid-cols-2 gap-3"
                  >
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.accountType === "individual"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <RadioGroupItem value="individual" id="individual" className="sr-only" />
                      <User
                        className={`w-5 h-5 ${formData.accountType === "individual" ? "text-emerald-400" : "text-slate-400"}`}
                      />
                      <Label htmlFor="individual" className="cursor-pointer text-white text-sm">
                        Individual
                      </Label>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.accountType === "company"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <RadioGroupItem value="company" id="company" className="sr-only" />
                      <Building2
                        className={`w-5 h-5 ${formData.accountType === "company" ? "text-emerald-400" : "text-slate-400"}`}
                      />
                      <Label htmlFor="company" className="cursor-pointer text-white text-sm">
                        Empresa
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-300">
                    {formData.accountType === "company" ? "Nombre del Representante" : "Nombre Completo"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Company fields */}
                {formData.accountType === "company" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-slate-300">
                        Nombre de la Empresa
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Razón social"
                          required
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyRfc" className="text-slate-300">
                        RFC
                      </Label>
                      <Input
                        id="companyRfc"
                        name="companyRfc"
                        value={formData.companyRfc}
                        onChange={handleInputChange}
                        placeholder="RFC de la empresa"
                        required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">
                    Teléfono
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+52 55 1234 5678"
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Repite tu contraseña"
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Terms - High contrast checkbox */}
                <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, termsAccepted: checked as boolean }))
                    }
                    className="mt-0.5 border-2 border-slate-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <Label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer leading-relaxed">
                    Acepto los{" "}
                    <Link href="/terms" target="_blank" className="text-emerald-400 hover:underline">
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" target="_blank" className="text-emerald-400 hover:underline">
                      Política de Privacidad
                    </Link>
                  </Label>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading || !formData.termsAccepted}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Mi Cuenta"
                  )}
                </Button>
              </form>

              {/* Login link - only option to leave */}
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/auth" className="text-emerald-400 hover:underline font-medium">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - minimal */}
        <div className="p-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} WEEK-CHAIN™. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </Suspense>
  )
}
