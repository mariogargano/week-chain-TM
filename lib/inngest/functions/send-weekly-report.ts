import { inngest } from "@/lib/inngest/client"
import { createClient } from "@supabase/supabase-js"

// Send weekly platform reports to admins
export const sendWeeklyReport = inngest.createFunction(
  { id: "send-weekly-report", name: "Send Weekly Report" },
  { cron: "0 8 * * 1" }, // Every Monday at 8 AM
  async ({ step }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get weekly stats
    const stats = await step.run("calculate-weekly-stats", async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [newUsers, newReservations, totalRevenue] = await Promise.all([
        supabase.from("users").select("id", { count: "exact" }).gte("created_at", weekAgo),
        supabase.from("reservations").select("id", { count: "exact" }).gte("created_at", weekAgo),
        supabase.from("fiat_payments").select("amount_mxn").gte("created_at", weekAgo),
      ])

      return {
        newUsers: newUsers.count || 0,
        newReservations: newReservations.count || 0,
        totalRevenue: totalRevenue.data?.reduce((sum, p) => sum + (p.amount_mxn || 0), 0) || 0,
      }
    })

    // Get admin emails
    const { data: admins } = await step.run("get-admin-emails", async () => {
      return await supabase.from("users").select("email").in("role", ["admin", "super_admin"])
    })

    // Send report
    await step.run("send-report-emails", async () => {
      console.log(`[v0] Sending weekly report to ${admins?.length} admins`)
      console.log(`[v0] Stats:`, stats)
      // TODO: Integrate with email service
    })

    return { message: "Weekly report sent", stats }
  },
)
