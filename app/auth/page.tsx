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
  const [activeTab, setActiveTab] = useState<"choose" | "login" | "register" | "magic">("choose")
  const [hasAccepted, setHasAccepted] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"google" | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkEmail, setMagicLinkEmail] = useState("")

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Register state
  const [registerName, setRegisterName] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registerTermsAccepted, setRegisterTermsAccepted] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [referrerName, setReferrerName] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams?.get("ref")
    if (ref) {
      setReferralCode(ref)
      fetchReferrerName(ref)
      // Referral links should go directly to register
      setActiveTab("register")
    }

    const tab = searchParams?.get("tab")
    if (tab === "login" || tab === "register") {
      setActiveTab(tab)
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
    } catch {
      // Referrer not found
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
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      // Supabase handles the redirect automatically
    } catch (error: any) {
      setError("Error al conectar con Google. Intenta nuevamente o usa email y contraseña.")
      toast.error("Error de autenticacion con Google")
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Check if admin email
        if (data.user.email?.toLowerCase() === "corporativo@morises.com") {
          router.push("/dashboard/admin")
          toast.success("Bienvenido, Administrador!")
          return
        }

        // Fetch role from users table
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle()

        const role = userData?.role || "user"

        const roleRouteMap: Record<string, string> = {
          admin: "/dashboard/admin",
          super_admin: "/dashboard/admin",
          broker: "/dashboard/broker",
          broker_elite: "/dashboard/broker",
          management: "/dashboard/management",
          notaria: "/dashboard/notaria",
          of_counsel: "/dashboard/of-counsel",
          service_provider: "/dashboard/service-provider",
          vafi_manager: "/dashboard/vafi",
          dao_member: "/dashboard/dao",
          property_owner: "/dashboard/owner",
        }

        const dashboardPath = roleRouteMap[role] || "/dashboard/member"
        router.push(dashboardPath)
        toast.success("Bienvenido de vuelta!")
      }
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesion")
      toast.error("Error al iniciar sesion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (password !== confirmPassword) {
        setError("Las contrasenas no coinciden")
        setIsLoading(false)
        return
      }
      if (!registerTermsAccepted) {
        setError("Debes aceptar los terminos y condiciones para registrarte")
        setIsLoading(false)
        return
      }
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

      if (error) throw error
      toast.success("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.")
      setActiveTab("login")
    } catch (error: any) {
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setMagicLinkSent(true)
      toast.success("¡Revisa tu email! Te hemos enviado un enlace mágico para iniciar sesión.")
    } catch (error: any) {
      if (error.message?.includes("rate")) {
        setError("Demasiados intentos. Por favor espera un momento antes de intentar nuevamente.")
      } else if (error.message?.includes("invalid")) {
        setError("Email inválido. Por favor verifica tu dirección de correo.")
      } else {
        setError(error.message || "Error al enviar el enlace mágico")
      }
      toast.error("Error al enviar el enlace mágico")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 flex flex-col items-center justify-start sm:justify-center px-4 py-8 sm:p-4">
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-lg shadow-slate-400/30 ring-1 ring-slate-300/50 bg-white flex-shrink-0">
            <Image
              src="/logo-wc.jpg"
              alt="WEEK-CHAIN Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain p-0.5"
              priority
            />
          </div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">WEEK-CHAIN</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Smart Vacational Certificate</p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-xl border-sky-200/50">
        <CardContent className="pt-6 pb-6 px-4 sm:pt-8 sm:pb-8 sm:px-8">

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {referrerName && (
            <div className="mb-5 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800 text-center">
                <span className="font-semibold">{referrerName}</span> te ha invitado a unirte
              </p>
            </div>
          )}

          {/* ===== CHOOSE SCREEN ===== */}
          {activeTab === "choose" && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Bienvenido</h2>
                <p className="text-sm text-muted-foreground">Accede o crea tu cuenta de certificados vacacionales</p>
              </div>

              {/* Google SSO */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                type="button"
                className="flex items-center justify-center w-full min-h-[48px] px-4 py-3 bg-background border-2 border-border rounded-xl text-base font-medium text-foreground transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-70"
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-card text-muted-foreground uppercase tracking-wider">o con email</span>
                </div>
              </div>

              {/* Two option cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border-2 border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 hover:border-sky-400 transition-all active:scale-[0.97] group"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Iniciar Sesion</span>
                  <span className="text-[11px] text-muted-foreground leading-tight text-center">Ya tengo una cuenta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border-2 border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/70 hover:border-cyan-400 transition-all active:scale-[0.97] group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Crear Cuenta</span>
                  <span className="text-[11px] text-muted-foreground leading-tight text-center">Soy nuevo usuario</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setActiveTab("magic"); setMagicLinkSent(false) }}
                className="w-full text-center text-xs text-muted-foreground hover:text-sky-600 transition-colors py-2"
              >
                Iniciar sesion con enlace magico (sin contrasena)
              </button>
            </div>
          )}

          {/* ===== BACK BUTTON for sub-pages ===== */}
          {activeTab !== "choose" && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => { setActiveTab("choose"); setError(null); setMagicLinkSent(false) }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                  {activeTab === "login" ? "Iniciar Sesion" : activeTab === "magic" ? "Enlace Magico" : "Crear Cuenta"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {activeTab === "login"
                    ? "Accede a tus certificados vacacionales"
                    : activeTab === "magic"
                      ? "Inicia sesion sin contrasena"
                      : "Registrate para obtener tu certificado digital"}
                </p>
              </div>
            </div>
          )}

          {/* ===== Google button on login/register sub-pages ===== */}
          {(activeTab === "login" || activeTab === "register") && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                type="button"
                className="flex items-center justify-center w-full min-h-[48px] mb-4 px-4 py-3 bg-background border-2 border-border rounded-xl text-sm font-medium text-foreground transition-all hover:bg-secondary active:scale-[0.98] disabled:opacity-70"
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-card text-muted-foreground uppercase tracking-wider">o con email</span>
                </div>
              </div>
            </>
          )}

          {activeTab === "magic" && !magicLinkSent && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email" className="text-gray-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Te enviaremos un enlace seguro para iniciar sesión sin contraseña
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-base font-semibold shadow-md shadow-purple-200"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Enlace Mágico"}
              </Button>
            </form>
          )}

          {activeTab === "magic" && magicLinkSent && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">¡Revisa tu email!</h3>
              <p className="text-gray-600">
                Hemos enviado un enlace mágico a <strong>{magicLinkEmail}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Haz clic en el enlace del email para iniciar sesión automáticamente.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMagicLinkSent(false)
                  setMagicLinkEmail("")
                }}
                className="mt-4"
              >
                Enviar a otro email
              </Button>
            </div>
          )}

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
                  <a href="/auth/forgot-password" className="text-sm text-sky-600 hover:text-sky-700">
                    Olvidaste tu contrasena?
                  </a>
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
                className="w-full h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-base font-semibold shadow-md shadow-sky-200"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesion..." : "Iniciar Sesion"}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {"No tienes cuenta? "}
                <button type="button" onClick={() => setActiveTab("register")} className="text-cyan-600 font-semibold hover:text-cyan-700 underline underline-offset-2">
                  Crear una cuenta
                </button>
              </p>
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
                  Contrasena (min. 6 caracteres)
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

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-700">
                  Confirmar contrasena
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="h-12 border-gray-300"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Las contrasenas no coinciden</p>
                )}
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

              <div className="flex items-start gap-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                <input
                  type="checkbox"
                  id="register-terms"
                  checked={registerTermsAccepted}
                  onChange={(e) => setRegisterTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="register-terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  Acepto los{" "}
                  <button type="button" onClick={() => setShowTermsDialog(true)} className="text-sky-600 underline hover:text-sky-700 font-medium">
                    Terminos y Condiciones
                  </button>
                  ,{" "}
                  <button type="button" onClick={() => setShowTermsDialog(true)} className="text-sky-600 underline hover:text-sky-700 font-medium">
                    Politica de Privacidad
                  </button>{" "}
                  y el{" "}
                  <button type="button" onClick={() => setShowTermsDialog(true)} className="text-sky-600 underline hover:text-sky-700 font-medium">
                    Contrato de Adhesion NOM-029
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-base font-semibold shadow-md shadow-cyan-200 disabled:opacity-50"
                disabled={isLoading || !registerTermsAccepted || (confirmPassword !== "" && password !== confirmPassword)}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {"Ya tienes cuenta? "}
                <button type="button" onClick={() => setActiveTab("login")} className="text-sky-600 font-semibold hover:text-sky-700 underline underline-offset-2">
                  Iniciar sesion
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>

      {showTermsDialog && (
        <div className="fixed inset-0 bg-foreground/70 flex items-end sm:items-center justify-center z-[9999]">
          <div className="bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto mx-0 sm:mx-4 p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-100">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">Terminos y Condiciones</h2>
            </div>

            <div className="mb-5 p-3 sm:p-4 bg-secondary rounded-lg border border-border max-h-[200px] sm:max-h-[250px] overflow-y-auto">
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-3">
                  Para proteger tanto a usted como a WEEK-CHAIN, debe aceptar nuestros terminos legales antes de
                  continuar con el inicio de sesion con Google.
                </p>
                <h3 className="font-semibold text-foreground mt-3 mb-2">Terminos Principales:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Los certificados digitales representan derechos de uso vacacional por 15 anos</li>
                  <li>No constituyen propiedad inmobiliaria ni instrumento financiero</li>
                  <li>Sujeto a las regulaciones mexicanas NOM-029-SE-2021 y NOM-151-SCFI-2016</li>
                  <li>Periodo de reflexion de 5 dias habiles para cancelar</li>
                  <li>Sus datos personales seran tratados conforme a la LFPDPPP</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-amber-50 rounded-xl border-2 border-amber-400 mb-5">
              <input
                type="checkbox"
                id="accept-terms-google"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="w-6 h-6 sm:w-7 sm:h-7 cursor-pointer accent-amber-500 flex-shrink-0 mt-0.5"
              />
              <label htmlFor="accept-terms-google" className="text-sm sm:text-[15px] text-amber-900 cursor-pointer leading-relaxed">
                <strong>He leido y acepto</strong> los{" "}
                <a href="/legal/terms" target="_blank" rel="noreferrer" className="text-amber-700 font-semibold underline">
                  Terminos y Condiciones
                </a>{" "}
                y el{" "}
                <a href="/legal/privacy" target="_blank" rel="noreferrer" className="text-amber-700 font-semibold underline">
                  Aviso de Privacidad
                </a>{" "}
                de WEEK-CHAIN S.A.P.I. de C.V.
              </label>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setShowTermsDialog(false)
                  setPendingAction(null)
                  setHasAccepted(false)
                }}
                type="button"
                className="flex-1 min-h-[48px] sm:min-h-[56px] px-4 sm:px-6 bg-background border-2 border-border rounded-xl text-base font-semibold text-foreground cursor-pointer active:scale-[0.98] transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={handleTermsAcceptance}
                disabled={!hasAccepted}
                type="button"
                className={`flex-1 min-h-[48px] sm:min-h-[56px] px-4 sm:px-6 border-none rounded-xl text-base font-bold transition-all active:scale-[0.98] ${
                  hasAccepted
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-primary-foreground shadow-lg shadow-amber-500/40 cursor-pointer"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {hasAccepted ? "Aceptar y Continuar" : "Marca la casilla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
