import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default async function WeekBalancePage() {
  const supabase = await createClient()

  // Fetch WEEK balances
  const { data: balances } = await supabase
    .from("week_balances")
    .select(`
      *,
      users (
        email,
        full_name
      )
    `)
    .order("balance", { ascending: false })

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("week_transactions")
    .select(`
      *,
      users (
        email,
        full_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Calculate totals
  const totalWeekIssued = balances?.reduce((sum, b) => sum + Number.parseFloat(b.balance), 0) || 0
  const totalLocked = balances?.reduce((sum, b) => sum + Number.parseFloat(b.locked_balance), 0) || 0
  const totalAvailable = totalWeekIssued - totalLocked

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Saldo WEEK</h1>
        <p className="text-slate-600 mt-2">Gestión de saldo interno WEEK de usuarios</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total WEEK Emitido</CardTitle>
            <Coins className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalWeekIssued.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">WEEK en circulación</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Disponible</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalAvailable.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">WEEK disponible</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Bloqueado</CardTitle>
            <ArrowDownRight className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalLocked.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">WEEK en reservas</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Usuarios Activos</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{balances?.length || 0}</div>
            <p className="text-xs text-slate-600 mt-1">Con saldo WEEK</p>
          </CardContent>
        </Card>
      </div>

      {/* Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Saldos de Usuarios</CardTitle>
          <CardDescription>Saldo WEEK de cada usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Saldo Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Disponible</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Bloqueado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Última Actualización</th>
                </tr>
              </thead>
              <tbody>
                {balances?.map((balance) => (
                  <tr key={balance.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-800">{balance.users?.full_name || "N/A"}</div>
                        <div className="text-sm text-slate-600">{balance.users?.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-purple-600">
                      {Number.parseFloat(balance.balance).toLocaleString()} WEEK
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      {(
                        Number.parseFloat(balance.balance) - Number.parseFloat(balance.locked_balance)
                      ).toLocaleString()}{" "}
                      WEEK
                    </td>
                    <td className="py-3 px-4 font-semibold text-yellow-600">
                      {Number.parseFloat(balance.locked_balance).toLocaleString()} WEEK
                    </td>
                    <td className="py-3 px-4 text-slate-600">{new Date(balance.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Historial de movimientos WEEK</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Monto</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Descripción</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-800">{tx.users?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={tx.transaction_type === "credit" ? "default" : "secondary"}
                        className={
                          tx.transaction_type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }
                      >
                        {tx.transaction_type === "credit" ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {tx.transaction_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {Number.parseFloat(tx.amount).toLocaleString()} WEEK
                    </td>
                    <td className="py-3 px-4 text-slate-600">{tx.description}</td>
                    <td className="py-3 px-4 text-slate-600">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
