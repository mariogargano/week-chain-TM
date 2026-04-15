'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, Check, Lock, Clock } from 'lucide-react';

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function PreHolderPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 60,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev
        
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
          if (minutes < 0) {
            minutes = 59
            hours--
            if (hours < 0) {
              hours = 23
              days--
              if (days < 0) {
                days = 0
                seconds = 0
                minutes = 0
                hours = 0
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
          depositAmount: 100,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error processing deposit')
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el deposito')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Countdown Banner */}
        <div className="mb-12 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Pre-Holder Program</h1>
              <p className="text-slate-300 text-lg">Acceso exclusivo con $100 USD de deposito reembolsable</p>
            </div>
            
            {/* Countdown Timer */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2 bg-slate-900/50 backdrop-blur border border-emerald-500/30 rounded-xl p-6 min-w-24">
                <div className="text-4xl font-bold text-emerald-400 font-mono">{String(countdown.days).padStart(2, '0')}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Dias</div>
              </div>
              <div className="flex flex-col items-center gap-2 bg-slate-900/50 backdrop-blur border border-emerald-500/30 rounded-xl p-6 min-w-24">
                <div className="text-4xl font-bold text-emerald-400 font-mono">{String(countdown.hours).padStart(2, '0')}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Horas</div>
              </div>
              <div className="flex flex-col items-center gap-2 bg-slate-900/50 backdrop-blur border border-emerald-500/30 rounded-xl p-6 min-w-24">
                <div className="text-4xl font-bold text-emerald-400 font-mono">{String(countdown.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Minutos</div>
              </div>
              <div className="flex flex-col items-center gap-2 bg-slate-900/50 backdrop-blur border border-emerald-500/30 rounded-xl p-6 min-w-24">
                <div className="text-4xl font-bold text-emerald-400 font-mono">{String(countdown.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Segundos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Benefits & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Spots */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">473 de 500 Lugares</h2>
                <div className="w-full h-2 bg-slate-700 rounded-full mx-4 max-w-xs">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full" style={{ width: '94.6%' }}></div>
                </div>
              </div>
              <p className="text-slate-300">27 lugares disponibles. Programa limitado a 500 participantes.</p>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Beneficios Pre-Holder</h2>
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">5% Descuento</h3>
                    <p className="text-sm text-slate-400">En la compra de tu primer certificado SVC</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Credito de $100 USD</h3>
                    <p className="text-sm text-slate-400">Aplicable hacia tu compra inmediata</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Acceso Exclusivo</h3>
                    <p className="text-sm text-slate-400">Antes del lanzamiento publico oficial</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">100% Reembolsable</h3>
                    <p className="text-sm text-slate-400">Hasta 2 meses si cambias de idea</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Formula */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Ejemplo de Calculo</h2>
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between items-center pb-2">
                  <span>Precio Certificado:</span>
                  <span className="font-mono font-bold text-white">$10,000 USD</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span>Descuento Pre-Holder (5%):</span>
                  <span className="font-mono font-bold text-emerald-400">-$500 USD</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span>Credito Deposito:</span>
                  <span className="font-mono font-bold text-emerald-400">-$100 USD</span>
                </div>
                <div className="border-t border-slate-600 pt-3 flex justify-between items-center font-bold text-white text-lg">
                  <span>Total a Pagar Hoy:</span>
                  <span className="font-mono text-emerald-400">$9,400 USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/30 shadow-2xl sticky top-24">
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="text-white">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Juan Perez"
                      className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="juan@example.com"
                      className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">Telefono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+52 123 456 7890"
                      className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <Alert className="bg-slate-700/50 border-emerald-500/30">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <AlertDescription className="text-slate-300 text-sm">
                      100% reembolsable durante 2 meses si no completas la compra.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-lg rounded-lg transition-all duration-300"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        Procesando...
                      </span>
                    ) : (
                      'Depositar $100 USD'
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-500">
                    Pago seguro con Stripe - No se guardan datos de tarjeta
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            Terminos Importantes
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-400">
            <div>
              <ul className="space-y-2">
                <li>• Deposito reembolsable hasta 2 meses</li>
                <li>• Pago seguro y encriptado con Stripe</li>
                <li>• Verificacion de identidad incluida</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li>• Solo 500 lugares disponibles globalmente</li>
                <li>• Descuento se aplica automticamente al checkout</li>
                <li>• Soporte exclusivo para pre-holders</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
