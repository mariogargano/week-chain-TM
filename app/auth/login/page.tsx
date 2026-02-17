"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Mail, Chrome } from "lucide-react"
import { TermsAcceptanceDialog } from "@/components/terms-acceptance-dialog"
import { useTermsAcceptance } from "@/lib/hooks/use-terms-acceptance"
import { logger } from "@/lib/config/logger"
import { loginRateLimiter } from "@/lib/utils/rate-limiter"
import { getDashboardUrl } from "@/lib/auth/redirect"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { hasAccepted, acceptTerms } = useTermsAcceptance()
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const rateLimitCheck = loginRateLimiter.check(email)
    if (!rateLimitCheck.allowed) {
      const minutesLeft = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 60000)
      setError(`Demasiados intentos. Por favor intenta de nuevo en ${minutesLeft} minutos.`)
      return
    }

    if (hasAccepted === false) {
      setPendingAction("email")
      setShowTermsDialog(true)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      const dashboardUrl = await getDashboardUrl(email)
      logger.info(`[v0] Login success, redirecting to ${dashboardUrl}`)
      router.push(dashboardUrl)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Sign in with Google using Supabase native OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
    } catch (error) {
      logger.error("Error initiating Google auth:", error)
      setError("Error al conectar con Google. Por favor intenta de nuevo.")
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
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error

          const dashboardUrl = await getDashboardUrl(email)
          logger.info(`[v0] Login success after terms, redirecting to ${dashboardUrl}`)
          router.push(dashboardUrl)
        } catch (error: unknown) {
          setError(error instanceof Error ? error.message : "Ocurrió un error")
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
                Bienvenido
              </CardTitle>
              <CardDescription className="text-slate-600">
                Inicia sesión para acceder a tus certificados vacacionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 text-slate-700 transition-all duration-300"
                  size="lg"
                  disabled={isLoading}
                >
                  <Chrome className="mr-2 h-5 w-5 text-purple-600" />
                  Iniciar con Google
                </Button>
              </div>

              <div className="relative">
                <Separator className="bg-slate-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-500 font-medium">
                  O CON EMAIL
                </span>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">
                      Contraseña
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-blue-600 hover:text-indigo-600 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <Mail className="mr-2 h-5 w-5" />
                  {isLoading ? "Iniciando sesión..." : "Iniciar con Email"}
                </Button>
              </form>

              <div className="text-center text-sm text-slate-600">
                ¿No tienes cuenta?{" "}
                <Link href="/auth" className="text-blue-600 hover:text-indigo-600 transition-colors font-semibold">
                  Regístrate
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
          setIsLoading(false)
        }}
        onOpenChange={(open) => {
          if (!open) {
            setShowTermsDialog(false)
            setPendingAction(null)
            setIsLoading(false)
          }
        }}
      />
    </>
  )
}
