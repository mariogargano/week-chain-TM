import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import {
  DollarSign,
  Shield,
  Clock,
  Lock,
  Zap,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Percent,
  Wallet,
  FileCheck,
  BadgeCheck,
  Sparkles,
  Bell,
} from "lucide-react"
import Link from "next/link"

export default async function VAFIPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = [
    { label: "Tasa de Interés", value: "8.5%", suffix: "APR", icon: Percent },
    { label: "LTV Máximo", value: "50%", suffix: "", icon: Shield },
    { label: "Aprobación", value: "Instantánea", suffix: "", icon: Zap },
    { label: "Plazos", value: "3-12", suffix: "meses", icon: Clock },
  ]

  const howItWorks = [
    {
      step: "01",
      icon: FileCheck,
      title: "Selecciona tu Certificado",
      description:
        "Elige cuál de tus certificados digitales usar como garantía. Tu certificado permanece en custodia legal segura.",
    },
    {
      step: "02",
      icon: Wallet,
      title: "Recibe tu Préstamo",
      description:
        "Obtén hasta el 50% del valor de tu certificado de forma instantánea. Sin verificaciones de crédito.",
    },
    {
      step: "03",
      icon: BadgeCheck,
      title: "Repaga y Recupera",
      description: "Paga el préstamo más intereses cuando quieras y recupera tu certificado automáticamente.",
    },
  ]

  const benefits = [
    {
      icon: Lock,
      title: "Mantén tu Derecho de Uso",
      description: "No necesitas vender tu certificado. Obtén liquidez mientras conservas todos tus beneficios de uso.",
    },
    {
      icon: Zap,
      title: "Aprobación Instantánea",
      description:
        "Sin verificaciones de crédito ni procesos largos. Si tienes un certificado válido, accedes al préstamo en minutos.",
    },
    {
      icon: Shield,
      title: "100% Seguro y Legal",
      description:
        "Tu certificado estará protegido en custodia legal auditada. Recuperas tu certificado automáticamente al pagar.",
    },
    {
      icon: DollarSign,
      title: "Tasas Competitivas",
      description: "8.5% APR, mucho más bajo que tarjetas de crédito o préstamos personales tradicionales.",
    },
    {
      icon: Clock,
      title: "Plazos Flexibles",
      description: "Elige entre 3, 6 o 12 meses de duración. Pago anticipado sin penalización.",
    },
    {
      icon: CheckCircle2,
      title: "Sin Sorpresas",
      description: "Términos claros y transparentes. Sabrás exactamente cuánto pagarás desde el inicio.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="relative flex-1">
        <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-sm flex items-start justify-center pt-32">
          <div className="max-w-2xl mx-auto text-center px-6">
            <div className="mb-8">
              <Sparkles className="w-16 h-16 text-[#FF6B6B] mx-auto mb-6 animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Algo grande está{" "}
              <span className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] bg-clip-text text-transparent">
                por llegar
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
              Estamos convencidos de poder revolucionar el mundo vacacional
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/properties">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#FF5A5A] hover:to-[#3DBDB5] text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                >
                  Explorar Propiedades
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="mt-10 text-sm text-slate-400">VA-FI™ estará disponible próximamente</p>
          </div>
        </div>
        {/* Fin del overlay */}

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden px-4 sm:px-6 py-20 sm:py-28 bg-gradient-to-br from-white via-[#B5EAD7]/10 to-[#E2F0CB]/10">
            <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#B5EAD7]/20 blur-3xl" />
            <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-[#E2F0CB]/20 blur-3xl" />

            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#B5EAD7]/30 text-emerald-700 border-[#B5EAD7]">
                      <Wallet className="h-4 w-4 mr-2" />
                      Próximamente
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                      <Clock className="h-3 w-3 mr-1" />
                      Lista de Espera
                    </Badge>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Liquidez
                    <br />
                    <span className="text-brand-gradient">Instantánea</span>
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                    VA-FI™ te permite obtener préstamos usando tus certificados digitales de uso como garantía. Sin
                    vender tu semana, sin verificación de crédito, con aprobación instantánea.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link href="/auth">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-[#B5EAD7] to-[#E2F0CB] hover:from-[#A5DAC7] hover:to-[#D2E0BB] text-slate-800 shadow-lg"
                      >
                        Unirse a Lista de Espera
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                      >
                        Más Información
                      </Button>
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4">
                    {["Sin verificación crediticia", "Aprobación instantánea", "Términos flexibles"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-5 w-5 text-[#B5EAD7]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loan Preview Card - Dark accent */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#B5EAD7] to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#E2F0CB] to-transparent rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-slate-400 text-sm">Condiciones del Préstamo</p>
                          <h3 className="text-xl font-bold text-white">VA-FI™ Lending</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B5EAD7] to-[#E2F0CB] flex items-center justify-center">
                          <Wallet className="h-6 w-6 text-slate-800" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {stats.map((stat, i) => (
                          <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <stat.icon className="h-4 w-4 text-[#B5EAD7]" />
                              <span className="text-xs text-slate-400">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                              {stat.value}
                              {stat.suffix && <span className="text-[#B5EAD7] text-sm ml-1">{stat.suffix}</span>}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Example calculation */}
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-3">Ejemplo de Préstamo</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Valor del certificado digital</span>
                            <span className="text-white">$5,000 USD</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Préstamo disponible (50%)</span>
                            <span className="text-[#B5EAD7] font-semibold">$2,500 USD</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Interés a 6 meses</span>
                            <span className="text-white">$106 USD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B5EAD7] via-[#E2F0CB] to-[#FFDAC1]" />
                  </div>

                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Próximamente
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-[#E2F0CB]/30 text-lime-700 border-[#E2F0CB]">Proceso Simple</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Cómo Funciona VA-FI™?</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Obtén liquidez en 3 simples pasos, sin complicaciones.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {howItWorks.map((step, i) => (
                  <div key={i} className="relative text-center">
                    {i < howItWorks.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#B5EAD7]/50 to-transparent -translate-x-1/2" />
                    )}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B5EAD7] to-[#E2F0CB] flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <step.icon className="h-10 w-10 text-slate-800" />
                    </div>
                    <div className="text-sm font-semibold text-[#B5EAD7] mb-2">Paso {step.step}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-[#B5EAD7]/10 via-white to-[#E2F0CB]/10">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-[#B5EAD7]/30 text-emerald-700 border-[#B5EAD7]">Beneficios</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Por Qué Elegir VA-FI™?</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-[#B5EAD7]/50 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B5EAD7]/20 to-[#E2F0CB]/20 flex items-center justify-center mb-4 group-hover:from-[#B5EAD7]/30 group-hover:to-[#E2F0CB]/30 transition-all">
                      <benefit.icon className="h-6 w-6 text-[#B5EAD7]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Compliance Notice */}
          <section className="px-4 sm:px-6 py-12 bg-amber-50 border-y border-amber-200">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Aviso Regulatorio</h3>
                  <p className="text-sm text-amber-700">
                    VA-FI™ opera bajo las regulaciones aplicables en México. Los préstamos están sujetos a términos y
                    condiciones específicas. El incumplimiento en el pago puede resultar en la pérdida del derecho de
                    uso utilizado como garantía. Consulta los términos completos antes de solicitar un préstamo. Este
                    servicio estará disponible próximamente pendiente aprobación regulatoria.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-r from-[#B5EAD7] via-[#E2F0CB] to-[#FFDAC1]">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">Sé de los Primeros en Acceder</h2>
              <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
                Únete a la lista de espera y recibe acceso prioritario cuando VA-FI™ esté disponible.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg px-8">
                    Unirse a Lista de Espera
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-800 text-slate-800 hover:bg-slate-800/10 bg-transparent"
                  >
                    Más Información
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B6B]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4ECDC4]/5 rounded-full blur-3xl" />
          </div>

          {/* Main content */}
          <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <Badge className="mb-6 bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20 px-4 py-2 text-sm font-medium">
                <Clock className="w-4 h-4 mr-2" />
                Próximamente
              </Badge>

              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 text-balance leading-tight">
                Algo grande está{" "}
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] bg-clip-text text-transparent">
                  por llegar
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
                Estamos convencidos de poder revolucionar el mundo vacacional con una solución de préstamos única.
              </p>

              {/* Description */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-slate-200/50 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-[#FF6B6B]" />
                  <h2 className="text-xl font-semibold text-slate-800">VA-FI™ - Vacational Finance</h2>
                  <Sparkles className="w-6 h-6 text-[#4ECDC4]" />
                </div>
                <p className="text-slate-600 leading-relaxed max-w-xl mx-auto">
                  Un sistema innovador que te permitirá obtener liquidez usando tus certificados digitales de uso como
                  garantía. Sin vender tus derechos, sin trámites complicados, sin largas esperas.
                </p>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <p className="text-2xl font-bold text-[#FF6B6B]">50%</p>
                  <p className="text-sm text-slate-600">LTV máximo</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <p className="text-2xl font-bold text-[#4ECDC4]">Instantánea</p>
                  <p className="text-sm text-slate-600">Aprobación</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <p className="text-2xl font-bold text-slate-800">100%</p>
                  <p className="text-sm text-slate-600">Seguro y legal</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#FF5A5A] hover:to-[#FF7D7D] text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Recibir Notificación
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg rounded-xl border-slate-300 hover:bg-slate-50 bg-transparent"
                  >
                    Explorar Propiedades
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Footer note */}
              <p className="mt-10 text-sm text-slate-500">
                VA-FI™ operará bajo las regulaciones aplicables en México.
                <br />
                Estamos trabajando para ofrecerte la mejor experiencia posible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
