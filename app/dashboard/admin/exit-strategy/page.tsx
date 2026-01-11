import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Users, Building2, PieChart } from "lucide-react"

export default async function ExitStrategyPage() {
  const supabase = await createClient()

  const { data: distributions } = await supabase
    .from("exit_distributions")
    .select(`
      *,
      properties (
        name,
        location
      )
    `)
    .order("distribution_date", { ascending: false })

  const totalDistributed = distributions?.reduce((sum, d) => sum + Number.parseFloat(d.total_sale_amount), 0) || 0
  const propertiesExited = distributions?.length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Exit Strategy</h1>
        <p className="text-slate-600 mt-2">Distribución 50/10/30/10 después de 15 años</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Distribuido</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">${totalDistributed.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">De ventas finales</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Propiedades Vendidas</CardTitle>
            <Building2 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{propertiesExited}</div>
            <p className="text-xs text-slate-600 mt-1">Después de 15 años</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Beneficiarios</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {distributions?.reduce((sum, d) => sum + (d.holder_distributions?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-slate-600 mt-1">Holders pagados</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Model */}
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Distribución</CardTitle>
          <CardDescription>Distribución de ganancias después de 15 años</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <PieChart className="h-8 w-8 text-purple-600" />
                <Badge className="bg-purple-600 text-white">50%</Badge>
              </div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2">Holders NFT</h3>
              <p className="text-sm text-slate-600">
                Distribuido proporcionalmente entre todos los holders de NFTs de la propiedad
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-8 w-8 text-blue-600" />
                <Badge className="bg-blue-600 text-white">10%</Badge>
              </div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2">Brokers</h3>
              <p className="text-sm text-slate-600">
                Para brokers que participaron en la venta inicial de la propiedad
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <Building2 className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-600 text-white">30%</Badge>
              </div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2">WEEK-CHAIN</h3>
              <p className="text-sm text-slate-600">Para la plataforma y mantenimiento del ecosistema</p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
                <Badge className="bg-yellow-600 text-white">10%</Badge>
              </div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2">Reserva DAO</h3>
              <p className="text-sm text-slate-600">Fondo de reserva controlado por la DAO para futuras inversiones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Distribuciones</CardTitle>
          <CardDescription>Distribuciones completadas después de 15 años</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Propiedad</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Venta Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Holders (50%)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Brokers (10%)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">WEEK-CHAIN (30%)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">DAO (10%)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {distributions?.map((dist) => {
                  const total = Number.parseFloat(dist.total_sale_amount)
                  const holders = total * 0.5
                  const brokers = total * 0.1
                  const weekchain = total * 0.3
                  const dao = total * 0.1

                  return (
                    <tr key={dist.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-800">{dist.properties?.name}</div>
                          <div className="text-sm text-slate-600">{dist.properties?.location}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">${total.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-purple-600">${holders.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">${brokers.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">${weekchain.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-yellow-600">${dao.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(dist.distribution_date).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
