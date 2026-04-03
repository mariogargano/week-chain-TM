"use client"
import { CalendarCheck, Link2, FileCheck, CircleDollarSign } from "lucide-react"

export function CertificateFeaturesSection() {
  return (
    <section className="bg-white px-4 sm:px-6 py-16 sm:py-24 border-y border-slate-100">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Características del Certificado (SVC)
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Todo Smart Vacational Certificate asegura tus derechos bajo formatos 100% legales, transparentes y libres de compromisos forzosos.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF9AA2]/10 text-[#FF9AA2]">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Derecho de uso anual</h3>
              <p className="text-slate-600 leading-relaxed">
                (sujeto a disponibilidad y confirmación)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#B5EAD7]/10 text-[#B5EAD7]">
              <Link2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Registro de integridad y verificación en blockchain</h3>
              <p className="text-slate-600 leading-relaxed">
                (para trazabilidad del certificado)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C7CEEA]/10 text-[#C7CEEA]">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Evidencia Digital</h3>
              <p className="text-slate-600 leading-relaxed">
                Sistema preparado para cumplimiento documental y evidencia digital.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFB7B2]/10 text-[#FFB7B2]">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Política de Modelo Simplificado</h3>
              <p className="text-slate-600 leading-relaxed">
                Sin cuotas de mantenimiento recurrentes. Cargos de terceros (por ejemplo, impuestos turísticos, depósitos o fees locales) se informan antes de confirmar en la oferta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
