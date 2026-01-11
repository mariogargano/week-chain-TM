"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Sparkles, Calendar } from "lucide-react"
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
        setError(data.error || "Contraseña incorrecta")
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff9aa2] via-[#ffdac1] to-[#c7ceea] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#b5ead7] rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#ffb7b2] rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-block bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
            <Image src="/icon.jpg" alt="WEEK-CHAIN" width={120} height={120} className="h-20 w-auto mx-auto" priority />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">WEEK-CHAIN</h1>
            <p className="text-white/90 text-lg font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Plataforma en Desarrollo
            </p>
          </div>
        </div>

        {/* Access Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/50">
          {/* Launch Info */}
          <div className="text-center space-y-3 pb-6 border-b border-gray-200">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff9aa2] to-[#c7ceea] text-white px-4 py-2 rounded-full text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              Lanzamiento Oficial: Q2 2026
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Estamos construyendo el futuro de los certificados vacacionales en blockchain. Acceso exclusivo para
              equipo y socios estratégicos.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña de Acceso Exclusivo</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa la contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 text-lg border-2 border-gray-200 focus:border-[#ff9aa2] focus:ring-[#ff9aa2] rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              className="w-full bg-gradient-to-r from-[#ff9aa2] via-[#ffb7b2] to-[#ffdac1] hover:opacity-90 text-white font-semibold h-14 text-lg rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Verificando...
                </span>
              ) : (
                "Acceder a la Plataforma"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              ¿No tienes acceso? Contacta a{" "}
              <a href="mailto:corporativo@morises.com" className="text-[#ff9aa2] hover:underline font-medium">
                corporativo@morises.com
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-white/80 text-sm">WEEK-CHAIN™ - Innovación en Servicios Vacacionales</p>
          <p className="text-white/60 text-xs">Certificados de Servicios Vacacionales con Tecnología Blockchain</p>
        </div>
      </div>
    </div>
  )
}
