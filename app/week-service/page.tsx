import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Star,
  Phone,
  Zap,
  Sparkles,
  UtensilsCrossed,
  Car,
  Waves,
  HeartPulse,
  Plane,
  CheckCircle2,
  Globe,
} from "lucide-react"

export const metadata: Metadata = {
  title: "WEEK-Service™ | Servicios Premium para tu Estancia Vacacional",
  description:
    "Servicios exclusivos para titulares de semanas WEEK-CHAIN™. Concierge 24/7, traslados, chef privado, spa, y más. Vive la experiencia vacacional de lujo que mereces.",
  openGraph: {
    title: "WEEK-Service™ | Servicios Premium de Concierge",
    description:
      "Experiencias exclusivas y servicios de lujo para tu semana vacacional. Concierge 24/7, traslados VIP, chef privado y más.",
  },
}

export default function WeekServicePage() {
  const premiumServices = [
    {
      icon: Plane,
      title: "Traslados VIP",
      description: "Servicio de transporte privado aeropuerto-propiedad. Vehículos de lujo con chofer profesional.",
      price: "Desde $89 USD",
    },
    {
      icon: UtensilsCrossed,
      title: "Chef Privado",
      description: "Experiencias gastronómicas en tu propiedad. Menús personalizados con ingredientes premium locales.",
      price: "Desde $150 USD",
    },
    {
      icon: Waves,
      title: "Spa & Wellness",
      description: "Masajes, tratamientos faciales y sesiones de yoga en la comodidad de tu propiedad vacacional.",
      price: "Desde $99 USD",
    },
    {
      icon: Car,
      title: "Renta de Autos",
      description: "Vehículos de todas las categorías con entrega en tu propiedad. Seguros incluidos.",
      price: "Desde $45 USD/día",
    },
    {
      icon: Sparkles,
      title: "Decoración Especial",
      description: "Celebra cumpleaños, aniversarios o llegadas con decoración temática y sorpresas personalizadas.",
      price: "Desde $75 USD",
    },
    {
      icon: HeartPulse,
      title: "Asistencia Médica",
      description: "Acceso a red de médicos y hospitales premium. Consultas a domicilio disponibles 24/7.",
      price: "Incluido",
    },
  ]

  const conciergeFeatures = [
    { icon: Phone, title: "24/7 Disponible", description: "Atención inmediata cualquier día y hora" },
    { icon: Star, title: "Reservaciones VIP", description: "Acceso a restaurantes y experiencias exclusivas" },
    { icon: Zap, title: "Respuesta Rápida", description: "Resolución en menos de 15 minutos" },
    { icon: Globe, title: "Soporte Multilingüe", description: "Español, inglés, portugués y más" },
  ]

  const experiences = [
    {
      title: "Tour Gastronómico",
      description: "Recorrido por los mejores restaurantes locales con sommelier incluido",
      image: "/gourmet-food-tour-mexico.jpg",
    },
    {
      title: "Aventura Acuática",
      description: "Snorkel, buceo, pesca deportiva o paseo en yate privado",
      image: "/water-sports-yacht-caribbean.jpg",
    },
    {
      title: "Cultura Local",
      description: "Tours a zonas arqueológicas, pueblos mágicos y talleres artesanales",
      image: "/mayan-ruins-tour-mexico.jpg",
    },
    {
      title: "Golf Premium",
      description: "Acceso preferencial a los mejores campos de golf del destino",
      image: "/luxury-golf-course-ocean-view.jpg",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 py-20 sm:py-28 bg-gradient-to-br from-white via-[#C7CEEA]/10 to-[#B5EAD7]/10">
          <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-[#C7CEEA]/20 blur-3xl" />
          <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-[#B5EAD7]/20 blur-3xl" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge className="bg-[#C7CEEA]/30 text-indigo-700 border-[#C7CEEA]">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Servicios Premium Exclusivos
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Experiencias
                  <br />
                  <span className="text-brand-gradient">Sin Límites</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                  WEEK-Service™ es tu concierge personal disponible 24/7. Traslados, chef privado, spa, tours y todo lo
                  que necesites para una estancia perfecta.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#C7CEEA] to-[#B5EAD7] hover:from-[#B7BED0] hover:to-[#A5DAC7] text-slate-800 shadow-lg"
                    >
                      Contactar Concierge
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                    >
                      Ver Todos los Servicios
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 pt-4">
                  {["Disponible 24/7", "Respuesta en 15 min", "Multilingüe"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-[#B5EAD7]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concierge Card - Dark accent */}
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C7CEEA] to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#B5EAD7] to-transparent rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C7CEEA] to-[#B5EAD7] flex items-center justify-center">
                        <Phone className="h-8 w-8 text-slate-800" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Concierge 24/7</h3>
                        <p className="text-slate-400">Tu asistente personal</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {conciergeFeatures.map((feature, i) => (
                        <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                          <feature.icon className="h-5 w-5 text-[#C7CEEA] mb-2" />
                          <h4 className="text-sm font-semibold text-white">{feature.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{feature.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <p className="text-sm font-semibold text-white">Disponible Ahora</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#B5EAD7] animate-pulse" />
                        <span className="text-sm text-[#B5EAD7]">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C7CEEA] via-[#B5EAD7] to-[#E2F0CB]" />
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Exclusivo Titulares
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#FFDAC1]/30 text-orange-700 border-[#FFDAC1]">Catálogo de Servicios</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Servicios Premium a tu Alcance</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Todo lo que necesitas para una estancia perfecta, a un mensaje de distancia.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumServices.map((service, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-[#C7CEEA]/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C7CEEA]/20 to-[#B5EAD7]/20 flex items-center justify-center mb-4 group-hover:from-[#C7CEEA]/30 group-hover:to-[#B5EAD7]/30 transition-all">
                    <service.icon className="h-6 w-6 text-[#C7CEEA]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  <p className="text-sm font-semibold text-[#C7CEEA]">{service.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experiences Gallery */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-[#E2F0CB]/10 via-white to-[#C7CEEA]/10">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#E2F0CB]/30 text-lime-700 border-[#E2F0CB]">Experiencias Únicas</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Vive Momentos Inolvidables</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Experiencias curadas especialmente para nuestros titulares.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiences.map((exp, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src={exp.image || "/placeholder.svg"}
                      alt={exp.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-lg font-bold text-white mb-1">{exp.title}</h3>
                      <p className="text-sm text-slate-300">{exp.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-r from-[#C7CEEA] via-[#B5EAD7] to-[#E2F0CB]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">¿Listo para una Experiencia Premium?</h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              Contacta a tu concierge y descubre todo lo que podemos hacer por ti.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg px-8">
                  Contactar Concierge
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-800 text-slate-800 hover:bg-slate-800/10 bg-transparent"
                >
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
