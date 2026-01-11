"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  UserPlus,
  Send,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { ADMIN_EMAIL, roleLabels, type UserRole } from "@/lib/auth/roles"
import Link from "next/link"

interface TeamMember {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

const availableRoles: { value: UserRole; label: string }[] = [
  { value: "management", label: "Gestión" },
  { value: "broker", label: "Intermediario" },
  { value: "broker_elite", label: "Intermediario Elite" },
  { value: "notaria", label: "Notaría" },
  { value: "of_counsel", label: "Of Counsel" },
  { value: "service_provider", label: "Proveedor de Servicios" },
  { value: "vafi_manager", label: "Manager VA-FI" },
  { value: "staff", label: "Staff" },
]

export default function TeamManagementPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; tempPassword?: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "",
  })

  useEffect(() => {
    checkAdminAndLoadTeam()
  }, [])

  const checkAdminAndLoadTeam = async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.push("/dashboard")
      return
    }

    setIsAdmin(true)

    const { data: members, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, created_at")
      .in("role", [
        "admin",
        "super_admin",
        "management",
        "broker",
        "broker_elite",
        "notaria",
        "of_counsel",
        "service_provider",
        "vafi_manager",
        "staff",
      ])
      .order("created_at", { ascending: false })

    if (!error && members) {
      // Map full_name to name for compatibility
      const mappedMembers = members.map((m) => ({
        ...m,
        name: m.full_name || m.email,
      }))
      setTeamMembers(mappedMembers)
    }

    setIsLoading(false)
  }

  const handleCreateUser = async () => {
    if (!formData.email || !formData.name || !formData.role) {
      setResult({ success: false, message: "Todos los campos son obligatorios" })
      return
    }

    setIsCreating(true)
    setResult(null)

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch("/api/admin/create-role-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          tempPassword: data.tempPassword,
        })
        setFormData({ email: "", name: "", role: "" })
        setShowForm(false)
        // Reload team members
        checkAdminAndLoadTeam()
      } else {
        setResult({ success: false, message: data.error || "Error al crear usuario" })
      }
    } catch (error) {
      setResult({ success: false, message: "Error de conexión" })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Equipo</h1>
              <p className="text-slate-400">Crea y gestiona usuarios con roles específicos</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Result Message */}
        {result && (
          <Card
            className={`border-2 ${result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div className="flex-1">
                  <p className={result.success ? "text-green-400" : "text-red-400"}>{result.message}</p>
                  {result.tempPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-yellow-400 text-sm">Contraseña temporal:</span>
                      <code className="bg-slate-800 px-2 py-1 rounded text-sm">
                        {showPassword ? result.tempPassword : "••••••••••••"}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-7 w-7 p-0"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(result.tempPassword!)}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create User Form */}
        {showForm && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-400" />
                Crear Nuevo Usuario
              </CardTitle>
              <CardDescription className="text-slate-400">
                El usuario recibirá un email con sus credenciales de acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nombre Completo</Label>
                  <Input
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    placeholder="juan@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Crear y Enviar Invitación
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Miembros del Equipo ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay miembros del equipo registrados</p>
                <p className="text-sm">Crea el primer usuario usando el botón de arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`
                          ${member.role === "admin" ? "bg-red-500/20 text-red-400 border-red-500/50" : ""}
                          ${member.role === "management" ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : ""}
                          ${member.role === "broker" || member.role === "broker_elite" ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}
                          ${member.role === "notaria" ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : ""}
                          ${member.role === "of_counsel" ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : ""}
                          ${member.role === "staff" ? "bg-slate-500/20 text-slate-400 border-slate-500/50" : ""}
                        `}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[member.role as UserRole] || member.role}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(member.created_at).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
