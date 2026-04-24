import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/config/logger"
import { getEnvironment } from "@/lib/config/environment"

export async function POST(request: Request) {
  try {
    const env = getEnvironment()

    if (!env.isDemoMode) {
      return NextResponse.json({ error: "This endpoint is only available in demo mode" }, { status: 403 })
    }

    const supabase = await createClient()
    const body = await request.json()

    const {
      property_id,
      week_id,
      week_number,
      amount,
      payment_method = "card",
      user_wallet = "DEMO_WALLET_" + Date.now(),
    } = body

    logger.info("Starting complete demo flow", { property_id, week_id, week_number })

    const voucherCode = `DEMO-${property_id.substring(0, 8)}-W${week_number}-${Date.now()}`

    const { data: voucher, error: voucherError } = await supabase
      .from("purchase_vouchers")
      .insert({
        voucher_code: voucherCode,
        user_wallet,
        property_id,
        week_id,
        week_number,
        payment_method: `demo_${payment_method}`,
        amount_usdc: amount,
        amount_paid_currency: "USD",
        amount_paid: amount,
        status: "confirmed",
        issued_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (voucherError) {
      logger.error("Voucher creation failed", { error: voucherError })
      return NextResponse.json({ error: "Failed to create voucher", details: voucherError.message }, { status: 500 })
    }

    logger.info("Voucher created", { voucher_id: voucher.id, code: voucherCode })

    const escrowAddress = `ESCROW_DEMO_${Date.now()}`

    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_deposits")
      .insert({
        user_wallet,
        amount_usdc: amount,
        status: "pending",
        escrow_address: escrowAddress,
        transaction_hash: `TX_DEMO_${Date.now()}`,
        metadata: {
          property_id,
          week_id,
          voucher_id: voucher.id,
          demo_mode: true,
        },
      })
      .select()
      .single()

    if (escrowError) {
      logger.error("Escrow creation failed", { error: escrowError })
      return NextResponse.json({ error: "Failed to create escrow", details: escrowError.message }, { status: 500 })
    }

    logger.info("Escrow created", { escrow_id: escrow.id })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const { data: confirmedEscrow, error: confirmError } = await supabase
      .from("escrow_deposits")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", escrow.id)
      .select()
      .single()

    if (confirmError) {
      logger.error("Escrow confirmation failed", { error: confirmError })
      return NextResponse.json({ error: "Failed to confirm escrow", details: confirmError.message }, { status: 500 })
    }

    logger.info("Escrow confirmed", { escrow_id: escrow.id })

    const bookingId = `BOOKING_DEMO_${Date.now()}`

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        booking_id: bookingId,
        week_id,
        property_id,
        user_wallet,
        status: "confirmed",
        week_tokens_deposited: false,
        nft_issued: false,
        usdc_equivalent: amount,
        metadata: {
          voucher_id: voucher.id,
          escrow_id: escrow.id,
          demo_mode: true,
        },
      })
      .select()
      .single()

    if (reservationError) {
      logger.error("Reservation creation failed", { error: reservationError })
    }

    logger.info("Reservation created", { reservation_id: reservation?.id })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockMintAddress = `NFT_DEMO_${bookingId}`
    const mockTransactionHash = `TX_NFT_${Date.now()}`
    const metadataUri = `https://arweave.net/${mockMintAddress}.json`

    const { data: nft, error: nftError } = await supabase
      .from("nft_provisional")
      .insert({
        semana_id: week_id,
        wallet: user_wallet,
        estado: "minted",
        metadata_uri: metadataUri,
        transaction_hash: mockTransactionHash,
      })
      .select()
      .single()

    if (nftError) {
      logger.error("NFT minting failed", { error: nftError })
      return NextResponse.json({ error: "Failed to mint NFT", details: nftError.message }, { status: 500 })
    }

    logger.info("NFT minted", { nft_id: nft.id, mint_address: mockMintAddress })

    if (reservation) {
      await supabase
        .from("reservations")
        .update({
          nft_issued: true,
          status: "completed",
          nft_mint_address: mockMintAddress,
        })
        .eq("id", reservation.id)
    }

    await supabase
      .from("weeks")
      .update({
        status: "sold",
        nft_minted: true,
        nft_token_id: mockMintAddress,
        owner_wallet: user_wallet,
      })
      .eq("id", week_id)

    await supabase
      .from("purchase_vouchers")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        nft_mint_address: mockMintAddress,
      })
      .eq("id", voucher.id)

    logger.info("Complete demo flow finished successfully", {
      voucher_id: voucher.id,
      escrow_id: escrow.id,
      reservation_id: reservation?.id,
      nft_id: nft.id,
    })

    return NextResponse.json({
      success: true,
      message: "Complete demo flow executed successfully",
      data: {
        voucher: {
          id: voucher.id,
          code: voucherCode,
          status: "redeemed",
        },
        escrow: {
          id: escrow.id,
          address: escrowAddress,
          status: "confirmed",
        },
        reservation: {
          id: reservation?.id,
          booking_id: bookingId,
          status: "completed",
        },
        nft: {
          id: nft.id,
          mint_address: mockMintAddress,
          transaction_hash: mockTransactionHash,
          metadata_uri: metadataUri,
        },
      },
      steps_completed: [
        "Payment processed",
        "Voucher created",
        "Escrow deposit created",
        "Escrow confirmed by admin",
        "Reservation created",
        "NFT minted on blockchain",
        "Voucher redeemed",
        "Week marked as sold",
      ],
    })
  } catch (error) {
    logger.error("Complete demo flow error", { error })
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
