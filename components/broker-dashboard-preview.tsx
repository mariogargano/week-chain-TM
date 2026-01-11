"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  ArrowUpRight,
  Briefcase,
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react"

// Sample data that rotates
const brokerProfiles = [
  {
    name: "María González",
    country: "🇲🇽",
    location: "Ciudad de México",
    avatar: "/professional-latina-woman-headshot.jpg",
    level: "Silver",
    totalSales: 127500,
    thisMonth: 18500,
    clients: 23,
    deals: 17,
    conversionRate: 68,
    weeksSold: 32,
  },
  {
    name: "James Wilson",
    country: "🇺🇸",
    location: "Miami, FL",
    avatar: "/professional-american-man-headshot.jpg",
    level: "Elite",
    totalSales: 285000,
    thisMonth: 42000,
    clients: 45,
    deals: 38,
    conversionRate: 74,
    weeksSold: 56,
  },
  {
    name: "Sophie Müller",
    country: "🇩🇪",
    location: "Berlin",
    avatar: "/professional-german-woman-headshot.jpg",
    level: "Entry",
    totalSales: 68500,
    thisMonth: 12000,
    clients: 12,
    deals: 9,
    conversionRate: 58,
    weeksSold: 12,
  },
  {
    name: "Carlos Mendoza",
    country: "🇪🇸",
    location: "Madrid",
    avatar: "/professional-spanish-man-headshot.jpg",
    level: "Silver",
    totalSales: 156000,
    thisMonth: 28000,
    clients: 31,
    deals: 24,
    conversionRate: 71,
    weeksSold: 38,
  },
  {
    name: "Yuki Tanaka",
    country: "🇯🇵",
    location: "Tokyo",
    avatar: "/professional-japanese-woman-headshot.jpg",
    level: "Elite",
    totalSales: 312000,
    thisMonth: 55000,
    clients: 52,
    deals: 44,
    conversionRate: 79,
    weeksSold: 72,
  },
]

const monthlyData = [
  { month: "Ene", value: 35 },
  { month: "Feb", value: 45 },
  { month: "Mar", value: 38 },
  { month: "Abr", value: 52 },
  { month: "May", value: 48 },
  { month: "Jun", value: 65 },
]

export function BrokerDashboardPreview() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % brokerProfiles.length)
        setIsAnimating(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const profile = brokerProfiles[currentIndex]
  const maxValue = Math.max(...monthlyData.map((d) => d.value))

  const getBrokerTier = (weeksSold: number) => {
    if (weeksSold >= 48)
      return { tier: "Elite", commission: 6, badge: "Gold", benefit: 2, nextTier: null, weeksToNext: 0 }
    if (weeksSold >= 24)
      return {
        tier: "Silver",
        commission: 5,
        badge: "Silver",
        benefit: 1,
        nextTier: "Elite",
        weeksToNext: 48 - weeksSold,
      }
    return {
      tier: "Entry",
      commission: 4,
      badge: "Standard",
      benefit: 0,
      nextTier: "Silver",
      weeksToNext: 24 - weeksSold,
    }
  }

  const tierInfo = getBrokerTier(profile.weeksSold)

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Elite":
        return { bg: "from-amber-500 to-yellow-400", text: "text-amber-400", border: "border-amber-500/30" }
      case "Silver":
        return { bg: "from-slate-400 to-slate-300", text: "text-slate-300", border: "border-slate-400/30" }
      default:
        return { bg: "from-emerald-500 to-teal-400", text: "text-emerald-400", border: "border-emerald-500/30" }
    }
  }

  const tierColors = getTierColor(tierInfo.tier)

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Elite":
        return "from-amber-500 to-yellow-400"
      case "Silver":
        return "from-slate-400 to-slate-300"
      default:
        return "from-emerald-500 to-teal-400"
    }
  }

  return (
    <section className="px-4 py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200 text-sm font-semibold px-4 py-2">
            <Award className="h-4 w-4 mr-2" />
            Programa de Intermediarios
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Obtén hasta el 6% en Honorarios
            <span className="block text-2xl md:text-3xl mt-2 text-slate-600">
              por cada Venta Efectiva <span className="text-[#B5EAD7] text-lg">(IVA incluido)</span>
            </span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Únete a nuestra red de intermediarios profesionales y genera beneficios por cada contratación de servicios
            de tiempo compartido que realices.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Dashboard Preview - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div
              className={`relative w-full transition-all duration-300 ${
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              {/* Main Dashboard Card */}
              <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 shadow-2xl">
                {/* Header */}
                <div className="relative p-6 pb-0">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />

                  <div className="relative flex items-start justify-between">
                    {/* Profile Section */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/20">
                          <img
                            src={profile.avatar || "/placeholder.svg"}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 text-xl">{profile.country}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                          <Badge
                            className={`bg-gradient-to-r ${getLevelColor(profile.level)} text-white border-0 text-xs`}
                          >
                            {profile.level === "Elite" && <Award className="h-3 w-3 mr-1" />}
                            {profile.level}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{profile.location}</p>
                      </div>
                    </div>

                    {/* WEEK-CHAIN Logo */}
                    <div className="text-right hidden sm:block">
                      <div className="text-white font-bold text-lg tracking-tight">
                        WEEK-CHAIN<span className="text-amber-400 text-xs align-super">™</span>
                      </div>
                      <p className="text-slate-500 text-xs">Panel de Intermediario</p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {/* Total Earnings */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400 flex items-center">
                          <ArrowUpRight className="h-3 w-3" />
                          +12%
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">${(profile.totalSales * 0.06).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">
                        Honorarios Totales <span className="text-[#B5EAD7]">(IVA inc.)</span>
                      </p>
                    </div>

                    {/* This Month */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-blue-400 flex items-center">
                          <ArrowUpRight className="h-3 w-3" />
                          +8%
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">${(profile.thisMonth * 0.06).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">
                        Este Mes <span className="text-[#B5EAD7]">(IVA inc.)</span>
                      </p>
                    </div>

                    {/* Clients */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <Users className="h-4 w-4 text-purple-400" />
                      </div>
                      <p className="text-xl font-bold text-white">{profile.clients}</p>
                      <p className="text-xs text-slate-400">Clientes Activos</p>
                    </div>

                    {/* Conversion */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-xl font-bold text-white">{profile.conversionRate}%</p>
                      <p className="text-xs text-slate-400">Tasa de Cierre</p>
                    </div>
                  </div>

                  {/* Chart Preview */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold text-sm">Actividad Mensual</h4>
                        <p className="text-slate-400 text-xs">Últimos 6 meses</p>
                      </div>
                      <BarChart3 className="h-4 w-4 text-slate-400" />
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="flex items-end justify-between gap-2 h-20">
                      {monthlyData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all duration-500"
                            style={{ height: `${(data.value / maxValue) * 100}%` }}
                          />
                          <span className="text-xs text-slate-500 mt-1">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-black/20 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Dashboard actualizado en tiempo real</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-400">En línea</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Profile indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {brokerProfiles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "w-8 bg-slate-900" : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Broker Extra Benefit Card */}
            <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 shadow-2xl">
              {/* Decorative patterns */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-2xl" />

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tierColors.bg} flex items-center justify-center shadow-lg`}
                    >
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Broker Extra Benefit</h3>
                      <p className="text-sm text-slate-400">Sistema de niveles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm tracking-tight">
                      WEEK-CHAIN<span className="text-amber-400 text-xs align-super">™</span>
                    </div>
                  </div>
                </div>

                {/* Current Level Display */}
                <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border ${tierColors.border} mb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`bg-gradient-to-r ${tierColors.bg} text-white border-0 text-xs font-bold px-3 py-1`}
                      >
                        {tierInfo.tier.toUpperCase()}
                      </Badge>
                      <span className="text-slate-400 text-sm">Nivel Actual</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${tierColors.text}`}>{tierInfo.commission}%</div>
                      <p className="text-[#B5EAD7] text-[10px]">IVA incluido</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">{profile.weeksSold}</p>
                      <p className="text-slate-500 text-xs">Semanas</p>
                    </div>
                    <div className="text-center border-x border-white/10">
                      <p className="text-white font-bold text-lg">{tierInfo.badge}</p>
                      <p className="text-slate-500 text-xs">Badge</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`font-bold text-lg ${tierInfo.benefit > 0 ? "text-emerald-400" : "text-slate-500"}`}
                      >
                        {tierInfo.benefit > 0 ? `${tierInfo.benefit} sem` : "No"}
                      </p>
                      <p className="text-slate-500 text-xs">Uso Propio</p>
                    </div>
                  </div>
                </div>

                {/* Benefit Description */}
                {tierInfo.benefit > 0 ? (
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border border-emerald-500/30 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                      <span className="font-bold text-emerald-400">Beneficio Activo</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {tierInfo.benefit} semana{tierInfo.benefit > 1 ? "s" : ""} de uso propio por año en cualquier
                      propiedad WEEK-CHAIN
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-5 w-5 text-amber-400" />
                      <span className="font-bold text-white">Sin beneficio extra</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Alcanza nivel Silver (24+ semanas) para obtener 1 semana de uso propio por año
                    </p>
                  </div>
                )}

                {/* Progress to Next Level */}
                {tierInfo.nextTier && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Progreso a {tierInfo.nextTier}</span>
                      <span className="text-sm font-bold text-amber-400">Faltan {tierInfo.weeksToNext} semanas</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTierColor(tierInfo.nextTier).bg} rounded-full transition-all duration-500`}
                        style={{
                          width: `${
                            tierInfo.tier === "Entry"
                              ? (profile.weeksSold / 24) * 100
                              : ((profile.weeksSold - 24) / 24) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Elite Badge - Fully Qualified */}
                {tierInfo.tier === "Elite" && (
                  <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl p-4 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-5 w-5 text-amber-400" />
                      <span className="font-bold text-amber-400">Nivel Máximo Alcanzado</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Disfruta del 6% de comisión y 2 semanas de uso propio por año
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-black/20 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Beneficios actualizados automáticamente</p>
                  <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400 bg-transparent">
                    Costo Gratis
                  </Badge>
                </div>
              </div>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                asChild
                size="lg"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-14 rounded-xl text-base"
              >
                <Link href="/dashboard/broker">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Acceder al Panel
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold h-14 rounded-xl bg-white text-base"
              >
                <Link href="/broker-programa">Conocer el Programa</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-xs bg-white">
                Sin cuotas de entrada
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                Pago inmediato
              </Badge>
              <Badge variant="outline" className="text-xs bg-white">
                100% Legal
              </Badge>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          * Datos mostrados son representativos con fines ilustrativos. Los resultados reales varían según el desempeño
          individual. Este programa NO constituye esquema de inversión ni multinivel.
        </p>
      </div>
    </section>
  )
}
