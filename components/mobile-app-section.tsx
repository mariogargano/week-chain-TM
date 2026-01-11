"use client"
import { Smartphone, Calendar } from "lucide-react"
import Image from "next/image"

export function MobileAppSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-32 md:py-40 overflow-hidden">
      <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-[#FF9AA2]/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[#C7CEEA]/20 blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
              <Smartphone className="h-4 w-4 text-[#FF9AA2]" />
              Próximamente
            </div>

            <h2 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              La App WEEK-CHAIN
              <br />
              <span className="bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] bg-clip-text text-transparent">
                Está Llegando
              </span>
            </h2>

            <p className="mb-8 text-xl md:text-2xl text-slate-300 leading-relaxed font-medium max-w-xl">
              Gestiona tus certificados de acceso vacacional, explora nuevas oportunidades y controla tus solicitudes
              desde cualquier lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                disabled
                className="min-w-[200px] h-16 rounded-2xl transition-all duration-300 cursor-not-allowed opacity-60 hover:opacity-70"
              >
                <img src="/images/app-store-badge.svg" alt="Descargar en App Store" className="h-16 w-auto" />
              </button>
              <button
                disabled
                className="min-w-[200px] h-16 rounded-2xl transition-all duration-300 cursor-not-allowed opacity-60 hover:opacity-70"
              >
                <img src="/images/google-play-badge.svg" alt="Disponible en Google Play" className="h-16 w-auto" />
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative mx-auto max-w-[400px] lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] blur-3xl opacity-40 animate-pulse" />
              <div className="relative z-10 mx-auto w-[320px] lg:w-[380px]">
                <div className="relative rounded-[3rem] bg-slate-900 p-3 shadow-2xl border-8 border-slate-800">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-20" />
                  <div className="relative rounded-[2.5rem] overflow-hidden bg-white aspect-[9/19.5]">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 overflow-y-auto">
                      {/* Header */}
                      <div className="px-5 pt-8 pb-4">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-white font-bold text-lg">Mis Certificados</h3>
                            <p className="text-white/60 text-xs">Gestiona tus accesos</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF9AA2] to-[#C7CEEA] flex items-center justify-center text-white font-bold text-sm">
                            WC
                          </div>
                        </div>

                        {/* Certificate Count */}
                        <div className="rounded-2xl bg-gradient-to-br from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] p-4 mb-4">
                          <p className="text-white/80 text-xs mb-1">Certificados Activos</p>
                          <p className="text-white font-bold text-2xl">3 Certificados</p>
                        </div>
                      </div>

                      {/* Mis Solicitudes */}
                      <div className="px-5 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-semibold text-sm">Mis Solicitudes</span>
                          <span className="text-[#FF9AA2] text-[10px] font-medium">Ver todas</span>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-emerald-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-xs truncate">Semana #2412</p>
                                <p className="text-white/60 text-[10px]">15-22 Dic 2024</p>
                              </div>
                              <span className="text-emerald-400 text-[10px] font-bold">Activa</span>
                            </div>
                          </div>
                          <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-blue-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-xs truncate">Semana #1523</p>
                                <p className="text-white/60 text-[10px]">10-17 Jul 2025</p>
                              </div>
                              <span className="text-blue-400 text-[10px] font-bold">Reservada</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mis Destinos */}
                      <div className="px-5 pb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-semibold text-sm">Mis Destinos</span>
                          <span className="text-[#FF9AA2] text-[10px] font-medium">Ver todos</span>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src="/luxury-villa-cancun.jpg"
                                  alt="Villa Coral"
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-xs truncate">Villa Coral</p>
                                <p className="text-white/60 text-[10px]">Cancún • Silver</p>
                                <p className="text-[#FF9AA2] text-[10px] font-bold">1 semana/año</p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src="/modern-suite-los-cabos.jpg"
                                  alt="Suite Paraíso"
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-xs truncate">Suite Paraíso</p>
                                <p className="text-white/60 text-[10px]">Los Cabos • Gold</p>
                                <p className="text-[#FF9AA2] text-[10px] font-bold">1 semana/año flex</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
