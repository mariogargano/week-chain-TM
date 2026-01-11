"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle2, MapPin, Phone, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Operator {
  id: string
  name: string
  title: string
  location: string
  photo_url: string | null
  license_number: string | null
  specialty: string | null
  phone?: string
  email?: string
  website?: string
  verified: boolean
}

interface NotaryBadgeProps {
  propertyId?: string
  notary?: Operator
  compact?: boolean
}

const FALLBACK_NOTARIES: Record<string, Operator> = {
  "polo-54": {
    id: "operator-01",
    name: "Lic. Roberto Fernández Castillo",
    title: "Operador WEEK-CHAIN Certificado",
    location: "Playa del Carmen, Quintana Roo",
    photo_url: "/professional-mexican-notary-man-in-suit.jpg",
    license_number: "WC-OP-013-2024",
    specialty: "Coordinación de Solicitudes Vacacionales",
    verified: true,
  },
  "aflora-tulum": {
    id: "operator-02",
    name: "Lic. María Elena Gutiérrez Ramos",
    title: "Operadora WEEK-CHAIN Certificada",
    location: "Tulum, Quintana Roo",
    photo_url: "/professional-mexican-notary-woman-in-business-atti.jpg",
    license_number: "WC-OP-045-2024",
    specialty: "Gestión de Derechos de Uso Vacacional",
    verified: true,
  },
}

export function NotaryBadge({ propertyId, notary: initialNotary, compact = false }: NotaryBadgeProps) {
  const [notary, setNotary] = useState<Operator | null>(initialNotary || null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (initialNotary) {
      setNotary(initialNotary)
      return
    }

    // Usar fallback basado en propertyId
    if (propertyId && FALLBACK_NOTARIES[propertyId]) {
      setNotary(FALLBACK_NOTARIES[propertyId])
      return
    }

    // Default a Operador 01 para Playa del Carmen
    setNotary(FALLBACK_NOTARIES["polo-54"])
  }, [propertyId, initialNotary])

  if (!notary) return null

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800/90 border border-slate-700 hover:border-[#B5EAD7] transition-all group"
          >
            <div className="relative">
              <img
                src={notary.photo_url || "/placeholder.svg?height=32&width=32&query=operator"}
                alt={notary.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#B5EAD7]"
              />
              {notary.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#B5EAD7] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-slate-900" />
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white group-hover:text-[#B5EAD7] transition-colors">
                {notary.title}
              </p>
              <p className="text-[10px] text-slate-400">{notary.location}</p>
            </div>
          </motion.button>
        </DialogTrigger>
        <NotaryDialogContent notary={notary} />
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative cursor-pointer">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-[#B5EAD7] transition-all">
            <div className="flex items-center gap-4">
              {/* Foto circular del operador */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#B5EAD7] shadow-lg shadow-[#B5EAD7]/20">
                  <img
                    src={notary.photo_url || "/placeholder.svg?height=80&width=80&query=operator"}
                    alt={notary.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {notary.verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#B5EAD7] rounded-full flex items-center justify-center border-2 border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-slate-900" />
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-[#B5EAD7]/20 text-[#B5EAD7] border-[#B5EAD7]/30 text-[10px]">
                    <Shield className="w-2.5 h-2.5 mr-1" />
                    Certificado
                  </Badge>
                </div>
                <h4 className="text-white font-semibold text-sm">{notary.name}</h4>
                <p className="text-[#B5EAD7] font-medium text-xs">{notary.title}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {notary.location}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-slate-400 text-xs leading-relaxed">
                Operador certificado responsable de coordinar tus solicitudes de uso vacacional y garantizar el
                cumplimiento del flujo REQUEST → OFFER → CONFIRM.
              </p>
            </div>
          </div>
        </motion.div>
      </DialogTrigger>
      <NotaryDialogContent notary={notary} />
    </Dialog>
  )
}

function NotaryDialogContent({ notary }: { notary: Operator }) {
  return (
    <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#B5EAD7]" />
          Operador WEEK-CHAIN Certificado
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Header con foto */}
        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#B5EAD7] shadow-lg">
              <img
                src={notary.photo_url || "/placeholder.svg?height=96&width=96&query=operator"}
                alt={notary.name}
                className="w-full h-full object-cover"
              />
            </div>
            {notary.verified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#B5EAD7] rounded-full flex items-center justify-center border-2 border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-slate-900" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{notary.name}</h3>
            <p className="text-[#B5EAD7] font-semibold">{notary.title}</p>
            <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {notary.location}
            </p>
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-3">
          {notary.license_number && (
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <span className="text-slate-400 text-sm">ID de Operador</span>
              <span className="text-white font-mono text-sm">{notary.license_number}</span>
            </div>
          )}
          {notary.specialty && (
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <span className="text-slate-400 text-sm">Especialidad</span>
              <span className="text-white text-sm text-right max-w-[200px]">{notary.specialty}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#B5EAD7]/10 rounded-xl border border-[#B5EAD7]/20">
          <h4 className="text-[#B5EAD7] font-semibold text-sm mb-2">Responsabilidades</h4>
          <ul className="space-y-2 text-slate-300 text-xs">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#B5EAD7] mt-0.5 flex-shrink-0" />
              Coordinar solicitudes de uso vacacional (REQUEST)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#B5EAD7] mt-0.5 flex-shrink-0" />
              Generar ofertas disponibles sujetas a capacidad (OFFER)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#B5EAD7] mt-0.5 flex-shrink-0" />
              Confirmar reservaciones una vez aceptadas (CONFIRM)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#B5EAD7] mt-0.5 flex-shrink-0" />
              Gestionar certificados digitales de uso vacacional
            </li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {notary.phone && (
            <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 bg-transparent">
              <Phone className="w-4 h-4 mr-2" />
              Contactar
            </Button>
          )}
          {notary.website && (
            <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 bg-transparent">
              <ExternalLink className="w-4 h-4 mr-2" />
              Sitio Web
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  )
}
