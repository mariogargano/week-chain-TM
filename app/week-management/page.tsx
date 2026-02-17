import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Home,
  FileText,
  CheckCircle2,
  Globe,
  Headphones,
  ArrowRight,
  Star,
  Building2,
  Key,
  Calendar,
} from "lucide-react"

export const metadata: Metadata = {
  title: "WEEK-Management™ | Administración de Certificados Vacacionales",
  description:
    "Servicio profesional de administración de Smart Vacational Certificates. Coordinación de solicitudes, verificación de uso temporal y asistencia administrativa. Optimiza el uso de tu certificado.",
  openGraph: {
    title: "WEEK-Management™ | Administración de Certificados",
    description:
      "Servicio profesional de administración de tus Smart Vacational Certificates con coordinación de solicitudes y asistencia administrativa.",
  },
}

export default function WeekManagementPage() {
  const managementServices = [
    {
      icon: Globe,
      title: "Coordinación de Solicitudes",
      description:
        "Asistencia profesional en la coordinación de tus solicitudes de uso temporal según disponibilidad del sistema WEEK-CHAIN.",
    },
    {
      icon: FileText,
      title: "Gestión Administrativa",
      description:
        "Administración de documentación, verificación de requisitos y seguimiento de solicitudes de uso temporal.",
    },
    {
      icon: Home,
      title: "Coordinación de Servicios",
      description:
        "Coordinación de servicios complementarios para mejorar tu experiencia de uso temporal (sujeto a disponibilidad).",
    },
    {
      icon: Star,
      title: "Asistencia Prioritaria",
      description:
        "Soporte prioritario en la gestión de tus certificados con respuesta acelerada a consultas administrativas.",
    },
    {
      icon: Key,
      title: "Verificación de Uso",
      description:
        "Asistencia en verificación de cumplimiento de requisitos para solicitudes de uso temporal de certificados.",
    },
    {
      icon: Headphones,
      title: "Soporte Administrativo",
      description:
        "Atención especializada para resolver consultas sobre administración y coordinación de certificados vacacionales.",
    },
  ]

  const stats = [
    { label: "Tasa de Éxito", value: "85%", icon: Calendar },
    { label: "Honorario Mensual", value: "$150", suffix: "USD", icon: FileText },
    { label: "Satisfacción", value: "4.8", suffix: "★", icon: Star },
    { label: "Certificados Activos", value: "150+", icon: Building2 },
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Activa el Servicio",
      description:
        "Desde tu dashboard, activa WEEK-Management™ para administración profesional de tus certificados. Proceso en 5 minutos.",
    },
    {
      step: "02",
      title: "Preparamos Coordinación",
      description:
        "Revisión de certificados, verificación de requisitos y preparación de sistema de coordinación administrativa.",
    },
    {
      step: "03",
      title: "Gestionamos Solicitudes",
      description:
        "Coordinamos tus solicitudes de uso temporal, verificamos cumplimiento y damos seguimiento administrativo.",
    },
    {
      step: "04",
      title: "Reportes Mensuales",
      description: "Reporte mensual detallado de gestión administrativa y coordinación de solicitudes realizadas.",
    },
  ]

  const faqs = [
    {
      question: "¿Cuánto cobra WEEK-Management™ por el servicio?",
      answer:
        "El servicio tiene un honorario mensual de $150 USD por administración de certificados. NO cobramos comisiones sobre uso ni valorización. Es un servicio de administración administrativa únicamente.",
    },
    {
      question: "¿Este servicio garantiza aprobación de solicitudes?",
      answer:
        "NO. WEEK-Management™ es un servicio de asistencia administrativa. La aprobación de solicitudes de uso temporal depende exclusivamente de la disponibilidad del sistema WEEK-CHAIN. NO garantizamos fechas, destinos ni aprobaciones.",
    },
    {
      question: "¿Qué incluye exactamente el servicio?",
      answer:
        "Asistencia en coordinación de solicitudes, verificación de requisitos administrativos, seguimiento de trámites y soporte prioritario. NO incluye garantía de aprobación ni asignación de destinos/fechas específicas.",
    },
    {
      question: "¿Puedo cancelar el servicio cuando quiera?",
      answer:
        "Sí, puedes desactivar WEEK-Management™ en cualquier momento. El servicio es mes a mes sin compromisos de permanencia.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 py-20 sm:py-28 bg-gradient-to-br from-white via-[#FFDAC1]/10 to-[#B5EAD7]/10">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#FF9AA2]/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-[#C7CEEA]/20 blur-3xl" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <Badge className="bg-[#B5EAD7]/30 text-emerald-700 border-[#B5EAD7]">
                  <Building2 className="h-4 w-4 mr-2" />
                  Servicio de Administración de Certificados
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Tu Certificado,
                  <br />
                  <span className="text-brand-gradient">Nuestra Administración</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                  WEEK-Management™ es el servicio profesional de administración de tus Smart Vacational Certificates.
                  Coordinación de solicitudes, verificación administrativa y soporte prioritario para optimizar el uso
                  de tu certificado.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/dashboard/owner">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white shadow-lg"
                    >
                      Activar Servicio
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                    >
                      Hablar con Asesor
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 pt-4">
                  {["Honorario fijo mensual", "Cancela cuando quieras", "Soporte prioritario"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-[#B5EAD7]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Dashboard Image */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
                  <img
                    src="/week-management-dashboard-screen.jpg"
                    alt="Dashboard de WEEK-Management mostrando panel de control con administración de certificados"
                    className="w-full h-auto"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA]" />
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#B5EAD7] to-[#E2F0CB] text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  $150/mes USD
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#C7CEEA]/30 text-indigo-700 border-[#C7CEEA]">Servicio Completo</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Administración Integral de Certificados
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Desde la coordinación de solicitudes hasta el seguimiento administrativo, nos encargamos de cada
                detalle.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {managementServices.map((service, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-[#FF9AA2]/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9AA2]/20 to-[#FFB7B2]/20 flex items-center justify-center mb-4 group-hover:from-[#FF9AA2]/30 group-hover:to-[#FFB7B2]/30 transition-all">
                    <service.icon className="h-6 w-6 text-[#FF9AA2]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-[#FFDAC1]/10 via-white to-[#B5EAD7]/10">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#FFDAC1]/30 text-orange-700 border-[#FFDAC1]">Proceso Simple</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Cómo Funciona?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Activa WEEK-Management™ en 4 simples pasos y optimiza la administración de tus certificados.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <div key={i} className="relative text-center">
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#FF9AA2]/50 to-transparent" />
                  )}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-[#B5EAD7]/30 text-emerald-700 border-[#B5EAD7]">Transparente y Simple</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Honorario Fijo Mensual</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Servicio de administración con honorario fijo mensual de $150 USD. Sin comisiones sobre uso ni
              valorización.
            </p>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl max-w-lg mx-auto relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#FF9AA2] to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#C7CEEA] to-transparent rounded-full blur-2xl" />
              </div>

              <div className="relative">
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-slate-400">$</span>
                  <span className="text-6xl sm:text-7xl font-bold text-white">150</span>
                  <span className="text-2xl font-bold text-[#FF9AA2]">/mes</span>
                </div>
                <p className="text-slate-400 mb-6">honorario fijo por administración</p>
                <div className="space-y-3 text-left">
                  {[
                    "Coordinación de solicitudes",
                    "Verificación administrativa",
                    "Seguimiento de trámites",
                    "Soporte prioritario",
                    "Reportes mensuales",
                    "Asistencia especializada",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#B5EAD7] flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full mt-8 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A94] hover:to-[#FFA7A2] text-white font-semibold h-12 rounded-xl"
                >
                  <Link href="/auth">Activar WEEK-Management™</Link>
                </Button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#FFDAC1]" />
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="px-4 sm:px-6 py-12 bg-amber-50">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl p-8 border-2 border-amber-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-600" />
                Aviso Importante Sobre el Servicio
              </h3>
              <div className="text-sm text-slate-600 space-y-3">
                <p>
                  WEEK-Management™ es un servicio de asistencia administrativa para la gestión de Smart Vacational
                  Certificates. NO es un servicio de gestión inmobiliaria ni de generación de ingresos.
                </p>
                <p>
                  Este servicio NO garantiza la aprobación de solicitudes de uso temporal. Todas las solicitudes están
                  sujetas a disponibilidad del sistema WEEK-CHAIN y a las políticas establecidas.
                </p>
                <p>
                  Los Smart Vacational Certificates NO asignan destinos, fechas ni propiedades específicas. Son derechos
                  de solicitud de uso temporal sujetos a disponibilidad.
                </p>
                <p>
                  El honorario mensual de $150 USD es por servicios de administración y coordinación. NO representa
                  comisión sobre ingresos ni garantiza valorización o rendimientos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-[#C7CEEA]/10 via-white to-[#FF9AA2]/5">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200">Preguntas Frecuentes</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Tienes Dudas?</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-[#FF9AA2]/30 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
