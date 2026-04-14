"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Mail, Search, Shield, User, MoreVertical, Download, Filter, Loader2, Users, UserCog, Briefcase, Building2, CreditCard, Eye, Lock, Unlock, Edit,  } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ROLES = [
  { value: "user", label: "Usuario", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "member", label: "Member SVC", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { value: "owner", label: "Propietario", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "broker", label: "WEEK-AGENT", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "notaria", label: "Notaria", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "operations", label: "Operaciones", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "finance", label: "Finanzas", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "legal", label: "Legal", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "support", label: "Soporte", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { value: "audit", label: "Auditoria", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "admin", label: "Admin", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "super_admin", label: "Super Admin", color: "bg-red-500 text-white border-red-600" },
]

const PERMISSIONS = [
  { key: "view_users", label: "Ver usuarios", module: "Usuarios" },
  { key: "edit_users", label: "Editar usuarios", module: "Usuarios" },
  { key: "view_properties", label: "Ver propiedades", module: "Propiedades" },
  { key: "edit_properties", label: "Editar propiedades", module: "Propiedades" },
  { key: "approve_properties", label: "Aprobar propiedades", module: "Propiedades" },
  { key: "view_certificates", label: "Ver certificados", module: "SVC" },
  { key: "edit_certificates", label: "Editar certificados", module: "SVC" },
  { key: "view_payments", label: "Ver pagos", module: "Finanzas" },
  { key: "process_payments", label: "Procesar pagos", module: "Finanzas" },
  { key: "approve_payouts", label: "Aprobar payouts", module: "Finanzas" },
  { key: "view_contracts", label: "Ver contratos", module: "Legal" },
  { key: "sign_contracts", label: "Firmar contratos", module: "Legal" },
  { key: "export_data", label: "Exportar datos", module: "Sistema" },
  { key: "system_config", label: "Configurar sistema", module: "Sistema" },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setUsers(data)
      setTeam(data.filter(u => ["admin", "super_admin", "operations", "finance", "legal", "support", "audit"].includes(u.role)))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    const supabase = createClient()

    const { error } = await supabase.from("users").update({ role: newRole, updated_at: new Date().toISOString() }).eq("id", userId)

    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast.success(`Rol actualizado a ${newRole}`)
    } else {
      toast.error("Error al actualizar el rol")
    }
    setUpdating(null)
  }

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    const supabase = createClient()
    await supabase.from("users").update({ suspended: suspend, updated_at: new Date().toISOString() }).eq("id", userId)
    setUsers(users.map((u) => (u.id === userId ? { ...u, suspended: suspend } : u)))
    toast.success(suspend ? "Usuario suspendido" : "Usuario reactivado")
  }

  const openPermissions = (user: any) => {
    setSelectedUser(user)
    setUserPermissions(user.permissions || [])
    setIsPermissionsOpen(true)
  }

  const togglePermission = (key: string) => {
    setUserPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const savePermissions = async () => {
    if (!selectedUser) return
    const supabase = createClient()
    await supabase.from("users").update({ permissions: userPermissions }).eq("id", selectedUser.id)
    setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, permissions: userPermissions } : u)))
    setIsPermissionsOpen(false)
    toast.success("Permisos actualizados")
  }

  const exportUsers = () => {
    const csv = [
      ["ID", "Email", "Nombre", "Rol", "KYC", "Creado"].join(","),
      ...filteredUsers.map(u => [u.id, u.email, u.full_name || "", u.role || "user", u.kyc_status || "pending", u.created_at].join(","))
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `usuarios-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getFilteredUsers = () => {
    let filtered = users

    if (activeTab === "team") {
      filtered = team
    } else if (activeTab === "brokers") {
      filtered = users.filter(u => u.role === "broker")
    } else if (activeTab === "owners") {
      filtered = users.filter(u => u.role === "owner")
    } else if (activeTab === "members") {
      filtered = users.filter(u => u.role === "member" || u.role === "user")
    }

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    return filtered
  }

  const filteredUsers = getFilteredUsers()
  const getRoleConfig = (role: string) => ROLES.find(r => r.value === role) || ROLES[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion de Usuarios</h1>
          <p className="text-slate-500">Administra usuarios, equipo interno y permisos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers} className="border-sky-500/20">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Button onClick={fetchData} className="bg-sky-500 hover:bg-sky-600">
            <Users className="h-4 w-4 mr-2" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 rounded-xl"><Users className="h-5 w-5 text-sky-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-xl"><UserCog className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{team.length}</p>
                <p className="text-xs text-slate-500">Equipo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl"><Briefcase className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === "broker").length}</p>
                <p className="text-xs text-slate-500">Brokers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl"><Building2 className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === "owner").length}</p>
                <p className="text-xs text-slate-500">Owners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-xl"><CreditCard className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === "member" || u.role === "user").length}</p>
                <p className="text-xs text-slate-500">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="team">Equipo Interno</TabsTrigger>
              <TabsTrigger value="brokers">WEEK-AGENTS</TabsTrigger>
              <TabsTrigger value="owners">Owners</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-sky-500/20" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 border-sky-500/20">
                <Filter className="h-4 w-4 mr-2 text-sky-500" />
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <User className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No se encontraron usuarios</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const roleConfig = getRoleConfig(user.role || "user")
                return (
                  <div key={user.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border ${user.suspended ? "border-red-200 bg-red-50/50" : "border-sky-500/20 bg-white"} gap-4`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${user.suspended ? "bg-red-400" : "bg-gradient-to-br from-sky-500 to-blue-600"}`}>
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 truncate">{user.full_name || "Usuario"}</h3>
                          {user.suspended && <Badge className="bg-red-100 text-red-700 border-red-200">Suspendido</Badge>}
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${roleConfig.color}`}>{roleConfig.label}</Badge>
                          {user.kyc_status === "approved" && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">KYC OK</Badge>}
                          {user.kyc_status === "pending" && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">KYC Pendiente</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Select value={user.role || "user"} onValueChange={(v) => handleRoleChange(user.id, v)} disabled={updating === user.id}>
                        <SelectTrigger className="w-[140px] border-sky-500/20">
                          {updating === user.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Shield className="h-3 w-3 mr-1" />}
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="sm" onClick={() => openPermissions(user)} className="border-sky-500/20">
                        <Lock className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPermissions(user)}><Lock className="h-4 w-4 mr-2" />Permisos</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.suspended ? (
                            <DropdownMenuItem onClick={() => handleSuspendUser(user.id, false)} className="text-emerald-600">
                              <Unlock className="h-4 w-4 mr-2" />Reactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleSuspendUser(user.id, true)} className="text-red-600">
                              <Lock className="h-4 w-4 mr-2" />Suspender
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-sky-500" />
              Permisos de {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
            {["Usuarios", "Propiedades", "SVC", "Finanzas", "Legal", "Sistema"].map((module) => (
              <div key={module} className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">{module}</h4>
                <div className="space-y-2">
                  {PERMISSIONS.filter(p => p.module === module).map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-sm text-slate-600">{perm.label}</span>
                      <Switch checked={userPermissions.includes(perm.key)} onCheckedChange={() => togglePermission(perm.key)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setIsPermissionsOpen(false)}>Cancelar</Button>
            <Button className="flex-1 bg-sky-500 hover:bg-sky-600" onClick={savePermissions}>Guardar Permisos</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
