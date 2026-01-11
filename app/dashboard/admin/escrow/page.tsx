"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Users, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"

export default function EscrowPage() {
  const router = useRouter()
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("escrow_deposits")
      .select(`
        *,
        users (
          email,
          full_name
        )
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setDeposits(data)
    }
    setLoading(false)
  }

  const handleConfirm = async (depositId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const response = await fetch("/api/admin/escrow/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositId, adminId: user.id }),
    })

    if (response.ok) {
      fetchDeposits()
    }
  }

  // Calculate totals
  const totalDeposited = deposits?.reduce((sum, d) => sum + Number.parseFloat(d.amount_usdc), 0) || 0
  const totalConfirmed =
    deposits?.filter((d) => d.status === "confirmed").reduce((sum, d) => sum + Number.parseFloat(d.amount_usdc), 0) || 0
  const pendingCount = deposits?.filter((d) => d.status === "pending").length || 0

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/admin")}
              className="bg-white/90 backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gestión de Escrow
              </h1>
              <p className="text-slate-600">Administra depósitos USDC y saldo WEEK de usuarios</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total en Escrow</CardTitle>
                <Wallet className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">${totalDeposited.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">USDC depositados</p>
              </CardContent>
            </Card>

            <Card className="border-green-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Confirmados</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">${totalConfirmed.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Depósitos confirmados</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{pendingCount}</div>
                <p className="text-xs text-slate-500 mt-1">Esperando confirmación</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Usuarios</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{deposits?.length || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Con depósitos</p>
              </CardContent>
            </Card>
          </div>

          {/* Deposits Table */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900">Depósitos Recientes</CardTitle>
              <CardDescription className="text-slate-600">
                Historial de depósitos USDC en escrow multisig
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Monto USDC</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">WEEK Emitido</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits?.map((deposit) => (
                      <tr key={deposit.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-800">{deposit.users?.full_name || "N/A"}</div>
                            <div className="text-sm text-slate-600">{deposit.users?.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          ${Number.parseFloat(deposit.amount_usdc).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-purple-600">
                          {Number.parseFloat(deposit.week_balance_issued).toLocaleString()} WEEK
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              deposit.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : deposit.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }
                          >
                            {deposit.status === "confirmed" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {deposit.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {deposit.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                            {deposit.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(deposit.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {deposit.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirm(deposit.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            >
                              Confirmar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
