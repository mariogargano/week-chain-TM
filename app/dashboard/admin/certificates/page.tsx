"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ticket, Settings, Users, Calendar, AlertTriangle, CheckCircle, XCircle, Play, Ban, RefreshCw, Edit, Save, Loader2, Layers, Activity, Shield, Clock, Hash, QrCode, Eye, Copy, Download, Zap,  } from "lucide-react";

interface CertificateProduct {
  id: string
  name: string
  tier: string
  max_pax: number
  max_estancias_per_year: number
  price_usd: number
  sales_enabled: boolean
  created_at: string
  max_supply?: number
  sold_count?: number
}

interface SystemCapacity {
  total_weeks_supply: number
  safe_capacity_weeks: number
  utilization_percent: number
  status: string
  active_properties: number
  operating_countries: number
}

export default function SVCConfiguratorPage() {
  const [activeTab, setActiveTab] = useState("products")
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<CertificateProduct[]>([])
  const [capacity, setCapacity] = useState<SystemCapacity | null>(null)
  const [activeCerts, setActiveCerts] = useState<Record<string, number>>({})
  const [editingProduct, setEditingProduct] = useState<CertificateProduct | null>(null)
  const [saving, setSaving] = useState(false)

  // Config states
  const [config, setConfig] = useState({
    weeksPerProperty: 52,
    sellableWeeks: 48,
    maintenanceWeeks: 4,
    maxAdvanceBookingDays: 365,
    minAdvanceBookingDays: 14,
    holdPeriodDays: 45,
    certDurationYears: 25,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from("certificate_products_v2")
        .select("*")
        .order("max_pax", { ascending: true })
        .order("max_estancias_per_year", { ascending: true })

      // Fetch active certificates count
      const { data: activeCertsData } = await supabase
        .from("user_certificates_v2")
        .select("product_id, status")
        .eq("status", "active")

      const certCounts: Record<string, number> = {}
      activeCertsData?.forEach((cert: any) => {
        certCounts[cert.product_id] = (certCounts[cert.product_id] || 0) + 1
      })

      // Fetch system capacity
      const { data: capacityData } = await supabase
        .from("system_capacity")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single()

      setProducts(productsData || [])
      setActiveCerts(certCounts)
      setCapacity(capacityData)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  const toggleProductSales = async (productId: string, currentEnabled: boolean) => {
    try {
      await supabase
        .from("certificate_products_v2")
        .update({ sales_enabled: !currentEnabled })
        .eq("id", productId)

      fetchData()
    } catch (error) {
      console.error("Error toggling sales:", error)
    }
  }

  const saveProductChanges = async () => {
    if (!editingProduct) return

    setSaving(true)
    try {
      await supabase
        .from("certificate_products_v2")
        .update({
          name: editingProduct.name,
          price_usd: editingProduct.price_usd,
          max_pax: editingProduct.max_pax,
          max_estancias_per_year: editingProduct.max_estancias_per_year,
          max_supply: editingProduct.max_supply,
        })
        .eq("id", editingProduct.id)

      setEditingProduct(null)
      fetchData()
    } catch (error) {
      console.error("Error saving product:", error)
    }
    setSaving(false)
  }

  const globalStopSale = async () => {
    if (!confirm("ATENCION: Esto detendra TODAS las ventas de certificados. Continuar?")) return

    try {
      await supabase
        .from("certificate_products_v2")
        .update({ sales_enabled: false })
        .neq("id", "")

      fetchData()
      alert("Stop-sale global activado")
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const totalActive = Object.values(activeCerts).reduce((sum, count) => sum + count, 0)
  const totalProducts = products.length
  const enabledProducts = products.filter(p => p.sales_enabled).length

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return "text-red-600 bg-red-50 border-red-200"
    if (percent >= 75) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-emerald-600 bg-emerald-50 border-emerald-200"
  }

  const getCapacityStatus = (percent: number) => {
    if (percent >= 90) return { label: "CRITICO", color: "bg-red-500" }
    if (percent >= 75) return { label: "ALERTA", color: "bg-amber-500" }
    if (percent >= 50) return { label: "MODERADO", color: "bg-sky-500" }
    return { label: "SALUDABLE", color: "bg-emerald-500" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Configurador SVC</h1>
          <p className="text-slate-500 mt-1">Smart Vacational Certificate - Gestion completa del producto</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="border-sky-500/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* System Status Banner */}
      {capacity && (
        <Card className={`border-2 ${getCapacityColor(capacity.utilization_percent)}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${getCapacityStatus(capacity.utilization_percent).color}`}>
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">ESTADO DEL SISTEMA</p>
                  <p className="text-3xl font-bold">{capacity.utilization_percent.toFixed(1)}%</p>
                  <p className="text-sm text-slate-500">de capacidad utilizada</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500">Supply Total</p>
                  <p className="text-lg font-bold">{capacity.total_weeks_supply} sem</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Capacidad Segura</p>
                  <p className="text-lg font-bold">{capacity.safe_capacity_weeks} sem</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Propiedades</p>
                  <p className="text-lg font-bold">{capacity.active_properties}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Paises</p>
                  <p className="text-lg font-bold">{capacity.operating_countries}</p>
                </div>
              </div>
              <Badge className={`${getCapacityStatus(capacity.utilization_percent).color} text-white px-4 py-2 text-lg`}>
                {getCapacityStatus(capacity.utilization_percent).label}
              </Badge>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getCapacityStatus(capacity.utilization_percent).color}`}
                style={{ width: `${Math.min(capacity.utilization_percent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50">
                <Ticket className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Certificados Activos</p>
                <p className="text-xl font-bold text-slate-900">{totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Layers className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Productos</p>
                <p className="text-xl font-bold text-slate-900">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <Play className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">En Venta</p>
                <p className="text-xl font-bold text-violet-600">{enabledProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Ban className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Detenidos</p>
                <p className="text-xl font-bold text-amber-600">{totalProducts - enabledProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur border border-sky-500/20">
          <TabsTrigger value="products">Productos SVC</TabsTrigger>
          <TabsTrigger value="rules">Motor Capacidad (48+4)</TabsTrigger>
          <TabsTrigger value="lifecycle">Ciclo de Vida</TabsTrigger>
          <TabsTrigger value="hash">Hash + QR</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {/* PAX Groups */}
          {[2, 4, 6, 8].map(pax => {
            const paxProducts = products.filter(p => p.max_pax === pax)
            const paxTotal = paxProducts.reduce((sum, p) => sum + (activeCerts[p.id] || 0), 0)

            if (paxProducts.length === 0) return null

            return (
              <Card key={pax} className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b border-sky-500/10 bg-sky-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Certificados {pax} PAX</CardTitle>
                      <CardDescription>{paxTotal} certificados activos - {paxProducts.length} productos</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      <Users className="h-4 w-4 mr-2" />
                      {pax} personas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paxProducts.map(product => {
                      const sold = activeCerts[product.id] || 0
                      const maxSupply = product.max_supply || 100
                      const utilization = (sold / maxSupply) * 100

                      return (
                        <Card
                          key={product.id}
                          className={`border-2 transition-all ${
                            product.sales_enabled
                              ? "border-emerald-200 bg-emerald-50/30" :"border-red-200 bg-red-50/30"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Estancias/Ano</p>
                                <p className="text-2xl font-bold text-slate-900">{product.max_estancias_per_year}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingProduct(product)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Precio:</span>
                                <span className="font-bold text-slate-900">${product.price_usd.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Vendidos:</span>
                                <span className="font-bold text-sky-600">{sold} / {maxSupply}</span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${utilization >= 90 ? "bg-red-500" : utilization >= 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                />
                              </div>
                            </div>

                            <Button
                              onClick={() => toggleProductSales(product.id, product.sales_enabled)}
                              className={`w-full ${
                                product.sales_enabled
                                  ? "bg-red-500 hover:bg-red-600" :"bg-emerald-500 hover:bg-emerald-600"
                              }`}
                              size="sm"
                            >
                              {product.sales_enabled ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Detener Ventas
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activar Ventas
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
          <Card className="border-2 border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Acciones Globales de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive" onClick={globalStopSale}>
                  <Ban className="h-4 w-4 mr-2" />
                  STOP-SALE GLOBAL
                </Button>
                <Button variant="outline" className="border-red-300 text-red-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recalcular Capacidad
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capacity Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  Reglas de Semanas (48+4)
                </CardTitle>
                <CardDescription>Configuracion del inventario de semanas por propiedad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Semanas Totales por Propiedad</Label>
                    <span className="font-bold">{config.weeksPerProperty}</span>
                  </div>
                  <Slider
                    value={[config.weeksPerProperty]}
                    onValueChange={([v]) => setConfig({ ...config, weeksPerProperty: v })}
                    max={52}
                    min={52}
                    disabled
                    className="opacity-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Fijo: 52 semanas = 1 ano completo</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Semanas Vendibles</Label>
                    <span className="font-bold text-emerald-600">{config.sellableWeeks}</span>
                  </div>
                  <Slider
                    value={[config.sellableWeeks]}
                    onValueChange={([v]) => setConfig({ ...config, sellableWeeks: v, maintenanceWeeks: 52 - v })}
                    max={50}
                    min={40}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Semanas Mantenimiento/Empresa</Label>
                    <span className="font-bold text-amber-600">{config.maintenanceWeeks}</span>
                  </div>
                  <Slider
                    value={[config.maintenanceWeeks]}
                    onValueChange={([v]) => setConfig({ ...config, maintenanceWeeks: v, sellableWeeks: 52 - v })}
                    max={12}
                    min={2}
                  />
                </div>

                <div className="p-4 rounded-lg bg-sky-50 border border-sky-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Distribucion Actual</span>
                    <Badge className="bg-sky-500">52 semanas</Badge>
                  </div>
                  <div className="flex gap-1 h-4">
                    <div
                      className="bg-emerald-500 rounded-l"
                      style={{ width: `${(config.sellableWeeks / 52) * 100}%` }}
                    />
                    <div
                      className="bg-amber-500 rounded-r"
                      style={{ width: `${(config.maintenanceWeeks / 52) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-emerald-600">{config.sellableWeeks} vendibles</span>
                    <span className="text-amber-600">{config.maintenanceWeeks} mantenimiento</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-600" />
                  Politicas de Reserva
                </CardTitle>
                <CardDescription>Ventanas de tiempo y restricciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Anticipacion Maxima (dias)</Label>
                    <span className="font-bold">{config.maxAdvanceBookingDays}</span>
                  </div>
                  <Slider
                    value={[config.maxAdvanceBookingDays]}
                    onValueChange={([v]) => setConfig({ ...config, maxAdvanceBookingDays: v })}
                    max={730}
                    min={90}
                  />
                  <p className="text-xs text-slate-500 mt-1">Reservar hasta {config.maxAdvanceBookingDays} dias en el futuro</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Anticipacion Minima (dias)</Label>
                    <span className="font-bold">{config.minAdvanceBookingDays}</span>
                  </div>
                  <Slider
                    value={[config.minAdvanceBookingDays]}
                    onValueChange={([v]) => setConfig({ ...config, minAdvanceBookingDays: v })}
                    max={60}
                    min={1}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Periodo de Hold (dias)</Label>
                    <span className="font-bold">{config.holdPeriodDays}</span>
                  </div>
                  <Slider
                    value={[config.holdPeriodDays]}
                    onValueChange={([v]) => setConfig({ ...config, holdPeriodDays: v })}
                    max={90}
                    min={7}
                  />
                  <p className="text-xs text-slate-500 mt-1">Tiempo que se retiene el pago antes de liberar</p>
                </div>

                <Button className="w-full bg-sky-500 hover:bg-sky-600">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuracion
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lifecycle Tab */}
        <TabsContent value="lifecycle" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Ciclo de Vida del Certificado SVC</CardTitle>
              <CardDescription>Estados y transiciones del certificado a lo largo de sus {config.certDurationYears} anos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                {[
                  { status: "EMITIDO", icon: Ticket, color: "bg-sky-500", desc: "Certificado creado tras pago" },
                  { status: "ACTIVO", icon: CheckCircle, color: "bg-emerald-500", desc: "En uso, puede reservar" },
                  { status: "EN HOLD", icon: Clock, color: "bg-amber-500", desc: "Suspension temporal" },
                  { status: "SUSPENDIDO", icon: AlertTriangle, color: "bg-orange-500", desc: "Problema de pago/compliance" },
                  { status: "RESCINDIDO", icon: XCircle, color: "bg-red-500", desc: "Cancelado por incumplimiento" },
                  { status: "EXPIRADO", icon: Ban, color: "bg-slate-500", desc: "Fin de vigencia (25 anos)" },
                ].map((state, idx) => (
                  <div key={state.status} className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${state.color} text-white mb-2`}>
                      <state.icon className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-sm">{state.status}</p>
                    <p className="text-xs text-slate-500 max-w-[120px]">{state.desc}</p>
                    {idx < 5 && (
                      <div className="hidden md:block absolute transform translate-x-[60px]">
                        <Zap className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Lifecycle Settings */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Duracion y Vigencia</h3>
                  <div className="p-4 rounded-lg bg-slate-50 border">
                    <div className="flex justify-between mb-2">
                      <Label>Duracion del Certificado</Label>
                      <span className="font-bold">{config.certDurationYears} anos</span>
                    </div>
                    <Slider
                      value={[config.certDurationYears]}
                      onValueChange={([v]) => setConfig({ ...config, certDurationYears: v })}
                      max={50}
                      min={10}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Transiciones Automaticas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Auto-suspend por falta de pago</p>
                        <p className="text-xs text-slate-500">Despues de 30 dias de mora</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Notificar 90 dias antes de expiracion</p>
                        <p className="text-xs text-slate-500">Email automatico al holder</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Bloquear si KYC vencido</p>
                        <p className="text-xs text-slate-500">Requiere reverificacion anual</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hash + QR Tab */}
        <TabsContent value="hash" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-sky-600" />
                Integridad Criptografica
              </CardTitle>
              <CardDescription>Generacion de hash SHA256 y codigo QR para verificacion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hash Generation Demo */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Generar Hash para Certificado</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>ID del Certificado</Label>
                      <Input placeholder="Ej: cert_abc123..." className="mt-1 font-mono text-sm" />
                    </div>
                    <Button className="w-full bg-sky-500 hover:bg-sky-600">
                      <Hash className="h-4 w-4 mr-2" />
                      Generar Hash SHA256
                    </Button>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-slate-50 border">
                    <Label className="text-xs text-slate-500">Hash Generado</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 text-xs bg-white p-2 rounded border font-mono break-all">
                        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </code>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Codigo QR de Verificacion</h3>
                  <div className="p-8 border-2 border-dashed rounded-lg text-center bg-white">
                    <QrCode className="h-32 w-32 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500">El QR se genera automaticamente</p>
                    <p className="text-xs text-slate-400 mt-1">Contiene URL de verificacion + hash</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar QR
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent Hashes */}
              <div>
                <h3 className="font-semibold mb-4">Hashes Recientes</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-mono text-sm">cert_demo{i}...xyz</p>
                          <p className="text-xs text-slate-500">Generado hace {i} hora{i > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">Verificado</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Producto SVC</DialogTitle>
            <DialogDescription>Modifica la configuracion del producto</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PAX Maximo</Label>
                  <Input
                    type="number"
                    value={editingProduct.max_pax}
                    onChange={(e) => setEditingProduct({ ...editingProduct, max_pax: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Estancias/Ano</Label>
                  <Input
                    type="number"
                    value={editingProduct.max_estancias_per_year}
                    onChange={(e) => setEditingProduct({ ...editingProduct, max_estancias_per_year: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Precio USD</Label>
                  <Input
                    type="number"
                    value={editingProduct.price_usd}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price_usd: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Supply</Label>
                  <Input
                    type="number"
                    value={editingProduct.max_supply || 100}
                    onChange={(e) => setEditingProduct({ ...editingProduct, max_supply: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={saveProductChanges}
                  disabled={saving}
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
