"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

export default function Verify2FAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/dashboard"

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function verifyCode() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error("Invalid verification code")
      }

      // Establecer cookie de sesión 2FA
      document.cookie = "2fa_verified=true; path=/; max-age=86400" // 24 horas

      router.push(nextUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code")
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <CardTitle>Verificación de Dos Factores</CardTitle>
          </div>
          <CardDescription>Ingresa el código de 6 dígitos de tu app de autenticación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
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

          <Button onClick={verifyCode} disabled={code.length !== 6 || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿Perdiste acceso a tu app?{" "}
            <button
              onClick={() => {
                const backupCode = prompt("Ingresa un código de respaldo:")
                if (backupCode) {
                  setCode(backupCode)
                  verifyCode()
                }
              }}
              className="text-primary hover:underline"
            >
              Usar código de respaldo
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
