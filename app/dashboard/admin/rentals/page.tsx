import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, DollarSign, TrendingUp, Calendar } from "lucide-react"

export default async function RentalsPage() {
  const supabase = await createClient()

  const { data: rentals } = await supabase
    .from("rental_bookings")
    .select(`
      *,
      weeks (
        week_number,
        properties (
          name,
          location
        ),
        users (
          email,
          full_name
        )
      )
    `)
    .order("check_in_date", { ascending: false })

  const totalRevenue = rentals?.reduce((sum, r) => sum + Number.parseFloat(r.total_amount), 0) || 0
  const activeRentals = rentals?.filter((r) => r.status === "confirmed").length || 0
  const pendingRentals = rentals?.filter((r) => r.status === "pending").length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Rentas</h1>
        <p className="text-slate-600 mt-2">Administra rentas y sincronización con OTAs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Ingresos Totales</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">De rentas</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Rentas Activas</CardTitle>
            <Home className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{activeRentals}</div>
            <p className="text-xs text-slate-600 mt-1">Confirmadas</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Pendientes</CardTitle>
            <Calendar className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{pendingRentals}</div>
            <p className="text-xs text-slate-600 mt-1">Por confirmar</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Rentas</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{rentals?.length || 0}</div>
            <p className="text-xs text-slate-600 mt-1">Históricas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rentas Recientes</CardTitle>
          <CardDescription>Historial de rentas y distribución de ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Propiedad</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Semana</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Propietario</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Check-in</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Monto Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">OTA</th>
                </tr>
              </thead>
              <tbody>
                {rentals?.map((rental) => (
                  <tr key={rental.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-800">{rental.weeks?.properties?.name}</div>
                        <div className="text-sm text-slate-600">{rental.weeks?.properties?.location}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-purple-600">Semana {rental.weeks?.week_number}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-800">{rental.weeks?.users?.full_name || "N/A"}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{new Date(rental.check_in_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      ${Number.parseFloat(rental.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={rental.status === "confirmed" ? "default" : "secondary"}
                        className={
                          rental.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : rental.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {rental.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {rental.ota_platform && (
                        <Badge variant="outline" className="text-xs">
                          {rental.ota_platform}
                        </Badge>
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
  )
}
