"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, MapPin, Sun, Snowflake, Leaf, Flower2, QrCode, Verified, ArrowRight, Check, Users, Home, Star,  } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PAX_CERTIFICATE_CATALOG = [
  { id: "2pax-1week", pax: 2, estancias: 1, weeks: 1, price_usd: 6500, beta_cap: 15, target: "Parejas, luna de miel, profesionales" },
  { id: "2pax-2week", pax: 2, estancias: 1, weeks: 2, price_usd: 11000, beta_cap: 12, target: "Parejas con mas tiempo" },
  { id: "4pax-1week", pax: 4, estancias: 1, weeks: 1, price_usd: 8500, beta_cap: 18, target: "Familia pequena, 2 ninos" },
  { id: "4pax-2week", pax: 4, estancias: 1, weeks: 2, price_usd: 15000, beta_cap: 15, target: "Familia pequena, vacaciones largas" },
  { id: "6pax-1week", pax: 6, estancias: 1, weeks: 1, price_usd: 12000, beta_cap: 12, target: "Familia grande, 3-4 ninos" },
  { id: "6pax-2week", pax: 6, estancias: 1, weeks: 2, price_usd: 22000, beta_cap: 10, target: "Familia grande, vacaciones largas" },
  { id: "8pax-1week", pax: 8, estancias: 1, weeks: 1, price_usd: 16000, beta_cap: 8, target: "Grupos, familia extendida" },
  { id: "8pax-2week", pax: 8, estancias: 1, weeks: 2, price_usd: 30000, beta_cap: 5, target: "Grupos grandes, eventos" },
  { id: "10pax-1week", pax: 10, estancias: 1, weeks: 1, price_usd: 20000, beta_cap: 5, target: "Grupos muy grandes, eventos" },
  { id: "10pax-2week", pax: 10, estancias: 1, weeks: 2, price_usd: 35000, beta_cap: 3, target: "Ultra premium, bodas, reuniones" },
]

const PAX_OPTIONS = [2, 4, 6, 8, 10]

// Datos de ejemplo para la animacion del certificado
const certificateDataFallback = [
  {
    holder: "Maria Garcia Lopez",
    destination: "Los Cabos Premium Resort",
    location: "Baja California Sur, Mexico",
    week: 23,
    season: "summer" as const,
    country: "MX",
    flag: "",
    image: "/luxury-cabo-san-lucas-resort-ocean-view.jpg",
  },
  {
    holder: "John Smith",
    destination: "Cancun Beachfront Villa",
    location: "Quintana Roo, Mexico",
    week: 51,
    season: "winter" as const,
    country: "US",
    flag: "",
    image: "/cancun-luxury-beachfront-resort-caribbean.jpg",
  },
  {
    holder: "Sophie Muller",
    destination: "Puerto Vallarta Luxury",
    location: "Jalisco, Mexico",
    week: 15,
    season: "spring" as const,
    country: "DE",
    flag: "",
    image: "/puerto-vallarta-luxury-resort-sunset.jpg",
  },
  {
    holder: "Carlos Rodriguez",
    destination: "Riviera Maya Paradise",
    location: "Quintana Roo, Mexico",
    week: 42,
    season: "fall" as const,
    country: "ES",
    flag: "",
    image: "/riviera-maya-luxury-resort-tropical.jpg",
  },
]

const seasonConfig = {
  summer: { icon: Sun, label: "Verano", color: "text-sky-500" },
  winter: { icon: Snowflake, label: "Invierno", color: "text-blue-500" },
  spring: { icon: Flower2, label: "Primavera", color: "text-teal-500" },
  fall: { icon: Leaf, label: "Otono", color: "text-cyan-500" },
}

interface FeaturedProperty {
  id: string
  name: string
  location: string
  image_url: string | null
  total_weeks: number
  weeks_sold: number
  status: string
}

export function DynamicCertificateShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedPax, setSelectedPax] = useState(2)
  const [selectedWeeks, setSelectedWeeks] = useState(1)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [featuredProperty, setFeaturedProperty] = useState<FeaturedProperty | null>(null)
  const certificateData = certificateDataFallback;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % certificateDataFallback.length)
        setIsAnimating(false)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadFeaturedProperty() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("properties")
          .select("id, name, location, image_url, total_weeks, weeks_sold, status")
          .in("status", ["active", "presale", "presale_active"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
        if (data) setFeaturedProperty(data)
      } catch {
        // fallback silently
      }
    }
    loadFeaturedProperty()
  }, [])

  const data = certificateDataFallback[currentIndex]
  const SeasonIcon = seasonConfig[data.season].icon
  const certNumber = `WC-${data.week.toString().padStart(2, "0")}-${2025}-${(currentIndex + 1).toString().padStart(4, "0")}`

  const selectedProduct = PAX_CERTIFICATE_CATALOG.find((p) => p.pax === selectedPax && p.weeks === selectedWeeks)

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US")
  }

  const handleCheckout = async () => {
    if (!selectedProduct) return
    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = "/auth?tab=register&next=/checkout"
        return
      }

      const res = await fetch("/api/certificates/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPax: selectedProduct.pax,
          estancias: selectedProduct.estancias,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "KYC_REQUIRED") {
          setCheckoutError("Debes completar la verificacion de identidad (KYC) antes de comprar.")
          setTimeout(() => { window.location.href = "/dashboard/member/kyc?next=checkout" }, 2000)
          return
        }
        if (data.error === "CAPACITY_BLOCKED") {
          setCheckoutError(data.message || "Este certificado no esta disponible actualmente.")
          return
        }
        throw new Error(data.error || "Error al procesar la compra")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Error al procesar. Intenta de nuevo.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-16 md:py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Certificado Digital NOM-151
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Tu Derecho de Uso, <span className="text-sky-400">Certificado</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Cada semana vacacional incluye un certificado digital con validez legal, verificable y almacenable en tu
            wallet
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* PAX Calculator Card - First on mobile */}
          <div className="space-y-6 order-1 lg:order-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Calcula tu Certificado Digital</h3>

              {/* PAX Selector - Grid buttons */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                  <Users className="h-4 w-4 text-sky-400" />
                  Selecciona cuantas personas viajan
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  El sistema asigna automaticamente alojamientos compatibles con este numero de personas
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {PAX_OPTIONS.map((pax) => (
                    <button
                      key={pax}
                      onClick={() => setSelectedPax(pax)}
                      className={`relative flex flex-col items-center py-3 px-2 rounded-xl font-semibold transition-all ${
                        selectedPax === pax
                          ? "bg-gradient-to-b from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/40 scale-105 ring-2 ring-sky-400/50"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <span className="text-2xl font-bold">{pax}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-70">pax</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-3 block">¿Cuántas semanas deseas por año?</label>
                <p className="text-xs text-slate-500 mb-3">
                  Cada certificado otorga derecho a solicitar la duración seleccionada por año durante 15 años
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((weeks) => (
                    <button
                      key={weeks}
                      onClick={() => setSelectedWeeks(weeks)}
                      className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                        selectedWeeks === weeks
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {weeks} {weeks === 1 ? "Semana" : "Semanas"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Display */}
              {selectedProduct && (
                <div className="bg-gradient-to-br from-amber-500/20 to-cyan-500/20 rounded-xl p-5 border border-sky-500/30">
                  <div className="text-center mb-4">
                    <p className="text-sm text-sky-400 mb-1">Tu Certificado Digital Personalizado</p>
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
                      {selectedWeeks} {selectedWeeks === 1 ? "semana" : "semanas"} (7 noches c/u)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
                    <span>Vigencia:</span>
                    <span className="font-semibold text-sky-400">15 años</span>
                  </div>

                  <div className="mb-4">
                    <Badge className="w-full justify-center bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Ideal para: {selectedProduct.target}
                    </Badge>
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
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold h-12"
                  >
                    Activar Certificado Digital
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Featured Property Card */}
            {featuredProperty && (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-sky-500/20 overflow-hidden">
                <div className="relative h-36">
                  {featuredProperty.image_url ? (
                    <img
                      src={featuredProperty.image_url}
                      alt={featuredProperty.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-900 via-cyan-900 to-slate-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-emerald-500/90 text-white border-0 text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Destino Destacado
                  </Badge>
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold text-sm mb-1">{featuredProperty.name}</h4>
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs mb-3">
                    <MapPin className="h-3 w-3" />
                    {featuredProperty.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Home className="h-3.5 w-3.5" />
                      <span>{featuredProperty.total_weeks || 52} semanas disponibles</span>
                    </div>
                    <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs">
                      {featuredProperty.status === "presale" || featuredProperty.status === "presale_active" ? "Pre-venta" : "Activa"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certificate Card - Second on mobile */}
          <div
            className={`relative transition-all duration-500 ease-in-out order-2 lg:order-1 ${isAnimating ? "opacity-0 scale-95 translate-y-2" : "opacity-100 scale-100 translate-y-0"}`}
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
                        <p className="text-sky-400 font-semibold">15 Años</p>
                      </div>
                      <div className="h-12 w-12 bg-white rounded-lg p-1.5 flex items-center justify-center">
                        <QrCode className="h-full w-full text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Certificate number */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-sky-500" />
                      <span className="text-xs text-slate-500 font-mono">{certNumber}</span>
                    </div>
                    <img
                      src="/week-chain-logo-white.jpg"
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
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-1 mt-6">
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
                  className="p-2 flex items-center justify-center"
                  aria-label={`Ver certificado ${i + 1}`}
                >
                  <span className={`block rounded-full transition-all duration-300 h-2 ${
                    i === currentIndex ? "bg-sky-500 w-6" : "bg-white/30 w-2 hover:bg-white/50"
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>



        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-lg bg-slate-900 border-slate-700 max-h-[90dvh] overflow-y-auto mx-4 sm:mx-auto rounded-2xl"
          >
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
                      {selectedWeeks} {selectedWeeks === 1 ? "semana" : "semanas"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vigencia</span>
                    <span className="text-sky-400 font-semibold">15 años</span>
                  </div>
                  <div className="pt-3 border-t border-slate-700 flex justify-between">
                    <span className="text-slate-400">Total</span>
                    <span className="text-2xl font-bold text-white">${formatPrice(selectedProduct.price_usd)} USD</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Tu certificado incluye:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
                      Derecho de solicitud de estancias por 15 años
                    </li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
                      Certificación digital NOM-151
                    </li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
                      Acceso sujeto a disponibilidad del sistema
                    </li>
                    <li className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
                      Proceso REQUEST → OFFER → CONFIRM
                    </li>
                  </ul>
                </div>

                <div className="bg-sky-900/20 border border-sky-700 rounded-lg p-4">
                  <p className="text-xs text-sky-200 leading-relaxed">
                    <strong>Importante:</strong> Este certificado NO garantiza fechas, destinos ni propiedades
                    específicas. Todas las estancias están sujetas a disponibilidad del sistema WEEK-CHAIN mediante el
                    proceso de solicitud, oferta y confirmación. No constituye inversión, propiedad inmobiliaria ni
                    tiempo compartido tradicional.
                  </p>
                </div>

                {checkoutError && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                    <p className="text-xs text-red-300">{checkoutError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setShowConfirmDialog(false); setCheckoutError(null) }} className="flex-1 min-h-[48px]" disabled={checkoutLoading}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 min-h-[48px] bg-sky-500 hover:bg-sky-600 disabled:opacity-70"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        Proceder a Pago
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
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
              <Shield className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold mb-2">Información Legal Importante</h4>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li>• El precio representa capacidad de uso (personas y duración anual)</li>
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
