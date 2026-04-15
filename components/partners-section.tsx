"use client";
const partners = [
  { name: "Solana", initials: "SOL", bg: "bg-gradient-to-br from-purple-600 to-violet-700", text: "text-white" },
  { name: "Stripe", initials: "STR", bg: "bg-gradient-to-br from-indigo-600 to-blue-700", text: "text-white" },
  { name: "Conekta", initials: "CNK", bg: "bg-gradient-to-br from-sky-600 to-cyan-700", text: "text-white" },
  { name: "Supabase", initials: "SUP", bg: "bg-gradient-to-br from-emerald-600 to-green-700", text: "text-white" },
  { name: "Persona", initials: "KYC", bg: "bg-gradient-to-br from-rose-600 to-pink-700", text: "text-white" },
  { name: "Resend", initials: "RSD", bg: "bg-gradient-to-br from-slate-700 to-slate-900", text: "text-white" },
  { name: "Vercel", initials: "VCL", bg: "bg-gradient-to-br from-slate-900 to-black", text: "text-white" },
  { name: "EasyLex", initials: "LEX", bg: "bg-gradient-to-br from-amber-600 to-orange-700", text: "text-white" },
]

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
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="flex overflow-hidden mb-4">
          <div className="flex gap-6 animate-marquee-forward">
            {allPartners?.map((p, i) => (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-2xl ${p?.bg} shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer`}
                title={p?.name}
              >
                <div className={`text-2xl font-bold ${p?.text} mb-1`}>{p?.initials}</div>
                <div className={`text-xs font-semibold ${p?.text} text-center px-2`}>{p?.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex overflow-hidden">
          <div className="flex gap-6 animate-marquee-reverse">
            {[...allPartners]?.reverse()?.map((p, i) => (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-2xl ${p?.bg} shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer`}
                title={p?.name}
              >
                <div className={`text-2xl font-bold ${p?.text} mb-1`}>{p?.initials}</div>
                <div className={`text-xs font-semibold ${p?.text} text-center px-2`}>{p?.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
