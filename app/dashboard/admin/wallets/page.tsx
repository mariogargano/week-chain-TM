import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Users } from "lucide-react"

export default async function WalletsPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("users")
    .select("id, email, full_name, wallet_address, created_at")
    .order("created_at", { ascending: false })

  const connectedWallets = users?.filter((u) => u.wallet_address).length || 0
  const totalUsers = users?.length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Wallet Management</h1>
        <p className="text-slate-600 mt-2">Gestión de wallets conectadas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Wallets Conectadas</CardTitle>
            <Wallet className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{connectedWallets}</div>
            <p className="text-xs text-slate-600 mt-1">Usuarios con wallet</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Usuarios</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalUsers}</div>
            <p className="text-xs text-slate-600 mt-1">Registrados</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Tasa de Conexión</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {totalUsers > 0 ? Math.round((connectedWallets / totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-600 mt-1">Usuarios con wallet</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallets Conectadas</CardTitle>
          <CardDescription>Lista de usuarios con wallets conectadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users
              ?.filter((u) => u.wallet_address)
              .map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">{user.full_name || user.email}</p>
                    <p className="text-sm text-slate-600 font-mono">{user.wallet_address}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Conectada
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
