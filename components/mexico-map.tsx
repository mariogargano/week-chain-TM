"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface MexicoState {
  id: string
  name: string
  path: string
  color: string
}

interface TouristLocation {
  id: string
  name: string
  x: number
  y: number
  color: string
}

const mexicoStates: MexicoState[] = [
  {
    id: "baja-california",
    name: "Baja California",
    path: "M 85,45 L 95,40 L 105,42 L 110,50 L 108,65 L 102,80 L 95,90 L 88,85 L 82,70 L 80,55 Z",
    color: "#fce7f3",
  },
  {
    id: "baja-california-sur",
    name: "Baja California Sur",
    path: "M 95,95 L 102,90 L 108,100 L 112,120 L 115,145 L 112,170 L 105,185 L 98,180 L 92,160 L 90,135 L 88,110 Z",
    color: "#fef3c7",
  },
  {
    id: "sonora",
    name: "Sonora",
    path: "M 115,50 L 145,45 L 175,55 L 195,75 L 205,100 L 200,125 L 185,140 L 165,145 L 145,135 L 125,115 L 115,90 L 112,70 Z",
    color: "#dbeafe",
  },
  {
    id: "chihuahua",
    name: "Chihuahua",
    path: "M 210,80 L 245,75 L 275,85 L 295,105 L 305,130 L 300,155 L 280,170 L 255,175 L 230,165 L 210,145 L 205,120 L 208,100 Z",
    color: "#d1fae5",
  },
  {
    id: "coahuila",
    name: "Coahuila",
    path: "M 310,110 L 345,105 L 370,115 L 385,135 L 380,160 L 365,175 L 340,180 L 315,170 L 305,150 L 308,130 Z",
    color: "#e9d5ff",
  },
  {
    id: "nuevo-leon",
    name: "Nuevo León",
    path: "M 390,125 L 415,120 L 435,130 L 445,145 L 440,165 L 425,175 L 405,172 L 388,160 L 385,145 Z",
    color: "#fda4af",
  },
  {
    id: "tamaulipas",
    name: "Tamaulipas",
    path: "M 450,135 L 480,130 L 505,145 L 520,165 L 525,190 L 515,215 L 495,225 L 470,220 L 450,205 L 445,180 L 448,155 Z",
    color: "#fbcfe8",
  },
  {
    id: "sinaloa",
    name: "Sinaloa",
    path: "M 170,150 L 195,145 L 215,160 L 225,180 L 220,205 L 205,220 L 185,215 L 168,200 L 165,175 Z",
    color: "#bfdbfe",
  },
  {
    id: "durango",
    name: "Durango",
    path: "M 230,175 L 260,170 L 285,185 L 295,205 L 290,230 L 270,240 L 245,235 L 228,220 L 225,195 Z",
    color: "#a7f3d0",
  },
  {
    id: "nayarit",
    name: "Nayarit",
    path: "M 190,225 L 210,220 L 225,235 L 228,255 L 220,270 L 205,275 L 188,265 L 185,245 Z",
    color: "#fde68a",
  },
  {
    id: "jalisco",
    name: "Jalisco",
    path: "M 230,260 L 260,255 L 285,270 L 295,290 L 285,310 L 265,320 L 240,315 L 225,295 L 228,275 Z",
    color: "#ddd6fe",
  },
  {
    id: "colima",
    name: "Colima",
    path: "M 240,325 L 255,320 L 265,330 L 262,345 L 250,350 L 238,342 Z",
    color: "#fecaca",
  },
  {
    id: "michoacan",
    name: "Michoacán",
    path: "M 270,325 L 305,320 L 330,335 L 340,355 L 330,375 L 305,385 L 275,380 L 260,360 L 265,340 Z",
    color: "#c7d2fe",
  },
  {
    id: "guanajuato",
    name: "Guanajuato",
    path: "M 310,280 L 340,275 L 360,290 L 365,310 L 355,325 L 330,330 L 310,320 L 308,300 Z",
    color: "#fce7f3",
  },
  {
    id: "queretaro",
    name: "Querétaro",
    path: "M 368,295 L 385,290 L 398,305 L 395,320 L 380,325 L 365,318 Z",
    color: "#dbeafe",
  },
  {
    id: "hidalgo",
    name: "Hidalgo",
    path: "M 400,295 L 425,290 L 445,305 L 448,325 L 435,335 L 415,332 L 398,318 Z",
    color: "#d1fae5",
  },
  {
    id: "mexico",
    name: "Estado de México",
    path: "M 380,330 L 405,325 L 425,340 L 428,360 L 415,375 L 390,378 L 375,365 L 378,345 Z",
    color: "#fef3c7",
  },
  {
    id: "morelos",
    name: "Morelos",
    path: "M 405,365 L 420,360 L 430,372 L 425,385 L 410,388 L 400,378 Z",
    color: "#e9d5ff",
  },
  {
    id: "guerrero",
    name: "Guerrero",
    path: "M 345,380 L 385,375 L 415,390 L 425,410 L 415,435 L 385,445 L 355,440 L 335,420 L 340,395 Z",
    color: "#fda4af",
  },
  {
    id: "oaxaca",
    name: "Oaxaca",
    path: "M 430,415 L 475,410 L 510,425 L 530,445 L 535,470 L 520,490 L 485,495 L 450,485 L 425,465 L 425,440 Z",
    color: "#fbcfe8",
  },
  {
    id: "chiapas",
    name: "Chiapas",
    path: "M 540,475 L 575,470 L 605,485 L 620,505 L 615,530 L 595,545 L 565,540 L 540,520 L 535,495 Z",
    color: "#bfdbfe",
  },
  {
    id: "veracruz",
    name: "Veracruz",
    path: "M 450,330 L 485,325 L 515,345 L 535,370 L 540,400 L 530,425 L 505,435 L 475,430 L 450,410 L 445,380 L 448,355 Z",
    color: "#a7f3d0",
  },
  {
    id: "tabasco",
    name: "Tabasco",
    path: "M 545,445 L 575,440 L 595,455 L 600,475 L 590,490 L 565,493 L 545,480 Z",
    color: "#fde68a",
  },
  {
    id: "campeche",
    name: "Campeche",
    path: "M 605,425 L 635,420 L 660,435 L 670,460 L 665,485 L 645,495 L 620,490 L 605,470 L 603,445 Z",
    color: "#ddd6fe",
  },
  {
    id: "yucatan",
    name: "Yucatán",
    path: "M 675,430 L 705,425 L 730,440 L 740,460 L 735,480 L 715,490 L 690,485 L 670,465 Z",
    color: "#fecaca",
  },
  {
    id: "quintana-roo",
    name: "Quintana Roo",
    path: "M 745,445 L 770,440 L 785,455 L 790,480 L 785,505 L 765,515 L 745,510 L 735,490 L 740,465 Z",
    color: "#c7d2fe",
  },
]

const touristLocations: TouristLocation[] = [
  { id: "cancun", name: "Cancún", x: 770, y: 470, color: "#fda4af" },
  { id: "tulum", name: "Tulum", x: 765, y: 495, color: "#93c5fd" },
  { id: "playa-del-carmen", name: "Playa del Carmen", x: 768, y: 482, color: "#a7f3d0" },
  { id: "puerto-vallarta", name: "Puerto Vallarta", x: 210, y: 265, color: "#fde047" },
  { id: "los-cabos", name: "Los Cabos", x: 105, y: 185, color: "#ddd6fe" },
  { id: "mazatlan", name: "Mazatlán", x: 195, y: 210, color: "#fbcfe8" },
  { id: "huatulco", name: "Huatulco", x: 485, y: 480, color: "#bfdbfe" },
  { id: "merida", name: "Mérida", x: 715, y: 460, color: "#fef3c7" },
]

export function MexicoMap() {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <svg viewBox="0 0 850 600" className="w-full h-auto drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="wGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="50%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>

        {/* Background ocean */}
        <rect width="850" height="600" fill="#f0f9ff" opacity="0.3" />

        {/* Mexico states */}
        {mexicoStates.map((state) => (
          <motion.path
            key={state.id}
            d={state.path}
            fill={state.color}
            stroke="#94a3b8"
            strokeWidth="1.5"
            className="cursor-pointer transition-all duration-300"
            style={{
              filter: hoveredState === state.id ? "url(#softGlow)" : "none",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
            whileHover={{
              scale: 1.05,
              fill: state.color,
              filter: "brightness(1.1)",
            }}
            onMouseEnter={() => setHoveredState(state.id)}
            onMouseLeave={() => setHoveredState(null)}
          />
        ))}

        {touristLocations.map((location, index) => (
          <g key={location.id}>
            {/* Pulsing ring animation */}
            <motion.circle
              cx={location.x}
              cy={location.y}
              r="8"
              fill="none"
              stroke={location.color}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
              }}
            />

            {/* W Pin */}
            <motion.g
              initial={{ scale: 0, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: index * 0.15,
              }}
              whileHover={{ scale: 1.3 }}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
              className="cursor-pointer"
            >
              {/* Pin circle background */}
              <circle cx={location.x} cy={location.y} r="12" fill={location.color} opacity="0.9" />

              {/* W letter */}
              <text
                x={location.x}
                y={location.y + 5}
                textAnchor="middle"
                className="text-[14px] font-semibold fill-white select-none"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                W
              </text>

              {/* White border */}
              <circle cx={location.x} cy={location.y} r="12" fill="none" stroke="white" strokeWidth="2" />
            </motion.g>
          </g>
        ))}
      </svg>

      {/* State tooltip */}
      {hoveredState && !hoveredLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-lg shadow-xl"
        >
          <p className="text-sm font-semibold text-slate-700">
            {mexicoStates.find((s) => s.id === hoveredState)?.name}
          </p>
        </motion.div>
      )}

      {hoveredLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-lg shadow-xl border-2 border-white"
        >
          <p className="text-base font-bold text-slate-800">
            {touristLocations.find((l) => l.id === hoveredLocation)?.name}
          </p>
          <p className="text-xs text-slate-600 mt-1">Destino WEEK-CHAIN</p>
        </motion.div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {touristLocations.map((location) => (
          <motion.div
            key={`legend-${location.id}`}
            className="flex items-center gap-2 glass px-3 py-2 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
              style={{ backgroundColor: location.color }}
            >
              W
            </div>
            <span className="text-sm font-medium text-slate-700">{location.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
