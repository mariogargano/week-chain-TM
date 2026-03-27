"use client"

import Image from "next/image"

const partners = [
  {
    name: "Solana",
    description: "Blockchain",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=029",
    url: "https://solana.com",
    category: "Tecnologia",
  },
  {
    name: "Stripe",
    description: "Pagos Internacionales",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    url: "https://stripe.com",
    category: "Pagos",
  },
  {
    name: "Conekta",
    description: "Pagos Mexico",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Conekta_logo.png",
    url: "https://conekta.com",
    category: "Pagos",
  },
  {
    name: "Supabase",
    description: "Infraestructura",
    logo: "https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png",
    url: "https://supabase.com",
    category: "Tecnologia",
  },
  {
    name: "Persona",
    description: "Verificacion KYC",
    logo: "https://withpersona.com/favicon.ico",
    url: "https://withpersona.com",
    category: "Compliance",
  },
  {
    name: "Resend",
    description: "Comunicaciones",
    logo: "https://resend.com/static/favicon.ico",
    url: "https://resend.com",
    category: "Comunicaciones",
  },
]

const categories = [
  { key: "blockchain", label: "Blockchain", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { key: "pagos", label: "Pagos", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { key: "compliance", label: "Compliance", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { key: "tecnologia", label: "Tecnologia", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "comunicaciones", label: "Comunicaciones", color: "bg-amber-100 text-amber-700 border-amber-200" },
]

const categoryColors: Record<string, string> = {
  Blockchain: "bg-purple-100 text-purple-700 border-purple-200",
  Pagos: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Compliance: "bg-sky-100 text-sky-700 border-sky-200",
  Tecnologia: "bg-slate-100 text-slate-700 border-slate-200",
  Comunicaciones: "bg-amber-100 text-amber-700 border-amber-200",
}

// Extended list for the marquee - logos only (text-based since external SVGs may vary)
const marqueePartners = [
  { name: "Solana", color: "from-purple-500 to-violet-600", short: "SOL" },
  { name: "Stripe", color: "from-indigo-500 to-blue-600", short: "STR" },
  { name: "Conekta", color: "from-sky-500 to-cyan-600", short: "CNK" },
  { name: "Supabase", color: "from-emerald-500 to-green-600", short: "SUP" },
  { name: "Persona", color: "from-rose-500 to-pink-600", short: "KYC" },
  { name: "EasyLex", color: "from-amber-500 to-orange-600", short: "LEX" },
  { name: "Legalario", color: "from-teal-500 to-emerald-600", short: "LGL" },
  { name: "Resend", color: "from-slate-600 to-slate-800", short: "RSD" },
  { name: "Vercel", color: "from-slate-700 to-black", short: "VCL" },
  { name: "OXXO Pay", color: "from-red-500 to-red-700", short: "OXX" },
]

export function PartnersSection() {
  return (
    <section className="bg-white border-t border-slate-100 py-14 overflow-hidden" aria-label="Empresas colaboradoras">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">
            Infraestructura y Alianzas Tecnologicas
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-balance">
            Empresas que respaldan nuestra plataforma
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            WEEK-CHAIN opera con tecnologia de clase mundial para garantizar seguridad, compliance y experiencia
            de nivel enterprise.
          </p>
        </div>

        {/* Marquee infinito */}
        <div className="relative mb-12">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex overflow-hidden">
            <div className="flex animate-marquee gap-6 whitespace-nowrap">
              {[...marqueePartners, ...marqueePartners].map((p, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-[9px] font-bold">{p.short}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cards grid de partners principales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* Solana */}
          <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">SOL</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50">
                Blockchain
              </span>
            </div>
            <h3 className="text-white font-bold text-base mb-1">Solana</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Registro inmutable de certificados en blockchain de alta velocidad. Trazabilidad transparente y verificable.
            </p>
          </div>

          {/* Stripe */}
          <div className="group relative bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">STR</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                Pagos
              </span>
            </div>
            <h3 className="text-slate-900 font-bold text-base mb-1">Stripe</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Procesamiento de pagos internacionales con los mas altos estandares de seguridad PCI DSS.
            </p>
          </div>

          {/* EasyLex */}
          <div className="group relative bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 transition-all duration-300 hover:shadow-xl hover:shadow-amber-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">LEX</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                Legal
              </span>
            </div>
            <h3 className="text-slate-900 font-bold text-base mb-1">EasyLex</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Firma electronica avanzada y documentos legales digitales con validez conforme a NOM-151.
            </p>
          </div>

          {/* Conekta */}
          <div className="group relative bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-300 transition-all duration-300 hover:shadow-xl hover:shadow-sky-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">CNK</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                Pagos MX
              </span>
            </div>
            <h3 className="text-slate-900 font-bold text-base mb-1">Conekta</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Pagos en Mexico con OXXO, SPEI y tarjetas locales para maxima cobertura nacional.
            </p>
          </div>

          {/* Persona */}
          <div className="group relative bg-white rounded-2xl p-5 border border-slate-200 hover:border-rose-300 transition-all duration-300 hover:shadow-xl hover:shadow-rose-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">KYC</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                Compliance
              </span>
            </div>
            <h3 className="text-slate-900 font-bold text-base mb-1">Persona</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Verificacion de identidad KYC/AML para brokers e intermediarios. Cumplimiento PROFECO.
            </p>
          </div>

          {/* Legalario */}
          <div className="group relative bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-300 transition-all duration-300 hover:shadow-xl hover:shadow-teal-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">LGL</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
                Firma Digital
              </span>
            </div>
            <h3 className="text-slate-900 font-bold text-base mb-1">Legalario</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Contratos digitales con firma electronica avanzada y validez juridica en Mexico.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Todas las integraciones operan bajo sus propios terminos de servicio y politicas de privacidad.
          WEEK-CHAIN no es responsable de servicios de terceros.
        </p>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
