"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertCircle, Clock, CheckCircle2, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type KYCLevel = "none" | "basic" | "verified" | "full"

interface RequireKYCLevelProps {
  children: React.ReactNode
  requiredLevel: KYCLevel
  redirectTo?: string
}

interface KYCStatus {
  level: KYCLevel
  verification_status: "pending" | "in_review" | "verified" | "rejected"
  profile_completed: boolean
  has_documents: boolean
  missing_fields: string[]
}

export function RequireKYCLevel({
  children,
  requiredLevel,
  redirectTo = "/dashboard/member/profile",
}: RequireKYCLevelProps) {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    checkKYCStatus()
  }, [])

  const checkKYCStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error || !profile) {
        setLoading(false)
        return
      }

      // Determine KYC level
      const status: KYCStatus = {
        level: "none",
        verification_status: profile.verification_status || "pending",
        profile_completed: profile.profile_completed || false,
        has_documents: !!(profile.id_front_url && profile.selfie_url),
        missing_fields: [],
      }

      // Check profile completeness
      const requiredBasicFields = ["full_name", "email", "phone"]
      const requiredVerifiedFields = ["date_of_birth", "address_street", "address_city", "address_country"]
      const requiredFullFields = ["id_type", "id_number", "id_front_url", "id_back_url", "selfie_url"]

      const missingBasic = requiredBasicFields.filter((field) => !profile[field])
      const missingVerified = requiredVerifiedFields.filter((field) => !profile[field])
      const missingFull = requiredFullFields.filter((field) => !profile[field])

      // Assign level
      if (profile.verification_status === "verified" && missingFull.length === 0) {
        status.level = "full"
      } else if (missingVerified.length === 0 && status.has_documents) {
        status.level = "verified"
      } else if (missingBasic.length === 0) {
        status.level = "basic"
      }

      status.missing_fields = [...missingBasic, ...missingVerified, ...missingFull].filter(
        (v, i, a) => a.indexOf(v) === i,
      )

      setKycStatus(status)
      setLoading(false)
    } catch (error) {
      console.error("Error checking KYC status:", error)
      setLoading(false)
    }
  }

  const getKYCProgress = (level: KYCLevel): number => {
    switch (level) {
      case "none":
        return 0
      case "basic":
        return 33
      case "verified":
        return 66
      case "full":
        return 100
      default:
        return 0
    }
  }

  const canAccess = (currentLevel: KYCLevel, required: KYCLevel): boolean => {
    const levels = ["none", "basic", "verified", "full"]
    return levels.indexOf(currentLevel) >= levels.indexOf(required)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Verificando nivel de KYC...</p>
        </div>
      </div>
    )
  }

  if (!kycStatus || !canAccess(kycStatus.level, requiredLevel)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Verificación de Identidad Requerida</CardTitle>
            <CardDescription>
              Para acceder a esta sección necesitas completar tu perfil y verificar tu identidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Nivel actual: <strong className="text-slate-900 capitalize">{kycStatus?.level}</strong>
                </span>
                <span className="text-slate-600">
                  Nivel requerido: <strong className="text-slate-900 capitalize">{requiredLevel}</strong>
                </span>
              </div>
              <Progress value={getKYCProgress(kycStatus?.level || "none")} className="h-3" />
            </div>

            {/* Status Alert */}
            <Alert
              className={
                kycStatus?.verification_status === "verified"
                  ? "border-green-200 bg-green-50"
                  : kycStatus?.verification_status === "in_review"
                    ? "border-yellow-200 bg-yellow-50"
                    : kycStatus?.verification_status === "rejected"
                      ? "border-red-200 bg-red-50"
                      : "border-blue-200 bg-blue-50"
              }
            >
              {kycStatus?.verification_status === "verified" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {kycStatus?.verification_status === "in_review" && <Clock className="h-4 w-4 text-yellow-600" />}
              {kycStatus?.verification_status === "rejected" && <AlertCircle className="h-4 w-4 text-red-600" />}
              {kycStatus?.verification_status === "pending" && <FileText className="h-4 w-4 text-blue-600" />}

              <AlertTitle className="capitalize">
                {kycStatus?.verification_status === "in_review" ? "En Revisión" : kycStatus?.verification_status}
              </AlertTitle>
              <AlertDescription>
                {kycStatus?.verification_status === "verified" && "Tu identidad ha sido verificada correctamente."}
                {kycStatus?.verification_status === "in_review" &&
                  "Tus documentos están siendo revisados por nuestro equipo."}
                {kycStatus?.verification_status === "rejected" &&
                  "Tu verificación fue rechazada. Por favor actualiza tus documentos."}
                {kycStatus?.verification_status === "pending" && "Completa tu perfil y sube los documentos requeridos."}
              </AlertDescription>
            </Alert>

            {/* Missing Fields */}
            {kycStatus?.missing_fields && kycStatus.missing_fields.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Campos faltantes
                </h4>
                <ul className="text-sm text-slate-600 space-y-1 ml-6 list-disc">
                  {kycStatus.missing_fields.slice(0, 5).map((field) => (
                    <li key={field} className="capitalize">
                      {field.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(redirectTo)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Completar Perfil
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
