"use client"

import Image from "next/image"

const partners = [
  {
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=040",
    bg: "bg-gradient-to-br from-purple-600 to-violet-800",
    textColor: "text-white",
  },
  {
    name: "Stripe",
    logo: "https://cdn.brandfetch.io/idxAg10C0L/theme/dark/logo.svg?c=1id_Mf5_83D",
    bg: "bg-white",
    textColor: "text-indigo-600",
  },
  {
    name: "Conekta",
    logo: "https://cdn.brandfetch.io/id9w5hR8pR/theme/dark/logo.svg?c=1id64Mup7ac",
    bg: "bg-white",
    textColor: "text-sky-600",
  },
  {
    name: "Supabase",
    logo: "https://cdn.brandfetch.io/idB6Y0Gxdz/theme/dark/logo.svg?c=1id64Mup7ac",
    bg: "bg-emerald-950",
    textColor: "text-emerald-400",
  },
  {
    name: "Persona",
    logo: "https://cdn.brandfetch.io/idLvMkCR0Y/theme/dark/logo.svg?c=1id64Mup7ac",
    bg: "bg-white",
    textColor: "text-rose-600",
  },
  {
    name: "Resend",
    logo: "https://cdn.brandfetch.io/idYaGKU3N0/theme/dark/logo.svg?c=1id64Mup7ac",
    bg: "bg-slate-900",
    textColor: "text-white",
  },
  {
    name: "Vercel",
    logo: "https://cdn.brandfetch.io/idD7JNfqYd/theme/dark/logo.svg?c=1id64Mup7ac",
    bg: "bg-black",
    textColor: "text-white",
  },
  {
    name: "EasyLex",
    logo: null,
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    textColor: "text-white",
  },
]

// Duplicate for seamless loop
const allPartners = [...partners, ...partners]

export function PartnersSection() {
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

      {/* Marquee - row 1 forward */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="flex overflow-hidden mb-4">
          <div className="flex gap-8 animate-marquee-forward">
            {allPartners.map((p, i) => (
              <div
                key={i}
                className={`flex-shrink-0 flex items-center justify-center w-40 h-14 rounded-xl px-4 border border-slate-200/50 shadow-sm ${p.bg} transition-transform duration-300 hover:scale-105`}
                title={p.name}
              >
                {p.logo ? (
                  <div className="relative w-full h-8">
                    <Image
                      src={p.logo}
                      alt={p.name}
                      fill
                      sizes="160px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className={`font-bold text-base ${p.textColor}`}>{p.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Marquee - row 2 reverse (offset) */}
        <div className="flex overflow-hidden">
          <div className="flex gap-8 animate-marquee-reverse">
            {[...allPartners].reverse().map((p, i) => (
              <div
                key={i}
                className={`flex-shrink-0 flex items-center justify-center w-40 h-14 rounded-xl px-4 border border-slate-200/50 shadow-sm ${p.bg} transition-transform duration-300 hover:scale-105`}
                title={p.name}
              >
                {p.logo ? (
                  <div className="relative w-full h-8">
                    <Image
                      src={p.logo}
                      alt={p.name}
                      fill
                      sizes="160px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className={`font-bold text-base ${p.textColor}`}>{p.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-forward {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-marquee-forward {
          animation: marquee-forward 28s linear infinite;
          min-width: max-content;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 32s linear infinite;
          min-width: max-content;
        }
        .animate-marquee-forward:hover,
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
