"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Copy, Check, Download, RefreshCw } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { createBrowserClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

export default function Setup2FAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const required = searchParams.get("required") === "true"
  const nextUrl = searchParams.get("next") || "/dashboard"

  const [step, setStep] = useState<"generate" | "verify" | "backup">("generate")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [secret, setSecret] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [copied, setCopied] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    generateSecret()
  }, [])

  async function generateSecret() {
    try {
      setLoading(true)
      setError("")

      console.log("[v0] 2FA Setup: Checking user session...")
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] 2FA Setup: No user found, redirecting to login")
        router.push("/auth/login")
        return
      }

      console.log("[v0] 2FA Setup: User found:", user.email, "Generating secret...")

      const response = await fetch("/api/auth/2fa/generate", {
        method: "POST",
        credentials: "include",
      })

      console.log("[v0] 2FA Setup: API response status:", response.status)

      const data = await response.json()
      console.log("[v0] 2FA Setup: API response data:", data.error || "Success")

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate 2FA secret")
      }

      setSecret(data.secret)
      setQrCode(data.qrCode)
      setBackupCodes(data.backupCodes)
      console.log("[v0] 2FA Setup: Secret generated successfully")
    } catch (err) {
      console.error("[v0] 2FA Setup: Error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate 2FA secret")
    } finally {
      setLoading(false)
    }
  }

  async function verifyAndEnable() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (!response.ok) {
        throw new Error("Invalid verification code")
      }

      setStep("backup")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code")
    } finally {
      setLoading(false)
    }
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadBackupCodes() {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "weekchain-2fa-backup-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  function complete() {
    document.cookie = "2fa_verified=true; path=/; max-age=86400" // 24 horas
    router.push(nextUrl)
  }

  if (loading && step === "generate") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Generando configuración 2FA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <CardTitle>Configurar Autenticación de Dos Factores</CardTitle>
          </div>
          <CardDescription>
            {required
              ? "Tu rol requiere 2FA para acceder a esta sección"
              : "Agrega una capa extra de seguridad a tu cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={generateSecret}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {step === "generate" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Paso 1: Escanea el código QR</h3>
                <p className="text-sm text-muted-foreground">
                  Usa una app de autenticación como Google Authenticator, Authy, o 1Password
                </p>
              </div>

              {qrCode ? (
                <div className="flex justify-center rounded-lg border bg-white p-4">
                  <QRCodeSVG value={qrCode} size={200} />
                </div>
              ) : (
                !error && (
                  <div className="flex justify-center rounded-lg border bg-muted p-8">
                    <p className="text-sm text-muted-foreground">Cargando código QR...</p>
                  </div>
                )
              )}

              {secret && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">O ingresa este código manualmente:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">{secret}</code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(secret)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={() => setStep("verify")} className="w-full" disabled={!qrCode}>
                Continuar
              </Button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Paso 2: Verifica el código</h3>
                <p className="text-sm text-muted-foreground">
                  Ingresa el código de 6 dígitos de tu app de autenticación
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("generate")} className="flex-1">
                  Atrás
                </Button>
                <Button
                  onClick={verifyAndEnable}
                  disabled={verificationCode.length !== 6 || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar y Habilitar"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "backup" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Paso 3: Guarda tus códigos de respaldo</h3>
                <p className="text-sm text-muted-foreground">
                  Guarda estos códigos en un lugar seguro. Puedes usarlos si pierdes acceso a tu app de autenticación.
                </p>
              </div>

              <Alert>
                <AlertDescription className="font-mono text-sm">
                  {backupCodes.map((code, i) => (
                    <div key={i}>{code}</div>
                  ))}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={copyBackupCodes} className="flex-1 bg-transparent">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={downloadBackupCodes} className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
              </div>

              <Button onClick={complete} className="w-full">
                Completar Configuración
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
