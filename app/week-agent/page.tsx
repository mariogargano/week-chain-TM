"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Users, Globe, DollarSign, CheckCircle2, Shield, Clock, Award, Sparkles, ArrowRight } from "lucide-react"

export default function WeekAgentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section with CTA */}
      <section className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm font-semibold px-6 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Programa Exclusivo WEEK-Agent
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="text-white">Obtén </span>
              <span className="text-amber-400">4%</span>
              <span className="text-white"> de Honorarios</span>
              <br />
              <span className="text-white">por Cada Venta Efectiva</span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Únete al programa de intermediación de WEEK-CHAIN y obtén 4% de honorarios por cada referido directo que
              compre un certificado vacacional. Sistema simple y transparente sin niveles.
            </p>

            <div className="pt-8 flex justify-center">
              <a
                href="/auth"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "24px 64px",
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#0f172a",
                  backgroundColor: "#f59e0b",
                  borderRadius: "16px",
                  border: "4px solid #fcd34d",
                  boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.6)",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                APLICAR AHORA
                <ArrowRight style={{ width: "32px", height: "32px" }} />
              </a>
            </div>
            {/* FIN BOTON */}

            {/* Security indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 pt-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Proceso 100% seguro</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Respuesta en 24-48 horas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">¿Por qué unirte a WEEK-Agent?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Forma parte del ecosistema de intermediación vacacional más innovador
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: "4% de Comisión",
                description: "Honorarios fijos por cada venta efectiva de certificados vacacionales",
                color: "text-amber-500",
              },
              {
                icon: Globe,
                title: "Alcance Global",
                description: "Acceso a destinos en México, Caribe y Latinoamérica",
                color: "text-blue-500",
              },
              {
                icon: Users,
                title: "Sistema de Referidos",
                description: "Construye tu red y genera ingresos pasivos",
                color: "text-emerald-500",
              },
              {
                icon: Shield,
                title: "100% Transparente",
                description: "Sin cuotas ocultas ni comisiones variables",
                color: "text-purple-500",
              },
              {
                icon: Clock,
                title: "Pagos Rápidos",
                description: "Recibe tus honorarios de forma ágil y segura",
                color: "text-rose-500",
              },
              {
                icon: Award,
                title: "Soporte Dedicado",
                description: "Equipo profesional disponible 24/7 para ti",
                color: "text-cyan-500",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-400"
              >
                <benefit.icon className={`w-12 h-12 ${benefit.color} mb-4`} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-20 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Cómo Funciona</h2>
            <p className="text-xl text-slate-600">Proceso simple en 3 pasos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Regístrate", description: "Completa tu aplicación y verifica tu identidad" },
              { step: "2", title: "Recibe Capacitación", description: "Accede a materiales y herramientas de venta" },
              { step: "3", title: "Comienza a Ganar", description: "Facilita ventas y recibe tu 4% de honorarios" },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-amber-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Requisitos</h2>
          </div>

          <Card className="p-8 bg-gradient-to-br from-white to-slate-50 border-2">
            <div className="space-y-4">
              {[
                "Ser mayor de 18 años",
                "Tener identificación oficial vigente",
                "Completar proceso KYC (Know Your Customer)",
                "Aceptar términos y condiciones del programa",
                "Contar con disponibilidad para atención a clientes",
              ].map((req, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-lg text-slate-700">{req}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para ser WEEK-Agent?</h2>
          <p className="text-xl text-slate-300 mb-10">Únete a cientos de agentes exitosos en toda Latinoamérica</p>

          <div className="flex justify-center">
            <a
              href="/auth"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "20px 48px",
                fontSize: "20px",
                fontWeight: "800",
                color: "#0f172a",
                backgroundColor: "#f59e0b",
                borderRadius: "12px",
                border: "3px solid #fcd34d",
                boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.5)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              COMENZAR AHORA
              <ArrowRight style={{ width: "24px", height: "24px" }} />
            </a>
          </div>
          {/* FIN BOTON */}
        </div>
      </section>
    </div>
  )
}
