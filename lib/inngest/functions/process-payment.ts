import { inngest } from "@/lib/inngest/client"
import { createClient } from "@supabase/supabase-js"

// Process pending payments and update reservation status
export const processPayment = inngest.createFunction(
  { id: "process-payment", name: "Process Payment" },
  { event: "payment/created" },
  async ({ event, step }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { paymentId, userId, amount, reservationId } = event.data

    // Verify payment with payment provider
    const paymentStatus = await step.run("verify-payment", async () => {
      // TODO: Integrate with Conekta/Stripe API
      console.log(`[v0] Verifying payment ${paymentId}`)
      return { status: "completed", transactionId: paymentId }
    })

    // Update reservation status
    await step.run("update-reservation", async () => {
      return await supabase
        .from("reservations")
        .update({
          status: "confirmed",
          payment_status: "paid",
        })
        .eq("id", reservationId)
    })

    // Generate certificate
    await step.run("trigger-certificate-generation", async () => {
      await inngest.send({
        name: "certificate/generate",
        data: { reservationId, userId },
      })
    })

    return { message: "Payment processed successfully", paymentStatus }
  },
)
