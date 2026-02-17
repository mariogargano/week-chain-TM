"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Lock, Mail, Send, Eye, EyeOff, Shield, Calendar, Users } from "lucide-react"

const CORRECT_PASSWORD = "WEEK2025"
const STORAGE_KEY = "week-chain-access-granted"

export function PasswordProtectionOverlay() {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    // Check if already unlocked
    const accessGranted = localStorage.getItem(STORAGE_KEY)
    if (accessGranted === "true") {
      setIsUnlocked(true)
    } else {
      setIsUnlocked(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true")
      setIsUnlocked(true)
      setError("")
    } else {
      setError("Contraseña incorrecta. Contacta a info@week-chain.com para obtener acceso.")
      setPassword("")
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // In production, this would send to an API
      console.log("[v0] Interest email submitted:", email)
      setEmailSent(true)
      setEmail("")
    }
  }

  // Still checking localStorage
  if (isUnlocked === null) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Cargando...</div>
      </div>
    )
  }

  // Already unlocked
  if (isUnlocked) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 overflow-auto">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-2xl shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            WEEK-CHAIN<span className="text-amber-400">™</span>
          </h1>
          <p className="text-blue-300 font-medium">Smart Vacational Certificate</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Exclusive Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Acceso Exclusivo</span>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Plataforma en Acceso Anticipado</h2>
            <p className="text-slate-300 leading-relaxed">
              Esta plataforma es accesible únicamente para{" "}
              <span className="text-amber-400 font-semibold">Preholders</span> y{" "}
              <span className="text-amber-400 font-semibold">Venture Capital</span> autorizados.
            </p>
          </div>

          {/* Launch Info */}
          <div className="flex items-center justify-center gap-6 mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-wider">Lanzamiento</p>
                <p className="text-white font-bold">FEBRERO 2026</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-purple-300 uppercase tracking-wider">Acceso</p>
                <p className="text-white font-bold">Preholders & VC</p>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Ingresa tu contraseña de acceso</label>
            <div className="relative mb-3">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña de acceso"
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 font-bold text-lg rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/30"
            >
              Acceder a la Plataforma
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-slate-400 text-sm">¿No tienes acceso?</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Contact Form */}
          {!emailSent ? (
            <form onSubmit={handleEmailSubmit}>
              <p className="text-slate-300 text-sm mb-3 text-center">
                Déjanos tu email y te contactaremos con más información
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-medium">¡Gracias! Te contactaremos pronto.</p>
            </div>
          )}

          {/* Direct Contact */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm mb-2">O escríbenos directamente a:</p>
            <a
              href="mailto:info@week-chain.com"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              <Mail className="w-4 h-4" />
              info@week-chain.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">© 2026 WEEK-CHAIN™ — Todos los derechos reservados</p>
      </div>
    </div>
  )
}
