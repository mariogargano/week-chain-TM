import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { loanId, amount } = await request.json()

    // Get loan details
    const { data: loan, error: loanError } = await supabase
      .from("vafi_loans")
      .select("*")
      .eq("id", loanId)
      .eq("borrower_id", user.id)
      .single()

    if (loanError || !loan) {
      return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })
    }

    const totalOwed = loan.loan_amount * (1 + loan.interest_rate / 100)

    if (amount < totalOwed) {
      return NextResponse.json({ error: "Monto insuficiente para pagar el préstamo" }, { status: 400 })
    }

    // Update loan status
    await supabase.from("vafi_loans").update({ status: "repaid", repaid_at: new Date().toISOString() }).eq("id", loanId)

    // Unlock NFT
    await supabase.from("nft_mints").update({ status: "minted" }).eq("id", loan.nft_collateral_id)

    return NextResponse.json({ success: true, message: "Préstamo pagado exitosamente" })
  } catch (error) {
    console.error("[v0] Error repaying loan:", error)
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 })
  }
}
