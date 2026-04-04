"use client"

import Image from "next/image"

type Partner = {
  name: string
  category: string
  logo: string
  href: string
  description: string
}

const partners: Partner[] = [
  {
    name: "Solana",
    category: "Blockchain",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    href: "https://solana.com",
    description: "Red blockchain de alta velocidad",
  },
  {
    name: "Stripe",
    category: "Pagos",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    href: "https://stripe.com",
    description: "Procesamiento de pagos global",
  },
  {
    name: "Supabase",
    category: "Infraestructura",
    logo: "https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png",
    href: "https://supabase.com",
    description: "Base de datos y autenticación",
  },
  {
    name: "Vercel",
    category: "Deploy",
    logo: "https://assets.vercel.com/image/upload/front/favicon/vercel/57x57.png",
    href: "https://vercel.com",
    description: "Plataforma de despliegue Next.js",
  },
  {
    name: "Conekta",
    category: "Pagos MX",
    logo: "https://seeklogo.com/images/C/conekta-logo-E5793E9699-seeklogo.com.png",
    href: "https://conekta.com",
    description: "Pagos locales en México",
  },
  {
    name: "Resend",
    category: "Email",
    logo: "https://avatars.githubusercontent.com/u/109168940",
    href: "https://resend.com",
    description: "Infraestructura de correo transaccional",
  },
]

export function PartnersSection() {
  return (
    <section
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 sm:px-6 overflow-hidden"
      aria-label="Socios tecnológicos de WEEK-CHAIN"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-3">
            Infraestructura y Alianzas
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Tecnología de clase mundial
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            WEEK-CHAIN opera sobre infraestructura probada, segura y de nivel enterprise.
          </p>
        </div>

        {/* Partner grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 hover:border-sky-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-sky-900/30 text-center"
              title={p.description}
            >
              <div className="relative h-10 w-10">
                <Image
                  src={p.logo}
                  alt={p.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{p.name}</p>
                <p className="text-[10px] text-sky-400 font-medium uppercase tracking-wider">{p.category}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom disclaimer */}
        <p className="text-center text-xs text-slate-600 mt-10">
          Marcas y logos son propiedad de sus respectivos titulares. WEEK-CHAIN no está afiliada ni patrocinada por estas empresas salvo que se indique expresamente.
        </p>
      </div>
    </section>
  )
}
