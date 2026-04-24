"use client"

import { useState } from "react"
import { X, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function ComplianceBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm md:text-base font-medium">
            <span className="font-bold">WEEK-CHAIN:</span> The first platform adapted to new global tourism laws.{" "}
            <Link href="/compliance" className="underline hover:text-emerald-400 transition-colors font-semibold">
              Learn More
            </Link>
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
