"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, Upload, AlertTriangle } from "lucide-react"
import { useState } from "react"

export default function DatabasePage() {
  const [loading, setLoading] = useState(false)

  const handleBackup = async () => {
    setLoading(true)
    // Simulate backup
    setTimeout(() => {
      setLoading(false)
      alert("Backup completado exitosamente")
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Database Tools</h1>
        <p className="text-slate-600 mt-2">Herramientas de gestión de base de datos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Backup Database
            </CardTitle>
            <CardDescription>Crear copia de seguridad de la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackup} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creando backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Crear Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Restore Database
            </CardTitle>
            <CardDescription>Restaurar desde copia de seguridad</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Restaurar Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              Sync Data
            </CardTitle>
            <CardDescription>Sincronizar datos entre sistemas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-500 hover:bg-green-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>Activar modo de mantenimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Activar Mantenimiento
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
          <CardDescription>Estado actual de la base de datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
              <div>
                <p className="font-semibold text-slate-800">Connection Status</p>
                <p className="text-sm text-slate-600">Supabase PostgreSQL</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
              <div>
                <p className="font-semibold text-slate-800">Last Backup</p>
                <p className="text-sm text-slate-600">Última copia de seguridad</p>
              </div>
              <span className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
