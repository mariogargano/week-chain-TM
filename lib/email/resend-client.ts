import type React from "react"
import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY || "re_placeholder_for_build"
export const resend = new Resend(resendApiKey)

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production" && typeof window === "undefined") {
  console.warn("⚠️ RESEND_API_KEY is not defined in environment variables. Email functionality will be limited.")
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
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ Cannot send email: RESEND_API_KEY is missing")
    return { error: { message: "RESEND_API_KEY is missing" }, data: null }
  }

  return await resend.emails.send({
    from,
    to,
    subject,
    react,
  })
}
