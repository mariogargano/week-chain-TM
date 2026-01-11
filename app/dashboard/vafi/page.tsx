"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, CheckCircle, XCircle, ArrowLeft, AlertCircle } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

interface Loan {
  id: string
  borrower_wallet: string
  loan_amount_usdc: number
  interest_rate: number
  ltv_ratio: number
  health_factor: number
  status: string
  created_at: string
  due_date: string
  repaid_at: string | null
  liquidated_at: string | null
}

export default function VaFiDashboard() {
  return (
    <RoleGuard allowedRoles={["vafi_manager", "admin"]}>
      <VaFiDashboardContent />
    </RoleGuard>
  )
}

function VaFiDashboardContent() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [stats, setStats] = useState({
    activeLoans: 0,
    totalLent: 0,
    atRisk: 0,
    repaid: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLoans()
  }, [])

  async function loadLoans() {
    const supabase = createClient()

    const { data, error } = await supabase.from("vafi_loans").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setLoans(data)

      const activeLoans = data.filter((l) => l.status === "active").length
      const totalLent = data.filter((l) => l.status === "active").reduce((sum, l) => sum + l.loan_amount_usdc, 0)
      const atRisk = data.filter((l) => l.health_factor < 1.2 && l.status === "active").length
      const repaid = data.filter((l) => l.status === "repaid").length

      setStats({ activeLoans, totalLent, atRisk, repaid })
    }

    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )
      case "repaid":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pagado
          </Badge>
        )
      case "liquidated":
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Liquidado
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getHealthBadge = (healthFactor: number) => {
    if (healthFactor >= 1.5) {
      return <Badge className="bg-green-500">Saludable</Badge>
    } else if (healthFactor >= 1.2) {
      return <Badge className="bg-yellow-500">Precaución</Badge>
    } else {
      return (
        <Badge className="bg-red-500">
          <AlertCircle className="h-3 w-3 mr-1" />
          Riesgo
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Cargando préstamos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Módulo VA-FI™ No Disponible</h1>
            <p className="text-slate-700 mb-6 max-w-md mx-auto">
              El módulo VA-FI™ no está habilitado actualmente. Esta funcionalidad estará disponible próximamente.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
