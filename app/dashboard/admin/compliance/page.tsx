"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Search, RefreshCw, Eye, Users, Activity, Loader2, AlertOctagon, ShieldAlert, ShieldCheck, UserCheck, BadgeCheck, FileSearch, Scale, Globe, Flag, Download, ThumbsUp, ThumbsDown,  } from "lucide-react";

interface FraudAlert {
  id: string
  user_id: string
  alert_type: string
  severity: string
  status: string
  description: string
  created_at: string
  resolved_at?: string
  resolved_by?: string
  users?: { email: string; full_name: string }
}

interface KYCRecord {
  id: string
  user_id: string
  status: string
  document_type: string
  document_number?: string
  verification_date?: string
  expiry_date?: string
  risk_level: string
  users?: { email: string; full_name: string }
  created_at: string
}

interface AMLTransaction {
  id: string
  user_id: string
  amount: number
  currency: string
  risk_score: number
  flags: string[]
  status: string
  created_at: string
  users?: { email: string; full_name: string }
}

export default function ComplianceCenterPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([])
  const [amlTransactions, setAmlTransactions] = useState<AMLTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null)
  const [selectedKYC, setSelectedKYC] = useState<KYCRecord | null>(null)

  const [stats, setStats] = useState({
    pendingAlerts: 0,
    criticalAlerts: 0,
    kycPending: 0,
    kycApproved: 0,
    kycRejected: 0,
    amlFlagged: 0,
    complianceScore: 92,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch alerts
      const { data: alertsData } = await supabase
        .from("fraud_alerts")
        .select("*, users(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(100)

      // Fetch KYC records
      const { data: kycData } = await supabase
        .from("kyc_users")
        .select("*, users(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(100)

      // Fetch AML transactions (mock - create if table exists)
      const amlData: AMLTransaction[] = []

      setAlerts(alertsData || [])
      setKycRecords(kycData || [])
      setAmlTransactions(amlData)

      // Calculate stats
      const pendingAlerts = alertsData?.filter(a => a.status === "pending").length || 0
      const criticalAlerts = alertsData?.filter(a => a.severity === "critical" && a.status === "pending").length || 0
      const kycPending = kycData?.filter(k => k.status === "pending").length || 0
      const kycApproved = kycData?.filter(k => k.status === "approved" || k.status === "verified").length || 0
      const kycRejected = kycData?.filter(k => k.status === "rejected").length || 0

      setStats({
        pendingAlerts,
        criticalAlerts,
        kycPending,
        kycApproved,
        kycRejected,
        amlFlagged: 0,
        complianceScore: 92,
      })
    } catch (error) {
      console.error("Error fetching compliance data:", error)
    }
    setLoading(false)
  }

  const resolveAlert = async (alertId: string, resolution: "approved" | "rejected") => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase
        .from("fraud_alerts")
        .update({
          status: resolution === "approved" ? "cleared" : "flagged",
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq("id", alertId)

      fetchData()
      setSelectedAlert(null)
      alert(`Alerta ${resolution === "approved" ? "aprobada" : "rechazada"}`)
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
  }

  const updateKYCStatus = async (kycId: string, status: string, notes?: string) => {
    try {
      await supabase
        .from("kyc_users")
        .update({
          status,
          verification_date: status === "approved" ? new Date().toISOString() : null,
          notes,
        })
        .eq("id", kycId)

      fetchData()
      setSelectedKYC(null)
      alert(`KYC actualizado a ${status}`)
    } catch (error) {
      console.error("Error updating KYC:", error)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700 border border-red-200"><AlertOctagon className="h-3 w-3 mr-1" />Critico</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-700 border border-orange-200"><AlertTriangle className="h-3 w-3 mr-1" />Alto</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Flag className="h-3 w-3 mr-1" />Medio</Badge>
      case "low":
        return <Badge className="bg-sky-100 text-sky-700 border border-sky-200"><Activity className="h-3 w-3 mr-1" />Bajo</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case "approved": case"verified":
        return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200"><BadgeCheck className="h-3 w-3 mr-1" />Verificado</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border border-red-200"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>
      case "expired":
        return <Badge className="bg-slate-100 text-slate-700 border border-slate-200"><Clock className="h-3 w-3 mr-1" />Expirado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return <Badge className="bg-red-100 text-red-700">Alto Riesgo</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700">Riesgo Medio</Badge>
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-700">Bajo Riesgo</Badge>
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch =
      a.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.alert_type?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || a.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredKYC = kycRecords.filter(k => {
    const matchesSearch =
      k.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || k.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Centro de Compliance</h1>
          <p className="text-slate-500 mt-1">KYC/KYB, AML, Fraude y Auditoria - NOM-029 / GDPR</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="border-sky-500/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" className="border-sky-500/20">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Compliance Score Banner */}
      <Card className={`border-2 ${stats.complianceScore >= 90 ? "border-emerald-200 bg-emerald-50/30" : stats.complianceScore >= 70 ? "border-amber-200 bg-amber-50/30" : "border-red-200 bg-red-50/30"}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stats.complianceScore >= 90 ? "bg-emerald-100" : stats.complianceScore >= 70 ? "bg-amber-100" : "bg-red-100"}`}>
                <Shield className={`h-8 w-8 ${stats.complianceScore >= 90 ? "text-emerald-600" : stats.complianceScore >= 70 ? "text-amber-600" : "text-red-600"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">SCORE DE COMPLIANCE</p>
                <p className="text-4xl font-bold">{stats.complianceScore}%</p>
                <p className="text-sm text-slate-500">Ultimo calculo: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm mb-1">
                <span>Estado General</span>
                <span className={stats.complianceScore >= 90 ? "text-emerald-600" : stats.complianceScore >= 70 ? "text-amber-600" : "text-red-600"}>
                  {stats.complianceScore >= 90 ? "Excelente" : stats.complianceScore >= 70 ? "Aceptable" : "Requiere Atencion"}
                </span>
              </div>
              <Progress value={stats.complianceScore} className="h-3" />
            </div>
            {stats.criticalAlerts > 0 && (
              <Badge className="bg-red-500 text-white text-lg px-4 py-2 animate-pulse">
                <AlertOctagon className="h-5 w-5 mr-2" />
                {stats.criticalAlerts} ALERTAS CRITICAS
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Alertas Pend.</p>
                <p className="text-xl font-bold text-orange-600">{stats.pendingAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertOctagon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Criticas</p>
                <p className="text-xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <UserCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">KYC Pendiente</p>
                <p className="text-xl font-bold text-amber-600">{stats.kycPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <BadgeCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">KYC Aprobado</p>
                <p className="text-xl font-bold text-emerald-600">{stats.kycApproved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">KYC Rechazado</p>
                <p className="text-xl font-bold text-red-600">{stats.kycRejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <ShieldAlert className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">AML Flagged</p>
                <p className="text-xl font-bold text-violet-600">{stats.amlFlagged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur border border-sky-500/20">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="alerts">Alertas Fraude</TabsTrigger>
          <TabsTrigger value="kyc">KYC/KYB</TabsTrigger>
          <TabsTrigger value="aml">AML Monitoreo</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Critical Alerts */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertOctagon className="h-5 w-5" />
                  Alertas Criticas Sin Resolver
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.filter(a => a.severity === "critical" && a.status === "pending").length === 0 ? (
                  <div className="text-center py-6">
                    <ShieldCheck className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-700">Sin alertas criticas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts
                      .filter(a => a.severity === "critical" && a.status === "pending")
                      .slice(0, 5)
                      .map(alert => (
                        <div key={alert.id} className="p-3 rounded-lg bg-white border border-red-200 cursor-pointer hover:shadow-md" onClick={() => setSelectedAlert(alert)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{alert.users?.full_name || "Usuario"}</p>
                              <p className="text-xs text-slate-500">{alert.alert_type}</p>
                            </div>
                            <Badge className="bg-red-500 text-white">Critico</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending KYC */}
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <UserCheck className="h-5 w-5" />
                  KYC Pendientes de Revision
                </CardTitle>
              </CardHeader>
              <CardContent>
                {kycRecords.filter(k => k.status === "pending").length === 0 ? (
                  <div className="text-center py-6">
                    <BadgeCheck className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-700">Sin KYC pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {kycRecords
                      .filter(k => k.status === "pending")
                      .slice(0, 5)
                      .map(kyc => (
                        <div key={kyc.id} className="p-3 rounded-lg bg-white border border-amber-200 cursor-pointer hover:shadow-md" onClick={() => setSelectedKYC(kyc)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{kyc.users?.full_name || "Usuario"}</p>
                              <p className="text-xs text-slate-500">{kyc.document_type || "Documento"}</p>
                            </div>
                            {getRiskBadge(kyc.risk_level || "low")}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compliance Checklist */}
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Checklist de Compliance</CardTitle>
              <CardDescription>Estado de cumplimiento normativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "NOM-029 Timeshare", status: "compliant", desc: "Periodo de reflexion activo" },
                  { name: "GDPR/LFPDPPP", status: "compliant", desc: "Consentimientos actualizados" },
                  { name: "AML / PLD", status: "compliant", desc: "Monitoreo de transacciones activo" },
                  { name: "KYC Verificacion", status: "warning", desc: "3 verificaciones pendientes" },
                  { name: "Contratos Digitales", status: "compliant", desc: "NOM-151 implementado" },
                  { name: "Auditoria Interna", status: "compliant", desc: "Ultima: hace 7 dias" },
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${item.status === "compliant" ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.status === "compliant" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <Badge className={item.status === "compliant" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                        {item.status === "compliant" ? "OK" : "Revisar"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-sky-500/20"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] border-sky-500/20">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="cleared">Aprobados</SelectItem>
                    <SelectItem value="flagged">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Usuario</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                        </TableCell>
                      </TableRow>
                    ) : filteredAlerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                          No hay alertas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAlerts.map(alert => (
                        <TableRow key={alert.id} className="hover:bg-sky-50/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{alert.users?.full_name || "N/A"}</p>
                              <p className="text-xs text-slate-500">{alert.users?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{alert.alert_type}</TableCell>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell>
                            <Badge variant={alert.status === "pending" ? "outline" : alert.status === "cleared" ? "default" : "destructive"}>
                              {alert.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(alert)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar usuarios KYC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-sky-500/20"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] border-sky-500/20">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="approved">Aprobados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Usuario</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Nivel Riesgo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                        </TableCell>
                      </TableRow>
                    ) : filteredKYC.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                          No hay registros KYC
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredKYC.map(kyc => (
                        <TableRow key={kyc.id} className="hover:bg-sky-50/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{kyc.users?.full_name || "N/A"}</p>
                              <p className="text-xs text-slate-500">{kyc.users?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{kyc.document_type || "INE"}</TableCell>
                          <TableCell>{getKYCStatusBadge(kyc.status)}</TableCell>
                          <TableCell>{getRiskBadge(kyc.risk_level || "low")}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(kyc.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedKYC(kyc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AML Tab */}
        <TabsContent value="aml" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-violet-600" />
                Monitoreo Anti-Lavado de Dinero (AML/PLD)
              </CardTitle>
              <CardDescription>Deteccion automatica de transacciones sospechosas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Sistema de monitoreo AML activo</p>
                <p className="text-sm text-slate-400 mt-1">No hay transacciones flaggeadas en las ultimas 24 horas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-sky-600" />
                Centro de Auditoria
              </CardTitle>
              <CardDescription>Registro completo de actividades de compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Logs de auditoria disponibles</p>
                <Button className="mt-4 bg-sky-500 hover:bg-sky-600">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Reporte de Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Alerta</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Usuario</Label>
                  <p className="font-medium">{selectedAlert.users?.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Email</Label>
                  <p className="font-medium">{selectedAlert.users?.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Tipo</Label>
                  <p>{selectedAlert.alert_type}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Severidad</Label>
                  <div>{getSeverityBadge(selectedAlert.severity)}</div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Descripcion</Label>
                <p className="text-sm text-slate-600">{selectedAlert.description || "Sin descripcion"}</p>
              </div>
              {selectedAlert.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => resolveAlert(selectedAlert.id, "approved")} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button onClick={() => resolveAlert(selectedAlert.id, "rejected")} variant="destructive" className="flex-1">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KYC Detail Dialog */}
      <Dialog open={!!selectedKYC} onOpenChange={() => setSelectedKYC(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Revision KYC</DialogTitle>
          </DialogHeader>
          {selectedKYC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Usuario</Label>
                  <p className="font-medium">{selectedKYC.users?.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Email</Label>
                  <p className="font-medium">{selectedKYC.users?.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Documento</Label>
                  <p>{selectedKYC.document_type || "INE"}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Nivel Riesgo</Label>
                  <div>{getRiskBadge(selectedKYC.risk_level || "low")}</div>
                </div>
              </div>
              {selectedKYC.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => updateKYCStatus(selectedKYC.id, "approved")} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button onClick={() => updateKYCStatus(selectedKYC.id, "rejected")} variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
