"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionData {
  holderNumber: string | null
  name: string | null
  email: string | null
  remaining: number
}

// ─── Confetti particle (CSS-only, no external dep) ────────────────────────────

function ConfettiBurst() {
  const colors = ["#D4AF37", "#F5D060", "#0EA5E9", "#38BDF8", "#14B8A6", "#FFFFFF"]
  const pieces = Array.from({ length: 18 }, (_, i) => i)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((i) => {
        const color = colors[i % colors.length]
        const left = `${5 + (i * 5.5) % 90}%`
        const delay = `${(i * 0.12).toFixed(2)}s`
        const duration = `${0.8 + (i % 5) * 0.15}s`
        const size = i % 3 === 0 ? 8 : i % 3 === 1 ? 6 : 4

        return (
          <div
            key={i}
            className="absolute top-0 rounded-sm"
            style={{
              left,
              width: size,
              height: size,
              backgroundColor: color,
              animation: `confetti-fall ${duration} ease-in ${delay} forwards`,
              opacity: 0,
            }}
          />
        )
      })}
      <style>{`
        @keyframes confetti-fall {
          0%  { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80% { opacity: 1; }
          100%{ transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Share buttons ─────────────────────────────────────────────────────────────

function ShareButtons({ holderNumber, remaining }: { holderNumber: string | null; remaining: number }) {
  const appUrl = "week-chain.com/pre-holder"
  const num = holderNumber || "?"

  const whatsappText = encodeURIComponent(
    `¡Acabo de reservar mi lugar #${num} en WEEK-CHAIN™ — el futuro de las vacaciones digitales! 🏖️🔗 Solo quedan ${remaining} lugares disponibles. ¡Únete antes que se agoten! ${appUrl}`,
  )
  const twitterText = encodeURIComponent(
    `Just joined WEEK-CHAIN™ as Pre-Holder #${num} 🏖️ The future of digital vacations is here. Only ${remaining} spots left! #WeekChain #Web3 #Vacations ${appUrl}`,
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#25D366,#128C7E)",
          color: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
        }}
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Compartir por WhatsApp
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${twitterText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#1DA1F2,#0C8FDB)",
          color: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(29,161,242,0.3)",
        }}
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Publicar en X / Twitter
      </a>
    </div>
  )
}

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [sessionData, setSessionData] = useState<SessionData>({
    holderNumber: null,
    name: null,
    email: null,
    remaining: 453,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch remaining count
        const countRes = await fetch("/api/pre-holder/count")
        if (countRes.ok) {
          const countData = await countRes.json()
          setSessionData((prev) => ({ ...prev, remaining: countData.remaining }))
        }

        // If we have a session_id, retrieve holder info from Stripe session metadata
        if (sessionId) {
          const res = await fetch(`/api/pre-holder/session?session_id=${sessionId}`)
          if (res.ok) {
            const data = await res.json()
            setSessionData((prev) => ({
              ...prev,
              holderNumber: data.holder_number || null,
              name: data.name || null,
              email: data.email || null,
            }))
          }
        }
      } catch {
        // Non-fatal
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sessionId])

  const { holderNumber, name, remaining } = sessionData
  const displayName = name ? name.split(" ")[0] : null

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-white px-4 py-16"
      style={{ background: "linear-gradient(180deg,#0A1628 0%,#0F172A 60%,#0A1628 100%)" }}
    >
      {/* Background glows */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px] opacity-15"
        style={{ background: "radial-gradient(circle,#D4AF37 0%,transparent 70%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-96 h-96 rounded-full blur-[140px] opacity-10"
        style={{ background: "#0EA5E9" }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Success card */}
        <div
          className="relative rounded-2xl overflow-hidden p-8 md:p-10 text-center mb-6"
          style={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(212,175,55,0.35)",
            boxShadow: "0 0 80px rgba(212,175,55,0.12), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <ConfettiBurst />

          {/* Checkmark */}
          <div
            className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#D4AF37,#F5D060)",
              boxShadow: "0 0 32px rgba(212,175,55,0.5)",
            }}
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1C1917"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <Badge
            className="mb-4 text-xs font-semibold tracking-widest uppercase py-1 px-3 border"
            style={{
              background: "rgba(212,175,55,0.1)",
              borderColor: "rgba(212,175,55,0.35)",
              color: "#D4AF37",
            }}
          >
            ✦ Pago confirmado
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
            ¡Bienvenido al futuro<br />de las vacaciones! 🎉
          </h1>

          {displayName && (
            <p className="text-slate-400 text-sm mb-4">
              Hola, <strong className="text-white">{displayName}</strong>. Tu lugar está asegurado.
            </p>
          )}

          {/* Holder number */}
          <div
            className="mx-auto my-6 rounded-2xl py-5 px-8 inline-flex flex-col items-center gap-1"
            style={{
              background: "linear-gradient(135deg,#D4AF37,#F5D060)",
              boxShadow: "0 4px 24px rgba(212,175,55,0.35)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#78350F]">
              Tu número de Pre-Holder
            </p>
            <p className="text-6xl font-black text-[#1C1917] leading-none">
              {loading ? "..." : holderNumber ? `#${holderNumber}` : "#—"}
            </p>
            <p className="text-xs text-[#78350F] font-semibold">de 500 Early Adopters</p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-2">
            Tu <strong className="text-[#D4AF37]">NFT Certificado de Reserva</strong> será enviado
            a tu email en las próximas <strong className="text-white">24 horas</strong>.
          </p>
          <p className="text-slate-500 text-xs">
            Contiene tu número exclusivo en blockchain Solana — prueba permanente de tu lugar.
          </p>
        </div>

        {/* Benefits reminder */}
        <Card
          className="border-0 mb-6"
          style={{
            background: "rgba(30,41,59,0.7)",
            border: "1px solid rgba(56,189,248,0.15)",
          }}
        >
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider mb-3 text-center">
              Tus beneficios como Early Adopter
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: "🥇", text: "Acceso prioritario cuando abramos en Q2 2026" },
                { icon: "💰", text: "Descuento exclusivo de $200 USD en tu SVC" },
                { icon: "🎟️", text: "NFT Certificado #" + (holderNumber || "?") + " en blockchain Solana" },
                { icon: "✅", text: "Reembolso garantizado al 100% en cualquier momento" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <p className="text-sm text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Share */}
        <div className="text-center mb-6">
          <p className="text-sm text-slate-400 mb-1 font-medium">
            ¿Conoces a alguien que deba unirse?
          </p>
          <p className="text-xs text-slate-600 mb-4">
            Solo quedan <strong className="text-[#D4AF37]">{remaining}</strong> lugares disponibles
          </p>
          <ShareButtons holderNumber={holderNumber} remaining={remaining} />
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-[#38BDF8] transition-colors underline underline-offset-4"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}

// ─── Page (Suspense boundary required for useSearchParams in Next.js App Router) ──

export default function PreHolderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center text-white"
          style={{ background: "#0F172A" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Cargando tu confirmación...</p>
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
