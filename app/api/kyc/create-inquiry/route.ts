import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Check if user already has approved KYC
    const { data: existing } = await supabase
      .from("kyc_users")
      .select("status, persona_inquiry_id")
      .eq("user_id", user.id)
      .single()

    if (existing?.status === "approved") {
      return NextResponse.json({ status: "already_approved" })
    }

    // If pending inquiry exists, return it
    if (existing?.persona_inquiry_id && existing?.status === "pending") {
      return NextResponse.json({
        inquiryId: existing.persona_inquiry_id,
        status: "pending",
      })
    }

    // Create/update KYC record
    const { error: kycError } = await supabase
      .from("kyc_users")
      .upsert(
        {
          user_id: user.id,
          status: "pending",
          kyc_updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (kycError) {
      console.error("KYC upsert error:", kycError)
      return NextResponse.json({ error: "Error al crear verificacion" }, { status: 500 })
    }

    // If Persona API key is configured, create a real inquiry
    const personaApiKey = process.env.PERSONA_API_KEY
    const personaTemplateId = process.env.PERSONA_TEMPLATE_ID

    if (personaApiKey && personaTemplateId) {
      const personaRes = await fetch("https://withpersona.com/api/v1/inquiries", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${personaApiKey}`,
          "Content-Type": "application/json",
          "Persona-Version": "2023-01-05",
        },
        body: JSON.stringify({
          data: {
            type: "inquiry",
            attributes: {
              "inquiry-template-id": personaTemplateId,
              "reference-id": user.id,
              "redirect-uri": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.week-chain.com"}/dashboard/member?kyc=complete`,
            },
          },
        }),
      })

      if (personaRes.ok) {
        const personaData = await personaRes.json()
        const inquiryId = personaData.data?.id
        const sessionToken = personaData.data?.attributes?.["session-token"]

        await supabase
          .from("kyc_users")
          .update({
            persona_inquiry_id: inquiryId,
            persona_session_token: sessionToken,
          })
          .eq("user_id", user.id)

        return NextResponse.json({ inquiryId, sessionToken, status: "pending" })
      }
    }

    // Fallback: KYC created in pending mode (admin manual review)
    return NextResponse.json({
      status: "pending",
      mode: personaApiKey ? "persona" : "manual",
      message: "Verificacion iniciada. Un administrador revisara tu identidad.",
    })
  } catch (error: any) {
    console.error("KYC create-inquiry error:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
