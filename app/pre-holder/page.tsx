'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { AlertCircle, Check, Lock } from 'lucide-react'
import Link from 'next/link'

export default function PreHolderPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/pre-holder/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          depositAmount: 100, // USD
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error processing deposit')
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el depósito')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-4">
            Solo 500 lugares disponibles
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Pre-Holder Early Access
          </h1>
          <p className="text-lg text-slate-600">
            Deposito de $100 USD reembolsable - 5% descuento - 14 dias de acceso exclusivo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left: Benefits */}
          <div className="space-y-4">
            <Card className="border-2 border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-emerald-900 mb-4">Beneficios Pre-Holder</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-emerald-900">
                      <strong>5% descuento</strong> en la compra del certificado
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-emerald-900">
                      <strong>Crédito de $100 USD</strong> aplicable a tu compra
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-emerald-900">
                      <strong>14 días</strong> de acceso exclusivo antes del público
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-emerald-900">
                      <strong>100% reembolsable</strong> si no compras en 72h
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Formula */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-blue-900 mb-3">Cálculo en Checkout</h3>
                <div className="space-y-2 text-sm text-blue-900">
                  <div>Precio Público: <strong>P</strong></div>
                  <div>Descuento 5%: <strong>-P × 0.05</strong></div>
                  <div>Subtotal: <strong>P × 0.95</strong></div>
                  <div className="border-t-2 border-blue-300 pt-2 font-bold">
                    Total Hoy: <strong>(P × 0.95) - 100</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Form */}
          <Card className="border-2 border-sky-200">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+52 123 456 7890"
                    required
                  />
                </div>

                <Alert>
                  <Lock className="w-4 h-4" />
                  <AlertDescription>
                    Tu depósito de $100 USD es 100% reembolsable si no completas la compra en 72 horas.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold"
                >
                  {isLoading ? 'Procesando...' : 'Depositar $100 USD'}
                </Button>

                <p className="text-xs text-center text-slate-500">
                  Serás redirigido a Stripe para completar el pago seguro
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Terms */}
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-3">Términos Importantes</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• El depósito es válido por 72 horas desde el pago</li>
              <li>• Refund automático si no compras en este período</li>
              <li>• El descuento se aplica solo durante la ventana de 14 días</li>
              <li>• Una vez aplicado a una compra, el depósito NO es reembolsable</li>
              <li>• Máximo 500 pre-holders disponibles</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
