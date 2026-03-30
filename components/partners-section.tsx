"use client"

import Image from "next/image"

const partners = [
  {
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=040",
    bg: "bg-black",
  },
  {
    name: "Stripe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    bg: "bg-white",
  },
  {
    name: "Conekta",
    logo: "https://cdn.conekta.com/assets/images/documentation/logo-conekta.svg",
    bg: "bg-white",
  },
  {
    name: "Supabase",
    logo: "https://supabase.com/dashboard/img/supabase-logo.svg",
    bg: "bg-black",
  },
  {
    name: "Persona",
    logo: "https://withpersona.com/images/persona-logo-dark.svg",
    bg: "bg-white",
  },
  {
    name: "Resend",
    logo: "https://resend.com/static/brand/resend-logotype-wordmark-black.svg",
    bg: "bg-white",
  },
  {
    name: "Vercel",
    logo: "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
    bg: "bg-black",
  },
  {
    name: "Legalario",
    logo: "https://legalario.com/wp-content/uploads/2022/09/Legalario_logo.svg",
    bg: "bg-white",
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
                className={`flex-shrink-0 flex items-center justify-center w-36 h-14 rounded-xl px-4 border border-slate-200 shadow-sm ${p.bg} transition-transform duration-300 hover:scale-105`}
                title={p.name}
              >
                <div className="relative w-full h-8">
                  <Image
                    src={p.logo}
                    alt={p.name}
                    fill
                    sizes="144px"
                    className="object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
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
                className={`flex-shrink-0 flex items-center justify-center w-36 h-14 rounded-xl px-4 border border-slate-200 shadow-sm ${p.bg} transition-transform duration-300 hover:scale-105`}
                title={p.name}
              >
                <div className="relative w-full h-8">
                  <Image
                    src={p.logo}
                    alt={p.name}
                    fill
                    sizes="144px"
                    className="object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
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
