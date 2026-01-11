import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import Image from "next/image"
import {
  Award,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  Home,
  Percent,
  Network,
  DollarSign,
  Briefcase,
} from "lucide-react"

export default function BrokerElitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFB7B2]/30 via-[#FFDAC1]/30 to-[#E2F0CB]/30">
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C7CEEA] text-slate-800 text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            Primera Plataforma con Plan de Retiro para Brokers
          </div>
          <h1 className="text-6xl font-bold text-slate-900">
            Conviértete en{" "}
            <span className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] bg-clip-text text-transparent">
              Broker Elite
            </span>
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Crea tu red, vende más de 24 certificados y accede a beneficios exclusivos del programa Elite
          </p>
        </div>

        {/* Main Benefits Grid - Updated with Retirement concept */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-[#FFB7B2] bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-4">
                <Percent className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Comisiones hasta 6%</CardTitle>
              <CardDescription className="text-slate-600 text-base">
                6% directo, 4%+2% si tu referido vende, 3%+2%+1% en red de 3 niveles
                <span className="block text-[#B5EAD7] text-xs mt-1 font-medium">(IVA incluido)</span>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-[#B5EAD7] bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#E2F0CB] to-[#B5EAD7] flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-slate-700" />
              </div>
              <CardTitle className="text-2xl text-slate-900">2 Semanas Elite</CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Al vender 24+ semanas, recibe 2 semanas de baja temporada como beneficio exclusivo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-[#C7CEEA] bg-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              NUEVO
            </div>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Bonos por Volumen</CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Bonos especiales al alcanzar metas de volumen de certificados vendidos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Dashboard Showcase Section */}
        <div className="mb-16">
          <ContainerScroll
            titleComponent={
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/50 border border-[#FF9AA2]/30 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm mb-4">
                  <Users className="h-4 w-4 text-[#FF9AA2]" />
                  Dashboard Profesional para Brokers
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Controla tu Imperio
                  <br />
                  <span className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] bg-clip-text text-transparent">
                    desde un Solo Panel
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Dashboard completo diseñado para brokers profesionales. Monitorea ventas en tiempo real, gestiona tu
                  red de referidos y visualiza tu progreso hacia el Broker Retirement Bonus.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
                  <div className="bg-white/80 rounded-xl p-4 border border-[#FF9AA2]/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#FF9AA2]/10">
                        <TrendingUp className="h-5 w-5 text-[#FF9AA2]" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Ventas en Tiempo Real</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Visualiza todas tus ventas, leads y conversiones actualizadas al instante
                    </p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 border border-[#C7CEEA]/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#C7CEEA]/10">
                        <DollarSign className="h-5 w-5 text-[#C7CEEA]" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Hasta el 6% en Comisión</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Rastrea tus comisiones directas, de red y bonos especiales automáticamente
                    </p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Briefcase className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Retirement Tracker</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Visualiza tu progreso hacia el Broker Retirement Bonus en cada propiedad
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            {/* Beautiful Dashboard Mockup */}
            <div className="mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 h-full">
              <Image
                src="/images/design-mode/ChatGPT%20Image%2010%20nov%202025%2C%2010_23_35%20a.m..png"
                alt="Dashboard WEEK-CHAIN para Brokers - Monitorea ventas, comisiones y tu Retirement Bonus"
                width={1200}
                height={800}
                className="w-full h-full object-cover object-top rounded-2xl"
                priority
              />
            </div>
          </ContainerScroll>
        </div>

        {/* Multinivel Commission System */}
        <Card className="mb-16 border-slate-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-900 flex items-center gap-3">
              <Network className="h-8 w-8 text-purple-600" />
              Sistema de Comisiones (6% Total)
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              La comisión total siempre es 6%, distribuida según quién realiza la venta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-blue-50 border-2 border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">6%</div>
                <h4 className="font-semibold text-lg text-slate-900 mb-2">Venta Directa</h4>
                <p className="text-sm text-slate-600">
                  Cuando tú vendes directamente, recibes el 6% completo de la venta
                </p>
              </div>

              <div className="p-6 rounded-lg bg-purple-50 border-2 border-purple-200">
                <div className="text-4xl font-bold text-purple-600 mb-2">4% + 2%</div>
                <h4 className="font-semibold text-lg text-slate-900 mb-2">Tu Referido Vende</h4>
                <p className="text-sm text-slate-600">Tú recibes 4%, tu referido que vendió recibe 2% (total 6%)</p>
              </div>

              <div className="p-6 rounded-lg bg-indigo-50 border-2 border-indigo-200">
                <div className="text-4xl font-bold text-indigo-600 mb-2">3%+2%+1%</div>
                <h4 className="font-semibold text-lg text-slate-900 mb-2">Red Nivel 3 Vende</h4>
                <p className="text-sm text-slate-600">Tú 3%, nivel 2 recibe 2%, vendedor 1% (total 6%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elite Weeks Benefit */}
        <Card className="mb-16 border-slate-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-900 flex items-center gap-3">
              <Home className="h-8 w-8 text-green-600" />
              Beneficio Elite: 2 Semanas de Baja Temporada
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Al vender 24 semanas o más, recibes 2 semanas de baja temporada como beneficio exclusivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-xl text-slate-900">¿Qué incluye?</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>2 semanas completas</strong> de baja temporada en propiedades WEEK-CHAIN
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Uso personal</strong> - Disfruta tus semanas o réntalas
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Requisito</strong> - Vender 24+ semanas te convierte en Broker Elite
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
                <h4 className="font-semibold text-xl text-slate-900 mb-4">Valor del Beneficio</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Valor de mercado (2 semanas)</p>
                    <p className="text-3xl font-bold text-slate-900">$3,000 - $6,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Tu costo como Broker Elite</p>
                    <p className="text-3xl font-bold text-green-600">$0</p>
                    <p className="text-xs text-slate-500 mt-1">Incluido al alcanzar 24 semanas vendidas</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements - Updated */}
        <Card className="border-slate-200 bg-white shadow-lg max-w-3xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-900">¿Cómo convertirte en Broker Elite?</CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Requisitos simples para acceder a todos los beneficios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-lg text-slate-900">Crea tu Red</p>
                <p className="text-slate-600">Refiere a otros brokers y construye tu equipo de ventas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-lg text-slate-900">Vende 24+ Semanas</p>
                <p className="text-slate-600">Al alcanzar 24 semanas vendidas, te conviertes en Broker Elite</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <Briefcase className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-lg text-slate-900">Bonos por Desempeño</p>
                <p className="text-slate-600">Recibe bonos adicionales por alcanzar metas de ventas</p>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6"
            >
              <Link href="/broker/apply">
                <Star className="mr-2 h-6 w-6" />
                Aplicar Ahora como Broker
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center py-12 px-6 rounded-2xl bg-gradient-to-r from-[#FF9AA2] via-[#C7CEEA] to-[#B5EAD7] text-slate-900 shadow-xl">
          <h2 className="text-4xl font-bold mb-4">Primera plataforma con Plan de Retiro para Brokers</h2>
          <p className="text-xl mb-8 text-slate-800 max-w-2xl mx-auto">
            Construye tu red, vende semanas y asegura tu futuro con el Broker Retirement Bonus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/broker/apply">
                <Star className="mr-2 h-5 w-5" />
                Comenzar Ahora
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white bg-transparent"
            >
              <Link href="/contact">Contactar Equipo</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
