import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import {
  MapPin,
  Building2,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Info,
  FileText,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "WEEK-BOOKING | Sistema de Solicitud de Uso Vacacional",
  description:
    "Sistema de solicitudes para ejecutar derechos de uso temporal de Smart Vacational Certificates. Sujeto a disponibilidad del sistema WEEK-CHAIN.",
  openGraph: {
    title: "WEEK-BOOKING | Solicitud de Uso Vacacional",
    description:
      "Plataforma para solicitar uso vacacional. No es un sistema de reservas garantizadas. Sujeto a disponibilidad.",
  },
}

export default function WeekBookingPage() {
  const availableRequests = [
    {
      id: 1,
      certificateHolder: "Titular Anónimo",
      destination: "Ejemplo: Cancún, Quintana Roo",
      location: "Zona Hotelera",
      image: "/luxury-beach-villa-cancun.jpg",
      requestableWeeks: 8,
      type: "Solicitud Temporal",
      verified: true,
    },
    {
      id: 2,
      certificateHolder: "Titular Anónimo",
      destination: "Ejemplo: Guanajuato, Gto",
      location: "Centro Histórico",
      image: "/colonial-house-guanajuato.jpg",
      requestableWeeks: 12,
      type: "Solicitud Temporal",
      verified: true,
    },
  ]

  const systemBenefits = [
    {
      icon: FileText,
      title: "Sistema de Solicitudes",
      description: "Solicita uso según disponibilidad. No garantiza fechas ni destinos específicos.",
    },
    {
      icon: Shield,
      title: "Destinos Verificados",
      description: "Alojamientos participantes inspeccionados conforme a sistema WEEK-CHAIN.",
    },
    {
      icon: Clock,
      title: "Disponibilidad Variable",
      description: "Sistema actualizado según disponibilidad real. No garantiza acceso inmediato.",
    },
    {
      icon: BarChart3,
      title: "Dashboard de Solicitudes",
      description: "Panel para rastrear estado de tus solicitudes de uso temporal.",
    },
  ]

  const stats = [
    { value: "450+", label: "Solicitudes Procesadas", sublabel: "En el sistema" },
    { value: "120+", label: "Certificados Activos", sublabel: "En WEEK-CHAIN" },
    { value: "N/A", label: "Disponibilidad", sublabel: "Sujeta a sistema" },
    { value: "85%", label: "Tasa Aprobación", sublabel: "Promedio histórico" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="relative flex-1">
        <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-sm flex items-start justify-center pt-32">
          <div className="max-w-2xl mx-auto text-center px-6">
            <div className="mb-8">
              <Sparkles className="w-16 h-16 text-[#FF9AA2] mx-auto mb-6 animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Sistema de solicitudes{" "}
              <span className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] bg-clip-text text-transparent">
                próximamente
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
              WEEK-Booking estará disponible para ejecutar tus derechos de uso vacacional
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/properties">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                >
                  Explorar Propiedades
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="mt-10 text-sm text-slate-400">WEEK-Booking™ estará disponible próximamente</p>
          </div>
        </div>

        <main className="flex-1">
          {/* Hero Section - Request-Based System */}
          <section className="relative overflow-hidden px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#FF9AA2]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#FFB7B2]/10 blur-3xl" />

            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20">
                  <Info className="h-4 w-4 mr-2" />
                  Sistema de Solicitud de Uso - NO es Motor de Reservas
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Solicita Uso Vacacional
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2]">
                    Según Disponibilidad
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                  WEEK-BOOKING es un sistema para ejecutar tu derecho de solicitud de uso vacacional temporal. Sujeto a
                  disponibilidad del sistema WEEK-CHAIN. NO constituye reserva garantizada ni asignación de fechas o
                  destinos específicos.
                </p>

                <div className="max-w-3xl mx-auto mt-6 p-4 bg-amber-900/20 rounded-xl border-2 border-amber-500/30 backdrop-blur">
                  <p className="text-sm text-amber-200 leading-relaxed">
                    <span className="font-bold">Importante:</span> Este NO es un motor de reservas tradicional. Es una
                    capa de ejecución para solicitar uso temporal de tu Smart Vacational Certificate. La aprobación,
                    fechas y destinos están sujetos a disponibilidad real del sistema y NO están garantizados.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <Link href="/auth">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white shadow-xl shadow-[#FF9AA2]/30"
                    >
                      Acceder a Sistema de Solicitudes
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/properties">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur"
                    >
                      Ver Destinos de Referencia
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-6 bg-white/5 backdrop-blur border-white/10">
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-300">{stat.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{stat.sublabel}</div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* System Benefits - Not Purchase Benefits */}
          <section className="px-4 sm:px-6 py-12 bg-white border-y border-slate-100">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Características del Sistema de Solicitudes
                </h2>
                <p className="text-slate-600">Plataforma para ejecutar tu derecho de solicitud temporal</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemBenefits.map((benefit, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center flex-shrink-0 mb-4 shadow-lg shadow-[#FF9AA2]/20">
                      <benefit.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Available Request Options - NOT Inventory for Purchase */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-slate-50 to-white">
            <div className="container mx-auto max-w-6xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                    Ejemplos de Solicitudes Posibles
                  </h2>
                  <p className="text-slate-600">Opciones de referencia para solicitar uso temporal</p>
                </div>
              </div>

              {/* Search/Filter - Request Parameters */}
              <Card className="p-6 mb-8 shadow-lg border-slate-200 bg-white">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="col-span-full">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <Info className="h-3 w-3 mr-1" />
                      Parámetros de búsqueda no garantizan disponibilidad
                    </Badge>
                  </div>
                  {/* Search fields removed - This is for reference only */}
                </div>
              </Card>

              {/* Request Options Grid - NOT Property Cards for Purchase */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {availableRequests.map((request) => (
                  <Card key={request.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative">
                      <img
                        src={request.image || "/placeholder.svg"}
                        alt={request.destination}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {request.verified && (
                        <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-none shadow-lg">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Destino Verificado
                        </Badge>
                      )}
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-white border-none shadow-lg">
                        <Info className="h-3 w-3 mr-1" />
                        Referencia
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base mb-1">{request.destination}</h3>
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {request.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 pb-3 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>Tipo: {request.type}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-bold">Solicitud Temporal:</span> Este es un ejemplo de destino
                            participante. El acceso está sujeto a disponibilidad del sistema y NO garantiza fechas ni
                            asignación de este alojamiento específico.
                          </p>
                        </div>
                      </div>

                      <Link href="/auth">
                        <Button className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white">
                          Acceder a Sistema de Solicitudes
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-slate-600 mb-4">
                  Estos son ejemplos de referencia. Las solicitudes reales están sujetas a disponibilidad del sistema.
                </p>
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white shadow-xl"
                  >
                    Iniciar Sesión - Acceder a Solicitudes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* How it Works - Request-Based System */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Cómo Funciona el Sistema?</h2>
                <p className="text-lg text-slate-600">
                  Proceso de solicitud de uso temporal - NO es reserva garantizada
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Adquiere Smart Vacational Certificate",
                      desc: "Obtén tu certificado que otorga derecho de solicitud de uso temporal por 15 años.",
                    },
                    {
                      step: "2",
                      title: "Accede al Sistema de Solicitudes",
                      desc: "Ingresa a WEEK-BOOKING para ver ejemplos de opciones disponibles según el sistema.",
                    },
                    {
                      step: "3",
                      title: "Envía Solicitud de Uso",
                      desc: "Solicita uso temporal. La aprobación está sujeta a disponibilidad real del sistema.",
                    },
                    {
                      step: "4",
                      title: "Espera Confirmación",
                      desc: "El sistema evalúa tu solicitud. NO garantiza fechas, destinos ni aprobación inmediata.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center flex-shrink-0 font-bold text-white">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">¿Listo para Solicitar Uso?</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Accede al sistema de solicitudes de WEEK-CHAIN y ejecuta tu derecho de uso temporal
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white shadow-xl shadow-[#FF9AA2]/30 px-8"
                  >
                    Acceder a Sistema de Solicitudes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur px-8"
                  >
                    Ver Destinos de Referencia
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
