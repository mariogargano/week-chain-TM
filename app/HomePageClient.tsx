"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LegalDisclaimer } from "@/components/legal-disclaimer"
import { MobileAppSection } from "@/components/mobile-app-section"
import { PlatformShowcase } from "@/components/platform-showcase"
import { AnimatedHero } from "@/components/ui/animated-hero"
import { FAQJsonLd } from "@/components/seo/json-ld"
import { useTranslations } from "@/lib/i18n/use-translations"
import { DynamicCertificateShowcase } from "@/components/dynamic-certificate-showcase"
import { BrokerDashboardPreview } from "@/components/broker-dashboard-preview"
import { NoMaintenanceBanner } from "@/components/no-maintenance-banner"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Coins,
  Shield,
  Sparkles,
  Key,
  Plane,
  Lock,
  FileCheck,
  Award,
  Scale,
  ChevronDown,
  Briefcase,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { GlobalInfrastructureSection } from "@/components/global-infrastructure-section"

const homepageFaqs = [
  {
    question: "¿Qué es WEEK-CHAIN?",
    answer:
      "WEEK-CHAIN es una plataforma digital de Smart Vacational Certificates (SVC). Ofrecemos certificados personales que otorgan el derecho de solicitar uso vacacional por 15 años en destinos participantes, sujeto a disponibilidad del sistema. No constituye propiedad inmobiliaria, inversión ni asigna propiedades específicas.",
  },
  {
    question: "¿Cuánto cuesta un certificado?",
    answer:
      "Los precios representan el tier del certificado, la duración del derecho y el nivel de flexibilidad. Los certificados van desde $3,500 USD hasta $9,500 USD según el tier seleccionado. El precio NO representa fechas específicas, temporadas ni asignación de destinos concretos.",
  },
  {
    question: "¿Cómo funciona el Smart Vacational Certificate?",
    answer:
      "El Smart Vacational Certificate (SVC) te otorga un derecho personal, temporal y revocable de solicitar uso vacacional anual durante 15 años, sujeto a disponibilidad del sistema WEEK-CHAIN. NO constituye propiedad inmobiliaria, inversión, ni asigna propiedades, fechas o destinos específicos. Es un derecho de solicitud conforme a normativa mexicana NOM-151.",
  },
  {
    question: "¿Puedo solicitar renta de mi certificado?",
    answer:
      "Puedes solicitar la gestión operativa de renta de tu derecho de uso a través de WEEK Management, sujeto a disponibilidad, aprobación y reglas del sistema. Nosotros gestionamos la operación en plataformas externas. Los ingresos generados están sujetos a comisiones operativas, disponibilidad de demanda y no constituyen rendimiento de inversión ni están garantizados.",
  },
]

const fallback = {
  hero: {
    badge: "Smart Vacational Certificates",
  },
  buyerBenefits: {
    title: "¿Por qué contratar con WEEK-CHAIN?",
    subtitle: "Beneficios del Smart Vacational Certificate (SVC) - Certificado de Derecho Temporal de Uso",
    benefits: {
      years: {
        title: "15 Años de Vigencia",
        desc: "Derecho temporal de solicitar estancias anuales, sujeto a disponibilidad",
      },
      savings: {
        title: "Sistema sin Cuotas Anuales",
        desc: "Pago único sin cuotas de mantenimiento. No constituye inversión ni ahorro",
      },
      income: {
        title: "Solicitudes por Demanda",
        desc: "Envía solicitudes cuando desees vacacionar, sin asignación previa de fechas",
      },
      destinations: {
        title: "Red de Destinos Participantes",
        desc: "Acceso a alojamientos según disponibilidad. No asigna propiedades específicas",
      },
      notarized: {
        title: "Documentación Formal",
        desc: "Contrato de prestación de servicios conforme a legislación mexicana",
      },
      escrow: {
        title: "Transacciones Seguras",
        desc: "Procesamiento de pagos con protocolos de seguridad operativos",
      },
      nom: {
        title: "Certificación NOM-151",
        desc: "Documentos digitales con validez legal y trazabilidad verificable",
      },
      kyc: {
        title: "Verificación de Identidad",
        desc: "Proceso KYC para seguridad del titular y del sistema",
      },
      diligence: {
        title: "Alojamientos Evaluados",
        desc: "Destinos participantes verificados operativamente por el sistema",
      },
      contracts: {
        title: "Marco Legal Transparente",
        desc: "Términos contractuales que rigen el derecho temporal de uso",
      },
    },
  },
  howItWorks: {
    title: "¿Cómo Funciona?",
    subtitle: "Proceso simple para adquirir tu Smart Vacational Certificate",
    steps: {
      selectProperty: {
        title: "Adquiere Certificado",
        description: "Selecciona tu tier y obtén tu certificado de acceso vacacional",
      },
      payment: {
        title: "Solicita Reservación",
        description: "Cuando quieras vacacionar, envía tu solicitud con preferencias",
      },
      receiveVoucher: { title: "Recibe Oferta", description: "Nuestro equipo revisa y te ofrece destinos disponibles" },
      getContract: { title: "Confirma y Disfruta", description: "Acepta la oferta y prepara tu equipaje" },
    },
    bonus: {
      title: "SERVICIO OPCIONAL",
      subtitle: "WEEK-Management",
      description: "Solicita gestión operativa de renta cuando no uses tu derecho, sujeto a disponibilidad y demanda",
      features: {
        feature1: "Gestión en plataformas externas",
        feature2: "Sujeto a comisiones operativas",
      },
    },
  },
  cta: {
    title: "Adquiere Tu Certificado de Acceso",
    description: "Únete al sistema WEEK-CHAIN y obtén el derecho de solicitar uso vacacional en destinos participantes",
    startButton: "Explorar Certificados",
    viewPropertiesButton: "Ver Destinos Participantes",
  },
}

export function HomePageClient() {
  const t = useTranslations()
  const [showBrokerSection, setShowBrokerSection] = useState(false)

  useEffect(() => {
    console.log("[v0] HomePageClient mounted successfully")
    return () => {
      console.log("[v0] HomePageClient unmounting")
    }
  }, [])

  const hero = t?.hero || fallback.hero
  const buyerBenefits = t?.buyerBenefits || fallback.buyerBenefits
  const howItWorks = t?.howItWorks || fallback.howItWorks
  const cta = t?.cta || fallback.cta

  const steps = [
    {
      step: 1,
      icon: Calendar,
      title: "Envía tu Solicitud",
      description:
        "Indica tus preferencias de destino, fechas deseadas y número de personas. No seleccionas propiedades específicas.",
    },
    {
      step: 2,
      icon: Shield,
      title: "Revisión del Sistema",
      description:
        "Nuestro equipo revisa tu solicitud, verifica disponibilidad en la red de destinos participantes y busca la mejor coincidencia.",
    },
    {
      step: 3,
      icon: CheckCircle2,
      title: "Recibe Oferta",
      description:
        "Te enviamos una oferta con el destino disponible, fechas y detalles del alojamiento. Tienes 48 horas para aceptar o declinar.",
    },
    {
      step: 4,
      icon: Plane,
      title: "Confirma y Viaja",
      description:
        "Acepta la oferta, recibe tu confirmación de reservación y prepara tu equipaje. Tu semana vacacional está lista.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background">
        <FAQJsonLd faqs={homepageFaqs} />

        <div className="flex flex-col bg-white">
          {/* Hero Section */}
          <article aria-label={hero.badge || "Smart Vacational Certificates"}>
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-[#C7CEEA]/10 to-[#B5EAD7]/10">
              <AnimatedHero />
            </section>
          </article>

          {/* Platform Showcase - Now shows properties */}
          <PlatformShowcase />

          {/* Global Infrastructure Section */}
          <GlobalInfrastructureSection />

          {/* NoMaintenanceBanner */}
          <NoMaintenanceBanner />

          {/* Dynamic Certificate Showcase */}
          <DynamicCertificateShowcase />

          {/* Buyer Benefits Section */}
          <section
            aria-labelledby="buyer-benefits-title"
            className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 sm:px-6 py-12 sm:py-16 md:py-24 overflow-hidden"
          >
            <div className="container mx-auto max-w-6xl relative z-10 mb-8">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Scale className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Aviso Legal Importante - Smart Vacational Certificate (SVC)
                    </h3>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p className="font-semibold">
                        Este certificado otorga un{" "}
                        <span className="text-amber-700">derecho personal, temporal y revocable</span> de solicitar uso
                        vacacional por hasta 15 años, sujeto a disponibilidad.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2 mt-3">
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>NO es propiedad inmobiliaria</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>NO es tiempo compartido</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>NO es inversión financiera</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>NO garantiza destinos específicos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="mb-8 text-center">
                <h2
                  id="buyer-benefits-title"
                  className="mb-3 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
                >
                  Características del Sistema SVC
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">
                  Derecho temporal de solicitud de uso vacacional. Todas las solicitudes están sujetas a disponibilidad
                  del sistema y no constituyen garantía de acceso a fechas, destinos o propiedades específicas.
                </p>
              </div>

              <div className="space-y-8">
                {/* Service Features */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Características del Servicio
                  </h3>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                        <Key className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">15 Años de Vigencia</h4>
                      <p className="text-xs text-slate-500">
                        Derecho temporal de solicitar estancias anuales, sujeto a disponibilidad
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                        <Coins className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Sin Cuotas Anuales</h4>
                      <p className="text-xs text-slate-500">
                        Pago único sin mantenimiento. No constituye inversión ni ahorro
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Solicitudes Flexibles</h4>
                      <p className="text-xs text-slate-500">
                        Sin asignación previa de fechas. Solicita cuando desees vacacionar
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
                        <Plane className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Red de Destinos</h4>
                      <p className="text-xs text-slate-500">
                        Acceso según disponibilidad. No asigna propiedades específicas
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Destinos Evaluados</h4>
                      <p className="text-xs text-slate-500">Alojamientos participantes verificados operativamente</p>
                    </div>
                  </div>
                </div>

                {/* Legal & Security Framework */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-slate-700" />
                    Marco Legal y Seguridad
                  </h3>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-600">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Documentación Formal</h4>
                      <p className="text-xs text-slate-500">Contrato de servicios conforme a legislación mexicana</p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-400">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Pagos Seguros</h4>
                      <p className="text-xs text-slate-500">Procesamiento con protocolos de seguridad operativos</p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500">
                        <FileCheck className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Certificación NOM-151</h4>
                      <p className="text-xs text-slate-500">Documentos digitales con validez legal y trazabilidad</p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Verificación KYC</h4>
                      <p className="text-xs text-slate-500">Proceso de identidad para seguridad del sistema</p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
                        <Scale className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Términos Transparentes</h4>
                      <p className="text-xs text-slate-500">Marco contractual que rige el derecho temporal de uso</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-slate-100 border border-slate-300 rounded-xl p-5 text-center">
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-slate-900">Modelo de Solicitud:</span> El certificado SVC otorga el
                  derecho de <span className="font-semibold">enviar solicitudes</span> de uso vacacional, no de reservar
                  directamente. Todas las solicitudes están sujetas a revisión, disponibilidad y aceptación del sistema
                  conforme al flujo REQUEST → OFFER → CONFIRM establecido en el contrato.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section
            aria-labelledby="how-it-works-title"
            className="relative bg-gradient-to-b from-white to-slate-50 px-4 sm:px-6 py-16 sm:py-20 md:py-24 overflow-hidden"
          >
            <div className="container mx-auto max-w-7xl relative z-10">
              <div className="text-center mb-12 md:mb-16">
                <h2
                  id="how-it-works-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight"
                >
                  ¿Cómo Solicitar tu Semana?
                </h2>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                  Proceso de solicitud de uso vacacional con tu Smart Vacational Certificate
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src="/happy-couple-receiving-vacation-home-keys-luxury-r.jpg"
                      alt="Pareja feliz recibiendo confirmación de su reservación vacacional"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">¡Reservación Confirmada!</p>
                          <p className="text-sm text-slate-600">Tu semana vacacional está lista</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 h-24 w-24 bg-amber-400/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 bg-blue-400/20 rounded-full blur-2xl" />
                </div>

                <div className="space-y-4 order-1 lg:order-2">
                  {steps.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-slate-500" />
                          <h3 className="font-bold text-slate-900">{item.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  ))}

                  <div className="relative mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-lg">
                    <div className="absolute -top-3 left-4">
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        <Sparkles className="h-3.5 w-3.5" />
                        SERVICIO OPCIONAL
                      </span>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-lg font-bold text-slate-900 mb-2">WEEK-Management</h4>
                      <p className="text-sm text-slate-700 mb-3">
                        Solicita gestión operativa de renta cuando no uses tu derecho, sujeto a disponibilidad y demanda
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Gestión en plataformas externas</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Sujeto a comisiones operativas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section
            className="bg-slate-50 px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32"
            aria-label="Llamada a la acción"
          >
            <div className="container mx-auto max-w-4xl text-center px-4">
              <h2 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
                {cta.title || fallback.cta.title}
              </h2>
              <p className="mb-8 md:mb-12 text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {cta.description || fallback.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[240px] bg-slate-900 hover:bg-slate-800 text-white text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Link href="/auth">
                    {cta.startButton || fallback.cta.startButton}
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto sm:min-w-[240px] border-2 border-slate-300 text-slate-700 hover:bg-slate-100 text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl transition-all duration-300 bg-transparent"
                >
                  <Link href="/properties">{cta.viewPropertiesButton || fallback.cta.viewPropertiesButton}</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Broker Dashboard Preview Section */}
          <section className="bg-white px-4 py-8 border-t border-slate-200">
            <div className="container mx-auto max-w-6xl">
              <Button
                onClick={() => setShowBrokerSection(!showBrokerSection)}
                size="lg"
                className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white text-lg font-bold h-16 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                <Briefcase className="mr-3 h-6 w-6" />
                Trabaja con Nosotros
                <ChevronDown
                  className={`ml-3 h-6 w-6 transition-transform duration-300 ${showBrokerSection ? "rotate-180" : ""}`}
                />
              </Button>

              {/* Collapsible content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showBrokerSection ? "max-h-[5000px] opacity-100 mt-8" : "max-h-0 opacity-0"
                }`}
              >
                <BrokerDashboardPreview />
              </div>
            </div>
          </section>

          <MobileAppSection />

          <LegalDisclaimer />
        </div>
      </div>
    </div>
  )
}

export default HomePageClient
