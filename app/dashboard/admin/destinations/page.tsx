"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Globe, DollarSign, BarChart3, Plus, Edit } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

interface Destination {
  id: string
  name: string
  location: string
  location_group: string
  country_code: string
  description: string
  image_url: string
  property_type: string
  base_price_usd: number
  availability_percentage: number
  status: "available" | "coming_soon" | "waitlist"
  featured: boolean
  legal_disclaimer: string
  display_order: number
  created_at: string
}

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [filterGroup, setFilterGroup] = useState("all")

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/destinations/catalog")
      const data = await response.json()

      if (response.ok) {
        setDestinations(data.destinations || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching destinations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDestinations =
    filterGroup === "all" ? destinations : destinations.filter((d) => d.location_group === filterGroup)

  const getStatusBadge = (status: string) => {
    const config = {
      available: { color: "bg-green-500", label: "Disponible" },
      coming_soon: { color: "bg-blue-500", label: "Próximamente" },
      waitlist: { color: "bg-orange-500", label: "Lista de Espera" },
    }
    const { color, label } = config[status as keyof typeof config]
    return <Badge className={`${color} text-white`}>{label}</Badge>
  }

  const stats = {
    total: destinations.length,
    available: destinations.filter((d) => d.status === "available").length,
    coming_soon: destinations.filter((d) => d.status === "coming_soon").length,
    featured: destinations.filter((d) => d.featured).length,
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Destinos</h1>
              <p className="text-slate-600">Administra el catálogo global de propiedades participantes</p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Destino
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Destinos</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <Globe className="h-10 w-10 text-slate-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Disponibles</p>
                    <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                  </div>
                  <MapPin className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Próximamente</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.coming_soon}</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Destacados</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.featured}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Select value={filterGroup} onValueChange={setFilterGroup}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Región" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Regiones</SelectItem>
                    <SelectItem value="México">México</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="Canadá">Canadá</SelectItem>
                    <SelectItem value="Brasil">Brasil</SelectItem>
                    <SelectItem value="Italia">Italia</SelectItem>
                    <SelectItem value="Albania">Albania</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchDestinations} variant="outline">
                  Refrescar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Destinations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500">Cargando destinos...</p>
                </CardContent>
              </Card>
            ) : filteredDestinations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">No hay destinos en esta región</p>
                </CardContent>
              </Card>
            ) : (
              filteredDestinations.map((destination) => (
                <Card key={destination.id} className="hover:shadow-lg transition-all">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={destination.image_url || "/placeholder.svg?height=300&width=400"}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    {destination.featured && (
                      <Badge className="absolute top-2 right-2 bg-purple-600 text-white">Destacado</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{destination.name}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {destination.location}
                          </div>
                        </CardDescription>
                      </div>
                      {getStatusBadge(destination.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Precio base:</span>
                      <span className="font-bold text-slate-900">
                        ${destination.base_price_usd?.toLocaleString()} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Disponibilidad:</span>
                      <span className="font-semibold text-green-600">{destination.availability_percentage}%</span>
                    </div>
                    <Badge variant="outline">{destination.property_type}</Badge>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setEditingDestination(destination)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
