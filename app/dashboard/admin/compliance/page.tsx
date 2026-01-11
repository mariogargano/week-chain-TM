import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CheckCircle, Users } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ComplianceDashboard() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    redirect("/dashboard/member")
  }

  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const [pendingAlerts, criticalAlerts, coolingOffPurchases, newUsers24h] = await Promise.all([
    supabase
      .from("fraud_alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .gte("created_at", last24h),

    supabase
      .from("fraud_alerts")
      .select("*, users!inner(email, full_name)")
      .eq("status", "pending")
      .eq("severity", "critical")
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("payments")
      .select("*, users!inner(email, full_name), properties(name)")
      .eq("status", "cooling_off")
      .order("cooling_off_ends", { ascending: true })
      .limit(10),

    supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", last24h),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Compliance</h1>
        <p className="text-gray-600">Monitoreo en tiempo real - NOM-029, Anti-fraude, GDPR</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Pendientes (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAlerts.count || 0}</div>
            <p className="text-xs text-gray-600">Requieren revisión manual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Periodo de Reflexión</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coolingOffPurchases.data?.length || 0}</div>
            <p className="text-xs text-gray-600">Compras con 5 días para cancelar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Usuarios (24h)</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newUsers24h.count || 0}</div>
            <p className="text-xs text-gray-600">Registros exitosos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Activo</div>
            <p className="text-xs text-gray-600">Todos los sistemas operando</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Críticas Sin Revisar</CardTitle>
          <CardDescription>Actividad sospechosa que requiere acción inmediata</CardDescription>
        </CardHeader>
        <CardContent>
          {criticalAlerts.data && criticalAlerts.data.length > 0 ? (
            <div className="space-y-3">
              {criticalAlerts.data.map((alert: any) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{alert.alert_type}</Badge>
                      <span className="text-sm font-semibold">{alert.users?.full_name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{new Date(alert.created_at).toLocaleString("es-MX")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No hay alertas críticas pendientes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
