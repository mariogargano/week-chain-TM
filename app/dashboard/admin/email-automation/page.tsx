import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, Mail, TrendingUp, Users, AlertCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function EmailAutomationPage() {
  const supabase = await createClient()

  // Get analytics
  const { data: analytics } = await supabase.from("email_analytics").select("*")

  // Get recent logs
  const { data: recentLogs } = await supabase
    .from("email_logs")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(10)

  // Get templates count
  const { count: templatesCount } = await supabase.from("email_templates").select("*", { count: "exact", head: true })

  // Get unsubscribes count
  const { count: unsubscribesCount } = await supabase
    .from("email_unsubscribes")
    .select("*", { count: "exact", head: true })

  // Calculate totals
  const totalSent = analytics?.reduce((sum, a) => sum + (a.total_sent || 0), 0) || 0
  const totalOpened = analytics?.reduce((sum, a) => sum + (a.opened || 0), 0) || 0
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : "0.00"

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Email Automation</h1>
              <p className="text-slate-600 mt-1">Gestiona templates, logs y métricas del sistema de emails</p>
            </div>
            <Link href="/dashboard/admin/email-automation/test">
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Test Email
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enviados</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Emails enviados total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgOpenRate}%</div>
                <p className="text-xs text-muted-foreground">Tasa de apertura promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates Activos</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templatesCount || 0}</div>
                <p className="text-xs text-muted-foreground">Templates configurados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsubscribes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unsubscribesCount || 0}</div>
                <p className="text-xs text-muted-foreground">Usuarios dados de baja</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="logs">Recent Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Gestiona los templates de email para el flujo ROC y notificaciones del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">Templates disponibles en la base de datos</p>
                    <Link href="/dashboard/admin/email-templates">
                      <Button>Ver Todos los Templates</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Tipo de Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics && analytics.length > 0 ? (
                      analytics.map((stat) => (
                        <div
                          key={stat.template_type}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{stat.template_type}</p>
                            <p className="text-sm text-slate-600">
                              {stat.total_sent} enviados • {stat.opened} abiertos • {stat.clicked} clicks
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={Number.parseFloat(stat.open_rate) > 20 ? "default" : "secondary"}>
                              {stat.open_rate}% Open Rate
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-600">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p>No hay datos de analytics disponibles aún</p>
                        <p className="text-sm mt-2">Los emails enviados aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Emails Recientes</CardTitle>
                  <CardDescription>Últimos 10 emails enviados por el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentLogs && recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{log.recipient_email}</p>
                            <p className="text-xs text-slate-600">{log.subject}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={log.failed ? "destructive" : log.opened_at ? "default" : "secondary"}>
                              {log.failed ? "Failed" : log.opened_at ? "Opened" : "Sent"}
                            </Badge>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(log.sent_at).toLocaleString("es-MX")}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-600">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p>No hay logs de emails aún</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
