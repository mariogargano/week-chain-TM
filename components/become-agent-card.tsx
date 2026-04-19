"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, ArrowRight, Loader2, Share2 } from "lucide-react"
import { toast } from "sonner"

interface AgentStatusResponse {
  isAgent: boolean
  profile: {
    id: string
    referral_code: string
    status: string
  } | null
  kycStatus?: string
}

export function BecomeAgentCard() {
  const router = useRouter()
  const [status, setStatus] = useState<AgentStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    let active = true
    fetch("/api/intermediary/me")
      .then((r) => r.json())
      .then((data) => {
        if (active) setStatus(data)
      })
      .catch(() => {
        if (active) setStatus({ isAgent: false, profile: null })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const activate = async () => {
    setActivating(true)
    try {
      const res = await fetch("/api/intermediary/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "dashboard_button" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "No se pudo activar")
      toast.success("Modo agente activado")
      router.push("/dashboard/agent?welcome=1")
    } catch (e: any) {
      toast.error(e.message || "Error al activar modo agente")
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-white">
        <CardContent className="flex items-center gap-3 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span className="text-sm text-muted-foreground">Cargando estado de agente...</span>
        </CardContent>
      </Card>
    )
  }

  if (status?.isAgent && status.profile) {
    return (
      <Card className="border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-amber-900">Modo agente activo</p>
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">4% comision</Badge>
                </div>
                <p className="mt-0.5 text-sm text-amber-800">
                  Tu codigo: <span className="font-mono font-semibold">{status.profile.referral_code}</span>
                </p>
              </div>
            </div>
            <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
              <Link href="/dashboard/agent">
                Ver dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">Conviertete en Agente WEEK-CHAIN</p>
              <p className="mt-0.5 text-sm text-amber-800">
                Gana 4% de comision sobre cada certificado que vendas con tu link personal.
                <span className="ml-1 text-xs text-amber-700">Requiere KYC aprobado para cobrar.</span>
              </p>
            </div>
          </div>
          <Button
            onClick={activate}
            disabled={activating}
            className="bg-amber-500 text-white hover:bg-amber-600 md:flex-shrink-0"
          >
            {activating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activando...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Activar modo agente
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
