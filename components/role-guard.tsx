"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ADMIN_EMAIL, type UserRole } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/client"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user?.email) {
          router.push("/auth")
          return
        }

        const email = user.email.toLowerCase()
        setUserEmail(email)

        // Admin email always gets access to admin pages
        if (email === ADMIN_EMAIL.toLowerCase() && allowedRoles.includes("admin")) {
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        // Fetch role from users table (primary source of truth)
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        const role = (userData?.role || "user") as UserRole

        // Admin/super_admin roles get access to admin pages
        if (
          (role === "admin" || role === "super_admin") &&
          allowedRoles.includes("admin")
        ) {
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        // Check if user's role is in the allowed roles list
        if (!allowedRoles.includes(role)) {
          setError(`No tienes permisos para acceder a esta pagina. Tu rol: ${role}`)
          setIsLoading(false)
          return
        }

        setIsAuthorized(true)
        setIsLoading(false)
      } catch {
        setError("Error al verificar permisos. Por favor, intenta nuevamente.")
        setIsLoading(false)
      }
    }

    checkAuthorization()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setIsAuthorized(false)
        router.push("/auth")
      } else if (event === "SIGNED_IN") {
        checkAuthorization()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [allowedRoles, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center space-y-4 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
          <p className="text-white font-medium">Verificando acceso...</p>
          {userEmail && <p className="text-sm text-blue-200">{userEmail}</p>}
          <p className="text-xs text-blue-300">Autenticando de forma segura</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Card className="max-w-md border-red-400 bg-red-900/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-200">
              <AlertCircle className="h-5 w-5" />
              Acceso Denegado
            </CardTitle>
            <CardDescription className="text-red-300">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-indigo-500"
            >
              Ir al Dashboard
            </Button>
            <Button
              onClick={() => router.push("/auth")}
              variant="outline"
              className="w-full border-blue-400/30 text-blue-200 hover:bg-white/10"
            >
              Iniciar Sesion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
