"use client"

import { createBrowserClient } from "@/lib/supabase/client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
  FileCheck,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { RoleGuard } from "@/components/role-guard"

type KycStatusType = "missing" | "pending" | "approved" | "failed"

interface KycData {
  status: KycStatusType
  persona_inquiry_id: string | null
  persona_session_token: string | null
  kyc_updated_at: string | null
}

export default function KycPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="rounded-2xl p-8 text-center bg-background shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <KycPageContent />
    </Suspense>
  )
}

function KycPageContent() {
  const searchParams = useSearchParams()
  const nextUrl = searchParams?.get("next")
  const [kycData, setKycData] = useState<KycData | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchKycStatus()
  }, [])

  const fetchKycStatus = async () => {
    try {
      const res = await fetch("/api/kyc/status")
      const data = await res.json()

      if (res.ok) {
        setKycData(data)
      } else {
        setKycData({ status: "missing", persona_inquiry_id: null, persona_session_token: null, kyc_updated_at: null })
      }
    } catch {
      setKycData({ status: "missing", persona_inquiry_id: null, persona_session_token: null, kyc_updated_at: null })
    }
    setLoading(false)
  }

  const startVerification = async () => {
    setStarting(true)
    setError(null)

    try {
      const res = await fetch("/api/kyc/create-inquiry", { method: "POST" })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Error al iniciar verificacion")

      if (data.status === "already_approved") {
        setKycData((prev) => prev ? { ...prev, status: "approved" } : prev)
        return
      }

      // Update local state to pending
      setKycData((prev) => prev ? {
        ...prev,
        status: "pending",
        persona_inquiry_id: data.inquiryId || prev.persona_inquiry_id,
        persona_session_token: data.sessionToken || prev.persona_session_token,
      } : prev)

      // If we got a Persona session token, the Persona widget would open here
      // For now, show pending state (admin manual review or Persona redirect)
      if (data.sessionToken && typeof window !== "undefined") {
        // If Persona JS SDK is loaded, open the widget
        // Otherwise, show manual review message
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar verificacion")
    } finally {
      setStarting(false)
    }
  }

  const statusConfig = {
    missing: {
      icon: Shield,
      iconColor: "text-sky-500",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
      title: "Verifica tu identidad",
      description: "La verificacion KYC es obligatoria antes de realizar cualquier compra. Es un proceso rapido y seguro que protege a todos los miembros de WEEK-CHAIN.",
      badge: { text: "Requerido", color: "bg-sky-100 text-sky-700" },
    },
    pending: {
      icon: Clock,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      title: "Verificacion en proceso",
      description: "Estamos revisando tu documentacion. Este proceso puede tomar entre unos minutos y 24 horas. Te notificaremos por correo cuando este lista.",
      badge: { text: "En revision", color: "bg-amber-100 text-amber-700" },
    },
    approved: {
      icon: Check,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      title: "Verificacion completada",
      description: "Tu identidad ha sido verificada exitosamente. Ya puedes adquirir certificados vacacionales.",
      badge: { text: "Verificado", color: "bg-emerald-100 text-emerald-700" },
    },
    failed: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Verificacion rechazada",
      description: "No pudimos verificar tu identidad. Esto puede deberse a documentos ilegibles o informacion incorrecta. Puedes intentar de nuevo o contactar soporte.",
      badge: { text: "Rechazado", color: "bg-red-100 text-red-700" },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="rounded-2xl p-8 text-center bg-background shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando estado KYC...</p>
        </div>
      </div>
    )
  }

  const status = kycData?.status || "missing"
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <RoleGuard allowedRoles={["user", "member", "admin", "broker", "broker_elite"]}>
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/member">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al dashboard
        </Link>
      </Button>

      {/* Main KYC Card */}
      <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6 sm:p-8`}>
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center mx-auto mb-4`}>
            <StatusIcon className={`h-8 w-8 ${config.iconColor}`} />
          </div>
          <Badge className={`${config.badge.color} border-0 mb-3`}>{config.badge.text}</Badge>
          <h1 className="text-2xl font-bold text-foreground mb-2">{config.title}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">{config.description}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3">
          {(status === "missing" || status === "failed") && (
            <Button
              onClick={startVerification}
              disabled={starting}
              className="bg-sky-500 hover:bg-sky-600 min-h-[48px] px-8 text-base"
            >
              {starting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <UserCheck className="h-5 w-5 mr-2" />
                  {status === "failed" ? "Reintentar verificacion" : "Iniciar verificacion con Persona"}
                </>
              )}
            </Button>
          )}

          {status === "pending" && (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Procesando...</span>
              </div>
              <Button variant="outline" onClick={fetchKycStatus}>
                Verificar estado
              </Button>
            </div>
          )}

          {status === "approved" && (
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 min-h-[48px] px-8 text-base">
              <Link href={nextUrl === "checkout" ? "/#certificados" : "/dashboard/member"}>
                {nextUrl === "checkout" ? (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Continuar a compra
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Ir al dashboard
                  </>
                )}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background rounded-xl p-4 border border-border text-center">
          <Shield className="h-6 w-6 text-sky-500 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground text-sm mb-1">Seguro</h3>
          <p className="text-xs text-muted-foreground">Tus datos estan protegidos con encriptacion de grado bancario.</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border text-center">
          <Clock className="h-6 w-6 text-sky-500 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground text-sm mb-1">Rapido</h3>
          <p className="text-xs text-muted-foreground">El proceso toma menos de 5 minutos. Resultados en 24 horas max.</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border text-center">
          <FileCheck className="h-6 w-6 text-sky-500 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground text-sm mb-1">Una sola vez</h3>
          <p className="text-xs text-muted-foreground">Solo necesitas verificarte una vez para todas tus compras futuras.</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-background rounded-2xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-3">Preguntas frecuentes</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">{"?"}Por que necesito verificar mi identidad?</p>
            <p className="text-sm text-muted-foreground">La verificacion KYC es un requisito legal para transacciones financieras y protege a todos los participantes del sistema.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{"?"}Que documentos necesito?</p>
            <p className="text-sm text-muted-foreground">Una identificacion oficial vigente (INE, pasaporte) y una selfie para confirmar tu identidad.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{"?"}Cuanto tarda la verificacion?</p>
            <p className="text-sm text-muted-foreground">Normalmente se completa en minutos. En casos excepcionales, puede tomar hasta 24 horas.</p>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
