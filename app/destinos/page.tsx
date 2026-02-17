import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Globe, MapPin, Users, Bed, Bath, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Destinos Participantes | WEEK-CHAIN",
  description:
    "Explora la red global de destinos vacacionales disponibles para solicitar mediante tu Smart Vacational Certificate.",
}

export const dynamic = "force-dynamic"

export default async function DestinosPage() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .in("status", ["available", "coming_soon"])
    .order("location_group")
    .order("name")

  const fallbackProperties = [
    {
      id: "uxan-tulum",
      name: "UXAN",
      location: "Riviera Maya",
      city: "Tulum",
      country: "México",
      image_url: "/images/12.jpeg",
      price: 12500,
      max_guests: 8,
      bedrooms: 4,
      bathrooms: 4,
      location_group: "RIVIERA MAYA",
      status: "available",
      description: "Arquitectura orgánica con celosía de madera en la selva maya",
    },
    {
      id: "vila-ksamil",
      name: "Vila Ksamil",
      location: "Riviera Albanesa",
      city: "Ksamil",
      country: "Albania",
      image_url: "/luxury-modern-beachfront-villa-ksamil-albania-whit.jpg",
      price: 11800,
      max_guests: 10,
      bedrooms: 5,
      bathrooms: 4,
      location_group: "BALKAN RIVIERA",
      status: "available",
      description: "Villa moderna frente al mar Jónico con vistas panorámicas",
    },
    {
      id: "bosphorus-yali",
      name: "Bosphorus Yalı",
      location: "Bósforo",
      city: "Estambul",
      country: "Turquía",
      image_url: "/ottoman-yali-mansion-bosphorus-istanbul-waterfront.jpg",
      price: 14900,
      max_guests: 12,
      bedrooms: 6,
      bathrooms: 5,
      location_group: "MEDITERRANEAN",
      status: "available",
      description: "Mansión otomana renovada en el estrecho del Bósforo",
    },
    {
      id: "borgo-civita",
      name: "Borgo di Civita",
      location: "Umbría",
      city: "Orvieto",
      country: "Italia",
      image_url: "/medieval-stone-borgo-orvieto-umbria-italy-hilltop-.jpg",
      price: 13200,
      max_guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      location_group: "ITALIAN COUNTRYSIDE",
      status: "available",
      description: "Borgo medieval de piedra en las colinas de Umbría",
    },
    {
      id: "casa-bacalar",
      name: "Casa Bacalar",
      location: "Laguna de los Siete Colores",
      city: "Bacalar",
      country: "México",
      image_url: "/modern-luxury-villa-bacalar-lagoon-mexico-overwate.jpg",
      price: 9800,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      location_group: "CARIBBEAN MEXICO",
      status: "available",
      description: "Villa moderna con deck sobre la laguna de siete colores",
    },
    {
      id: "villa-positano",
      name: "Villa Positano",
      location: "Costa Amalfitana",
      city: "Positano",
      country: "Italia",
      image_url: "/cliffside-villa-positano-amalfi-coast-italy-medite.jpg",
      price: 16500,
      max_guests: 10,
      bedrooms: 5,
      bathrooms: 5,
      location_group: "AMALFI COAST",
      status: "available",
      description: "Villa en acantilado con terrazas escalonadas sobre el Mediterráneo",
    },
    {
      id: "chalet-dolomites",
      name: "Chalet Dolomiti",
      location: "Dolomitas",
      city: "Cortina d'Ampezzo",
      country: "Italia",
      image_url: "/luxury-alpine-chalet-dolomites-italy-mountain-view.jpg",
      price: 14200,
      max_guests: 8,
      bedrooms: 4,
      bathrooms: 4,
      location_group: "ITALIAN ALPS",
      status: "available",
      description: "Chalet alpino de lujo con acceso directo a pistas de esquí",
    },
    {
      id: "finca-puebla",
      name: "Finca Cholula",
      location: "Valle de Puebla",
      city: "Cholula",
      country: "México",
      image_url: "/colonial-hacienda-cholula-puebla-mexico-pyramid-vi.jpg",
      price: 8900,
      max_guests: 12,
      bedrooms: 6,
      bathrooms: 4,
      location_group: "CENTRAL MEXICO",
      status: "available",
      description: "Hacienda colonial con vistas a la pirámide de Cholula",
    },
  ]

  const displayProperties = properties && properties.length > 0 ? properties : fallbackProperties

  // Group by region
  const grouped = displayProperties?.reduce(
    (acc, prop) => {
      const region = prop.location_group || "OTHER"
      if (!acc[region]) acc[region] = []
      acc[region].push(prop)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-r from-[#C7CEEA] via-[#B5EAD7] to-[#FFDAC1] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="h-12 w-12 text-slate-800" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">Destinos Participantes</h1>
          <p className="text-lg md:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Red global de propiedades vacacionales de lujo disponibles mediante tu Smart Vacational Certificate
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Star className="h-4 w-4 mr-2 inline" />
              Propiedades Verificadas
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <MapPin className="h-4 w-4 mr-2 inline" />8 Destinos
            </Badge>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer Banner */}
      <div className="bg-amber-50 border-y border-amber-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <strong className="font-semibold">Aviso Legal Importante:</strong> Los destinos listados están sujetos a
            disponibilidad mediante el proceso REQUEST → OFFER → CONFIRM. Tu certificado NO garantiza acceso a destinos,
            fechas o temporadas específicas.
          </div>
        </div>
      </div>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {Object.entries(grouped || {}).map(([region, destinations]) => (
            <div key={region}>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-3 flex-1">
                  <MapPin className="h-7 w-7 text-[#B5EAD7]" />
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{region}</h2>
                </div>
                <Badge variant="outline" className="px-4 py-2">
                  {destinations.length} {destinations.length === 1 ? "Destino" : "Destinos"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {destinations.map((property: any) => (
                  <Card
                    key={property.id}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-slate-200"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={property.image_url || "/placeholder.svg?height=300&width=400"}
                        alt={property.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 border-0"
                        variant="secondary"
                      >
                        {property.status === "available" ? "Disponible" : "Próximamente"}
                      </Badge>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{property.name}</h3>
                        <p className="text-sm text-white/90 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.city}, {property.country}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      <p className="text-sm text-slate-600 line-clamp-2">{property.description || property.location}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{property.max_guests || 8}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bed className="h-4 w-4" />
                          <span>{property.bedrooms || 4}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4" />
                          <span>{property.bathrooms || 3}</span>
                        </div>
                      </div>

                      {property.status === "available" && (
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:opacity-90"
                        >
                          <Link href={`/dashboard/user/request-reservation?property=${property.id}`}>
                            Solicitar Acceso →
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Disclaimer */}
      <section className="py-12 px-4 sm:px-6 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-600 space-y-3">
          <p>
            <strong className="text-slate-900">Proceso de Solicitud:</strong> REQUEST (Usuario solicita) → OFFER
            (Sistema ofrece opciones disponibles) → CONFIRM (Usuario confirma).
          </p>
          <p>
            Todas las solicitudes están sujetas a disponibilidad real sin garantías de destinos, fechas o temporadas
            específicas. El certificado otorga derechos personales y temporales de uso vacacional por hasta 15 años.
          </p>
        </div>
      </section>
    </div>
  )
}
