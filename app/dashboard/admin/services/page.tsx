"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, Search, Filter, Plus, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ServicesAdminPage() {
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [searchTerm, categoryFilter, services])

  const fetchServices = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("vacation_services")
      .select(`
        *,
        categories:category_id (name, icon),
        providers:provider_id (name, verified)
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setServices(data)
      setFilteredServices(data)
    }
    setLoading(false)
  }

  const filterServices = () => {
    let filtered = services

    if (categoryFilter !== "all") {
      filtered = filtered.filter((s) => s.category_id === categoryFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.providers?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredServices(filtered)
  }

  const toggleVerification = async (serviceId: string, currentStatus: boolean) => {
    const supabase = createClient()
    await supabase.from("vacation_services").update({ verified: !currentStatus }).eq("id", serviceId)
    fetchServices()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Servicios</h1>
          <p className="text-slate-600">Administra el catálogo de servicios vacacionales</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Servicio
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Verificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{services.filter((s) => s.verified).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{services.filter((s) => !s.verified).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catálogo de Servicios</CardTitle>
              <CardDescription>Servicios vacacionales disponibles en la plataforma</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                  <SelectItem value="food">Comida</SelectItem>
                  <SelectItem value="activities">Actividades</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio USD</TableHead>
                <TableHead>Precio MXN</TableHead>
                <TableHead>Verificado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando servicios...
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-500">No se encontraron servicios</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{service.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{service.providers?.name || "N/A"}</span>
                        {service.providers?.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.categories?.name || "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">${Number(service.price_usd).toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600">${Number(service.price_mxn).toLocaleString()} MXN</TableCell>
                    <TableCell>
                      {service.verified ? (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVerification(service.id, service.verified)}
                        >
                          {service.verified ? "Desverificar" : "Verificar"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
