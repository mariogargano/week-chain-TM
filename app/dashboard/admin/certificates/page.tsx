"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, Ban, Play } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function CertificatesControlPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<any[]>([])
  const [betaConfig, setBetaConfig] = useState<any>(null)
  const [activeCertificates, setActiveCertificates] = useState<any>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Verify admin
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }

      const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", session.user.id).single()

      if (!adminUser || adminUser.status !== "active") {
        router.push("/dashboard")
        return
      }

      // Fetch certificate products
      const { data: products } = await supabase
        .from("certificate_products_v2")
        .select("*")
        .order("max_pax", { ascending: true })
        .order("max_estancias_per_year", { ascending: true })

      // Fetch beta config
      const { data: betaCfg } = await supabase.from("beta_config").select("*").single()

      // Fetch active certificates count by product
      const { data: activeCerts } = await supabase
        .from("user_certificates")
        .select("product_id, status")
        .eq("status", "active")

      // Group by product_id
      const certCounts: any = {}
      activeCerts?.forEach((cert: any) => {
        certCounts[cert.product_id] = (certCounts[cert.product_id] || 0) + 1
      })

      setCertificates(products || [])
      setBetaConfig(betaCfg)
      setActiveCertificates(certCounts)
      setLoading(false)
    } catch (error) {
      console.error("Error loading certificate control:", error)
      setLoading(false)
    }
  }

  const toggleSales = async (productId: string, currentEnabled: boolean) => {
    try {
      const supabase = createClient()
      await supabase.from("certificate_products_v2").update({ sales_enabled: !currentEnabled }).eq("id", productId)

      fetchData()
    } catch (error) {
      console.error("Error toggling sales:", error)
    }
  }

  const totalActive = Object.values(activeCertificates).reduce((sum: number, count: any) => sum + count, 0)
  const betaCapUsed = betaConfig ? (totalActive / betaConfig.total_cap) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Cargando control de certificados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Control de Certificados</h1>
          <p className="text-slate-600">Gestión completa del catálogo de productos y límites de beta</p>
        </div>

        {/* Beta Status Card */}
        <Card
          className={`border-4 ${betaCapUsed > 90 ? "border-red-500" : betaCapUsed > 75 ? "border-orange-500" : "border-green-500"}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">LÍMITE BETA</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {totalActive} / {betaConfig?.total_cap || 68} certificados
                </p>
                <div className="mt-4 h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${betaCapUsed > 90 ? "bg-red-500" : betaCapUsed > 75 ? "bg-orange-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(betaCapUsed, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-2">{betaCapUsed.toFixed(1)}% de capacidad beta utilizada</p>
              </div>
              {betaCapUsed > 90 && (
                <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  BETA CASI COMPLETO
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products by PAX */}
        {[2, 4, 6, 8].map((pax) => {
          const paxProducts = certificates.filter((p) => p.max_pax === pax)
          const paxTotal = paxProducts.reduce((sum, p) => sum + (activeCertificates[p.id] || 0), 0)
          const paxCap = betaConfig?.[`cap_${pax}pax`] || 0
          const paxUtilization = paxCap > 0 ? (paxTotal / paxCap) * 100 : 0

          return (
            <Card key={pax} className="border-2 border-blue-100">
              <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Certificados {pax} PAX</CardTitle>
                    <CardDescription>
                      {paxTotal} / {paxCap} vendidos ({paxUtilization.toFixed(1)}% de cuota)
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{paxProducts.length} productos</div>
                    <div className="text-sm text-slate-600">1-4 estancias</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {paxProducts.map((product) => {
                    const sold = activeCertificates[product.id] || 0
                    const salesEnabled = product.sales_enabled

                    return (
                      <Card
                        key={product.id}
                        className={`border-2 ${salesEnabled ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs font-medium text-slate-600">ESTANCIAS</p>
                              <p className="text-2xl font-bold text-slate-900">{product.max_estancias_per_year}</p>
                            </div>
                            <Badge className={salesEnabled ? "bg-green-600" : "bg-red-600"}>
                              {salesEnabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Precio:</span>
                              <span className="font-bold text-slate-900">
                                ${product.price_usd.toLocaleString()} USD
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Vendidos:</span>
                              <span className="font-bold text-blue-600">{sold}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => toggleSales(product.id, salesEnabled)}
                            className={`w-full ${salesEnabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                            size="sm"
                          >
                            {salesEnabled ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                Detener
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Global Actions */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Acciones Globales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (confirm("¿Detener TODAS las ventas de certificados?")) {
                    // TODO: Implement global stop-sale
                  }
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                STOP-SALE GLOBAL
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
