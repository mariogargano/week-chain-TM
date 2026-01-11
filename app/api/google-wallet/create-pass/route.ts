import { NextResponse } from "next/server"
import { googleWallet } from "@/lib/google-wallet/client"
import { logger } from "@/lib/config/logger"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { voucherId } = body

    const { data: voucher, error } = await supabase
      .from("purchase_vouchers")
      .select(`
        *,
        properties (name, images),
        property_weeks (week_number, year, check_in_date, check_out_date)
      `)
      .eq("id", voucherId)
      .eq("user_id", user.id)
      .single()

    if (error || !voucher) {
      logger.error("Voucher not found:", error)
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    const saveUrl = await googleWallet.createWeekPass({
      propertyName: voucher.properties.name,
      weekNumber: voucher.property_weeks.week_number,
      year: voucher.property_weeks.year,
      checkIn: voucher.property_weeks.check_in_date,
      checkOut: voucher.property_weeks.check_out_date,
      voucherCode: voucher.voucher_code,
      ownerName: user.user_metadata?.full_name || user.email || "Owner",
      propertyImage: voucher.properties.images?.[0],
    })

    logger.info("Google Wallet pass created for voucher:", voucherId)

    return NextResponse.json({
      success: true,
      saveUrl,
    })
  } catch (error) {
    logger.error("Error creating Google Wallet pass:", error)
    return NextResponse.json(
      {
        error: "Failed to create Google Wallet pass",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
