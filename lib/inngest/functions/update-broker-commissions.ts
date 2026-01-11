import { inngest } from "@/lib/inngest/client"
import { createClient } from "@supabase/supabase-js"

// Calculate and update broker commissions
export const updateBrokerCommissions = inngest.createFunction(
  { id: "update-broker-commissions", name: "Update Broker Commissions" },
  { event: "reservation/confirmed" },
  async ({ event, step }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { reservationId, brokerId, totalAmount } = event.data

    // Get broker info and level
    const broker = await step.run("get-broker-info", async () => {
      const { data } = await supabase.from("users").select("id, broker_level, referred_by").eq("id", brokerId).single()
      return data
    })

    if (!broker) {
      return { message: "Broker not found" }
    }

    // Calculate direct commission
    const directCommission = await step.run("calculate-direct-commission", async () => {
      const rates = { bronze: 0.03, silver: 0.05, gold: 0.07, platinum: 0.1, diamond: 0.15 }
      const rate = rates[broker.broker_level as keyof typeof rates] || 0.03
      return totalAmount * rate
    })

    // Save direct commission
    await step.run("save-direct-commission", async () => {
      return await supabase.from("broker_commissions").insert({
        broker_id: brokerId,
        reservation_id: reservationId,
        commission_amount: directCommission,
        commission_type: "direct",
        level: broker.broker_level,
      })
    })

    // Calculate indirect commission for referrer
    if (broker.referred_by) {
      await step.run("save-indirect-commission", async () => {
        const indirectCommission = directCommission * 0.2 // 20% of direct commission
        return await supabase.from("broker_commissions").insert({
          broker_id: broker.referred_by,
          reservation_id: reservationId,
          commission_amount: indirectCommission,
          commission_type: "indirect",
        })
      })
    }

    return { message: "Commissions updated", directCommission }
  },
)
