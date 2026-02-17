import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Home,
  Globe,
  Clock,
  DollarSign,
  Star,
  Zap,
  Sparkle,
  Building2,
} from "lucide-react"

export default function WeekManagementInfoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#FFDAC1]/20 via-white to-[#B5EAD7]/20">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-32">
        {/* Elementos flotantes decorativos */}
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#FF9AA2]/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#C7CEEA]/20 blur-3xl animate-float-delayed" />

        <div className="container relative z-10 mx-auto max-w-7xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
            <Building2 className="h-4 w-4 text-[#FF9AA2]" />
            Empresa Asociada de WEEK-CHAIN
          </div>

          <h1 className="mb-8 text-balance text-6xl font-bold tracking-tight text-slate-900 md:text-7xl lg:text-8xl leading-[1.1]">
            WEEK Management
            <br />
            <span className="text-brand-gradient">Gestión Profesional de Propiedades</span>
          </h1>

          <p className="mx-auto mb-4 max-w-3xl text-pretty text-xl text-slate-600 md:text-2xl leading-relaxed font-medium">
            Servicio profesional de gestión de propiedades vacacionales manejado por Simonetta Brun. Activa la gestión
            completa de tu propiedad con un solo clic.
          </p>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-500 leading-relaxed">
            Limpieza, mantenimiento, rentas, atención a huéspedes y más. Todo incluido en un servicio integral.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-w-[240px] bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:from-[#ff8a92] hover:via-[#ffa7a2] hover:to-[#b7beda] text-white text-base font-semibold h-14 rounded-xl shadow-lg shadow-[#FF9AA2]/25 hover:shadow-xl hover:shadow-[#FF9AA2]/30 transition-all duration-300 hover:scale-105"
            >
              <Link href="/dashboard/management">
                Acceder al Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[240px] border-2 border-[#C7CEEA] text-slate-700 hover:bg-[#C7CEEA]/10 hover:border-[#b7beda] text-base font-semibold h-14 rounded-xl shadow-sm transition-all duration-300 glass bg-transparent"
            >
              <Link href="/properties">
                <Globe className="mr-2 h-5 w-5" />
                Ver Propiedades
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ¿Qué es WEEK Management? */}
      <section className="relative bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Building2 className="h-4 w-4 text-[#FF9AA2]" />
              Servicio Profesional
            </div>
            <h2 className="mb-6 text-5xl md:text-6xl font-bold text-slate-900 tracking-tight text-balance">
              ¿Qué es WEEK Management?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed text-pretty">
              Es una empresa asociada de WEEK-CHAIN, manejada por Simonetta Brun, que ofrece servicios profesionales de
              gestión integral para propiedades vacacionales con certificados digitales NOM-151.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Home,
                title: "Gestión Completa",
                description:
                  "Activación con un clic desde WEEK-CHAIN. Nos encargamos de todo: limpieza, mantenimiento, reparaciones y más.",
                color: "#FF9AA2",
                bgGradient: "from-[#FF9AA2]/20 to-[#FFB7B2]/10",
              },
              {
                icon: Users,
                title: "Atención a Huéspedes",
                description:
                  "Check-in/check-out profesional, atención 24/7, resolución de problemas y experiencia premium para tus invitados.",
                color: "#FFB7B2",
                bgGradient: "from-[#FFB7B2]/20 to-[#FFDAC1]/10",
              },
              {
                icon: DollarSign,
                title: "Maximización de Rentas",
                description:
                  "Listado en Airbnb, Booking.com y plataformas premium. Pricing dinámico y gestión de reservas optimizada.",
                color: "#FFDAC1",
                bgGradient: "from-[#FFDAC1]/20 to-[#E2F0CB]/10",
              },
              {
                icon: Sparkle,
                title: "Limpieza Profesional",
                description:
                  "Equipo de limpieza certificado después de cada huésped. Estándares de hotel 5 estrellas garantizados.",
                color: "#E2F0CB",
                bgGradient: "from-[#E2F0CB]/20 to-[#B5EAD7]/10",
              },
              {
                icon: Shield,
                title: "Mantenimiento Preventivo",
                description:
                  "Inspecciones regulares, reparaciones proactivas y mantenimiento de jardines, piscinas y amenidades.",
                color: "#B5EAD7",
                bgGradient: "from-[#B5EAD7]/20 to-[#C7CEEA]/10",
              },
              {
                icon: TrendingUp,
                title: "Reportes Detallados",
                description:
                  "Dashboard con métricas de ocupación, ingresos, gastos y estado de la propiedad en tiempo real.",
                color: "#C7CEEA",
                bgGradient: "from-[#C7CEEA]/20 to-[#FF9AA2]/10",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className={`border-2 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-105 group`}
                style={{ borderTopColor: feature.color, borderTopWidth: "3px" }}
              >
                <CardHeader>
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon className="h-8 w-8" style={{ color: feature.color }} />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="relative bg-gradient-to-br from-[#C7CEEA]/20 via-white to-[#B5EAD7]/20 px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Zap className="h-4 w-4 text-[#FF9AA2]" />
              Activación Simple
            </div>
            <h2 className="mb-6 text-5xl md:text-6xl font-bold text-slate-900 tracking-tight text-balance">
              ¿Cómo Activar el Servicio?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-pretty">
              Activa la gestión profesional de tu propiedad en 3 pasos simples
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Un Clic en WEEK-CHAIN",
                description:
                  "Desde tu dashboard de WEEK-CHAIN, activa el servicio de gestión con un solo clic. Proceso instantáneo.",
                icon: Zap,
                color: "#FF9AA2",
              },
              {
                step: "2",
                title: "Configuración Inicial",
                description:
                  "Nuestro equipo contacta contigo para configurar preferencias, accesos y detalles de la propiedad.",
                icon: Users,
                color: "#FFB7B2",
              },
              {
                step: "3",
                title: "Gestión Activa",
                description:
                  "Comenzamos la gestión completa. Tú recibes reportes y ganancias, nosotros nos encargamos de todo lo demás.",
                icon: CheckCircle2,
                color: "#B5EAD7",
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-6 -left-6 text-[120px] font-black text-slate-100 leading-none select-none transition-all duration-500 group-hover:text-slate-200 group-hover:scale-110">
                  {item.step}
                </div>

                <Card className="relative h-full border-2 bg-white hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <CardHeader>
                    <div
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon className="h-8 w-8" style={{ color: item.color }} />
                    </div>
                    <CardTitle className="text-xl text-slate-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">{item.description}</CardDescription>
                  </CardContent>
                </Card>

                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-20">
                    <ArrowRight className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sistema de Intercambio */}
      <section className="relative bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-4 py-2 text-sm font-semibold text-slate-700">
                <RefreshCw className="h-4 w-4 text-[#FF9AA2]" />
                Intercambio Inteligente
              </div>
              <h2 className="mb-6 text-5xl font-bold text-slate-900 tracking-tight">
                Sistema de Intercambio por Valor
              </h2>
              <p className="mb-8 text-xl text-slate-600 leading-relaxed">
                Intercambia semanas de forma justa según su valor de temporada. El sistema calcula automáticamente
                equivalencias.
              </p>

              <div className="space-y-4">
                {[
                  {
                    season: "Alta Temporada",
                    value: "100%",
                    desc: "Valor completo - Navidad, Año Nuevo, Semana Santa",
                    color: "#FF9AA2",
                  },
                  {
                    season: "Media Temporada",
                    value: "75%",
                    desc: "Valor medio - Verano, puentes largos",
                    color: "#FFB7B2",
                  },
                  {
                    season: "Baja Temporada",
                    value: "50%",
                    desc: "Valor reducido - Resto del año",
                    color: "#B5EAD7",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl glass border-2 p-4 hover:shadow-lg transition-all duration-300"
                    style={{ borderLeftColor: item.color, borderLeftWidth: "4px" }}
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.value}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.season}</h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-2 border-[#FF9AA2]/30 bg-gradient-to-br from-[#FF9AA2]/10 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <CheckCircle2 className="h-5 w-5 text-[#FF9AA2]" />
                    Ejemplo de Intercambio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-[#FF9AA2]/20">
                    <p className="text-sm text-slate-600 mb-1">Tienes:</p>
                    <p className="font-bold text-slate-900">1 Semana Alta Temporada (100%)</p>
                  </div>
                  <div className="flex justify-center">
                    <RefreshCw className="h-8 w-8 text-[#C7CEEA]" />
                  </div>
                  <div className="p-4 bg-white rounded-lg border-2 border-[#B5EAD7]/20">
                    <p className="text-sm text-slate-600 mb-1">Puedes intercambiar por:</p>
                    <p className="font-bold text-slate-900">2 Semanas Baja Temporada (50% c/u)</p>
                    <p className="text-sm text-slate-600 mt-1">o</p>
                    <p className="font-bold text-slate-900">1 Semana Media + Crédito 25%</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Clock, label: "Instantáneo", desc: "Matching automático" },
                  { icon: Shield, label: "Seguro", desc: "Verificado on-chain" },
                  { icon: Star, label: "Justo", desc: "Valores transparentes" },
                  { icon: Globe, label: "Global", desc: "Todas las propiedades" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-xl glass border border-slate-200">
                    <item.icon className="h-8 w-8 mx-auto mb-2 text-[#C7CEEA]" />
                    <p className="font-bold text-sm text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="relative bg-gradient-to-br from-[#FF9AA2]/20 via-[#FFB7B2]/10 to-[#FFDAC1]/20 px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Star className="h-4 w-4 text-[#FF9AA2]" />
              Beneficios
            </div>
            <h2 className="mb-6 text-5xl md:text-6xl font-bold text-slate-900 tracking-tight text-balance">
              ¿Por Qué Usar WEEK Management?
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Maximiza Ingresos",
                desc: "Renta automática cuando no uses tus semanas. Ingresos pasivos garantizados.",
                icon: DollarSign,
                color: "#FF9AA2",
              },
              {
                title: "Flexibilidad Total",
                desc: "Intercambia semanas según tus planes. Adapta tus vacaciones a tu vida.",
                icon: RefreshCw,
                color: "#FFB7B2",
              },
              {
                title: "Control Completo",
                desc: "Tú decides cuándo usar, rentar o intercambiar. Sin intermediarios.",
                icon: Shield,
                color: "#FFDAC1",
              },
              {
                title: "Transparencia",
                desc: "Todas las operaciones verificadas on-chain. Historial completo visible.",
                icon: CheckCircle2,
                color: "#E2F0CB",
              },
              {
                title: "Comunidad Global",
                desc: "Intercambia con holders de todo el mundo. Acceso a todas las propiedades.",
                icon: Globe,
                color: "#B5EAD7",
              },
              {
                title: "Valor Creciente",
                desc: "Tus NFTs pueden apreciarse con el tiempo. Adquisición + vacaciones.",
                icon: TrendingUp,
                color: "#C7CEEA",
              },
            ].map((benefit, i) => (
              <Card
                key={i}
                className="border-2 bg-white hover:shadow-xl transition-all duration-500 hover:scale-105"
                style={{ borderTopColor: benefit.color, borderTopWidth: "3px" }}
              >
                <CardHeader>
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${benefit.color}20` }}
                  >
                    <benefit.icon className="h-7 w-7" style={{ color: benefit.color }} />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 leading-relaxed">{benefit.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
            Activa la Gestión Profesional
          </h2>
          <p className="mb-12 text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Deja que Simonetta Brun y su equipo se encarguen de todo. Tú solo disfrutas de tus vacaciones y recibe tus
            ganancias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="min-w-[240px] bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:from-[#ff8a92] hover:via-[#ffa7a2] hover:to-[#b7beda] text-white text-base font-semibold h-14 rounded-xl shadow-lg shadow-[#FF9AA2]/25 hover:shadow-xl hover:shadow-[#FF9AA2]/30 transition-all duration-300 hover:scale-105"
            >
              <Link href="/dashboard/management">
                Activar Servicio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[240px] border-2 border-[#C7CEEA] text-slate-700 hover:bg-[#C7CEEA]/10 hover:border-[#b7beda] text-base font-semibold h-14 rounded-xl transition-all duration-300 glass bg-transparent"
            >
              <Link href="/properties">Ver Propiedades</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
