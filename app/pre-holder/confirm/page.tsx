'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [depositInfo, setDepositInfo] = useState<any>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const verifyDeposit = async () => {
      try {
        const response = await fetch(`/api/pre-holder/verify?session_id=${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error)
        }

        setDepositInfo(data)
        setStatus('success')
        toast.success('Depósito confirmado exitosamente')
      } catch (error: any) {
        console.error('Verification error:', error)
        setStatus('error')
        toast.error('Error verificando el depósito')
      }
    }

    verifyDeposit()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {status === 'loading' && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="animate-spin mx-auto mb-4">
                <Clock className="w-12 h-12 text-sky-600" />
              </div>
              <p className="text-lg text-slate-600">Verificando tu depósito...</p>
            </CardContent>
          </Card>
        )}

        {status === 'success' && depositInfo && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="w-16 h-16 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">
                ¡Depósito Confirmado!
              </h1>
              <p className="text-lg text-slate-600">
                Tu depósito de $100 USD ha sido procesado exitosamente
              </p>
            </div>

            <Card className="border-2 border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-emerald-900 mb-4">Resumen de tu Pre-Holder</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Nombre:</span>
                    <span className="font-semibold">{depositInfo?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Email:</span>
                    <span className="font-semibold">{depositInfo?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Depósito:</span>
                    <span className="font-semibold text-emerald-600">$100.00 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Descuento:</span>
                    <span className="font-semibold">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Código Referral:</span>
                    <span className="font-mono text-blue-600">{depositInfo?.referralCode || 'PH-XXXX'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Tu deposito te da <strong>acceso exclusivo</strong> antes del lanzamiento publico para comprar certificados con 5% de descuento.
              </AlertDescription>
            </Alert>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                <strong>100% Reembolsable:</strong> Puedes solicitar el reembolso de tu deposito en cualquier momento hasta 2 meses si decides no comprar.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/dashboard/member/pre-holder-dashboard">
                <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold">
                  Ver Mi Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/certificates">
                <Button variant="outline" className="w-full">
                  Explorar Certificados
                </Button>
              </Link>
            </div>

            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-3">Próximos Pasos</h3>
                <ol className="space-y-2 text-sm text-slate-600">
                  <li>1. Revisa tu email para confirmación del depósito</li>
                  <li>2. Accede a tu dashboard de pre-holder</li>
                  <li>3. Explora los certificados disponibles</li>
                  <li>4. Completa tu compra antes del 22 de Abril</li>
                  <li>5. Tu depósito se aplicará automáticamente</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}

        {status === 'error' && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
              <p className="text-red-800 mb-4">Hubo un problema al verificar tu deposito</p>
              <Link href="/pre-holder">
                <Button>Intentar de Nuevo</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="animate-spin mx-auto mb-4">
              <Clock className="w-12 h-12 text-sky-600" />
            </div>
            <p className="text-lg text-slate-600">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmContent />
    </Suspense>
  )
}
