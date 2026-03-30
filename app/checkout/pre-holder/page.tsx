'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ShoppingCart, Zap } from 'lucide-react'
import Link from 'next/link'

// Example certificates (fetch from DB in production)
const CERTIFICATES = [
  { id: 1, name: 'Certificado Bronce', price: 999 },
  { id: 2, name: 'Certificado Plata', price: 1999 },
  { id: 3, name: 'Certificado Oro', price: 2999 },
]

const DEPOSIT_CREDIT = 100
const DISCOUNT_PERCENT = 0.05

interface PreHolderCheckoutProps {
  certificateId?: number
}

export default function PreHolderCheckout({ certificateId = 2 }: PreHolderCheckoutProps) {
  const [selectedCert, setSelectedCert] = useState(certificateId)
  const [isLoading, setIsLoading] = useState(false)

  const certificate = CERTIFICATES.find(c => c.id === selectedCert)
  if (!certificate) return <div>Certificado no encontrado</div>

  // Calculate pricing with formula: (P × 0.95) - 100
  const publicPrice = certificate.price
  const discountAmount = publicPrice * DISCOUNT_PERCENT
  const subtotal = publicPrice - discountAmount
  const totalToPay = subtotal - DEPOSIT_CREDIT

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      // Call Stripe checkout for remaining amount
      const response = await fetch('/api/checkout/pre-holder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: selectedCert,
          publicPrice,
          discountAmount,
          depositCredit: DEPOSIT_CREDIT,
          totalToPay,
        })
      })

      const data = await response.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Checkout Pre-Holder</h1>
          <p className="text-lg text-slate-600 mt-2">Aplica tu depósito y descuento</p>
        </div>

        {/* Certificate Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CERTIFICATES.map(cert => (
            <Card
              key={cert.id}
              className={`cursor-pointer transition-all ${
                selectedCert === cert.id
                  ? 'border-2 border-sky-600 bg-sky-50'
                  : 'border-2 border-slate-200 hover:border-sky-300'
              }`}
              onClick={() => setSelectedCert(cert.id)}
            >
              <CardContent className="pt-6 text-center">
                <h3 className="font-bold text-lg mb-2">{cert.name}</h3>
                <p className="text-3xl font-bold text-sky-600">${cert.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-6 text-blue-900">Desglose de Precio</h2>

            <div className="space-y-3 mb-6">
              {/* Precio Público */}
              <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                <span className="text-slate-700">Precio Público</span>
                <span className="font-semibold">${publicPrice}.00 USD</span>
              </div>

              {/* Descuento 5% */}
              <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                <span className="text-slate-700">Descuento Pre-Holder (5%)</span>
                <span className="font-semibold text-red-600">-${discountAmount.toFixed(2)} USD</span>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center pb-3 border-b border-blue-300 bg-white p-3 rounded">
                <span className="font-semibold text-slate-900">Subtotal</span>
                <span className="font-bold text-lg">${subtotal.toFixed(2)} USD</span>
              </div>

              {/* Crédito Depósito */}
              <div className="flex justify-between items-center pb-3 border-b border-blue-300 bg-emerald-50 p-3 rounded">
                <span className="text-slate-700">Crédito Depósito Aplicado</span>
                <span className="font-bold text-emerald-600">-${DEPOSIT_CREDIT}.00 USD</span>
              </div>

              {/* TOTAL A PAGAR */}
              <div className="flex justify-between items-center bg-gradient-to-r from-sky-600 to-cyan-600 text-white p-4 rounded-lg font-bold text-lg">
                <span>TOTAL A PAGAR HOY</span>
                <span>${Math.max(0, totalToPay).toFixed(2)} USD</span>
              </div>
            </div>

            {totalToPay <= 0 && (
              <Alert className="border-emerald-200 bg-emerald-50 mb-4">
                <Zap className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-emerald-900">
                  ¡Tu depósito cubre el costo completo! Solo necesitas confirmar.
                </AlertDescription>
              </Alert>
            )}

            {/* Formula explanation */}
            <div className="bg-white p-3 rounded border border-blue-200 text-xs text-slate-600">
              <p className="font-mono">Total = (P × 0.95) − 100 = (${publicPrice} × 0.95) − 100 = ${totalToPay.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Confirmación */}
        <Alert className="border-sky-200 bg-sky-50">
          <AlertCircle className="w-4 h-4 text-sky-600" />
          <AlertDescription className="text-sky-900">
            Al confirmar, tu depósito de $100 será aplicado a esta compra y marcado como NO REEMBOLSABLE.
          </AlertDescription>
        </Alert>

        {/* CTA */}
        <div className="flex gap-4">
          <Button
            className="flex-1 h-12 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isLoading ? 'Procesando...' : 'Completar Compra'}
          </Button>
          <Link href="/dashboard/member/pre-holder-dashboard" className="flex-1">
            <Button variant="outline" className="w-full h-12">
              Volver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
