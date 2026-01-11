"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Users, AlertCircle, Mail, Phone } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function VirtualOfficePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isTeamMember, setIsTeamMember] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        // Check if user is team member (admin or staff role) OR property owner
        const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

        if (profile && (profile.role === "admin" || profile.role === "staff" || profile.role === "property_owner")) {
          setIsTeamMember(true)
        }
      }
    } catch (err) {
      console.error("Error checking user:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single()

        if (profile && (profile.role === "admin" || profile.role === "staff" || profile.role === "property_owner")) {
          setIsTeamMember(true)
          setUser(data.user)
        } else {
          setError("Acceso denegado. Solo miembros del equipo y propietarios pueden acceder a la Oficina Virtual.")
          await supabase.auth.signOut()
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFDAC1]/20 via-white to-[#B5EAD7]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF9AA2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // If user is team member or property owner, show virtual office
  if (isTeamMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFDAC1]/20 via-white to-[#B5EAD7]/20 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0 px-6 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Acceso Autorizado
            </Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#FF9AA2] via-[#C7CEEA] to-[#B5EAD7] bg-clip-text text-transparent">
              Oficina Virtual WEEK-CHAIN™
            </h1>
            <p className="text-xl text-slate-600">Bienvenido al espacio de trabajo del equipo</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Links */}
            <Card className="p-6 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-4 text-slate-900">Enlaces Rápidos</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/admin")}
                >
                  Panel de Administración
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/workspace")}
                >
                  Workspace
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/week-management")}
                >
                  Gestión de Semanas
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/owner")}
                >
                  Dashboard Propietario
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/owner/submissions")}
                >
                  Mis Propiedades
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/owner/sales")}
                >
                  Historial de Ventas
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/dashboard/owner/notifications")}
                >
                  Notificaciones
                </Button>
              </div>
            </Card>

            {/* Team Resources */}
            <Card className="p-6 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-4 text-slate-900">Recursos del Equipo</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-[#FF9AA2]" />
                  <span>team@weekchain.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-[#B5EAD7]" />
                  <span>+52 (984) XXX-XXXX</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-[#C7CEEA]" />
                  <span>Miembros activos: {user?.email}</span>
                </div>
              </div>
            </Card>

            {/* System Status */}
            <Card className="p-6 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-4 text-slate-900">Estado del Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Plataforma</span>
                  <Badge className="bg-green-500 text-white">Operativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Base de Datos</span>
                  <Badge className="bg-green-500 text-white">Operativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Blockchain</span>
                  <Badge className="bg-green-500 text-white">Operativo</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Show login form for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFDAC1]/20 via-white to-[#B5EAD7]/20 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-8 border-2 border-slate-200/50 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Oficina Virtual</h2>
            <p className="text-slate-600">Acceso restringido solo para miembros del equipo</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email del Equipo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@weekchain.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:opacity-90 text-white"
            >
              {loading ? "Verificando..." : "Acceder"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              ¿No tienes acceso?{" "}
              <a href="mailto:team@weekchain.com" className="text-[#FF9AA2] hover:underline">
                Contacta al administrador
              </a>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
