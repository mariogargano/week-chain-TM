"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      name: "Reporte de Ventas",
      description: "Ventas totales y comisiones del mes",
      type: "sales",
      lastGenerated: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Reporte de Usuarios",
      description: "Nuevos registros y actividad de usuarios",
      type: "users",
      lastGenerated: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Reporte de Transacciones", // Changed from "Reporte Financiero"
      description: "Estado de transacciones y pagos", // Changed from "Estado financiero y transacciones"
      type: "financial",
      lastGenerated: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Reporte de Propiedades",
      description: "Propiedades activas y ocupación",
      type: "properties",
      lastGenerated: new Date().toISOString(),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-600 mt-2">Generar y descargar reportes del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {report.name}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>Último: {new Date(report.lastGenerated).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generar
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
