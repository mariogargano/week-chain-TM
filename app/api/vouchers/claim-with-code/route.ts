import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { voucher_code, email, wallet_address } = body

    if (!voucher_code || !email || !wallet_address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: voucher, error: voucherError } = await supabase
      .from("purchase_vouchers")
      .select(
        `
        *,
        properties (
          id,
          name,
          presale_sold,
          presale_target
        ),
        weeks (
          id,
          week_number
        )
      `,
      )
      .eq("voucher_code", voucher_code)
      .eq("user_email", email)
      .single()

    if (voucherError || !voucher) {
      return NextResponse.json({ error: "Voucher not found or email doesn't match" }, { status: 404 })
    }

    // Verify voucher is confirmed
    if (voucher.status !== "confirmed") {
      return NextResponse.json({ error: "Voucher not confirmed yet" }, { status: 400 })
    }

    // Verify voucher hasn't been redeemed
    if (voucher.nft_mint_address) {
      return NextResponse.json({ error: "Voucher already redeemed" }, { status: 400 })
    }

    // Check if presale is complete
    const { data: canRedeem } = await supabase.rpc("can_redeem_vouchers", {
      p_property_id: voucher.property_id,
    })

    if (!canRedeem) {
      return NextResponse.json(
        {
          error: "Property presale not complete yet",
          presale_sold: voucher.properties.presale_sold,
          presale_target: voucher.properties.presale_target,
        },
        { status: 400 },
      )
    }

    const mockMintAddress = `NFT_${voucher.id}_${Date.now()}`

    // Update voucher with NFT and wallet
    const { error: updateError } = await supabase
      .from("purchase_vouchers")
      .update({
        status: "redeemed",
        user_wallet: wallet_address,
        nft_mint_address: mockMintAddress,
        nft_minted_at: new Date().toISOString(),
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", voucher.id)

    if (updateError) {
      console.error("[v0] Error updating voucher:", updateError)
      return NextResponse.json({ error: "Failed to update voucher" }, { status: 500 })
    }

    // Record redemption
    await supabase.from("voucher_redemptions").insert({
      voucher_id: voucher.id,
      property_id: voucher.property_id,
      redeemed_by_wallet: wallet_address,
      nft_mint_address: mockMintAddress,
      weeks_sold_at_redemption: voucher.properties.presale_sold,
      presale_target: voucher.properties.presale_target,
    })

    // Update week status
    await supabase
      .from("weeks")
      .update({
        status: "sold",
        owner_wallet: wallet_address,
        nft_minted: true,
        nft_token_id: mockMintAddress,
      })
      .eq("id", voucher.week_id)

    return NextResponse.json({
      success: true,
      nft_mint_address: mockMintAddress,
      message: "NFT claimed successfully!",
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
