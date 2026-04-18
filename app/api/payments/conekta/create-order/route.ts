import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createConektaClient } from "@/lib/conekta/client"
import { logger } from "@/lib/config/logger"
import { retryWithBackoff } from "@/lib/utils/retry"

function isDevelopment() {
  return process.env.NODE_ENV === "development"
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { amount, property_id, week_id, week_number, property_name, payment_method, user_email, user_name } = body

    logger.debug("Creating Conekta order", { amount, payment_method, week_id })

    const { data: property } = await supabase.from("properties").select("id, name").eq("id", property_id).single()

    if (!property) {
      logger.error("Property not found", { property_id })
      return NextResponse.json(
        {
          success: false,
          error: "property_not_found",
          message: "La propiedad no existe. Por favor, ejecuta el script SQL 029 para crear datos demo.",
        },
        { status: 404 },
      )
    }

    const { data: week } = await supabase.from("weeks").select("id, week_number, price").eq("id", week_id).single()

    if (!week) {
      logger.error("Week not found", { week_id })
      return NextResponse.json(
        {
          success: false,
          error: "week_not_found",
          message: "La semana no existe. Por favor, ejecuta el script SQL 029 para crear datos demo.",
        },
        { status: 404 },
      )
    }

    const conekta = createConektaClient()
    const isDemoMode = conekta.isDemoModeActive()

    logger.debug("Conekta demo mode status", { isDemoMode })

    // Check KYC if not in demo mode
    if (!isDemoMode && user) {
      const { data: kycData } = await supabase.from("kyc_users").select("status").eq("user_id", user.id).single()

      if (!kycData || kycData.status !== "approved") {
        return NextResponse.json(
          { error: "KYC verification required. Please complete identity verification first." },
          { status: 403 },
        )
      }
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`

    const exchange_rate = 17.5
    const amount_mxn = amount * exchange_rate
    const amount_usd = amount

    // OXXO limit check
    const oxxo_limit = 10000
    if (payment_method === "oxxo" && amount_mxn > oxxo_limit) {
      return NextResponse.json(
        {
          error: "oxxo_limit_exceeded",
          message: `El pago en Oxxo tiene un límite de $${oxxo_limit.toLocaleString()} MXN. Tu monto es de $${amount_mxn.toLocaleString()} MXN.`,
        },
        { status: 400 },
      )
    }

    // Determine currency and amount based on payment method
    const currency = payment_method === "card" ? "USD" : "MXN"
    const finalAmount = payment_method === "card" ? amount_usd : amount_mxn

    // Build order data
    const orderData: any = {
      currency,
      customer_info: {
        name: user_name || "Cliente",
        email: user_email || user?.email || "guest@weekchain.com",
      },
      line_items: [
        {
          name: `${property_name} - Semana ${week_number}`,
          unit_price: Math.round(finalAmount * 100), // Conekta uses cents
          quantity: 1,
        },
      ],
      metadata: {
        property_id,
        week_id,
        week_number: week_number.toString(),
        user_email: user_email || user?.email || "",
        usdc_equivalent: amount_usd.toString(),
        payment_method,
      },
    }

    // Configure payment method specific options
    if (payment_method === "oxxo") {
      orderData.charges = [
        {
          payment_method: {
            type: "oxxo_cash",
            expires_at: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60, // 3 days
          },
        },
      ]
    } else if (payment_method === "spei") {
      orderData.charges = [
        {
          payment_method: {
            type: "spei",
            expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 1 day
          },
        },
      ]
    } else {
      // Card payment - use checkout (only in production)
      if (!isDemoMode) {
        orderData.checkout = {
          allowed_payment_methods: ["card"],
          success_url: `${baseUrl}/dashboard/user/vouchers?success=true`,
          failure_url: `${baseUrl}/properties/${property_id}?canceled=true`,
        }
      }
    }

    const order = await retryWithBackoff(async () => await conekta.createOrder(orderData), {
      maxRetries: 3,
      baseDelay: 1000,
      onRetry: (attempt, error) => {
        logger.warn(`Retrying Conekta order creation (attempt ${attempt})`, {
          error: error.message,
          orderId: orderData.metadata?.week_id,
        })
      },
    })

    logger.info("Conekta order created", { orderId: order.id, status: order.payment_status })

    // Save to database
    if (!isDemoMode) {
      try {
        await supabase.from("fiat_payments").insert({
          user_wallet: user?.id || "guest",
          user_email: user_email || user?.email || "",
          processor: "conekta",
          conekta_order_id: order.id,
          amount: finalAmount,
          currency,
          payment_method,
          usdc_equivalent: amount_usd,
          exchange_rate: currency === "MXN" ? exchange_rate : 1,
          status: payment_method === "card" ? "pending" : "requires_action",
          property_id,
          week_id,
          payment_url: order.checkout?.url || null,
          metadata: {
            week_number,
            property_name,
            order_id: order.id,
          },
        })
      } catch (dbError) {
        logger.error("Error creating fiat payment record", { error: dbError })
      }
    }

    if (payment_method === "card") {
      // In demo mode, card payments are instant - no redirect needed
      if (isDemoMode) {
        return NextResponse.json({
          success: true,
          order_id: order.id,
          demo_mode: true,
          payment_status: "paid",
          message: "Demo payment completed successfully",
        })
      }

      // In production, redirect to Conekta checkout
      return NextResponse.json({
        success: true,
        payment_url: order.checkout?.url,
        order_id: order.id,
        demo_mode: false,
      })
    }

    // For OXXO and SPEI, return payment instructions
    const charge = order.charges?.data[0]
    return NextResponse.json({
      success: true,
      order_id: order.id,
      requires_action: true,
      demo_mode: isDemoMode,
      payment_method,
      payment_details: {
        reference: charge?.payment_method?.reference,
        service_name: charge?.payment_method?.service_name,
      },
      message:
        payment_method === "oxxo"
          ? "Paga en cualquier Oxxo con la referencia proporcionada"
          : "Realiza la transferencia SPEI con los datos proporcionados",
    })
  } catch (error) {
    logger.error("Conekta API error", { error })
    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: error instanceof Error ? error.message : "Internal server error",
        details: isDevelopment() ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
