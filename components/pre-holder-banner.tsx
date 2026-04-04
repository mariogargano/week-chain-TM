'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Clock, DollarSign, Users, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

// Launch date: 2 months from now
const LAUNCH_DATE = new Date()
LAUNCH_DATE.setMonth(LAUNCH_DATE.getMonth() + 2)

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

export function PreHolderBanner() {
  const timeLeft = useCountdown(LAUNCH_DATE)

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 border-y border-sky-500/20" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full px-5 py-2 mb-4">
            <Zap className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-semibold text-sky-300">Acceso Anticipado Limitado</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Pre-Holder Program
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Reserva tu lugar antes del lanzamiento oficial. Deposito 100% reembolsable.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex justify-center gap-3 md:gap-6 mb-10">
          <div className="flex flex-col items-center">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-sky-500/30 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-2 shadow-lg shadow-sky-500/10">
              <span className="text-2xl md:text-3xl font-bold text-white">{timeLeft.days}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Dias</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-sky-500/30 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-2 shadow-lg shadow-sky-500/10">
              <span className="text-2xl md:text-3xl font-bold text-white">{timeLeft.hours}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Horas</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-sky-500/30 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-2 shadow-lg shadow-sky-500/10">
              <span className="text-2xl md:text-3xl font-bold text-white">{timeLeft.minutes}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Min</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-sky-500/30 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-2 shadow-lg shadow-sky-500/10">
              <span className="text-2xl md:text-3xl font-bold text-white">{timeLeft.seconds}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Seg</span>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">5% Descuento</p>
              <p className="text-sm text-slate-400">En tu certificado SVC</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Acceso Exclusivo</p>
              <p className="text-sm text-slate-400">Antes del publico</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="font-semibold text-white">$100 USD Credito</p>
              <p className="text-sm text-slate-400">Aplicado a tu compra</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center">
          <Link href="/pre-holder">
            <Button
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold text-lg h-14 px-10 rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30"
            >
              Reservar Mi Lugar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 mt-4 text-slate-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              <span className="text-white font-semibold">473</span> de 500 lugares disponibles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Deposito $100 USD - 100% reembolsable hasta 2 meses
          </p>
        </div>
      </div>
    </section>
  )
}
