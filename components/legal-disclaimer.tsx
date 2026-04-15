"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { LEGAL_COPY } from "@/lib/constants/legal-copy";
import Link from "next/link";

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
            <p className="text-xs text-slate-300 leading-relaxed mb-2">{LEGAL_COPY?.SVC_SHORT}</p>
            <Link href="/terms" className="text-xs text-blue-400 underline hover:text-blue-300">
              Consulta terminos y condiciones completos
            </Link>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            }}
            aria-label="Cerrar aviso legal"
          >
            <X style={{ width: '24px', height: '24px', color: '#ffffff' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LegalDisclaimerInline() {
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-center">
      <p className="text-xs text-slate-600 leading-relaxed">{LEGAL_COPY?.SVC_FULL}</p>
    </div>
  );
}
