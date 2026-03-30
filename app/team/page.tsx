"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Vote, 
  MessageSquare, 
  FileText, 
  Settings, 
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Briefcase,
  BarChart3,
  Lock
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const TEAM_ROLES = ["admin", "super_admin", "broker", "staff", "notaria", "service_provider", "owner"]

export default function TeamVirtualOfficePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Inicia sesion para acceder")
      router.push("/auth?redirect=/team")
      return
    }

    setUser(user)

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profileData || !TEAM_ROLES.includes(profileData.role)) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    setProfile(profileData)
    setHasAccess(true)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-sky-400 animate-pulse" />
          <p className="text-slate-400">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-500/30 bg-red-950/30">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-red-100 mb-2">Acceso Restringido</h2>
            <p className="text-red-300 mb-4">
              Esta area es exclusiva para miembros del equipo WEEK-CHAIN.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                  Oficina Virtual
                </Badge>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  {profile?.role?.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-white">WEEK-CHAIN DAO</h1>
              <p className="text-slate-400">Bienvenido, {profile?.full_name || user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${profile?.role || 'member'}`}>
                  Mi Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">24</p>
                  <p className="text-xs text-slate-400">Miembros Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Vote className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">3</p>
                  <p className="text-xs text-slate-400">Votaciones Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">$45K</p>
                  <p className="text-xs text-slate-400">Ventas Este Mes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-xs text-slate-400">Tareas Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="governance" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="governance" className="data-[state=active]:bg-sky-500">
              <Vote className="h-4 w-4 mr-2" />
              Gobernanza
            </TabsTrigger>
            <TabsTrigger value="proposals" className="data-[state=active]:bg-sky-500">
              <FileText className="h-4 w-4 mr-2" />
              Propuestas
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-sky-500">
              <Users className="h-4 w-4 mr-2" />
              Equipo
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-sky-500">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reportes
            </TabsTrigger>
          </TabsList>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Vote className="h-5 w-5 text-emerald-400" />
                    Votaciones Activas
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Participa en las decisiones importantes del proyecto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Expansion a nuevos destinos (Costa Rica)", votes: 18, total: 24, ends: "2 dias" },
                    { title: "Actualizacion de comisiones brokers", votes: 12, total: 24, ends: "5 dias" },
                    { title: "Nuevo partner de pagos", votes: 8, total: 24, ends: "7 dias" },
                  ].map((vote, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm">{vote.title}</h4>
                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {vote.ends}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(vote.votes / vote.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{vote.votes}/{vote.total}</span>
                      </div>
                      <Button size="sm" className="mt-3 w-full bg-sky-500 hover:bg-sky-600">
                        Votar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Modelo DAO
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Estructura de gobernanza descentralizada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-sky-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="font-semibold text-white mb-2">Como funciona</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                        <span>Cada miembro del equipo tiene voz y voto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                        <span>Las decisiones importantes se votan colectivamente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                        <span>Transparencia total en las operaciones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                        <span>Distribucion equitativa de responsabilidades</span>
                      </li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">67%</p>
                      <p className="text-xs text-slate-400">Quorum Requerido</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">7 dias</p>
                      <p className="text-xs text-slate-400">Periodo de Votacion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Propuestas</CardTitle>
                  <CardDescription className="text-slate-400">
                    Crea y gestiona propuestas para el equipo
                  </CardDescription>
                </div>
                <Button className="bg-sky-500 hover:bg-sky-600">
                  Nueva Propuesta
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Implementar sistema de bonos trimestrales", author: "Mario G.", status: "En votacion", date: "Hace 2 dias" },
                    { title: "Agregar destinos en Europa", author: "Ana L.", status: "Aprobada", date: "Hace 1 semana" },
                    { title: "Actualizar terminos de servicio", author: "Carlos M.", status: "Pendiente", date: "Hace 3 dias" },
                  ].map((proposal, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{proposal.title}</h4>
                        <p className="text-sm text-slate-400">Por {proposal.author} - {proposal.date}</p>
                      </div>
                      <Badge 
                        className={
                          proposal.status === "Aprobada" ? "bg-emerald-500/20 text-emerald-400" :
                          proposal.status === "En votacion" ? "bg-amber-500/20 text-amber-400" :
                          "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {proposal.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Miembros del Equipo</CardTitle>
                <CardDescription className="text-slate-400">
                  Directorio de todos los colaboradores activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Mario Gargano", role: "Admin", status: "online" },
                    { name: "Ana Lopez", role: "Broker", status: "online" },
                    { name: "Carlos Martinez", role: "Staff", status: "away" },
                    { name: "Maria Garcia", role: "Notaria", status: "offline" },
                    { name: "Juan Perez", role: "Broker", status: "online" },
                    { name: "Sofia Ruiz", role: "Service Provider", status: "online" },
                  ].map((member, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${
                          member.status === "online" ? "bg-emerald-500" :
                          member.status === "away" ? "bg-amber-500" : "bg-slate-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Metricas del Mes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-400">Certificados Vendidos</span>
                    <span className="font-bold text-white">47</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-400">Ingresos Totales</span>
                    <span className="font-bold text-emerald-400">$187,500 USD</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-400">Nuevos Usuarios</span>
                    <span className="font-bold text-white">156</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-400">Tasa de Conversion</span>
                    <span className="font-bold text-sky-400">4.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    Proximos Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Reunion semanal equipo", date: "Lunes 10:00 AM", type: "meeting" },
                    { title: "Cierre votacion destinos", date: "Miercoles", type: "deadline" },
                    { title: "Capacitacion brokers", date: "Viernes 3:00 PM", type: "training" },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        event.type === "meeting" ? "bg-sky-500/10" :
                        event.type === "deadline" ? "bg-red-500/10" : "bg-purple-500/10"
                      }`}>
                        <Calendar className={`h-4 w-4 ${
                          event.type === "meeting" ? "text-sky-400" :
                          event.type === "deadline" ? "text-red-400" : "text-purple-400"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{event.title}</p>
                        <p className="text-xs text-slate-400">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
