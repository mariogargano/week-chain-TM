"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import SphereImageGrid, { type ImageData } from "@/components/ui/img-sphere"
import { Users, TrendingUp, Building2, Globe } from "lucide-react"
import Link from "next/link"
import { FaXTwitter, FaFacebook, FaLinkedin, FaInstagram, FaTelegram, FaDiscord } from "react-icons/fa6"

const COMMUNITY_MEMBERS: ImageData[] = [
  {
    id: "broker-1",
    src: "/professional-real-estate-broker-man.jpg",
    alt: "Broker Elite",
    title: "Carlos Mendoza - Broker Elite",
    description: "Broker Elite con 15 propiedades listadas. Comisión total: $45,000 USD.",
  },
  {
    id: "broker-2",
    src: "/professional-woman-broker-luxury.jpg",
    alt: "Broker Elite",
    title: "María González - Broker Elite",
    description: "Especialista en propiedades de lujo. 22 propiedades en portfolio.",
  },
  {
    id: "broker-3",
    src: "/young-real-estate-agent-success.jpg",
    alt: "Broker Elite",
    title: "Roberto Sánchez - Broker Elite",
    description: "Broker con red de 50+ referidos. Total ganado: $120,000 USD.",
  },
  {
    id: "broker-4",
    src: "/professional-woman-realtor-modern.jpg",
    alt: "Broker Elite",
    title: "Ana Torres - Broker Elite",
    description: "Experta en preventa de propiedades vacacionales.",
  },
  {
    id: "owner-1",
    src: "/business-owner-property-developer.jpg",
    alt: "Propietario",
    title: "Luis Ramírez - Propietario",
    description: "Propietario de villa en Tulum. 48/52 semanas vendidas.",
  },
  {
    id: "owner-2",
    src: "/woman-entrepreneur-property-owner.jpg",
    alt: "Propietaria",
    title: "Patricia Herrera - Propietaria",
    description: "Desarrolladora con 3 propiedades tokenizadas en Cancún.",
  },
  {
    id: "owner-3",
    src: "/mature-businessman-real-estate.jpg",
    alt: "Propietario",
    title: "Javier Morales - Propietario",
    description: "Propietario de complejo en Los Cabos. Preventa exitosa.",
  },
  {
    id: "user-1",
    src: "/happy-vacation-investor-man.jpg",
    alt: "Usuario",
    title: "Fernando López - Usuario",
    description: "Propietario de 4 semanas en diferentes propiedades.",
  },
  {
    id: "user-2",
    src: "/young-woman-digital-nomad-investor.jpg",
    alt: "Usuario",
    title: "Claudia Jiménez - Usuario",
    description: "Usuario con 6 semanas. Renta 3 semanas en Airbnb.",
  },
  {
    id: "user-3",
    src: "/family-man-vacation-property-owner.jpg",
    alt: "Usuario",
    title: "Miguel Ángel Cruz - Usuario",
    description: "Familia con 2 semanas en Riviera Maya.",
  },
  {
    id: "user-4",
    src: "/professional-woman-investor-success.jpg",
    alt: "Usuario",
    title: "Gabriela Ruiz - Usuario",
    description: "Portfolio diversificado: 8 semanas en 5 propiedades.",
  },
  {
    id: "user-5",
    src: "/businessman-vacation-property-investor.jpg",
    alt: "Usuario",
    title: "Ricardo Vargas - Usuario",
    description: "Usuario temprano con 12 semanas. Participación activa en DAO.",
  },
  {
    id: "broker-5",
    src: "/professional-real-estate-agent-woman.png",
    alt: "Broker",
    title: "Sofía Ramírez - Broker",
    description: "Broker especializada en propiedades de playa.",
  },
  {
    id: "owner-4",
    src: "/architect-property-developer.jpg",
    alt: "Propietario",
    title: "Arquitecto Pérez - Propietario",
    description: "Desarrollador con visión sustentable.",
  },
]

export function CommunitySpherePopup() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent border-2 border-[#C7CEEA] text-[#5B4B8A] hover:bg-[#C7CEEA]/20 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Globe className="mr-2 h-5 w-5" />
          Descubre Nuestra Red
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <div className="relative bg-gradient-to-br from-[#C7CEEA]/20 via-white to-[#FF9AA2]/10 p-6 md:p-8">
          <DialogHeader className="text-center mb-6">
            <Badge className="mx-auto mb-4 bg-[#C7CEEA]/20 text-[#5B4B8A] hover:bg-[#C7CEEA]/30 border-[#C7CEEA]/40 text-sm font-semibold px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Nuestra Comunidad
            </Badge>
            <DialogTitle className="text-3xl md:text-4xl font-bold text-slate-900">
              Comunidad en Crecimiento
            </DialogTitle>
            <p className="text-slate-600 mt-2">
              Conoce a brokers, propietarios y usuarios que ya forman parte del ecosistema WEEK-CHAIN
            </p>
          </DialogHeader>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#FF9AA2]/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9AA2]/20">
                  <Users className="h-5 w-5 text-[#FF9AA2]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">10</div>
                  <div className="text-xs text-slate-600">Brokers</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#B5EAD7]/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B5EAD7]/20">
                  <Building2 className="h-5 w-5 text-[#B5EAD7]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">5</div>
                  <div className="text-xs text-slate-600">Propiedades</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#C7CEEA]/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C7CEEA]/20">
                  <TrendingUp className="h-5 w-5 text-[#C7CEEA]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">60</div>
                  <div className="text-xs text-slate-600">En Espera</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[#FFDAC1]/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFDAC1]/20">
                  <Users className="h-5 w-5 text-[#FFDAC1]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">Pre-Holders</div>
                  <div className="text-xs text-slate-600">Confirmados</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Sphere */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
              <SphereImageGrid
                images={COMMUNITY_MEMBERS}
                containerSize={400}
                sphereRadius={150}
                dragSensitivity={0.8}
                momentumDecay={0.96}
                maxRotationSpeed={6}
                baseImageScale={0.16}
                hoverScale={1.3}
                perspective={1000}
                autoRotate={true}
                autoRotateSpeed={0.25}
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-4">Arrastra para explorar - Haz clic para ver detalles</p>
          </div>

          {/* Social Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 mb-4">Únete a nuestra comunidad en redes sociales</p>
            <div className="flex justify-center gap-3">
              <Link
                href="https://twitter.com/weekchain"
                target="_blank"
                className="h-10 w-10 rounded-full bg-[#000000] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <FaXTwitter className="h-5 w-5 text-white" />
              </Link>
              <Link
                href="https://facebook.com/weekchain"
                target="_blank"
                className="h-10 w-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <FaFacebook className="h-5 w-5 text-white" />
              </Link>
              <Link
                href="https://linkedin.com/company/weekchain"
                target="_blank"
                className="h-10 w-10 rounded-full bg-[#0A66C2] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <FaLinkedin className="h-5 w-5 text-white" />
              </Link>
              <Link
                href="https://instagram.com/weekchain"
                target="_blank"
                className="h-10 w-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <FaInstagram className="h-5 w-5 text-white" />
              </Link>
              <Link
                href="https://t.me/weekchain"
                target="_blank"
                className="h-10 w-10 rounded-full bg-[#0088CC] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <FaTelegram className="h-5 w-5 text-white" />
              </Link>
              <Link
                href="https://discord.gg/weekchain"
                target="_blank"
                className="h-10 w-10 rounded-full bg-[#5865F2] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <FaDiscord className="h-5 w-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
