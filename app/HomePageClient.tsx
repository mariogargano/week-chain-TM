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
  Shield,
  Plane,
  Lock,
  FileCheck,
  Award,
  Scale,
  ChevronDown,
  Briefcase,
} from "lucide-react"
import { GlobalInfrastructureSection } from "@/components/global-infrastructure-section"
import { PartnersSection } from "@/components/partners-section"
import Image from "next/image"

const homepageFaqs = [
  {
    question: "¿Que es WEEK-CHAIN?",
    answer:
      "WEEK-CHAIN es una plataforma digital que ofrece Smart Vacational Certificates (SVC). El SVC es un derecho personal y temporal para solicitar uso vacacional durante hasta 15 anos en destinos participantes, siempre sujeto a disponibilidad. NO constituye propiedad inmobiliaria, tiempo compartido tradicional, inversion financiera, ni garantiza destinos o fechas especificas. Consulta terminos completos antes de contratar.",
  },
  {
    question: "¿Cuanto cuesta un certificado?",
    answer:
      "Los precios varian segun capacidad de personas y duracion del certificado, desde $6,500 USD. El precio corresponde al derecho de solicitud de uso vacacional y NO representa fechas especificas, temporadas preferenciales ni asignacion de destinos concretos. Consulta el catalogo y terminos completos.",
  },
  {
    question: "¿Como funciona el Smart Vacational Certificate?",
    answer:
      "El SVC te otorga un derecho personal de solicitar uso vacacional anual durante hasta 15 anos mediante el proceso REQUEST (solicitas) → OFFER (recibes oferta si hay disponibilidad) → CONFIRM (aceptas o declinas). NO hay garantia de aprobacion. El certificado NO constituye propiedad, inversion ni asigna propiedades o destinos especificos.",
  },
  {
    question: "¿Puedo solicitar que gestionen la renta de mi certificado?",
    answer:
      "WEEK-Management es un servicio opcional de coordinacion operativa. Puedes solicitar la gestion de tu derecho de uso cuando no lo utilices, sujeto a disponibilidad, aprobacion y reglas del sistema. Los ingresos, si los hubiera, estan sujetos a comisiones operativas, demanda del mercado y NO estan garantizados. No constituye rendimiento de inversion.",
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
        desc: "Estancias vacacionales anuales durante 15 años",
      },
      savings: {
        title: "Sin Cuotas Anuales",
        desc: "Pago único sin cargos de mantenimiento adicionales",
      },
      income: {
        title: "Uso Flexible",
        desc: "Solicita tus vacaciones cuando mejor te convenga",
      },
      destinations: {
        title: "Red Global de Destinos",
        desc: "Acceso a alojamientos premium en destinos seleccionados",
      },
      notarized: {
        title: "Documentación Formal",
        desc: "Contrato digital con validez legal completa",
      },
      escrow: {
        title: "Transacciones Seguras",
        desc: "Pagos procesados con máxima seguridad",
      },
      nom: {
        title: "Certificación NOM-151",
        desc: "Documentos digitales con validez legal y trazabilidad",
      },
      kyc: {
        title: "Verificación de Identidad",
        desc: "Proceso KYC para la seguridad de todos los titulares",
      },
      diligence: {
        title: "Alojamientos Verificados",
        desc: "Propiedades seleccionadas y evaluadas por nuestro equipo",
      },
      contracts: {
        title: "Marco Legal Transparente",
        desc: "Términos claros y condiciones bien definidas",
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
  const [showLegalNotice, setShowLegalNotice] = useState(true)

  const hero = t?.hero || fallback.hero
  const buyerBenefits = t?.buyerBenefits || fallback.buyerBenefits
  const howItWorks = t?.howItWorks || fallback.howItWorks
  const cta = t?.cta || fallback.cta

  const steps = [
    {
      step: 1,
      icon: Calendar,
      title: "Envía tu Solicitud",
      description: "Indica tus preferencias de destino, fechas y número de personas.",
    },
    {
      step: 2,
      icon: Shield,
      title: "Revisión del Sistema",
      description: "Nuestro equipo revisa tu solicitud y busca la mejor coincidencia disponible.",
    },
    {
      step: 3,
      icon: CheckCircle2,
      title: "Recibe tu Oferta",
      description: "Te enviamos una oferta con el destino, fechas y detalles del alojamiento.",
    },
    {
      step: 4,
      icon: Plane,
      title: "Confirma y Viaja",
      description: "Acepta la oferta, recibe tu confirmación y prepara tu equipaje.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-background">
        <FAQJsonLd faqs={homepageFaqs} />

        <div className="flex flex-col bg-white">
          {/* Hero Section */}
          <article aria-label={hero.badge || "Smart Vacational Certificates"}>
            <section className="relative overflow-hidden">
              <AnimatedHero />
            </section>
          </article>

          {/* DynamicCertificateShowcase con Características integradas */}
          <section className="relative bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            {/* Certificado */}
            <DynamicCertificateShowcase />
            
            {/* Características del Certificado - Integradas */}
            <div className="container mx-auto max-w-6xl relative z-10 px-4 sm:px-6 pb-12 sm:pb-16 md:pb-24">
              <div className="space-y-6">
                {/* Service Features */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    Características del Certificado
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Vigencia de hasta 15 Años</p>
                        <p className="text-xs text-slate-300">Derecho de solicitud anual, sujeto a disponibilidad</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Registro Digital Verificable</p>
                        <p className="text-xs text-slate-300">Trazabilidad y autenticidad del certificado</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Conforme a NOM-151</p>
                        <p className="text-xs text-slate-300">Documentos digitales con validez legal en Mexico</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Sin Cuotas de Mantenimiento</p>
                        <p className="text-xs text-slate-300">Pago único sin cargos recurrentes</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Scale className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Marco Legal Transparente</p>
                        <p className="text-xs text-slate-300">Conforme a legislación mexicana</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Showcase - Now shows properties */}
          <PlatformShowcase />

          {/* NoMaintenanceBanner */}
          <NoMaintenanceBanner />

          {/* Global Infrastructure Section */}
          <GlobalInfrastructureSection />

          {/* Partners Section */}
          <PartnersSection />

          {/* How It Works Section */}
          <section
            aria-labelledby="how-it-works-title"
            className="relative bg-gradient-to-b from-white via-sky-50/30 to-cyan-50/20 px-4 sm:px-6 py-16 sm:py-20 md:py-24 overflow-hidden"
          >
            {/* Content for How It Works Section */}
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2
                  id="how-it-works-title"
                  className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
                >
                  {howItWorks.title || fallback.howItWorks.title}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {howItWorks.subtitle || fallback.howItWorks.subtitle}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {steps.map((step) => (
                  <div
                    key={step.step}
                    className="relative bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group"
                  >
                    <div className="absolute -top-4 left-6 bg-gradient-to-br from-sky-500 to-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-sky-200">
                      {step.step}
                    </div>
                    <div className="mb-4 mt-4">
                      <step.icon className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                ))}
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
                  className="w-full sm:w-auto sm:min-w-[240px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-sky-200"
                >
                  <Link href="/auth">
                    {("startButton" in cta ? cta.startButton : (cta as { primary?: string }).primary) || fallback.cta.startButton}
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto sm:min-w-[240px] border-2 border-sky-200 text-sky-700 hover:bg-sky-50 text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl transition-all duration-300 bg-transparent"
                >
                  <Link href="/properties">{("viewPropertiesButton" in cta ? cta.viewPropertiesButton : (cta as { secondary?: string }).secondary) || fallback.cta.viewPropertiesButton}</Link>
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
                className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-lg font-bold h-16 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-sky-200"
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
