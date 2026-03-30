"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PreHolderBanner() {
  return (
    <section className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10 px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Left content */}
          <div className="flex items-center gap-4 text-white text-center sm:text-left">
            <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Oferta Limitada
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                Conviertete en Pre-Holder y asegura tu lugar
              </h3>
              <p className="text-sm text-white/90 mt-0.5">
                Precios exclusivos de lanzamiento desde <span className="font-bold">$99 USD</span>
              </p>
            </div>
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-white/80 text-sm">
              <Users className="w-4 h-4" />
              <span>127 lugares disponibles</span>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-lg shadow-orange-900/30 px-6 min-h-[48px]"
            >
              <Link href="/pre-holder">
                Reservar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
