import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { UpdateLoanStatusSchema } from "@/lib/validation/schemas"

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()
    const { data: loan, error } = await supabase
      .from("loans")
      .select(`
        *,
        collaterals (*)
      `)
      .eq("id", params.id)
      .single()

    if (error || !loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    return NextResponse.json({ loan })
  } catch (error) {
    console.error("[v0] Error fetching loan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const validation = UpdateLoanStatusSchema.safeParse({
      loanId: params.id,
      ...body,
    })

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const { status } = validation.data

    // Update loan status
    const { data: loan, error } = await supabase.from("loans").update({ status }).eq("id", params.id).select().single()

    if (error) {
      console.error("[v0] Error updating loan:", error)
      return NextResponse.json({ error: "Failed to update loan" }, { status: 500 })
    }

    return NextResponse.json({ loan })
  } catch (error) {
    console.error("[v0] Error in update loan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
