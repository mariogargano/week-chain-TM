"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CountData {
  count: number
  remaining: number
  max: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX = 500

const COUNTRIES = [
  "México",
  "Estados Unidos",
  "Colombia",
  "Argentina",
  "España",
  "Chile",
  "Perú",
  "Brasil",
  "Venezuela",
  "Ecuador",
  "Guatemala",
  "Honduras",
  "Costa Rica",
  "Panamá",
  "República Dominicana",
  "Cuba",
  "Bolivia",
  "Paraguay",
  "Uruguay",
  "Nicaragua",
  "El Salvador",
  "Puerto Rico",
  "Otro",
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function CounterBadge({ count, remaining }: { count: number; remaining: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-3 px-6 py-3 rounded-full border"
        style={{
          background: "rgba(212,175,55,0.12)",
          borderColor: "rgba(212,175,55,0.35)",
        }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]" />
        </span>
        <span className="text-sm font-semibold text-[#D4AF37] tracking-wide">
          {count} / {MAX} lugares reservados
        </span>
      </div>
      {remaining <= 100 && (
        <p className="text-xs text-red-400 font-medium animate-pulse">
          ⚡ Solo quedan {remaining} lugares disponibles
        </p>
      )}
    </div>
  )
}

function BenefitCard({
  emoji,
  title,
  description,
}: {
  emoji: string
  title: string
  description: string
}) {
  return (
    <Card
      className="relative overflow-hidden border-0 transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(30,41,59,0.8)",
        border: "1px solid rgba(212,175,55,0.2)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(135deg,rgba(212,175,55,0.05) 0%,transparent 100%)" }}
      />
      <CardHeader className="pb-2">
        <div className="text-4xl mb-2">{emoji}</div>
        <CardTitle
          className="text-lg font-bold"
          style={{ color: "#D4AF37" }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
        style={{
          background: "linear-gradient(135deg,#D4AF37,#F5D060)",
          color: "#1C1917",
        }}
      >
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function TestimonialCard({
  name,
  city,
  date,
  text,
}: {
  name: string
  city: string
  date: string
  text: string
}) {
  return (
    <Card
      className="border-0"
      style={{
        background: "rgba(30,41,59,0.6)",
        border: "1px solid rgba(56,189,248,0.15)",
      }}
    >
      <CardContent className="pt-5">
        <p className="text-sm text-slate-300 leading-relaxed mb-4 italic">"{text}"</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-slate-500">{city}</p>
          </div>
          <p className="text-xs text-slate-600">{date}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border-b cursor-pointer"
      style={{ borderColor: "rgba(51,65,85,0.8)" }}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex justify-between items-center py-4 gap-4">
        <p className="text-sm font-medium text-white pr-4">{question}</p>
        <span
          className={cn(
            "flex-shrink-0 text-[#38BDF8] text-xl transition-transform duration-200",
            open && "rotate-45",
          )}
        >
          +
        </span>
      </div>
      {open && (
        <p className="text-sm text-slate-400 leading-relaxed pb-4">{answer}</p>
      )}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

function RegisterForm({
  onSuccess,
  remaining,
}: {
  onSuccess?: () => void
  remaining: number
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim()) {
      setError("Por favor completa nombre y email.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/pre-holder/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), country }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al procesar tu solicitud. Intenta de nuevo.")
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      setError("Error de conexión. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={formRef}
      id="register-form"
      className="w-full max-w-md mx-auto rounded-2xl p-6 md:p-8"
      style={{
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(212,175,55,0.3)",
        boxShadow: "0 0 60px rgba(212,175,55,0.08), 0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div className="mb-6 text-center">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#D4AF37" }}
        >
          Reserva tu lugar
        </p>
        <h2 className="text-xl font-bold text-white">Depósito de interés — $100 USD</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Nombre completo *
          </label>
          <Input
            type="text"
            placeholder="Tu nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Email *
          </label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            País
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full h-9 rounded-md border border-slate-600 bg-slate-800/60 text-white px-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
          >
            <option value="">Selecciona tu país</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm text-red-300 bg-red-900/20 border border-red-800/50">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || remaining === 0}
          className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          style={{
            background: loading
              ? "rgba(212,175,55,0.5)"
              : "linear-gradient(135deg,#D4AF37 0%,#F5D060 50%,#D4AF37 100%)",
            color: "#1C1917",
            boxShadow: loading ? "none" : "0 4px 20px rgba(212,175,55,0.4)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Procesando...
            </span>
          ) : remaining === 0 ? (
            "Lista de espera llena"
          ) : (
            "Reservar mi lugar — $100 USD →"
          )}
        </button>

        <p className="text-center text-xs text-slate-500 leading-relaxed">
          🔒 Pago 100% seguro con Stripe. Reembolso garantizado si la plataforma no lanza antes del 31 de diciembre 2026.
        </p>
      </form>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreHolderPage() {
  const [countData, setCountData] = useState<CountData>({ count: 47, remaining: 453, max: MAX })

  // Poll count every 30 seconds
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/pre-holder/count")
        if (res.ok) {
          const data = await res.json()
          setCountData(data)
        }
      } catch {
        // Silently fail — keep showing cached value
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  function scrollToForm() {
    document.getElementById("register-form")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const progressPercent = Math.round((countData.count / MAX) * 100)

  return (
    <main
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(180deg,#0A1628 0%,#0F172A 40%,#0A1628 100%)" }}
    >
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-20">
        {/* Background glow orbs */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: "radial-gradient(circle,#D4AF37 0%,transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-0 left-0 w-80 h-80 rounded-full blur-[120px] opacity-10"
          style={{ background: "#0EA5E9" }}
        />
        <div
          className="pointer-events-none absolute top-20 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10"
          style={{ background: "#06B6D4" }}
        />

        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
          <Badge
            className="mb-6 text-xs font-semibold tracking-widest uppercase py-1.5 px-4 border"
            style={{
              background: "rgba(212,175,55,0.1)",
              borderColor: "rgba(212,175,55,0.4)",
              color: "#D4AF37",
            }}
          >
            ✦ Early Adopter · Pre-Holder Program
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-5">
            Sé uno de los{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#D4AF37,#F5D060,#D4AF37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              500 primeros
            </span>
            <br />
            en WEEK-CHAIN™
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Reserva tu lugar con{" "}
            <strong className="text-white">$100 USD</strong> y obtén beneficios exclusivos
            de Early Adopter — acceso prioritario, descuento de $200 y tu NFT de reserva en
            blockchain Solana.
          </p>

          <div className="flex flex-col items-center gap-5 mb-10">
            <CounterBadge count={countData.count} remaining={countData.remaining} />

            {/* Progress bar */}
            <div className="w-full max-w-sm">
              <Progress
                value={progressPercent}
                className="h-2.5 bg-slate-800"
                style={
                  {
                    "--progress-color": "#D4AF37",
                  } as React.CSSProperties
                }
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-slate-500">{progressPercent}% reservado</span>
                <span className="text-xs text-slate-500">{MAX} total</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#D4AF37 0%,#F5D060 50%,#D4AF37 100%)",
                color: "#1C1917",
                boxShadow: "0 6px 30px rgba(212,175,55,0.45)",
              }}
            >
              Reservar mi lugar — $100 USD
            </button>
            <Badge
              className="px-4 py-2 text-xs font-medium border"
              style={{
                background: "rgba(20,184,166,0.1)",
                borderColor: "rgba(20,184,166,0.3)",
                color: "#5EEAD4",
              }}
            >
              ✓ 100% reembolsable · Sin compromiso
            </Badge>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "#D4AF37" }}
            >
              Beneficios exclusivos
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Por ser de los primeros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitCard
              emoji="🥇"
              title="Acceso Prioritario"
              description="Serás de los primeros en usar la plataforma cuando abramos. Sin listas de espera, sin restricciones — acceso total desde el día uno."
            />
            <BenefitCard
              emoji="💰"
              title="Descuento Exclusivo $200 USD"
              description="Tu Smart Vacational Certificate de $6,500 te costará $6,300 al momento de activarlo. Ahorra $200 por ser Early Adopter."
            />
            <BenefitCard
              emoji="🎟️"
              title="NFT Certificado de Reserva"
              description="Recibes un token único en blockchain Solana con tu número de pre-holder (1-500). Prueba irrefutable de tu lugar histórico."
            />
          </div>
        </div>
      </section>

      {/* ─── Cómo funciona ────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-20"
        style={{ background: "rgba(14,165,233,0.04)" }}
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "#38BDF8" }}
            >
              Simple y transparente
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Cómo funciona</h2>
          </div>

          <div
            className="rounded-2xl p-8 md:p-10 flex flex-col gap-8"
            style={{
              background: "rgba(30,41,59,0.6)",
              border: "1px solid rgba(56,189,248,0.15)",
            }}
          >
            <StepCard
              number={1}
              title="Deposita $100 USD"
              description="Pago seguro con tarjeta de crédito o débito vía Stripe. Tu información financiera nunca llega a nuestros servidores."
            />
            <div className="border-l-2 ml-5 h-4" style={{ borderColor: "rgba(212,175,55,0.3)" }} />
            <StepCard
              number={2}
              title="Recibe tu NFT de reserva"
              description="En las próximas 24 horas recibirás tu certificado NFT en blockchain Solana con tu número exclusivo del 1 al 500."
            />
            <div className="border-l-2 ml-5 h-4" style={{ borderColor: "rgba(212,175,55,0.3)" }} />
            <StepCard
              number={3}
              title="Cuando abramos, activa tu SVC con $200 de descuento"
              description="En Q2 2026, cuando lancemos la plataforma, podrás adquirir tu Smart Vacational Certificate con $200 de descuento exclusivo para Early Adopters."
            />
          </div>
        </div>
      </section>

      {/* ─── Social Proof / Urgencia ──────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Urgency bar */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-12 text-center"
            style={{
              background: "linear-gradient(135deg,rgba(212,175,55,0.1) 0%,rgba(245,208,96,0.05) 100%)",
              border: "1px solid rgba(212,175,55,0.3)",
            }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#D4AF37" }}
            >
              ⚡ Disponibilidad limitada
            </p>
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{countData.count}</span>
                <span className="text-2xl text-slate-400">/ {MAX}</span>
              </div>
              <p className="text-slate-300 text-sm">lugares reservados</p>
            </div>
            <div className="max-w-sm mx-auto mb-3">
              <Progress value={progressPercent} className="h-3 bg-slate-800" />
            </div>
            <p
              className="text-sm font-bold"
              style={{ color: countData.remaining <= 50 ? "#F87171" : "#D4AF37" }}
            >
              {countData.remaining <= 0
                ? "Lista completa"
                : `Solo quedan ${countData.remaining} lugares disponibles`}
            </p>
          </div>

          {/* Testimonials */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Lo que dicen los primeros en unirse</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TestimonialCard
              name="Carlos Mendoza"
              city="Ciudad de México, MX"
              date="Mar 2026"
              text="El concepto de tener vacaciones digitales respaldadas en blockchain me pareció revolucionario. Me uní sin dudarlo."
            />
            <TestimonialCard
              name="Valentina Ríos"
              city="Bogotá, CO"
              date="Mar 2026"
              text="Con $100 aseguré mi lugar y mi descuento de $200. El NFT de reserva es un detalle increíble que nadie más ofrece."
            />
            <TestimonialCard
              name="Andrés Fuentes"
              city="Miami, FL"
              date="Mar 2026"
              text="WEEK-CHAIN lleva tiempo desarrollándose y se nota la seriedad. El depósito reembolsable me dio la confianza de unirme."
            />
          </div>
        </div>
      </section>

      {/* ─── Register Form ────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-20"
        style={{ background: "rgba(14,165,233,0.04)" }}
      >
        <div className="container mx-auto px-4 max-w-xl">
          <div className="text-center mb-8">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "#D4AF37" }}
            >
              Únete ahora
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Reserva tu lugar
            </h2>
            <p className="text-slate-400 text-sm">
              Solo <strong className="text-white">{countData.remaining}</strong> lugares disponibles de {MAX}
            </p>
          </div>

          <RegisterForm remaining={countData.remaining} />
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "#38BDF8" }}
            >
              Preguntas frecuentes
            </p>
            <h2 className="text-3xl font-bold text-white">Todo lo que debes saber</h2>
          </div>

          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "rgba(30,41,59,0.5)",
              border: "1px solid rgba(51,65,85,0.8)",
            }}
          >
            <FAQItem
              question="¿Qué es un depósito de interés?"
              answer="No es la compra de un Smart Vacational Certificate (SVC). Es una señal de interés reembolsable al 100%. Con tu depósito de $100 USD reservas un lugar exclusivo como Early Adopter y accedes a beneficios que no estarán disponibles cuando abramos al público general."
            />
            <FAQItem
              question="¿Puedo recuperar mi $100?"
              answer="Sí. En cualquier momento, sin preguntas. Si decides que WEEK-CHAIN no es para ti, te reembolsamos el 100% de tu depósito. También reembolsamos automáticamente si la plataforma no lanza antes del 31 de diciembre 2026."
            />
            <FAQItem
              question="¿Qué es el NFT de reserva?"
              answer="Un token digital único en blockchain Solana que certifica tu lugar como Pre-Holder. Contiene tu número exclusivo del 1 al 500, la fecha de tu depósito y los beneficios asociados. Es una prueba permanente e inmutable de tu participación histórica en WEEK-CHAIN."
            />
            <FAQItem
              question="¿Cuándo abre la plataforma?"
              answer="Estamos en fase de lanzamiento Q2 2026. Como Pre-Holder serás notificado antes del lanzamiento público y tendrás acceso prioritario para activar tu SVC con el descuento de $200."
            />
            <FAQItem
              question="¿Qué es un Smart Vacational Certificate (SVC)?"
              answer="El SVC es el producto principal de WEEK-CHAIN: un certificado digital en blockchain que te da derecho a semanas de vacaciones en propiedades seleccionadas durante 15 años. Su precio regular es $6,500 USD. Como Pre-Holder lo activarás por $6,300."
            />
            <FAQItem
              question="¿Es seguro el pago?"
              answer='Sí. El procesamiento del pago es realizado 100% por Stripe, el estándar global de pagos en línea (usado por Amazon, Google, Shopify). Nosotros nunca vemos ni almacenamos tus datos de tarjeta. Búscalo como "Powered by Stripe".'
            />
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{
              background: "linear-gradient(135deg,rgba(212,175,55,0.12) 0%,rgba(14,165,233,0.08) 100%)",
              border: "1px solid rgba(212,175,55,0.25)",
            }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              ¿Listo para reservar tu lugar?
            </h2>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto">
              Solo <strong className="text-[#D4AF37]">{countData.remaining} lugares</strong> quedan disponibles.
              Una vez que se agoten, el precio de Early Adopter no estará disponible.
            </p>
            <button
              onClick={scrollToForm}
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#D4AF37 0%,#F5D060 50%,#D4AF37 100%)",
                color: "#1C1917",
                boxShadow: "0 6px 30px rgba(212,175,55,0.45)",
              }}
            >
              Reservar mi lugar — $100 USD
            </button>
            <p className="mt-4 text-xs text-slate-500">
              100% reembolsable · Pago seguro con Stripe · Sin compromisos
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer / T&C ─────────────────────────────────────────────────── */}
      <footer
        className="py-10 border-t"
        style={{ borderColor: "rgba(51,65,85,0.5)" }}
      >
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Este depósito de $100 USD no constituye la adquisición de un Smart Vacational Certificate (SVC). Es un
            depósito de interés reembolsable. MORISES LLC se compromete a reembolsar el 100% del depósito bajo
            solicitud en cualquier momento antes del lanzamiento oficial de la plataforma, o si la plataforma no
            lanza antes del 31 de diciembre 2026. Este depósito no representa equity, deuda, ni derecho sobre
            ningún activo de MORISES LLC o WEEK-CHAIN S.A.P.I. de C.V.
          </p>
          <p className="text-xs text-slate-600">
            © 2026 MORISES LLC / WEEK-CHAIN™{" "}
            <span className="mx-2 text-slate-700">|</span>{" "}
            <a
              href="mailto:corporativo@morises.com"
              className="text-slate-500 hover:text-[#38BDF8] transition-colors"
            >
              corporativo@morises.com
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
