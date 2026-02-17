"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Users, TrendingUp, Copy, Share2, Award, Network, CheckCircle } from "lucide-react"

export default function BrokerDashboard() {
  const [referralCode] = useState("BROKER-ELITE-2024")
  const [copied, setCopied] = useState(false)

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferralLink = () => {
    const link = `https://weekchain.com/register?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    alert("¡Link de referido copiado!")
  }

  // Datos de ejemplo
  const stats = {
    totalCommissions: 12450,
    directSales: 8,
    level2Referrals: 3,
    level3Referrals: 5,
    totalReferrals: 16,
    monthlyEarnings: 3200,
  }

  const recentSales = [
    { id: 1, property: "Villa Paraíso", week: 12, commission: 250, level: 1, date: "2024-01-15" },
    { id: 2, property: "Casa del Mar", week: 25, commission: 100, level: 2, date: "2024-01-14" },
    { id: 3, property: "Refugio Montaña", week: 8, commission: 50, level: 3, date: "2024-01-13" },
    { id: 4, property: "Villa Paraíso", week: 30, commission: 250, level: 1, date: "2024-01-12" },
  ]

  const referralTree = [
    {
      id: 1,
      name: "Juan Pérez",
      level: 1,
      sales: 5,
      earnings: 1250,
      status: "active",
      referrals: [
        { id: 2, name: "María García", level: 2, sales: 3, earnings: 300, status: "active" },
        { id: 3, name: "Carlos López", level: 2, sales: 2, earnings: 200, status: "active" },
      ],
    },
    {
      id: 4,
      name: "Ana Martínez",
      level: 1,
      sales: 4,
      earnings: 1000,
      status: "active",
      referrals: [
        {
          id: 5,
          name: "Pedro Sánchez",
          level: 2,
          sales: 2,
          earnings: 200,
          status: "active",
          referrals: [
            { id: 6, name: "Laura Torres", level: 3, sales: 3, earnings: 150, status: "active" },
            { id: 7, name: "Diego Ruiz", level: 3, sales: 2, earnings: 100, status: "active" },
          ],
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">Dashboard Broker Elite</h1>
          </div>
          <p className="text-lg text-slate-600">Gestiona tus referidos y comisiones</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-100">
                Comisiones Totales <span className="text-[#B5EAD7] text-xs">(IVA inc.)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-8 w-8" />
                <span className="text-3xl font-bold">${stats.totalCommissions.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-pink-100">Ventas Directas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8" />
                <span className="text-3xl font-bold">{stats.directSales}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">Total Referidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8" />
                <span className="text-3xl font-bold">{stats.totalReferrals}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-100">
                Este Mes <span className="text-[#B5EAD7] text-xs">(IVA inc.)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-8 w-8" />
                <span className="text-3xl font-bold">${stats.monthlyEarnings.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Section */}
        <Card className="mb-8 border-2 border-purple-200 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-slate-900">
              <Share2 className="h-6 w-6 text-purple-600" />
              Tu Código de Referido
            </CardTitle>
            <CardDescription className="text-base">
              Comparte este código con tus contactos para ganar comisiones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="referral-code" className="text-sm font-medium text-slate-700">
                  Código de Referido
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="referral-code"
                    value={referralCode}
                    readOnly
                    className="font-mono text-lg font-bold border-2 border-purple-200"
                  />
                  <Button
                    onClick={copyReferralCode}
                    variant="outline"
                    className="border-2 border-purple-200 hover:bg-purple-50 bg-transparent"
                  >
                    {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <p className="text-sm font-medium text-slate-700 mb-2">Link de Referido:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-purple-200 text-purple-700">
                  https://weekchain.com/register?ref={referralCode}
                </code>
                <Button
                  onClick={shareReferralLink}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">6%</div>
                <p className="text-sm font-medium text-slate-700">Venta Directa</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">4%</div>
                <p className="text-sm font-medium text-slate-700">Referido Vende (tú)</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-50 border-2 border-pink-200">
                <div className="text-3xl font-bold text-pink-600 mb-1">3%</div>
                <p className="text-sm font-medium text-slate-700">Red Nivel 3 (tú)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="bg-white border-2 border-purple-200 p-1">
            <TabsTrigger value="sales" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Ventas Recientes
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Red de Referidos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Análisis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Ventas y Comisiones Recientes</CardTitle>
                <CardDescription>Historial de tus últimas comisiones generadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2 border-purple-100 bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-slate-900">{sale.property}</h4>
                          <Badge
                            variant="outline"
                            className={
                              sale.level === 1
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : sale.level === 2
                                  ? "bg-purple-100 text-purple-700 border-purple-300"
                                  : "bg-pink-100 text-pink-700 border-pink-300"
                            }
                          >
                            Nivel {sale.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          Semana {sale.week} • {new Date(sale.date).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${sale.commission}</div>
                        <p className="text-xs text-slate-500">Comisión</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-slate-900">
                  <Network className="h-6 w-6 text-purple-600" />
                  Tu Red de Referidos Multinivel
                </CardTitle>
                <CardDescription>Visualiza tu estructura de referidos y sus ventas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {referralTree.map((level1) => (
                    <div key={level1.id} className="space-y-4">
                      {/* Nivel 1 */}
                      <div className="p-5 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                              {level1.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{level1.name}</h4>
                              <p className="text-sm text-slate-600">Nivel 1 - Referido Directo</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">${level1.earnings}</div>
                            <p className="text-xs text-slate-600">{level1.sales} ventas</p>
                          </div>
                        </div>
                      </div>

                      {/* Nivel 2 */}
                      {level1.referrals && level1.referrals.length > 0 && (
                        <div className="ml-8 space-y-3">
                          {level1.referrals.map((level2) => (
                            <div key={level2.id} className="space-y-3">
                              <div className="p-4 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                                      {level2.name.charAt(0)}
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-slate-900">{level2.name}</h5>
                                      <p className="text-xs text-slate-600">Nivel 2</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-purple-600">${level2.earnings}</div>
                                    <p className="text-xs text-slate-600">{level2.sales} ventas</p>
                                  </div>
                                </div>
                              </div>

                              {/* Nivel 3 */}
                              {level2.referrals && level2.referrals.length > 0 && (
                                <div className="ml-8 space-y-2">
                                  {level2.referrals.map((level3) => (
                                    <div
                                      key={level3.id}
                                      className="p-3 rounded-lg border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-pink-100"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs">
                                            {level3.name.charAt(0)}
                                          </div>
                                          <div>
                                            <h6 className="font-semibold text-sm text-slate-900">{level3.name}</h6>
                                            <p className="text-xs text-slate-600">Nivel 3</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-pink-600">${level3.earnings}</div>
                                          <p className="text-xs text-slate-600">{level3.sales} ventas</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Análisis de Rendimiento</CardTitle>
                <CardDescription>Métricas detalladas de tu desempeño como Broker Elite</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                    <h4 className="font-semibold text-lg text-slate-900 mb-4">Comisiones por Escenario</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Venta Directa (6%)</span>
                        <span className="font-bold text-blue-600">$7,470</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Referido Vende (4%)</span>
                        <span className="font-bold text-purple-600">$3,980</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Red Nivel 3 (3%)</span>
                        <span className="font-bold text-pink-600">$1,000</span>
                      </div>
                      {/* </CHANGE> */}
                      <div className="pt-3 border-t-2 border-blue-300 flex justify-between items-center">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="font-bold text-xl text-slate-900">
                          ${stats.totalCommissions.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                    <h4 className="font-semibold text-lg text-slate-900 mb-4">Crecimiento de Red</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Referidos Directos</span>
                        <span className="font-bold text-blue-600">{stats.directSales}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Nivel 2</span>
                        <span className="font-bold text-purple-600">{stats.level2Referrals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Nivel 3</span>
                        <span className="font-bold text-pink-600">{stats.level3Referrals}</span>
                      </div>
                      <div className="pt-3 border-t-2 border-purple-300 flex justify-between items-center">
                        <span className="font-semibold text-slate-900">Red Total</span>
                        <span className="font-bold text-xl text-slate-900">{stats.totalReferrals}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                  <h4 className="font-semibold text-lg text-slate-900 mb-3">Proyección Mensual</h4>
                  <p className="text-slate-700 mb-4">
                    Basado en tu rendimiento actual, tu proyección de ingresos para el próximo mes es:
                  </p>
                  <div className="text-4xl font-bold text-green-600 mb-2">$4,800</div>
                  <p className="text-sm text-slate-600">+50% respecto al mes anterior</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
