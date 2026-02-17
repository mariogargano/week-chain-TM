"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldAlert, Loader2, Key } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface TwoFactorStatus {
  enabled: boolean
  enabled_at: string | null
  last_used_at: string | null
}

export default function SecurityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null)
  const [disabling, setDisabling] = useState(false)
  const [error, setError] = useState("")

  const supabase = createBrowserClient()

  useEffect(() => {
    loadTwoFactorStatus()
  }, [])

  async function loadTwoFactorStatus() {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth") // Changed /auth/login to /auth
        return
      }

      const response = await fetch("/api/auth/2fa/status")
      if (response.ok) {
        const data = await response.json()
        setTwoFactorStatus(data)
      }
    } catch (err) {
      console.error("Failed to load 2FA status:", err)
    } finally {
      setLoading(false)
    }
  }

  async function disableTwoFactor() {
    if (!confirm("¿Estás seguro de que deseas deshabilitar 2FA? Esto reducirá la seguridad de tu cuenta.")) {
      return
    }

    try {
      setDisabling(true)
      setError("")

      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to disable 2FA")
      }

      await loadTwoFactorStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA")
    } finally {
      setDisabling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Seguridad de la Cuenta</h1>
        <p className="text-muted-foreground">Gestiona la seguridad y autenticación de tu cuenta</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6" />
                <div>
                  <CardTitle>Autenticación de Dos Factores (2FA)</CardTitle>
                  <CardDescription>Agrega una capa extra de seguridad a tu cuenta</CardDescription>
                </div>
              </div>
              {twoFactorStatus?.enabled ? (
                <Badge variant="default" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Habilitado
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  Deshabilitado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {twoFactorStatus?.enabled ? (
              <>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="font-medium text-green-600">Activo</span>
                    </div>
                    {twoFactorStatus.enabled_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Habilitado:</span>
                        <span className="font-medium">{new Date(twoFactorStatus.enabled_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {twoFactorStatus.last_used_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último uso:</span>
                        <span className="font-medium">
                          {new Date(twoFactorStatus.last_used_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.push("/auth/setup-2fa")} className="flex-1">
                    <Key className="mr-2 h-4 w-4" />
                    Reconfigurar
                  </Button>
                  <Button variant="destructive" onClick={disableTwoFactor} disabled={disabling} className="flex-1">
                    {disabling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deshabilitando...
                      </>
                    ) : (
                      "Deshabilitar 2FA"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>
                    Tu cuenta no está protegida con 2FA. Te recomendamos habilitarlo para mayor seguridad.
                  </AlertDescription>
                </Alert>

                <Button onClick={() => router.push("/auth/setup-2fa")} className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Habilitar 2FA
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña regularmente para mantener tu cuenta segura</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/auth/reset-password")}>
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Activas</CardTitle>
            <CardDescription>Gestiona los dispositivos donde has iniciado sesión</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Ver Sesiones (Próximamente)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
