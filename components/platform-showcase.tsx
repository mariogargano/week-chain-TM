"use client"
import Image from "next/image"
import { MapPin, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface Property {
  id: string
  name: string
  location: string
  city: string
  country: string
  image_url: string
  price: number
  max_guests: number
  bedrooms: number
  bathrooms: number
}

export function PlatformShowcase() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const defaultProperties: Property[] = [
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
      },
    ]

    fetch("/api/destinations/list")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setProperties(data.slice(0, 8))
        } else {
          setProperties(defaultProperties)
        }
        setLoading(false)
      })
      .catch(() => {
        setProperties(defaultProperties)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-[#FFDAC1]/10 via-white to-[#B5EAD7]/10 py-16 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-slate-600">Cargando destinos...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-br from-[#FFDAC1]/10 via-white to-[#B5EAD7]/10 py-16 md:py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-4">
            Destinos Participantes
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ejemplos de alojamientos participantes en el sistema WEEK-CHAIN (sujeto a disponibilidad)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 max-w-7xl mx-auto">
          {properties.map((property) => (
            <Link href="/destinos" key={property.id} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
                {/* Property Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <Image
                    src={property.image_url || "/placeholder.svg?height=400&width=600"}
                    alt={property.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#B5EAD7]/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-emerald-800">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs font-semibold">{property.country}</span>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#FF9AA2] transition-colors line-clamp-1">
                    {property.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-1">{property.city}</p>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>{property.max_guests} huéspedes</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center space-y-4">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:opacity-90 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/auth">
              Adquirir Certificado
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            * Los alojamientos mostrados son ejemplos de referencia del sistema. No constituyen asignación ni garantía
            de destinos específicos. Acceso sujeto a disponibilidad y aprobación.
          </p>
        </div>
      </div>
    </section>
  )
}
