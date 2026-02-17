"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { UserPlus } from "lucide-react"
import { analytics } from "@/lib/analytics/events"
import { isDemoMode } from "@/lib/config/environment"
import { validatePassword } from "@/lib/utils/password-validation"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"
import { signupRateLimiter } from "@/lib/utils/rate-limiter"
import { TermsAcceptanceDialog } from "@/components/terms-acceptance-dialog"
import { useTermsAcceptance } from "@/lib/hooks/use-terms-acceptance"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { hasAccepted, acceptTerms } = useTermsAcceptance()
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const rateLimitCheck = signupRateLimiter.check(email)
    if (!rateLimitCheck.allowed) {
      const minutesLeft = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 60000)
      setError(`Too many signup attempts. Please try again in ${minutesLeft} minutes.`)
      return
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    const validation = validatePassword(password)
    if (!validation.isValid) {
      setError("La contraseña no cumple con los requisitos de seguridad.")
      setIsLoading(false)
      return
    }

    if (hasAccepted === false) {
      setPendingAction("email")
      setShowTermsDialog(true)
      return
    }

    try {
      const supabase = createClient()
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error

      if (data.user) {
        analytics.identify(data.user.id, {
          email: email,
          name: fullName,
          signup_method: "email",
        })
        analytics.events.signUp("email")
      }

      try {
        await fetch("/api/email/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            userName: fullName,
          }),
        })
      } catch (emailError) {
        console.error("[v0] Failed to send welcome email:", emailError)
      }

      if (isDemoMode()) {
        router.push("/dashboard")
      } else {
        router.push("/auth/verify-email")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (hasAccepted === false) {
      setPendingAction("google")
      setShowTermsDialog(true)
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      analytics.events.signUp("google")
      window.location.href = "/api/auth/google"
    } catch (error) {
      console.error("[v0] Error initiating Google auth:", error)
      setError("Error al conectar con Google. Intenta de nuevo.")
      setIsLoading(false)
    }
  }

  const handleTermsAccept = async () => {
    const success = await acceptTerms("1.0")
    if (success) {
      setShowTermsDialog(false)

      if (pendingAction === "google") {
        window.location.href = "/api/auth/google"
      } else if (pendingAction === "email") {
        const supabase = createClient()
        setIsLoading(true)
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo:
                process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
              data: { full_name: fullName },
            },
          })
          if (error) throw error
          if (data.user) {
            analytics.identify(data.user.id, { email, name: fullName, signup_method: "email" })
            analytics.events.signUp("email")
          }
          router.push(isDemoMode() ? "/dashboard" : "/auth/verify-email")
        } catch (error: unknown) {
          setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
          setIsLoading(false)
        }
      }

      setPendingAction(null)
    }
  }

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(196,181,253,0.3),transparent_50%)]" />

        <div className="relative z-10 w-full max-w-md">
          <Card className="border-blue-200/50 bg-white/90 backdrop-blur-xl shadow-xl shadow-blue-100/50">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Únete a WEEK-CHAIN
              </CardTitle>
              <CardDescription className="text-slate-600">
                Crea tu cuenta y comienza tu experiencia vacacional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment out Google OAuth since it's not properly configured */}
              {/* 
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignUp}
                  variant="outline"
                  className="w-full h-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 text-slate-700 transition-all duration-300"
                  size="lg"
                  disabled={isLoading}
                >
                  <Chrome className="mr-2 h-5 w-5 text-purple-600" />
                  Registrar con Google
                </Button>
              </div>

              <div className="relative">
                <Separator className="bg-slate-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-500 font-medium">
                  O CON EMAIL
                </span>
              </div>
              */}

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-medium">
                    Nombre Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repeat-password" className="text-slate-700 font-medium">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-blue-200/50 transition-all duration-300"
                  size="lg"
                  disabled={isLoading}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>

              <div className="text-center text-sm text-slate-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth" className="text-blue-600 hover:text-indigo-600 transition-colors font-semibold">
                  Inicia sesión
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <TermsAcceptanceDialog
        open={showTermsDialog}
        onAccept={handleTermsAccept}
        onCancel={() => {
          setShowTermsDialog(false)
          setPendingAction(null)
        }}
      />
    </>
  )
}
