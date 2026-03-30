'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function PreHolderDashboard() {
  const router = useRouter()
  const [preHolder, setPreHolder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchPreHolder = async () => {
      try {
        // Get from localStorage or auth
        const stored = localStorage.getItem('preHolderSession')
        if (stored) {
          setPreHolder(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Error fetching pre-holder data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreHolder()
  }, [])

  const copyReferralCode = () => {
    if (preHolder?.referralCode) {
      navigator.clipboard.writeText(preHolder.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Código copiado')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!preHolder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <p className="text-lg text-slate-600 mb-4">No hay sesión activa de pre-holder</p>
              <Button onClick={() => router.push('/pre-holder')}>
                Volver a Registrar Depósito
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const earlyAccessEnd = new Date(preHolder.earlyAccessEnds)
  const daysRemaining = Math.ceil((earlyAccessEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isActive = daysRemaining > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Tu Dashboard Pre-Holder</h1>
          <p className="text-lg text-slate-600 mt-2">Bienvenido, {preHolder.fullName}</p>
        </div>

        {/* Status */}
        {isActive && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900">
              Tu acceso exclusivo está activo. Tienes <strong>{daysRemaining} días</strong> para comprar con 5% descuento.
            </AlertDescription>
          </Alert>
        )}

        {!isActive && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-900">
              Tu período de acceso exclusivo ha expirado. Tu depósito será reembolsado.
            </AlertDescription>
          </Alert>
        )}

        {/* Deposit Info */}
        <Card className="border-2 border-sky-200">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Información del Depósito</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-500">Depósito Pagado</span>
                  <p className="text-2xl font-bold text-emerald-600">$100.00 USD</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Descuento Aplicable</span>
                  <p className="text-2xl font-bold text-blue-600">5%</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-500">Crédito en Checkout</span>
                  <p className="text-2xl font-bold text-purple-600">$100.00 USD</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Acceso Exclusivo Hasta</span>
                  <p className="text-lg font-bold">{earlyAccessEnd.toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4">Tu Código de Referral</h2>
            <p className="text-sm text-slate-600 mb-3">Comparte este código y gana bonificaciones:</p>
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-purple-200">
              <code className="flex-1 font-mono text-lg font-bold text-purple-600">
                {preHolder.referralCode}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyReferralCode}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Formula */}
        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4">Cálculo en tu Compra</h2>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2 font-mono text-sm">
              <div>Precio Público: <span className="float-right font-bold">P</span></div>
              <div>Descuento 5%: <span className="float-right font-bold">-P × 0.05</span></div>
              <div>Subtotal: <span className="float-right font-bold">P × 0.95</span></div>
              <div className="border-t-2 border-blue-300 pt-2">
                Tu Crédito: <span className="float-right font-bold">-$100.00</span>
              </div>
              <div className="border-t-2 border-blue-400 pt-2 bg-blue-100 px-2 py-1 rounded font-bold">
                Total a Pagar: <span className="float-right">(P × 0.95) - 100</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              El descuento y el crédito se aplican automáticamente cuando completes tu compra.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        {isActive && (
          <div className="flex gap-4">
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700"
              onClick={() => router.push('/checkout/pre-holder')}
            >
              Comprar Certificado Ahora
            </Button>
            <Button variant="outline" className="flex-1 h-12">
              Explorar Opciones
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
