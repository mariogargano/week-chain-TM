import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, DollarSign, TrendingUp, Share2, Award, Home, Copy } from "lucide-react"
import { BrokerStatsCard } from "@/components/broker-stats-card"

export default async function BrokerPortalPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  // Si no hay usuario autenticado, redirigir a la página de aplicación
  if (userError || !userData?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFB7B2]/30 via-[#FFDAC1]/30 to-[#E2F0CB]/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#FF9AA2] shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600">Este dashboard es exclusivo para brokers registrados de WEEK-CHAIN.</p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:opacity-90">
                <Link href="/broker/apply">Aplicar como Broker</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth">Iniciar Sesión</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = userData.user

  // Verificar si el usuario es broker y obtener su código de referido
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, is_broker_elite, elite_weeks_available, referral_code, display_name")
    .eq("id", user.id)
    .single()

  // Si no es broker, redirigir a aplicación
  if (!profileData || (profileData.role !== "broker" && profileData.role !== "broker_elite")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFB7B2]/30 via-[#FFDAC1]/30 to-[#E2F0CB]/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#FF9AA2] shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">No eres Broker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600">
              Tu cuenta no tiene permisos de broker. Aplica al programa para acceder a este dashboard.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:opacity-90">
              <Link href="/broker/apply">Aplicar como Broker</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = profileData
  const referralCode = profile.referral_code || "PENDIENTE"

  const { data: commissionsData } = await supabase
    .from("broker_commissions")
    .select(`
      *,
      reservations (
        id,
        property_id,
        week_id,
        status,
        properties (name)
      )
    `)
    .eq("broker_id", user.id)
    .order("created_at", { ascending: false })

  const commissions = commissionsData || []

  const { data: referralsData } = await supabase
    .from("referrals")
    .select(`
      *,
      referred:profiles!referrals_referred_id_fkey (
        id, display_name, email, avatar_url
      )
    `)
    .eq("referrer_id", user.id)

  const referrals = referralsData || []

  // Calcular estadísticas reales
  const totalReferrals = referrals.length
  const totalCommission = commissions.reduce((sum, c) => sum + Number(c.commission_amount_usdc || 0), 0)
  const pendingCommission = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + Number(c.commission_amount_usdc || 0), 0)
  const level1Earnings = commissions
    .filter((c) => c.referral_level === 1)
    .reduce((sum, c) => sum + Number(c.commission_amount_usdc || 0), 0)
  const level2Earnings = commissions
    .filter((c) => c.referral_level === 2)
    .reduce((sum, c) => sum + Number(c.commission_amount_usdc || 0), 0)
  const level3Earnings = commissions
    .filter((c) => c.referral_level === 3)
    .reduce((sum, c) => sum + Number(c.commission_amount_usdc || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold">Portal de Brokers WEEK-CHAIN</h1>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/properties">Propiedades</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Dashboard de Broker</h2>
            <p className="text-muted-foreground">Bienvenido, {profile.display_name || user.email}</p>
          </div>
          {profile?.is_broker_elite ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-700">Broker Elite</span>
              </div>
            </div>
          ) : (
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Link href="/broker-elite">
                <Award className="mr-2 h-4 w-4" />
                Actualizar a Elite
              </Link>
            </Button>
          )}
        </div>

        {/* Código de Referido */}
        <Card className="mb-8 border-2 border-[#FF9AA2] bg-gradient-to-r from-[#FFB7B2]/10 to-[#C7CEEA]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Tu Código de Referido</h3>
                <p className="text-sm text-slate-600 mb-3">Comparte este código para ganar comisiones</p>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-mono font-bold text-[#FF9AA2] bg-white px-4 py-2 rounded-lg border-2 border-[#FF9AA2]">
                    {referralCode}
                  </code>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Link de referido:</p>
                <code className="text-xs text-slate-500">weekchain.com/properties?ref={referralCode}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {profile?.is_broker_elite && (
          <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-white">
                    <Home className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-purple-900 mb-1">Beneficios de Socio Activos</h3>
                    <p className="text-sm text-purple-700 mb-2">
                      Tienes {profile.elite_weeks_available || 0} semanas de temporada baja disponibles
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
                  asChild
                >
                  <Link href="/broker-elite/dashboard">Ver Dashboard Elite</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Referidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Usuarios referidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comisión Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Comisiones totales <span className="text-[#B5EAD7]">(IVA incluido)</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comisión Pendiente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Por confirmar <span className="text-[#B5EAD7]">(IVA incluido)</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Comisión</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5%</div>
              <p className="text-xs text-muted-foreground">
                Nivel 1 (Directo) <span className="text-[#B5EAD7]">(IVA incluido)</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Comisiones por Nivel */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-blue-600 font-medium">
                Nivel 1 (5%) <span className="text-[#B5EAD7] text-xs">(IVA inc.)</span>
              </p>
              <p className="text-2xl font-bold text-blue-700">${level1Earnings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-purple-600 font-medium">
                Nivel 2 (2%) <span className="text-[#B5EAD7] text-xs">(IVA inc.)</span>
              </p>
              <p className="text-2xl font-bold text-purple-700">${level2Earnings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-pink-200 bg-pink-50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-pink-600 font-medium">
                Nivel 3 (1%) <span className="text-[#B5EAD7] text-xs">(IVA inc.)</span>
              </p>
              <p className="text-2xl font-bold text-pink-700">${level3Earnings.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <BrokerStatsCard referrals={referrals || []} />

          {/* Lista de Referidos */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Referidos</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals && referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.slice(0, 5).map((referral: any) => (
                    <div key={referral.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] flex items-center justify-center text-white font-bold text-sm">
                          {referral.referred?.display_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{referral.referred?.display_name || "Usuario"}</p>
                          <p className="text-xs text-muted-foreground">{referral.referred?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{referral.total_sales || 0} ventas</p>
                        <p className="text-xs text-muted-foreground">${referral.commission_earned || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-1 font-semibold">Sin referidos aún</h3>
                  <p className="text-sm text-muted-foreground">Comparte tu código {referralCode} para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comisiones Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Comisiones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions && commissions.length > 0 ? (
              <div className="space-y-4">
                {commissions.slice(0, 10).map((commission: any) => (
                  <div key={commission.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h4 className="font-semibold">{commission.reservations?.properties?.name || "Propiedad"}</h4>
                      <p className="text-sm text-muted-foreground">
                        Nivel {commission.referral_level} • {commission.status === "paid" ? "Pagado" : "Pendiente"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +${Number(commission.commission_amount_usdc || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {commission.commission_rate * 100}% de $
                        {Number(commission.sale_amount_usdc || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Share2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">Sin comisiones aún</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Comparte tu enlace de referido para comenzar a ganar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
