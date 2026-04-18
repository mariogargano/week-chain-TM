import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createConektaClient } from "@/lib/conekta/client"
import { logger } from "@/lib/config/logger"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("order_id")
    const userEmail = searchParams.get("user_email")

    if (!orderId && !userEmail) {
      return NextResponse.json({ success: false, error: "Either order_id or user_email is required" }, { status: 400 })
    }

    // If order_id provided, query Conekta directly
    if (orderId) {
      try {
        const conekta = createConektaClient()
        const order = await conekta.getOrder(orderId)

        return NextResponse.json({
          success: true,
          order: {
            id: order.id,
            status: order.payment_status,
            amount: order.amount / 100, // Convert from cents
            currency: order.currency,
            created_at: order.created_at,
            payment_method: order.charges?.data[0]?.payment_method?.type,
            metadata: order.metadata,
          },
        })
      } catch (conektaError) {
        logger.error("[Conekta] Error fetching order", { orderId, error: conektaError })

        // Fallback to database
        const { data: dbPayment, error: dbError } = await supabase
          .from("webhook_events")
          .select("*")
          .eq("source", "conekta")
          .contains("payload", { data: { object: { id: orderId } } })
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (dbError || !dbPayment) {
          return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          source: "database",
          order: {
            id: orderId,
            status: dbPayment.payload?.data?.object?.payment_status || "unknown",
            event_type: dbPayment.event_type,
            processed_at: dbPayment.processed_at,
          },
        })
      }
    }

    // If user_email provided, get all payments for that user from database
    if (userEmail) {
      const { data: webhookEvents, error } = await supabase
        .from("webhook_events")
        .select("*")
        .eq("source", "conekta")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        logger.error("[Conekta] Error fetching webhook events", { error })
        return NextResponse.json({ success: false, error: "Failed to fetch payment history" }, { status: 500 })
      }

      // Filter by user email in metadata
      const userPayments = webhookEvents?.filter((event) => {
        const metadata = event.payload?.data?.object?.metadata
        return metadata?.user_email === userEmail
      })

      return NextResponse.json({
        success: true,
        payments: userPayments?.map((event) => ({
          id: event.payload?.data?.object?.id,
          status: event.payload?.data?.object?.payment_status,
          amount: (event.payload?.data?.object?.amount || 0) / 100,
          currency: event.payload?.data?.object?.currency,
          event_type: event.event_type,
          created_at: event.created_at,
          processed_at: event.processed_at,
          metadata: event.payload?.data?.object?.metadata,
        })),
      })
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  } catch (error) {
    logger.error("[Conekta] Status endpoint error", { error })
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
