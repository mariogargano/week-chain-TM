"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Clock, Shield, CreditCard, Calendar, TrendingDown, FileText, Mail, Plus, Settings, Trash2, Edit, Loader2, RefreshCw,  } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AlertRule {
  id: string
  name: string
  type: string
  condition: string
  threshold: number
  enabled: boolean
  notify_email: boolean
  notify_slack: boolean
  created_at: string
}

interface Alert {
  id: string
  rule_id: string
  type: string
  severity: "critical" | "warning" | "info"
  title: string
  message: string
  resolved: boolean
  resolved_at: string | null
  created_at: string
  metadata: any
}

const ALERT_TYPES = [
  { value: "sla_breach", label: "SLA Roto", icon: Clock, description: "REQUEST sin OFFER en +48h" },
  { value: "double_booking", label: "Doble Reserva", icon: Calendar, description: "Riesgo de sobreventa de semana" },
  { value: "negative_margin", label: "Margen Negativo", icon: TrendingDown, description: "Operacion bajo costo" },
  { value: "kyc_expired", label: "KYC Vencido", icon: Shield, description: "Verificacion expirada" },
  { value: "chargeback", label: "Disputa/Chargeback", icon: CreditCard, description: "Contracargo recibido" },
  { value: "contract_missing", label: "Contrato Faltante", icon: FileText, description: "Sin contrato firmado" },
  { value: "capacity_risk", label: "Riesgo Capacidad", icon: AlertTriangle, description: "Supply bajo umbral" },
]

const SEVERITY_CONFIG = {
  critical: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: AlertCircle },
  warning: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle },
  info: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200", icon: Bell },
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [newRule, setNewRule] = useState({
    name: "",
    type: "",
    condition: "greater_than",
    threshold: 0,
    notify_email: true,
    notify_slack: false,
  })
  const [saving, setSaving] = useState(false)
  const [runningCheck, setRunningCheck] = useState(false)

  const fetchData = async () => {
    const supabase = createClient()
    
    const [alertsRes, rulesRes] = await Promise.all([
      supabase.from("system_alerts").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("alert_rules").select("*").order("created_at", { ascending: false }),
    ])

    if (alertsRes.data) setAlerts(alertsRes.data)
    if (rulesRes.data) setRules(rulesRes.data)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const activeAlerts = alerts.filter(a => !a.resolved)
  const resolvedAlerts = alerts.filter(a => a.resolved)

  const filteredAlerts = (activeTab === "active" ? activeAlerts : resolvedAlerts).filter(a => {
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false
    if (filterType !== "all" && a.type !== filterType) return false
    return true
  })

  const handleResolveAlert = async (alertId: string) => {
    const supabase = createClient()
    await supabase.from("system_alerts").update({ 
      resolved: true, 
      resolved_at: new Date().toISOString() 
    }).eq("id", alertId)
    await fetchData()
  }

  const handleSaveRule = async () => {
    setSaving(true)
    const supabase = createClient()

    const ruleData = {
      name: newRule.name,
      type: newRule.type,
      condition: newRule.condition,
      threshold: newRule.threshold,
      notify_email: newRule.notify_email,
      notify_slack: newRule.notify_slack,
      enabled: true,
    }

    if (editingRule) {
      await supabase.from("alert_rules").update(ruleData).eq("id", editingRule.id)
    } else {
      await supabase.from("alert_rules").insert([ruleData])
    }

    await fetchData()
    setIsRuleDialogOpen(false)
    setEditingRule(null)
    setNewRule({ name: "", type: "", condition: "greater_than", threshold: 0, notify_email: true, notify_slack: false })
    setSaving(false)
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    const supabase = createClient()
    await supabase.from("alert_rules").update({ enabled }).eq("id", ruleId)
    await fetchData()
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Eliminar esta regla de alerta?")) return
    const supabase = createClient()
    await supabase.from("alert_rules").delete().eq("id", ruleId)
    await fetchData()
  }

  const runManualCheck = async () => {
    setRunningCheck(true)
    
    // Call API to run alert checks
    try {
      await fetch("/api/admin/run-alert-checks", { method: "POST" })
      await fetchData()
    } catch (e) {
      console.error("Error running checks:", e)
    }
    
    setRunningCheck(false)
  }

  const openEditRule = (rule: AlertRule) => {
    setEditingRule(rule)
    setNewRule({
      name: rule.name,
      type: rule.type,
      condition: rule.condition,
      threshold: rule.threshold,
      notify_email: rule.notify_email,
      notify_slack: rule.notify_slack,
    })
    setIsRuleDialogOpen(true)
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Alertas y Automatismos</h1>
          <p className="text-slate-500">Monitoreo proactivo para evitar fallas operativas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runManualCheck} disabled={runningCheck} className="border-sky-500/20">
            {runningCheck ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Ejecutar Checks
          </Button>
          <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingRule(null); setNewRule({ name: "", type: "", condition: "greater_than", threshold: 0, notify_email: true, notify_slack: false }) }} className="bg-sky-500 hover:bg-sky-600">
                <Plus className="h-4 w-4 mr-2" /> Nueva Regla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingRule ? "Editar Regla" : "Nueva Regla de Alerta"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nombre de la Regla</Label>
                  <Input placeholder="Ej: SLA 48h Requests" value={newRule.name} onChange={(e) => setNewRule(r => ({ ...r, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Alerta</Label>
                  <Select value={newRule.type} onValueChange={(v) => setNewRule(r => ({ ...r, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                    <SelectContent>
                      {ALERT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="h-4 w-4" />
                            <span>{t.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newRule.type && (
                    <p className="text-xs text-slate-500">{ALERT_TYPES.find(t => t.value === newRule.type)?.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Condicion</Label>
                    <Select value={newRule.condition} onValueChange={(v) => setNewRule(r => ({ ...r, condition: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Mayor que</SelectItem>
                        <SelectItem value="less_than">Menor que</SelectItem>
                        <SelectItem value="equals">Igual a</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Umbral</Label>
                    <Input type="number" value={newRule.threshold} onChange={(e) => setNewRule(r => ({ ...r, threshold: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="space-y-3 pt-2 border-t">
                  <Label>Notificaciones</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch checked={newRule.notify_email} onCheckedChange={(c) => setNewRule(r => ({ ...r, notify_email: c }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">Slack</span>
                    </div>
                    <Switch checked={newRule.notify_slack} onCheckedChange={(c) => setNewRule(r => ({ ...r, notify_slack: c }))} />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsRuleDialogOpen(false)}>Cancelar</Button>
                  <Button className="flex-1 bg-sky-500 hover:bg-sky-600" onClick={handleSaveRule} disabled={saving || !newRule.name || !newRule.type}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-xl"><AlertCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeAlerts.filter(a => a.severity === "critical").length}</p>
                <p className="text-xs text-slate-500">Criticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeAlerts.filter(a => a.severity === "warning").length}</p>
                <p className="text-xs text-slate-500">Advertencias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 rounded-xl"><Bell className="h-5 w-5 text-sky-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeAlerts.filter(a => a.severity === "info").length}</p>
                <p className="text-xs text-slate-500">Informativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{rules.filter(r => r.enabled).length}</p>
                <p className="text-xs text-slate-500">Reglas Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-sky-500" /> Alertas del Sistema
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-[130px] border-sky-500/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="critical">Criticas</SelectItem>
                      <SelectItem value="warning">Advertencias</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px] border-sky-500/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {ALERT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="active">Activas ({activeAlerts.length})</TabsTrigger>
                  <TabsTrigger value="resolved">Resueltas ({resolvedAlerts.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-300" />
                    <p>{activeTab === "active" ? "Sin alertas activas" : "Sin alertas resueltas"}</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const config = SEVERITY_CONFIG[alert.severity]
                    const typeInfo = ALERT_TYPES.find(t => t.value === alert.type)
                    const TypeIcon = typeInfo?.icon || Bell
                    
                    return (
                      <div key={alert.id} className={`p-4 rounded-xl border ${config.border} ${config.bg}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-white/50`}>
                              <TypeIcon className={`h-5 w-5 ${config.text}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${config.text}`}>{alert.title}</h4>
                                <Badge className={`${config.bg} ${config.text} border ${config.border}`}>
                                  {alert.severity === "critical" ? "Critica" : alert.severity === "warning" ? "Advertencia" : "Info"}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                              <p className="text-xs text-slate-500 mt-2">
                                {new Date(alert.created_at).toLocaleString("es-MX")}
                                {alert.resolved_at && ` - Resuelto: ${new Date(alert.resolved_at).toLocaleString("es-MX")}`}
                              </p>
                            </div>
                          </div>
                          {!alert.resolved && (
                            <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                              <CheckCircle className="h-4 w-4 mr-1" /> Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules Panel */}
        <div>
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-sky-500" /> Reglas de Alerta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rules.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Bell className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No hay reglas configuradas</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setIsRuleDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Crear Primera Regla
                    </Button>
                  </div>
                ) : (
                  rules.map((rule) => {
                    const typeInfo = ALERT_TYPES.find(t => t.value === rule.type)
                    const TypeIcon = typeInfo?.icon || Bell
                    
                    return (
                      <div key={rule.id} className={`p-3 rounded-lg border ${rule.enabled ? "border-sky-200 bg-sky-50/50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${rule.enabled ? "text-sky-600" : "text-slate-400"}`} />
                            <span className={`font-medium text-sm ${rule.enabled ? "text-slate-900" : "text-slate-500"}`}>{rule.name}</span>
                          </div>
                          <Switch checked={rule.enabled} onCheckedChange={(c) => handleToggleRule(rule.id, c)} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{typeInfo?.label} - Umbral: {rule.threshold}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditRule(rule)} className="h-7 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteRule(rule.id)} className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="flex-1" />
                          {rule.notify_email && <Mail className="h-3 w-3 text-slate-400" />}
                          {rule.notify_slack && <Bell className="h-3 w-3 text-slate-400" />}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl mt-4">
            <CardHeader>
              <CardTitle className="text-base">Resumen 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ALERT_TYPES.slice(0, 5).map((type) => {
                  const count = alerts.filter(a => a.type === type.value && new Date(a.created_at) > new Date(Date.now() - 24*60*60*1000)).length
                  return (
                    <div key={type.value} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{type.label}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
