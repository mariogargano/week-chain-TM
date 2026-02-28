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
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user?.email) {
          router.push("/auth")
          return
        }

        const dashboardUrl = await getCurrentUserDashboardUrl()
        router.replace(dashboardUrl)
      } catch {
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
        <div className="text-center space-y-4 max-w-md p-8 bg-card rounded-lg shadow-lg border border-border">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-foreground font-medium">{error}</p>
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-sky-500 mx-auto" />
        <p className="text-foreground font-medium">Cargando tu dashboard...</p>
        <p className="text-sm text-muted-foreground">Redirigiendo segun tu rol</p>
      </div>
    </div>
  )
}
