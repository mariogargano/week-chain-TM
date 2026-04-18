"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Inbox,
  Mail,
  MailOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

interface ContactRequest {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  category: string
  message: string
  status: "pending" | "in_progress" | "resolved" | "archived"
  priority: "low" | "normal" | "high" | "urgent"
  created_at: string
  assigned_to_admin?: { id: string; name: string; email: string }
  resolution_notes?: string
}

export default function AdminContactInboxPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [resolutionNotes, setResolutionNotes] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, categoryFilter, priorityFilter])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
      })

      const response = await fetch(`/api/admin/contact-requests?${params}`)
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error("[v0] Error fetching contact requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRequest = async (requestId: string, updates: Partial<ContactRequest>) => {
    try {
      const response = await fetch("/api/admin/contact-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, ...updates }),
      })

      if (response.ok) {
        fetchRequests()
        if (selectedRequest?.id === requestId) {
          setSelectedRequest(null)
        }
      }
    } catch (error) {
      console.error("[v0] Error updating contact request:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: "bg-yellow-500", icon: Clock, label: "Pendiente" },
      in_progress: { color: "bg-blue-500", icon: AlertCircle, label: "En Progreso" },
      resolved: { color: "bg-green-500", icon: CheckCircle2, label: "Resuelto" },
      archived: { color: "bg-gray-500", icon: XCircle, label: "Archivado" },
    }
    const { color, icon: Icon, label } = config[status as keyof typeof config]
    return (
      <Badge className={`${color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-slate-500",
      normal: "bg-blue-500",
      high: "bg-orange-500",
      urgent: "bg-red-500",
    }
    return <Badge className={`${colors[priority as keyof typeof colors]} text-white`}>{priority.toUpperCase()}</Badge>
  }

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
    total: requests.length,
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Contact Inbox</h1>
            <p className="text-slate-600">Gestiona las solicitudes de contacto de usuarios</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-10 w-10 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">En Progreso</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Resueltos</p>
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <Inbox className="h-10 w-10 text-slate-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="purchase">Contratación</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="broker">Intermediarios</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={fetchRequests} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* List */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-500">Cargando solicitudes...</p>
                  </CardContent>
                </Card>
              ) : requests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Inbox className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No hay solicitudes con estos filtros</p>
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card
                    key={request.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedRequest?.id === request.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {request.status === "pending" ? (
                              <Mail className="h-5 w-5 text-slate-400" />
                            ) : (
                              <MailOpen className="h-5 w-5 text-slate-400" />
                            )}
                            <CardTitle className="text-base">{request.subject}</CardTitle>
                          </div>
                          <CardDescription>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3" />
                              {request.name} • {request.email}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(request.status)}
                          {getPriorityBadge(request.priority)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleDateString("es-MX")}
                        </div>
                        <Badge variant="outline">{request.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:sticky lg:top-8 h-fit">
              {selectedRequest ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Detalle de Solicitud</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Info */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Información del Usuario</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Nombre:</span> {selectedRequest.name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {selectedRequest.email}
                        </p>
                        {selectedRequest.phone && (
                          <p>
                            <span className="font-medium">Teléfono:</span> {selectedRequest.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Mensaje</h3>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedRequest.message}</p>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Actualizar Estado</h3>
                      <div className="flex gap-2">
                        {["pending", "in_progress", "resolved", "archived"].map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={selectedRequest.status === status ? "default" : "outline"}
                            onClick={() => updateRequest(selectedRequest.id, { status: status as any })}
                          >
                            {status.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Priority Update */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Actualizar Prioridad</h3>
                      <Select
                        value={selectedRequest.priority}
                        onValueChange={(value) => updateRequest(selectedRequest.id, { priority: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Resolution Notes */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Notas de Resolución</h3>
                      <Textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Agregar notas sobre la resolución..."
                        rows={4}
                      />
                      <Button
                        className="mt-2 w-full"
                        onClick={() => {
                          updateRequest(selectedRequest.id, {
                            resolution_notes: resolutionNotes,
                            status: "resolved",
                          })
                          setResolutionNotes("")
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Resuelto
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Selecciona una solicitud para ver los detalles</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
