"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import {
  CreditCard,
  Database,
  Building2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Play,
  Globe,
  Shield,
  Zap,
} from "lucide-react"

// Propiedades de prueba predefinidas
const TEST_PROPERTIES = [
  {
    name: "AFLORA Tulum",
    location: "Tulum, Quintana Roo",
    description: "Lujoso departamento frente al mar en la zona mas exclusiva de Tulum.",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    status: "active",
    total_weeks: 48,
    price_high_season: 9500,
    price_medium_season: 7000,
    price_low_season: 4143,
    amenities: ["Piscina infinity", "Gym", "Spa", "Beach club", "Concierge 24/7"],
    bedrooms: 2,
    bathrooms: 2,
    size: "98m2",
    spv_name: "WEEK-CHAIN SPV 001 S.A. de C.V.",
    spv_rfc: "WCS010101ABC",
  },
  {
    name: "Marina Puerto Aventuras",
    location: "Puerto Aventuras, Quintana Roo",
    description: "Espectacular villa con muelle privado en la marina.",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    status: "active",
    total_weeks: 48,
    price_high_season: 12000,
    price_medium_season: 9000,
    price_low_season: 6000,
    amenities: ["Muelle privado", "Piscina", "Terraza panoramica", "Cocina gourmet"],
    bedrooms: 3,
    bathrooms: 3,
    size: "145m2",
    spv_name: "WEEK-CHAIN SPV 002 S.A. de C.V.",
    spv_rfc: "WCS020202DEF",
  },
  {
    name: "Penthouse Los Cabos",
    location: "Los Cabos, Baja California Sur",
    description: "Penthouse de lujo con vista al Arco y el Mar de Cortes.",
    image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    status: "active",
    total_weeks: 48,
    price_high_season: 15000,
    price_medium_season: 11000,
    price_low_season: 7500,
    amenities: ["Jacuzzi privado", "Terraza 360", "Mayordomo", "Campo de golf", "Spa"],
    bedrooms: 4,
    bathrooms: 4,
    size: "220m2",
    spv_name: "WEEK-CHAIN SPV 003 S.A. de C.V.",
    spv_rfc: "WCS030303GHI",
  },
  {
    name: "Hacienda Playa del Carmen",
    location: "Playa del Carmen, Quintana Roo",
    description: "Hermosa hacienda renovada a pasos de la Quinta Avenida.",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    status: "active",
    total_weeks: 48,
    price_high_season: 8500,
    price_medium_season: 6500,
    price_low_season: 4500,
    amenities: ["Jardin tropical", "Alberca", "Palapa", "Parrilla", "Bicicletas"],
    bedrooms: 2,
    bathrooms: 2,
    size: "110m2",
    spv_name: "WEEK-CHAIN SPV 004 S.A. de C.V.",
    spv_rfc: "WCS040404JKL",
  },
  {
    name: "Costa Vallarta Premium",
    location: "Puerto Vallarta, Jalisco",
    description: "Suite premium con balcon y vista a la bahia de Banderas.",
    image_url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    status: "presale",
    total_weeks: 48,
    price_high_season: 7500,
    price_medium_season: 5500,
    price_low_season: 3800,
    amenities: ["Vista al mar", "Balcon privado", "Gym", "Restaurante", "Playa"],
    bedrooms: 1,
    bathrooms: 1,
    size: "65m2",
    spv_name: "WEEK-CHAIN SPV 005 S.A. de C.V.",
    spv_rfc: "WCS050505MNO",
  },
]

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState("integrations")

  const isStripeTest = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test")

  const seedTestProperties = async () => {
    setLoading(true)
    setSeedResult(null)

    try {
      const supabase = createClient()

      // Verificar cuantas propiedades ya existen
      const { data: existingProps, error: checkError } = await supabase
        .from("properties")
        .select("name")

      if (checkError) {
        setSeedResult({ success: false, message: `Error verificando propiedades: ${checkError.message}` })
        setLoading(false)
        return
      }

      const existingNames = existingProps?.map((p) => p.name) || []
      const propsToInsert = TEST_PROPERTIES.filter((p) => !existingNames.includes(p.name))

      if (propsToInsert.length === 0) {
        setSeedResult({ success: true, message: "Todas las propiedades de prueba ya existen en la base de datos." })
        setLoading(false)
        return
      }

      // Insertar propiedades
      const { data: insertedProps, error: insertError } = await supabase
        .from("properties")
        .insert(propsToInsert)
        .select()

      if (insertError) {
        setSeedResult({ success: false, message: `Error insertando propiedades: ${insertError.message}` })
        setLoading(false)
        return
      }

      // Crear semanas para cada propiedad insertada
      const currentYear = new Date().getFullYear()
      for (const prop of insertedProps || []) {
        const weeksToInsert = []
        for (let i = 1; i <= 52; i++) {
          weeksToInsert.push({
            property_id: prop.id,
            week_number: i,
            year: currentYear,
            status: i <= 48 ? "available" : "company",
            season: i <= 16 ? "high" : i <= 34 ? "medium" : "low",
          })
        }
        await supabase.from("weeks").insert(weeksToInsert)
      }

      setSeedResult({
        success: true,
        message: `Se insertaron ${insertedProps?.length || 0} propiedades con sus 52 semanas cada una.`,
      })
    } catch (error: any) {
      setSeedResult({ success: false, message: `Error: ${error.message}` })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Configuracion del Sistema</h1>
        <p className="text-slate-500 mt-1">Integraciones, datos de prueba y ajustes generales</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 w-full grid grid-cols-3">
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integraciones</TabsTrigger>
          <TabsTrigger value="test-data" className="text-xs sm:text-sm">Datos Prueba</TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm">Sistema</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          {/* Stripe Status */}
          <Card className={`border-2 ${isStripeTest ? "border-amber-200 bg-amber-50/50" : "border-emerald-200 bg-emerald-50/50"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isStripeTest ? "bg-amber-100" : "bg-emerald-100"}`}>
                    <CreditCard className={`h-5 w-5 ${isStripeTest ? "text-amber-600" : "text-emerald-600"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">Stripe</CardTitle>
                    <CardDescription className="text-xs">Procesador de pagos</CardDescription>
                  </div>
                </div>
                <Badge className={`text-xs ${isStripeTest ? "bg-amber-500" : "bg-emerald-500"}`}>
                  {isStripeTest ? "TEST" : "LIVE"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isStripeTest ? (
                <Alert className="border-amber-200 bg-amber-100">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs">
                    Modo TEST activo. Pagos NO reales. Cambia las claves en Vercel para produccion.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-emerald-200 bg-emerald-100">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800 text-xs">
                    Modo PRODUCCION activo. Los pagos son reales.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Supabase Status */}
          <Card className="border-2 border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Database className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Supabase</CardTitle>
                    <CardDescription className="text-xs">Base de datos y auth</CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-xs">CONECTADO</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Vercel Blob */}
          <Card className="border-2 border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Globe className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Vercel Blob</CardTitle>
                    <CardDescription className="text-xs">Almacenamiento</CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-xs">CONECTADO</Badge>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Test Data Tab */}
        <TabsContent value="test-data" className="space-y-4 mt-4">
          <Card className="border-sky-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-100">
                  <Building2 className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Propiedades de Prueba</CardTitle>
                  <CardDescription className="text-xs">Cargar 5 propiedades premium para testing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-slate-700">Propiedades incluidas:</p>
                <div className="space-y-1.5">
                  {TEST_PROPERTIES.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-white rounded p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                        <span className="font-medium truncate">{p.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                        ${p.price_high_season.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {seedResult && (
                <Alert className={seedResult.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
                  {seedResult.success ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={`text-xs ${seedResult.success ? "text-emerald-800" : "text-red-800"}`}>
                    {seedResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={seedTestProperties} disabled={loading} className="w-full bg-sky-500 hover:bg-sky-600">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Insertando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Cargar Propiedades
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Certificate Products */}
          <Card className="border-violet-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100">
                  <Zap className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Precios Certificados SVC</CardTitle>
                  <CardDescription className="text-xs">Catalogo de precios predefinidos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { pax: 2, weeks: 1, price: 6500 },
                  { pax: 2, weeks: 2, price: 11000 },
                  { pax: 4, weeks: 1, price: 8500 },
                  { pax: 4, weeks: 2, price: 15000 },
                  { pax: 6, weeks: 1, price: 12000 },
                  { pax: 6, weeks: 2, price: 22000 },
                  { pax: 8, weeks: 1, price: 16000 },
                  { pax: 8, weeks: 2, price: 30000 },
                  { pax: 10, weeks: 1, price: 20000 },
                  { pax: 10, weeks: 2, price: 35000 },
                ].map((cert, i) => (
                  <div key={i} className="bg-violet-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-violet-600 font-medium">{cert.pax}PAX / {cert.weeks}sem</p>
                    <p className="text-sm font-bold text-violet-900">${cert.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Modelo de Negocio</CardTitle>
                  <CardDescription className="text-xs">Configuracion WEEK-CHAIN</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Comision Brokers</p>
                  <p className="text-xl font-bold text-slate-900">4%</p>
                  <p className="text-[10px] text-slate-500">Fija, sin niveles</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Modelo Semanas</p>
                  <p className="text-xl font-bold text-slate-900">48+4</p>
                  <p className="text-[10px] text-slate-500">48 venta + 4 empresa</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Pre-Holder</p>
                  <p className="text-xl font-bold text-slate-900">$100</p>
                  <p className="text-[10px] text-slate-500">Reembolso 2 meses</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Descuento</p>
                  <p className="text-xl font-bold text-emerald-600">5%</p>
                  <p className="text-[10px] text-slate-500">Pre-Holders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold mb-1">Nota sobre Stripe</p>
                  <p>Para cambiar de modo TEST a PRODUCCION, actualiza las variables de entorno en el dashboard de Vercel:</p>
                  <ul className="mt-1 space-y-0.5 list-disc list-inside">
                    <li>STRIPE_SECRET_KEY</li>
                    <li>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
