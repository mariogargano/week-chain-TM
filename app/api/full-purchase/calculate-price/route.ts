import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/config/logger"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { property_id, discount_percentage = 15 } = body

    logger.debug("Calculating full property purchase price", { property_id, discount_percentage })

    const { data: functionData, error: functionError } = await supabase.rpc("calculate_full_property_price", {
      p_property_id: property_id,
      p_discount_percentage: discount_percentage,
    })

    // If function exists and works, use it
    if (!functionError && functionData) {
      const priceData = Array.isArray(functionData) ? functionData[0] : functionData

      logger.info("Price calculated using database function", priceData)

      return NextResponse.json({
        success: true,
        pricing: {
          total_weeks: priceData.total_weeks,
          base_price_usdc: Number.parseFloat(priceData.base_price_usdc),
          discount_percentage,
          discount_amount_usdc: Number.parseFloat(priceData.discount_amount_usdc),
          final_price_usdc: Number.parseFloat(priceData.final_price_usdc),
          weeks_already_sold: priceData.weeks_already_sold,
          refund_amount_needed_usdc: Number.parseFloat(priceData.refund_amount_needed_usdc),
        },
      })
    }

    logger.warn("Database function not found, calculating manually", { error: functionError?.message })

    // Get all weeks for the property
    const { data: weeks, error: weeksError } = await supabase
      .from("weeks")
      .select("price, status")
      .eq("property_id", property_id)

    if (weeksError) {
      logger.error("Error fetching weeks", weeksError)
      return NextResponse.json({ error: "Failed to fetch property weeks" }, { status: 500 })
    }

    // Calculate base price (sum of all weeks)
    const base_price_usdc = weeks?.reduce((sum, week) => sum + (Number(week.price) || 0), 0) || 0

    // Count weeks already sold
    const weeks_already_sold = weeks?.filter((w) => ["reserved", "sold"].includes(w.status)).length || 0

    // Get refund amount needed from existing vouchers
    const { data: vouchers, error: vouchersError } = await supabase
      .from("purchase_vouchers")
      .select("amount_usdc")
      .eq("property_id", property_id)
      .in("status", ["confirmed", "redeemed"])

    const refund_amount_needed_usdc = vouchers?.reduce((sum, v) => sum + (Number(v.amount_usdc) || 0), 0) || 0

    // Calculate discount
    const discount_amount_usdc = Math.round(base_price_usdc * (discount_percentage / 100) * 100) / 100
    const final_price_usdc = Math.round((base_price_usdc - discount_amount_usdc) * 100) / 100

    const pricing = {
      total_weeks: 52,
      base_price_usdc,
      discount_percentage,
      discount_amount_usdc,
      final_price_usdc,
      weeks_already_sold,
      refund_amount_needed_usdc,
    }

    logger.info("Price calculated manually", pricing)

    return NextResponse.json({
      success: true,
      pricing,
      warning: "Using manual calculation. Run SQL script 025 for optimized performance.",
    })
  } catch (error) {
    logger.error("API error calculating full purchase price", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
