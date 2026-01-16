"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AlertCircle, Mail, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [hasAccepted, setHasAccepted] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"google" | null>(null)

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Register state
  const [registerName, setRegisterName] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [referrerName, setReferrerName] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams?.get("ref")
    if (ref) {
      setReferralCode(ref)
      fetchReferrerName(ref)
    }

    const errorMsg = searchParams?.get("error")
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
  }, [searchParams])

  const fetchReferrerName = async (code: string) => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from("users").select("full_name").eq("referral_code", code).single()

      if (data?.full_name) {
        setReferrerName(data.full_name)
      }
    } catch (error) {
      console.error("[v0] Error fetching referrer:", error)
    }
  }

  const handleGoogleLogin = async () => {
    if (hasAccepted === false) {
      setPendingAction("google")
      setShowTermsDialog(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting custom Google OAuth flow...")
      window.location.href = "/api/auth/google"
    } catch (error: any) {
      console.error("[v0] Google OAuth failed:", error)
      setError("Error al conectar con Google. Intenta nuevamente o usa email y contraseña.")
      toast.error("Error de autenticación con Google")
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login...")
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[v0] Login error:", error)
        throw error
      }

      if (data.user) {
        console.log("[v0] Login successful, fetching user role...")

        const { data: userData } = await supabase
          .from("users")
          .select("role, full_name")
          .eq("id", data.user.id)
          .single()

        const role = userData?.role || "user"
        console.log("[v0] User role:", role)

        let dashboardPath = "/dashboard/member"

        if (role === "admin" || role === "super_admin") {
          dashboardPath = "/dashboard/admin"
        } else if (role === "broker" || role === "broker_elite") {
          dashboardPath = "/dashboard/broker"
        } else if (role === "management") {
          dashboardPath = "/management"
        } else if (role === "notaria") {
          dashboardPath = "/notaria"
        } else if (role === "service_provider") {
          dashboardPath = "/dashboard/service-provider"
        } else if (role === "vafi_manager") {
          dashboardPath = "/dashboard/vafi"
        } else if (role === "dao_member") {
          dashboardPath = "/dashboard/dao"
        } else if (role === "property_owner") {
          dashboardPath = "/dashboard/owner"
        } else {
          dashboardPath = "/dashboard/member"
        }

        console.log("[v0] Redirecting to:", dashboardPath)
        router.push(dashboardPath)
        toast.success("¡Bienvenido de vuelta!")
      }
    } catch (error: any) {
      console.error("[v0] Login failed:", error)
      setError(error.message || "Error al iniciar sesión")
      toast.error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting registration...")
      const supabase = createClient()

      if (referralCode) {
        const { data: referrer } = await supabase.from("users").select("id").eq("referral_code", referralCode).single()

        if (!referrer) {
          throw new Error("Código de referido inválido")
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: registerName,
            phone: registerPhone,
            referral_code: referralCode,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("[v0] Registration error:", error)
        throw error
      }

      console.log("[v0] Registration successful")
      toast.success("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.")
      setActiveTab("login")
    } catch (error: any) {
      console.error("[v0] Registration failed:", error)
      setError(error.message || "Error al registrarse")
      toast.error(error.message || "Error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTermsAcceptance = () => {
    setHasAccepted(true)
    setShowTermsDialog(false)

    if (pendingAction === "google") {
      handleGoogleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image
            src="/logo.png"
            alt="WEEK-CHAIN Logo"
            width={64}
            height={64}
            className="rounded-full shadow-lg"
            priority
          />
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">WEEK-CHAIN™</h1>
            <p className="text-sm text-gray-600">Smart Vacational Certificate</p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-600">Accede a tus certificados vacacionales</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {referrerName && (
            <div className="mb-6 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800 text-center">
                <span className="font-semibold">{referrerName}</span> te ha invitado a unirte
              </p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "48px",
              marginBottom: "24px",
              padding: "12px 24px",
              backgroundColor: "#FFFFFF",
              border: "2px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#374151",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#F9FAFB"
                e.currentTarget.style.borderColor = "#D1D5DB"
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF"
              e.currentTarget.style.borderColor = "#E5E7EB"
            }}
          >
            <svg style={{ width: "20px", height: "20px", marginRight: "12px" }} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase tracking-wider">O CONTINÚA CON EMAIL</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              onClick={() => setActiveTab("login")}
              variant={activeTab === "login" ? "default" : "outline"}
              className={`flex-1 h-11 ${
                activeTab === "login"
                  ? "bg-[#ff9aa2] hover:bg-[#ffb7b2] text-white shadow-md"
                  : "border-2 hover:bg-gray-50"
              }`}
            >
              Iniciar Sesión
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab("register")}
              variant={activeTab === "register" ? "default" : "outline"}
              className={`flex-1 h-11 ${
                activeTab === "register" ? "bg-gray-800 hover:bg-gray-900 text-white" : "border-2 hover:bg-gray-50"
              }`}
            >
              Registrarse
            </Button>
          </div>

          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700">
                    Contraseña
                  </Label>
                  <button type="button" className="text-sm text-pink-600 hover:text-pink-700">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-gray-300"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#ff9aa2] hover:bg-[#ffb7b2] text-base font-semibold shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-gray-700">
                  Nombre completo
                </Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-gray-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone" className="text-gray-700">
                  Teléfono
                </Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="+52 123 456 7890"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-gray-700">
                  Contraseña
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="h-12 border-gray-300"
                />
              </div>

              {referralCode && (
                <div className="space-y-2">
                  <Label htmlFor="referral-code" className="text-gray-700">
                    Código de referido
                  </Label>
                  <Input
                    id="referral-code"
                    type="text"
                    value={referralCode}
                    disabled
                    className="h-12 bg-gray-50 border-gray-300"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {showTermsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-100">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[300px] overflow-y-auto">
              <div className="space-y-4 text-sm text-slate-700">
                <p className="font-semibold">
                  Para proteger tanto a usted como a WEEK-CHAIN, debe aceptar nuestros términos legales antes de
                  continuar con el inicio de sesión con Google.
                </p>

                <h3 className="font-semibold text-slate-900 mt-4">Términos Principales:</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Los certificados digitales de WEEK-CHAIN representan derechos de uso vacacional por 15 años</li>
                  <li>No constituyen propiedad inmobiliaria ni instrumento financiero</li>
                  <li>Sujeto a las regulaciones mexicanas NOM-029-SE-2021 y NOM-151-SCFI-2016</li>
                  <li>Tiene un periodo de reflexión de 5 días hábiles para cancelar su compra</li>
                  <li>Sus datos personales serán tratados conforme a la LFPDPPP</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
              <input
                type="checkbox"
                id="accept-terms-google"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="accept-terms-google" className="text-sm text-slate-700 cursor-pointer">
                He leído y acepto los{" "}
                <a
                  href="/legal/terms"
                  target="_blank"
                  className="text-amber-600 hover:underline font-medium"
                  rel="noreferrer"
                >
                  Términos y Condiciones
                </a>{" "}
                y el{" "}
                <a
                  href="/legal/privacy"
                  target="_blank"
                  className="text-amber-600 hover:underline font-medium"
                  rel="noreferrer"
                >
                  Aviso de Privacidad
                </a>{" "}
                de WEEK-CHAIN S.A.P.I. de C.V.
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowTermsDialog(false)
                  setPendingAction(null)
                  setHasAccepted(false)
                }}
                variant="outline"
                className="flex-1 h-12"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTermsAcceptance}
                disabled={!hasAccepted}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
              >
                Aceptar y Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
