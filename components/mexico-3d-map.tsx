"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Building2, Palmtree, ArrowRight } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

// Colores pastel estilo WEEK-CHAIN
const stateColors: Record<string, { fill: string; shadow: string }> = {
  // Rosa pastel
  "baja-california": { fill: "#FFB5BA", shadow: "#E89DA2" },
  "baja-california-sur": { fill: "#FADADD", shadow: "#E8C8CB" },
  sinaloa: { fill: "#FFB5BA", shadow: "#E89DA2" },
  nayarit: { fill: "#FADADD", shadow: "#E8C8CB" },
  colima: { fill: "#FFB5BA", shadow: "#E89DA2" },
  michoacan: { fill: "#FADADD", shadow: "#E8C8CB" },
  guerrero: { fill: "#FFB5BA", shadow: "#E89DA2" },
  oaxaca: { fill: "#FADADD", shadow: "#E8C8CB" },
  // Lavanda
  sonora: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  chihuahua: { fill: "#E8DCF4", shadow: "#D4C4E8" },
  durango: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  zacatecas: { fill: "#E8DCF4", shadow: "#D4C4E8" },
  aguascalientes: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  jalisco: { fill: "#E8DCF4", shadow: "#D4C4E8" },
  guanajuato: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  queretaro: { fill: "#E8DCF4", shadow: "#D4C4E8" },
  hidalgo: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  tlaxcala: { fill: "#E8DCF4", shadow: "#D4C4E8" },
  morelos: { fill: "#D4C4E8", shadow: "#BBA8D4" },
  puebla: { fill: "#E8DCF4", shadow: "#D4C4E8" },
  // Verde menta
  coahuila: { fill: "#B8E4D0", shadow: "#98D4BC" },
  "san-luis-potosi": { fill: "#C8ECD8", shadow: "#A8DCC4" },
  tamaulipas: { fill: "#B8E4D0", shadow: "#98D4BC" },
  veracruz: { fill: "#C8ECD8", shadow: "#A8DCC4" },
  tabasco: { fill: "#B8E4D0", shadow: "#98D4BC" },
  chiapas: { fill: "#C8ECD8", shadow: "#A8DCC4" },
  campeche: { fill: "#B8E4D0", shadow: "#98D4BC" },
  yucatan: { fill: "#C8ECD8", shadow: "#A8DCC4" },
  // Azul
  mexico: { fill: "#C4D8F0", shadow: "#A8C4E0" },
  cdmx: { fill: "#B4CCE8", shadow: "#98B8D8" },
  // Destacados
  "nuevo-leon": { fill: "#A78BFA", shadow: "#8B6FE8" },
  "quintana-roo": { fill: "#6EE7B7", shadow: "#34D399" },
}

const mexicoStates = [
  {
    id: "baja-california",
    name: "Baja California",
    path: "M12,8 L22,5 L28,12 L30,28 L28,45 L24,58 L18,65 L12,55 L10,38 L11,22 Z",
  },
  {
    id: "baja-california-sur",
    name: "Baja California Sur",
    path: "M18,65 L24,60 L28,68 L30,82 L28,98 L22,108 L16,105 L12,92 L14,78 Z",
  },
  { id: "sonora", name: "Sonora", path: "M30,10 L58,8 L72,18 L78,38 L74,55 L62,62 L42,58 L32,48 L28,32 Z" },
  { id: "chihuahua", name: "Chihuahua", path: "M58,8 L95,12 L105,32 L102,58 L92,72 L72,75 L62,62 L66,38 L64,20 Z" },
  { id: "coahuila", name: "Coahuila", path: "M95,18 L128,22 L138,42 L135,62 L122,72 L100,68 L92,52 L94,35 Z" },
  {
    id: "nuevo-leon",
    name: "Nuevo León",
    path: "M128,28 L152,32 L162,52 L156,72 L142,80 L128,75 L122,58 L125,42 Z",
    hasProperty: true,
    propertyType: "urban",
  },
  { id: "tamaulipas", name: "Tamaulipas", path: "M152,38 L175,45 L182,68 L178,98 L162,112 L145,102 L142,78 L148,55 Z" },
  { id: "sinaloa", name: "Sinaloa", path: "M42,58 L62,62 L68,78 L65,98 L52,108 L38,102 L32,82 L35,68 Z" },
  { id: "durango", name: "Durango", path: "M68,72 L92,75 L98,92 L94,108 L78,112 L65,105 L62,88 Z" },
  { id: "zacatecas", name: "Zacatecas", path: "M92,78 L118,82 L125,98 L120,112 L102,115 L88,108 L88,92 Z" },
  {
    id: "san-luis-potosi",
    name: "San Luis Potosí",
    path: "M118,85 L145,90 L152,108 L148,125 L130,128 L115,122 L115,102 Z",
  },
  { id: "nayarit", name: "Nayarit", path: "M48,105 L62,108 L65,120 L58,130 L45,128 L42,118 Z" },
  { id: "aguascalientes", name: "Aguascalientes", path: "M98,112 L110,115 L112,125 L106,132 L95,130 L94,120 Z" },
  { id: "jalisco", name: "Jalisco", path: "M52,120 L78,122 L88,138 L82,158 L62,165 L45,155 L42,135 Z" },
  { id: "guanajuato", name: "Guanajuato", path: "M95,128 L118,130 L125,145 L118,158 L100,155 L92,142 Z" },
  { id: "queretaro", name: "Querétaro", path: "M120,132 L138,135 L145,150 L138,162 L122,158 L118,145 Z" },
  { id: "hidalgo", name: "Hidalgo", path: "M140,138 L158,142 L165,158 L158,172 L142,168 L138,152 Z" },
  { id: "colima", name: "Colima", path: "M58,162 L70,165 L72,178 L65,188 L55,185 L52,172 Z" },
  { id: "michoacan", name: "Michoacán", path: "M68,155 L100,160 L108,180 L98,198 L72,195 L60,178 Z" },
  { id: "mexico", name: "Estado de México", path: "M118,158 L142,162 L150,182 L142,198 L122,195 L115,178 Z" },
  { id: "cdmx", name: "CDMX", path: "M130,178 L142,180 L145,192 L138,200 L128,198 L126,188 Z" },
  { id: "tlaxcala", name: "Tlaxcala", path: "M148,168 L162,172 L165,185 L158,195 L148,192 L145,180 Z" },
  { id: "morelos", name: "Morelos", path: "M128,198 L145,200 L148,215 L140,225 L125,222 L122,210 Z" },
  { id: "puebla", name: "Puebla", path: "M148,178 L175,185 L182,212 L170,235 L148,230 L145,202 Z" },
  { id: "guerrero", name: "Guerrero", path: "M72,195 L108,200 L118,228 L105,255 L75,250 L60,225 Z" },
  { id: "oaxaca", name: "Oaxaca", path: "M110,225 L158,235 L168,272 L148,298 L108,292 L95,258 Z" },
  {
    id: "veracruz",
    name: "Veracruz",
    path: "M162,112 L185,125 L195,165 L192,215 L180,258 L165,275 L155,248 L158,195 L162,152 Z",
  },
  { id: "tabasco", name: "Tabasco", path: "M182,262 L208,268 L215,288 L205,302 L185,298 L178,280 Z" },
  { id: "chiapas", name: "Chiapas", path: "M172,298 L205,305 L218,345 L200,375 L165,368 L155,332 Z" },
  { id: "campeche", name: "Campeche", path: "M210,270 L238,262 L252,288 L248,325 L228,342 L208,332 L205,298 Z" },
  { id: "yucatan", name: "Yucatán", path: "M232,238 L268,230 L285,255 L282,290 L258,302 L238,295 L235,265 Z" },
  {
    id: "quintana-roo",
    name: "Quintana Roo",
    path: "M272,248 L295,242 L308,268 L312,320 L298,362 L275,368 L265,332 L268,282 Z",
    hasProperty: true,
    propertyType: "vacation",
  },
]

const realPropertiesCards = [
  {
    id: "aflora-tulum",
    name: "AFLORA Tulum",
    location: "Tulum, Quintana Roo",
    type: "vacation",
    specs: "62m² · 1 Rec · 1 Baño",
    price: "Desde $3,500 USD/semana",
    link: "/properties/aflora-tulum",
    icon: Palmtree,
    color: "from-[#6EE7B7] to-[#34D399]",
    borderColor: "border-[#34D399]",
  },
  {
    id: "polo-54",
    name: "POLO 54 PH 501",
    location: "Tulum, Quintana Roo",
    type: "vacation",
    specs: "98m² · 2 Rec · 2 Baños",
    price: "Desde $4,143 USD/semana",
    link: "/properties/polo-54",
    icon: Palmtree,
    color: "from-[#6EE7B7] to-[#34D399]",
    borderColor: "border-[#34D399]",
  },
  {
    id: "monterrey-urban",
    name: "Torre Valle Oriente",
    location: "Monterrey, Nuevo León",
    type: "urban",
    specs: "120m² · 2 Rec · 2 Baños",
    price: "$6,500 USD/semana",
    link: "/properties/monterrey-urban",
    icon: Building2,
    color: "from-[#A78BFA] to-[#8B5CF6]",
    borderColor: "border-[#8B5CF6]",
  },
]

export function Mexico3DMap() {
  const router = useRouter()
  const t = useTranslations()
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  const handleStateClick = useCallback(
    (stateId: string) => {
      if (stateId === "quintana-roo") {
        router.push("/properties/aflora-tulum")
      } else if (stateId === "nuevo-leon") {
        router.push("/properties/monterrey-urban")
      }
    },
    [router],
  )

  const getStateInfo = (stateId: string) => {
    const state = mexicoStates.find((s) => s.id === stateId)
    if (stateId === "quintana-roo") {
      return { name: "Quintana Roo", property: "AFLORA & POLO 54 - Tulum", type: "WEEK Vacation" }
    } else if (stateId === "nuevo-leon") {
      return { name: "Nuevo León", property: "Torre Valle Oriente - Monterrey", type: "WEEK Urban" }
    }
    return { name: state?.name || "", property: null, type: null }
  }

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #F8F4FC 0%, #F4F8FC 50%, #F0FCF8 100%)" }}
    >
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm mb-4"
          >
            <MapPin className="h-4 w-4 text-[#FF6B6B]" />
            {t.map?.exploreDestinations || "Explora Nuestros Destinos"}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3"
          >
            {t.map?.propertiesInMexico || "Propiedades en México"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-lg max-w-2xl mx-auto"
          >
            Selecciona un estado destacado para explorar las propiedades disponibles
          </motion.p>
        </div>

        {/* Interactive SVG Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mx-auto max-w-4xl"
        >
          <div
            className="relative rounded-3xl p-8 md:p-12"
            style={{
              background: "linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)",
            }}
          >
            {/* WEEK-CHAIN Logo */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-3 z-10">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #C7CEEA 0%, #A78BFA 100%)" }}
              >
                <span className="text-white font-bold text-lg md:text-xl">W</span>
              </div>
              <span className="text-slate-800 font-bold text-base md:text-lg hidden md:block tracking-tight">
                WEEK-CHAIN
              </span>
            </div>

            {/* SVG Map - ViewBox ajustado para mapa más compacto */}
            <svg
              viewBox="0 0 340 400"
              className="w-full h-auto max-h-[500px]"
              style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.07))" }}
            >
              <defs>
                <filter id="stateShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#00000015" />
                </filter>
                <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Shadow layer */}
              <g transform="translate(2, 3)" opacity="0.25">
                {mexicoStates.map((state) => (
                  <path key={`shadow-${state.id}`} d={state.path} fill={stateColors[state.id]?.shadow || "#C0C0C0"} />
                ))}
              </g>

              {/* Main states */}
              <g>
                {mexicoStates.map((state) => {
                  const colors = stateColors[state.id] || { fill: "#E8E0F0", shadow: "#D0C8E0" }
                  const isActive = state.hasProperty
                  const isHovered = hoveredState === state.id

                  return (
                    <motion.path
                      key={state.id}
                      d={state.path}
                      fill={colors.fill}
                      stroke={isActive ? (state.propertyType === "urban" ? "#7C3AED" : "#059669") : "#FFFFFF"}
                      strokeWidth={isActive ? 2 : 0.8}
                      filter={isActive && isHovered ? "url(#activeGlow)" : "url(#stateShadow)"}
                      style={{ cursor: isActive ? "pointer" : "default" }}
                      onMouseEnter={() => setHoveredState(state.id)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => isActive && handleStateClick(state.id)}
                      initial={false}
                      animate={{
                        scale: isHovered && isActive ? 1.02 : 1,
                        y: isHovered && isActive ? -2 : 0,
                      }}
                      transition={{ duration: 0.15 }}
                    />
                  )
                })}
              </g>

              {/* Monterrey marker */}
              <g
                transform="translate(140, 55)"
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/properties/monterrey-urban")}
              >
                <motion.circle
                  r="12"
                  fill="#8B5CF6"
                  opacity="0.25"
                  animate={{ r: [12, 18, 12] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
                />
                <circle r="8" fill="#8B5CF6" stroke="white" strokeWidth="2" />
                <text x="0" y="3" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
                  M
                </text>
                <text x="0" y="-14" textAnchor="middle" fill="#7C3AED" fontSize="8" fontWeight="bold">
                  MTY
                </text>
              </g>

              {/* Tulum marker */}
              <g
                transform="translate(285, 305)"
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/properties/aflora-tulum")}
              >
                <motion.circle
                  r="12"
                  fill="#10B981"
                  opacity="0.25"
                  animate={{ r: [12, 18, 12] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <circle r="8" fill="#10B981" stroke="white" strokeWidth="2" />
                <text x="0" y="3" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
                  T
                </text>
                <text x="0" y="-14" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="bold">
                  Tulum
                </text>
              </g>

              {/* Stats bars */}
              <g transform="translate(295, 360)">
                <rect x="0" y="15" width="8" height="15" rx="1.5" fill="#FFB5BA" />
                <rect x="10" y="10" width="8" height="20" rx="1.5" fill="#D4C4E8" />
                <rect x="20" y="5" width="8" height="25" rx="1.5" fill="#B8E4D0" />
                <rect x="30" y="0" width="8" height="30" rx="1.5" fill="#C4D8F0" />
              </g>
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredState && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl px-5 py-3 z-20 border border-slate-100"
                >
                  {(() => {
                    const info = getStateInfo(hoveredState)
                    return (
                      <div className="text-center">
                        <p className="font-bold text-slate-900">{info.name}</p>
                        {info.property ? (
                          <>
                            <p className="text-sm text-slate-600">{info.property}</p>
                            <p
                              className={`text-xs font-semibold mt-1 ${info.type === "WEEK Urban" ? "text-violet-600" : "text-emerald-600"}`}
                            >
                              {info.type} — Clic para ver
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">Próximamente</p>
                        )}
                      </div>
                    )
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* W Coin */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white/60"
                style={{ background: "linear-gradient(135deg, #E8DCF4 0%, #C7CEEA 100%)" }}
              >
                <span
                  className="text-white font-bold text-xl md:text-2xl"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                >
                  W
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-[#10B981] shadow-sm" />
              <span className="font-medium">WEEK Vacation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-[#8B5CF6] shadow-sm" />
              <span className="font-medium">WEEK Urban</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-[#E0D8EC] shadow-sm" />
              <span className="font-medium">Próximamente</span>
            </div>
          </div>
        </motion.div>

        {/* Property Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-14"
        >
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">Propiedades Destacadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {realPropertiesCards.map((property) => (
              <motion.div
                key={property.id}
                whileHover={{ y: -4 }}
                className={`relative bg-white rounded-xl p-5 shadow-md border-2 ${property.borderColor} cursor-pointer`}
                onClick={() => router.push(property.link)}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${property.color}`} />
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${property.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <property.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-base">{property.name}</h4>
                    <p className="text-sm text-slate-500">{property.location}</p>
                    <p className="text-xs text-slate-400 mt-1">{property.specs}</p>
                    <p className="text-sm font-bold text-slate-800 mt-2">{property.price}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3 text-sm font-medium text-slate-600 group">
                  <span>Ver propiedad</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
