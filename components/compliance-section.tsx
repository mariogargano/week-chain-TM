"use client"
import { Globe, ShieldCheck, MapPin } from "lucide-react"

export function ComplianceSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 to-[#C7CEEA]/10 px-4 sm:px-6 py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl relative z-10 px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full glass border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
            <Globe className="h-4 w-4 text-slate-500" />
            Cumplimiento Global
          </div>
          <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Roadmap de Expansión y Compliance (Compliance‑ready)
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Nuestra arquitectura está diseñada para operar en múltiples jurisdicciones mediante acuerdos locales y condiciones por destino. Integramos flujos de verificación (KYC) y trazabilidad documental para adaptarnos a distintos marcos normativos conforme expandimos la red.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="glass p-6 rounded-2xl border border-slate-200/50 hover:shadow-md transition-shadow">
            <ShieldCheck className="h-8 w-8 text-[#C7CEEA] mb-4" />
            <h3 className="font-bold text-lg mb-2">Verificación KYC</h3>
            <p className="text-sm text-slate-600">Procesamiento de identidad ajustado a estándares de prevención de riesgo integrados directamente a nivel blockchain.</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-slate-200/50 hover:shadow-md transition-shadow">
            <MapPin className="h-8 w-8 text-[#FF9AA2] mb-4" />
            <h3 className="font-bold text-lg mb-2">Acuerdos Locales</h3>
            <p className="text-sm text-slate-600">Adaptabilidad a las regulaciones específicas y marcos normativos de cada nuevo país donde unimos propiedades.</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-slate-200/50 hover:shadow-md transition-shadow">
            <Globe className="h-8 w-8 text-[#B5EAD7] mb-4" />
            <h3 className="font-bold text-lg mb-2">Trazabilidad Documental</h3>
            <p className="text-sm text-slate-600">Generación de documentación compatible con lineamientos internacionales que certifican el derecho personal de uso.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
