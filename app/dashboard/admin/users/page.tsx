"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Search, ArrowLeft, Shield, User, MoreVertical, Download, Filter, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RoleGuard } from "@/components/role-guard"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminUsersContent />
    </RoleGuard>
  )
}

function AdminUsersContent() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      toast.error("Error al cargar usuarios")
    }

    if (data) {
      setUsers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    const supabase = createClient()

    const { error } = await supabase
      .from("users")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating role:", error)
      toast.error("Error al actualizar el rol")
    } else {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast.success(`Rol actualizado a ${newRole}`)
    }
    setUpdating(null)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const roleColors: Record<string, string> = {
    admin: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    super_admin: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
    broker: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
    broker_elite: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    owner: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    investor: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
    management: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
    notaria: "bg-gradient-to-r from-violet-500 to-purple-500 text-white",
    user: "bg-slate-200 text-slate-700",
  }

  const availableRoles = [
    { value: "user", label: "Usuario" },
    { value: "owner", label: "Propietario" },
    { value: "investor", label: "Inversionista" },
    { value: "broker", label: "Broker" },
    { value: "management", label: "Management" },
    { value: "notaria", label: "Notaría" },
    { value: "admin", label: "Administrador" },
    { value: "super_admin", label: "Super Admin" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/admin")}
            className="bg-white border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
            <p className="text-slate-600">Administra cuentas y asigna roles ({users.length} usuarios)</p>
          </div>
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
            onClick={() => fetchUsers()}
          >
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: users.length, color: "blue" },
            {
              label: "Admins",
              value: users.filter((u) => u.role === "admin" || u.role === "super_admin").length,
              color: "purple",
            },
            {
              label: "Brokers",
              value: users.filter((u) => u.role === "broker").length,
              color: "indigo",
            },
            { label: "Propietarios", value: users.filter((u) => u.role === "owner").length, color: "emerald" },
            { label: "Usuarios", value: users.filter((u) => u.role === "user" || !u.role).length, color: "slate" },
          ].map((stat) => (
            <Card key={stat.label} className="border-2 border-blue-200 bg-white">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-xs text-slate-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-2 border-blue-100 bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, email o wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48 border-blue-200">
                  <Filter className="h-4 w-4 mr-2 text-blue-500" />
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {loading ? (
          <Card className="border-2 border-blue-100 bg-white">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="ml-3 text-slate-600">Cargando usuarios...</p>
            </CardContent>
          </Card>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="border-2 border-blue-100 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.full_name || "Usuario"}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3 w-3" />
                          {user.email || "Sin email"}
                        </div>
                        {user.wallet_address && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <User className="h-3 w-3" />
                            {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-500">Registrado</p>
                        <p className="text-sm text-slate-700">
                          {new Date(user.created_at).toLocaleDateString("es-MX")}
                        </p>
                      </div>

                      {/* Role Selector */}
                      <Select
                        value={user.role || "user"}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className={`w-40 ${roleColors[user.role || "user"]} border-0`}>
                          {updating === user.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Shield className="h-3 w-3 mr-1" />
                          )}
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Ver perfil completo</DropdownMenuItem>
                          <DropdownMenuItem>Ver actividad</DropdownMenuItem>
                          <DropdownMenuItem>Enviar notificación</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Suspender cuenta</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-blue-100 bg-white">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">
                  {searchTerm || roleFilter !== "all"
                    ? "No se encontraron usuarios con esos filtros"
                    : "No hay usuarios registrados"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
