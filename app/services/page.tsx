"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Calendar,
  Shield,
  Sparkles,
  Waves,
  Mountain,
  Camera,
  Utensils,
  Car,
  TreePalm,
  Ticket,
  Building2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const ecoParksServices = [
  {
    id: "parque-eco-arqueologico-riviera",
    name: "Parque Eco-Arqueológico Riviera",
    subtitle: "La Maravilla Natural de Quintana Roo",
    description:
      "Experiencia todo incluido en el parque eco-arqueológico más completo de la Riviera Maya. Combina naturaleza, cultura maya, fauna local y espectáculos de clase mundial.",
    longDescription:
      "Un día inolvidable explorando ríos subterráneos, snorkel con peces tropicales, aviario con más de 1,500 aves, mariposario gigante, zona arqueológica, y el espectacular show nocturno 'México Espectacular' con más de 300 artistas.",
    image: "/eco-archaeological-park-mexico-cenote-underground-.jpg",
    location: "Playa del Carmen, Quintana Roo",
    duration: "Día completo (10-12 horas)",
    maxPeople: 20,
    rating: 4.9,
    reviews: 12847,
    featured: true,
    category: "Parques Eco-Turísticos",
    provider: "Pendiente de Alianza",
    providerStatus: "demo",
    icon: TreePalm,
    includes: [
      "Entrada al parque todo incluido",
      "Ríos subterráneos ilimitados",
      "Snorkel en caleta natural",
      "Aviario con 1,500+ aves",
      "Mariposario gigante",
      "Zona arqueológica maya",
      "Acuario de arrecife de coral",
      "Show nocturno 'México Espectacular'",
      "Buffet de comida mexicana",
      "Bebidas ilimitadas",
      "Casilleros y vestidores",
      "Equipo de snorkel",
    ],
    pricing: [
      { type: "basic", label: "Entrada Básica", sublabel: "Actividades diurnas", pricePerPerson: 3200 },
      { type: "plus", label: "Entrada Plus", sublabel: "Incluye show nocturno + cena", pricePerPerson: 4500 },
      { type: "total", label: "Entrada Total", sublabel: "Todo incluido + transporte", pricePerPerson: 5200 },
    ],
    highlights: [
      "Ríos subterráneos cristalinos",
      "Show con 300+ artistas",
      "Fauna: jaguares, manatíes, flamencos",
      "Cultura maya viva",
    ],
    partnerMessage:
      "Este servicio está en proceso de negociación. Mostramos esta demo para ilustrar cómo se vería la colaboración una vez confirmada.",
  },
  {
    id: "parque-acuatico-caribe",
    name: "Parque Acuático del Caribe",
    subtitle: "Aventura Extrema en el Mar Caribe",
    description:
      "El parque acuático más emocionante del Caribe Mexicano. Tirolesas sobre el mar, snorkel en arrecifes, nado con delfines y actividades extremas para toda la familia.",
    longDescription:
      "Vive la adrenalina con más de 40 actividades acuáticas: tirolesas que cruzan la bahía, snorkel en el segundo arrecife más grande del mundo, nado con delfines, manatíes y tiburones, kayaks, paddle boards y el tobogán más alto de México.",
    image: "/caribbean-water-park-zipline-over-ocean-snorkel-do.jpg",
    location: "Cozumel / Riviera Maya, Quintana Roo",
    duration: "Día completo (8-10 horas)",
    maxPeople: 15,
    rating: 4.8,
    reviews: 8932,
    featured: true,
    category: "Parques Acuáticos",
    provider: "Pendiente de Alianza",
    providerStatus: "demo",
    icon: Waves,
    includes: [
      "Entrada con actividades ilimitadas",
      "Tirolesas sobre el mar (7 líneas)",
      "Snorkel en arrecife natural",
      "Área de playa exclusiva",
      "Kayaks y paddle boards",
      "Parque de aventuras",
      "Buffet de mariscos",
      "Barra libre nacional",
      "Transporte desde hoteles",
    ],
    pricing: [
      { type: "basic", label: "Pase Aventura", sublabel: "Actividades principales", pricePerPerson: 2800 },
      { type: "plus", label: "Pase Premium", sublabel: "Todo incluido + delfines", pricePerPerson: 4200 },
      { type: "vip", label: "Pase VIP", sublabel: "Experiencia exclusiva", pricePerPerson: 6500 },
    ],
    highlights: ["40+ actividades acuáticas", "Tirolesas sobre el mar", "Nado con delfines", "Snorkel en arrecife"],
    partnerMessage:
      "Este servicio está en proceso de negociación. Mostramos esta demo para ilustrar cómo se vería la colaboración una vez confirmada.",
  },
]

// Servicios REALES de icorivieramaya.com
const realServices = [
  {
    id: "cenote-cave-adventure",
    name: "Cenote & Cave Adventure",
    subtitle: "Underworld Adventure - Caves and Cenotes",
    description:
      "Un tour especial para descubrir la magia de las cuevas y cenotes de la Riviera Maya. Visitarás 2 maravillas naturales en un día.",
    longDescription:
      "En la Riviera Maya hay cientos de cenotes que puedes visitar. Recuerda que puedes personalizar tu aventura con nosotros.",
    image: "/images/cenote-adventure-cover.jpg",
    location: "Riviera Maya, Quintana Roo",
    duration: "6-8 horas",
    maxPeople: 10,
    rating: 4.9,
    reviews: 127,
    featured: true,
    category: "Tours",
    provider: "ICO Riviera Maya",
    icon: Mountain,
    ivaIncluded: true,
    includes: [
      "Chikin Ha - Eco parque con 2 cenotes semi-abiertos",
      "Cenote con zipline (opcional)",
      "Río Escondido - Cueva secreta con cenote secreto",
      "Caminata por cueva hacia río subterráneo",
      "Equipo de snorkel incluido",
      "Transporte desde tu hotel",
    ],
    pricing: [
      { people: 2, pricePerPerson: 4300 },
      { people: 3, pricePerPerson: 3700 },
      { people: 4, pricePerPerson: 3400 },
      { people: 5, pricePerPerson: 3100 },
      { people: 6, pricePerPerson: 2900 },
      { people: 7, pricePerPerson: 2700 },
      { people: 8, pricePerPerson: 2500 },
      { people: 9, pricePerPerson: 2400 },
      { people: 10, pricePerPerson: 2300 },
    ],
    highlights: [
      "Chikin Ha: Eco parque con zipline",
      "Río Escondido: Cueva secreta",
      "Cenote secreto escondido",
      "Agua cristalina",
    ],
  },
  {
    id: "whale-shark-experience",
    name: "Whale Shark Experience",
    subtitle: "Swimming with the Biggest Shark in the Sea",
    description:
      "Una experiencia única en la vida. Nada junto a los tiburones ballena en su hábitat natural en el Mar Caribe.",
    longDescription:
      "De Junio a Septiembre puedes nadar con tiburones ballena en su hábitat natural. Salimos más temprano que cualquier otro operador para ser los primeros en llegar al área de tiburones ballena.",
    image: "/images/whale-shark-cover.jpg",
    location: "Mar Caribe, salida desde Playa del Carmen",
    duration: "5-6 horas",
    maxPeople: 10,
    rating: 5.0,
    reviews: 89,
    featured: true,
    category: "Experiencias Marinas",
    provider: "ICO Riviera Maya",
    season: "Junio - Septiembre",
    icon: Waves,
    includes: [
      "Transporte desde Playa del Carmen",
      "Recogida en lobby de tu hotel",
      "Navegación por el Mar Caribe",
      "Nado con tiburones ballena",
      "Guía entrenado en el agua",
      "Equipo de snorkel",
      "Chaleco salvavidas",
    ],
    pricing: [
      { type: "shared", label: "Bote Compartido (máx 10 pasajeros)", pricePerPerson: 4000 },
      { type: "private", label: "Bote Privado (máx 10 pasajeros)", totalPrice: 35000 },
    ],
    rules: [
      "UNA REGLA: NO TOCAR",
      "Es contra la ley interferir con cualquier animal en su hábitat",
      "Siempre estarás en el agua con un guía entrenado",
    ],
    notes: [
      "Propinas para capitán, fotos y videos no incluidos",
      "+$200 MXN adicionales si estás al sur de Playa del Carmen",
    ],
  },
  {
    id: "isla-mujeres-private-tour",
    name: "Isla Mujeres Private Tour",
    subtitle: "Enjoy the Mexican Caribbean!",
    description:
      "Tour privado de día completo a Isla Mujeres. Navega por el Mar Caribe, snorkel en arrecifes, visita playas paradisíacas y explora el pueblo.",
    longDescription: "Nuestro tour de Isla Mujeres. Navega por el Mar Caribe con nosotros.",
    image: "/images/isla-mujeres-cover.jpg",
    location: "Isla Mujeres, Quintana Roo",
    duration: "8-10 horas",
    maxPeople: 8,
    rating: 4.8,
    reviews: 156,
    featured: true,
    category: "Tours Marinos",
    provider: "ICO Riviera Maya",
    icon: Camera,
    includes: [
      "Recogida en lobby de tu hotel",
      "Llegada a Cancún y abordaje en Punta Sam",
      "Navegación a North Beach - una de las playas más hermosas del mundo",
      "Tiempo para nadar y tomar el sol",
      "Cerveza, refresco, agua y sándwich a bordo",
      "Snorkel en MUSA - Museo Subacuático",
      "Snorkel en Farito Reef con vida marina",
      "Almuerzo en restaurante (tú eliges)",
      "Tiempo de compras en el centro",
      "Equipo de snorkel incluido",
    ],
    pricing: [
      { people: 2, pricePerPerson: 10000 },
      { people: 3, pricePerPerson: 7000 },
      { people: 4, pricePerPerson: 5500 },
      { people: 5, pricePerPerson: 4500 },
      { people: 6, pricePerPerson: 3500 },
      { people: 7, pricePerPerson: 3000 },
      { people: 8, pricePerPerson: 2700 },
    ],
    itinerary: [
      "Recogida en lobby y llegada a Cancún",
      "Navegación a North Beach",
      "Snorkel en MUSA (museo subacuático)",
      "Snorkel en Farito Reef",
      "Almuerzo en restaurante local",
      "Compras en el centro (souvenirs, artesanía, joyería, tequila, sombreros)",
      "Regreso a tu hotel",
    ],
    tips: "TIP: Usa efectivo/pesos en lugar de tarjeta de crédito para mejores precios",
  },
]

// Servicios de concierge adicionales
const conciergeServices = [
  { icon: Car, name: "Transporte VIP", description: "SUV privada con chofer" },
  { icon: Utensils, name: "Chef Privado", description: "Experiencia gastronómica en tu villa" },
  { icon: Sparkles, name: "Spa & Wellness", description: "Tratamientos en la comodidad de tu suite" },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#C7CEEA]/5 to-white">
      <Navbar />

      {/* Hero Section - Estilo suave con detalles de tarjeta */}
      <section className="relative overflow-hidden px-6 py-24 pt-36">
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-gradient-to-br from-[#C7CEEA]/40 to-[#B5EAD7]/30 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-gradient-to-br from-[#FFDAC1]/40 to-[#FFB7B2]/30 blur-3xl" />

        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-[#C7CEEA] to-[#B5EAD7] text-slate-700 border-0 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Experiencias Exclusivas para Holders
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              WEEK-Services™
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-4">
              Experiencias turísticas premium curadas para titulares de certificados WEEK-CHAIN™
            </p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Proveedores locales verificados · Precios preferenciales · Reserva prioritaria
            </p>
          </div>

          {/* Tarjeta estilo premium - Preview de concierge */}
          <div className="max-w-md mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Tarjeta oscura estilo premium */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C7CEEA] to-[#B5EAD7] flex items-center justify-center">
                      <Shield className="h-5 w-5 text-slate-800" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">WEEK-Services™</p>
                      <p className="text-slate-400 text-sm">Concierge Premium</p>
                    </div>
                  </div>
                  <Badge className="bg-[#B5EAD7]/20 text-[#B5EAD7] border-[#B5EAD7]/30">Verificado</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {conciergeServices.map((service, i) => (
                    <div
                      key={i}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10"
                    >
                      <service.icon className="h-5 w-5 text-[#C7CEEA] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">{service.name}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-slate-400 text-xs">Proveedor Oficial</p>
                    <p className="text-white font-medium">ICO Riviera Maya</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-bold">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Badge */}
      <section className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#B5EAD7]/20 via-white to-[#C7CEEA]/20 border border-[#B5EAD7]/30">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <span className="text-slate-700 font-medium">
            Proveedor Verificado: <strong>ICO Riviera Maya</strong> - icorivieramaya.com
          </span>
          <Badge className="bg-gradient-to-r from-[#B5EAD7] to-[#C7CEEA] text-slate-700 border-0">
            Partner Oficial
          </Badge>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-300">
            <Building2 className="h-3 w-3 mr-1" />
            Alianzas en Negociación
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Parques Eco-Turísticos</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Estamos negociando alianzas con los parques más importantes de Quintana Roo para ofrecer precios exclusivos
            a holders WEEK-CHAIN™
          </p>
        </div>

        <div className="grid gap-8">
          {ecoParksServices.map((service, index) => {
            const IconComponent = service.icon || TreePalm
            return (
              <Card
                key={service.id}
                className="overflow-hidden border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white group relative"
              >
                {/* Demo Badge Overlay */}
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-amber-500 text-white border-0 shadow-lg px-3 py-1">
                    <Ticket className="h-3 w-3 mr-1" />
                    DEMO - Alianza Pendiente
                  </Badge>
                </div>

                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  {/* Image */}
                  <div
                    className={`relative h-72 md:h-auto min-h-[360px] overflow-hidden ${index % 2 === 1 ? "md:order-2" : ""}`}
                  >
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/95 text-slate-900 backdrop-blur-sm border-0 shadow-lg">
                        <IconComponent className="h-3 w-3 mr-1" />
                        {service.category}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg w-fit">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-900">{service.rating}</span>
                        <span className="text-slate-600 text-sm">({service.reviews.toLocaleString()} reseñas)</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className={`p-8 flex flex-col justify-between ${index % 2 === 1 ? "md:order-1" : ""}`}>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{service.name}</h2>
                      <p className="text-lg bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] bg-clip-text text-transparent font-semibold mb-4">
                        {service.subtitle}
                      </p>
                      <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>

                      {/* Info badges */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                          <MapPin className="h-4 w-4 text-[#FF9AA2]" />
                          <span className="text-sm">{service.location}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                          <Clock className="h-4 w-4 text-[#C7CEEA]" />
                          <span className="text-sm">{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                          <Users className="h-4 w-4 text-[#B5EAD7]" />
                          <span className="text-sm">Máx {service.maxPeople} personas</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      {service.highlights && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {service.highlights.slice(0, 4).map((highlight: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-gradient-to-r from-[#C7CEEA]/10 to-[#B5EAD7]/10 border-[#C7CEEA]/30 text-slate-700"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Includes preview */}
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Incluye:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {service.includes.slice(0, 6).map((item: string, i: number) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-slate-600">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                        {service.includes.length > 6 && (
                          <p className="text-xs text-slate-500 mt-1">+{service.includes.length - 6} más...</p>
                        )}
                      </div>

                      {/* Pricing preview */}
                      <div className="relative rounded-2xl overflow-hidden mb-6">
                        <div className="bg-gradient-to-br from-amber-900 to-amber-800 p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-amber-200 text-sm mb-1">Precio Estimado Desde</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">
                                  ${service.pricing[0].pricePerPerson?.toLocaleString()}
                                </span>
                                <span className="text-amber-200">MXN / persona</span>
                              </div>
                            </div>
                            <Badge className="bg-white/20 text-white border-0">Precio Demo</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Partner Message */}
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                        <p className="text-sm text-amber-800">
                          <strong>Nota:</strong> {service.partnerMessage}
                        </p>
                      </div>
                    </div>

                    <Link href={`/services/${service.id}`}>
                      <Button className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white hover:opacity-90 rounded-xl h-12 text-lg font-semibold group/btn shadow-lg">
                        Ver Demo de Colaboración
                        <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Services Grid - Real Services */}
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Alianzas Confirmadas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Experiencias Disponibles</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tours y actividades exclusivas en la Riviera Maya con precios preferenciales para holders
          </p>
        </div>

        <div className="grid gap-8">
          {realServices.map((service, index) => {
            const IconComponent = service.icon || Sparkles
            return (
              <Card
                key={service.id}
                className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white group"
              >
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  {/* Image */}
                  <div
                    className={`relative h-72 md:h-auto min-h-[360px] overflow-hidden ${index % 2 === 1 ? "md:order-2" : ""}`}
                  >
                    <Image
                      src={service.image || "/placeholder.svg?height=400&width=600&query=tropical adventure tour"}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/95 text-slate-900 backdrop-blur-sm border-0 shadow-lg">
                        <IconComponent className="h-3 w-3 mr-1" />
                        {service.category}
                      </Badge>
                      {service.season && (
                        <Badge className="bg-gradient-to-r from-[#FFB7B2] to-[#FF9AA2] text-white border-0 shadow-lg">
                          <Calendar className="h-3 w-3 mr-1" />
                          {service.season}
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg w-fit">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-900">{service.rating}</span>
                        <span className="text-slate-600 text-sm">({service.reviews} reseñas)</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className={`p-8 flex flex-col justify-between ${index % 2 === 1 ? "md:order-1" : ""}`}>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{service.name}</h2>
                      <p className="text-lg bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] bg-clip-text text-transparent font-semibold mb-4">
                        {service.subtitle}
                      </p>
                      <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>

                      {/* Info badges */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                          <MapPin className="h-4 w-4 text-[#FF9AA2]" />
                          <span className="text-sm">{service.location}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                          <Clock className="h-4 w-4 text-[#C7CEEA]" />
                          <span className="text-sm">{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                          <Users className="h-4 w-4 text-[#B5EAD7]" />
                          <span className="text-sm">Máx {service.maxPeople} personas</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      {service.highlights && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {service.highlights.slice(0, 4).map((highlight: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-gradient-to-r from-[#C7CEEA]/10 to-[#B5EAD7]/10 border-[#C7CEEA]/30 text-slate-700"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Pricing preview - Tarjeta estilo premium */}
                      <div className="relative rounded-2xl overflow-hidden mb-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-400 text-sm mb-1">Desde</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">
                                  $
                                  {service.pricing[service.pricing.length - 1].pricePerPerson?.toLocaleString() ||
                                    Math.round((service.pricing[1] as any)?.totalPrice / 10).toLocaleString()}
                                </span>
                                <span className="text-slate-400">MXN / persona</span>
                              </div>
                            </div>
                            <Badge className="bg-[#B5EAD7]/20 text-[#B5EAD7] border-0">Precio Holder</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link href={`/services/${service.id}`}>
                      <Button className="w-full bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] text-white hover:opacity-90 rounded-xl h-12 text-lg font-semibold group/btn shadow-lg">
                        Ver Detalles y Reservar
                        <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background con gradiente suave */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#C7CEEA]/30 via-white to-[#B5EAD7]/30" />
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#FFDAC1]/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#FFB7B2]/20 blur-3xl" />

          <div className="relative p-10 md:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Sparkles className="h-8 w-8 text-[#C7CEEA]" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              ¿Eres proveedor de servicios turísticos?
            </h3>
            <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
              Únete a la red WEEK-Services™ y conecta con titulares de certificados WEEK-CHAIN™. Acceso a clientes
              exclusivos con estadías garantizadas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partnership">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-600 rounded-xl h-12 px-8 font-semibold shadow-lg"
                >
                  Aplicar como Proveedor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl h-12 px-8 font-semibold bg-transparent"
                >
                  Más Información
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
