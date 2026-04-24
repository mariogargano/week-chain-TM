import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { depositId, adminId } = await request.json()

    // Verificar que el usuario es admin
    const { data: adminUser } = await supabase.from("users").select("role").eq("id", adminId).single()

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener el depósito
    const { data: deposit, error: depositError } = await supabase
      .from("escrow_deposits")
      .select("*")
      .eq("id", depositId)
      .single()

    if (depositError) throw depositError

    // Actualizar el estado del depósito
    const { error: updateError } = await supabase
      .from("escrow_deposits")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: adminId,
      })
      .eq("id", depositId)

    if (updateError) throw updateError

    // Actualizar o crear el balance WEEK del usuario
    const { data: existingBalance } = await supabase
      .from("week_balances")
      .select("*")
      .eq("user_id", deposit.user_id)
      .single()

    if (existingBalance) {
      // Actualizar balance existente
      await supabase
        .from("week_balances")
        .update({
          balance: Number(existingBalance.balance) + Number(deposit.week_balance_issued),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", deposit.user_id)
    } else {
      // Crear nuevo balance
      await supabase.from("week_balances").insert({
        user_id: deposit.user_id,
        balance: deposit.week_balance_issued,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
