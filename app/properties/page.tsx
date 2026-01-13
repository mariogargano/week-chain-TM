"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Shield,
  Gift,
  Bed,
  Bath,
  Maximize,
  Star,
  Sparkles,
  Eye,
  Info,
  CalendarIcon,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { MexicoMapTriggerButton } from "@/components/mexico-map-popup"
import { NotaryBadge } from "@/components/notary-badge"
import { DashboardCalendarDemo } from "@/components/dashboard-calendar-demo"

export const dynamic = "force-dynamic"

const PARTICIPATING_DESTINATIONS = [
  {
    id: "aflora-tulum",
    name: "AFLORA Tulum",
    location: "Tulum, Quintana Roo, México",
    operator: "María Carmen López",
    description:
      "Ejemplo de alojamiento participante: departamento en el corazón de Tulum con arquitectura orgánica, rodeado de selva maya. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/images/diseno-sin-titulo-4.jpg",
    amenities: ["Alberca Natural", "Spa & Wellness", "Restaurante", "Yoga Deck", "Cenote Privado"],
    gallery: [
      "/images/diseno-sin-titulo-4.jpg",
      "/images/photo-2025-10-08-12-39-27-203.jpg",
      "/images/photo-2025-10-08-12-39-27-202.jpg",
      "/images/photo-2025-10-08-12-39-27-204.jpg",
    ],
    specs: { bedrooms: 1, bathrooms: 1, size: "65m²", maxGuests: 2 },
    type: "Alojamiento Participante",
  },
  {
    id: "uxan-villa-aruma",
    name: "UXAN Villa Aruma",
    location: "Tulum, Riviera Maya, México",
    operator: "Roberto Sánchez Mendoza",
    description:
      "Experimenta la armonía entre la arquitectura sostenible y la naturaleza, donde la serenidad se encuentra en cada rincón. Con 1,000 m² de terreno y 277 m² de construcción, es la villa más espaciosa de UXAN. Villa de bambú sumergida en el corazón de la selva maya. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7207a97f94e0d5d60adc_0000.jpg",
    amenities: [
      "Construcción con Bambú",
      "Arquitectura Sostenible",
      "Vista a Selva Maya",
      "Diseño Bioclimático",
      "Jardines Tropicales",
    ],
    gallery: [
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7207a97f94e0d5d60adc_0000.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c720817b5a4e7fca634ab_0014.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c720845505970245c9607_0013.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c720766c5a4b84e22e275_0015.jpg",
    ],
    specs: { bedrooms: 3, bathrooms: 3, size: "277m²", maxGuests: 6 },
    type: "Alojamiento Participante",
  },
  {
    id: "uxan-villa-naab",
    name: "UXAN Villa Naab",
    location: "Tulum, Riviera Maya, México",
    operator: "Roberto Sánchez Mendoza",
    description:
      "En medio de la selva y rodeada de naturaleza, esta villa de bambú deslumbra por su auténtica arquitectura. Con 1,000 m² de terreno y 218 m² de construcción, ofrece una experiencia única de conexión con la naturaleza en la Riviera Maya. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c725309cc9bd18f1c442d_0009.jpg",
    amenities: ["Villa de Bambú", "Auténtica Arquitectura", "Rodeada de Selva", "Diseño Orgánico", "Conexión Natural"],
    gallery: [
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c725309cc9bd18f1c442d_0009.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c725309cc9bd18f1c4428_0001.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c725396ee4a96cd033a11_0005.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c72535c04b2e158ebd4f5_0000.jpg",
    ],
    specs: { bedrooms: 3, bathrooms: 3, size: "218m²", maxGuests: 6 },
    type: "Alojamiento Participante",
  },
  {
    id: "uxan-villa-cora",
    name: "UXAN Villa Cora",
    location: "Tulum, Riviera Maya, México",
    operator: "Roberto Sánchez Mendoza",
    description:
      "Sumérgete en la serenidad mientras esta residencia de ensueño se funde armoniosamente con la naturaleza. Villa de bambú con 1,000 m² de terreno y 158 m² de construcción en el corazón de la selva maya. Diseño que respeta el ecosistema local. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7265d811d8c5b87393f3_Cora_10.jpg",
    amenities: [
      "Residencia de Ensueño",
      "Fusión con Naturaleza",
      "Arquitectura de Bambú",
      "Selva Maya",
      "Diseño Ecológico",
    ],
    gallery: [
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7265d811d8c5b87393f3_Cora_10.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7265d811d8c5b8739317_Cora_02.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c72652fe10ff1177e7215_Cora_11.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7265698e95f38405b70b_Cora_08.jpg",
    ],
    specs: { bedrooms: 2, bathrooms: 2, size: "158m²", maxGuests: 4 },
    type: "Alojamiento Participante",
  },
  {
    id: "uxan-loft-saasil",
    name: "UXAN Loft Saasil",
    location: "Tulum, Riviera Maya, México",
    operator: "Roberto Sánchez Mendoza",
    description:
      "Descubre Saasil, lofts de bambú diseñados para crear un espacio armonioso en conexión con la naturaleza. Con 60 m² de construcción, ofrece una experiencia íntima y acogedora en medio de la selva. Ideal para parejas o viajeros solitarios. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7221bf5472a2eb02db6f_0000.jpg",
    amenities: ["Loft de Bambú", "Diseño Minimalista", "Conexión Natural", "Espacio Íntimo", "Vista a Selva"],
    gallery: [
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7221bf5472a2eb02db6f_0000.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c72213ed70e442f4a8e7c_0017.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c7221f7a54b20ccceb955_0016.jpg",
      "https://cdn.prod.website-files.com/65fc71a078305843e339ff15/660c722150040bd7c96fceec_0002.jpg",
    ],
    specs: { bedrooms: 1, bathrooms: 1, size: "60m²", maxGuests: 3 },
    type: "Alojamiento Participante",
  },
  {
    id: "vila-ksamil",
    name: "Vila Ksamil",
    location: "Ksamil, Riviera Albanesa, Albania",
    operator: "Altin Hoxha",
    description:
      "Villa moderna frente al mar en la Riviera Albanesa con vistas al Mar Jónico. Diseño mediterráneo contemporáneo con amplias terrazas y acceso directo a playas de arena blanca. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/luxury-modern-beachfront-villa-ksamil-albania-whit.jpg",
    amenities: [
      "Vista al Mar Jónico",
      "Acceso Directo a Playa",
      "Terrazas Amplias",
      "Piscina Infinity",
      "Diseño Mediterráneo",
    ],
    gallery: [
      "/luxury-modern-beachfront-villa-ksamil-albania-whit.jpg",
      "/luxury-modern-beachfront-villa-ksamil-albania-whit.jpg",
    ],
    specs: { bedrooms: 5, bathrooms: 4, size: "380m²", maxGuests: 10 },
    type: "Alojamiento Participante",
  },
  {
    id: "bosphorus-yali",
    name: "Bosphorus Yalı",
    location: "Estambul, Bósforo, Turquía",
    operator: "Mehmet Öztürk",
    description:
      "Mansión histórica otomana renovada a orillas del Bósforo con vistas panorámicas del estrecho. Arquitectura tradicional turca con acabados contemporáneos de lujo. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/ottoman-yali-mansion-bosphorus-istanbul-waterfront.jpg",
    amenities: [
      "Vista al Bósforo",
      "Arquitectura Otomana",
      "Muelle Privado",
      "Hammam Tradicional",
      "Jardines Orientales",
    ],
    gallery: [
      "/ottoman-yali-mansion-bosphorus-istanbul-waterfront.jpg",
      "/ottoman-yali-mansion-bosphorus-istanbul-waterfront.jpg",
    ],
    specs: { bedrooms: 6, bathrooms: 5, size: "520m²", maxGuests: 12 },
    type: "Alojamiento Participante",
  },
  {
    id: "borgo-civita",
    name: "Borgo di Civita",
    location: "Orvieto, Umbría, Italia",
    operator: "Alessandro Bianchi",
    description:
      "Villa en borgo medieval restaurado con vistas a viñedos umbríos. Arquitectura de piedra histórica con interiores modernos en la región vinícola de Orvieto. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/medieval-stone-borgo-orvieto-umbria-italy-hilltop-.jpg",
    amenities: ["Borgo Medieval", "Viñedos Propios", "Terraza Panorámica", "Bodega de Vino", "Piscina con Vista"],
    gallery: [
      "/medieval-stone-borgo-orvieto-umbria-italy-hilltop-.jpg",
      "/medieval-stone-borgo-orvieto-umbria-italy-hilltop-.jpg",
    ],
    specs: { bedrooms: 4, bathrooms: 3, size: "350m²", maxGuests: 8 },
    type: "Alojamiento Participante",
  },
  {
    id: "casa-bacalar",
    name: "Casa Bacalar",
    location: "Bacalar, Quintana Roo, México",
    operator: "Daniela Ramírez Torres",
    description:
      "Villa moderna sobre la Laguna de los Siete Colores con diseño contemporáneo tropical. Arquitectura abierta con vistas panorámicas y acceso directo al agua cristalina. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/modern-luxury-villa-bacalar-lagoon-mexico-overwate.jpg",
    amenities: ["Vista a Laguna", "Muelle Privado", "Diseño Tropical", "Kayaks Incluidos", "Terrazas sobre Agua"],
    gallery: [
      "/modern-luxury-villa-bacalar-lagoon-mexico-overwate.jpg",
      "/modern-luxury-villa-bacalar-lagoon-mexico-overwate.jpg",
    ],
    specs: { bedrooms: 3, bathrooms: 3, size: "240m²", maxGuests: 6 },
    type: "Alojamiento Participante",
  },
  {
    id: "villa-positano",
    name: "Villa Positano",
    location: "Positano, Costa Amalfitana, Italia",
    operator: "Giuseppe Romano",
    description:
      "Villa en acantilado con vistas espectaculares al Mediterráneo en la icónica Costa Amalfitana. Diseño italiano clásico con terrazas escalonadas y jardines colgantes. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/cliffside-villa-positano-amalfi-coast-italy-medite.jpg",
    amenities: [
      "Vista al Mediterráneo",
      "Terrazas Escalonadas",
      "Piscina Infinity",
      "Jardines Colgantes",
      "Acceso a Playa Privada",
    ],
    gallery: [
      "/cliffside-villa-positano-amalfi-coast-italy-medite.jpg",
      "/cliffside-villa-positano-amalfi-coast-italy-medite.jpg",
    ],
    specs: { bedrooms: 5, bathrooms: 5, size: "420m²", maxGuests: 10 },
    type: "Alojamiento Participante",
  },
  {
    id: "chalet-dolomites",
    name: "Chalet Dolomiti",
    location: "Cortina d'Ampezzo, Dolomitas, Italia",
    operator: "Francesca Moretti",
    description:
      "Chalet de lujo alpino con vistas a los picos de los Dolomitas. Diseño tradicional de montaña con spa privado y acceso directo a pistas de esquí. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/luxury-alpine-chalet-dolomites-italy-mountain-view.jpg",
    amenities: ["Vista a Dolomitas", "Spa Privado", "Acceso a Pistas", "Chimenea de Piedra", "Sauna Finlandesa"],
    gallery: [
      "/luxury-alpine-chalet-dolomites-italy-mountain-view.jpg",
      "/luxury-alpine-chalet-dolomites-italy-mountain-view.jpg",
    ],
    specs: { bedrooms: 4, bathrooms: 4, size: "310m²", maxGuests: 8 },
    type: "Alojamiento Participante",
  },
  {
    id: "finca-puebla",
    name: "Finca Cholula",
    location: "Cholula, Valle de Puebla, México",
    operator: "José Luis Hernández García",
    description:
      "Hacienda colonial restaurada con vistas a la pirámide de Cholula. Arquitectura histórica mexicana con acabados de lujo y amplios jardines tradicionales. Acceso sujeto a disponibilidad del sistema WEEK-CHAIN.",
    image_url: "/colonial-hacienda-cholula-puebla-mexico-pyramid-vi.jpg",
    amenities: ["Vista a Pirámide", "Hacienda Colonial", "Jardines Extensos", "Capilla Privada", "Piscina Histórica"],
    gallery: [
      "/colonial-hacienda-cholula-puebla-mexico-pyramid-vi.jpg",
      "/colonial-hacienda-cholula-puebla-mexico-pyramid-vi.jpg",
    ],
    specs: { bedrooms: 6, bathrooms: 4, size: "580m²", maxGuests: 12 },
    type: "Alojamiento Participante",
  },
]

function DestinationCard({ destination }: { destination: (typeof PARTICIPATING_DESTINATIONS)[0] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % destination.gallery.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [destination.gallery.length])

  return (
    <div className="relative">
      {/* Premium card with dark header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 rounded-t-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0 text-xs">
                <Eye className="w-3 h-3 mr-1" />
                {destination.type}
              </Badge>
              <Badge className="bg-[#B5EAD7]/20 text-[#B5EAD7] border-[#B5EAD7]/30 text-xs">
                <Info className="w-3 h-3 mr-1" />
                Referencia
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-white">{destination.name}</h2>
            <p className="text-slate-400 flex items-center gap-1 text-sm mt-1">
              <MapPin className="h-3 w-3 text-[#FF9AA2]" />
              {destination.location}
            </p>
            {destination.operator && (
              <p className="text-slate-300 text-sm mt-2 font-medium">
                <span className="text-slate-400">Operador local:</span> {destination.operator}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/20">
              <p className="text-xs text-slate-400 mb-1">Acceso mediante</p>
              <p className="text-sm font-bold text-[#B5EAD7]">Smart Vacational</p>
              <p className="text-sm font-bold text-[#B5EAD7]">Certificate</p>
              <p className="text-[10px] text-slate-400 mt-1">Sujeto a disponibilidad</p>
            </div>
          </div>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-sm text-slate-300 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
            <Bed className="h-4 w-4 text-[#FFB7B2]" />
            {destination.specs.bedrooms} Rec.
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
            <Bath className="h-4 w-4 text-[#C7CEEA]" />
            {destination.specs.bathrooms} Baños
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
            <Maximize className="h-4 w-4 text-[#B5EAD7]" />
            {destination.specs.size}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
            <Users className="h-4 w-4 text-[#FFDAC1]" />
            Hasta {destination.specs.maxGuests} huéspedes
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <NotaryBadge propertyId={destination.id} compact />
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-b-3xl border border-t-0 border-slate-200 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Gallery */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={destination.gallery[currentImageIndex] || "/placeholder.svg"}
                alt={destination.name}
                fill
                className="object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) => (prev - 1 + destination.gallery.length) % destination.gallery.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronLeft className="h-4 w-4 text-slate-900" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % destination.gallery.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronRight className="h-4 w-4 text-slate-900" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {destination.gallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <NotaryBadge propertyId={destination.id} />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-slate-600 text-sm leading-relaxed">{destination.description}</p>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mt-4">
              {destination.amenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-gradient-to-r from-[#FFDAC1]/30 to-[#FFB7B2]/30 text-slate-700 border border-[#FFDAC1]/50"
                >
                  <Star className="w-3 h-3 mr-1 text-[#FF9AA2]" />
                  {amenity}
                </Badge>
              ))}
            </div>

            {/* SVC disclaimer explaining this is reference only */}
            <div className="mt-5 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-2">Alojamiento de Referencia</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Este es un <span className="font-bold">ejemplo de alojamiento participante</span> en el sistema
                    WEEK-CHAIN. El acceso está sujeto a disponibilidad del sistema y NO está garantizado para fechas,
                    temporadas o destinos específicos. Tu Smart Vacational Certificate otorga el{" "}
                    <span className="font-bold">derecho de solicitud</span> de uso temporal, no propiedad ni asignación
                    de este inmueble en particular.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits with SVC language */}
            <div className="mt-4 p-4 bg-gradient-to-r from-[#FFDAC1]/20 to-[#E2F0CB]/20 rounded-xl border border-[#FFDAC1]/30">
              <p className="font-medium text-slate-900 mb-2 text-sm">Con tu Smart Vacational Certificate:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-[#FF9AA2]" />
                  Derecho de solicitud 15 años
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-[#C7CEEA]" />
                  Solicitud según disponibilidad
                </span>
                <span className="flex items-center gap-2">
                  <Gift className="h-3.5 w-3.5 text-[#B5EAD7]" />
                  Gestión opcional (sujeto a aprobación)
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-[#FFDAC1]" />
                  Protección de pago
                </span>
              </div>
            </div>

            <Link href="/auth" className="mt-auto">
              <Button className="w-full mt-5 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white shadow-lg shadow-[#FF9AA2]/30 h-12 text-base rounded-xl">
                <Sparkles className="h-5 w-5 mr-2" />
                Adquirir Smart Vacational Certificate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FFDAC1]/5 to-white">
      <Navbar />

      <section className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9AA2]/10 via-[#FFDAC1]/10 to-[#C7CEEA]/10" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center">
            <Badge className="bg-white/80 text-[#FF6B6B] border border-[#FFB5BA]/50 mb-4 backdrop-blur-sm">
              <Eye className="w-3 h-3 mr-1" />
              Catálogo de Destinos Participantes
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Ejemplos de{" "}
              <span className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] bg-clip-text text-transparent">
                Alojamientos Participantes
              </span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto mb-6">
              Explora ejemplos de alojamientos que forman parte del sistema WEEK-CHAIN. Estos destinos son referencias
              inspiracionales. El acceso está sujeto a disponibilidad del sistema y NO garantiza fechas, temporadas ni
              asignación de propiedades específicas.
            </p>
            <div className="max-w-3xl mx-auto mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">Importante:</span> Esta es una capa de descubrimiento. Los alojamientos
                mostrados son ejemplos de destinos participantes en el sistema. Tu Smart Vacational Certificate otorga
                el derecho de solicitud de uso temporal según disponibilidad, NO la propiedad, acceso garantizado ni
                asignación de estos inmuebles específicos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations List */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-10">
          {PARTICIPATING_DESTINATIONS.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <Badge className="bg-white/80 text-[#FF6B6B] border border-[#FFB5BA]/50 mb-4 backdrop-blur-sm">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Vista Previa Dashboard
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Tu{" "}
              <span className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] bg-clip-text text-transparent">
                Dashboard Personal
              </span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Visualiza cómo gestionarás tus solicitudes de uso vacacional en tu dashboard personal. Calendario
              interactivo, seguimiento de reservaciones, y control total de tus certificados.
            </p>
          </div>
          <DashboardCalendarDemo />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-[#B5EAD7]/10 via-white to-[#FFDAC1]/10">
        <div className="container mx-auto max-w-4xl">
          <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF9AA2]/20 to-[#C7CEEA]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-[#B5EAD7]/20 to-[#FFDAC1]/20 rounded-full blur-3xl" />
            <div className="relative text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Explora Más Destinos de Referencia</h2>
              <p className="text-slate-300 max-w-xl mx-auto mb-8">
                Descubre más ejemplos de alojamientos participantes en nuestro sistema. Recuerda que el acceso está
                sujeto a disponibilidad y no garantiza destinos específicos.
              </p>
              <MexicoMapTriggerButton />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
