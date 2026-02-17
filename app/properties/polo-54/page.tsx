"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Star,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Waves,
  TreePalm,
  Dumbbell,
  UtensilsCrossed,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Clock,
  Building2,
  Sparkles,
  Info,
  Eye,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

const POLO54_IMAGES = [
  {
    url: "/images/img-9856.jpeg",
    alt: "POLO 54 PH 501 - Vista exterior",
    caption: "Vista Exterior",
  },
  {
    url: "/luxury-penthouse-living-room-modern.jpg",
    alt: "Sala de estar moderna",
    caption: "Sala de Estar",
  },
  {
    url: "/luxury-bedroom-ocean-view.jpg",
    alt: "Recámara principal",
    caption: "Recámara Principal",
  },
  {
    url: "/modern-kitchen-luxury-apartment.jpg",
    alt: "Cocina equipada",
    caption: "Cocina Gourmet",
  },
  {
    url: "/luxury-bathroom-spa.png",
    alt: "Baño de lujo",
    caption: "Baño Principal",
  },
  {
    url: "/rooftop-terrace-pool-caribbean.jpg",
    alt: "Terraza con alberca",
    caption: "Rooftop con Alberca",
  },
]

const AMENITIES = [
  { icon: Wifi, name: "WiFi de Alta Velocidad", description: "Conexión fibra óptica" },
  { icon: Car, name: "Estacionamiento", description: "2 cajones incluidos" },
  { icon: Waves, name: "Alberca Infinity", description: "Vista panorámica" },
  { icon: TreePalm, name: "Jardines Tropicales", description: "Áreas verdes" },
  { icon: Dumbbell, name: "Gimnasio", description: "Equipo profesional" },
  { icon: UtensilsCrossed, name: "Cocina Gourmet", description: "Totalmente equipada" },
  { icon: Shield, name: "Seguridad 24/7", description: "Acceso controlado" },
  { icon: Sparkles, name: "Servicio de Limpieza", description: "Incluido semanal" },
]

const POLO_SPECS = {
  bedrooms: 2,
  bathrooms: 2,
  maxGuests: 4,
  sqMeters: 98,
}

export default function Polo54Page() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % POLO54_IMAGES.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + POLO54_IMAGES.length) % POLO54_IMAGES.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Link href="/" className="hover:text-[#FF9AA2] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-[#FF9AA2] transition-colors">
              Alojamientos Participantes
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">POLO 54 PH 501</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0">
                  <Eye className="w-3 h-3 mr-1" />
                  Alojamiento Participante
                </Badge>
                <Badge className="bg-[#B5EAD7]/20 text-[#B5EAD7] border-[#B5EAD7]/30">
                  <Info className="w-3 h-3 mr-1" />
                  Referencia
                </Badge>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  <Star className="h-3 w-3 mr-1 fill-amber-500" />
                  Premium
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">POLO 54 PH 501</h1>
              <p className="text-lg text-slate-500 italic mb-4">Ejemplo de penthouse exclusivo con vista al Caribe</p>

              <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#FF9AA2]" />
                  <span>Playa del Carmen, Quintana Roo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">4.9</span>
                  <span className="text-slate-400">(127 reseñas)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-right bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                <p className="text-xs text-slate-400 mb-1">Acceso mediante</p>
                <p className="text-lg font-bold text-[#B5EAD7]">Smart Vacational</p>
                <p className="text-lg font-bold text-[#B5EAD7]">Certificate</p>
                <p className="text-xs text-slate-400 mt-2">Sujeto a disponibilidad</p>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
            <div
              className="lg:col-span-2 relative rounded-2xl overflow-hidden aspect-[16/10] cursor-pointer group"
              onClick={() => setIsGalleryOpen(true)}
            >
              <Image
                src={POLO54_IMAGES[0].url || "/placeholder.svg"}
                alt={POLO54_IMAGES[0].alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-medium">{POLO54_IMAGES[0].caption}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {POLO54_IMAGES.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden aspect-square cursor-pointer group"
                  onClick={() => {
                    setCurrentImageIndex(index + 1)
                    setIsGalleryOpen(true)
                  }}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">+{POLO54_IMAGES.length - 4} fotos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Features - usando POLO_SPECS */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Bed className="h-6 w-6 mx-auto mb-2 text-[#FF9AA2]" />
                <p className="text-2xl font-bold">{POLO_SPECS.bedrooms}</p>
                <p className="text-sm text-slate-500">Recámaras</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Bath className="h-6 w-6 mx-auto mb-2 text-[#B5EAD7]" />
                <p className="text-2xl font-bold">{POLO_SPECS.bathrooms}</p>
                <p className="text-sm text-slate-500">Baños</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Users className="h-6 w-6 mx-auto mb-2 text-[#C7CEEA]" />
                <p className="text-2xl font-bold">{POLO_SPECS.maxGuests}</p>
                <p className="text-sm text-slate-500">Huéspedes</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-[#FFDAC1]" />
                <p className="text-2xl font-bold">{POLO_SPECS.sqMeters}</p>
                <p className="text-sm text-slate-500">m²</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="amenities">Amenidades</TabsTrigger>
                <TabsTrigger value="location">Ubicación</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Sobre esta propiedad</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed mb-4">
                        POLO 54 PH 501 es un exclusivo penthouse ubicado en una de las zonas más privilegiadas de Playa
                        del Carmen. Con {POLO_SPECS.sqMeters}m² de espacios diseñados para el confort y la elegancia,
                        este departamento ofrece una experiencia de vida incomparable en la Riviera Maya.
                      </p>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        El penthouse cuenta con {POLO_SPECS.bedrooms} amplias recámaras, {POLO_SPECS.bathrooms} baños
                        completos de lujo, una cocina gourmet totalmente equipada y una terraza privada con vistas
                        espectaculares. Los acabados de primera calidad y el diseño contemporáneo crean un ambiente
                        sofisticado y acogedor.
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        A solo minutos de la Quinta Avenida y las mejores playas del Caribe mexicano, POLO 54 combina la
                        tranquilidad residencial con acceso inmediato a restaurantes, tiendas y vida nocturna de clase
                        mundial.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Amenidades</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {AMENITIES.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50 hover:bg-[#B5EAD7]/10 transition-colors"
                        >
                          <amenity.icon className="h-8 w-8 text-[#FF9AA2] mb-2" />
                          <p className="font-medium text-slate-900 text-sm">{amenity.name}</p>
                          <p className="text-xs text-slate-500">{amenity.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Ubicación</h3>
                    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.8!2d-87.0739!3d20.6296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDM3JzQ2LjYiTiA4N8KwMDQnMjYuMCJX!5e0!3m2!1ses!2smx!4v1635000000000!5m2!1ses!2smx"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Check className="h-4 w-4 text-[#B5EAD7]" />
                        <span>5 min caminando a la Quinta Avenida</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Check className="h-4 w-4 text-[#B5EAD7]" />
                        <span>10 min a las mejores playas</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Check className="h-4 w-4 text-[#B5EAD7]" />
                        <span>45 min del Aeropuerto de Cancún</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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
                  <span className="font-bold">NO está garantizado</span> para fechas, temporadas o destinos específicos.
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Tu Smart Vacational Certificate otorga el <span className="font-bold">derecho de solicitud</span> de
                  uso temporal, no propiedad ni asignación de este inmueble en particular.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
                <CardHeader className="pb-4">
                  <div className="text-center">
                    <Badge className="bg-[#B5EAD7]/20 text-emerald-700 mb-3">Destino de Referencia</Badge>
                    <h3 className="font-bold text-slate-900 text-lg">Acceso con Smart Vacational Certificate</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-[#FF9AA2]" />
                      <span>Derecho de solicitud 15 años</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Shield className="h-4 w-4 text-[#B5EAD7]" />
                      <span>Certificado Digital</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Info className="h-4 w-4 text-[#C7CEEA]" />
                      <span>Sujeto a disponibilidad</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Este destino es un ejemplo de alojamiento participante. El acceso NO está garantizado para fechas
                      o temporadas específicas.
                    </p>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:opacity-90 text-white font-semibold py-6"
                  >
                    <Link href="/auth">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Adquirir Smart Vacational Certificate
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/properties">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Más Destinos
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-gradient-to-br from-[#B5EAD7]/10 via-white to-[#FFDAC1]/10">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Accede a Este y Más Destinos Participantes</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-6">
              Con tu Smart Vacational Certificate, podrás solicitar acceso temporal a destinos participantes como este,
              sujeto a disponibilidad del sistema WEEK-CHAIN.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white shadow-lg h-12 px-8"
            >
              <Link href="/auth">
                <Sparkles className="h-5 w-5 mr-2" />
                Comenzar Ahora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-[#FF9AA2] transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <button onClick={prevImage} className="absolute left-4 text-white hover:text-[#FF9AA2] transition-colors">
            <ChevronLeft className="h-12 w-12" />
          </button>
          <button onClick={nextImage} className="absolute right-4 text-white hover:text-[#FF9AA2] transition-colors">
            <ChevronRight className="h-12 w-12" />
          </button>
          <div className="max-w-6xl max-h-[90vh] relative">
            <Image
              src={POLO54_IMAGES[currentImageIndex].url || "/placeholder.svg"}
              alt={POLO54_IMAGES[currentImageIndex].alt}
              width={1200}
              height={800}
              className="object-contain"
            />
            <p className="text-white text-center mt-4">{POLO54_IMAGES[currentImageIndex].caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}
