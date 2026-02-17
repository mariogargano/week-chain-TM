"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Clock, Award } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Commission {
  id: string
  amount: number
  type: "immediate" | "deferred"
  status: "pending" | "paid"
  property_name: string
  created_at: string
}

export default function BrokerCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState({
    immediate_pending: 0,
    immediate_paid: 0,
    deferred_accrued: 0,
    total_earnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommissions()
  }, [])

  const loadCommissions = async () => {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      setLoading(false)
      return
    }

    // Query broker_commissions table
    const { data, error } = await supabase
      .from("broker_commissions")
      .select("*")
      .eq("broker_email", user.user.email)
      .order("created_at", { ascending: false })

    if (!error && data && data.length > 0) {
      const formattedCommissions: Commission[] = data.map((c) => ({
        id: c.id,
        amount: c.amount || 0,
        type: c.commission_type === "deferred" ? "deferred" : "immediate",
        status: c.status === "paid" ? "paid" : "pending",
        property_name: c.property_name || "Propiedad",
        created_at: c.created_at,
      }))

      setCommissions(formattedCommissions)

      // Calculate stats
      const immediate_pending = formattedCommissions
        .filter((c) => c.type === "immediate" && c.status === "pending")
        .reduce((sum, c) => sum + c.amount, 0)

      const immediate_paid = formattedCommissions
        .filter((c) => c.type === "immediate" && c.status === "paid")
        .reduce((sum, c) => sum + c.amount, 0)

      const deferred_accrued = formattedCommissions
        .filter((c) => c.type === "deferred")
        .reduce((sum, c) => sum + c.amount, 0)

      setStats({
        immediate_pending,
        immediate_paid,
        deferred_accrued,
        total_earnings: immediate_paid + immediate_pending + deferred_accrued,
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando comisiones...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comisiones</h1>
        <p className="text-muted-foreground">Seguimiento de tus comisiones inmediatas y diferidas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión Inmediata Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.immediate_pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">6% por venta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión Inmediata Pagada</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.immediate_paid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pagos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión Diferida Acumulada</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${stats.deferred_accrued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">10% durante 15 años</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${stats.total_earnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Todas las fuentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Comisiones</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aún no tienes comisiones. ¡Comienza a vender para ganar!
            </p>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{commission.property_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={commission.type === "immediate" ? "default" : "secondary"}>
                        {commission.type === "immediate" ? "Inmediata 6%" : "Diferida 10%"}
                      </Badge>
                      <Badge variant={commission.status === "paid" ? "default" : "outline"}>
                        {commission.status === "paid" ? "Pagada" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(commission.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${commission.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">USD</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
