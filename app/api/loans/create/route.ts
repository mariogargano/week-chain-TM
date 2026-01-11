import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { CreateLoanSchema } from "@/lib/validation/schemas"

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const payload = CreateLoanSchema.parse(await req.json())

    const { error } = await supabase.from("loans").insert({
      user_id: payload.userId,
      nft_mint: payload.nftMint,
      principal: payload.principal,
      apr: payload.apr,
      ltv: payload.ltv,
      due_date: payload.dueDate,
      status: "draft",
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 })
  }
}
