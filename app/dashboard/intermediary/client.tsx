"use client"

import { useState, useMemo } from "react"
import { DollarSign, Users, TrendingUp, Clock, Copy, Check, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface IntermediaryProfile {
  id: string
  user_id: string
  role: string
  status: string
  referral_code: string
  created_at: string
}

interface CommissionRecord {
  id: string
  certificate_tier: string
  sale_amount: number
  commission_rate: number
  commission_amount: number
  status: string
  hold_until: string
  approved_at: string | null
  paid_at: string | null
  created_at: string
}

interface Lead {
  id: string
  name: string | null
  email: string
  phone: string | null
  status: string
  created_at: string
}

interface IntermediaryDashboardClientProps {
  profile: IntermediaryProfile
  commissions: CommissionRecord[]
  leads: Lead[]
}

export function IntermediaryDashboardClient({ profile, commissions, leads }: IntermediaryDashboardClientProps) {
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => {
    const totalEarned = commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.commission_amount, 0)

    const pendingAmount = commissions
      .filter((c) => c.status === "pending" || c.status === "approved")
      .reduce((sum, c) => sum + c.commission_amount, 0)

    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const thisMonthCommissions = commissions.filter(
      (c) => new Date(c.created_at) >= thisMonthStart && c.status === "paid",
    )
    const thisMonthEarned = thisMonthCommissions.reduce((sum, c) => sum + c.commission_amount, 0)

    const referredClients = new Set(leads.filter((l) => l.status === "paid").map((l) => l.email)).size

    const conversionRate = leads.length > 0 ? (leads.filter((l) => l.status === "paid").length / leads.length) * 100 : 0

    return {
      totalEarned,
      pendingAmount,
      thisMonthEarned,
      referredClients,
      totalLeads: leads.length,
      conversionRate,
    }
  }, [commissions, leads])

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${profile.referral_code}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      affiliate: "Afiliado",
      broker: "Intermediario",
      agency: "Agencia",
      wedding_partner: "Partner Bodas",
    }
    return labels[role] || role
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      reversed: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      silver: "Silver",
      gold: "Gold",
      platinum: "Platinum",
      signature: "Signature",
      wedding: "Wedding",
    }
    return labels[tier] || tier
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Intermediario</h1>
        <div className="flex items-center gap-2">
          <Badge>{getRoleLabel(profile.role)}</Badge>
          <Badge variant="outline">{profile.status}</Badge>
        </div>
      </div>

      {/* Disclaimer */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema de Comisiones Directas:</strong> Ganas comisiones solo por ventas directas que realices (8-15%
          según tier del certificado). No hay comisiones por referir a otros intermediarios. El sistema retiene
          comisiones durante 45 días desde la venta para procesar posibles reembolsos.
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Honorarios Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Comisiones pagadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">En proceso de retención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.thisMonthEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Ganado en {new Date().toLocaleDateString("es-ES", { month: "long" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.referredClients}</div>
            <p className="text-xs text-muted-foreground">Tasa de conversión: {stats.conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tu Código de Referido</CardTitle>
          <CardDescription>Comparte este enlace para referir nuevos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 font-mono text-sm bg-muted p-3 rounded-md">
              {window.location.origin}?ref={profile.referral_code}
            </div>
            <Button onClick={copyReferralLink} variant="outline">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Atribución válida por 30 días. Los clientes que adquieran certificados con tu código generarán comisiones
            para ti.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="commissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commissions">Comisiones</TabsTrigger>
          <TabsTrigger value="leads">Referidos</TabsTrigger>
          <TabsTrigger value="rates">Tasas por Tier</TabsTrigger>
        </TabsList>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Comisiones</CardTitle>
              <CardDescription>Ventas directas realizadas y sus comisiones</CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tienes comisiones aún. Comienza a referir clientes!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{getTierLabel(comm.certificate_tier)}</Badge>
                          <Badge className={getStatusColor(comm.status)}>{comm.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Venta: ${comm.sale_amount.toFixed(2)} • Tasa: {(comm.commission_rate * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comm.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${comm.commission_amount.toFixed(2)}</p>
                        {comm.status === "pending" && (
                          <p className="text-xs text-muted-foreground">
                            Disponible: {new Date(comm.hold_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referidos</CardTitle>
              <CardDescription>Clientes que han usado tu código de referido</CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tienes referidos aún. Comparte tu enlace!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{lead.name || lead.email}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasas de Comisión por Tier</CardTitle>
              <CardDescription>Comisiones que ganas según el tier del certificado vendido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { tier: "silver", rate: 8, price: 3500 },
                  { tier: "gold", rate: 10, price: 6000 },
                  { tier: "platinum", rate: 12, price: 11500 },
                  { tier: "signature", rate: 15, price: 21000 },
                  { tier: "wedding", rate: 15, price: 0 },
                ].map((item) => (
                  <div key={item.tier} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{getTierLabel(item.tier)}</p>
                      {item.price > 0 && (
                        <p className="text-sm text-muted-foreground">Precio: ${item.price.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{item.rate}%</p>
                      {item.price > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ${((item.price * item.rate) / 100).toFixed(2)} por venta
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
