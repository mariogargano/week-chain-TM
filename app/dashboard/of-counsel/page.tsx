"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scale, FileText, AlertCircle, CheckCircle2, Clock, Building2, Users, Globe, Shield, Gavel } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/role-guard"

export default function OfCounselDashboard() {
  return (
    <RoleGuard allowedRoles={["of_counsel", "admin"]}>
      <OfCounselDashboardContent />
    </RoleGuard>
  )
}

function OfCounselDashboardContent() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingReviews: 0,
    approvedProperties: 0,
    internationalCases: 0,
    activeConsultations: 0,
  })
  const [legalCases, setLegalCases] = useState<any[]>([])
  const [consultations, setConsultations] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      const supabase = createClient()

      // Get pending legal reviews
      const { data: pendingProps } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "legal_review")
        .order("created_at", { ascending: false })

      // Get approved properties
      const { data: approvedProps } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      // Mock data for international cases and consultations
      setStats({
        pendingReviews: pendingProps?.length || 0,
        approvedProperties: approvedProps?.length || 0,
        internationalCases: 12,
        activeConsultations: 8,
      })

      setLegalCases(pendingProps || [])
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
          <p className="text-muted-foreground">Cargando dashboard legal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C7CEEA] to-[#B5EAD7]">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Legal Internacional</h1>
            <p className="text-slate-600">Of Counsel - Asesoría Legal Especializada</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-[#FFB7B2]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Revisiones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.pendingReviews}</div>
              <AlertCircle className="h-8 w-8 text-[#FFB7B2]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Propiedades en revisión legal</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#B5EAD7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Propiedades Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.approvedProperties}</div>
              <CheckCircle2 className="h-8 w-8 text-[#B5EAD7]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Verificación legal completa</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C7CEEA]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Casos Internacionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.internationalCases}</div>
              <Globe className="h-8 w-8 text-[#C7CEEA]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Asesoría transfronteriza</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFDAC1]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Consultas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.activeConsultations}</div>
              <Users className="h-8 w-8 text-[#FFDAC1]" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Asesorías en curso</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reviews">Revisiones Legales</TabsTrigger>
          <TabsTrigger value="international">Casos Internacionales</TabsTrigger>
          <TabsTrigger value="consultations">Consultas</TabsTrigger>
          <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
        </TabsList>

        {/* Legal Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Propiedades en Revisión Legal
              </CardTitle>
              <CardDescription>Casos pendientes de verificación legal internacional</CardDescription>
            </CardHeader>
            <CardContent>
              {legalCases.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-[#B5EAD7] mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No hay casos pendientes</p>
                  <p className="text-sm text-slate-500">Todas las revisiones legales están al día</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {legalCases.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#C7CEEA] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#C7CEEA]/10">
                          <Building2 className="h-6 w-6 text-[#C7CEEA]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{property.name}</h4>
                          <p className="text-sm text-slate-600">{property.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(property.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/dashboard/of-counsel/review/${property.id}`}>Revisar Caso</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* International Cases Tab */}
        <TabsContent value="international" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Casos Internacionales
              </CardTitle>
              <CardDescription>Asesoría legal transfronteriza y cumplimiento internacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Verificación de Títulos - México",
                    status: "En Progreso",
                    priority: "Alta",
                    country: "MX",
                  },
                  {
                    title: "Cumplimiento Fiscal - USA",
                    status: "Revisión",
                    priority: "Media",
                    country: "US",
                  },
                  {
                    title: "Regulación NFT - Europa",
                    status: "Pendiente",
                    priority: "Alta",
                    country: "EU",
                  },
                ].map((caso, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#C7CEEA] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#C7CEEA]/10">
                        <Globe className="h-6 w-6 text-[#C7CEEA]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{caso.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {caso.country}
                          </Badge>
                          <Badge variant={caso.priority === "Alta" ? "destructive" : "secondary"} className="text-xs">
                            {caso.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {caso.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">Ver Detalles</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Consultas y Asesorías
              </CardTitle>
              <CardDescription>Solicitudes de asesoría legal especializada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No hay consultas pendientes</p>
                <p className="text-sm text-slate-500">Las nuevas solicitudes aparecerán aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cumplimiento Normativo
              </CardTitle>
              <CardDescription>Monitoreo de regulaciones y cumplimiento legal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    area: "Regulación de NFTs",
                    status: "Cumpliendo",
                    lastReview: "2025-01-15",
                    icon: Shield,
                  },
                  {
                    area: "Protección de Datos (GDPR)",
                    status: "Cumpliendo",
                    lastReview: "2025-01-10",
                    icon: FileText,
                  },
                  {
                    area: "Anti-Lavado de Dinero (AML)",
                    status: "Cumpliendo",
                    lastReview: "2025-01-12",
                    icon: Scale,
                  },
                  {
                    area: "Regulación Inmobiliaria",
                    status: "Revisión Pendiente",
                    lastReview: "2024-12-20",
                    icon: Building2,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B5EAD7]/10">
                        <item.icon className="h-5 w-5 text-[#B5EAD7]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.area}</h4>
                        <p className="text-sm text-slate-600">Última revisión: {item.lastReview}</p>
                      </div>
                    </div>
                    <Badge
                      variant={item.status === "Cumpliendo" ? "default" : "secondary"}
                      className={item.status === "Cumpliendo" ? "bg-[#B5EAD7] text-white" : "bg-[#FFB7B2] text-white"}
                    >
                      {item.status}
                    </Badge>
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
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <span>Generar Reporte Legal</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Globe className="h-6 w-6" />
              <span>Consultar Regulaciones</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Scale className="h-6 w-6" />
              <span>Revisar Contratos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
