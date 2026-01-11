"use client"

import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Target,
  Calendar,
  Globe,
  Smartphone,
  Users,
  Building2,
  Plane,
  Shield,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function RoadmapPage() {
  const phases = [
    {
      quarter: "Q1 2025",
      title: "Lanzamiento México",
      status: "completed",
      icon: Building2,
      description: "Establecimiento de operaciones y lanzamiento de la plataforma en México",
      items: [
        {
          title: "Estructura Legal",
          desc: "Constitución de empresa en México con cumplimiento PROFECO y NOM-029-SCFI",
        },
        {
          title: "Plataforma Web",
          desc: "Dashboard de usuario, catálogo de destinos, sistema de reservas y pagos integrados",
        },
        {
          title: "Red de Intermediarios",
          desc: "Programa de brokers con tarjeta digital, QR y sistema de honorarios",
        },
        {
          title: "Primeros 10 Destinos",
          desc: "Cancún, Tulum, Playa del Carmen, Puerto Vallarta, Los Cabos y más",
        },
      ],
      metrics: "10 destinos • 520 semanas • Red de 50 intermediarios",
    },
    {
      quarter: "Q2 2025",
      title: "WEEK-Management™",
      status: "in-progress",
      icon: TrendingUp,
      description: "Lanzamiento del servicio de gestión de rentas vacacionales",
      items: [
        {
          title: "Integración OTAs",
          desc: "Conexión con Airbnb, Booking.com y Vrbo para maximizar ocupación",
        },
        {
          title: "Gestión Automatizada",
          desc: "Calendario sincronizado, precios dinámicos, comunicación con huéspedes",
        },
        {
          title: "Expansión a 25 Destinos",
          desc: "Nuevos destinos: Riviera Nayarit, San Miguel de Allende, Valle de Bravo",
        },
        {
          title: "App de Propietarios",
          desc: "Panel de control para monitorear ingresos y ocupación en tiempo real",
        },
      ],
      metrics: "25 destinos • 1,300 semanas • 85% ocupación promedio",
    },
    {
      quarter: "Q3 2025",
      title: "WEEK-Service™",
      status: "upcoming",
      icon: Users,
      description: "Lanzamiento de servicios de concierge premium",
      items: [
        {
          title: "Concierge 24/7",
          desc: "Asistencia personal para reservas, traslados, tours y experiencias",
        },
        {
          title: "Servicios Premium",
          desc: "Chef privado, spa, yates, tours exclusivos, reservaciones VIP",
        },
        {
          title: "Programa de Lealtad",
          desc: "Beneficios exclusivos para usuarios frecuentes y referidos",
        },
        {
          title: "Alianzas Estratégicas",
          desc: "Partnerships con aerolíneas, restaurantes y experiencias locales",
        },
      ],
      metrics: "50+ servicios • Concierge 24/7 • 95% satisfacción",
    },
    {
      quarter: "Q4 2025",
      title: "Expansión LATAM",
      status: "upcoming",
      icon: Globe,
      description: "Expansión a principales destinos de Latinoamérica",
      items: [
        {
          title: "Caribe",
          desc: "República Dominicana, Puerto Rico, Aruba, Curaçao",
        },
        {
          title: "Sudamérica",
          desc: "Colombia (Cartagena), Brasil (Río, Florianópolis), Argentina (Bariloche)",
        },
        {
          title: "Centroamérica",
          desc: "Costa Rica, Panamá, Guatemala",
        },
        {
          title: "Red Regional",
          desc: "Intermediarios locales en cada país con soporte multilingüe",
        },
      ],
      metrics: "15 países • 75 destinos • 3,000+ semanas",
    },
    {
      quarter: "Q1 2026",
      title: "App Móvil",
      status: "upcoming",
      icon: Smartphone,
      description: "Lanzamiento de aplicación móvil nativa iOS y Android",
      items: [
        {
          title: "Gestión Completa",
          desc: "Reservas, pagos, certificados digitales y soporte desde el móvil",
        },
        {
          title: "Apple/Google Wallet",
          desc: "Tarjetas digitales y certificados en wallet del dispositivo",
        },
        {
          title: "Notificaciones",
          desc: "Alertas de reservas, recordatorios y ofertas personalizadas",
        },
        {
          title: "Check-in Digital",
          desc: "Proceso de llegada sin contacto con acceso digital",
        },
      ],
      metrics: "iOS + Android • 50K+ descargas • 4.8★ rating",
    },
    {
      quarter: "Q2-Q3 2026",
      title: "Expansión Europa",
      status: "upcoming",
      icon: Plane,
      description: "Entrada al mercado europeo con destinos premium",
      items: [
        {
          title: "España",
          desc: "Costa Brava, Mallorca, Ibiza, Canarias, Costa del Sol",
        },
        {
          title: "Italia",
          desc: "Costa Amalfitana, Toscana, Cerdeña, Lago di Como",
        },
        {
          title: "Portugal & Grecia",
          desc: "Algarve, Lisboa, Santorini, Mykonos, Creta",
        },
        {
          title: "Cumplimiento UE",
          desc: "Adaptación legal a normativas europeas de tiempo compartido",
        },
      ],
      metrics: "10 países • Red de destinos en expansión • Presencia global",
    },
    {
      quarter: "Q4 2026",
      title: "VA-FI™ Préstamos (Próximamente)",
      status: "upcoming",
      icon: Shield,
      description:
        "El módulo VA-FI™ no está habilitado actualmente. Esta funcionalidad estará disponible próximamente.",
      items: [
        {
          title: "Préstamos Personales",
          desc: "Financiamiento con garantía de derechos de uso vacacional (pendiente aprobación regulatoria)",
        },
        {
          title: "Cumplimiento Regulatorio",
          desc: "Licencias y registros ante autoridades financieras",
        },
        {
          title: "Tasas Competitivas",
          desc: "Condiciones preferenciales para usuarios de la plataforma",
        },
        {
          title: "Proceso 100% Digital",
          desc: "Solicitud, aprobación y desembolso en línea",
        },
      ],
      metrics: "Funcionalidad próximamente disponible • Pendiente aprobación regulatoria",
    },
    {
      quarter: "2027+",
      title: "Visión Global",
      status: "upcoming",
      icon: Globe,
      description: "Consolidación como líder en servicios de tiempo compartido vacacional",
      items: [
        {
          title: "Expansión Asia-Pacífico",
          desc: "Tailandia, Bali, Maldivas, Australia, Japón",
        },
        {
          title: "Servicios Corporativos",
          desc: "Soluciones B2B para empresas y beneficios empleados",
        },
        {
          title: "Experiencias de Lujo",
          desc: "Yates, villas exclusivas, jets compartidos",
        },
        {
          title: "Sostenibilidad",
          desc: "Propiedades eco-friendly y turismo responsable",
        },
      ],
      metrics: "200+ destinos • 5 continentes • Líder global",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section - Enhanced hero with better visual hierarchy */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFDAC1]/40 via-white to-[#C7CEEA]/40" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF9AA2]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#B5EAD7]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C7CEEA]/10 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button asChild variant="ghost" className="mb-8 text-slate-600 hover:text-slate-900 hover:bg-white/50">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Badge className="mb-6 bg-slate-900 text-white border-0 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Plan Estratégico 2025-2027
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight">
              Roadmap{" "}
              <span className="bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] bg-clip-text text-transparent">
                WEEK-CHAIN™
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Nuestra visión para transformar la industria del tiempo compartido vacacional
            </p>

            {/* Progress indicator */}
            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#B5EAD7]" />
                <span className="text-sm text-slate-600">Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FFB7B2] animate-pulse" />
                <span className="text-sm text-slate-600">En Progreso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-300" />
                <span className="text-sm text-slate-600">Próximamente</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section - Improved timeline visual design */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF9AA2] via-[#C7CEEA] to-[#B5EAD7] rounded-full" />

            {/* Phases */}
            <div className="space-y-16 md:space-y-24">
              {phases.map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`relative flex flex-col md:flex-row gap-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline Point */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                        phase.status === "completed"
                          ? "bg-gradient-to-br from-[#B5EAD7] to-[#8DD4BE] text-white"
                          : phase.status === "in-progress"
                            ? "bg-gradient-to-br from-[#FFB7B2] to-[#FF9AA2] text-white"
                            : "bg-white border-2 border-slate-200 text-slate-400"
                      }`}
                    >
                      {phase.status === "completed" ? (
                        <CheckCircle2 className="h-7 w-7" />
                      ) : phase.status === "in-progress" ? (
                        <Clock className="h-7 w-7 animate-pulse" />
                      ) : (
                        <phase.icon className="h-7 w-7" />
                      )}
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  <div className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${i % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                    {/* Dark Premium Card */}
                    <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300 border border-slate-800">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <Badge
                          className={`text-sm px-3 py-1 ${
                            phase.status === "completed"
                              ? "bg-[#B5EAD7]/20 text-[#B5EAD7] border-[#B5EAD7]/30"
                              : phase.status === "in-progress"
                                ? "bg-[#FFB7B2]/20 text-[#FFB7B2] border-[#FFB7B2]/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {phase.quarter}
                        </Badge>
                        {phase.status === "completed" && (
                          <span className="text-xs text-[#B5EAD7] font-semibold uppercase tracking-wider">
                            Completado
                          </span>
                        )}
                        {phase.status === "in-progress" && (
                          <span className="text-xs text-[#FFB7B2] font-semibold uppercase tracking-wider animate-pulse">
                            En Progreso
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{phase.title}</h3>
                      <p className="text-slate-400 mb-8 text-lg">{phase.description}</p>

                      {/* Items */}
                      <div className="space-y-4 mb-8">
                        {phase.items.map((item, j) => (
                          <motion.div
                            key={j}
                            className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: j * 0.1 }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  phase.status === "completed"
                                    ? "bg-[#B5EAD7]/20"
                                    : phase.status === "in-progress"
                                      ? "bg-[#FFB7B2]/20"
                                      : "bg-slate-700"
                                }`}
                              >
                                <CheckCircle2
                                  className={`h-4 w-4 ${
                                    phase.status === "completed"
                                      ? "text-[#B5EAD7]"
                                      : phase.status === "in-progress"
                                        ? "text-[#FFB7B2]"
                                        : "text-slate-500"
                                  }`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{item.title}</h4>
                                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-3 pt-6 border-t border-slate-700/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9AA2]/20 to-[#C7CEEA]/20 flex items-center justify-center">
                          <Target className="h-5 w-5 text-[#FF9AA2]" />
                        </div>
                        <span className="text-slate-300 font-medium">{phase.metrics}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Updated with icons instead of emojis */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-[#C7CEEA]/20 text-[#7C85B3] border-[#C7CEEA]/30 px-4 py-2">
              Nuestros Pilares
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Construyendo el Futuro del{" "}
              <span className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] bg-clip-text text-transparent">
                Tiempo Compartido
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Cumplimiento Legal",
                desc: "100% conforme con PROFECO, NOM-029-SCFI y regulaciones de cada país donde operamos.",
                color: "#FF9AA2",
              },
              {
                icon: TrendingUp,
                title: "Crecimiento Sostenible",
                desc: "Expansión gradual y responsable: México → LATAM → Europa → Global.",
                color: "#B5EAD7",
              },
              {
                icon: Sparkles,
                title: "Experiencia Premium",
                desc: "Servicio de clase mundial con concierge 24/7 y atención personalizada.",
                color: "#C7CEEA",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl hover:border-slate-200 transition-all duration-500 hover:-translate-y-2"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${value.color}20` }}
                >
                  <value.icon className="h-8 w-8" style={{ color: value.color }} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced CTA with better visual design */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div
            className="bg-slate-900 rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-[#FF9AA2]/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-[#C7CEEA]/30 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#B5EAD7]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Únete Ahora
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Sé Parte del Futuro</h2>
              <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Únete a la comunidad WEEK-CHAIN™ y accede a los mejores destinos vacacionales con la flexibilidad y
                transparencia que mereces.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:opacity-90 text-white rounded-xl h-14 px-10 text-lg font-semibold shadow-lg shadow-[#FF9AA2]/25"
                >
                  <Link href="/properties">
                    Explorar Destinos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/20 text-white hover:bg-white/10 rounded-xl h-14 px-10 text-lg font-semibold bg-transparent"
                >
                  <Link href="/broker-programa">Ser Intermediario</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
