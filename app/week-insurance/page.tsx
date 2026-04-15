

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Building2, Users, ClipboardCheck, FileSearch, FileText, Settings, HeadphonesIcon, AlertTriangle, ArrowRight, HelpCircle, ChevronDown, Home, Scale, Flame, Truck, Clock, Camera, MapPin, Ruler, CalendarDays, UserCheck, Upload, Sparkles, LockKeyhole, Search, BookOpen, ShieldCheck,  } from "lucide-react";

import type { Metadata } from "next";
import { InsuranceContactForm } from "./insurance-contact-form";

export const metadata: Metadata = {
  title: "WEEK-INSURANCE | Proteccion Integral para Propiedades y Operacion Hospitality",
  description:
    "Coberturas, administracion de polizas y respuesta ante incidentes con estandares profesionales. Evaluacion de riesgo, coordinacion con aseguradoras lideres y gestion continua.",
}

const coverageCategories = [
  {
    icon: Home,
    title: "Proteccion del Activo (Property)",
    description:
      "Cobertura estructural, equipamiento, instalaciones y acabados. Protege el valor de tu propiedad ante eventos imprevistos.",
    color: "from-sky-500 to-cyan-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    icon: Scale,
    title: "Responsabilidad Civil (Liability)",
    description:
      "Respaldo ante reclamos de terceros, lesiones o danos durante la operacion. Protege tu patrimonio y reputacion.",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Users,
    title: "Operacion & Huespedes",
    description:
      "Coberturas para incidentes con huespedes, personal operativo y equipos durante la prestacion de servicios.",
    color: "from-teal-500 to-emerald-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    iconColor: "text-teal-400",
  },
  {
    icon: Clock,
    title: "Continuidad del Negocio",
    description:
      "Proteccion ante interrupcion de operaciones por siniestros. Minimiza el impacto financiero de paros no programados.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Flame,
    title: "Eventos & Danos Accidentales",
    description:
      "Cobertura para danos ocasionados durante eventos, reuniones o uso intensivo de las instalaciones.",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Truck,
    title: "Riesgos de Proveedores / Terceros",
    description:
      "Coordinacion de requisitos de seguro para proveedores de limpieza, mantenimiento, catering y otros servicios.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
]

const processSteps = [
  {
    step: 1,
    title: "Intake",
    subtitle: "Datos de propiedad y operacion",
    description: "Recopilamos informacion basica de tu propiedad, ubicacion, tipo de operacion y objetivos.",
    icon: ClipboardCheck,
  },
  {
    step: 2,
    title: "Evaluacion de Riesgo",
    subtitle: "Checklist + evidencia",
    description:
      "Analisis profesional de riesgos con checklists estandarizados, evidencia fotografica y diagnostico.",
    icon: FileSearch,
  },
  {
    step: 3,
    title: "Propuesta de Cobertura",
    subtitle: "Opciones personalizadas",
    description: "Presentamos opciones de cobertura adaptadas a tu perfil, con cotizaciones de aseguradoras aliadas.",
    icon: FileText,
  },
  {
    step: 4,
    title: "Emision / Onboarding",
    subtitle: "Activacion de poliza",
    description: "Gestionamos la emision de polizas, documentacion y alta en el sistema de administracion.",
    icon: Settings,
  },
  {
    step: 5,
    title: "Administracion Continua",
    subtitle: "Soporte en incidentes y siniestros",
    description:
      "Renovaciones, ajustes de cobertura, soporte 24/7 en incidentes y coordinacion de siniestros.",
    icon: HeadphonesIcon,
  },
]

const requirementsData = [
  { icon: MapPin, label: "Ubicacion y tipo de propiedad" },
  { icon: Ruler, label: "Superficie (m2), ano de construccion, materiales" },
  { icon: Users, label: "Ocupacion objetivo / PAX" },
  { icon: AlertTriangle, label: "Historial de siniestros (si existe)" },
  { icon: Camera, label: "Fotos e inventario basico" },
  { icon: UserCheck, label: "Staff, proveedores, frecuencia de limpieza" },
  { icon: CalendarDays, label: "Tipo de uso: vacacional, eventos, mixto" },
]

const faqData = [
  {
    q: "WEEK-INSURANCE es aseguradora?",
    a: "No. WEEK-INSURANCE es un servicio de coordinacion y administracion de seguros. Trabajamos en alianza con aseguradoras lideres para disenar, cotizar y gestionar coberturas adaptadas a propiedades hospitality.",
  },
  {
    q: "En que paises opera?",
    a: "Actualmente coordinamos coberturas en Mexico, con expansion planeada a Latinoamerica y Europa. Las coberturas dependen de la disponibilidad de aseguradoras en cada jurisdiccion.",
  },
  {
    q: "Que tipo de propiedades califican?",
    a: "Propiedades residenciales, departamentos, casas, villas, boutique hotels y desarrollos que operen dentro del ecosistema WEEK-WORLD o de forma independiente.",
  },
  {
    q: "Cuanto tarda una cotizacion?",
    a: "Con la informacion completa, entregamos propuestas de cobertura en un plazo estimado de 3 a 5 dias habiles, dependiendo de la complejidad de la propiedad.",
  },
  {
    q: "Que hago si hay un incidente?",
    a: "Contacta a nuestro equipo de soporte. Coordinamos la comunicacion con la aseguradora, gestion de evidencia y seguimiento del siniestro hasta su resolucion.",
  },
  {
    q: "Como se renuevan polizas?",
    a: "Administramos las renovaciones de forma proactiva. Recibes aviso previo con opciones de ajuste y te acompanamos en todo el proceso de actualizacion.",
  },
  {
    q: "Que informacion necesitan para cotizar?",
    a: "Ubicacion, tipo de propiedad, superficie, ano de construccion, materiales, ocupacion, historial de siniestros, fotos y datos de operacion. Cuanto mas completa la informacion, mas precisa la cotizacion.",
  },
]

const benefitsData = [
  {
    icon: ShieldCheck,
    title: "Reduce incertidumbre",
    description: "Identifica y mitiga riesgos antes de que se conviertan en perdidas.",
  },
  {
    icon: Sparkles,
    title: "Acelera onboarding",
    description: "Cumple requisitos de seguro rapidamente para operar dentro del ecosistema.",
  },
  {
    icon: LockKeyhole,
    title: "Minimiza perdidas",
    description: "Coberturas adecuadas que responden cuando mas lo necesitas.",
  },
  {
    icon: Users,
    title: "Mejora confianza",
    description: "Huespedes y socios operan con la tranquilidad de un respaldo profesional.",
  },
  {
    icon: BookOpen,
    title: "Estandariza criterios",
    description: "Protocolos uniformes de risk management para toda tu operacion.",
  },
  {
    icon: Search,
    title: "Trazabilidad documental",
    description: "Registro completo de polizas, incidentes, evidencias y auditorias.",
  },
]

export default async function WeekInsurancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-32">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-600/8 blur-3xl" />

        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 backdrop-blur-sm border border-sky-400/20 rounded-full px-6 py-2 mb-6">
            <Shield className="h-5 w-5 text-sky-400" />
            <span className="text-sm font-semibold text-sky-300">WEEK-INSURANCE</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
            Proteccion integral para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
              propiedades y operacion hospitality
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Coberturas, administracion de polizas y respuesta ante incidentes con estandares profesionales, en alianza
            con aseguradoras lideres.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contacto">
              <Button
                size="lg"
                className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold text-lg px-8 py-6 shadow-lg shadow-sky-500/20"
              >
                Solicitar evaluacion de riesgo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="#coberturas">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-500 text-white hover:bg-white/10 bg-transparent text-lg px-8 py-6"
              >
                Cotizar cobertura
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ===== QUE ES WEEK-INSURANCE ===== */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-sky-500/10 text-sky-700 border-sky-500/30 px-4 py-1.5">
              Coordinacion & Administracion
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Que es WEEK-INSURANCE
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un servicio integral de gestion de riesgo y administracion de seguros para el ecosistema hospitality.
              No somos aseguradora: coordinamos con partners para proteger tu operacion.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileSearch,
                text: "Evaluacion de riesgo por propiedad",
              },
              {
                icon: ClipboardCheck,
                text: "Recomendacion de coberturas personalizadas",
              },
              {
                icon: Settings,
                text: "Administracion de polizas y renovaciones",
              },
              {
                icon: HeadphonesIcon,
                text: "Gestion de incidentes y siniestros (coordinacion)",
              },
              {
                icon: Shield,
                text: "Requisitos para onboarding (checklist compliance/risk)",
              },
              {
                icon: Building2,
                text: "Alianza con aseguradoras lideres (ej. Chubb Mexico)",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl glass-card hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-sky-600" />
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed pt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUE CUBRE / QUE PROTEGE ===== */}
      <section id="coberturas" className="py-20 md:py-28 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-sky-500/10 text-sky-300 border-sky-500/30 px-4 py-1.5">
              Categorias de Cobertura
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Que cubre, que protege
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Categorias de proteccion adaptadas a las necesidades de propiedades y operaciones hospitality.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coverageCategories.map((cat, i) => (
              <Card
                key={i}
                className={`bg-slate-800/50 backdrop-blur-sm border ${cat.borderColor} hover:border-opacity-60 transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center mb-4`}>
                    <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{cat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200/80 leading-relaxed">
                Las coberturas, condiciones y exclusiones dependen de la aseguradora, pais, tipo de poliza y
                evaluacion de riesgo individual. WEEK-INSURANCE coordina y administra; la emision de polizas
                corresponde a las aseguradoras aliadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA (PROCESO) ===== */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-teal-500/10 text-teal-700 border-teal-500/30 px-4 py-1.5">
              Proceso
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un flujo claro en 5 pasos, desde la evaluacion inicial hasta la administracion continua.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-sky-500/40 via-teal-500/40 to-sky-500/40 hidden md:block" />
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-sky-500/40 via-teal-500/40 to-sky-500/40 md:hidden" />

            <div className="space-y-8 md:space-y-12">
              {processSteps.map((step, i) => (
                <div key={i} className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Step number circle */}
                  <div className="flex-shrink-0 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20 md:absolute md:left-1/2 md:-translate-x-1/2">
                    {step.step}
                  </div>

                  {/* Content card */}
                  <div className={`flex-1 glass-card rounded-xl p-6 ml-0 ${i % 2 === 0 ? "md:mr-[calc(50%+2rem)] md:ml-0" : "md:ml-[calc(50%+2rem)] md:mr-0"}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="h-5 w-5 text-sky-600" />
                      <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">{step.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== REQUISITOS DE INFORMACION ===== */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-300 border-cyan-500/30 px-4 py-1.5">
              Para cotizar rapido
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Requisitos de informacion
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Ten a la mano estos datos para agilizar tu evaluacion y cotizacion.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {requirementsData.map((req, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-sky-500/30 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <req.icon className="h-5 w-5 text-sky-400" />
                </div>
                <p className="text-sm font-medium text-slate-200">{req.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a href="#contacto">
              <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold px-8 py-3 shadow-lg shadow-sky-500/20">
                <Upload className="mr-2 h-4 w-4" />
                Iniciar cotizacion
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ===== BENEFICIOS ===== */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-teal-500/10 text-teal-700 border-teal-500/30 px-4 py-1.5">
              Ventajas
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que importa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proteger tu operacion no es un costo, es una inversion en continuidad y confianza.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefitsData.map((benefit, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/10 to-teal-500/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RISK & COMPLIANCE ===== */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/30 px-4 py-1.5">
              <LockKeyhole className="h-4 w-4 mr-1" />
              Risk & Compliance
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prevencion, estandares y trazabilidad
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Nuestro enfoque va mas alla de la poliza: construimos cultura de prevencion y documentacion.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: ClipboardCheck,
                title: "Checklists estandarizados",
                desc: "Evaluaciones sistematicas de riesgo basadas en mejores practicas de la industria hospitality.",
              },
              {
                icon: BookOpen,
                title: "Protocolos operativos",
                desc: "Guias de prevencion, respuesta a incidentes y procedimientos de emergencia documentados.",
              },
              {
                icon: Camera,
                title: "Evidencia y registro",
                desc: "Documentacion fotografica, reportes de inspeccion y registros de mantenimiento trazables.",
              },
              {
                icon: Search,
                title: "Auditorias periodicas",
                desc: "Revisiones programadas de cumplimiento, estado de coberturas y actualizacion de condiciones.",
              },
            ].map((item, i) => (
              <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/15 hover:border-blue-500/30 transition-colors">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-sky-500/10 text-sky-700 border-sky-500/30 px-4 py-1.5">
              <HelpCircle className="h-4 w-4 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <details
                key={i}
                className="group glass-card rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 text-foreground font-semibold text-sm hover:bg-sky-50/50 transition-colors list-none">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL + FORM ===== */}
      <section id="contacto" className="py-20 md:py-28 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-sky-500/10 text-sky-300 border-sky-500/30 px-4 py-1.5">
              Comienza ahora
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Solicita tu evaluacion de riesgo
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Completa el formulario y nuestro equipo te contactara para iniciar el proceso de cotizacion.
            </p>
          </div>

          <InsuranceContactForm />
        </div>
      </section>

      {/* ===== DISCLAIMER FINAL ===== */}
      <section className="py-6 px-6 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto max-w-4xl">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            WEEK-INSURANCE es un servicio de coordinacion y administracion de seguros. No es aseguradora ni
            intermediario regulado. Las polizas son emitidas por aseguradoras aliadas autorizadas en cada
            jurisdiccion. Las coberturas, primas, deducibles y condiciones dependen de la evaluacion de riesgo,
            aseguradora y pais. No se garantiza aprobacion ni cobertura total.
          </p>
        </div>
      </section>
    </div>
  )
}
