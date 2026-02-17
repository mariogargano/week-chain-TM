import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, MapPin, Users, Bed, Bath, CheckCircle2, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockProperties = [
  {
    id: "demo-1",
    name: "Aflora Tulum - Residencia de Lujo",
    location: "Tulum, Quintana Roo",
    description: "Residencia de lujo frente al mar con acceso privado a la playa",
    price_per_week: 3558,
    price: 3558,
    total_weeks: 52,
    available_weeks: 34,
    weeks_sold: 18,
    presale_target: 52,
    amenities: ["Piscina infinity", "Playa privada", "WiFi", "Aire acondicionado", "Chef disponible"],
    images: ["/luxury-beach-resort-tulum.jpg"],
    status: "active",
    property_type: "villa",
    bedrooms: 5,
    bathrooms: 4,
    max_guests: 10,
  },
  {
    id: "demo-2",
    name: "Tulum Paradise - Villa Exclusiva",
    location: "Tulum, Quintana Roo",
    description: "Villa exclusiva con vista al mar Caribe y amenidades premium",
    price_per_week: 4038,
    price: 4038,
    total_weeks: 52,
    available_weeks: 52,
    weeks_sold: 0,
    presale_target: 52,
    amenities: ["Vista al mar", "Piscina privada", "WiFi", "Jacuzzi", "Seguridad 24/7"],
    images: ["/luxury-villa-cancun-beach.jpg"],
    status: "active",
    property_type: "villa",
    bedrooms: 6,
    bathrooms: 5,
    max_guests: 12,
  },
  {
    id: "demo-3",
    name: "Villa Paraíso Cancún",
    location: "Cancún, Quintana Roo",
    description: "Villa de lujo con vista panorámica al mar Caribe",
    price_per_week: 3173,
    price: 3173,
    total_weeks: 52,
    available_weeks: 40,
    weeks_sold: 12,
    presale_target: 52,
    amenities: ["Playa privada", "Piscina", "WiFi", "Aire acondicionado", "Gimnasio"],
    images: ["/luxury-villa-cancun-beach.jpg"],
    status: "active",
    property_type: "villa",
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
  },
  {
    id: "demo-4",
    name: "Penthouse Polanco Premium",
    location: "Polanco, Ciudad de México",
    description: "Penthouse de lujo en el corazón de Polanco con vistas espectaculares",
    price_per_week: 3750,
    price: 3750,
    total_weeks: 52,
    available_weeks: 44,
    weeks_sold: 8,
    presale_target: 52,
    amenities: ["Terraza panorámica", "WiFi", "Gimnasio privado", "Seguridad 24/7", "Concierge"],
    images: ["/luxury-penthouse-mexico-city.jpg"],
    status: "active",
    property_type: "apartment",
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
  },
  {
    id: "demo-5",
    name: "Casa Colonial San Miguel",
    location: "San Miguel de Allende, Guanajuato",
    description: "Casa colonial restaurada en el centro histórico",
    price_per_week: 2788,
    price: 2788,
    total_weeks: 52,
    available_weeks: 27,
    weeks_sold: 25,
    presale_target: 52,
    amenities: ["Patio central", "WiFi", "Chimenea", "Terraza en azotea", "Arte mexicano"],
    images: ["/colonial-house-san-miguel-allende.jpg"],
    status: "active",
    property_type: "house",
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
  },
  {
    id: "demo-6",
    name: "Cabaña Valle de Bravo",
    location: "Valle de Bravo, Estado de México",
    description: "Cabaña de montaña con vista al lago",
    price_per_week: 2019,
    price: 2019,
    total_weeks: 52,
    available_weeks: 37,
    weeks_sold: 15,
    presale_target: 52,
    amenities: ["Chimenea de leña", "WiFi", "Vista al lago", "Jardín", "Kayaks incluidos"],
    images: ["/mountain-cabin-lake-view-mexico.jpg"],
    status: "active",
    property_type: "cabin",
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
  },
  {
    id: "demo-7",
    name: "Loft Condesa Moderno",
    location: "Condesa, Ciudad de México",
    description: "Loft moderno en la vibrante Condesa",
    price_per_week: 2404,
    price: 2404,
    total_weeks: 52,
    available_weeks: 32,
    weeks_sold: 20,
    presale_target: 52,
    amenities: ["Diseño moderno", "WiFi", "Terraza", "Cocina gourmet", "Ubicación céntrica"],
    images: ["/modern-loft-condesa-mexico.jpg"],
    status: "active",
    property_type: "loft",
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
  },
  {
    id: "demo-8",
    name: "Residencia Los Cabos",
    location: "Los Cabos, Baja California Sur",
    description: "Residencia de lujo frente al océano Pacífico",
    price_per_week: 3942,
    price: 3942,
    total_weeks: 52,
    available_weeks: 47,
    weeks_sold: 5,
    presale_target: 52,
    amenities: ["Vista al océano", "Piscina infinity", "WiFi", "Campo de golf", "Spa"],
    images: ["/luxury-residence-los-cabos-ocean.jpg"],
    status: "active",
    property_type: "villa",
    bedrooms: 5,
    bathrooms: 4,
    max_guests: 10,
  },
]

const mockReviews = [
  {
    id: "1",
    user_name: "María González",
    user_avatar: "",
    rating: 5,
    comment:
      "Experiencia increíble! La villa superó todas nuestras expectativas. La ubicación es perfecta y las instalaciones de primera clase.",
    date: "2024-12-15",
    verified: true,
  },
  {
    id: "2",
    user_name: "Carlos Rodríguez",
    user_avatar: "",
    rating: 5,
    comment:
      "Pasamos una semana maravillosa. El servicio de WEEK Management fue impecable, todo estaba listo a nuestra llegada.",
    date: "2024-11-28",
    verified: true,
  },
  {
    id: "3",
    user_name: "Ana Martínez",
    user_avatar: "",
    rating: 4,
    comment: "Muy buena propiedad, solo algunos detalles menores de mantenimiento. En general, muy recomendable.",
    date: "2024-10-10",
    verified: true,
  },
]

async function fetchPropertyById(id) {
  const isDemoProperty = id.startsWith("demo-")

  if (isDemoProperty) {
    return mockProperties.find((p) => p.id === id)
  } else {
    const supabase = await createClient()
    const { data: property } = await supabase.from("properties").select("*").eq("id", id).maybeSingle()
    return property
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  const property = await fetchPropertyById(id)

  if (!property) {
    notFound()
  }

  const weeklyPrice = property.price_per_week || property.price || 3500
  const pricePerYear = Math.round(weeklyPrice / 15)
  const pricePerNight = Math.round(pricePerYear / 7)

  const isDemoMode = process.env.NODE_ENV === "development" || !process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/20 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/properties"
            className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-2"
          >
            ← Volver a Alojamientos Participantes
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div>
              <Badge className="mb-3 bg-amber-100 text-amber-800 border-amber-200">
                <Building2 className="w-3 h-3 mr-1" />
                Alojamiento Participante
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.name}</h1>
              <p className="text-slate-600 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-violet-600" />
                {property.location}
              </p>
            </div>

            {/* Property Image */}
            {property.images?.[0] && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-violet-600" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-violet-600" />
                    Amenidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Specs */}
            <div className="flex flex-wrap gap-4">
              {property.bedrooms && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                  <Bed className="h-5 w-5 text-violet-500" />
                  <span className="text-sm">{property.bedrooms} Recámaras</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                  <Bath className="h-5 w-5 text-violet-500" />
                  <span className="text-sm">{property.bathrooms} Baños</span>
                </div>
              )}
              {property.max_guests && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                  <Users className="h-5 w-5 text-violet-500" />
                  <span className="text-sm">Hasta {property.max_guests} huéspedes</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - SVC Info Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-2 border-violet-200">
              <CardHeader className="bg-gradient-to-br from-violet-50 to-purple-50">
                <CardTitle className="flex items-center gap-2 text-violet-900">
                  <Star className="h-5 w-5 text-violet-600" />
                  Acceso con Smart Vacational Certificate
                </CardTitle>
                <CardDescription>Alojamiento participante del sistema WEEK-CHAIN</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* SVC Benefits */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Derecho de solicitud 15 años</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Certificado Digital incluido</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Acceso a red de alojamientos</span>
                  </div>
                </div>

                {/* Critical Disclaimer */}
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-4">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Importante:</strong> Este es un alojamiento de referencia. El acceso está{" "}
                      <strong>sujeto a disponibilidad</strong> y NO garantiza fechas, temporadas ni destinos
                      específicos. Tu certificado otorga derecho de solicitud, no propiedad.
                    </p>
                  </CardContent>
                </Card>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-6"
                >
                  <Link href="/auth">
                    <Star className="h-5 w-5 mr-2" />
                    Adquirir Smart Vacational Certificate
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
