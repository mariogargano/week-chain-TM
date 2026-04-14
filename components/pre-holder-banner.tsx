'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Clock, DollarSign } from 'lucide-react';

export function PreHolderBanner() {
  return (
    <section className="w-full py-12 px-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {/* Left: Offer Details */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Oferta Limitada</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">Pre-Holder Program</h2>
            <p className="text-white/90 mb-4">
              Sé de los primeros 500. Depósito de $100 USD 100% reembolsable con beneficios exclusivos.
            </p>
          </div>

          {/* Center: Benefits */}
          <div className="space-y-3 text-white">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold">5% Descuento</p>
                <p className="text-sm text-white/90">En certificados</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold">Acceso Exclusivo</p>
                <p className="text-sm text-white/90">Antes del lanzamiento</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold">$100 Crédito</p>
                <p className="text-sm text-white/90">En tu compra</p>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="text-center">
            <Link href="/pre-holder">
              <Button
                size="lg"
                className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg h-14"
              >
                Reservar Ahora
              </Button>
            </Link>
            <p className="text-white text-sm mt-3">
              473 lugares aun disponibles
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
