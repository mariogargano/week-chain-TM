"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, User, Building2, DollarSign, FileText, Search, RefreshCw, AlertTriangle, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface AuditLog {
  id: string
  user_id: string
  action: string
  severity: string
  details: string
  timestamp: string
  created_at: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  const getActionIcon = (action: string) => {
    if (action.includes("user") || action.includes("login") || action.includes("logout"))
      return <User className="h-4 w-4" />
    if (action.includes("property")) return <Building2 className="h-4 w-4" />
    if (action.includes("transaction") || action.includes("payment") || action.includes("commission"))
      return <DollarSign className="h-4 w-4" />
    if (action.includes("kyc")) return <FileText className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === "critical" || severity === "error") return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <Info className="h-4 w-4 text-blue-500" />
  }

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("approve"))
      return "bg-green-500/10 text-green-700 border-green-200"
    if (action.includes("update")) return "bg-blue-500/10 text-blue-700 border-blue-200"
    if (action.includes("delete") || action.includes("reject") || action.includes("failed"))
      return "bg-red-500/10 text-red-700 border-red-200"
    if (action.includes("login")) return "bg-emerald-500/10 text-emerald-700 border-emerald-200"
    if (action.includes("logout")) return "bg-orange-500/10 text-orange-700 border-orange-200"
    return "bg-slate-500/10 text-slate-700 border-slate-200"
  }

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details)
    } catch {
      return {}
    }
  }

  const filteredLogs = logs.filter((log) => {
    const details = parseDetails(log.details)
    return (
      log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Registro completo de acciones críticas en la plataforma</p>
        </div>
        <Button onClick={loadLogs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por usuario, acción o recurso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-sm text-muted-foreground">Total de logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((l) => l.action.includes("create") || l.action.includes("approve")).length}
            </div>
            <p className="text-sm text-muted-foreground">Creaciones/Aprobaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter((l) => l.action.includes("update")).length}
            </div>
            <p className="text-sm text-muted-foreground">Actualizaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.severity === "error" || l.severity === "critical").length}
            </div>
            <p className="text-sm text-muted-foreground">Errores Críticos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">
              {logs.filter((l) => l.action.includes("login")).length}
            </div>
            <p className="text-sm text-muted-foreground">Autenticaciones</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Últimas 200 acciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Cargando...</p>
              ) : filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay logs disponibles</p>
              ) : (
                filteredLogs.map((log) => {
                  const details = parseDetails(log.details)
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="mt-1 p-2 bg-slate-100 rounded-lg">{getActionIcon(log.action)}</div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getSeverityIcon(log.severity)}
                          <Badge className={getActionColor(log.action)} variant="outline">
                            {log.action}
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">{log.user_id.slice(0, 8)}...</span>
                        </div>
                        {details.resource_type && (
                          <p className="text-sm text-muted-foreground">
                            {details.resource_type}{" "}
                            {details.resource_id ? `(${details.resource_id.slice(0, 8)}...)` : ""}
                          </p>
                        )}
                        {details.metadata && (
                          <p className="text-xs text-muted-foreground">
                            {JSON.stringify(details.metadata).slice(0, 100)}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>IP: {details.ip_address || "unknown"}</span>
                          <span>
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
