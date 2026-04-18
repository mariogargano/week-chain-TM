import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { kycId, adminId, reason } = await request.json()

    // Verificar que el usuario es admin
    const { data: adminUser } = await supabase.from("users").select("role").eq("id", adminId).single()

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Actualizar el estado del KYC
    const { data, error } = await supabase
      .from("kyc_users")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        rejection_reason: reason || "No cumple con los requisitos",
      })
      .eq("id", kycId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
