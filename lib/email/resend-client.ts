import type React from "react"
import { Resend } from "resend"

// Initialize Resend lazily or handle missing key gracefully for build time
const resendApiKey = process.env.RESEND_API_KEY

// Use a proxy or a getter to handle the resend instance
export const resend = resendApiKey ? new Resend(resendApiKey) : (null as any)

if (!resendApiKey && process.env.NODE_ENV === "production") {
  console.warn("⚠️ RESEND_API_KEY is not defined in environment variables. Email sending will fail.")
}

export const FROM_EMAIL = "WeekChain <info@week-chain.com>"
export const MANAGEMENT_EMAIL = "WeekChain Management <management@week-chain.com>"
export const SUPPORT_EMAIL = "support@week-chain.com"

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
  from?: string
}

export async function sendEmail({ to, subject, react, from = FROM_EMAIL }: SendEmailOptions) {
  if (!resend) {
    console.error("❌ Resend client not initialized. Missing RESEND_API_KEY.")
    throw new Error("Email service unavailable")
  }

  return await resend.emails.send({
    from,
    to,
    subject,
    react,
  })
}
