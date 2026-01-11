"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { FileText, CheckCircle, Clock, Search, Eye, Filter, Building2, Users, TrendingUp, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

function NotariaDashboardContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [stats, setStats] = useState({
    pendingReviews: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    totalProcessed: 0,
    pendingKYC: 0,
    pendingProperties: 0,
    pendingContracts: 0,
    avgReviewTime: 0,
    complianceRate: 0,
    thisMonthReviews: 0,
  })

  const [recentDocuments, setRecentDocuments] = useState<any[]>([])
  const [propertySubmissions, setPropertySubmissions] = useState<any[]>([])
  const [kycQueue, setKycQueue] = useState<any[]>([])

  const [reviewData, setReviewData] = useState<any[]>([])
  const [documentTypes, setDocumentTypes] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()

    const [kyc, properties, contracts] = await Promise.all([
      supabase.from("kyc_users").select("*").order("submitted_at", { ascending: false }),
      supabase
        .from("property_submissions")
        .select("*")
        .eq("status", "notary_review")
        .order("created_at", { ascending: false }),
      supabase
        .from("contract_signatures")
        .select("*")
        .eq("status", "pending_notary")
        .order("created_at", { ascending: false }),
    ])

    const pendingKYC = kyc.data?.filter((k) => k.status === "pending").length || 0
    const approvedKYC = kyc.data?.filter((k) => k.status === "approved").length || 0
    const rejectedKYC = kyc.data?.filter((k) => k.status === "rejected").length || 0

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthReviews = kyc.data?.filter((k) => k.reviewed_at && new Date(k.reviewed_at) >= monthStart).length || 0

    const complianceRate = kyc.data && kyc.data.length > 0 ? (approvedKYC / kyc.data.length) * 100 : 0

    setStats({
      pendingReviews: pendingKYC + (properties.data?.length || 0) + (contracts.data?.length || 0),
      approvedDocuments: approvedKYC,
      rejectedDocuments: rejectedKYC,
      totalProcessed: approvedKYC + rejectedKYC,
      pendingKYC: pendingKYC,
      pendingProperties: properties.data?.length || 0,
      pendingContracts: contracts.data?.length || 0,
      avgReviewTime: 2.5,
      complianceRate: complianceRate,
      thisMonthReviews: thisMonthReviews,
    })

    const allDocs = [
      ...(kyc.data
        ?.filter((k) => k.status === "pending")
        .slice(0, 5)
        .map((k) => ({
          id: k.id,
          type: "KYC",
          title: k.name || k.email,
          status: k.status,
          date: k.submitted_at,
          priority: "high",
        })) || []),
      ...(properties.data?.slice(0, 5).map((p) => ({
        id: p.id,
        type: "Property",
        title: p.property_name,
        status: p.status,
        date: p.created_at,
        priority: "medium",
      })) || []),
      ...(contracts.data?.slice(0, 5).map((c) => ({
        id: c.id,
        type: "Contract",
        title: `Contract #${c.id.substring(0, 8)}`,
        status: c.status,
        date: c.created_at,
        priority: "high",
      })) || []),
    ]

    setRecentDocuments(allDocs)
    setPropertySubmissions(properties.data || [])
    setKycQueue(kyc.data?.filter((k) => k.status === "pending") || [])

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      const monthReviews =
        kyc.data?.filter((k) => {
          if (!k.reviewed_at) return false
          const reviewDate = new Date(k.reviewed_at)
          return reviewDate.getMonth() === d.getMonth() && reviewDate.getFullYear() === d.getFullYear()
        }) || []

      return {
        month: d.toLocaleDateString("es-ES", { month: "short" }),
        approved: monthReviews.filter((k) => k.status === "approved").length,
        rejected: monthReviews.filter((k) => k.status === "rejected").length,
      }
    })
    setReviewData(last6Months)

    const docTypes = [
      { name: "KYC", value: pendingKYC, color: "#f59e0b" },
      { name: "Propiedades", value: properties.data?.length || 0, color: "#3b82f6" },
      { name: "Contratos", value: contracts.data?.length || 0, color: "#8b5cf6" },
    ]
    setDocumentTypes(docTypes)

    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 bg-clip-text text-transparent">
                Dashboard Notaría
              </h1>
              <p className="text-slate-600 mt-2">Gestión de documentos legales y verificación</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/dashboard/notaria/property-reviews")} variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Revisar Propiedades
              </Button>
              <Button
                onClick={() => router.push("/dashboard/admin/kyc")}
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white"
              >
                <Users className="mr-2 h-4 w-4" />
                Verificar KYC
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-orange-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Revisiones Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.pendingReviews}</div>
                <div className="mt-1 flex items-center text-xs text-slate-500">
                  <span>{stats.pendingKYC} KYC</span>
                  <span className="mx-1">•</span>
                  <span>{stats.pendingProperties} propiedades</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Documentos Aprobados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.approvedDocuments}</div>
                <div className="mt-1 flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  <span>{stats.thisMonthReviews} este mes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tasa de Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.complianceRate.toFixed(1)}%</div>
                <p className="text-xs text-slate-500 mt-1">Aprobación promedio</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tiempo Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.avgReviewTime}h</div>
                <p className="text-xs text-slate-500 mt-1">Por revisión</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="queue" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="queue">Cola de Revisión</TabsTrigger>
              <TabsTrigger value="properties">Propiedades</TabsTrigger>
              <TabsTrigger value="kyc">KYC</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Documentos Pendientes</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="Buscar documentos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (doc.type === "Property") {
                            router.push(`/dashboard/notaria/property-reviews/${doc.id}`)
                          }
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 flex items-center justify-center">
                            {doc.type === "KYC" && <Users className="h-5 w-5 text-white" />}
                            {doc.type === "Property" && <Building2 className="h-5 w-5 text-white" />}
                            {doc.type === "Contract" && <FileText className="h-5 w-5 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900">{doc.title}</h4>
                              <Badge className={getPriorityColor(doc.priority)}>{doc.priority}</Badge>
                            </div>
                            <p className="text-sm text-slate-500">
                              {doc.type} • {new Date(doc.date).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Propiedades en Revisión</CardTitle>
                  <CardDescription>Verificación legal de propiedades para tokenización</CardDescription>
                </CardHeader>
                <CardContent>
                  {propertySubmissions.length > 0 ? (
                    <div className="space-y-3">
                      {propertySubmissions.map((prop) => (
                        <div
                          key={prop.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/notaria/property-reviews/${prop.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-semibold text-slate-900">{prop.property_name}</h4>
                              <p className="text-sm text-slate-500">{prop.property_location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">${prop.total_value_usd?.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">{prop.weeks_to_tokenize} semanas</p>
                            </div>
                            <Button size="sm">Revisar</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No hay propiedades pendientes de revisión</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kyc" className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Cola de Verificación KYC</CardTitle>
                  <CardDescription>Verificación de identidad de usuarios</CardDescription>
                </CardHeader>
                <CardContent>
                  {kycQueue.length > 0 ? (
                    <div className="space-y-3">
                      {kycQueue.slice(0, 10).map((kyc) => (
                        <div
                          key={kyc.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Users className="h-8 w-8 text-purple-600" />
                            <div>
                              <h4 className="font-semibold text-slate-900">{kyc.name || "Usuario"}</h4>
                              <p className="text-sm text-slate-500">
                                {kyc.email} • {kyc.country}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                              {new Date(kyc.submitted_at).toLocaleDateString("es-ES")}
                            </span>
                            <Button size="sm" onClick={() => router.push(`/dashboard/admin/kyc`)}>
                              Verificar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-slate-600">No hay verificaciones KYC pendientes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Revisiones por Mes</CardTitle>
                    <CardDescription>Aprobadas vs Rechazadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        approved: {
                          label: "Aprobadas",
                          color: "hsl(var(--chart-1))",
                        },
                        rejected: {
                          label: "Rechazadas",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reviewData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip />
                          <Bar dataKey="approved" fill="#10b981" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="rejected" fill="#ef4444" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Distribución de Documentos</CardTitle>
                    <CardDescription>Por tipo de documento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: {
                          label: "Documentos",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={documentTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {documentTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/90 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Tasa de Aprobación</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{stats.complianceRate.toFixed(1)}%</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Tiempo Promedio</span>
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{stats.avgReviewTime}h</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Este Mes</span>
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{stats.thisMonthReviews}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default function NotariaDashboard() {
  return (
    <RoleGuard allowedRoles={["notaria", "admin"]}>
      <NotariaDashboardContent />
    </RoleGuard>
  )
}
