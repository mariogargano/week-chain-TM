import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, Home, ExternalLink, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PurchaseProgressTracker } from "@/components/purchase-progress-tracker"
import { getEnvironment } from "@/lib/config/environment"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play } from "lucide-react"

export default async function MyWeeksPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const env = getEnvironment()
  const isDemoMode = env.isDemoMode

  const { data: vouchers } = await supabase
    .from("purchase_vouchers")
    .select(`
      *,
      weeks (
        id,
        week_number,
        start_date,
        end_date,
        price,
        season,
        status
      ),
      properties (
        id,
        name,
        location,
        image_url,
        description,
        weeks_sold,
        presale_target
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold">WEEK-CHAIN</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Mis Semanas</h2>
          <p className="text-muted-foreground">Gestiona tus certificados de compra y semanas vacacionales</p>
        </div>

        {isDemoMode && vouchers && vouchers.length > 0 && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Play className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>🧪 Modo Demo:</strong> Estás viendo el flujo completo de compra en modo demostración.{" "}
              <Link href="/dashboard/demo-flow" className="underline font-semibold">
                Ver guía completa del proceso
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {vouchers && vouchers.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {isDemoMode && vouchers[0] && (
              <div className="lg:col-span-3">
                <PurchaseProgressTracker
                  voucherId={vouchers[0].id}
                  voucherCode={vouchers[0].voucher_code}
                  propertyName={vouchers[0].properties?.name || "Propiedad"}
                  weekNumber={vouchers[0].weeks?.week_number || 0}
                  paymentMethod={vouchers[0].payment_method || "unknown"}
                  isDemoMode={isDemoMode}
                />
              </div>
            )}

            {vouchers.map((voucher: any) => {
              const presaleProgress = voucher.properties?.presale_target
                ? ((voucher.properties.weeks_sold || 0) / voucher.properties.presale_target) * 100
                : 0
              const canClaim = presaleProgress >= 100

              return (
                <Card key={voucher.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {voucher.properties?.image_url ? (
                      <img
                        src={voucher.properties.image_url || "/placeholder.svg"}
                        alt={voucher.properties.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Home className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{voucher.properties?.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{voucher.properties?.location}</p>
                      </div>
                      <Badge variant={canClaim ? "default" : "secondary"}>
                        {canClaim ? "Listo para Certificado" : "En Preventa"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Semana</span>
                        <span className="font-semibold">Semana {voucher.weeks?.week_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Temporada</span>
                        <Badge variant="outline">{voucher.weeks?.season}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Fechas</span>
                        <span className="text-xs">
                          {new Date(voucher.weeks?.start_date).toLocaleDateString()} -{" "}
                          {new Date(voucher.weeks?.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Pagado</span>
                        <span className="font-bold">${voucher.amount_paid?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Método</span>
                        <Badge variant="outline" className="uppercase">
                          {voucher.payment_method}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Progreso Preventa</span>
                        <span className="font-bold">{presaleProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                          style={{ width: `${Math.min(presaleProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1" size="sm" variant={canClaim ? "default" : "outline"}>
                        <Link href={`/dashboard/user/vouchers`}>
                          <Ticket className="h-4 w-4 mr-1" />
                          {canClaim ? "Ver Certificado" : "Ver Voucher"}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="bg-transparent">
                        <Link href={`/properties/${voucher.property_id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex min-h-[400px] flex-col items-center justify-center">
              <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No tienes semanas aún</h3>
              <p className="mb-2 text-center text-muted-foreground">Compra semanas vacacionales para verlas aquí</p>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                💳 Acepta tarjetas • 🏪 Pago en Oxxo • 🏦 Transferencia SPEI
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                <Link href="/properties">Explorar Propiedades</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
