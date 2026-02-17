// Conekta API client for payment processing
// Supports card, OXXO, and SPEI payments

import { getEnvironment } from "@/lib/config/environment"
import { logger } from "@/lib/config/logger"

interface ConektaConfig {
  apiKey: string
  apiVersion?: string
}

export interface ConektaOrder {
  id: string
  object: string
  amount: number
  currency: string
  payment_status: string
  created_at?: number
  checkout?: {
    id: string
    url: string
  }
  charges?: {
    data: Array<{
      id: string
      status: string
      payment_method?: {
        type: string
        reference?: string
        service_name?: string
        clabe?: string
        bank?: string
        barcode_url?: string
      }
    }>
  }
  metadata?: Record<string, string>
}

export interface ConektaOrderRequest {
  currency: string
  customer_info: {
    name: string
    email: string
    phone?: string
  }
  line_items: Array<{
    name: string
    unit_price: number
    quantity: number
  }>
  charges?: Array<{
    payment_method: {
      type: string
      expires_at?: number
      token_id?: string
    }
  }>
  checkout?: {
    allowed_payment_methods?: string[]
    expires_at?: number
    success_url?: string
    failure_url?: string
  }
  metadata?: Record<string, string>
}

class ConektaClient {
  private apiKey: string
  private baseUrl: string
  private isDemoMode: boolean

  constructor(config: ConektaConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = "https://api.conekta.io"
    this.isDemoMode = !config.apiKey || config.apiKey === "demo_mode"

    console.log("[v0] Conekta client initialized", {
      isDemoMode: this.isDemoMode,
      hasApiKey: !!config.apiKey,
      apiKeyLength: config.apiKey ? config.apiKey.length : 0,
      apiKeyPrefix: config.apiKey ? config.apiKey.substring(0, 10) + "..." : "none",
    })
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log("[v0] Conekta request", {
      endpoint,
      isDemoMode: this.isDemoMode,
      method: options.method || "GET",
    })

    if (this.isDemoMode) {
      console.log("[v0] Using Conekta DEMO mode - returning mock response")
      return this.getMockResponse<T>(endpoint, options)
    }

    console.log("[v0] Making REAL Conekta API call to:", `${this.baseUrl}${endpoint}`)

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.conekta-v2.1.0+json",
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log("[v0] Conekta API response status:", response.status)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.log("[v0] Conekta API error:", JSON.stringify(error))
        logger.error("Conekta API error", { status: response.status, error })
        throw new Error(error.details?.[0]?.message || error.message || `Conekta API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Conekta API success, order id:", data.id)
      return data
    } catch (error) {
      console.log("[v0] Conekta fetch error:", error)
      throw error
    }
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit): T {
    if (endpoint === "/orders" && options.method === "POST") {
      const body = JSON.parse(options.body as string)
      const mockOrder: ConektaOrder = {
        id: `ord_demo_${Date.now()}`,
        object: "order",
        amount: body.line_items[0].unit_price,
        currency: body.currency,
        payment_status: "pending",
        created_at: Date.now(),
        metadata: body.metadata,
      }

      // Add payment details for different payment methods
      if (body.charges) {
        const paymentType = body.charges[0].payment_method.type

        if (paymentType === "card") {
          mockOrder.payment_status = "paid"
        }

        mockOrder.charges = {
          data: [
            {
              id: `chg_demo_${Date.now()}`,
              status: paymentType === "card" ? "paid" : "pending",
              payment_method: {
                type: paymentType,
                reference: paymentType === "oxxo_cash" ? `OXXO${Date.now().toString().slice(-10)}` : undefined,
                barcode_url:
                  paymentType === "oxxo_cash" ? "https://via.placeholder.com/400x100?text=OXXO+Barcode" : undefined,
                clabe: paymentType === "spei" ? `6461801234567890${Date.now().toString().slice(-2)}` : undefined,
                bank: paymentType === "spei" ? "STP" : undefined,
                service_name: paymentType === "spei" ? "STP" : undefined,
              },
            },
          ],
        }
      }

      return mockOrder as T
    }

    throw new Error(`Mock response not implemented for ${endpoint}`)
  }

  async createOrder(orderData: ConektaOrderRequest): Promise<ConektaOrder> {
    return this.request<ConektaOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  async getOrder(orderId: string): Promise<ConektaOrder> {
    if (this.isDemoMode) {
      return {
        id: orderId,
        object: "order",
        amount: 100000,
        currency: "MXN",
        payment_status: "paid",
        created_at: Date.now(),
      } as ConektaOrder
    }

    return this.request<ConektaOrder>(`/orders/${orderId}`, {
      method: "GET",
    })
  }

  async createCheckout(orderData: ConektaOrderRequest): Promise<ConektaOrder> {
    const order = await this.createOrder(orderData)
    return order
  }

  isDemoModeActive(): boolean {
    return this.isDemoMode
  }
}

export function createConektaClient(apiKey?: string): ConektaClient {
  const env = getEnvironment()
  const key = apiKey || env.conekta.secretKey || "demo_mode"
  return new ConektaClient({ apiKey: key })
}

export async function createConektaOrder(orderData: ConektaOrderRequest): Promise<ConektaOrder> {
  const client = createConektaClient()
  return client.createOrder(orderData)
}

export type { ConektaClient }
