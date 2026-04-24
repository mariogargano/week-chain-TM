import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building2, DollarSign } from "lucide-react"

export default async function WeeksPage() {
  const supabase = await createClient()

  const { data: weeks } = await supabase
    .from("weeks")
    .select(`
      *,
      properties (
        name,
        location
      ),
      users (
        email,
        full_name
      )
    `)
    .order("week_number", { ascending: true })

  const totalWeeks = weeks?.length || 0
  const soldWeeks = weeks?.filter((w) => w.status === "sold").length || 0
  const availableWeeks = weeks?.filter((w) => w.status === "available").length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Semanas - Certificados Digitales</h1>
        <p className="text-slate-600 mt-2">Administra semanas certificadas NOM-151 (15 años de uso)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Semanas</CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalWeeks}</div>
            <p className="text-xs text-slate-600 mt-1">Semanas certificadas</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Vendidas</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{soldWeeks}</div>
            <p className="text-xs text-slate-600 mt-1">Certificados en circulación</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Disponibles</CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{availableWeeks}</div>
            <p className="text-xs text-slate-600 mt-1">Listas para venta</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semanas - Certificados Digitales</CardTitle>
          <CardDescription>Cada Certificado Digital da derecho a 1 semana/año durante 15 años</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Semana #</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Propiedad</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Propietario</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Precio</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Certificado ID</th>
                </tr>
              </thead>
              <tbody>
                {weeks?.map((week) => (
                  <tr key={week.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-purple-600">Semana {week.week_number}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-800">{week.properties?.name}</div>
                        <div className="text-sm text-slate-600">{week.properties?.location}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {week.owner_id ? (
                        <div>
                          <div className="text-sm text-slate-800">{week.users?.full_name || "N/A"}</div>
                          <div className="text-xs text-slate-600">{week.users?.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Sin propietario</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={week.status === "sold" ? "default" : "secondary"}
                        className={week.status === "sold" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}
                      >
                        {week.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      ${Number.parseFloat(week.price || "0").toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {week.nft_mint_address ? (
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {week.nft_mint_address.slice(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-slate-400 text-sm">No emitido</span>
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
