"use client"

import { AlertTriangle } from "lucide-react"
import { LEGAL_COPY } from "@/lib/constants/legal-copy"

export function ConsolidatedLegalDisclaimer({ variant = "default" }: { variant?: "default" | "compact" | "inline" }) {
  if (variant === "compact") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Aviso:</strong> {LEGAL_COPY.SVC_SHORT}
        </p>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <p className="text-xs text-slate-600 leading-relaxed">
        <strong>Aviso Legal:</strong> {LEGAL_COPY.SVC_FULL}
      </p>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-bold text-white">Aviso Legal Obligatorio - Smart Vacational Certificate (SVC)</h3>

          <div className="space-y-2 text-sm text-slate-300">
            <p>
              <strong className="text-white">Naturaleza del Servicio:</strong> WEEK-CHAIN opera un sistema de
              certificados digitales que otorgan al titular derechos personales, intransferibles y temporales de
              solicitud de uso vacacional por un máximo de 15 años, sujetos a disponibilidad operativa del sistema y
              aprobación administrativa.
            </p>

            <p>
              <strong className="text-white">Lo que NO es el SVC:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              {LEGAL_COPY.SVC_NOT_LIST.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <p>
              <strong className="text-white">Flujo de Solicitud:</strong> {LEGAL_COPY.PROCESS_FLOW} -{" "}
              {LEGAL_COPY.PROCESS_EXPLANATION}
            </p>

            <p>
              <strong className="text-white">Normativa Aplicable:</strong> Operación conforme a legislación mexicana de
              protección al consumidor (NOM-029-SE-2021, NOM-151-SCFI-2016), contratos de adhesión registrados ante
              PROFECO. Esta documentación legal NO constituye aval de PROFECO sobre el modelo de negocio ni garantiza
              resultados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
