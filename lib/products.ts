// Productos de WEEK-CHAIN - Semanas vacacionales
export interface WeekProduct {
  id: string
  propertyId: string
  propertyName: string
  season: "high" | "medium" | "low"
  seasonLabel: string
  pricePerWeekMXN: number
  pricePerWeekUSD: number
  description: string
}

// Tipo de cambio aproximado USD -> MXN (se puede actualizar dinámicamente)
export const USD_TO_MXN = 17.5

// Precios por temporada para AFLORA TULUM
export const AFLORA_TULUM_PRICING = {
  high: {
    pricePerWeekUSD: 7500,
    pricePerWeekMXN: 131250, // 7500 * 17.5
    seasonLabel: "Temporada Alta",
    period: "Dic-Abr",
  },
  medium: {
    pricePerWeekUSD: 5500,
    pricePerWeekMXN: 96250, // 5500 * 17.5
    seasonLabel: "Temporada Media",
    period: "Jul-Nov",
  },
  low: {
    pricePerWeekUSD: 3500,
    pricePerWeekMXN: 61250, // 3500 * 17.5
    seasonLabel: "Temporada Baja",
    period: "May-Jun",
  },
}

export const WEEK_PRODUCTS: WeekProduct[] = [
  {
    id: "aflora-tulum-high",
    propertyId: "aflora-tulum",
    propertyName: "AFLORA TULUM",
    season: "high",
    seasonLabel: "Temporada Alta (Dic-Abr)",
    pricePerWeekMXN: 131250,
    pricePerWeekUSD: 7500,
    description: "1 semana vacacional en AFLORA TULUM - Temporada Alta",
  },
  {
    id: "aflora-tulum-medium",
    propertyId: "aflora-tulum",
    propertyName: "AFLORA TULUM",
    season: "medium",
    seasonLabel: "Temporada Media (Jul-Nov)",
    pricePerWeekMXN: 96250,
    pricePerWeekUSD: 5500,
    description: "1 semana vacacional en AFLORA TULUM - Temporada Media",
  },
  {
    id: "aflora-tulum-low",
    propertyId: "aflora-tulum",
    propertyName: "AFLORA TULUM",
    season: "low",
    seasonLabel: "Temporada Baja (May-Jun)",
    pricePerWeekMXN: 61250,
    pricePerWeekUSD: 3500,
    description: "1 semana vacacional en AFLORA TULUM - Temporada Baja",
  },
]

export function getWeekProduct(productId: string): WeekProduct | undefined {
  return WEEK_PRODUCTS.find((p) => p.id === productId)
}
