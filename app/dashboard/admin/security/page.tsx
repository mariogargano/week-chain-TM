"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShieldCheck, ShieldAlert, Search, Loader2, Download } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface UserSecurityStatus {
  id: string
  email: string
  role: string
  two_factor_enabled: boolean
  two_factor_enabled_at: string | null
  two_factor_last_used: string | null
  created_at: string
}

export default function AdminSecurityPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserSecurityStatus[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserSecurityStatus[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filter2FA, setFilter2FA] = useState<string>("all")

  const supabase = createBrowserClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, filterRole, filter2FA, users])

  async function loadUsers() {
    try {
      setLoading(true)

      // Obtener usuarios con su configuración 2FA
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Obtener configuración 2FA de todos los usuarios
      const { data: twoFactorData, error: twoFactorError } = await supabase
        .from("user_two_factor")
        .select("user_id, enabled, enabled_at, last_used_at")

      if (twoFactorError) throw twoFactorError

      // Combinar datos
      const combinedData: UserSecurityStatus[] = usersData.map((user) => {
        const twoFactor = twoFactorData.find((tf) => tf.user_id === user.id)
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          two_factor_enabled: twoFactor?.enabled || false,
          two_factor_enabled_at: twoFactor?.enabled_at || null,
          two_factor_last_used: twoFactor?.last_used_at || null,
          created_at: user.created_at,
        }
      })

      setUsers(combinedData)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    let filtered = users

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtrar por rol
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole)
    }

    // Filtrar por 2FA
    if (filter2FA === "enabled") {
      filtered = filtered.filter((user) => user.two_factor_enabled)
    } else if (filter2FA === "disabled") {
      filtered = filtered.filter((user) => !user.two_factor_enabled)
    }

    setFilteredUsers(filtered)
  }

  function exportToCSV() {
    const csv = [
      ["Email", "Rol", "2FA Habilitado", "2FA Habilitado En", "Último Uso 2FA", "Creado"],
      ...filteredUsers.map((user) => [
        user.email,
        user.role,
        user.two_factor_enabled ? "Sí" : "No",
        user.two_factor_enabled_at || "N/A",
        user.two_factor_last_used || "N/A",
        new Date(user.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `security-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: users.length,
    with2FA: users.filter((u) => u.two_factor_enabled).length,
    without2FA: users.filter((u) => !u.two_factor_enabled).length,
    adminsWithout2FA: users.filter(
      (u) => ["admin", "super_admin", "management", "notaria"].includes(u.role) && !u.two_factor_enabled,
    ).length,
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Seguridad de Usuarios</h1>
        <p className="text-muted-foreground">Monitorea el estado de 2FA de todos los usuarios</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Usuarios</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Con 2FA</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl text-green-600">
              <ShieldCheck className="h-6 w-6" />
              {stats.with2FA}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sin 2FA</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl text-orange-600">
              <ShieldAlert className="h-6 w-6" />
              {stats.without2FA}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Admins sin 2FA</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl text-red-600">
              <ShieldAlert className="h-6 w-6" />
              {stats.adminsWithout2FA}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="management">Management</option>
              <option value="notaria">Notaría</option>
              <option value="broker">Broker</option>
              <option value="user">Usuario</option>
            </select>
            <select
              value={filter2FA}
              onChange={(e) => setFilter2FA(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="all">Todos (2FA)</option>
              <option value="enabled">Con 2FA</option>
              <option value="disabled">Sin 2FA</option>
            </select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado 2FA</TableHead>
                <TableHead>Habilitado</TableHead>
                <TableHead>Último Uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.two_factor_enabled ? (
                      <Badge variant="default" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Habilitado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        Deshabilitado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.two_factor_enabled_at ? new Date(user.two_factor_enabled_at).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    {user.two_factor_last_used ? new Date(user.two_factor_last_used).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
