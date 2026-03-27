import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send-email"

export const dynamic = "force-dynamic"

function getStripe() {
  const Stripe = require("stripe").default
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  })
}

/**
 * POST /api/pre-holder/webhook
 * Stripe webhook handler for the Pre-Holder campaign.
 * Listens to checkout.session.completed and marks the pre_holder as paid.
 *
 * NOTE: This webhook must be registered in the Stripe dashboard separately from
 * the main /api/webhooks/stripe endpoint, pointed to:
 *   https://week-chain.com/api/pre-holder/webhook
 * Use env var PRE_HOLDER_STRIPE_WEBHOOK_SECRET (falls back to STRIPE_WEBHOOK_SECRET).
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe()

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret =
    process.env.PRE_HOLDER_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error("[pre-holder/webhook] Signature verification failed:", err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const eventId = event.id

  // --- Idempotency check ---
  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("id, processed")
    .eq("source", "stripe_pre_holder")
    .eq("event_id", eventId)
    .maybeSingle()

  if (existingEvent?.processed) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Log the event
  await supabase.from("webhook_events").upsert(
    {
      source: "stripe_pre_holder",
      event_id: eventId,
      event_type: event.type,
      payload: event.data.object,
      processed: false,
    },
    { onConflict: "source,event_id" },
  )

  // --- Handle checkout.session.completed ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // Only process pre_holder flow
    if (session.metadata?.flow !== "pre_holder") {
      // Mark processed and bail — this webhook received a non-pre-holder event
      await supabase
        .from("webhook_events")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("source", "stripe_pre_holder")
        .eq("event_id", eventId)

      return NextResponse.json({ received: true, skipped: "not_pre_holder_flow" })
    }

    const preHolderId = session.metadata?.pre_holder_id
    const email = session.metadata?.email || session.customer_email
    const holderNumber = session.metadata?.holder_number
    const name = session.metadata?.name
    const stripeSessionId = session.id

    if (!preHolderId) {
      console.error("[pre-holder/webhook] Missing pre_holder_id in session metadata:", stripeSessionId)
    } else {
      try {
        // Mark as paid
        const { error: updateError } = await supabase
          .from("pre_holders")
          .update({
            status: "paid",
            stripe_session_id: stripeSessionId,
            paid_at: new Date().toISOString(),
          })
          .eq("id", preHolderId)

        if (updateError) {
          console.error("[pre-holder/webhook] Error updating pre_holder status:", updateError)
        } else {
          console.log(`[pre-holder/webhook] Pre-holder #${holderNumber} marked as paid (id: ${preHolderId})`)

          // --- Send confirmation email ---
          if (email) {
            await sendConfirmationEmail({ email, name, holderNumber })
          }
        }
      } catch (err: any) {
        console.error("[pre-holder/webhook] Error processing paid event:", err)
      }
    }
  }

  // Mark event as processed
  await supabase
    .from("webhook_events")
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq("source", "stripe_pre_holder")
    .eq("event_id", eventId)

  return NextResponse.json({ received: true })
}

async function sendConfirmationEmail({
  email,
  name,
  holderNumber,
}: {
  email: string
  name?: string
  holderNumber?: string
}) {
  const displayName = name || "Estimado Pre-Holder"
  const number = holderNumber || "?"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://week-chain.com"

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>¡Bienvenido a WEEK-CHAIN™!</title>
</head>
<body style="margin:0;padding:0;background-color:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0F172A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1E293B;border-radius:16px;overflow:hidden;border:1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1E3A5F 0%,#0EA5E9 100%);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 12px;font-size:13px;color:#94A3B8;letter-spacing:2px;text-transform:uppercase;">WEEK-CHAIN™</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#FFFFFF;line-height:1.2;">
                ¡Bienvenido al futuro<br/>de las vacaciones! 🎉
              </h1>
            </td>
          </tr>
          <!-- Gold badge -->
          <tr>
            <td style="padding:0 40px;margin-top:-20px;">
              <div style="background:linear-gradient(135deg,#D4AF37,#F5D060);border-radius:12px;padding:20px 24px;text-align:center;margin-top:-20px;position:relative;">
                <p style="margin:0 0 4px;font-size:13px;color:#78350F;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Tu número de Pre-Holder</p>
                <p style="margin:0;font-size:48px;font-weight:900;color:#1C1917;line-height:1;">#${number}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#78350F;">de 500 Early Adopters</p>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#CBD5E1;line-height:1.6;">
                Hola <strong style="color:#F8FAFC;">${displayName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#94A3B8;line-height:1.7;">
                Tu depósito de <strong style="color:#D4AF37;">$100 USD</strong> ha sido recibido exitosamente.
                Eres el Pre-Holder <strong style="color:#F8FAFC;">#${number}</strong> de WEEK-CHAIN™.
              </p>
              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background:#0F172A;border-radius:12px;border:1px solid #334155;margin-bottom:12px;">
                    <p style="margin:0 0 4px;font-size:14px;color:#D4AF37;font-weight:700;">🥇 Acceso Prioritario</p>
                    <p style="margin:0;font-size:13px;color:#94A3B8;">Serás de los primeros en usar la plataforma cuando abramos en Q2 2026.</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:#0F172A;border-radius:12px;border:1px solid #334155;">
                    <p style="margin:0 0 4px;font-size:14px;color:#D4AF37;font-weight:700;">💰 Descuento Exclusivo $200 USD</p>
                    <p style="margin:0;font-size:13px;color:#94A3B8;">Tu SVC de $6,500 te costará $6,300 al activarlo. Tu depósito también aplica.</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:#0F172A;border-radius:12px;border:1px solid #334155;">
                    <p style="margin:0 0 4px;font-size:14px;color:#D4AF37;font-weight:700;">🎟️ NFT Certificado de Reserva</p>
                    <p style="margin:0;font-size:13px;color:#94A3B8;">Recibirás tu token único en blockchain Solana con el número #${number} en las próximas 24 horas.</p>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <div style="text-align:center;margin-top:32px;">
                <a href="${appUrl}/pre-holder/success" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9,#06B6D4);color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                  Ver mi lugar reservado →
                </a>
              </div>
            </td>
          </tr>
          <!-- Refund notice -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#1E3A5F;border-radius:10px;padding:16px 20px;border-left:3px solid #0EA5E9;">
                <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;">
                  <strong style="color:#38BDF8;">💡 Recordatorio:</strong> Tu depósito es 100% reembolsable en cualquier momento,
                  sin preguntas. Si la plataforma no lanza antes del 31 de diciembre 2026,
                  recibirás tu dinero de vuelta automáticamente.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0F172A;padding:24px 40px;border-top:1px solid #1E293B;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#475569;">
                © 2026 MORISES LLC / WEEK-CHAIN™
              </p>
              <p style="margin:0;font-size:12px;color:#475569;">
                <a href="mailto:corporativo@morises.com" style="color:#38BDF8;text-decoration:none;">corporativo@morises.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  try {
    await sendEmail({
      to: email,
      subject: `¡Confirmado! Eres el Pre-Holder #${number} de WEEK-CHAIN™ 🎉`,
      html,
      template_type: "PAYMENT_CONFIRMATION" as any,
      metadata: {
        flow: "pre_holder",
        holder_number: number,
      },
    })
  } catch (emailErr) {
    // Non-fatal — log but don't fail the webhook
    console.error("[pre-holder/webhook] Failed to send confirmation email:", emailErr)
  }
}
