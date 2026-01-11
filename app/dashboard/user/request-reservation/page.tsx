import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RequestReservationClient } from "./client"

export const dynamic = "force-dynamic"

export default async function RequestReservationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  const { data: certificates } = await supabase.from("user_certificates").select("*").eq("user_id", user.id)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RequestReservationClient certificates={certificates || []} />
    </Suspense>
  )
}
