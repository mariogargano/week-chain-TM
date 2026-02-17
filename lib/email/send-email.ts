import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import type { EmailTemplateType, SendEmailRequest, SendEmailResponse, TemplateVariables } from "@/types/email"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "WEEK-CHAIN <soporte@week-chain.com>"
const REPLY_TO_EMAIL = "soporte@week-chain.com"

/**
 * Send email via Resend
 */
export async function sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
  try {
    // Validate request
    if (!request.to || !request.subject || !request.html) {
      return {
        success: false,
        error: "Missing required fields: to, subject, or html",
      }
    }

    // Check if unsubscribed
    const isUnsubscribed = await checkUnsubscribed(Array.isArray(request.to) ? request.to[0] : request.to)

    if (isUnsubscribed) {
      console.log(`[Email] Skipping - recipient unsubscribed: ${request.to}`)
      return {
        success: false,
        error: "Recipient has unsubscribed",
      }
    }

    // Send via Resend
    const response = await resend.emails.send({
      from: request.from || FROM_EMAIL,
      to: Array.isArray(request.to) ? request.to : [request.to],
      subject: request.subject,
      html: request.html,
      reply_to: request.reply_to || REPLY_TO_EMAIL,
      tags: request.template_type ? [{ name: "template_type", value: request.template_type }] : undefined,
    })

    if (response.error) {
      console.error("[Email] Resend error:", response.error)
      await logEmail({
        ...request,
        failed: true,
        error_message: response.error.message,
      })

      return {
        success: false,
        error: response.error.message,
      }
    }

    // Log success
    await logEmail({
      ...request,
      provider_message_id: response.data?.id,
    })

    console.log(`[Email] Sent successfully to ${request.to}. ID: ${response.data?.id}`)

    return {
      success: true,
      message_id: response.data?.id,
    }
  } catch (error: any) {
    console.error("[Email] Send error:", error)

    await logEmail({
      ...request,
      failed: true,
      error_message: error.message || "Unknown error",
    })

    return {
      success: false,
      error: error.message || "Failed to send email",
    }
  }
}

/**
 * Send automated email triggered by system event
 */
export async function sendAutomatedEmail(
  templateType: EmailTemplateType,
  recipientEmail: string,
  variables: TemplateVariables,
  metadata?: Record<string, any>,
): Promise<SendEmailResponse> {
  try {
    const supabase = await createClient()

    // Get active template
    const { data: template, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("type", templateType)
      .eq("is_active", true)
      .eq("status", "published")
      .single()

    if (error || !template) {
      console.error(`[Email] No active template for type: ${templateType}`)
      return {
        success: false,
        error: `No active template found for type: ${templateType}`,
      }
    }

    // Render template
    const { renderTemplate } = await import("./template-renderer")
    const renderedSubject = renderTemplate(template.subject, variables)
    const renderedBody = renderTemplate(template.body_html, variables)

    // Send
    return await sendEmail({
      to: recipientEmail,
      subject: renderedSubject,
      html: renderedBody,
      template_type: templateType,
      metadata: {
        ...metadata,
        template_id: template.id,
        automated: true,
      },
    })
  } catch (error: any) {
    console.error("[Email] Automated email error:", error)
    return {
      success: false,
      error: error.message || "Failed to send automated email",
    }
  }
}

/**
 * Check if email is unsubscribed
 */
async function checkUnsubscribed(email: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from("email_unsubscribes").select("id").eq("email", email).single()

    return !!data
  } catch {
    return false
  }
}

/**
 * Log email to database
 */
async function logEmail(
  data: SendEmailRequest & {
    provider_message_id?: string
    failed?: boolean
    error_message?: string
  },
): Promise<void> {
  try {
    const supabase = await createClient()

    const recipient = Array.isArray(data.to) ? data.to[0] : data.to

    await supabase.from("email_logs").insert({
      template_type: data.template_type || "SYSTEM_ALERT",
      recipient_email: recipient,
      subject: data.subject,
      body_html: data.html,
      provider: "resend",
      provider_message_id: data.provider_message_id,
      failed: data.failed || false,
      error_message: data.error_message,
      metadata: data.metadata || {},
    })
  } catch (error) {
    console.error("[Email] Failed to log email:", error)
  }
}
