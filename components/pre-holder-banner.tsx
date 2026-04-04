'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, DollarSign, Star, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

// Target: 2 months from now (calculated once, when the component first mounts on the server)
// We use a fixed date so the countdown is consistent across renders.
const CAMPAIGN_END = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

function useCountdown(target: Date) {
  const calculate = () => {
    const diff = Math.max(0, target.getTime() - Date.now())
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculate)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calculate()), 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[52px]">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl w-14 h-14 flex items-center justify-center text-2xl font-black text-white shadow-inner">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] font-semibold text-sky-200 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function PreHolderBanner() {
  const { days, hours, minutes, seconds } = useCountdown(CAMPAIGN_END)

  const benefits = [
    { icon: DollarSign, title: '5% Descuento', sub: 'En tu primer certificado' },
    { icon: Star, title: '$100 Crédito', sub: 'Aplicado en la compra' },
    { icon: ShieldCheck, title: '100% Reembolsable', sub: 'Sin riesgo, sin compromiso' },
  ]

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 py-14 px-4">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header row */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 border border-sky-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300 mb-3">
              <Zap className="h-3.5 w-3.5" />
              Oferta por tiempo limitado · Primeros 500 lugares
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Pre-Holder Program
            </h2>
            <p className="mt-2 max-w-lg text-slate-300 text-base leading-relaxed">
              Reserva tu lugar de forma preferente con un depósito de{' '}
              <span className="font-bold text-white">$100 USD 100% reembolsable</span>.{' '}
              No es la compra del SVC; es tu prioridad de acceso anticipado.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
              Cierra en
            </p>
            <div className="flex items-end gap-2">
              <CountdownBlock value={days} label="días" />
              <span className="mb-3 text-xl font-black text-white/50">:</span>
              <CountdownBlock value={hours} label="horas" />
              <span className="mb-3 text-xl font-black text-white/50">:</span>
              <CountdownBlock value={minutes} label="min" />
              <span className="mb-3 text-xl font-black text-white/50">:</span>
              <CountdownBlock value={seconds} label="seg" />
            </div>
          </div>
        </div>

        {/* Benefits + CTA row */}
        <div className="grid gap-6 md:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm hover:bg-white/10 transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20">
                <b.icon className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <p className="font-bold text-white">{b.title}</p>
                <p className="text-xs text-slate-400">{b.sub}</p>
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-sky-500/20 border border-sky-400/30 p-5 text-center">
            <Link href="/pre-holder" className="w-full">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-sky-900/40 transition-all hover:scale-105"
              >
                Reservar Ahora
              </Button>
            </Link>
            <p className="text-[11px] text-sky-200 leading-tight">
              Reembolso en 60 días · No es compra del SVC ·{' '}
              <Link href="/terms" className="underline hover:text-white">
                Ver términos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
