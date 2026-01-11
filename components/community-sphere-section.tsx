"use client"

import SphereImageGrid, { type ImageData } from "@/components/ui/img-sphere"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, TrendingUp, Building2 } from "lucide-react"
import Link from "next/link"
import { FaXTwitter, FaFacebook, FaLinkedin, FaInstagram, FaTelegram, FaDiscord } from "react-icons/fa6"

const COMMUNITY_MEMBERS: ImageData[] = [
  // Brokers Elite
  {
    id: "broker-1",
    src: "/professional-real-estate-broker-man.jpg",
    alt: "Intermediario",
    title: "Carlos Mendoza - Intermediario",
    description:
      "Intermediario con 8 certificados vendidos. Comisión simple por referencia directa. Honorarios totales aplicados.",
  },
  {
    id: "broker-2",
    src: "/professional-woman-broker-luxury.jpg",
    alt: "Intermediaria",
    title: "María González - Intermediaria",
    description: "Especialista en certificados de lujo. 12 certificados facilitados. Comisión simple por venta.",
  },
  {
    id: "broker-3",
    src: "/young-real-estate-agent-success.jpg",
    alt: "Intermediario",
    title: "Roberto Sánchez - Intermediario",
    description: "Intermediario con 25+ clientes referidos. Comisión simple y directa por cada certificado vendido.",
  },
  {
    id: "broker-4",
    src: "/professional-woman-realtor-modern.jpg",
    alt: "Intermediaria",
    title: "Ana Torres - Intermediaria",
    description: "Experta en certificados vacacionales. Portfolio: 10 certificados activos vendidos.",
  },

  // Property Owners
  {
    id: "owner-1",
    src: "/business-owner-property-developer.jpg",
    alt: "Propietario",
    title: "Luis Ramírez - Propietario",
    description: "Propietario participante en Tulum. Destino verificado en sistema WEEK-CHAIN.",
  },
  {
    id: "owner-2",
    src: "/woman-entrepreneur-property-owner.jpg",
    alt: "Propietaria",
    title: "Patricia Herrera - Propietaria",
    description: "Propietaria con 2 destinos participantes en Cancún. Verificados en sistema.",
  },
  {
    id: "owner-3",
    src: "/mature-businessman-real-estate.jpg",
    alt: "Propietario",
    title: "Javier Morales - Propietario",
    description: "Propietario de complejo en Los Cabos. Destino participante verificado.",
  },
  {
    id: "owner-4",
    src: "/young-entrepreneur-property-developer.jpg",
    alt: "Propietario",
    title: "Diego Castillo - Propietario",
    description: "Propietario con 1 destino en Playa del Carmen. Sistema WEEK-CHAIN activo.",
  },

  // Users/Investors
  {
    id: "user-1",
    src: "/happy-vacation-investor-man.jpg",
    alt: "Titular",
    title: "Fernando López - Titular",
    description: "Titular de 2 certificados Gold en diferentes destinos. 2 semanas de acceso/año.",
  },
  {
    id: "user-2",
    src: "/young-woman-digital-nomad-investor.jpg",
    alt: "Titular",
    title: "Claudia Jiménez - Titular",
    description: "Titular con 1 certificado Platinum. Solicita gestión de renta opcional del sistema.",
  },
  {
    id: "user-3",
    src: "/family-man-vacation-property-owner.jpg",
    alt: "Titular",
    title: "Miguel Ángel Cruz - Titular",
    description: "Familia con 1 certificado Gold en Riviera Maya. Uso personal anual.",
  },
  {
    id: "user-4",
    src: "/professional-woman-investor-success.jpg",
    alt: "Titular",
    title: "Gabriela Ruiz - Titular",
    description: "Titular de 3 certificados Silver en diferentes destinos. 3 semanas/año.",
  },
  {
    id: "user-5",
    src: "/businessman-vacation-property-investor.jpg",
    alt: "Titular",
    title: "Ricardo Vargas - Titular",
    description: "Titular con 1 certificado Signature. 4 semanas de acceso/año. Acceso VA-FI.",
  },
  {
    id: "user-6",
    src: "/young-couple-vacation-investors.jpg",
    alt: "Titulares",
    title: "Pareja Martínez - Titulares",
    description: "Titulares conjuntos de 2 certificados Gold. Uso familiar anual.",
  },

  // More diverse members
  {
    id: "broker-5",
    src: "/professional-real-estate-agent-woman.png",
    alt: "Intermediaria",
    title: "Sofía Ramírez - Intermediaria",
    description: "Intermediaria especializada en certificados de playa. 15+ clientes activos.",
  },
  {
    id: "owner-5",
    src: "/architect-property-developer.jpg",
    alt: "Propietario",
    title: "Arquitecto Pérez - Propietario",
    description: "Propietario con destinos eco-friendly participantes en sistema.",
  },
  {
    id: "user-7",
    src: "/placeholder.svg?height=200&width=200",
    alt: "Titulares",
    title: "Familia Rojas - Titulares",
    description: "Titulares de 1 certificado Gold. Uso vacacional anual para retiro.",
  },
  {
    id: "user-8",
    src: "/placeholder.svg?height=200&width=200",
    alt: "Titular",
    title: "Alex Domínguez - Titular",
    description: "Titular de 2 certificados Platinum. 4 semanas de acceso/año.",
  },
]

export function CommunitySphereSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#C7CEEA]/20 via-white to-[#FF9AA2]/10 px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-[#B5EAD7]/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#FFB7B2]/20 blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="mb-12 md:mb-16 text-center px-4">
          <Badge className="mb-4 bg-[#C7CEEA]/20 text-[#5B4B8A] hover:bg-[#C7CEEA]/30 border-[#C7CEEA]/40 text-sm font-semibold px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            Nuestra Comunidad
          </Badge>
          <h2 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight text-balance">
            Comunidad en Crecimiento
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-pretty px-2">
            Conoce a intermediarios, propietarios y titulares que ya forman parte del ecosistema WEEK-CHAIN™
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16 max-w-5xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-5 md:p-6 border-2 border-[#FF9AA2]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-[#FF9AA2]/20 flex-shrink-0">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-[#FF9AA2]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900">10</div>
                <div className="text-xs md:text-sm text-slate-600 font-medium">Intermediarios Activos</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-5 md:p-6 border-2 border-[#B5EAD7]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-[#B5EAD7]/20 flex-shrink-0">
                <Building2 className="h-6 w-6 md:h-7 md:w-7 text-[#B5EAD7]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900">5</div>
                <div className="text-xs md:text-sm text-slate-600 font-medium">Destinos Participantes</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-5 md:p-6 border-2 border-[#C7CEEA]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-[#C7CEEA]/20 flex-shrink-0">
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-[#C7CEEA]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900">60</div>
                <div className="text-xs md:text-sm text-slate-600 font-medium">En Lista de Espera</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-5 md:p-6 border-2 border-[#FFDAC1]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-[#FFDAC1]/20 flex-shrink-0">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-[#FFDAC1]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900">Pre-Titulares</div>
                <div className="text-xs md:text-sm text-slate-600 font-medium">Confirmados</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Sphere */}
        <div className="flex flex-col items-center gap-6 md:gap-8 px-4">
          <div className="relative w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[600px] aspect-square flex items-center justify-center">
            <SphereImageGrid
              images={COMMUNITY_MEMBERS}
              containerSize={600}
              sphereRadius={220}
              dragSensitivity={0.8}
              momentumDecay={0.96}
              maxRotationSpeed={6}
              baseImageScale={0.14}
              hoverScale={1.3}
              perspective={1000}
              autoRotate={true}
              autoRotateSpeed={0.25}
              className="w-full h-full"
            />

            {/* Instruction overlay */}
            <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 transform -translate-x-1/2 text-center w-full px-4">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                <span className="hidden sm:inline">Arrastra para explorar • Haz clic para ver detalles</span>
                <span className="sm:hidden">Toca para ver detalles</span>
              </p>
            </div>
          </div>

          <div className="text-center mt-4 sm:mt-8 space-y-4 md:space-y-6 px-4">
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Cada miembro de nuestra comunidad contribuye al crecimiento del ecosistema. Intermediarios conectan
              certificados con usuarios, propietarios comparten sus destinos únicos, y titulares disfrutan de
              experiencias vacacionales.
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:opacity-90 text-white font-semibold px-6 md:px-8 py-5 md:py-6 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Únete a Nuestra Comunidad
                  <Users className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">Únete a WEEK-CHAIN™</DialogTitle>
                  <DialogDescription className="text-center text-base pt-2">
                    Elige tu red social favorita para conectar con nuestra comunidad
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-6">
                  {/* X (Twitter) */}
                  <Link
                    href="https://twitter.com/weekchain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-[#000000] hover:bg-slate-50 transition-all duration-300 group"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#000000] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaXTwitter className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">X / Twitter</span>
                  </Link>

                  {/* Facebook */}
                  <Link
                    href="https://facebook.com/weekchain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-[#1877F2] hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#1877F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaFacebook className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">Facebook</span>
                  </Link>

                  {/* LinkedIn */}
                  <Link
                    href="https://linkedin.com/company/weekchain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-[#0A66C2] hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#0A66C2] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaLinkedin className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">LinkedIn</span>
                  </Link>

                  {/* Instagram */}
                  <Link
                    href="https://instagram.com/weekchain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-[#E4405F] hover:bg-pink-50 transition-all duration-300 group"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaInstagram className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">Instagram</span>
                  </Link>

                  {/* Telegram */}
                  <Link
                    href="https://t.me/weekchain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-[#0088CC] hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#0088CC] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaTelegram className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">Telegram</span>
                  </Link>

                  {/* Discord */}
                  <Link
                    href="https://discord.gg/weekchain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-[#5865F2] hover:bg-indigo-50 transition-all duration-300 group"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#5865F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaDiscord className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">Discord</span>
                  </Link>
                </div>

                <p className="text-center text-sm text-slate-500 pt-2">
                  Síguenos en todas nuestras redes sociales para estar al día con WEEK-CHAIN™
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  )
}
