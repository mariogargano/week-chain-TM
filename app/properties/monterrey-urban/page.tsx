"use client"

import { useState } from "react"
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
  Dumbbell,
  Coffee,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Eye,
  AlertTriangle,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
import { NotaryBadge } from "@/components/notary-badge"

const property = {
  id: "monterrey-urban",
  name: "URBAN Monterrey",
  location: "Monterrey, Nuevo León, México",
  type: "Alojamiento Participante - Referencia",
  specs: {
    bedrooms: 2,
    bathrooms: 2,
    size: "95m²",
    maxGuests: 4,
  },
  amenities: [
    { icon: <Wifi className="h-5 w-5" />, label: "WiFi Alta Velocidad" },
    { icon: <Wind className="h-5 w-5" />, label: "Aire Acondicionado" },
    { icon: <Tv className="h-5 w-5" />, label: "Smart TV" },
    { icon: <Car className="h-5 w-5" />, label: "Estacionamiento Privado" },
    { icon: <Dumbbell className="h-5 w-5" />, label: "Gimnasio 24/7" },
    { icon: <Coffee className="h-5 w-5" />, label: "Co-Working Space" },
    { icon: <Shield className="h-5 w-5" />, label: "Seguridad 24/7" },
  ],
  features: ["Terraza Privada", "Sala de Juntas", "Roof Top con Alberca", "Business Center", "Concierge Premium"],
  gallery: [
    "/images/diseno-sin-titulo-28-124.jpg",
    "/images/diseno-sin-titulo-28-123.jpg",
    "/images/diseno-sin-titulo-28-122.jpg",
    "/images/diseno-sin-titulo-28-121.jpg",
  ],
  description:
    "Ejemplo de alojamiento participante: departamento ejecutivo en zona empresarial premium de Monterrey. Este es un destino de referencia en el sistema WEEK-CHAIN para viajeros de negocios.",
}

export default function MonterreyUrbanPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-purple-50/20 to-indigo-50/20" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="mb-4">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a Alojamientos Participantes
            </Link>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
                  <Eye className="w-3 h-3 mr-1" />
                  {property.type}
                </Badge>
                <Badge className="bg-amber-100/80 text-amber-800 border-amber-200">
                  <Info className="w-3 h-3 mr-1" />
                  Ejemplo Inspiracional
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{property.name}</h1>
              <p className="text-slate-600 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-violet-600" />
                {property.location}
              </p>
            </div>
            <div className="text-right bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <p className="text-xs text-slate-400 mb-1">Acceso mediante</p>
              <p className="text-lg font-bold text-violet-300">Smart Vacational</p>
              <p className="text-lg font-bold text-violet-300">Certificate</p>
              <p className="text-xs text-slate-400 mt-2">Sujeto a disponibilidad</p>
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Bed className="h-5 w-5 text-violet-500" />
              {property.specs.bedrooms} Recámaras
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Bath className="h-5 w-5 text-purple-500" />
              {property.specs.bathrooms} Baños
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Maximize className="h-5 w-5 text-indigo-500" />
              {property.specs.size}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
              <Users className="h-5 w-5 text-violet-500" />
              Hasta {property.specs.maxGuests} huéspedes
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
              <div
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl mb-4 cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={property.gallery[currentImageIndex] || "/placeholder.svg"}
                  alt={property.name}
                  fill
                  className="object-cover transition-all duration-700"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => (prev - 1 + property.gallery.length) % property.gallery.length)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-900" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => (prev + 1) % property.gallery.length)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
                >
                  <ChevronRight className="h-5 w-5 text-slate-900" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.gallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(idx)
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <NotaryBadge propertyId={property.id} />
            </div>

            {/* Property Info */}
            <div className="space-y-6">
              {/* Description */}
              <Card className="border-0 shadow-sm">
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

              {/* SVC Disclaimer */}
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Destino de Referencia - SVC Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-800 leading-relaxed mb-4">
                    Este es un <span className="font-bold">ejemplo de alojamiento participante</span> en el sistema
                    WEEK-CHAIN. El acceso está sujeto a disponibilidad del sistema y{" "}
                    <span className="font-bold">NO está garantizado</span> para fechas, temporadas o destinos
                    específicos.
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed mb-4">
                    Tu Smart Vacational Certificate otorga el <span className="font-bold">derecho de solicitud</span> de
                    uso temporal, no propiedad ni asignación de este inmueble en particular.
                  </p>
                  <p className="text-xs text-amber-700 font-medium">
                    Calendarios de disponibilidad y precios por semana NO aplican bajo el modelo SVC.
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-violet-600" />
                    Amenidades Ejecutivas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-violet-50/50">
                        <div className="text-violet-600">{amenity.icon}</div>
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
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    Características Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 text-slate-700 border border-violet-200"
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
      <section className="px-4 py-16 bg-gradient-to-br from-violet-50 via-white to-purple-50">
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
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg h-12 px-8"
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

      {/* Lightbox */}
      <div
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
        style={{ display: lightboxOpen ? "flex" : "none" }}
      >
        <button
          onClick={() => setLightboxOpen(false)}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setCurrentImageIndex((prev) => (prev - 1 + property.gallery.length) % property.gallery.length)
          }}
          className="absolute left-4 p-2 text-white/80 hover:text-white"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
        <div className="relative w-full max-w-5xl aspect-video mx-4">
          <Image
            src={property.gallery[currentImageIndex] || "/placeholder.svg"}
            alt={`Imagen ${currentImageIndex + 1}`}
            fill
            className="object-contain"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setCurrentImageIndex((prev) => (prev + 1) % property.gallery.length)
          }}
          className="absolute right-4 p-2 text-white/80 hover:text-white"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {property.gallery.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex(idx)
              }}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
