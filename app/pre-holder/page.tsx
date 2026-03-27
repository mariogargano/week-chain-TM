'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle, Users, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const TIERS = [
  {
    id: 'holder-bronze',
    name: 'Bronze Pre-Holder',
    price: 99,
    benefits: ['Acceso anticipado al sistema', '1 Certificado de vacaciones', 'Comisión del 2%'],
  },
  {
    id: 'holder-silver',
    name: 'Silver Pre-Holder',
    price: 299,
    benefits: ['Acceso anticipado al sistema', '3 Certificados de vacaciones', 'Comisión del 3%'],
    popular: true,
  },
  {
    id: 'holder-gold',
    name: 'Gold Pre-Holder',
    price: 799,
    benefits: ['Acceso anticipado al sistema', '5 Certificados de vacaciones', 'Comisión del 4%'],
  },
]

export default function PreHolderPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedTier, setSelectedTier] = useState('holder-silver')
  const [loading, setLoading] = useState(false)
  const [referralCode, setReferralCode] = useState('')

  const handleCheckout = async () => {
    if (!email || !name || !phone) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/pre-holder/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone,
          tier: selectedTier,
          referralCode: referralCode || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creating checkout session')
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const tier = TIERS.find(t => t.id === selectedTier)
  const priceUSD = tier?.price || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            Pre-Holders Program
          </h1>
          <p className="text-xl text-slate-600">
            Acceso anticipado a WEEK-CHAIN con beneficios exclusivos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((t) => (
            <Card
              key={t.id}
              className={`cursor-pointer transition-all ${
                selectedTier === t.id
                  ? 'ring-2 ring-cyan-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedTier(t.id)}
            >
              <CardHeader>
                {t.popular && (
                  <div className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                    MÁS POPULAR
                  </div>
                )}
                <CardTitle>{t.name}</CardTitle>
                <div className="text-3xl font-bold text-cyan-600 mt-2">
                  ${t.price}
                  <span className="text-sm text-slate-600">/USD</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Completar Registro</CardTitle>
            <CardDescription>
              Proporciona tu información para acceso anticipado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Al completar el pago, recibirás acceso inmediato a WEEK-CHAIN
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <Input
                  type="tel"
                  placeholder="+52 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Código de Referido (opcional)
                </label>
                <Input
                  placeholder="Si tienes código de referido"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600">Tier seleccionado:</span>
                  <span className="font-semibold text-slate-900">{tier?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Monto a pagar:</span>
                  <span className="text-lg font-bold text-cyan-600">${priceUSD} USD</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading || !email || !name || !phone}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-lg font-bold h-12"
              >
                {loading ? 'Procesando...' : `Pagar $${priceUSD} USD`}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Tu pago será procesado seguramente por Stripe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <Card>
            <CardHeader>
              <Users className="h-5 w-5 text-cyan-600 mb-2" />
              <CardTitle>¿Qué es un Pre-Holder?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Un Pre-Holder es un usuario que accede anticipadamente a WEEK-CHAIN antes del lanzamiento público. 
              Obtienes certificados de vacaciones y comisiones por cada referido.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-5 w-5 text-cyan-600 mb-2" />
              <CardTitle>Beneficios Exclusivos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Como Pre-Holder obtienes acceso anticipado, certificados digitales y comisiones por referidos. 
              Sé parte de la comunidad más temprana de WEEK-CHAIN.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
