"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, Users, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      title: "Nueva propiedad aprobada",
      message: "La propiedad 'Villa Paraíso' ha sido aprobada",
      type: "success",
      sent: true,
      recipients: 150,
      date: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Mantenimiento programado",
      message: "El sistema estará en mantenimiento el próximo domingo",
      type: "warning",
      sent: false,
      recipients: 0,
      date: new Date().toISOString(),
    },
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-600 mt-2">Gestión de notificaciones del sistema</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500">
          <Send className="h-4 w-4 mr-2" />
          Nueva Notificación
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Enviadas</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{notifications.filter((n) => n.sent).length}</div>
            <p className="text-xs text-slate-600 mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Pendientes</CardTitle>
            <Bell className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{notifications.filter((n) => !n.sent).length}</div>
            <p className="text-xs text-slate-600 mt-1">Por enviar</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Alcance Total</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {notifications.reduce((sum, n) => sum + n.recipients, 0)}
            </div>
            <p className="text-xs text-slate-600 mt-1">Usuarios alcanzados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Notificaciones</CardTitle>
          <CardDescription>Notificaciones enviadas y programadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6 rounded-lg border bg-slate-50 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-slate-800">{notification.title}</h3>
                      <Badge
                        variant={notification.sent ? "default" : "secondary"}
                        className={notification.sent ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                      >
                        {notification.sent ? "Enviada" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-slate-600">{notification.message}</p>
                    <div className="text-sm text-slate-500 mt-2">
                      {notification.sent ? `Enviada a ${notification.recipients} usuarios` : "Programada para envío"}
                    </div>
                  </div>
                </div>
                {!notification.sent && (
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                    <Send className="h-4 w-4 mr-1" />
                    Enviar Ahora
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
