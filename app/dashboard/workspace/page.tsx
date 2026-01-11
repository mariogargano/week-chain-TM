"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Video,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Building2,
  TrendingUp,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Bell,
  Settings,
  ShieldAlert,
  Lock,
} from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { logger } from "@/lib/config/logger"
import { useRouter } from "next/navigation"

interface TeamMember {
  id: string
  name: string
  role: string
  wallet_address: string
  status: "online" | "offline" | "busy"
  avatar?: string
}

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  status: "pending" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date: string
}

export default function TeamWorkspace() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeTasks: 0,
    completedToday: 0,
    upcomingMeetings: 0,
  })

  useEffect(() => {
    verifyAccess()
  }, [])

  const verifyAccess = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setIsAuthorized(false)
        setAuthError("Debes iniciar sesión con tu email oficial de WEEK-CHAIN para acceder al workspace.")
        logger.warn("Workspace access denied: No authenticated user")
        return
      }

      setUserEmail(user.email || "")

      const officialDomains = ["@weekchain.com", "@week-chain.com", "@weekchain.mx", "@morises.com"]
      const isOfficialEmail = officialDomains.some((domain) => user.email?.toLowerCase().endsWith(domain))

      if (!isOfficialEmail) {
        setIsAuthorized(false)
        setAuthError(
          "Acceso denegado. Solo miembros del equipo WEEK-CHAIN con email oficial pueden acceder al workspace.",
        )
        logger.warn("Workspace access denied: Unauthorized email domain", { email: user.email })
        return
      }

      setIsAuthorized(true)
      logger.info("Workspace access granted", { email: user.email })

      // Si está autorizado, cargar los datos del workspace
      fetchWorkspaceData()
    } catch (error) {
      setIsAuthorized(false)
      setAuthError("Error al verificar acceso. Por favor intenta de nuevo.")
      logger.error("Error verifying workspace access", { error })
    }
  }

  const fetchWorkspaceData = async () => {
    try {
      const supabase = createClient()

      // Fetch team members from admin_wallets
      const { data: members } = await supabase.from("admin_wallets").select("wallet_address, role, name").order("name")

      if (members) {
        setTeamMembers(
          members.map((m) => ({
            id: m.wallet_address,
            name: m.name,
            role: m.role === "of_counsel" ? "Of Counsel Internacional" : m.role,
            wallet_address: m.wallet_address,
            status: "online" as const,
          })),
        )
      }

      // Mock tasks data (you can replace with real data from your database)
      setTasks([
        {
          id: "1",
          title: "Revisar propiedades nuevas",
          description: "Verificar documentación de 3 propiedades pendientes",
          assignee: "Admin",
          status: "in_progress",
          priority: "high",
          due_date: "2025-01-15",
        },
        {
          id: "2",
          title: "Aprobar KYC usuarios",
          description: "5 usuarios pendientes de verificación",
          assignee: "Notaría",
          status: "pending",
          priority: "high",
          due_date: "2025-01-14",
        },
        {
          id: "3",
          title: "Seguimiento ventas",
          description: "Contactar clientes potenciales",
          assignee: "Broker",
          status: "in_progress",
          priority: "medium",
          due_date: "2025-01-16",
        },
      ])

      setStats({
        totalMembers: members?.length || 0,
        activeTasks: 3,
        completedToday: 5,
        upcomingMeetings: 2,
      })

      logger.info("Workspace data loaded successfully")
    } catch (error) {
      logger.error("Error fetching workspace data", { error })
    }
  }

  const createGoogleMeet = () => {
    // Generate a unique meeting ID
    const meetingId = `week-chain-${Date.now()}`
    const meetUrl = `https://meet.google.com/new`
    window.open(meetUrl, "_blank")
    logger.info("Google Meet created", { meetingId })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-slate-300"
      default:
        return "bg-slate-300"
    }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { label: "Alta", variant: "destructive" as const },
      medium: { label: "Media", variant: "default" as const },
      low: { label: "Baja", variant: "secondary" as const },
    }
    const { label, variant } = config[priority as keyof typeof config] || config.low
    return <Badge variant={variant}>{label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "Pendiente", variant: "secondary" as const },
      in_progress: { label: "En Progreso", variant: "default" as const },
      completed: { label: "Completada", variant: "outline" as const },
    }
    const { label, variant } = config[status as keyof typeof config] || config.pending
    return <Badge variant={variant}>{label}</Badge>
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar user={true} />

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <Card className="max-w-2xl w-full border-red-200 bg-white">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-900">Acceso Restringido</CardTitle>
              <CardDescription className="text-base">{authError}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-amber-200 bg-amber-50">
                <Lock className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">Workspace Exclusivo para el Equipo</AlertTitle>
                <AlertDescription className="text-amber-800">
                  El workspace de WEEK-CHAIN es un espacio privado exclusivo para miembros del equipo con email oficial.
                  {userEmail && (
                    <div className="mt-2 p-2 bg-white rounded border border-amber-200">
                      <p className="text-sm">
                        <strong>Email actual:</strong> {userEmail}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Dominios de email autorizados:</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    @weekchain.com
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    @week-chain.com
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    @weekchain.mx
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    @morises.com
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1">
                  Volver al Dashboard
                </Button>
                <Button onClick={() => router.push("/contact")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Contactar Soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar user={true} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-slate-600">Verificando acceso al workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar user={true} />

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Oficina Virtual WEEK-CHAIN
              </h1>
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Acceso Autorizado
              </Badge>
            </div>
            <p className="text-slate-600">Centro de colaboración y gestión del equipo • {userEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Miembros del Equipo</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalMembers}</div>
              <p className="text-xs text-green-600 mt-1">Todos activos</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tareas Activas</CardTitle>
              <CheckCircle className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.activeTasks}</div>
              <p className="text-xs text-slate-500 mt-1">En progreso</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completadas Hoy</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.completedToday}</div>
              <p className="text-xs text-green-600 mt-1">+2 vs ayer</p>
            </CardContent>
          </Card>

          <Card className="border-pink-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Reuniones Próximas</CardTitle>
              <Calendar className="h-5 w-5 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.upcomingMeetings}</div>
              <p className="text-xs text-slate-500 mt-1">Esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Team & Meetings */}
          <div className="space-y-6">
            {/* Google Meet Quick Access */}
            <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Video className="h-5 w-5" />
                  Google Meet
                </CardTitle>
                <CardDescription className="text-green-700">Iniciar reunión instantánea</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={createGoogleMeet}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Nueva Reunión
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Unirse con Código
                </Button>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="border-slate-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Equipo
                </CardTitle>
                <CardDescription>Miembros activos del equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-slate-200 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Accesos Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/dashboard/admin/properties">
                    <Building2 className="mr-2 h-4 w-4" />
                    Propiedades
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/dashboard/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Usuarios
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/dashboard/admin/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analytics
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/dashboard/admin/kyc">
                    <FileText className="mr-2 h-4 w-4" />
                    KYC
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tasks & Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="tasks" className="space-y-4">
              <TabsList className="bg-white/90 backdrop-blur-sm border border-slate-200">
                <TabsTrigger value="tasks">Tareas</TabsTrigger>
                <TabsTrigger value="calendar">Calendario</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
              </TabsList>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Tareas del Equipo</h3>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Tarea
                  </Button>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <Card key={task.id} className="border-slate-200 bg-white/90 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900">{task.title}</h4>
                              {getPriorityBadge(task.priority)}
                              {getStatusBadge(task.status)}
                            </div>
                            <p className="text-sm text-slate-600">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {task.assignee}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar" className="space-y-4">
                <Card className="border-slate-200 bg-white/90">
                  <CardHeader>
                    <CardTitle>Calendario del Equipo</CardTitle>
                    <CardDescription>Reuniones y eventos programados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Reunión de Equipo</p>
                          <p className="text-sm text-slate-600">Hoy, 3:00 PM - 4:00 PM</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Video className="mr-2 h-4 w-4" />
                          Unirse
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Revisión de Propiedades</p>
                          <p className="text-sm text-slate-600">Mañana, 10:00 AM - 11:00 AM</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <Card className="border-slate-200 bg-white/90">
                  <CardHeader>
                    <CardTitle>Documentos Compartidos</CardTitle>
                    <CardDescription>Recursos y archivos del equipo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Manual de Operaciones", type: "PDF", size: "2.4 MB", updated: "Hace 2 días" },
                        { name: "Plantilla de Propiedades", type: "XLSX", size: "156 KB", updated: "Hace 1 semana" },
                        { name: "Guía de KYC", type: "PDF", size: "1.8 MB", updated: "Hace 3 días" },
                      ].map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <FileText className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{doc.name}</p>
                            <p className="text-xs text-slate-500">
                              {doc.type} • {doc.size} • {doc.updated}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card className="border-slate-200 bg-white/90">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Últimas acciones del equipo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          user: "Admin",
                          action: "aprobó una nueva propiedad",
                          time: "Hace 10 minutos",
                          icon: CheckCircle,
                          color: "text-green-600",
                        },
                        {
                          user: "Broker",
                          action: "cerró una venta",
                          time: "Hace 1 hora",
                          icon: TrendingUp,
                          color: "text-blue-600",
                        },
                        {
                          user: "Notaría",
                          action: "verificó documentos KYC",
                          time: "Hace 2 horas",
                          icon: FileText,
                          color: "text-purple-600",
                        },
                        {
                          user: "Management",
                          action: "programó mantenimiento",
                          time: "Hace 3 horas",
                          icon: Clock,
                          color: "text-orange-600",
                        },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`mt-0.5 ${activity.color}`}>
                            <activity.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">
                              <span className="font-medium">{activity.user}</span> {activity.action}
                            </p>
                            <p className="text-xs text-slate-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
