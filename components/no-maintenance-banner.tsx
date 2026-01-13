"use client"

import { motion } from "framer-motion"
import { Sparkles, Home, Shield, CheckCircle2, Zap, Users } from "lucide-react"

export function NoMaintenanceBanner() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-12 sm:py-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span>POLÍTICA WEEK-CHAIN</span>
          </div>

          {/* Main heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">$0</span>{" "}
            Cuotas de Mantenimiento
          </h2>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Por política, WEEK-CHAIN retiene <strong className="text-emerald-400">capacidad operativa</strong> de los
            alojamientos participantes para garantizar una{" "}
            <strong className="text-white">experiencia sin fricción</strong> y para{" "}
            <strong className="text-white">mantener el ecosistema</strong>.
          </p>
        </motion.div>

        {/* How it works card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-xl border border-white/10 p-6 sm:p-8 max-w-4xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left side - explanation */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">¿Por qué $0 Gastos Extra?</h3>
              </div>

              <p className="text-slate-300 leading-relaxed">
                La <strong className="text-emerald-400">capacidad operativa retenida</strong> se destina a dos
                propósitos fundamentales:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Purpose 1: Coverage */}
                <div className="p-4 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-emerald-400">Cobertura de Gastos</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Seguros de alojamientos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Mantenimiento preventivo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Limpieza profesional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Reparaciones y mejoras</span>
                    </li>
                  </ul>
                </div>

                {/* Purpose 2: Ecosystem */}
                <div className="p-4 rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-400/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-400" />
                    </div>
                    <h4 className="font-bold text-blue-400">Mantener Ecosistema</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      <span>Desarrollo de plataforma</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      <span>Soporte al cliente 24/7</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      <span>Alianzas estratégicas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      <span>Mejoras continuas</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-400">
                <p className="text-sm font-medium text-center">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  Resultado: <strong className="text-white">Experiencia sin fricción</strong> durante la vigencia de tu
                  certificado
                </p>
              </div>
            </div>

            {/* Right side - visual */}
            <div className="flex-1 w-full max-w-sm">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-2xl border border-white/10">
                <div className="text-center mb-6">
                  <div className="text-sm text-slate-400 mb-1">Modelo de Certificados</div>
                  <div className="text-3xl font-bold">Sistema de Solicitudes</div>
                </div>

                <div className="space-y-4">
                  {/* Certificate holders */}
                  <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-emerald-400 font-semibold">Titulares de Certificados</span>
                      <span className="text-2xl font-bold text-emerald-400">✓</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Solicitan uso según disponibilidad</p>
                  </div>

                  {/* Operational capacity */}
                  <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-amber-400 font-semibold">Capacidad Retenida</span>
                      <span className="text-2xl font-bold text-amber-400">✓</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Gastos operativos + Ecosistema</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                  <div className="inline-flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Tú: $0 cuotas extras</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
        >
          {/* Traditional */}
          

          {/* WEEK-CHAIN */}
          <div className="bg-emerald-500/10 backdrop-blur-sm border-2 border-emerald-400/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <h4 className="font-bold text-emerald-400">WEEK-CHAIN</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>
                  <strong className="text-white">$0 cuotas y $0 gastos extra</strong> durante vigencia
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Capacidad retenida cubre operación + ecosistema</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Experiencia sin fricción para titulares</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
