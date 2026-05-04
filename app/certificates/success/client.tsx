"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Download, ArrowRight, Check, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SuccessPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [certificate, setCertificate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const sessionId = searchParams?.get("session_id")

  useEffect(() => {
    const loadCertificate = async () => {
      if (!sessionId) {
        setError("No session found")
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        // Fetch certificate by checkout session ID
        const { data: cert, error: certError } = await supabase
          .from("certificates")
          .select("*")
          .eq("checkout_session_id", sessionId)
          .eq("user_id", user.id)
          .maybeSingle()

        if (certError || !cert) {
          setError("No se encontró el certificado")
          setLoading(false)
          return
        }

        setCertificate(cert)
        setLoading(false)
      } catch (err) {
        console.error("[v0] Error loading certificate:", err)
        setError("Error cargando certificado")
        setLoading(false)
      }
    }

    loadCertificate()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-slate-300">Cargando tu certificado...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="max-w-md mx-auto text-center space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white">Error</h1>
          <p className="text-slate-300">{error}</p>
          <Link href="/dashboard/member">
            <Button className="w-full">Ir al Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Success Hero */}
        <div className="max-w-3xl mx-auto">
          {/* Checkmark Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              ¡Compra Exitosa!
            </h1>
            <p className="text-xl text-slate-300">
              Tu certificado SVC ha sido activado correctamente
            </p>
          </div>

          {/* Certificate Card */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-10 backdrop-blur">
            <div className="space-y-6">
              {/* Certificate Number */}
              <div>
                <p className="text-slate-400 text-sm mb-2">Número de Certificado</p>
                <p className="text-3xl font-mono font-bold text-emerald-400">
                  {certificate.certificate_number || "WC-XXXX-XXXXX"}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-t border-b border-slate-700">
                <div>
                  <p className="text-slate-400 text-sm">Tipo de Plan</p>
                  <p className="text-lg font-semibold text-white mt-1">SVC {certificate.pax}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Huéspedes</p>
                  <p className="text-lg font-semibold text-white mt-1">{certificate.pax} Pax</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Vigencia</p>
                  <p className="text-lg font-semibold text-white mt-1">15 Años</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Semanas/Año</p>
                  <p className="text-lg font-semibold text-white mt-1">1 Semana</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Estado</p>
                  <p className="text-lg font-semibold text-emerald-400 mt-1">
                    {certificate.status === "active" ? "Activo" : "Activando..."}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Semanas</p>
                  <p className="text-lg font-semibold text-white mt-1">15 Semanas</p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-3 pt-2">
                <p className="text-slate-300 font-semibold">Próximos pasos:</p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span>Tu certificado está listo para usar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-500">•</span>
                    <span>Completa tu KYC para desbloquear reservas</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-500">•</span>
                    <span>Selecciona tu primera estancia desde el calendario</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {/* Download PDF */}
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
              <Download className="w-5 h-5" />
              <span>Descargar PDF</span>
            </button>

            {/* Add to Wallet */}
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
              <span>Agregar a Apple Wallet</span>
            </button>
          </div>

          {/* Go to Dashboard Button */}
          <Link href="/dashboard/member" className="block">
            <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Ir al Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          {/* Additional Info */}
          <div className="mt-10 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>Nota:</strong> Tu certificado está pendiente de verificación KYC. 
              Una vez completada, podrás solicitar tu primera estancia desde el calendario.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
