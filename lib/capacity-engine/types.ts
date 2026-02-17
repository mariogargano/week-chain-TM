// WEEK-CHAIN Capacity Engine Types

export type CertificateTier = "Silver" | "Gold" | "Platinum" | "Signature"

export type CertificatePaxType = 2 | 4 | 6 | 8
export type CertificateEstanciasType = 1 | 2 | 3 | 4

export type SystemStatus = "GREEN" | "YELLOW" | "ORANGE" | "RED"

export type CertificateStatus = "active" | "paused" | "expired" | "cancelled"

export type ReservationRequestStatus =
  | "requested"
  | "processing"
  | "offered"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "expired"

export type ConfirmedReservationStatus =
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show"
  | "relocated"

export type PropertyCategory = "A" | "B" | "C"

export type PropertyStatus = "active" | "offline" | "maintenance" | "removed"

export interface CertificateProduct {
  id: string
  tier: CertificateTier
  displayName: string
  includedWeeksPerYear: number
  requestWindowDays: number
  expectedUsageRate: number
  priceUsd: number
  description: string
  features: string[]
  isActive: boolean
  sortOrder: number
}

export interface CertificateProductV2 {
  id: string
  maxPax: CertificatePaxType
  maxEstanciasPerYear: CertificateEstanciasType
  priceUsd: number
  displayName: string
  description: string
  isActive: boolean
  betaCap: number // Maximum certificates allowed in beta
  soldCount: number // Current sold count
}

export interface UserCertificate {
  id: string
  userId: string
  tier: CertificateTier
  startDate: string
  endDate: string
  status: CertificateStatus
  remainingWeeksThisYear: number
  reservationsUsedThisYear: number
  yearStartDate: string
  purchasePriceUsd: number
  createdAt: string
}

export interface UserCertificateV2 {
  id: string
  userId: string
  maxPax: CertificatePaxType
  maxEstanciasPerYear: CertificateEstanciasType
  remainingEstanciasThisYear: number
  yearStartDate: string
  yearEndDate: string
  status: CertificateStatus
  purchasePriceUsd: number
  createdAt: string
}

export interface SupplyProperty {
  id: string
  propertyId?: string
  name: string
  country: string
  city: string
  category: PropertyCategory
  maxOccupancy: number
  bedrooms: number
  bathrooms: number
  supplyWeeksPerYear: number
  blackoutWeeks: number
  status: PropertyStatus
  amenities: string[]
  images: string[]
  description: string
}

export interface ReservationRequest {
  id: string
  userId: string
  certificateId: string
  desiredStartDate: string
  desiredEndDate: string
  flexibilityDays: number
  partySize: number
  destinationPreference?: string
  categoryPreference?: PropertyCategory | "any"
  specialRequests?: string
  status: ReservationRequestStatus
  offeredPropertyId?: string
  offeredDatesStart?: string
  offeredDatesEnd?: string
  offerExpiresAt?: string
  confirmedPropertyId?: string
  confirmedAt?: string
  createdAt: string
}

export interface ConfirmedReservation {
  id: string
  userId: string
  certificateId: string
  requestId?: string
  propertyId: string
  checkIn: string
  checkOut: string
  partySize: number
  status: ConfirmedReservationStatus
  checkInInstructions?: string
  accessCode?: string
  propertyContact?: string
  confirmedAt: string
}

export interface CapacityEngineStatus {
  id: string
  calculatedAt: string

  // Supply
  totalProperties: number
  activeProperties: number
  totalSupplyWeeks: number
  safeCapacity: number

  // Demand
  totalCertificatesSilver: number
  totalCertificatesGold: number
  totalCertificatesPlatinum: number
  totalCertificatesSignature: number
  projectedDemand: number

  // Status
  capacityUtilizationPct: number
  systemStatus: SystemStatus

  // Stop-sale
  silverSalesEnabled: boolean
  goldSalesEnabled: boolean
  platinumSalesEnabled: boolean
  signatureSalesEnabled: boolean

  // Waitlist
  waitlistEnabled: boolean
  waitlistCount: number
}

export const CAPACITY_THRESHOLDS = {
  GREEN_MAX: 50, // < 50% = GREEN
  YELLOW_MAX: 65, // 50-65% = YELLOW
  ORANGE_MAX: 65, // Not used in new spec, but kept for backward compatibility
  RED_MIN: 65, // > 65% = RED (stop-sale triggers)
} as const

export const SAFETY_FACTOR = 0.7 // SafeCapacity = TotalSupply * 0.70

export const EXPECTED_USAGE_RATES: Record<CertificateTier, number> = {
  Silver: 0.55,
  Gold: 0.7,
  Platinum: 0.8,
  Signature: 0.85,
}

export const CERTIFICATE_WEEKS: Record<CertificateTier, number> = {
  Silver: 1,
  Gold: 1,
  Platinum: 2,
  Signature: 4,
}

export const CERTIFICATE_PRICES: Record<CertificateTier, number> = {
  Silver: 3500,
  Gold: 6000,
  Platinum: 11500,
  Signature: 21000,
}

export const REQUEST_WINDOW_DAYS: Record<CertificateTier, number> = {
  Silver: 90,
  Gold: 180,
  Platinum: 365,
  Signature: 365,
}

export const CERTIFICATE_VALIDITY_YEARS = 15

export const CERTIFICATE_CATALOG_V2: Record<string, { priceUsd: number; betaCap: number }> = {
  // 2 PAX
  "2_1": { priceUsd: 3500, betaCap: 5 },
  "2_2": { priceUsd: 6000, betaCap: 5 },
  "2_3": { priceUsd: 8000, betaCap: 5 },
  "2_4": { priceUsd: 10000, betaCap: 5 },
  // 4 PAX
  "4_1": { priceUsd: 5000, betaCap: 7 },
  "4_2": { priceUsd: 9000, betaCap: 7 },
  "4_3": { priceUsd: 12000, betaCap: 6 },
  "4_4": { priceUsd: 15000, betaCap: 6 },
  // 6 PAX
  "6_1": { priceUsd: 7500, betaCap: 4 },
  "6_2": { priceUsd: 13000, betaCap: 4 },
  "6_3": { priceUsd: 18000, betaCap: 4 },
  "6_4": { priceUsd: 20000, betaCap: 3 },
  // 8 PAX
  "8_1": { priceUsd: 10000, betaCap: 2 },
  "8_2": { priceUsd: 15000, betaCap: 2 },
  "8_3": { priceUsd: 20000, betaCap: 2 },
  "8_4": { priceUsd: 25000, betaCap: 1 },
}

export const BETA_CONFIG = {
  totalCertificatesAllowed: 68,
  distributionByPax: {
    2: 20,
    4: 26,
    6: 15,
    8: 7,
  },
  activeDestinations: 3, // Only 2-3 destinations active, rest dormant
} as const
