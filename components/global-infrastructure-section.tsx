"use client"

import Link from "next/link"
import { Shield, FileCheck, Users, Lock, CheckCircle } from "lucide-react"

export function GlobalInfrastructureSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-full px-6 py-2 mb-6">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Cumplimiento Global</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Infraestructura para Turismo <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Globalmente Conforme
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Construido para la nueva realidad legislativa del sector turístico
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Europa Card */}
          <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-400/20 rounded-2xl p-6 hover:border-blue-400/40 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xl font-bold text-white">Europa</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Conforme con regulaciones de la UE, GDPR y directivas de protección al consumidor
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>27 países activos</span>
            </div>
          </div>

          {/* Américas Card */}
          <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm border border-emerald-400/20 rounded-2xl p-6 hover:border-emerald-400/40 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xl font-bold text-white">Américas</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Certificaciones NOM-151, PROFECO y compliance con regulaciones de México y USA
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>12 países activos</span>
            </div>
          </div>

          {/* Asia Card */}
          <div className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-400/20 rounded-2xl p-6 hover:border-purple-400/40 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xl font-bold text-white">Asia</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Adaptado a regulaciones de países asiáticos emergentes en turismo de lujo
            </p>
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>8 países activos</span>
            </div>
          </div>
        </div>

        {/* Content Block */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
              Certificados Vacacionales Inteligentes (SVC) para la Economía Turística Moderna
            </h3>

            <p className="text-lg text-slate-300 leading-relaxed mb-10">
              WEEK-CHAIN resuelve desafíos legislativos en Europa, Asia y las Américas con un enfoque innovador hacia la
              propiedad vacacional y el intercambio. Nuestra plataforma transforma requisitos regulatorios complejos en
              experiencias de usuario fluidas.
            </p>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-sm border border-blue-400/20 rounded-xl p-6">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="font-bold text-white mb-2">Derechos de Uso Gestionados</h4>
                <p className="text-slate-400 text-sm">
                  Sin transferencia de propiedad, sin complicaciones de tiempo compartido. Solo acceso vacacional
                  flexible y legalmente conforme.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-sm border border-emerald-400/20 rounded-xl p-6">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white mb-2">Verificación de Identidad en Tiempo Real</h4>
                <p className="text-slate-400 text-sm">
                  Evidencia digital conforme a NOM-151 y verificaciones KYC/AML integradas en cada punto de transacción.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm border border-purple-400/20 rounded-xl p-6">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="font-bold text-white mb-2">Reportes Regulatorios Centralizados</h4>
                <p className="text-slate-400 text-sm">
                  Gestión automatizada de licencias y reportes de cumplimiento en todas las jurisdicciones donde
                  operamos.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/compliance"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Shield className="h-5 w-5" />
                Conoce Nuestro Marco de Cumplimiento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
