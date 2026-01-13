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
  ArrowRight,
  Sparkles,
} from "lucide-react"

// Sample data that rotates
const brokerProfiles = [
  {
    name: "María González",
    country: "🇲🇽",
    location: "Ciudad de México",
    avatar: "/professional-latina-woman-headshot.jpg",
    totalSales: 127500,
    thisMonth: 18500,
    clients: 23,
    deals: 17,
    conversionRate: 68,
    referrals: 32,
  },
  {
    name: "James Wilson",
    country: "🇺🇸",
    location: "Miami, FL",
    avatar: "/professional-american-man-headshot.jpg",
    totalSales: 285000,
    thisMonth: 42000,
    clients: 45,
    deals: 38,
    conversionRate: 74,
    referrals: 56,
  },
  {
    name: "Sophie Müller",
    country: "🇩🇪",
    location: "Berlin",
    avatar: "/professional-german-woman-headshot.jpg",
    totalSales: 68500,
    thisMonth: 12000,
    clients: 12,
    deals: 9,
    conversionRate: 58,
    referrals: 12,
  },
  {
    name: "Carlos Mendoza",
    country: "🇪🇸",
    location: "Madrid",
    avatar: "/professional-spanish-man-headshot.jpg",
    totalSales: 156000,
    thisMonth: 28000,
    clients: 31,
    deals: 24,
    conversionRate: 71,
    referrals: 38,
  },
  {
    name: "Yuki Tanaka",
    country: "🇯🇵",
    location: "Tokyo",
    avatar: "/professional-japanese-woman-headshot.jpg",
    totalSales: 312000,
    thisMonth: 55000,
    clients: 52,
    deals: 44,
    conversionRate: 79,
    referrals: 72,
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

  const COMMISSION_RATE = 4 // Flat 4% for all brokers

  return (
    <section className="px-4 py-16 md:py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 text-sm font-semibold px-4 py-2">
            <Award className="h-4 w-4 mr-2" />
            Programa de Intermediarios
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Obtén el 4% en Honorarios
            <span className="block text-2xl md:text-3xl mt-2 text-slate-300">
              por cada Referido Directo <span className="text-emerald-400 text-lg">(IVA incluido)</span>
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Únete a nuestra red de intermediarios profesionales y genera ingresos recurrentes por cada certificado de
            uso vacacional que tus referidos adquieran.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <div
              className={`relative w-full transition-all duration-300 ${
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl">
                <div className="relative p-6 pb-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />

                  <div className="relative flex items-start justify-between">
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
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0 text-xs">
                            Intermediario
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{profile.location}</p>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="text-white font-bold text-lg tracking-tight">
                        WEEK-CHAIN<span className="text-blue-400 text-xs align-super">™</span>
                      </div>
                      <p className="text-slate-500 text-xs">Panel de Intermediario</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400 flex items-center">
                          <ArrowUpRight className="h-3 w-3" />
                          +12%
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">${(profile.totalSales * 0.04).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">
                        Honorarios Totales <span className="text-emerald-400">(IVA inc.)</span>
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-blue-400 flex items-center">
                          <ArrowUpRight className="h-3 w-3" />
                          +8%
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">${(profile.thisMonth * 0.04).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">
                        Este Mes <span className="text-emerald-400">(IVA inc.)</span>
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <Users className="h-4 w-4 text-purple-400" />
                      </div>
                      <p className="text-xl font-bold text-white">{profile.clients}</p>
                      <p className="text-xs text-slate-400">Clientes Activos</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-xl font-bold text-white">{profile.conversionRate}%</p>
                      <p className="text-xs text-slate-400">Tasa de Cierre</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold text-sm">Actividad Mensual</h4>
                        <p className="text-slate-400 text-xs">Últimos 6 meses</p>
                      </div>
                      <BarChart3 className="h-4 w-4 text-slate-400" />
                    </div>

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

              <div className="flex justify-center gap-2 mt-4">
                {brokerProfiles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "w-8 bg-blue-500" : "w-2 bg-slate-600 hover:bg-slate-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-2xl" />

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Comisión Flat</h3>
                      <p className="text-sm text-slate-400">Sistema simple y transparente</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 mb-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-400 mb-2">4%</div>
                    <p className="text-emerald-400 text-sm mb-1">(IVA incluido)</p>
                    <p className="text-slate-400 text-sm">Por cada referido directo</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-white font-bold text-xl">{profile.referrals}</p>
                    <p className="text-slate-500 text-xs">Referidos</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-emerald-400 font-bold text-xl">
                      ${(profile.totalSales * 0.04).toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">Ganado</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    <span className="font-bold text-blue-400">Sistema Transparente</span>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• Sin niveles ni requisitos complejos</li>
                    <li>• 4% sobre cada venta de tus referidos</li>
                    <li>• Pagos mensuales automáticos</li>
                    <li>• Dashboard en tiempo real</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
            >
              <Link href="/broker-programa">
                Unirse al Programa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
