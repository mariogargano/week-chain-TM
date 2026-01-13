"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserRoleByEmail, ADMIN_EMAIL, type UserRole } from "@/lib/auth/roles"
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
          console.log("[v0] No authenticated user, redirecting to auth")
          router.push("/auth")
          return
        }

        const email = user.email.toLowerCase()
        setUserEmail(email)

        console.log("[v0] Checking authorization for:", email, "Required roles:", allowedRoles)

        if (email === ADMIN_EMAIL.toLowerCase() && allowedRoles.includes("admin")) {
          console.log("[v0] Admin email detected - granting access")

          const { error: upsertError } = await supabase.from("admin_users").upsert(
            {
              id: user.id,
              email: email,
              name: "Administrador WEEK-CHAIN",
              role: "super_admin",
              password_hash: "",
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            {
              onConflict: "email", // Use email as conflict key
              ignoreDuplicates: false, // Always update
            },
          )

          if (upsertError) {
            console.warn("[v0] Admin user upsert warning:", upsertError.message)
          }

          localStorage.setItem("user_role", "admin")
          localStorage.setItem("user_email", email)
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        const roleInfo = await getUserRoleByEmail(email)
        const role = roleInfo?.role || "user"

        console.log("[v0] User role:", role)

        localStorage.setItem("user_role", role)
        localStorage.setItem("user_email", email)

        if (!allowedRoles.includes(role)) {
          console.log("[v0] Access denied - insufficient permissions")
          setError(`No tienes permisos para acceder a esta página. Tu rol: ${role}`)
          setIsLoading(false)
          return
        }

        console.log("[v0] Access granted")
        setIsAuthorized(true)
        setIsLoading(false)
      } catch (err) {
        console.error("[v0] RoleGuard: Error during authorization:", err)
        setError("Error al verificar permisos. Por favor, intenta nuevamente.")
        setIsLoading(false)
      }
    }

    checkAuthorization()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state changed:", event)
      if (event === "SIGNED_OUT") {
        setIsAuthorized(false)
        localStorage.removeItem("user_role")
        localStorage.removeItem("user_email")
        router.push("/auth")
      } else if (event === "TOKEN_REFRESHED") {
        console.log("[v0] Token refreshed successfully - maintaining session")
      } else if (event === "SIGNED_IN") {
        console.log("[v0] User signed in - rechecking authorization")
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
              Iniciar Sesión
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
