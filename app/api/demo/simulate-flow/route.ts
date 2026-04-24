import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/config/logger"
import { env } from "@/lib/config/environment"

/**
 * Demo Flow Simulator
 * Simulates the complete purchase flow from payment to NFT minting
 * Only works in demo mode for investor presentations
 */
export async function POST(request: Request) {
  try {
    console.log("[v0] Demo simulation started")

    // Only allow in demo mode
    if (!env.isDemoMode()) {
      console.log("[v0] Not in demo mode, rejecting request")
      return NextResponse.json({ error: "This endpoint is only available in demo mode" }, { status: 403 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User authenticated:", { user_id: user?.id, email: user?.email })

    if (!user) {
      return NextResponse.json({ error: "User must be authenticated" }, { status: 401 })
    }

    const demoUserId = user.id
    const demoUserEmail = user.email || "demo@weekchain.com"

    logger.info("[DEMO] Using user for simulation", {
      user_id: demoUserId,
      authenticated: !!user,
    })

    const body = await request.json()
    const { property_id, week_id, week_number, amount_usdc, payment_method = "card" } = body

    console.log("[v0] Request body:", { property_id, week_id, week_number, amount_usdc })

    logger.info("[DEMO] Starting simulated purchase flow", {
      property_id,
      week_id,
      user_id: demoUserId,
    })

    const { data: property } = await supabase.from("properties").select("*").eq("id", property_id).single()

    let { data: week } = await supabase.from("weeks").select("*").eq("id", week_id).single()

    console.log("[v0] Property check:", { exists: !!property, property_id })
    console.log("[v0] Week check:", { exists: !!week, week_id })

    // If property doesn't exist, create demo property
    if (!property) {
      console.log("[v0] Creating demo property")
      const { error: propError } = await supabase.from("properties").insert({
        id: property_id,
        name: "Villa Paraíso Cancún (DEMO)",
        location: "Cancún, Quintana Roo, México",
        description: "Propiedad de demostración para presentación a inversionistas",
        price_per_week: amount_usdc,
        total_weeks: 52,
        weeks_sold: 0,
        presale_target: 48,
        presale_progress: 0,
        status: "presale",
        images: ["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"],
        amenities: ["Piscina", "Gimnasio", "Seguridad 24/7"],
        bedrooms: 3,
        bathrooms: 2,
        square_meters: 150,
        property_type: "villa",
        is_demo: true,
      })

      if (propError) {
        console.log("[v0] Error creating demo property:", propError)
      }
    }

    if (!week || week.status !== "available") {
      console.log("[v0] Finding or creating available week")

      // Try to find an available week for this property
      const { data: availableWeek } = await supabase
        .from("weeks")
        .select("*")
        .eq("property_id", property_id)
        .eq("status", "available")
        .limit(1)
        .single()

      if (availableWeek) {
        week = availableWeek
        console.log("[v0] Found available week:", week.id)
      } else {
        // Create a new demo week
        console.log("[v0] Creating demo week")
        const { data: newWeek, error: weekError } = await supabase
          .from("weeks")
          .insert({
            id: week_id,
            property_id,
            week_number: week_number || Math.floor(Math.random() * 52) + 1,
            year: new Date().getFullYear(),
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            price: amount_usdc,
            status: "available",
            season: "high",
          })
          .select()
          .single()

        if (weekError) {
          console.log("[v0] Error creating demo week:", weekError)
        } else {
          week = newWeek
        }
      }
    }

    const actualWeekId = week?.id || week_id

    console.log("[v0] Step 1: Creating payment")
    const payment_id = `DEMO_PAY_${Date.now()}`
    const { data: payment, error: paymentError } = await supabase
      .from("fiat_payments")
      .insert({
        user_id: demoUserId,
        reservation_id: null,
        amount: amount_usdc,
        currency: "USD",
        payment_method,
        payment_provider: "demo",
        provider_payment_id: payment_id,
        provider_order_id: `DEMO_ORDER_${Date.now()}`,
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: {
          demo: true,
          week_number: week?.week_number || week_number,
          property_id,
          week_id: actualWeekId,
          user_email: demoUserEmail,
          simulated: true,
        },
      })
      .select()
      .single()

    if (paymentError) {
      console.log("[v0] Payment error:", paymentError)
      logger.error("[DEMO] Payment creation failed", paymentError)
      return NextResponse.json(
        { error: "Failed to create demo payment", details: paymentError.message },
        { status: 500 },
      )
    }

    console.log("[v0] Payment created:", payment.id)
    logger.info("[DEMO] Step 1: Payment created", { payment_id: payment.id })

    console.log("[v0] Step 2: Creating voucher")
    const voucher_code = `DEMO-${property_id.slice(0, 8)}-W${week?.week_number || week_number}-${Date.now()}`
    const { data: voucher, error: voucherError } = await supabase
      .from("purchase_vouchers")
      .insert({
        voucher_code,
        user_id: demoUserId,
        property_id,
        week_id: actualWeekId,
        amount: amount_usdc,
        currency: "USD",
        payment_id: payment.id,
        status: "paid",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single()

    if (voucherError) {
      console.log("[v0] Voucher error:", voucherError)
      logger.error("[DEMO] Voucher creation failed", voucherError)
      return NextResponse.json(
        { error: "Failed to create demo voucher", details: voucherError.message },
        { status: 500 },
      )
    }

    console.log("[v0] Voucher created:", voucher_code)
    logger.info("[DEMO] Step 2: Voucher created", { voucher_code })

    console.log("[v0] Step 3: Creating escrow deposit")
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_deposits")
      .insert({
        user_id: demoUserId,
        user_wallet: demoUserId, // Keep for backwards compatibility
        amount_usdc,
        escrow_address: `DEMO_ESCROW_${Date.now()}`,
        transaction_hash: `DEMO_TX_${Date.now()}`,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        metadata: {
          demo: true,
          property_id,
          week_id: actualWeekId,
        },
      })
      .select()
      .single()

    if (escrowError) {
      console.log("[v0] Escrow error:", escrowError)
      logger.error("[DEMO] Escrow creation failed", escrowError)
      return NextResponse.json({ error: "Failed to create demo escrow", details: escrowError.message }, { status: 500 })
    }

    console.log("[v0] Escrow created:", escrow.id)
    logger.info("[DEMO] Step 3: Escrow deposit created", { escrow_id: escrow.id })

    console.log("[v0] Step 4: Creating reservation")
    const booking_id = `DEMO_BOOK_${Date.now()}`
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        booking_id,
        week_id: actualWeekId,
        property_id,
        user_id: demoUserId,
        user_wallet: demoUserId, // Keep for backwards compatibility
        user_email: demoUserEmail,
        user_name: user.user_metadata?.full_name || "Demo User",
        amount: amount_usdc,
        currency: "USD",
        status: "confirmed",
        payment_method,
        payment_reference: payment.id,
        voucher_id: voucher.id,
        weeks_reserved: 1,
        confirmed_at: new Date().toISOString(),
        week_tokens_deposited: true,
        nft_issued: false,
        usdc_equivalent: amount_usdc,
        metadata: {
          demo: true,
          voucher_code,
        },
      })
      .select()
      .single()

    if (reservationError) {
      console.log("[v0] Reservation error:", reservationError)
      logger.error("[DEMO] Reservation creation failed", reservationError)
      return NextResponse.json(
        { error: "Failed to create demo reservation", details: reservationError.message },
        { status: 500 },
      )
    }

    console.log("[v0] Reservation created:", reservation.id)
    logger.info("[DEMO] Step 4: Reservation created", { reservation_id: reservation.id })

    console.log("[v0] Step 5: Minting NFT")
    const mint_address = `DEMO_NFT_${booking_id}`
    const { data: nft, error: nftError } = await supabase
      .from("nft_provisional")
      .insert({
        user_id: demoUserId,
        semana_id: actualWeekId,
        wallet: demoUserId,
        owner_wallet: demoUserId,
        estado: "minted",
        metadata_uri: `https://demo.weekchain.com/nft/${mint_address}`,
        transaction_hash: `DEMO_MINT_TX_${Date.now()}`,
      })
      .select()
      .single()

    if (nftError) {
      console.log("[v0] NFT error:", nftError)
      logger.error("[DEMO] NFT minting failed", nftError)
      return NextResponse.json({ error: "Failed to mint demo NFT", details: nftError.message }, { status: 500 })
    }

    // Update reservation with NFT info
    await supabase
      .from("reservations")
      .update({
        nft_issued: true,
        nft_mint_address: mint_address,
        status: "completed",
      })
      .eq("id", reservation.id)

    // Update week status
    await supabase
      .from("weeks")
      .update({
        status: "sold",
        owner_wallet: demoUserId,
        nft_minted: true,
        nft_token_id: mint_address,
      })
      .eq("id", actualWeekId)

    // Update voucher status
    await supabase
      .from("purchase_vouchers")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
      })
      .eq("id", voucher.id)

    console.log("[v0] NFT minted:", mint_address)
    logger.info("[DEMO] Step 5: NFT minted", { mint_address })

    console.log("[v0] Demo simulation completed successfully")

    return NextResponse.json({
      success: true,
      demo: true,
      message: "Complete purchase flow simulated successfully",
      data: {
        payment: { id: payment.id, status: "completed" },
        voucher: { id: voucher.id, code: voucher_code, status: "paid" },
        escrow: { id: escrow.id, status: "confirmed" },
        reservation: { id: reservation.id, booking_id, status: "completed" },
        nft: { id: nft.id, mint_address, status: "minted", transaction_hash: nft.transaction_hash },
      },
      timeline: {
        payment_completed: new Date().toISOString(),
        voucher_issued: new Date().toISOString(),
        escrow_confirmed: new Date().toISOString(),
        nft_minted: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.log("[v0] Demo simulation error:", error)
    logger.error("[DEMO] Simulation error:", error)
    return NextResponse.json(
      { error: "Demo simulation failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
