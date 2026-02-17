import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Play, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function DemoFlowPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const flowSteps = [
    {
      step: 1,
      title: "Seleccionar Propiedad y Semana",
      description: "Explora propiedades disponibles y elige tu semana preferida",
      action: "Ir a Propiedades",
      href: "/properties",
      duration: "1-2 min",
    },
    {
      step: 2,
      title: "Elegir Método de Pago",
      description: "Paga con USDC, tarjeta, SPEI o en cualquier Oxxo",
      action: "Ver Métodos",
      href: "#payment-methods",
      duration: "30 seg",
    },
    {
      step: 3,
      title: "Recibir Certificado",
      description: "Obtén tu voucher de compra inmediatamente",
      action: "Ver Ejemplo",
      href: "/dashboard/my-weeks",
      duration: "Instantáneo",
    },
    {
      step: 4,
      title: "Fondos en Escrow",
      description: "Tu pago se deposita de forma segura en blockchain",
      action: "Más Info",
      href: "#escrow",
      duration: "1-2 min",
    },
    {
      step: 5,
      title: "Confirmación Admin",
      description: "El equipo verifica y aprueba la transacción",
      action: "Ver Estado",
      href: "/dashboard/my-weeks",
      duration: "24-48 hrs",
    },
    {
      step: 6,
      title: "Minteo de NFT",
      description: "Recibe tu token de propiedad en Solana",
      action: "Ver NFTs",
      href: "/dashboard/my-weeks",
      duration: "Automático",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold">WEEK-CHAIN</h1>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold">Flujo de Compra Demo</h2>
            <Badge variant="outline" className="bg-blue-50">
              🧪 Modo Demostración
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Explora el proceso completo desde el pago hasta recibir tu NFT de propiedad
          </p>
        </div>

        <Alert className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <Play className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Modo Demo Activo:</strong> Puedes probar todo el flujo sin pagos reales. Los procesos se simulan
            automáticamente para que veas cómo funciona la plataforma en producción.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 mb-8">
          {flowSteps.map((item, index) => (
            <Card key={item.step} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {item.duration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={item.href}>{item.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Documentación Completa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para entender cada paso en detalle, consulta nuestra guía completa del flujo de compra.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" asChild className="bg-white">
                <Link href="/dashboard/my-weeks">Ver Mis Compras</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Link href="/properties">
                  <Play className="mr-2 h-4 w-4" />
                  Probar Ahora
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
