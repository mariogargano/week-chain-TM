import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get("wallet_address")

    if (!wallet_address) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Obtener todos los vouchers del usuario
    const { data: vouchers, error } = await supabase
      .from("purchase_vouchers")
      .select(
        `
        *,
        properties (
          id,
          name,
          location,
          presale_sold,
          presale_target,
          presale_progress
        ),
        weeks (
          id,
          week_number,
          status
        )
      `,
      )
      .eq("user_wallet", wallet_address)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching vouchers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verificar cuáles pueden ser canjeados
    const vouchersWithRedeemStatus = await Promise.all(
      vouchers.map(async (voucher) => {
        if (voucher.status === "confirmed" && !voucher.nft_mint_address) {
          const { data: canRedeem } = await supabase.rpc("can_redeem_vouchers", {
            p_property_id: voucher.property_id,
          })
          return { ...voucher, can_redeem: canRedeem || false }
        }
        return { ...voucher, can_redeem: false }
      }),
    )

    return NextResponse.json({
      success: true,
      vouchers: vouchersWithRedeemStatus,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
