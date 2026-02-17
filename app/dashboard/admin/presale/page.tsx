import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Calendar, CheckCircle, Clock, Building2 } from "lucide-react"

export default async function PresalePage() {
  const supabase = await createClient()

  // Fetch properties with presale info
  const { data: properties } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

  // Fetch weeks sold per property
  const { data: weeksSold } = await supabase.from("weeks").select("property_id, status").eq("status", "sold")

  // Calculate presale stats
  const propertiesInPresale = properties?.filter((p) => p.presale_status === "active").length || 0
  const propertiesCompleted = properties?.filter((p) => p.presale_status === "completed").length || 0
  const totalWeeksSold = weeksSold?.length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gestión de Preventa</h1>
        <p className="text-slate-600 mt-2">Tracking de objetivo 48 semanas por propiedad</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">En Preventa</CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{propertiesInPresale}</div>
            <p className="text-xs text-slate-600 mt-1">Propiedades activas</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Completadas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{propertiesCompleted}</div>
            <p className="text-xs text-slate-600 mt-1">48+ semanas vendidas</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Semanas</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalWeeksSold}</div>
            <p className="text-xs text-slate-600 mt-1">Semanas vendidas</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Objetivo Global</CardTitle>
            <Target className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{properties ? properties.length * 48 : 0}</div>
            <p className="text-xs text-slate-600 mt-1">Semanas objetivo total</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties Presale Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Preventa por Propiedad</CardTitle>
          <CardDescription>Objetivo: 48 semanas vendidas para confirmar compra</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {properties?.map((property) => {
              const soldWeeks = weeksSold?.filter((w) => w.property_id === property.id).length || 0
              const progress = (soldWeeks / 48) * 100
              const isCompleted = soldWeeks >= 48

              return (
                <div key={property.id} className="space-y-3 p-4 rounded-lg border bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-slate-800">{property.name}</h3>
                        <p className="text-sm text-slate-600">{property.location}</p>
                      </div>
                    </div>
                    <Badge
                      variant={isCompleted ? "default" : "secondary"}
                      className={
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : property.presale_status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                      }
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completada
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          {property.presale_status}
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progreso de preventa</span>
                      <span className="font-semibold text-slate-800">
                        {soldWeeks} / 48 semanas ({progress.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{soldWeeks}</div>
                      <div className="text-xs text-slate-600">Vendidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{48 - soldWeeks}</div>
                      <div className="text-xs text-slate-600">Restantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${(soldWeeks * Number.parseFloat(property.price_per_week || "0")).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600">Recaudado</div>
                    </div>
                  </div>

                  {!isCompleted && property.presale_status === "active" && (
                    <div className="pt-2">
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Ver Detalles de Preventa
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
