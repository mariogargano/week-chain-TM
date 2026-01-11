"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { CheckCircle2, Eye, EyeOff, Lock, CreditCard, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

function CompleteRegistrationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState("")
  const [brokerData, setBrokerData] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    // Retrieve broker application data from localStorage
    const savedData = localStorage.getItem("broker_application")
    if (savedData) {
      setBrokerData(JSON.parse(savedData))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)

    const supabase = createClient()

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Generate referral code
        const referralCode = user.user_metadata?.full_name
          ? user.user_metadata.full_name.split(" ")[0].toUpperCase().slice(0, 4) +
            Math.random().toString(36).substring(2, 6).toUpperCase()
          : "BROKER" + Math.random().toString(36).substring(2, 8).toUpperCase()

        // Update profile with broker role and data
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || brokerData?.firstName + " " + brokerData?.lastName,
          role: "broker",
          broker_level: 1,
          referral_code: referralCode,
          broker_type: user.user_metadata?.broker_type || brokerData?.brokerType,
          phone: user.user_metadata?.phone || brokerData?.phone,
          country: user.user_metadata?.country || brokerData?.country,
          city: user.user_metadata?.city || brokerData?.city,
          company_name: user.user_metadata?.company_name || brokerData?.companyName,
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile update error:", profileError)
        }

        // Clear localStorage
        localStorage.removeItem("broker_application")
      }

      setCompleted(true)
    } catch (err) {
      console.error("Error completing registration:", err)
      setError("Hubo un error al completar tu registro. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#C7CEEA]/10">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
          <Card className="w-full max-w-md border-green-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-900">¡Bienvenido a WEEK-CHAIN™!</CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Tu registro como intermediario está completo. Ya puedes acceder a tu dashboard y tu tarjeta digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:opacity-90">
                <Link href="/dashboard/broker/card">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ver Mi Tarjeta Digital
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/broker">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ir a Mi Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#C7CEEA]/10">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#C7CEEA]">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Crea tu Contraseña</CardTitle>
            <CardDescription className="text-slate-600">
              Último paso para activar tu cuenta de intermediario WEEK-CHAIN™
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-300 pr-10"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-slate-300"
                  placeholder="Repite tu contraseña"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:opacity-90 text-white py-6"
              >
                {isSubmitting ? "Activando cuenta..." : "Activar Mi Cuenta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#C7CEEA]/10">
          <Navbar />
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <div className="animate-pulse text-slate-400">Cargando...</div>
          </div>
        </div>
      }
    >
      <CompleteRegistrationContent />
    </Suspense>
  )
}
