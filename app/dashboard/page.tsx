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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <p className="text-slate-800 font-medium">{error}</p>
          <p className="text-sm text-slate-500">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mx-auto" />
        <p className="text-slate-800 font-medium">Cargando tu dashboard...</p>
        <p className="text-sm text-slate-500">Redirigiendo segun tu rol</p>
      </div>
    </div>
  )
}
