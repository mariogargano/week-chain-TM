"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Building2, Palmtree, X, Plane, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const regionColors: Record<string, { fill: string; shadow: string }> = {
  // Mexico States
  "quintana-roo": { fill: "#FFB5BA", shadow: "#E89DA2" },
  yucatan: { fill: "#FFDAC1", shadow: "#E8C4AD" },
  jalisco: { fill: "#FF9AA2", shadow: "#E88A92" },
  campeche: { fill: "#C7CEEA", shadow: "#A8B8D8" },
  veracruz: { fill: "#B5EAD7", shadow: "#98D4BC" },
  oaxaca: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  // USA States
  florida: { fill: "#FFB5BA", shadow: "#E89DA2" },
  california: { fill: "#FFDAC1", shadow: "#E8C4AD" },
  texas: { fill: "#FF9AA2", shadow: "#E88A92" },
  "new-york": { fill: "#C7CEEA", shadow: "#A8B8D8" },
  nevada: { fill: "#B5EAD7", shadow: "#98D4BC" },
  arizona: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  // Canada Provinces
  ontario: { fill: "#C7CEEA", shadow: "#A8B8D8" },
  "british-columbia": { fill: "#FFB5BA", shadow: "#E89DA2" },
  alberta: { fill: "#FFDAC1", shadow: "#E8C4AD" },
  quebec: { fill: "#FF9AA2", shadow: "#E88A92" },
  saskatchewan: { fill: "#C7CEEA", shadow: "#A8B8D8" },
  // Brazil States
  rio: { fill: "#B5EAD7", shadow: "#98D4BC" },
  "sao-paulo": { fill: "#FFDAC1", shadow: "#E8C4AD" },
  bahia: { fill: "#FF9AA2", shadow: "#E88A92" },
  "minas-gerais": { fill: "#C7CEEA", shadow: "#A8B8D8" },
  // Europe
  tuscany: { fill: "#FFB5BA", shadow: "#E89DA2" },
  lazo: { fill: "#FFDAC1", shadow: "#E8C4AD" },
  sicily: { fill: "#FF9AA2", shadow: "#E88A92" },
  albania: { fill: "#C7CEEA", shadow: "#A8B8D8" },
  greece: { fill: "#B5EAD7", shadow: "#98D4BC" },
}

const detailedRegions = [
  // MEXICO - More states with realistic shapes
  {
    id: "quintana-roo",
    name: "Quintana Roo",
    path: "M320,360 L350,355 L365,360 L375,370 L380,390 L375,410 L365,425 L350,430 L335,428 L320,420 L315,405 L315,380 Z",
    country: "México",
    highlighted: true,
  },
  {
    id: "yucatan",
    name: "Yucatán",
    path: "M270,350 L305,345 L318,352 L320,365 L315,380 L305,390 L285,392 L270,385 L265,370 L265,360 Z",
    country: "México",
  },
  {
    id: "campeche",
    name: "Campeche",
    path: "M240,365 L268,360 L270,375 L268,395 L255,410 L240,412 L230,400 L228,380 Z",
    country: "México",
  },
  {
    id: "jalisco",
    name: "Jalisco",
    path: "M210,370 L240,365 L255,375 L260,395 L255,415 L240,425 L220,428 L210,415 L208,390 Z",
    country: "México",
  },
  {
    id: "veracruz",
    name: "Veracruz",
    path: "M295,375 L320,370 L335,385 L338,410 L330,430 L315,438 L300,435 L290,415 L288,390 Z",
    country: "México",
  },
  {
    id: "oaxaca",
    name: "Oaxaca",
    path: "M260,410 L290,405 L305,420 L308,445 L295,462 L275,465 L260,455 L255,435 Z",
    country: "México",
  },

  // USA - More detailed states with better shapes
  {
    id: "florida",
    name: "Florida",
    path: "M480,350 L520,345 L540,355 L548,375 L545,400 L535,425 L520,435 L500,433 L485,420 L478,395 L475,370 Z",
    country: "USA",
    highlighted: true,
  },
  {
    id: "california",
    name: "California",
    path: "M160,280 L190,270 L210,275 L225,295 L235,330 L240,365 L230,390 L215,395 L195,385 L175,355 L165,320 L160,295 Z",
    country: "USA",
  },
  {
    id: "texas",
    name: "Texas",
    path: "M355,340 L395,335 L430,345 L445,365 L450,395 L440,425 L420,440 L390,445 L365,440 L345,425 L340,395 L345,365 Z",
    country: "USA",
  },
  {
    id: "new-york",
    name: "Nueva York",
    path: "M555,270 L590,265 L610,275 L620,295 L622,315 L615,335 L600,345 L580,343 L565,330 L558,305 Z",
    country: "USA",
    highlighted: true,
  },
  {
    id: "nevada",
    name: "Nevada",
    path: "M185,300 L210,295 L225,310 L228,335 L220,355 L205,358 L188,345 L183,320 Z",
    country: "USA",
  },
  {
    id: "arizona",
    name: "Arizona",
    path: "M205,335 L235,330 L250,345 L253,370 L245,385 L225,388 L210,375 L208,355 Z",
    country: "USA",
  },

  // CANADA - Larger provinces with more detail
  {
    id: "british-columbia",
    name: "British Columbia",
    path: "M140,140 L180,130 L210,140 L230,160 L235,190 L230,225 L215,250 L190,258 L165,253 L145,235 L138,205 L138,170 Z",
    country: "Canadá",
    highlighted: true,
  },
  {
    id: "alberta",
    name: "Alberta",
    path: "M230,160 L265,155 L285,165 L292,190 L295,220 L288,245 L270,255 L250,253 L235,240 L232,210 L230,185 Z",
    country: "Canadá",
  },
  {
    id: "ontario",
    name: "Ontario",
    path: "M460,180 L510,175 L545,185 L565,205 L570,235 L565,265 L545,280 L515,283 L485,278 L465,260 L458,230 L458,205 Z",
    country: "Canadá",
  },
  {
    id: "quebec",
    name: "Quebec",
    path: "M565,165 L615,160 L650,170 L675,190 L680,220 L675,250 L655,270 L625,275 L595,268 L575,250 L568,220 L565,190 Z",
    country: "Canadá",
  },
  {
    id: "saskatchewan",
    name: "Saskatchewan",
    path: "M290,165 L330,160 L355,170 L362,195 L365,225 L358,250 L340,258 L315,256 L295,243 L290,215 L290,190 Z",
    country: "Canadá",
  },

  // BRAZIL - Multiple states with coastal features
  {
    id: "rio",
    name: "Río de Janeiro",
    path: "M690,500 L730,495 L755,505 L768,525 L770,550 L762,575 L745,590 L720,595 L700,588 L688,565 L685,535 Z",
    country: "Brasil",
    highlighted: true,
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    path: "M650,515 L685,510 L700,525 L705,550 L700,575 L680,590 L655,593 L640,580 L635,555 L638,535 Z",
    country: "Brasil",
  },
  {
    id: "bahia",
    name: "Bahia",
    path: "M705,445 L745,440 L765,455 L772,480 L770,510 L755,530 L730,535 L710,525 L702,495 L702,465 Z",
    country: "Brasil",
  },
  {
    id: "minas-gerais",
    name: "Minas Gerais",
    path: "M685,480 L720,475 L740,490 L745,515 L738,540 L720,550 L695,548 L680,530 L678,505 Z",
    country: "Brasil",
  },

  // EUROPE - Italy with regions and Albania
  {
    id: "tuscany",
    name: "Toscana",
    path: "M1070,295 L1105,290 L1125,300 L1135,320 L1133,345 L1120,365 L1100,370 L1080,365 L1070,345 L1068,320 Z",
    country: "Italia",
    highlighted: true,
  },
  {
    id: "lazio",
    name: "Lazio",
    path: "M1095,345 L1120,340 L1135,355 L1138,380 L1130,400 L1110,408 L1093,403 L1088,380 L1090,360 Z",
    country: "Italia",
  },
  {
    id: "sicily",
    name: "Sicilia",
    path: "M1105,420 L1135,415 L1160,425 L1170,445 L1165,465 L1145,475 L1120,473 L1105,458 L1102,438 Z",
    country: "Italia",
  },
  {
    id: "albania",
    name: "Albania",
    path: "M1140,300 L1168,295 L1185,305 L1195,325 L1197,350 L1190,375 L1175,388 L1155,385 L1143,365 L1138,335 L1138,315 Z",
    country: "Albania",
    highlighted: true,
  },
  {
    id: "greece",
    name: "Grecia",
    path: "M1175,330 L1205,325 L1225,340 L1232,365 L1228,390 L1210,405 L1190,403 L1178,385 L1175,360 Z",
    country: "Grecia",
  },
]

interface MexicoMapPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MexicoMapPopup({ open, onOpenChange }: MexicoMapPopupProps) {
  const router = useRouter()
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [selectedDest, setSelectedDest] = useState<any>(null)
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const response = await fetch("/api/destinations/catalog")
        const data = await response.json()

        if (data.destinations) {
          const grouped = data.destinations.reduce((acc: any, dest: any) => {
            if (!acc[dest.location_group]) {
              acc[dest.location_group] = {
                id: dest.location_group.toLowerCase().replace(/\s+/g, "-"),
                name: dest.location_group,
                description: "",
                icon: dest.location_group === "México" || dest.location_group === "Brasil" ? Palmtree : Building2,
                properties: [],
              }
            }

            acc[dest.location_group].properties.push({
              id: dest.id,
              name: dest.name,
              location: dest.location,
              specs: dest.property_type,
              price:
                dest.status === "available"
                  ? `Desde $${dest.base_price_usd?.toLocaleString()} USD`
                  : "Disponible próximamente",
              image: dest.image_url,
              status: dest.status,
              legalDisclaimer: dest.legal_disclaimer,
            })

            return acc
          }, {})

          setDestinations(Object.values(grouped))
        }
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error loading destinations:", error)
        setLoading(false)
      }
    }

    if (open) {
      fetchDestinations()
    }
  }, [open])

  const handleRegionClick = useCallback(
    (regionId: string) => {
      const destination = destinations.find((d) => d.id === regionId)
      if (destination) {
        setSelectedDest(destination)
      }
    },
    [destinations],
  )

  const handlePropertyClick = useCallback(
    (propertyName: string) => {
      onOpenChange(false)
      if (propertyName.includes("AFLORA")) {
        router.push("/properties/aflora-tulum")
      } else if (propertyName.includes("Polo")) {
        router.push("/properties/polo-54")
      }
    },
    [router, onOpenChange],
  )

  const getRegionColor = (regionId: string) => {
    const colors = regionColors[regionId] || { fill: "#E8E8E8", shadow: "#D0D0D0" }
    const region = detailedRegions.find((r) => r.id === regionId)
    const isHighlighted = region?.highlighted
    const isHovered = hoveredRegion === regionId
    const isSelected = selectedDest?.id === regionId

    if (isHighlighted) {
      return {
        fill: isHovered || isSelected ? colors.shadow : colors.fill,
        stroke: "#FFFFFF",
        strokeWidth: isHovered || isSelected ? 2.5 : 1.5,
        filter:
          isHovered || isSelected
            ? "drop-shadow(0 3px 6px rgba(0,0,0,0.25))"
            : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
        cursor: "pointer",
      }
    }

    return {
      fill: isHovered ? colors.shadow : colors.fill,
      stroke: "#FFFFFF",
      strokeWidth: 1,
      filter: "none",
      cursor: "default",
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none !max-w-[98vw] w-[98vw] h-[85vh] p-0 gap-0 overflow-hidden bg-white"
        style={{ maxWidth: "98vw", width: "98vw" }}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 z-50 rounded-full bg-white hover:bg-slate-100 p-2.5 shadow-xl border-2 border-slate-200 hover:border-slate-300 transition-all hover:scale-110"
          aria-label="Cerrar mapa"
        >
          <X className="h-6 w-6 text-slate-700" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5EAD7] mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando destinos...</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* LEFT SIDE: GLOBAL MAP - 72% width */}
            <div className="w-[72%] p-8 flex flex-col bg-gradient-to-br from-blue-50/20 via-white to-teal-50/20 overflow-hidden">
              {/* Header */}
              <div className="text-center mb-6 flex-shrink-0">
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-2 shadow-md mb-3">
                  <Globe className="w-5 h-5 text-[#B5EAD7]" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Red Internacional
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">Red Global WEEK-CHAIN</h2>
                <p className="text-slate-600 text-lg">
                  Explora destinos en <span className="font-semibold text-[#FF9AA2]">América del Norte</span>,{" "}
                  <span className="font-semibold text-[#FFB5BA]">América del Sur</span> y{" "}
                  <span className="font-semibold text-[#C7CEEA]">Europa</span>
                </p>
              </div>

              <div className="flex-1 relative bg-gradient-to-br from-sky-100/50 via-blue-50/30 to-cyan-100/50 rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden">
                {/* Map legend */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg z-10 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-widest">Leyenda</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-[#FFB5BA] to-[#FF9AA2] border border-white shadow-sm" />
                      <span className="text-slate-600">Destino Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
                      <span className="text-slate-600">Expansión Futura</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#B5EAD7]" />
                      <span className="text-slate-600">Propiedad Activa</span>
                    </div>
                  </div>
                </div>

                <svg viewBox="0 0 1400 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                    </filter>
                    <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E0F2FE" />
                      <stop offset="50%" stopColor="#BAE6FD" />
                      <stop offset="100%" stopColor="#7DD3FC" />
                    </linearGradient>
                    <pattern id="waves" patternUnits="userSpaceOnUse" width="40" height="40">
                      <path
                        d="M0 20 Q 10 10, 20 20 T 40 20"
                        stroke="#0EA5E9"
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.1"
                      />
                    </pattern>
                    <linearGradient id="oceanDepth" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0369A1" stopOpacity="0" />
                      <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Ocean background with wave pattern */}
                  <rect width="1400" height="700" fill="url(#ocean)" />
                  <rect width="1400" height="700" fill="url(#waves)" opacity="0.2" />

                  {/* Add depth effect to ocean */}
                  <rect width="1400" height="700" fill="url(#oceanDepth)" opacity="0.15" />

                  {/* Geographic grid with lat/long style */}
                  <g opacity="0.15" stroke="#0F172A" strokeWidth="0.5" strokeDasharray="4 4">
                    {[150, 300, 450, 600].map((y) => (
                      <line key={`h-${y}`} x1="0" y1={y} x2="1400" y2={y} />
                    ))}
                    {[280, 560, 840, 1120].map((x) => (
                      <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="700" />
                    ))}
                  </g>

                  {/* Continental region labels with decorative styling */}
                  <g className="font-bold uppercase tracking-widest">
                    <text x="300" y="60" textAnchor="middle" className="text-[16px] fill-slate-700" opacity="0.6">
                      AMÉRICA DEL NORTE
                    </text>
                    <line x1="200" y1="65" x2="400" y2="65" stroke="#94A3B8" strokeWidth="1" opacity="0.3" />

                    <text x="680" y="480" textAnchor="middle" className="text-[16px] fill-slate-700" opacity="0.6">
                      AMÉRICA DEL SUR
                    </text>
                    <line x1="600" y1="485" x2="760" y2="485" stroke="#94A3B8" strokeWidth="1" opacity="0.3" />

                    <text x="1100" y="260" textAnchor="middle" className="text-[16px] fill-slate-700" opacity="0.6">
                      EUROPA
                    </text>
                    <line x1="1020" y1="265" x2="1180" y2="265" stroke="#94A3B8" strokeWidth="1" opacity="0.3" />
                  </g>

                  {/* Country labels */}
                  <g className="text-[12px] font-semibold fill-slate-600">
                    <text x="300" y="400" textAnchor="middle">
                      MÉXICO
                    </text>
                    <text x="420" y="330" textAnchor="middle">
                      USA
                    </text>
                    <text x="410" y="220" textAnchor="middle">
                      CANADÁ
                    </text>
                    <text x="700" y="560" textAnchor="middle">
                      BRASIL
                    </text>
                    <text x="1100" y="340" textAnchor="middle">
                      ITALIA
                    </text>
                    <text x="1165" y="350" textAnchor="middle">
                      ALBANIA
                    </text>
                  </g>

                  {/* Detailed state/province polygons with enhanced styling */}
                  {detailedRegions.map((region) => {
                    const style = getRegionColor(region.id)
                    const pathCoords = region.path.match(/M([\d.]+),([\d.]+)/)
                    const centerX = pathCoords ? Number.parseFloat(pathCoords[1]) + 20 : 0
                    const centerY = pathCoords ? Number.parseFloat(pathCoords[2]) + 20 : 0

                    return (
                      <motion.g key={region.id}>
                        {/* State/Province polygon */}
                        <motion.path
                          d={region.path}
                          fill={style.fill}
                          stroke={style.stroke}
                          strokeWidth={style.strokeWidth}
                          style={{
                            filter: style.filter,
                            cursor: style.cursor,
                          }}
                          whileHover={region.highlighted ? { scale: 1.05, originX: 0.5, originY: 0.5 } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          onMouseEnter={() => setHoveredRegion(region.id)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          onClick={() => region.highlighted && handleRegionClick(region.id)}
                        />

                        {/* State/Province name labels on hover */}
                        {(hoveredRegion === region.id || selectedDest?.id === region.id) && (
                          <motion.g
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <rect
                              x={centerX - 35}
                              y={centerY - 12}
                              width="70"
                              height="20"
                              rx="6"
                              fill="white"
                              filter="url(#shadow)"
                              opacity="0.95"
                            />
                            <text
                              x={centerX}
                              y={centerY + 3}
                              textAnchor="middle"
                              className="text-[9px] font-bold fill-slate-800 pointer-events-none"
                            >
                              {region.name}
                            </text>
                          </motion.g>
                        )}
                      </motion.g>
                    )
                  })}

                  {/* Animated location markers for highlighted destinations */}
                  {destinations.map((dest, idx) => {
                    const region = detailedRegions.find((r) => r.id === dest.id)
                    if (!region) return null

                    const pathMatch = region.path.match(/M([\d.]+),([\d.]+)/)
                    if (!pathMatch) return null

                    const x = Number.parseFloat(pathMatch[1]) + 20
                    const y = Number.parseFloat(pathMatch[2]) + 20

                    return (
                      <motion.g
                        key={dest.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.15, type: "spring", stiffness: 250 }}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRegionClick(dest.id)}
                      >
                        {/* Pulsing outer ring */}
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="18"
                          fill="none"
                          stroke={regionColors[dest.id]?.fill || "#B5EAD7"}
                          strokeWidth="2"
                          opacity="0.4"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.4, 0.1, 0.4],
                          }}
                          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        />
                        {/* Main marker */}
                        <circle cx={x} cy={y} r="14" fill="white" filter="url(#shadow)" />
                        <circle cx={x} cy={y} r="11" fill={regionColors[dest.id]?.fill || "#B5EAD7"} />
                        {/* Icon */}
                        <g transform={`translate(${x - 6}, ${y - 6})`}>
                          <Plane width="12" height="12" className="text-white" style={{ pointerEvents: "none" }} />
                        </g>
                      </motion.g>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* RIGHT SIDE: DESTINATIONS PANEL - 28% width */}
            <div className="w-[28%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-y-auto">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-10">
                <h3 className="font-bold text-xl text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#B5EAD7]" />
                  DESTINOS WEEK-CHAIN
                </h3>
                {selectedDest ? (
                  <div className="mt-2">
                    <p className="text-[#B5EAD7] font-semibold">{selectedDest.name}</p>
                    <p className="text-sm text-slate-400">{selectedDest.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-2">
                    Haz clic en un estado en el mapa para ver propiedades disponibles
                  </p>
                )}
              </div>

              {/* Properties List */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {selectedDest ? (
                    <motion.div
                      key={selectedDest.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {selectedDest.properties.map((property, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-[#B5EAD7] transition-all cursor-pointer hover:bg-slate-800"
                          onClick={() => handlePropertyClick(property.name)}
                        >
                          <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-slate-700">
                            <img
                              src={property.image || "/placeholder.svg"}
                              alt={property.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-bold text-white text-base mb-1">{property.name}</h4>
                          <p className="text-sm text-slate-400 mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.location}
                          </p>
                          <p className="text-xs text-slate-500 mb-2">{property.specs}</p>
                          <p className="text-sm font-semibold text-[#B5EAD7]">{property.price}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-slate-500"
                    >
                      <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Selecciona un estado en el mapa para ver propiedades disponibles</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function MexicoMapTriggerButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
        className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:from-[#FF8A92] hover:to-[#B5BCD8] text-white font-bold shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg rounded-xl border-2 border-white/20"
        size="lg"
      >
        <Globe className="h-6 w-6 mr-3" />
        Descubre Nuestra Red Global
      </Button>
      <MexicoMapPopup open={open} onOpenChange={setOpen} />
    </>
  )
}
