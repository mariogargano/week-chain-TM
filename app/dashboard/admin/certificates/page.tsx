import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CertificatesClient } from "./client"

export const dynamic = "force-dynamic"

export default async function AdminCertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()

  if (userData?.role !== "admin" && userData?.role !== "super_admin") {
    redirect("/dashboard/member")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Certificados SVC</h1>
        <p className="text-muted-foreground">Gestiona certificados activos, transferencias y suspensiones</p>
      </div>
      <CertificatesClient />
    </div>
  )
}
