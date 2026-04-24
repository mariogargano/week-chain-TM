import { ShieldCheck } from "lucide-react"

export function FooterTrustSignal() {
  return (
    <div className="flex items-start gap-3 text-slate-400">
      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
      </div>
      <div>
        <p className="text-xs leading-relaxed">
          <span className="font-semibold text-slate-300">WEEK-CHAIN:</span> Pioneer in Globally Compliant Vacation
          Services.{" "}
          <span className="text-slate-500">Designed for the new legislative reality of the tourism sector.</span>
        </p>
      </div>
    </div>
  )
}
