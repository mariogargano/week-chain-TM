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
  ArrowLeft,
  Star,
  Calendar,
  Shield,
  AlertTriangle,
  Info,
  Phone,
  Mail,
  TreePalm,
  Waves,
  Ticket,
  Building2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { useState } from "react"

const ecoParksServicesData: Record<string, any> = {
  "parque-eco-arqueologico-riviera": {
    id: "parque-eco-arqueologico-riviera",
    name: "Parque Eco-Arqueológico Riviera",
    subtitle: "La Maravilla Natural de Quintana Roo",
    description:
      "Experiencia todo incluido en el parque eco-arqueológico más completo de la Riviera Maya. Combina naturaleza, cultura maya, fauna local y espectáculos de clase mundial.",
    longDescription:
      "Un día inolvidable explorando ríos subterráneos, snorkel con peces tropicales, aviario con más de 1,500 aves, mariposario gigante, zona arqueológica, y el espectacular show nocturno 'México Espectacular' con más de 300 artistas. Este parque representa lo mejor del ecoturismo mexicano, combinando conservación ambiental con entretenimiento de primer nivel.",
    images: [
      "/eco-park-underground-river-cenote-crystal-water-me.jpg",
      "/colorful-tropical-birds-aviary-butterflies-sanctua.jpg",
      "/mayan-archaeological-ruins-jungle-pyramid-mexico.jpg",
      "/spectacular-night-show-mexican-folklore-dance-perf.jpg",
    ],
    location: "Playa del Carmen, Quintana Roo",
    duration: "Día completo (10-12 horas)",
    maxPeople: 20,
    rating: 4.9,
    reviews: 12847,
    category: "Parques Eco-Turísticos",
    provider: "Pendiente de Alianza",
    providerStatus: "demo",
    icon: TreePalm,
    includes: [
      "Entrada al parque todo incluido",
      "Ríos subterráneos ilimitados - nada en aguas cristalinas",
      "Snorkel en caleta natural con peces tropicales",
      "Aviario con más de 1,500 aves de 200 especies",
      "Mariposario gigante con cientos de mariposas",
      "Zona arqueológica maya restaurada",
      "Acuario de arrecife de coral del Caribe",
      "Show nocturno 'México Espectacular' (300+ artistas)",
      "Buffet de comida mexicana gourmet",
      "Bebidas nacionales ilimitadas",
      "Casilleros y vestidores de lujo",
      "Equipo de snorkel profesional",
      "Chalecos salvavidas",
      "Hamacas y áreas de descanso",
    ],
    pricing: [
      { type: "basic", label: "Entrada Básica", sublabel: "Actividades diurnas 9am-6pm", pricePerPerson: 3200 },
      { type: "plus", label: "Entrada Plus", sublabel: "Incluye show nocturno + cena buffet", pricePerPerson: 4500 },
      { type: "total", label: "Entrada Total", sublabel: "Todo incluido + transporte hotel", pricePerPerson: 5200 },
    ],
    highlights: [
      "Ríos subterráneos cristalinos",
      "Show con 300+ artistas",
      "Fauna: jaguares, manatíes, flamencos",
      "Cultura maya viva",
      "Comida mexicana gourmet",
      "Conservación ambiental",
    ],
    activities: [
      {
        name: "Ríos Subterráneos",
        description:
          "Nada en ríos de agua cristalina que fluyen por cuevas naturales. Una experiencia única de conexión con la naturaleza.",
        icon: "waves",
      },
      {
        name: "Aviario Gigante",
        description: "Camina entre más de 1,500 aves de 200 especies diferentes en un hábitat natural recreado.",
        icon: "bird",
      },
      {
        name: "Zona Arqueológica",
        description: "Explora ruinas mayas restauradas y aprende sobre la historia de esta gran civilización.",
        icon: "landmark",
      },
      {
        name: "Show México Espectacular",
        description:
          "Espectáculo nocturno con más de 300 artistas que recorre la historia de México a través de música y danza.",
        icon: "music",
      },
    ],
    partnerMessage:
      "Este servicio está en proceso de negociación con el parque. Esta página demuestra cómo se presentaría la alianza una vez confirmada. Los precios y detalles son estimados basados en tarifas públicas.",
    partnerBenefits: [
      "Precios exclusivos 15-20% menores que tarifa rack",
      "Reserva prioritaria sin filas",
      "Acceso a áreas VIP",
      "Coordinación de transporte incluida",
      "Atención personalizada para grupos WEEK-CHAIN",
    ],
  },
  "parque-acuatico-caribe": {
    id: "parque-acuatico-caribe",
    name: "Parque Acuático del Caribe",
    subtitle: "Aventura Extrema en el Mar Caribe",
    description:
      "El parque acuático más emocionante del Caribe Mexicano. Tirolesas sobre el mar, snorkel en arrecifes, nado con delfines y actividades extremas para toda la familia.",
    longDescription:
      "Vive la adrenalina con más de 40 actividades acuáticas: tirolesas que cruzan la bahía, snorkel en el segundo arrecife más grande del mundo, nado con delfines, manatíes y tiburones, kayaks, paddle boards y el tobogán más alto de México. Un día de aventura sin límites en el paraíso caribeño.",
    images: [
      "/zipline-over-turquoise-caribbean-sea-adventure-ext.jpg",
      "/snorkeling-colorful-coral-reef-tropical-fish-carib.jpg",
      "/swimming-with-dolphins-clear-blue-water-mexico.jpg",
      "/water-park-slides-beach-caribbean-resort.jpg",
    ],
    location: "Cozumel / Riviera Maya, Quintana Roo",
    duration: "Día completo (8-10 horas)",
    maxPeople: 15,
    rating: 4.8,
    reviews: 8932,
    category: "Parques Acuáticos",
    provider: "Pendiente de Alianza",
    providerStatus: "demo",
    icon: Waves,
    includes: [
      "Entrada con actividades ilimitadas",
      "7 líneas de tirolesa sobre el mar Caribe",
      "Snorkel en arrecife natural protegido",
      "Área de playa exclusiva con camastros",
      "Kayaks y paddle boards sin límite",
      "Parque de aventuras terrestres",
      "Buffet de mariscos frescos",
      "Barra libre de bebidas nacionales",
      "Transporte desde hoteles de la Riviera Maya",
      "Casilleros y regaderas",
      "Equipo de snorkel profesional",
      "Chaleco salvavidas",
    ],
    pricing: [
      { type: "basic", label: "Pase Aventura", sublabel: "Actividades principales + buffet", pricePerPerson: 2800 },
      { type: "plus", label: "Pase Premium", sublabel: "Todo incluido + nado con delfines", pricePerPerson: 4200 },
      { type: "vip", label: "Pase VIP", sublabel: "Experiencia exclusiva + masaje + foto", pricePerPerson: 6500 },
    ],
    highlights: [
      "40+ actividades acuáticas",
      "Tirolesas sobre el mar",
      "Nado con delfines",
      "Snorkel en arrecife",
      "Tobogán más alto de México",
      "Playa privada",
    ],
    activities: [
      {
        name: "Tirolesas sobre el Mar",
        description: "7 líneas de tirolesa que cruzan la bahía con vistas espectaculares del Caribe mexicano.",
        icon: "zap",
      },
      {
        name: "Snorkel en Arrecife",
        description: "Explora el segundo arrecife más grande del mundo y nada entre cientos de peces tropicales.",
        icon: "fish",
      },
      {
        name: "Nado con Delfines",
        description: "Interactúa con delfines en un ambiente seguro y controlado. Experiencia inolvidable.",
        icon: "heart",
      },
      {
        name: "Parque de Aventuras",
        description: "Circuitos de cuerdas, puentes colgantes y actividades terrestres para toda la familia.",
        icon: "mountain",
      },
    ],
    partnerMessage:
      "Este servicio está en proceso de negociación con el parque. Esta página demuestra cómo se presentaría la alianza una vez confirmada. Los precios y detalles son estimados basados en tarifas públicas.",
    partnerBenefits: [
      "Descuentos exclusivos del 20% sobre tarifa regular",
      "Acceso express sin filas de espera",
      "Áreas VIP reservadas para holders",
      "Fotografías profesionales incluidas",
      "Servicio de concierge dedicado",
    ],
  },
}

// Servicios REALES
const servicesData: Record<string, any> = {
  "cenote-cave-adventure": {
    id: "cenote-cave-adventure",
    name: "Cenote & Cave Adventure",
    subtitle: "Underworld Adventure - Caves and Cenotes",
    description:
      "Un tour especial para descubrir la magia de las cuevas y cenotes de la Riviera Maya. Visitarás 2 maravillas naturales en un día.",
    longDescription:
      "En la Riviera Maya hay cientos de cenotes que puedes visitar. Recuerda que puedes personalizar tu aventura con nosotros.",
    images: ["/images/photo-2025-12-01-16-16-37-202.jpg", "/images/photo-2025-12-01-16-16-37.jpg"],
    location: "Riviera Maya, Quintana Roo",
    duration: "6-8 horas",
    maxPeople: 10,
    rating: 4.9,
    reviews: 127,
    category: "Tours",
    provider: "ICO Riviera Maya",
    includes: [
      "Chikin Ha - Eco parque con 2 cenotes semi-abiertos",
      "Un cenote abierto permite más tiempo de snorkel",
      "El otro tiene zipline para los más valientes (no obligatorio)",
      "Río Escondido - Una cueva secreta con cenote secreto",
      "Caminata por la cueva hacia el río subterráneo (agua poco profunda)",
      "Llegada al corazón de la Riviera Maya hasta el cenote secreto",
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
    stops: [
      {
        name: "Chikin Ha",
        description:
          "Eco parque con 2 cenotes semi-abiertos. Un cenote abierto permite más tiempo de snorkel. El otro tiene zipline para los más valientes (opcional).",
      },
      {
        name: "Río Escondido",
        description:
          "Una cueva secreta con cenote secreto. Caminaremos por la cueva hacia el río subterráneo (agua poco profunda), luego iremos al corazón de la Riviera Maya hasta llegar al cenote secreto.",
      },
    ],
  },
  "whale-shark-experience": {
    id: "whale-shark-experience",
    name: "Whale Shark Experience",
    subtitle: "Swimming with the Biggest Shark in the Sea",
    description:
      "Una experiencia única en la vida. Nada junto a los tiburones ballena en su hábitat natural en el Mar Caribe.",
    longDescription:
      "De Junio a Septiembre puedes nadar con tiburones ballena en su hábitat natural. Salimos más temprano que cualquier otro operador para ser los primeros en llegar al área de tiburones ballena. Te recogeremos y llegaremos a los muelles donde abordaremos el bote para nuestra aventura. Navegaremos por el Mar Caribe hasta encontrar el área de tiburones ballena. Cuando localicemos a estos gentiles gigantes, saltaremos del bote al océano para nadar junto a uno o múltiples tiburones ballena. Siempre estarás en el agua con un guía entrenado.",
    images: [
      "/images/photo-2025-12-01-16-16-56.jpg",
      "/images/photo-2025-12-01-16-16-56-203.jpg",
      "/images/photo-2025-12-01-16-16-56-202.jpg",
    ],
    location: "Mar Caribe, salida desde Playa del Carmen",
    duration: "5-6 horas",
    maxPeople: 10,
    rating: 5.0,
    reviews: 89,
    category: "Experiencias Marinas",
    provider: "ICO Riviera Maya",
    season: "Junio - Septiembre",
    includes: [
      "Transporte desde Playa del Carmen",
      "Recogida temprana en lobby de tu hotel",
      "Navegación por el Mar Caribe",
      "Nado con tiburones ballena en su hábitat natural",
      "Guía entrenado siempre contigo en el agua",
      "Equipo de snorkel",
      "Chaleco salvavidas",
    ],
    pricing: [
      { type: "shared", label: "Bote Compartido", sublabel: "Máximo 10 pasajeros", pricePerPerson: 4000 },
      { type: "private", label: "Bote Privado", sublabel: "Máximo 10 pasajeros", totalPrice: 35000 },
    ],
    rules: [
      "UNA REGLA: NO TOCAR",
      "Es contra la ley interferir con cualquier animal en su hábitat",
      "Siempre estarás en el agua con un guía entrenado",
      "Máximo 10 pasajeros por bote permitido",
    ],
    notes: [
      "Propinas para capitán no incluidas",
      "Fotos y videos no incluidos en el precio",
      "+$200 MXN adicionales si estás al sur de Playa del Carmen",
      "Precio incluye transporte desde Playa del Carmen",
    ],
  },
  "isla-mujeres-private-tour": {
    id: "isla-mujeres-private-tour",
    name: "Isla Mujeres Private Tour",
    subtitle: "Enjoy the Mexican Caribbean!",
    description:
      "Tour privado de día completo a Isla Mujeres. Navega por el Mar Caribe, snorkel en arrecifes, visita playas paradisíacas y explora el pueblo.",
    longDescription: "Nuestro tour de Isla Mujeres. Navega por el Mar Caribe con nosotros.",
    images: [
      "/images/photo-2025-12-01-16-16-45.jpg",
      "/images/photo-2025-12-01-16-16-46.jpg",
      "/images/photo-2025-12-01-16-16-45-202.jpg",
    ],
    location: "Isla Mujeres, Quintana Roo",
    duration: "8-10 horas",
    maxPeople: 8,
    rating: 4.8,
    reviews: 156,
    category: "Tours Marinos",
    provider: "ICO Riviera Maya",
    includes: [
      "Recogida en lobby de tu hotel",
      "Llegada a Cancún y abordaje en Punta Sam",
      "Navegación a North Beach - una de las playas más hermosas del mundo",
      "Tiempo para nadar y tomar el sol",
      "Cerveza, refresco, agua y sándwich a bordo",
      "Snorkel en MUSA - Museo Subacuático (solo para nadadores expertos)",
      "Snorkel en Farito Reef con vida marina variada",
      "Almuerzo en restaurante (menú incluye agua, bebida extra es adicional)",
      "Tiempo de compras en el centro",
      "Equipo de snorkel incluido",
      "Regreso a tu hotel",
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
      { step: 1, title: "Bienvenida en North Beach", description: "Bienvenida en Playa Norte" },
      { step: 2, title: "Snorkel en Farito Reef", description: "Snorkel en el arrecife Farito" },
      { step: 3, title: "Snorkel en MUSA", description: "Snorkel en MUSA (solo para nadadores expertos)" },
      {
        step: 4,
        title: "Almuerzo en restaurante",
        description: "Almuerzo en el restaurante (Menú incluye agua, bebida extra es adicional)",
      },
      { step: 5, title: "Compras en el centro", description: "Vamos de compras al pueblo" },
      { step: 6, title: "Regreso", description: "Vuelta al hotel" },
    ],
    tips: "TIP: Usa efectivo/pesos en lugar de tarjeta de crédito para mejores precios en las tiendas locales. Encontrarás souvenirs, artesanía, joyería, tequila y sombreros.",
  },
}

// Merge all services
const allServicesData = { ...servicesData, ...ecoParksServicesData }

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params.id as string
  const service = allServicesData[serviceId]
  const [selectedPeople, setSelectedPeople] = useState(2)
  const [selectedImage, setSelectedImage] = useState(0)

  // Check if this is a demo/partner service
  const isDemo = service?.providerStatus === "demo"

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Servicio no encontrado</h1>
          <Link href="/services">
            <Button>Volver a Servicios</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentPrice = service.pricing.find((p: any) => p.people === selectedPeople) || service.pricing[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      {isDemo && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 mt-20">
          <div className="container mx-auto px-6 max-w-6xl flex items-center justify-center gap-3">
            <Ticket className="h-5 w-5" />
            <span className="font-medium">
              DEMO DE ALIANZA - Esta página muestra cómo se vería la colaboración una vez confirmada
            </span>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className={`container mx-auto px-6 max-w-6xl ${isDemo ? "pt-8" : "pt-28"}`}>
        <Link href="/services">
          <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Servicios
          </Button>
        </Link>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-6 pb-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src={service.images[selectedImage] || "/placeholder.svg"}
                alt={service.name}
                fill
                className="object-cover"
              />
              {service.season && (
                <Badge className="absolute top-4 left-4 bg-blue-500 text-white">
                  <Calendar className="h-3 w-3 mr-1" />
                  Temporada: {service.season}
                </Badge>
              )}
              {isDemo && (
                <Badge className="absolute top-4 right-4 bg-amber-500 text-white">
                  <Building2 className="h-3 w-3 mr-1" />
                  Alianza Pendiente
                </Badge>
              )}
            </div>
            {service.images.length > 1 && (
              <div className="flex gap-3">
                {service.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-[#B5EAD7] ring-2 ring-[#B5EAD7]/50" : "border-transparent"
                    }`}
                  >
                    <Image src={img || "/placeholder.svg"} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge
                className={`${isDemo ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-[#B5EAD7]/20 text-[#0a1628] border-[#B5EAD7]"}`}
              >
                {service.category}
              </Badge>
              {isDemo && (
                <Badge className="bg-amber-500 text-white border-0">
                  <Ticket className="h-3 w-3 mr-1" />
                  Demo
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{service.name}</h1>
            <p className="text-xl text-[#B5EAD7] font-semibold mb-4">{service.subtitle}</p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-lg">{service.rating}</span>
              </div>
              <span className="text-slate-500">({service.reviews.toLocaleString()} reseñas)</span>
              {!isDemo && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <MapPin className="h-5 w-5 text-[#FF9AA2] mb-2" />
                <p className="text-xs text-slate-500">Ubicación</p>
                <p className="text-sm font-semibold text-slate-900">{service.location.split(",")[0]}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Clock className="h-5 w-5 text-[#C7CEEA] mb-2" />
                <p className="text-xs text-slate-500">Duración</p>
                <p className="text-sm font-semibold text-slate-900">{service.duration}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Users className="h-5 w-5 text-[#B5EAD7] mb-2" />
                <p className="text-xs text-slate-500">Máximo</p>
                <p className="text-sm font-semibold text-slate-900">{service.maxPeople} personas</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-6">{service.longDescription}</p>

            {/* Provider */}
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${isDemo ? "bg-amber-50 border-amber-200" : "bg-gradient-to-r from-[#B5EAD7]/20 to-[#C7CEEA]/20 border-[#B5EAD7]/30"}`}
            >
              {isDemo ? (
                <>
                  <Building2 className="h-6 w-6 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700">Estado de Alianza</p>
                    <p className="font-semibold text-amber-900">{service.provider}</p>
                  </div>
                </>
              ) : (
                <>
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-500">Proveedor Verificado</p>
                    <p className="font-semibold text-slate-900">{service.provider}</p>
                  </div>
                </>
              )}
            </div>

            {/* Partner message for demo services */}
            {isDemo && service.partnerMessage && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">{service.partnerMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{isDemo ? "Precios Estimados" : "Precios por Persona"}</h2>
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            IVA incluido
          </Badge>
        </div>

        {service.pricing[0].type ? (
          // Type-based pricing (eco parks, whale shark)
          <div className="grid md:grid-cols-3 gap-6">
            {service.pricing.map((price: any, i: number) => (
              <Card
                key={i}
                className={`border-2 rounded-2xl ${
                  isDemo
                    ? "border-amber-200 hover:border-amber-400"
                    : i === 1
                      ? "border-[#B5EAD7] ring-2 ring-[#B5EAD7]/20"
                      : "border-slate-200"
                }`}
              >
                <CardContent className="p-6">
                  {i === 1 && !isDemo && <Badge className="mb-3 bg-[#B5EAD7] text-slate-900">Más Popular</Badge>}
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{price.label}</h3>
                  <p className="text-sm text-slate-500 mb-4">{price.sublabel}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      ${(price.pricePerPerson || price.totalPrice).toLocaleString()}
                    </span>
                    <span className="text-slate-600">MXN {price.pricePerPerson ? "/ persona" : "total"}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">IVA incluido</p>
                  {isDemo && <p className="text-xs text-amber-600 mt-2">*Precio estimado sujeto a confirmación</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Regular pricing table
          <Card className="border-2 border-slate-200 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-0">
                {service.pricing.map((price: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPeople(price.people)}
                    className={`p-4 text-center border-r border-b last:border-r-0 transition-all ${
                      selectedPeople === price.people ? "bg-[#B5EAD7]/30 border-[#B5EAD7]" : "hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 mb-1">{price.people} personas</p>
                    <p className="text-lg font-bold text-[#0a1628]">${price.pricePerPerson.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">MXN/persona (IVA inc.)</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Card */}
        <Card
          className={`mt-6 border-0 rounded-2xl ${isDemo ? "bg-gradient-to-r from-amber-800 to-amber-900" : "bg-gradient-to-r from-[#0a1628] to-[#1a2d4a]"}`}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {isDemo ? (
                  <>
                    <p className="text-amber-200 mb-1">¿Interesado en esta alianza?</p>
                    <p className="text-white font-medium">Contáctanos para más información sobre esta colaboración</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-400 mb-1">
                      {service.pricing[0].type ? "Selecciona tu paquete" : `Total para ${selectedPeople} personas`}
                    </p>
                    {!service.pricing[0].type && (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">
                            ${(currentPrice.pricePerPerson * selectedPeople).toLocaleString()}
                          </span>
                          <span className="text-slate-400">MXN</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          ${currentPrice.pricePerPerson.toLocaleString()} MXN por persona
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
              {isDemo ? (
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-amber-500 text-white hover:bg-amber-400 rounded-xl h-14 px-8 text-lg font-semibold"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Contactar sobre Alianza
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="bg-[#B5EAD7] text-[#0a1628] hover:bg-[#a5dac7] rounded-xl h-14 px-8 text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Contactar para Reservar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Includes */}
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">¿Qué incluye?</h2>
        <Card className="border-2 border-slate-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {service.includes.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {isDemo && service.partnerBenefits && (
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Beneficios para Holders WEEK-CHAIN™</h2>
          <Card className="border-2 border-amber-200 bg-amber-50/50 rounded-2xl">
            <CardContent className="p-6">
              <p className="text-amber-800 mb-4 font-medium">
                Una vez confirmada la alianza, los titulares de certificados WEEK-CHAIN™ disfrutarán de:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {service.partnerBenefits.map((benefit: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Activities for eco parks */}
      {service.activities && (
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Actividades Principales</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {service.activities.map((activity: any, i: number) => (
              <Card key={i} className="border-2 border-slate-200 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{activity.name}</h3>
                  <p className="text-slate-600 leading-relaxed">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Stops/Itinerary */}
      {service.stops && (
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Paradas del Tour</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {service.stops.map((stop: any, i: number) => (
              <Card key={i} className="border-2 border-[#C7CEEA]/50 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-[#B5EAD7]">"{stop.name}"</h3>
                  <p className="text-slate-600 leading-relaxed">{stop.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {service.itinerary && (
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Itinerario</h2>
          <Card className="border-2 border-slate-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                {service.itinerary.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B5EAD7] flex items-center justify-center text-sm font-bold text-[#0a1628]">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Rules */}
      {service.rules && (
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Reglas Importantes</h2>
          <Card className="border-2 border-red-200 bg-red-50/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                {service.rules.map((rule: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Notes */}
      {service.notes && (
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Notas Adicionales</h2>
          <Card className="border-2 border-blue-200 bg-blue-50/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                {service.notes.map((note: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Tips */}
      {service.tips && (
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          <Card className="border-2 border-green-200 bg-green-50/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 font-medium">{service.tips}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <SiteFooter />
    </div>
  )
}
