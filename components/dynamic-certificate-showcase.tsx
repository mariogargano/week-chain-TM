"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Shield,
  Calendar,
  MapPin,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  QrCode,
  Verified,
  ArrowRight,
  Check,
  Users,
  Minus,
  Plus,
} from "lucide-react"

const PAX_CERTIFICATE_CATALOG = [
  // 2 PAX
  { id: "2pax-1est", pax: 2, estancias: 1, price_usd: 3500, beta_cap: 8 },
  { id: "2pax-2est", pax: 2, estancias: 2, price_usd: 6000, beta_cap: 6 },
  { id: "2pax-3est", pax: 2, estancias: 3, price_usd: 8000, beta_cap: 4 },
  { id: "2pax-4est", pax: 2, estancias: 4, price_usd: 10000, beta_cap: 2 },
  // 4 PAX
  { id: "4pax-1est", pax: 4, estancias: 1, price_usd: 5000, beta_cap: 10 },
  { id: "4pax-2est", pax: 4, estancias: 2, price_usd: 9000, beta_cap: 8 },
  { id: "4pax-3est", pax: 4, estancias: 3, price_usd: 12000, beta_cap: 5 },
  { id: "4pax-4est", pax: 4, estancias: 4, price_usd: 15000, beta_cap: 3 },
  // 6 PAX
  { id: "6pax-1est", pax: 6, estancias: 1, price_usd: 7500, beta_cap: 6 },
  { id: "6pax-2est", pax: 6, estancias: 2, price_usd: 13000, beta_cap: 5 },
  { id: "6pax-3est", pax: 6, estancias: 3, price_usd: 18000, beta_cap: 3 },
  { id: "6pax-4est", pax: 6, estancias: 4, price_usd: 20000, beta_cap: 1 },
  // 8 PAX
  { id: "8pax-1est", pax: 8, estancias: 1, price_usd: 10000, beta_cap: 3 },
  { id: "8pax-2est", pax: 8, estancias: 2, price_usd: 15000, beta_cap: 2 },
  { id: "8pax-3est", pax: 8, estancias: 3, price_usd: 20000, beta_cap: 1 },
  { id: "8pax-4est", pax: 8, estancias: 4, price_usd: 25000, beta_cap: 1 },
]

// Datos de ejemplo para la animación del certificado
const certificateData = [
  {
    holder: "María García López",
    destination: "Los Cabos Premium Resort",
    location: "Baja California Sur, México",
    week: 23,
    season: "summer" as const,
    country: "MX",
    flag: "🇲🇽",
    image: "/luxury-cabo-san-lucas-resort-ocean-view.jpg",
  },
  {
    holder: "John Smith",
    destination: "Cancún Beachfront Villa",
    location: "Quintana Roo, México",
    week: 51,
    season: "winter" as const,
    country: "US",
    flag: "🇺🇸",
    image: "/cancun-luxury-beachfront-resort-caribbean.jpg",
  },
  {
    holder: "Sophie Müller",
    destination: "Puerto Vallarta Luxury",
    location: "Jalisco, México",
    week: 15,
    season: "spring" as const,
    country: "DE",
    flag: "🇩🇪",
    image: "/puerto-vallarta-luxury-resort-sunset.jpg",
  },
  {
    holder: "Carlos Rodríguez",
    destination: "Riviera Maya Paradise",
    location: "Quintana Roo, México",
    week: 42,
    season: "fall" as const,
    country: "ES",
    flag: "🇪🇸",
    image: "/riviera-maya-luxury-resort-tropical.jpg",
  },
]

const seasonConfig = {
  summer: { icon: Sun, label: "Verano", color: "text-amber-500" },
  winter: { icon: Snowflake, label: "Invierno", color: "text-blue-500" },
  spring: { icon: Flower2, label: "Primavera", color: "text-pink-500" },
  fall: { icon: Leaf, label: "Otoño", color: "text-orange-500" },
}

export function DynamicCertificateShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const [selectedPax, setSelectedPax] = useState(2)
  const [selectedEstancias, setSelectedEstancias] = useState(1)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % certificateData.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const data = certificateData[currentIndex]
  const SeasonIcon = seasonConfig[data.season].icon
  const certNumber = `WC-${data.week.toString().padStart(2, "0")}-${2025}-${(currentIndex + 1).toString().padStart(4, "0")}`

  const selectedProduct = PAX_CERTIFICATE_CATALOG.find(
    (p) => p.pax === selectedPax && p.estancias === selectedEstancias,
  )

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US")
  }

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-16 md:py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Certificado Digital NOM-151
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Tu Derecho de Uso, <span className="text-amber-400">Certificado</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Cada semana vacacional incluye un certificado digital con validez legal, verificable y almacenable en tu
            wallet
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Certificate Card - Left Side */}
          <div
            className={`relative transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                {/* Background Image */}
                <div className="relative h-48 md:h-56">
                  <img
                    src={data.image || "/placeholder.svg"}
                    alt={data.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

                  {/* Top badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Badge className="bg-black/50 backdrop-blur-sm text-white border-white/20">
                      <Verified className="h-3 w-3 mr-1 text-emerald-400" />
                      NOM-151
                    </Badge>
                    <span className="text-3xl">{data.flag}</span>
                  </div>

                  {/* Week number overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="text-white">
                      <span className="text-xs uppercase tracking-wider text-white/70">Semana</span>
                      <div className="text-5xl font-bold leading-none">{data.week}</div>
                    </div>
                  </div>

                  {/* Season badge */}
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                      <SeasonIcon className={`h-3.5 w-3.5 mr-1 ${seasonConfig[data.season].color}`} />
                      {seasonConfig[data.season].label}
                    </Badge>
                  </div>
                </div>

                {/* Card content */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{data.destination}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {data.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Titular</p>
                      <p className="text-white font-medium">{data.holder}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Vigencia</p>
                        <p className="text-amber-400 font-semibold">15 Años</p>
                      </div>
                      <div className="h-12 w-12 bg-white rounded-lg p-1.5 flex items-center justify-center">
                        <QrCode className="h-full w-full text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Certificate number */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-slate-500 font-mono">{certNumber}</span>
                    </div>
                    <img
                      src="/week-chain-logo-white.png"
                      alt="WEEK-CHAIN"
                      className="h-4 opacity-50"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {certificateData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAnimating(true)
                    setTimeout(() => {
                      setCurrentIndex(i)
                      setIsAnimating(false)
                    }, 300)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "bg-amber-500 w-6" : "bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Ver certificado ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Features list */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-amber-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Certificación NOM-151</h3>
                  <p className="text-slate-400 text-sm">
                    Cada certificado cumple con la Norma Oficial Mexicana para documentos digitales con validez legal
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Verified className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Verificable al Instante</h3>
                  <p className="text-slate-400 text-sm">
                    Escanea el código QR para verificar la autenticidad y vigencia de cualquier certificado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">15 Años de Derechos de Solicitud</h3>
                  <p className="text-slate-400 text-sm">
                    Tu certificado te permite solicitar estancias cada año durante 15 años, sujeto a disponibilidad
                  </p>
                </div>
              </div>
            </div>

            {/* PAX Calculator Card */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Calcula tu Certificado Digital</h3>

              {/* PAX Selector */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-2 block">¿Cuántas personas viajan habitualmente?</label>
                <p className="text-xs text-slate-500 mb-3">
                  El sistema asigna automáticamente alojamientos compatibles con este número de personas
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-slate-600 bg-transparent hover:bg-slate-700"
                    onClick={() => setSelectedPax(Math.max(2, selectedPax - 2))}
                    disabled={selectedPax <= 2}
                  >
                    <Minus className="h-5 w-5 text-white" />
                  </Button>
                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 rounded-xl min-w-[120px] justify-center">
                    <Users className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-bold text-white">{selectedPax}</span>
                    <span className="text-slate-400">pax</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-slate-600 bg-transparent hover:bg-slate-700"
                    onClick={() => setSelectedPax(Math.min(8, selectedPax + 2))}
                    disabled={selectedPax >= 8}
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>

              {/* Estancias Selector */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-3 block">
                  ¿Cuántas estancias deseas solicitar por año?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((est) => (
                    <button
                      key={est}
                      onClick={() => setSelectedEstancias(est)}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                        selectedEstancias === est
                          ? "bg-amber-500 text-white"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {est}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Display */}
              {selectedProduct && (
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-5 border border-amber-500/30">
                  <div className="text-center mb-4">
                    <p className="text-sm text-amber-400 mb-1">Tu Certificado Digital Personalizado</p>
                    <div className="text-4xl font-bold text-white">
                      ${formatPrice(selectedProduct.price_usd)}
                      <span className="text-lg text-slate-400 font-normal"> USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-300 mb-4 pb-4 border-b border-white/10">
                    <span>Capacidad:</span>
                    <span className="font-semibold text-white">{selectedPax} personas</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-4 pb-4 border-b border-white/10">
                    <span>Derecho anual de solicitud:</span>
                    <span className="font-semibold text-white">
                      Hasta {selectedEstancias} estancia{selectedEstancias === 1 ? "" : "s"} (7 noches c/u)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
                    <span>Vigencia:</span>
                    <span className="font-semibold text-amber-400">15 años</span>
                  </div>

                  <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Este certificado otorga un derecho personal y digital de uso vacacional anual. No garantiza fechas
                      específicas y está sujeto a disponibilidad del sistema WEEK-CHAIN. No constituye propiedad,
                      copropiedad, fracción inmobiliaria, inversión ni tiempo compartido tradicional.
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12"
                  >
                    Activar Certificado Digital
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Confirmar Certificado</DialogTitle>
              <DialogDescription className="text-slate-400">
                Revisa los detalles de tu certificado antes de continuar
              </DialogDescription>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacidad</span>
                    <span className="text-white font-semibold">{selectedPax} personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Derecho anual de solicitud</span>
                    <span className="text-white font-semibold">
                      Hasta {selectedEstancias} estancia{selectedEstancias === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vigencia</span>
                    <span className="text-amber-400 font-semibold">15 años</span>
                  </div>
                  <div className="pt-3 border-t border-slate-700 flex justify-between">
                    <span className="text-slate-400">Precio total</span>
                    <span className="text-2xl text-white font-bold">${formatPrice(selectedProduct.price_usd)} USD</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Tu certificado incluye:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Derecho de solicitud de estancias por 15 años
                    </li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Certificación digital NOM-151
                    </li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Acceso sujeto a disponibilidad del sistema
                    </li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Proceso REQUEST → OFFER → CONFIRM
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <p className="text-xs text-amber-200 leading-relaxed">
                    <strong>Importante:</strong> Este certificado NO garantiza fechas, destinos ni propiedades
                    específicas. Todas las estancias están sujetas a disponibilidad del sistema WEEK-CHAIN mediante el
                    proceso de solicitud, oferta y confirmación. No constituye inversión, propiedad inmobiliaria ni
                    tiempo compartido tradicional.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
                    Proceder a Pago
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Important Disclaimers */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold mb-2">Información Legal Importante</h4>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li>• El precio representa capacidad de uso (personas y estancias anuales)</li>
                  <li>• NO constituye propiedad inmobiliaria ni activo financiero</li>
                  <li>• Certificado otorga derecho de solicitud sujeto a disponibilidad</li>
                  <li>• No garantiza fechas, destinos ni propiedades específicas</li>
                  <li>• Cumple con NOM-151 para certificados de uso vacacional</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
