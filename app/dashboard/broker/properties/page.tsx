"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, DollarSign, Copy, ExternalLink, Check } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Property {
  id: string
  name: string
  location: string
  images: string[]
  price_per_week: number
  weeks_available: number
  commission_percentage: number
}

export default function BrokerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [brokerCode, setBrokerCode] = useState<string>("")

  useEffect(() => {
    loadProperties()
    loadBrokerCode()
  }, [])

  const loadBrokerCode = async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user?.email) {
      setBrokerCode(data.user.email.split("@")[0].toUpperCase())
    }
  }

  const loadProperties = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("properties").select("*").eq("status", "active")

    if (!error && data) {
      setProperties(data)
    }
    setLoading(false)
  }

  const copyReferralLink = async (propertyId: string) => {
    const link = `${window.location.origin}/properties/${propertyId}?ref=${brokerCode}`

    await navigator.clipboard.writeText(link)
    setCopiedId(propertyId)
    toast.success("Link copiado al portapapeles")

    setTimeout(() => setCopiedId(null), 2000)
  }

  const calculateCommission = (price: number, percentage: number) => {
    return ((price * (percentage || 6)) / 100).toFixed(2)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Propiedades Disponibles</h1>
        <p className="text-muted-foreground">Comparte estas propiedades con tus clientes y gana comisión</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando propiedades...</p>
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay propiedades disponibles en este momento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                {property.images?.[0] ? (
                  <Image
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#C7CEEA] to-[#FFB7B2] flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-white/50" />
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{property.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio por semana</p>
                    <p className="text-2xl font-bold">${property.price_per_week?.toLocaleString() || "N/A"}</p>
                  </div>
                  <Badge variant="secondary">{property.weeks_available || 0} semanas</Badge>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Tu comisión: ${calculateCommission(property.price_per_week || 0, property.commission_percentage)}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">{property.commission_percentage || 6}% por cada venta</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => copyReferralLink(property.id)}
                    className="flex-1"
                    variant={copiedId === property.id ? "secondary" : "default"}
                  >
                    {copiedId === property.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`/properties/${property.id}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
