"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MessageSquare, FileText, CheckCircle2, Clock, Briefcase, Mail } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/role-guard"

function StaffDashboardContent() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedToday: 0,
    unreadMessages: 0,
    upcomingMeetings: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Mock data for staff dashboard
      setStats({
        pendingTasks: 8,
        completedToday: 12,
        unreadMessages: 5,
        upcomingMeetings: 3,
      })
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB7B2] to-[#FFDAC1]">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard de Personal</h1>
            <p className="text-slate-600">Gestión de tareas y comunicación del equipo</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-[#FFB7B2]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Tareas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.pendingTasks}</div>
              <Clock className="h-8 w-8 text-[#FFB7B2]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#B5EAD7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Completadas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.completedToday}</div>
              <CheckCircle2 className="h-8 w-8 text-[#B5EAD7]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Tareas finalizadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C7CEEA]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Mensajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.unreadMessages}</div>
              <Mail className="h-8 w-8 text-[#C7CEEA]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Sin leer</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFDAC1]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Reuniones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.upcomingMeetings}</div>
              <Calendar className="h-8 w-8 text-[#FFDAC1]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Próximas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Mis Tareas</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Tareas Asignadas
              </CardTitle>
              <CardDescription>Gestiona tus tareas diarias y proyectos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Revisar documentación de propiedad #123",
                    priority: "Alta",
                    dueDate: "Hoy",
                    status: "Pendiente",
                  },
                  {
                    title: "Coordinar con equipo de mantenimiento",
                    priority: "Media",
                    dueDate: "Mañana",
                    status: "En Progreso",
                  },
                  {
                    title: "Actualizar base de datos de clientes",
                    priority: "Baja",
                    dueDate: "Esta semana",
                    status: "Pendiente",
                  },
                  {
                    title: "Preparar reporte mensual",
                    priority: "Alta",
                    dueDate: "Viernes",
                    status: "Pendiente",
                  },
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#FFB7B2] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <input type="checkbox" className="h-5 w-5 rounded border-slate-300" />
                      <div>
                        <h4 className="font-semibold text-slate-900">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={task.priority === "Alta" ? "destructive" : "secondary"} className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.dueDate}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensajes del Equipo
              </CardTitle>
              <CardDescription>Comunicación interna y notificaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No hay mensajes nuevos</p>
                <p className="text-sm text-slate-500">Los mensajes del equipo aparecerán aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendario y Reuniones
              </CardTitle>
              <CardDescription>Próximos eventos y reuniones programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Reunión de equipo semanal",
                    time: "10:00 AM",
                    date: "Hoy",
                    type: "Reunión",
                  },
                  {
                    title: "Revisión de proyectos",
                    time: "2:00 PM",
                    date: "Mañana",
                    type: "Revisión",
                  },
                  {
                    title: "Capacitación: Nuevas herramientas",
                    time: "11:00 AM",
                    date: "Viernes",
                    type: "Capacitación",
                  },
                ].map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#C7CEEA]/10">
                        <Calendar className="h-6 w-6 text-[#C7CEEA]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        <p className="text-sm text-slate-600">
                          {event.date} - {event.time}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos y Recursos
              </CardTitle>
              <CardDescription>Acceso a documentos compartidos y recursos del equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: "Manual de Procedimientos", type: "PDF", size: "2.4 MB" },
                  { title: "Políticas de la Empresa", type: "PDF", size: "1.8 MB" },
                  { title: "Plantillas de Documentos", type: "ZIP", size: "5.2 MB" },
                  { title: "Guía de Recursos Humanos", type: "PDF", size: "3.1 MB" },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#C7CEEA] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C7CEEA]/10">
                        <FileText className="h-5 w-5 text-[#C7CEEA]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">{doc.title}</h4>
                        <p className="text-xs text-slate-600">
                          {doc.type} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/virtual-office">
                <Briefcase className="h-6 w-6" />
                <span>Oficina Virtual</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <MessageSquare className="h-6 w-6" />
              <span>Enviar Mensaje</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <span>Subir Documento</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Calendar className="h-6 w-6" />
              <span>Agendar Reunión</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffDashboard() {
  return (
    <RoleGuard allowedRoles={["staff", "admin"]}>
      <StaffDashboardContent />
    </RoleGuard>
  )
}
