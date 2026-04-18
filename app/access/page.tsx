"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function AccessPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/site-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError(data.error || "Contrasena incorrecta")
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-block bg-background/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl shadow-sky-200/40">
            <Image src="/logo-wc.png" alt="WEEK-CHAIN" width={120} height={120} className="h-20 w-auto mx-auto" priority />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">WEEK-CHAIN</h1>
            <p className="text-muted-foreground text-lg font-medium">
              Plataforma en Desarrollo
            </p>
          </div>
        </div>

        {/* Access Card */}
        <div className="bg-background/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-200/30 p-6 sm:p-8 space-y-6 border border-sky-200/50">
          {/* Launch Info */}
          <div className="text-center space-y-3 pb-6 border-b border-border">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              Lanzamiento Oficial: Q2 2026
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Estamos construyendo el futuro de los certificados vacacionales en blockchain. Acceso exclusivo para
              equipo y socios estrategicos.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contrasena de Acceso Exclusivo</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa la contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 text-base border-2 border-border focus:border-sky-400 focus:ring-sky-400 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold h-14 text-base rounded-xl shadow-lg shadow-sky-200/50 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Acceder a la Plataforma"}
            </Button>
          </form>

          {/* Footer - F-06 FIX: Use generic support email, not admin email */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              {"No tienes acceso? Contacta a "}
              <a href="mailto:soporte@week-chain.com" className="text-sky-600 hover:underline font-medium">
                soporte@week-chain.com
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-foreground/70 text-sm">WEEK-CHAIN - Innovacion en Servicios Vacacionales</p>
          <p className="text-foreground/50 text-xs">Certificados de Servicios Vacacionales con Tecnologia Blockchain</p>
        </div>
      </div>
    </div>
  )
}
