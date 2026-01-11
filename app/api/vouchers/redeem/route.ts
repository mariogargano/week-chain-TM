import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { voucher_id, wallet_address } = body

    // Obtener el voucher
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
        )
      `,
      )
      .eq("id", voucher_id)
      .single()

    if (voucherError || !voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    // Verificar que el voucher pertenece al usuario
    if (voucher.user_wallet !== wallet_address) {
      return NextResponse.json({ error: "Unauthorized - not your voucher" }, { status: 403 })
    }

    // Verificar que el voucher está confirmado
    if (voucher.status !== "confirmed") {
      return NextResponse.json({ error: "Voucher not confirmed yet" }, { status: 400 })
    }

    // Verificar que el voucher no ha sido canjeado
    if (voucher.nft_mint_address) {
      return NextResponse.json({ error: "Voucher already redeemed" }, { status: 400 })
    }

    // Verificar que la preventa está completa
    const { data: canRedeem, error: redeemCheckError } = await supabase.rpc("can_redeem_vouchers", {
      p_property_id: voucher.property_id,
    })

    if (redeemCheckError || !canRedeem) {
      return NextResponse.json(
        {
          error: "Property presale not complete yet",
          presale_sold: voucher.properties.presale_sold,
          presale_target: voucher.properties.presale_target,
        },
        { status: 400 },
      )
    }

    // Mintear el NFT (simulado por ahora)
    const mockMintAddress = `NFT_${voucher.id}_${Date.now()}`

    // Actualizar el voucher con el NFT
    const { error: updateError } = await supabase
      .from("purchase_vouchers")
      .update({
        status: "redeemed",
        nft_mint_address: mockMintAddress,
        nft_minted_at: new Date().toISOString(),
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", voucher_id)

    if (updateError) {
      console.error("[v0] Error updating voucher:", updateError)
      return NextResponse.json({ error: "Failed to update voucher" }, { status: 500 })
    }

    // Registrar el canje
    const { error: redemptionError } = await supabase.from("voucher_redemptions").insert({
      voucher_id,
      property_id: voucher.property_id,
      redeemed_by_wallet: wallet_address,
      nft_mint_address: mockMintAddress,
      weeks_sold_at_redemption: voucher.properties.presale_sold,
      presale_target: voucher.properties.presale_target,
    })

    if (redemptionError) {
      console.error("[v0] Error creating redemption record:", redemptionError)
    }

    // Actualizar la semana con el NFT
    const { error: weekError } = await supabase
      .from("weeks")
      .update({
        status: "sold",
        nft_minted: true,
        nft_token_id: mockMintAddress,
      })
      .eq("id", voucher.week_id)

    if (weekError) {
      console.error("[v0] Error updating week:", weekError)
    }

    return NextResponse.json({
      success: true,
      nft_mint_address: mockMintAddress,
      message: "Voucher redeemed successfully! NFT minted.",
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
