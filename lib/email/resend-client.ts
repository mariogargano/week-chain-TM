import type React from "react"
import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined in environment variables")
}

export const resend = new Resend(process.env.RESEND_API_KEY)

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
  return await resend.emails.send({
    from,
    to,
    subject,
    react,
  })
}
