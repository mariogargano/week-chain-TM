"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Gift, Share2, TrendingUp } from "lucide-react"
import { VisitorReferralWidget } from "@/components/visitor-referral-widget"

export function ReferralCTASection() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Sección CTA simplificada */}
      <section
        className="bg-gradient-to-br from-[#FF9AA2]/20 via-[#FFB7B2]/10 to-[#C7CEEA]/20 px-6 py-20"
        data-referral-widget
      >
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass border border-[#FF9AA2]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
            <Gift className="h-4 w-4 text-[#FF9AA2]" />
            Programa de Referidos Universal
          </div>

          <h2 className="mb-6 text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">Refiere y Gana</h2>

          <p className="mb-10 text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Comparte WEEK-CHAIN y construye tu red. Gana{" "}
            <span className="font-bold text-[#FF9AA2]">3% directo + 2% nivel 2 + 1% nivel 3</span> en comisiones.
            Alcanza Elite status vendiendo 24 semanas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="min-w-[280px] bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:from-[#ff8a92] hover:via-[#ffa7a2] hover:to-[#b7beda] text-white text-base font-semibold h-14 rounded-xl shadow-lg shadow-[#FF9AA2]/25 hover:shadow-xl hover:shadow-[#FF9AA2]/30 transition-all duration-300 hover:scale-105"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Generar Mi Link de Referido
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
            {[
              { value: "3%", label: "Nivel 1 Directo", color: "#FF9AA2" },
              { value: "2%", label: "Nivel 2", color: "#FFB7B2" },
              { value: "1%", label: "Nivel 3", color: "#C7CEEA" },
              { value: "24", label: "Semanas → Elite", color: "#B5EAD7" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl glass border-2 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                style={{ borderTopColor: stat.color, borderTopWidth: "3px" }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#FFB7B2]/20 to-[#C7CEEA]/20 border-2 border-[#FFB7B2]/30 p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-[#FF9AA2]" />
              <h3 className="text-2xl font-bold text-slate-900">Beneficios Elite</h3>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B5EAD7]/30 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#B5EAD7]">✓</span>
                </div>
                <p className="text-slate-700">
                  <strong>24 semanas vendidas:</strong> Elite status + 1 semana de recompensa (50% propiedad)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C7CEEA]/30 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#C7CEEA]">✓</span>
                </div>
                <p className="text-slate-700">
                  <strong>48 semanas vendidas:</strong> 2 semanas de recompensa (úsalas o réntalas)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dialog con el widget completo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <VisitorReferralWidget />
        </DialogContent>
      </Dialog>
    </>
  )
}
