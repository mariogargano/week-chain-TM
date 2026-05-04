import { Resend } from "resend"
import { emailTemplates } from "./templates"
import { logger } from "@/lib/config/logger"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendKYCApprovedEmail({
  email,
  fullName,
  certificateNumber,
}: {
  email: string
  fullName: string
  certificateNumber: string
}) {
  try {
    const template = emailTemplates.kycApproved({
      fullName,
      certificateNumber,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/member`,
    })

    const result = await resend.emails.send({
      from: "noreply@week-chain.com",
      to: email,
      subject: template.subject,
      html: template.html,
    })

    logger.info("[email] KYC approved sent", { email, certificateNumber, resendId: result.id })
    return result
  } catch (error) {
    logger.error("[email] Failed to send KYC approved", { email, error })
    throw error
  }
}

export async function sendKYCRejectedEmail({
  email,
  fullName,
  reason,
}: {
  email: string
  fullName: string
  reason: string
}) {
  try {
    const template = emailTemplates.kycRejected({
      fullName,
      reason,
      retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/member/kyc`,
    })

    const result = await resend.emails.send({
      from: "noreply@week-chain.com",
      to: email,
      subject: template.subject,
      html: template.html,
    })

    logger.info("[email] KYC rejected sent", { email, resendId: result.id })
    return result
  } catch (error) {
    logger.error("[email] Failed to send KYC rejected", { email, error })
    throw error
  }
}

export async function sendEstanciaConfirmedEmail({
  email,
  fullName,
  certificateNumber,
  propertyName,
  checkIn,
  checkOut,
  reservationNumber,
}: {
  email: string
  fullName: string
  certificateNumber: string
  propertyName: string
  checkIn: string
  checkOut: string
  reservationNumber: string
}) {
  try {
    const template = emailTemplates.estanciaConfirmed({
      fullName,
      certificateNumber,
      propertyName,
      checkIn,
      checkOut,
      reservationNumber,
    })

    const result = await resend.emails.send({
      from: "noreply@week-chain.com",
      to: email,
      subject: template.subject,
      html: template.html,
    })

    logger.info("[email] Estancia confirmed sent", { email, reservationNumber, resendId: result.id })
    return result
  } catch (error) {
    logger.error("[email] Failed to send estancia confirmed", { email, error })
    throw error
  }
}

export async function sendCommissionPaidEmail({
  email,
  agentName,
  amount,
  currency,
  periodStart,
  periodEnd,
}: {
  email: string
  agentName: string
  amount: number
  currency: string
  periodStart: string
  periodEnd: string
}) {
  try {
    const template = emailTemplates.commissionPaid({
      agentName,
      amount,
      currency,
      periodStart,
      periodEnd,
    })

    const result = await resend.emails.send({
      from: "noreply@week-chain.com",
      to: email,
      subject: template.subject,
      html: template.html,
    })

    logger.info("[email] Commission paid sent", { email, amount, resendId: result.id })
    return result
  } catch (error) {
    logger.error("[email] Failed to send commission paid", { email, error })
    throw error
  }
}
