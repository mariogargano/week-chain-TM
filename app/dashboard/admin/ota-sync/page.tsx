import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function OTASyncPage() {
  const supabase = await createClient()

  const { data: syncLogs } = await supabase
    .from("ota_sync_logs")
    .select(`
      *,
      weeks (
        week_number,
        properties (
          name,
          location
        )
      )
    `)
    .order("synced_at", { ascending: false })
    .limit(50)

  const successfulSyncs = syncLogs?.filter((s) => s.status === "success").length || 0
  const failedSyncs = syncLogs?.filter((s) => s.status === "failed").length || 0
  const pendingSyncs = syncLogs?.filter((s) => s.status === "pending").length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sincronización OTA</h1>
          <p className="text-slate-600 mt-2">Gestión de sincronización con Airbnb y Booking.com</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sincronizar Ahora
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Exitosas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{successfulSyncs}</div>
            <p className="text-xs text-slate-600 mt-1">Sincronizaciones</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Fallidas</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{failedSyncs}</div>
            <p className="text-xs text-slate-600 mt-1">Con errores</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Pendientes</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{pendingSyncs}</div>
            <p className="text-xs text-slate-600 mt-1">En proceso</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total</CardTitle>
            <RefreshCw className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{syncLogs?.length || 0}</div>
            <p className="text-xs text-slate-600 mt-1">Sincronizaciones</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Sincronización</CardTitle>
          <CardDescription>Logs de sincronización con plataformas OTA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Plataforma</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Propiedad</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Semana</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs?.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {log.platform}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-800">{log.weeks?.properties?.name}</div>
                        <div className="text-sm text-slate-600">{log.weeks?.properties?.location}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-purple-600">Semana {log.weeks?.week_number}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          log.status === "success" ? "default" : log.status === "failed" ? "destructive" : "secondary"
                        }
                        className={
                          log.status === "success"
                            ? "bg-green-100 text-green-700"
                            : log.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {log.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {log.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                        {log.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{new Date(log.synced_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{log.sync_message || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
