// WEEK-CHAIN PAX-based Certificate Product Logic
import { createClient } from "@/lib/supabase/server"
import { BETA_CONFIG } from "./types"

export interface CertificateProductV2 {
  id: string
  max_pax: number
  max_estancias_per_year: number
  price_usd: number
  display_name: string
  description: string
  is_active: boolean
  sales_enabled: boolean
  beta_cap: number
  sold_count: number
}

export interface ProductAvailability {
  available: boolean
  reason?: string
  remainingForProduct: number
  remainingTotal: number
  waitlistEnabled: boolean
}

// PAX-based pricing catalog (locked)
export const PAX_CATALOG: Record<string, number> = {
  "2_1": 3500,
  "2_2": 6000,
  "2_3": 8000,
  "2_4": 10000,
  "4_1": 5000,
  "4_2": 9000,
  "4_3": 12000,
  "4_4": 15000,
  "6_1": 7500,
  "6_2": 13000,
  "6_3": 18000,
  "6_4": 20000,
  "8_1": 10000,
  "8_2": 15000,
  "8_3": 20000,
  "8_4": 25000,
}

/**
 * Get price for a PAX/estancias combination
 */
export function getProductPrice(maxPax: number, estancias: number): number {
  const key = `${maxPax}_${estancias}`
  return PAX_CATALOG[key] || 0
}

/**
 * Get all available certificate products
 */
export async function getAllProducts(): Promise<CertificateProductV2[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("certificate_products_v2")
    .select("*")
    .eq("is_active", true)
    .order("max_pax", { ascending: true })
    .order("max_estancias_per_year", { ascending: true })

  if (error || !data) {
    console.error("[PaxProducts] Error fetching products:", error)
    return []
  }

  return data
}

/**
 * Get a specific product by PAX and estancias
 */
export async function getProductBySpec(maxPax: number, estancias: number): Promise<CertificateProductV2 | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("certificate_products_v2")
    .select("*")
    .eq("max_pax", maxPax)
    .eq("max_estancias_per_year", estancias)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string): Promise<CertificateProductV2 | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("certificate_products_v2").select("*").eq("id", productId).single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Check if a specific product is available for purchase
 */
export async function isProductAvailable(productId: string): Promise<ProductAvailability> {
  // Build-time safety check
  if (typeof window === "undefined" && !process.env.STRIPE_SECRET_KEY) {
    return {
      available: true,
      remainingForProduct: 999,
      remainingTotal: 999,
      waitlistEnabled: false,
    }
  }

  const supabase = await createClient()

  // Get product
  const { data: product } = await supabase.from("certificate_products_v2").select("*").eq("id", productId).single()

  if (!product) {
    return {
      available: false,
      reason: "Product not found",
      remainingForProduct: 0,
      remainingTotal: 0,
      waitlistEnabled: false,
    }
  }

  // Check if product is active and sales enabled
  if (!product.is_active) {
    return {
      available: false,
      reason: "Product is not active",
      remainingForProduct: 0,
      remainingTotal: 0,
      waitlistEnabled: true,
    }
  }

  if (!product.sales_enabled) {
    return {
      available: false,
      reason: "Sales are currently stopped for this product",
      remainingForProduct: 0,
      remainingTotal: 0,
      waitlistEnabled: true,
    }
  }

  // Check product-specific cap
  const remainingForProduct = product.beta_cap - (product.sold_count || 0)
  if (remainingForProduct <= 0) {
    return {
      available: false,
      reason: "Product beta cap reached",
      remainingForProduct: 0,
      remainingTotal: 0,
      waitlistEnabled: true,
    }
  }

  // Check global beta cap
  const { data: allProducts } = await supabase.from("certificate_products_v2").select("sold_count")

  const totalSold = allProducts?.reduce((sum, p) => sum + (p.sold_count || 0), 0) || 0
  const remainingTotal = BETA_CONFIG.totalCertificatesAllowed - totalSold

  if (remainingTotal <= 0) {
    return {
      available: false,
      reason: "Global beta cap reached",
      remainingForProduct,
      remainingTotal: 0,
      waitlistEnabled: true,
    }
  }

  // Check capacity engine status (global semaphore)
  const { data: capacityStatus } = await supabase
    .from("capacity_engine_status")
    .select("system_status")
    .order("calculated_at", { ascending: false })
    .limit(1)
    .single()

  if (capacityStatus?.system_status === "RED") {
    return {
      available: false,
      reason: "System capacity limit reached",
      remainingForProduct,
      remainingTotal,
      waitlistEnabled: true,
    }
  }

  return {
    available: true,
    remainingForProduct,
    remainingTotal,
    waitlistEnabled: false,
  }
}

/**
 * Check availability by PAX and estancias
 */
export async function isProductSpecAvailable(maxPax: number, estancias: number): Promise<ProductAvailability> {
  const product = await getProductBySpec(maxPax, estancias)

  if (!product) {
    return {
      available: false,
      reason: "Product not found",
      remainingForProduct: 0,
      remainingTotal: 0,
      waitlistEnabled: false,
    }
  }

  return isProductAvailable(product.id)
}

/**
 * Get recommended product based on user input
 */
export function getRecommendedProduct(
  partySize: number,
  desiredEstancias: number,
): { maxPax: 2 | 4 | 6 | 8; estancias: 1 | 2 | 3 | 4; priceUsd: number } {
  // Map party size to PAX category
  let maxPax: 2 | 4 | 6 | 8
  if (partySize <= 2) {
    maxPax = 2
  } else if (partySize <= 4) {
    maxPax = 4
  } else if (partySize <= 6) {
    maxPax = 6
  } else {
    maxPax = 8
  }

  // Clamp estancias to valid range
  const estancias = Math.max(1, Math.min(4, desiredEstancias)) as 1 | 2 | 3 | 4

  const priceUsd = getProductPrice(maxPax, estancias)

  return { maxPax, estancias, priceUsd }
}
