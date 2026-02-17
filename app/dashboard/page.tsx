"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { getCurrentUserDashboardUrl } from "@/lib/auth/redirect"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        console.log("[v0] Dashboard router: Starting redirect check")
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("[v0] Dashboard router: Session exists:", !!session)
        console.log("[v0] Dashboard router: User email:", session?.user?.email)

        if (!session?.user?.email) {
          console.log("[v0] Dashboard router: No session, redirecting to /auth")
          router.push("/auth")
          return
        }

        const dashboardUrl = await getCurrentUserDashboardUrl()
        console.log("[v0] Dashboard router: Redirecting to", dashboardUrl)
        router.replace(dashboardUrl)
      } catch (error) {
        console.error("[v0] Dashboard router: Error during redirect:", error)
        setError("Error al cargar el dashboard. Intenta nuevamente.")
        setTimeout(() => {
          router.replace("/dashboard/member")
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    checkAndRedirect()
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#C7CEEA]/30 via-[#FFB7B2]/30 to-[#B5EAD7]/30">
        <div className="text-center space-y-4 max-w-md p-8 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-slate-900 font-medium">{error}</p>
          <p className="text-sm text-slate-500">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#C7CEEA]/30 via-[#FFB7B2]/30 to-[#B5EAD7]/30">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#FF9AA2] mx-auto" />
        <p className="text-slate-700 font-medium">Cargando tu dashboard...</p>
        <p className="text-sm text-slate-500">Redirigiendo según tu rol</p>
      </div>
    </div>
  )
}
