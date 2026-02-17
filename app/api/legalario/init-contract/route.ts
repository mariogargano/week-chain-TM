import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import LegalarioClient from "@/lib/legalario/client"
import { retryWithBackoff } from "@/lib/utils/retry"

export async function POST(req: NextRequest) {
  try {
    const { signerName, signerEmail, role } = await req.json()

    if (!signerName || !signerEmail || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Legalario client
    const legalario = new LegalarioClient()

    // Create contract with retry logic
    const contract = await retryWithBackoff(
      async () =>
        await legalario.createContract({
          title: `WEEK-CHAIN™ Master Agreement — ${role}`,
          file: "https://supabase.weekchain.storage/public/Master_Agreement.pdf",
          signers: [
            {
              name: signerName,
              email: signerEmail,
              role: "Signer",
            },
            {
              name: "Mario Gargano",
              email: "info@week-chain.com",
              role: "Owner",
            },
          ],
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/legalario/webhook`,
        }),
      {
        maxRetries: 3,
        baseDelay: 2000,
        onRetry: (attempt, error) => {
          console.log(`[v0] Retrying Legalario contract creation (attempt ${attempt}): ${error.message}`)
        },
      },
    )

    // Store contract record in database
    const { data: contractRecord, error: dbError } = await supabase
      .from("legalario_contracts")
      .insert({
        contract_id: contract.id,
        signer_name: signerName,
        signer_email: signerEmail,
        role,
        status: "pending",
        created_by: user.id,
        payload: contract,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Error storing contract record:", dbError)
      throw new Error("Failed to store contract record")
    }

    // Return signature URL for the first signer (the user)
    const signature_url = contract.signers[0].signature_url

    return NextResponse.json({
      success: true,
      contract_id: contract.id,
      signature_url,
      record_id: contractRecord.id,
    })
  } catch (error: any) {
    console.error("[v0] Error initializing Legalario contract:", error)
    return NextResponse.json({ error: error.message || "Failed to initialize contract" }, { status: 500 })
  }
}
