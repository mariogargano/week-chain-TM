import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createPurchaseVoucher } from "@/lib/vouchers/service"
import { logger } from "@/lib/config/logger"

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

    // Call the service function to handle voucher creation
    const result = await createPurchaseVoucher(supabase, body)

    return NextResponse.json({
      ...result,
      message: "Purchase voucher created successfully",
    })
  } catch (error: any) {
    logger.error("API error in voucher creation", { error: error.message })
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
