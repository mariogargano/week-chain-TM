import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

/**
 * Verify Persona webhook signature
 * SECURITY: Required to prevent unauthorized KYC status changes
 */
function verifyPersonaSignature(payload: string, signature: string | null): boolean {
  const webhookSecret = process.env.PERSONA_WEBHOOK_SECRET
  
  // If no secret configured, log warning but allow in development
  if (!webhookSecret) {
    console.warn("[v0] PERSONA_WEBHOOK_SECRET not configured - skipping signature verification")
    return process.env.NODE_ENV === "development"
  }
  
  if (!signature) {
    console.error("[v0] Missing Persona-Signature header")
    return false
  }
  
  // Persona uses HMAC-SHA256 for webhook signatures
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex")
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get("persona-signature") || request.headers.get("x-persona-signature")
    
    // Verify webhook signature (SECURITY: P0 requirement)
    if (!verifyPersonaSignature(rawBody, signature)) {
      console.error("[v0] Invalid Persona webhook signature")
      // Log failed attempt for security monitoring
      const supabase = await createClient()
      await supabase.from("system_logs").insert({
        level: "error",
        message: "Invalid Persona webhook signature",
        context: {
          ip: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent"),
        }
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
    
    // Parse body after signature verification
    const body = JSON.parse(rawBody)
    const { data } = body

    if (!data || data.type !== "inquiry") {
      return NextResponse.json({ success: true })
    }

    const inquiryId = data.id
    const status = data.attributes.status
    const referenceId = data.attributes["reference-id"]

    const supabase = await createClient()

    let kycStatus = "pending"
    if (status === "completed" || status === "approved") {
      kycStatus = "approved"
    } else if (status === "failed" || status === "declined") {
      kycStatus = "rejected"
    }

    const { error: updateError } = await supabase
      .from("kyc_users")
      .update({
        status: kycStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("persona_inquiry_id", inquiryId)

    if (updateError) {
      console.error("[v0] Error updating KYC status:", updateError)
    }

    const { data: kycUser } = await supabase
      .from("kyc_users")
      .select("email, name")
      .eq("persona_inquiry_id", inquiryId)
      .single()

    if (kycUser && (kycStatus === "approved" || kycStatus === "rejected")) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/email/send-kyc-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: kycUser.email,
            userName: kycUser.name,
            status: kycStatus,
          }),
        })
      } catch (emailError) {
        console.error("[v0] Failed to send KYC status email:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
