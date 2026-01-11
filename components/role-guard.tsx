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
  const router = useRouter()

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const supabase = createClient()

        const {
          data: { session },
        } = await supabase.auth.getSession()

        // No session = redirect to auth
        if (!session?.user?.email) {
          router.push("/auth")
          return
        }

        const email = session.user.email

        // Check if admin email
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          if (allowedRoles.includes("admin")) {
            localStorage.setItem("user_role", "admin")
            localStorage.setItem("user_email", email)
            setIsAuthorized(true)
            setIsLoading(false)
            return
          }
        }

        // Get role from email
        const roleInfo = await getUserRoleByEmail(email)
        const role = roleInfo?.role || "user"

        localStorage.setItem("user_role", role)
        localStorage.setItem("user_email", email)

        if (!allowedRoles.includes(role)) {
          setError(`No tienes permisos para acceder a esta página. Tu rol: ${role}`)
          setIsLoading(false)
          return
        }

        setIsAuthorized(true)
        setIsLoading(false)
      } catch (err) {
        console.error("RoleGuard: Error during authorization:", err)
        setError("Error al verificar permisos. Por favor, intenta nuevamente.")
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [allowedRoles, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#C7CEEA]/30 via-[#FFB7B2]/30 to-[#B5EAD7]/30">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#FF9AA2] mx-auto" />
          <p className="text-slate-700 font-medium">Verificando acceso...</p>
          <p className="text-sm text-slate-500">Esto no debería tomar más de unos segundos</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-[#C7CEEA]/30 via-[#FFB7B2]/30 to-[#B5EAD7]/30">
        <Card className="max-w-md border-red-200 bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Acceso Denegado
            </CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2]"
            >
              Ir al Dashboard
            </Button>
            <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
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
