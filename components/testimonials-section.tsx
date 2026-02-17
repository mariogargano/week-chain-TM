"use client"
import { TrendingUp, DollarSign, Briefcase } from "lucide-react"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import Image from "next/image"

export function TestimonialsSection() {
  return (
    <section className="relative bg-gradient-to-br from-white via-[#C7CEEA]/10 to-[#FFECD2]/20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-[#C7CEEA]/30 blur-3xl" />
      <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-[#FFECD2]/40 blur-3xl" />

      <ContainerScroll
        titleComponent={
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Controla tu Imperio
              <br />
              <span className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] bg-clip-text text-transparent">
                desde un Solo Panel
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Dashboard completo diseñado para brokers profesionales. Monitorea ventas en tiempo real, gestiona tu red
              de referidos y visualiza tu progreso hacia el Broker Retirement Bonus.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              <div className="bg-white/80 rounded-xl p-4 border border-[#FF9AA2]/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[#FF9AA2]/10">
                    <TrendingUp className="h-5 w-5 text-[#FF9AA2]" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Ventas en Tiempo Real</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Visualiza todas tus ventas, leads y conversiones actualizadas al instante
                </p>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-[#C7CEEA]/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[#C7CEEA]/10">
                    <DollarSign className="h-5 w-5 text-[#C7CEEA]" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Hasta el 6% en Comisión</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Rastrea tus comisiones directas, de red y bonos especiales automáticamente
                </p>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Retirement Tracker</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Visualiza tu progreso hacia el Broker Retirement Bonus en cada propiedad
                </p>
              </div>
            </div>
          </div>
        }
      >
        <div className="mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 h-full min-h-[500px] relative">
          <Image
            src="/images/design-mode/ChatGPT%20Image%2010%20nov%202025%2C%2010_23_35%20a.m..png"
            alt="Dashboard WEEK-CHAIN para Brokers - Monitorea ventas, comisiones y tu Retirement Bonus"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
      </ContainerScroll>
    </section>
  )
}
