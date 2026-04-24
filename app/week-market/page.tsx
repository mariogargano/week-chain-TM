import type { Metadata } from "next"
import { ArrowLeftRight, Users, Calendar, Shield, TrendingUp, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "WEEK-Market - Coordinación Interna | WEEK-CHAIN",
  description: "Sistema de coordinación de uso temporal entre titulares de Smart Vacational Certificates WEEK-CHAIN",
}

export default function WeekMarketPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9AA2]/10 to-[#FFB7B2]/10 rounded-full mb-6">
              <ArrowLeftRight className="w-5 h-5 text-[#FF9AA2]" />
              <span className="text-sm font-medium text-[#FF9AA2]">Coordinación Interna</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              WEEK-<span className="text-[#FF9AA2]">Market</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Sistema de coordinación de solicitudes de uso temporal entre titulares de Smart Vacational Certificates
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Comunidad Verificada</h3>
              <p className="text-slate-600">
                Coordina solicitudes de uso solo con otros titulares verificados de Smart Vacational Certificates
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Coordinación Flexible</h3>
              <p className="text-slate-600">
                Coordina solicitudes de uso temporal según preferencias de fechas y destinos (sujeto a disponibilidad)
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Coordinación Verificada</h3>
              <p className="text-slate-600">
                Todas las coordinaciones están registradas y verificadas por la plataforma WEEK-CHAIN
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Optimiza tu Uso</h3>
              <p className="text-slate-600">
                Coordina solicitudes estratégicamente para optimizar el uso de tu Smart Vacational Certificate
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sistema Simplificado</h3>
              <p className="text-slate-600">
                Sistema de coordinación directa entre titulares con proceso simplificado y transparente
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-4">
                <ArrowLeftRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Interfaz Intuitiva</h3>
              <p className="text-slate-600">
                Plataforma fácil de usar para publicar y encontrar oportunidades de coordinación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">¿Cómo Funciona?</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Publica tus Preferencias</h3>
                <p className="text-slate-600">
                  Indica tus preferencias de uso temporal con detalles de destinos y fechas de interés (sujeto a
                  disponibilidad)
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Explora Oportunidades</h3>
                <p className="text-slate-600">
                  Explora las preferencias de otros titulares y encuentra oportunidades de coordinación compatibles
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Coordina con Titulares</h3>
                <p className="text-slate-600">
                  Contacta con otros titulares verificados y coordina los detalles de uso temporal (sujeto a aprobación
                  de WEEK-CHAIN)
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Solicita Uso Coordinado</h3>
                <p className="text-slate-600">
                  Una vez coordinado, envía tu solicitud de uso temporal a través del sistema WEEK-CHAIN para aprobación
                  según disponibilidad
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-6 bg-amber-50">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl p-8 border-2 border-amber-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-600" />
              Aviso Importante
            </h3>
            <div className="text-sm text-slate-600 space-y-3">
              <p>
                WEEK-Market es un sistema de coordinación interna entre titulares de Smart Vacational Certificates. NO
                constituye un marketplace de compra-venta ni intercambio de propiedades.
              </p>
              <p>
                La coordinación entre titulares NO garantiza la aprobación de solicitudes de uso temporal. Todas las
                solicitudes están sujetas a disponibilidad del sistema WEEK-CHAIN y a las políticas de uso establecidas.
              </p>
              <p>
                Los Smart Vacational Certificates NO asignan destinos, fechas ni propiedades específicas. Son derechos
                de solicitud de uso temporal sujetos a disponibilidad y aprobación.
              </p>
              <p>
                Este servicio NO genera expectativa de ganancia, rendimiento ni valorización. Es exclusivamente una
                herramienta de coordinación administrativa entre titulares verificados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Próximamente Disponible</h2>
            <p className="text-xl mb-8 text-white/90">
              WEEK-Market estará disponible para titulares verificados en Q2 2026
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">En Desarrollo - Fase 1: Q2 2026</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
