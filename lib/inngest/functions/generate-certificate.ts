import { inngest } from "@/lib/inngest/client"
import { createClient } from "@supabase/supabase-js"

// Generate digital certificate for verified reservation
export const generateCertificate = inngest.createFunction(
  { id: "generate-certificate", name: "Generate Certificate" },
  { event: "certificate/generate" },
  async ({ event, step }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { reservationId, userId } = event.data

    // Get reservation details
    const reservation = await step.run("get-reservation", async () => {
      const { data } = await supabase
        .from("reservations")
        .select("*, weeks(*), properties(*)")
        .eq("id", reservationId)
        .single()
      return data
    })

    if (!reservation) {
      throw new Error("Reservation not found")
    }

    // Generate certificate ID
    const certificateId = await step.run("generate-certificate-id", async () => {
      const timestamp = Date.now()
      return `WEEK-${reservation.property_id}-${timestamp}`
    })

    // Update reservation with certificate info
    await step.run("update-certificate-status", async () => {
      return await supabase
        .from("reservations")
        .update({
          certificate_issued: true,
          certificate_id: certificateId,
          certificate_issued_at: new Date().toISOString(),
        })
        .eq("id", reservationId)
    })

    // Send certificate email
    await step.run("send-certificate-email", async () => {
      // TODO: Integrate with email service
      console.log(`[v0] Sending certificate ${certificateId} to user ${userId}`)
    })

    return { message: "Certificate generated", certificateId }
  },
)
