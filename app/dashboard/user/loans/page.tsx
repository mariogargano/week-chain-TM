"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, TrendingUp, DollarSign, Calendar, Lock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Loan {
  id: string
  nft_mint: string
  principal: number
  apr: number
  ltv: number
  due_date: string
  status: string
  created_at: string
  funded_at: string | null
  repaid_at: string | null
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [moduleEnabled, setModuleEnabled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchLoans()
    checkModuleStatus()
  }, [])

  async function fetchLoans() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLoans(data || [])
    } catch (error) {
      console.error("[v0] Error fetching loans:", error)
    } finally {
      setLoading(false)
    }
  }

  async function checkModuleStatus() {
    // Placeholder for checking module status
    // This should be replaced with actual logic to determine if the module is enabled
    setModuleEnabled(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "funded":
        return "default"
      case "repaid":
        return "secondary"
      case "default":
        return "destructive"
      case "signed":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (!moduleEnabled) {
    return (
      <div className="container mx-auto p-6">
        <Link
          href="/dashboard/user"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>

        <Card className="border-amber-200 bg-amber-50 max-w-2xl mx-auto">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Módulo VA-FI™ No Disponible</h1>
            <p className="text-slate-700 mb-6 max-w-md mx-auto">
              El módulo VA-FI™ no está habilitado actualmente. Esta funcionalidad estará disponible próximamente.
            </p>
            <p className="text-sm text-slate-600 mb-8">
              Cuando esté habilitado, podrás obtener liquidez usando tus certificados vacacionales como garantía.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/user">Volver a Mi Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Préstamos DeFi</h1>
          <p className="text-muted-foreground">
            Usa tus Certificados Digitales WEEK como colateral para obtener liquidez
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/user/loans/new">Solicitar Préstamo</Link>
        </Button>
      </div>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes préstamos</h3>
            <p className="text-muted-foreground text-center mb-4">
              Usa tus Certificados Digitales WEEK como colateral para obtener préstamos con tasas competitivas
            </p>
            <Button asChild>
              <Link href="/dashboard/user/loans/new">Solicitar Primer Préstamo</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">${loan.principal.toLocaleString()}</CardTitle>
                  <Badge variant={getStatusColor(loan.status)}>{loan.status}</Badge>
                </div>
                <CardDescription className="font-mono text-xs">
                  {loan.nft_mint.slice(0, 8)}...{loan.nft_mint.slice(-8)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    APR
                  </span>
                  <span className="font-semibold">{loan.apr}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    LTV
                  </span>
                  <span className="font-semibold">{loan.ltv}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Vencimiento
                  </span>
                  <span className="font-semibold">{new Date(loan.due_date).toLocaleDateString()}</span>
                </div>
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href={`/dashboard/user/loans/${loan.id}`}>Ver Detalles</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
