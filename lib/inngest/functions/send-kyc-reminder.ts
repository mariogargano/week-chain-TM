import { inngest } from "@/lib/inngest/client"
import { createClient } from "@supabase/supabase-js"

// Send KYC reminder to users who haven't completed verification
export const sendKYCReminder = inngest.createFunction(
  { id: "send-kyc-reminder", name: "Send KYC Reminder" },
  { cron: "0 9 * * *" }, // Daily at 9 AM
  async ({ step }) => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get users who haven't completed KYC
    const { data: users } = await step.run("get-pending-kyc-users", async () => {
      return await supabase
        .from("users")
        .select("id, email, full_name")
        .eq("kyc_status", "pending")
        .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    })

    if (!users || users.length === 0) {
      return { message: "No pending KYC users found" }
    }

    // Send reminder emails
    const results = await step.run("send-reminders", async () => {
      return Promise.all(
        users.map(async (user) => {
          // TODO: Integrate with email service (Resend)
          console.log(`[v0] Sending KYC reminder to ${user.email}`)
          return { userId: user.id, sent: true }
        }),
      )
    })

    return { message: `Sent ${results.length} KYC reminders` }
  },
)
