import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EstanciasClient } from "./client"

export const dynamic = "force-dynamic"

export default async function EstanciasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis Estancias</h1>
        <p className="text-muted-foreground">Solicita y gestiona tus reservas de vacaciones</p>
      </div>
      <EstanciasClient />
    </div>
  )
}
