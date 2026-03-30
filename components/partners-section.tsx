"use client"

import { useEffect, useRef } from "react"

const partners = [
  { name: "Solana", initials: "SOL", bg: "bg-gradient-to-br from-purple-600 to-violet-700" },
  { name: "Stripe", initials: "STR", bg: "bg-gradient-to-br from-indigo-600 to-blue-700" },
  { name: "Conekta", initials: "CNK", bg: "bg-gradient-to-br from-sky-600 to-cyan-700" },
  { name: "Supabase", initials: "SUP", bg: "bg-gradient-to-br from-emerald-600 to-green-700" },
  { name: "Persona", initials: "KYC", bg: "bg-gradient-to-br from-rose-600 to-pink-700" },
  { name: "Resend", initials: "RSD", bg: "bg-gradient-to-br from-slate-700 to-slate-900" },
  { name: "Vercel", initials: "VCL", bg: "bg-gradient-to-br from-slate-900 to-black" },
  { name: "EasyLex", initials: "LEX", bg: "bg-gradient-to-br from-amber-600 to-orange-700" },
]

// Duplicate for seamless loop
const allPartners = [...partners, ...partners]

export function PartnersSection() {
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row1 = row1Ref.current
    const row2 = row2Ref.current
    if (!row1 || !row2) return

    let pos1 = 0
    let pos2 = -row2.scrollWidth / 2

    const animate = () => {
      pos1 -= 0.5
      pos2 += 0.5

      if (pos1 <= -row1.scrollWidth / 2) pos1 = 0
      if (pos2 >= 0) pos2 = -row2.scrollWidth / 2

      row1.style.transform = `translateX(${pos1}px)`
      row2.style.transform = `translateX(${pos2}px)`

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <section
      className="bg-slate-50 border-t border-slate-100 py-14 overflow-hidden"
      aria-label="Empresas que respaldan nuestra plataforma"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 mb-10">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">
            Infraestructura y Alianzas Tecnologicas
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
            Empresas que respaldan nuestra plataforma
          </h2>
        </div>
      </div>

      {/* Marquee container */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
        
        {/* Row 1 - forward */}
        <div className="flex overflow-hidden mb-4">
          <div ref={row1Ref} className="flex gap-6" style={{ minWidth: "max-content" }}>
            {allPartners.map((p, i) => (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-2xl ${p.bg} shadow-md transition-transform duration-300 hover:scale-110 cursor-pointer`}
                title={p.name}
              >
                <div className="text-2xl font-bold text-white mb-1">{p.initials}</div>
                <div className="text-xs font-semibold text-white text-center px-2">{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - reverse */}
        <div className="flex overflow-hidden">
          <div ref={row2Ref} className="flex gap-6" style={{ minWidth: "max-content" }}>
            {[...allPartners].reverse().map((p, i) => (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-2xl ${p.bg} shadow-md transition-transform duration-300 hover:scale-110 cursor-pointer`}
                title={p.name}
              >
                <div className="text-2xl font-bold text-white mb-1">{p.initials}</div>
                <div className="text-xs font-semibold text-white text-center px-2">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
