import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { easylexClient } from "@/lib/easylex/client"
import { logger } from "@/lib/config/logger"

/**
 * Initializes an EasyLex signature process for a certificate or contract
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { certificateId, documentName, documentContent } = body

    if (!certificateId) {
      return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 })
    }

    // Get certificate details
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("*, profiles!inner(full_name, email)")
      .eq("id", certificateId)
      .single()

    if (certError || !certificate) {
      logger.error("Certificate not found", { certificateId, error: certError })
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Create document in EasyLex
    const document = await easylexClient.createDocument({
      documentId: certificateId,
      documentName: documentName || `Certificado WeekChain ${certificate.certificate_number || certificateId}`,
      documentContent: documentContent || "V2Vla0NoYWluIENlcnRpZmljYXRl", // Fallback dummy base64 if none provided
      signers: [
        {
          name: certificate.profiles.full_name || "Usuario",
          email: certificate.profiles.email,
          role: "Member",
          order: 1,
        },
      ],
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/easylex/webhook`,
    })

    // Update certificate with EasyLex ID
    const { error: updateError } = await supabase
      .from("certificates")
      .update({
        easylex_document_id: document.documentId,
        signature_status: "pending",
        sign_url: document.signUrl
      })
      .eq("id", certificateId)

    if (updateError) {
      logger.error("Failed to update certificate with EasyLex ID", { error: updateError })
    }

    return NextResponse.json({
      success: true,
      documentId: document.documentId,
      signUrl: document.signUrl,
      status: document.status
    })

  } catch (error: any) {
    logger.error("EasyLex init error", { error: error.message })
    return NextResponse.json({ error: error.message || "Failed to initialize EasyLex" }, { status: 500 })
  }
}
