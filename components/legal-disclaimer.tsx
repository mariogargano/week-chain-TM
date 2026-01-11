"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LEGAL_COPY } from "@/lib/constants/legal-copy"

export function LegalDisclaimer() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium mb-1">Aviso Legal Importante</p>
            <p className="text-xs text-slate-300 leading-relaxed">{LEGAL_COPY.SVC_FULL}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function LegalDisclaimerInline() {
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-center">
      <p className="text-xs text-slate-600 leading-relaxed">{LEGAL_COPY.SVC_FULL}</p>
    </div>
  )
}
