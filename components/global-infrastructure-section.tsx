"use client"

import Link from "next/link"
import { Shield, FileCheck, Users, Lock, CheckCircle } from "lucide-react"

export function GlobalInfrastructureSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2.5 mb-6 shadow-lg shadow-blue-500/10">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Marco Regulatorio</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Infraestructura Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 animate-gradient">
              Orientada al Cumplimiento
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Disenada para operar conforme a normativas del sector turistico
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Mexico Card */}
          <div className="group relative bg-gradient-to-br from-slate-800/50 to-emerald-900/50 backdrop-blur-xl border border-emerald-400/30 rounded-2xl p-8 hover:border-emerald-400/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-2xl font-bold text-white">Mexico</span>
            </div>
            <p className="text-slate-300 text-base mb-6 leading-relaxed">
              Operacion principal conforme a NOM-151 y normativa mexicana aplicable
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Mercado principal</span>
            </div>
          </div>

          {/* Proteccion de Datos */}
          <div className="group relative bg-gradient-to-br from-slate-800/50 to-blue-900/50 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-8 hover:border-blue-400/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
              <span className="text-2xl font-bold text-white">Proteccion de Datos</span>
            </div>
            <p className="text-slate-300 text-base mb-6 leading-relaxed">
              Tratamiento de datos conforme a LFPDPPP y mejores practicas de privacidad
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Aviso de privacidad</span>
            </div>
          </div>

          {/* Documentacion Legal */}
          <div className="group relative bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-8 hover:border-purple-400/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse shadow-lg shadow-purple-500/50" />
              <span className="text-2xl font-bold text-white">Documentacion</span>
            </div>
            <p className="text-slate-300 text-base mb-6 leading-relaxed">
              Contratos claros y terminos de servicio disponibles antes de contratar
            </p>
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Terminos transparentes</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
              Smart Vacational Certificates (SVC)
            </h3>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-12">
              WEEK-CHAIN ofrece certificados digitales de derecho de uso vacacional, disenados para operar conforme a la normativa mexicana. El SVC NO constituye propiedad inmobiliaria, tiempo compartido tradicional ni instrumento de inversion. <a href="/terms" className="text-blue-400 underline hover:text-blue-300">Consulta terminos completos.</a>
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-400/20 rounded-2xl p-8 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <FileCheck className="h-7 w-7 text-blue-400" />
                </div>
                <h4 className="font-bold text-white text-lg mb-3">Derecho Personal de Uso</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Certificado de servicio vacacional. NO es propiedad inmobiliaria ni tiempo compartido tradicional.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm border border-emerald-400/20 rounded-2xl p-8 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <Users className="h-7 w-7 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white text-lg mb-3">Verificacion de Identidad</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Proceso KYC integrado y documentacion digital conforme a NOM-151 para conservacion de mensajes de datos.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-400/20 rounded-2xl p-8 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                  <Lock className="h-7 w-7 text-purple-400" />
                </div>
                <h4 className="font-bold text-white text-lg mb-3">Terminos Claros</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Contrato y condiciones disponibles antes de contratar. Proceso REQUEST → OFFER → CONFIRM sin garantias de aprobacion.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/compliance"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-lg px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                <Shield className="h-6 w-6" />
                Conoce Nuestro Marco de Cumplimiento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
