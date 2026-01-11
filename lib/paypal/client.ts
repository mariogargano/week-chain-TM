/**
 * PayPal Client for WEEK-CHAIN
 * Handles PayPal API communication for payments
 */

const PAYPAL_API_URL =
  process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

interface PayPalOrder {
  id: string
  status: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

interface PayPalCaptureResult {
  id: string
  status: string
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string
        status: string
        amount: {
          currency_code: string
          value: string
        }
      }>
    }
  }>
}

/**
 * Get PayPal Access Token using OAuth2
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.log("[v0] PayPal credentials not configured, using demo mode")
    return "demo_access_token"
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("[v0] PayPal auth error:", error)
    throw new Error("Failed to get PayPal access token")
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Create a PayPal Order
 */
export async function createPayPalOrder(params: {
  amount: number
  currency: string
  description: string
  returnUrl: string
  cancelUrl: string
  metadata?: Record<string, any>
}): Promise<PayPalOrder> {
  const { amount, currency, description, returnUrl, cancelUrl, metadata } = params

  // Demo mode
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  if (!clientId) {
    console.log("[v0] PayPal in demo mode - returning mock order")
    return {
      id: `DEMO-${Date.now()}`,
      status: "CREATED",
      links: [
        {
          href: returnUrl + "?token=DEMO-TOKEN&PayerID=DEMO-PAYER",
          rel: "approve",
          method: "GET",
        },
      ],
    }
  }

  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description,
          custom_id: metadata ? JSON.stringify(metadata) : undefined,
        },
      ],
      application_context: {
        brand_name: "WEEK-CHAIN",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] PayPal create order error:", error)
    throw new Error(error.message || "Failed to create PayPal order")
  }

  const order = await response.json()
  console.log("[v0] PayPal order created:", order.id)
  return order
}

/**
 * Capture a PayPal Order (after user approves)
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
  // Demo mode
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  if (!clientId || orderId.startsWith("DEMO-")) {
    console.log("[v0] PayPal in demo mode - returning mock capture")
    return {
      id: orderId,
      status: "COMPLETED",
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: `CAPTURE-${Date.now()}`,
                status: "COMPLETED",
                amount: {
                  currency_code: "MXN",
                  value: "0.00",
                },
              },
            ],
          },
        },
      ],
    }
  }

  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] PayPal capture error:", error)
    throw new Error(error.message || "Failed to capture PayPal order")
  }

  const result = await response.json()
  console.log("[v0] PayPal order captured:", result.id, result.status)
  return result
}

/**
 * Get PayPal Order Details
 */
export async function getPayPalOrder(orderId: string): Promise<PayPalOrder> {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  if (!clientId || orderId.startsWith("DEMO-")) {
    return {
      id: orderId,
      status: "APPROVED",
      links: [],
    }
  }

  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get PayPal order")
  }

  return response.json()
}

/**
 * Check if PayPal is configured
 */
export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
}

/**
 * Get PayPal Client ID for frontend
 */
export function getPayPalClientId(): string | null {
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || null
}
