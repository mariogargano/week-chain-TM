"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle, ArrowLeft, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OwnerNotificationsPage() {
  return (
    <RoleGuard allowedRoles={["property_owner", "admin"]}>
      <OwnerNotificationsContent />
    </RoleGuard>
  )
}

function OwnerNotificationsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    let query = supabase
      .from("owner_notifications")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (filter === "unread") {
      query = query.eq("read", false)
    }

    const { data, error } = await query

    if (!error && data) {
      setNotifications(data)
    }
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("owner_notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", id)

    if (!error) {
      fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("owner_notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("owner_id", user.id)
      .eq("read", false)

    if (!error) {
      toast({ title: "Éxito", description: "Todas las notificaciones marcadas como leídas" })
      fetchNotifications()
    }
  }

  const deleteNotification = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("owner_notifications").delete().eq("id", id)

    if (!error) {
      toast({ title: "Éxito", description: "Notificación eliminada" })
      fetchNotifications()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "submission_received":
        return "📝"
      case "notary_approved":
        return "✅"
      case "admin_approved":
        return "🎉"
      case "sale_made":
        return "💰"
      case "payment_received":
        return "💵"
      default:
        return "🔔"
    }
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/owner")}
              className="bg-white/90 backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Notificaciones
              </h1>
              <p className="text-slate-600">Mantente al día con tus propiedades</p>
            </div>
            {notifications.some((n) => !n.read) && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
              className={filter === "unread" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
            >
              No leídas ({notifications.filter((n) => !n.read).length})
            </Button>
          </div>

          {loading ? (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-slate-600">Cargando notificaciones...</p>
              </CardContent>
            </Card>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-purple-200/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    notification.read ? "bg-white/70" : "bg-white/90"
                  }`}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id)
                    if (notification.link) router.push(notification.link)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getNotificationIcon(notification.notification_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900">{notification.title}</h3>
                            {!notification.read && <Badge className="bg-purple-100 text-purple-700 mt-1">Nueva</Badge>}
                          </div>
                          <div className="flex gap-2">
                            {notification.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(notification.link)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-slate-700 mb-2">{notification.message}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(notification.created_at).toLocaleString("es-ES")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No tienes notificaciones</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
