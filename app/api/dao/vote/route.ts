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

    const { proposalId, vote } = await request.json()

    if (!["for", "against"].includes(vote)) {
      return NextResponse.json({ error: "Voto inválido" }, { status: 400 })
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("dao_votes")
      .select("id")
      .eq("proposal_id", proposalId)
      .eq("voter_id", user.id)
      .single()

    if (existingVote) {
      return NextResponse.json({ error: "Ya has votado en esta propuesta" }, { status: 400 })
    }

    // Record vote
    await supabase.from("dao_votes").insert({
      proposal_id: proposalId,
      voter_id: user.id,
      vote: vote,
      voting_power: 1, // Could be based on WEEK tokens held
    })

    // Update proposal vote counts
    const field = vote === "for" ? "votes_for" : "votes_against"
    const { data: proposal } = await supabase.from("dao_proposals").select(field).eq("id", proposalId).single()

    await supabase
      .from("dao_proposals")
      .update({ [field]: (proposal?.[field] || 0) + 1 })
      .eq("id", proposalId)

    return NextResponse.json({ success: true, message: "Voto registrado exitosamente" })
  } catch (error) {
    console.error("[v0] Error voting:", error)
    return NextResponse.json({ error: "Error al registrar el voto" }, { status: 500 })
  }
}
