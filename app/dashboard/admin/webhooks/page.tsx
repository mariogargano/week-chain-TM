"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@/lib/supabase/client"
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface WebhookEvent {
  id: string
  source: string
  event_id: string
  event_type: string
  status: string
  error_message: string | null
  retry_count: number
  created_at: string
  processed_at: string | null
}

interface WebhookStats {
  source: string
  event_type: string
  status: string
  total_events: number
  avg_retries: number
  last_event_at: string
}

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [stats, setStats] = useState<WebhookStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<string>("all")

  const supabase = createBrowserClient()

  const loadData = async () => {
    setLoading(true)

    // Load events
    const { data: eventsData } = await supabase
      .from("webhook_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (eventsData) {
      setEvents(eventsData)
    }

    // Load stats
    const { data: statsData } = await supabase.from("webhook_stats").select("*")

    if (statsData) {
      setStats(statsData)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredEvents = selectedSource === "all" ? events : events.filter((e) => e.source === selectedSource)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      processed: "default",
      failed: "destructive",
      pending: "secondary",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Monitor y gestiona eventos de webhooks</p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Procesados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.status === "processed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{events.filter((e) => e.status === "failed").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter((e) => e.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recientes</CardTitle>
          <CardDescription>Últimos 100 eventos de webhooks recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSource} onValueChange={setSelectedSource}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="conekta">Conekta</TabsTrigger>
              <TabsTrigger value="legalario">Legalario</TabsTrigger>
              <TabsTrigger value="solana">Solana</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedSource} className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left text-sm font-medium">Estado</th>
                      <th className="p-2 text-left text-sm font-medium">Origen</th>
                      <th className="p-2 text-left text-sm font-medium">Tipo</th>
                      <th className="p-2 text-left text-sm font-medium">Event ID</th>
                      <th className="p-2 text-left text-sm font-medium">Reintentos</th>
                      <th className="p-2 text-left text-sm font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            {getStatusBadge(event.status)}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{event.source}</Badge>
                        </td>
                        <td className="p-2 text-sm">{event.event_type}</td>
                        <td className="p-2 text-sm font-mono text-xs">{event.event_id.substring(0, 20)}...</td>
                        <td className="p-2 text-sm">{event.retry_count}</td>
                        <td className="p-2 text-sm">{new Date(event.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stats by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Origen</CardTitle>
          <CardDescription>Resumen de eventos agrupados por origen y tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left text-sm font-medium">Origen</th>
                  <th className="p-2 text-left text-sm font-medium">Tipo</th>
                  <th className="p-2 text-left text-sm font-medium">Estado</th>
                  <th className="p-2 text-left text-sm font-medium">Total</th>
                  <th className="p-2 text-left text-sm font-medium">Avg Reintentos</th>
                  <th className="p-2 text-left text-sm font-medium">Último Evento</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">
                      <Badge variant="outline">{stat.source}</Badge>
                    </td>
                    <td className="p-2 text-sm">{stat.event_type}</td>
                    <td className="p-2">{getStatusBadge(stat.status)}</td>
                    <td className="p-2 text-sm font-bold">{stat.total_events}</td>
                    <td className="p-2 text-sm">{stat.avg_retries.toFixed(2)}</td>
                    <td className="p-2 text-sm">{new Date(stat.last_event_at).toLocaleString()}</td>
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
