"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  MapPin,
  Users,
  Bed,
  Bath,
  Maximize,
  Wifi,
  Wind,
  Tv,
  Car,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Eye,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
import { NotaryBadge } from "@/components/notary-badge"

// Property Data
const AFLORA_PROPERTY = {
  id: "aflora-tulum",
  name: "AFLORA Tulum",
  location: "Tulum, Quintana Roo, México",
  type: "Alojamiento Participante - Referencia",
  specs: {
    bedrooms: 1,
    bathrooms: 1,
    size: "65m²",
    maxGuests: 2,
  },
  amenities: [
    { icon: <Wifi className="h-5 w-5" />, label: "WiFi Alta Velocidad" },
    { icon: <Wind className="h-5 w-5" />, label: "Aire Acondicionado" },
    { icon: <Tv className="h-5 w-5" />, label: "Smart TV" },
    { icon: <Car className="h-5 w-5" />, label: "Estacionamiento" },
  ],
  features: ["Alberca Natural", "Spa & Wellness", "Restaurante", "Yoga Deck", "Cenote Privado"],
  gallery: [
    "/images/diseno-sin-titulo-4.jpg",
    "/images/photo-2025-10-08-12-39-27-203.jpg",
    "/images/photo-2025-10-08-12-39-27-202.jpg",
    "/images/photo-2025-10-08-12-39-27-204.jpg",
  ],
  description:
    "Ejemplo de alojamiento participante: departamento en el corazón de Tulum con arquitectura orgánica, rodeado de selva maya. Este es un destino de referencia en el sistema WEEK-CHAIN.",
}

export default function AfloraPropertyPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % AFLORA_PROPERTY.gallery.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FFDAC1]/5 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9AA2]/10 via-[#FFDAC1]/10 to-[#C7CEEA]/10" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="mb-4">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-[#FF9AA2] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a Alojamientos Participantes
            </Link>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0">
                  <Eye className="w-3 h-3 mr-1" />
                  {AFLORA_PROPERTY.type}
                </Badge>
                <Badge className="bg-[#B5EAD7]/20 text-[#B5EAD7] border-[#B5EAD7]/30">
                  <Info className="w-3 h-3 mr-1" />
                  Ejemplo Inspiracional
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{AFLORA_PROPERTY.name}</h1>
              <p className="text-slate-600 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FF9AA2]" />
                {AFLORA_PROPERTY.location}
              </p>
            </div>
            <div className="text-right bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <p className="text-xs text-slate-400 mb-1">Acceso mediante</p>
              <p className="text-lg font-bold text-[#B5EAD7]">Smart Vacational</p>
              <p className="text-lg font-bold text-[#B5EAD7]">Certificate</p>
              <p className="text-xs text-slate-400 mt-2">Sujeto a disponibilidad</p>
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Bed className="h-5 w-5 text-[#FFB7B2]" />
              {AFLORA_PROPERTY.specs.bedrooms} Recámara
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Bath className="h-5 w-5 text-[#C7CEEA]" />
              {AFLORA_PROPERTY.specs.bathrooms} Baño
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Maximize className="h-5 w-5 text-[#B5EAD7]" />
              {AFLORA_PROPERTY.specs.size}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Users className="h-5 w-5 text-[#FFDAC1]" />
              Hasta {AFLORA_PROPERTY.specs.maxGuests} huéspedes
            </span>
          </div>
        </div>
      </section>

      {/* Gallery and Info Grid */}
      <section className="px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl mb-4">
                <Image
                  src={AFLORA_PROPERTY.gallery[currentImageIndex] || "/placeholder.svg"}
                  alt={AFLORA_PROPERTY.name}
                  fill
                  className="object-cover transition-all duration-700"
                />
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + AFLORA_PROPERTY.gallery.length) % AFLORA_PROPERTY.gallery.length,
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-900" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % AFLORA_PROPERTY.gallery.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                >
                  <ChevronRight className="h-5 w-5 text-slate-900" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {AFLORA_PROPERTY.gallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <NotaryBadge propertyId={AFLORA_PROPERTY.id} />
            </div>

            {/* Property Info */}
            <div className="space-y-6">
              {/* Description */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#FF9AA2]" />
                    Descripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">{AFLORA_PROPERTY.description}</p>
                </CardContent>
              </Card>

              {/* SVC Disclaimer */}
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Info className="h-5 w-5 text-amber-600" />
                    Destino de Referencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-800 leading-relaxed mb-4">
                    Este es un <span className="font-bold">ejemplo de alojamiento participante</span> en el sistema
                    WEEK-CHAIN. El acceso está sujeto a disponibilidad del sistema y{" "}
                    <span className="font-bold">NO está garantizado</span> para fechas, temporadas o destinos
                    específicos.
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Tu Smart Vacational Certificate otorga el <span className="font-bold">derecho de solicitud</span> de
                    uso temporal, no propiedad ni asignación de este inmueble en particular.
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#FF9AA2]" />
                    Amenidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {AFLORA_PROPERTY.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <div className="text-[#FF9AA2]">{amenity.icon}</div>
                        <span className="text-sm text-slate-700">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#FF9AA2]" />
                    Características Destacadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {AFLORA_PROPERTY.features.map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs px-3 py-1 bg-gradient-to-r from-[#FFDAC1]/30 to-[#FFB7B2]/30 text-slate-700 border border-[#FFDAC1]/50"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-[#B5EAD7]/10 via-white to-[#FFDAC1]/10">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Accede a Este y Más Destinos Participantes</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-6">
              Con tu Smart Vacational Certificate, podrás solicitar acceso temporal a destinos participantes como este,
              sujeto a disponibilidad del sistema WEEK-CHAIN.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white shadow-lg h-12 px-8"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Adquirir Smart Vacational Certificate
                </Button>
              </Link>
              <Link href="/properties">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 px-8"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Ver Más Destinos de Referencia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
