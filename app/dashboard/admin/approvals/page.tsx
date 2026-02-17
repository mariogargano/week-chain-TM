import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, XCircle, Clock, Building2 } from "lucide-react"

export default async function ApprovalsPage() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const pendingCount = properties?.length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Property Approvals</h1>
          <p className="text-slate-600 mt-2">Revisar y aprobar propiedades enviadas</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Pendientes</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{pendingCount}</div>
            <p className="text-xs text-slate-600 mt-1">Esperando revisión</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Aprobadas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">0</div>
            <p className="text-xs text-slate-600 mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Rechazadas</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">0</div>
            <p className="text-xs text-slate-600 mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Propiedades Pendientes</CardTitle>
          <CardDescription>Propiedades esperando aprobación</CardDescription>
        </CardHeader>
        <CardContent>
          {properties && properties.length > 0 ? (
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="p-6 rounded-lg border bg-slate-50 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-lg bg-slate-200 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{property.name}</h3>
                        <p className="text-slate-600 text-sm mt-1">{property.location}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No hay propiedades pendientes de aprobación</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
