'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (sessionId) {
      // Verify payment with backend
      fetch(`/api/pre-holder/verify?session_id=${sessionId}`)
        .then(() => setVerified(true))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Pago Exitoso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {loading ? (
            <p className="text-slate-600">Verificando tu pago...</p>
          ) : verified ? (
            <>
              <p className="text-slate-600">
                Gracias por convertirte en Pre-Holder de WEEK-CHAIN
              </p>
              <p className="text-sm text-slate-500">
                Te hemos enviado un email de confirmación con tus detalles de acceso
              </p>
              <Link href="/dashboard/member">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                  Ir al Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-red-600">Error verificando el pago</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
