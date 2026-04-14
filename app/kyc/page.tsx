"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PersonaKYCWidget } from "@/components/persona-kyc-widget";

export default function KYCPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase?.auth?.getUser()

    if (!user) {
      toast?.error("Inicia sesion para completar la verificacion")
      router?.push("/auth?redirect=/kyc")
      return
    }

    setUser(user)

    // Query by user_id (primary key), not email
    const { data: kycData } = await supabase?.from("kyc_users")?.select("*")?.eq("user_id", user?.id)?.single()

    if (kycData) {
      setKycStatus(kycData?.status)
      if (kycData?.status === "approved") {
        toast?.success("Tu verificacion ya fue aprobada.")
      }
    }

    setLoading(false)
  }

  const handleComplete = () => {
    toast?.success("Verificacion enviada. Revisaremos tu solicitud en breve.")
    setKycStatus("pending")
  }

  const handleError = () => {
    toast?.error("Ocurrio un error durante la verificacion. Intenta de nuevo.")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-sky-400 animate-pulse" />
          <p className="text-slate-400">Cargando verificacion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 px-4 py-2 rounded-full mb-4">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Verificacion Segura</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white text-balance">Verificacion de Identidad (KYC)</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto text-pretty">
            Completa tu verificacion de identidad para poder adquirir certificados digitales de uso vacacional en WEEK-CHAIN.
          </p>
        </div>

        {kycStatus === "approved" && (
          <Card className="mb-8 border-green-500/30 bg-green-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-100">Verificacion Aprobada</h3>
                  <p className="text-sm text-green-300">
                    Tu identidad ha sido verificada. Tienes acceso completo para adquirir certificados.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router?.push("/dashboard/member")}
                className="mt-4 bg-sky-500 hover:bg-sky-600 text-white"
              >
                Ir a mi Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {kycStatus === "pending" && (
          <Card className="mb-8 border-yellow-500/30 bg-yellow-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-yellow-100">Verificacion en Proceso</h3>
                  <p className="text-sm text-yellow-300">
                    Estamos revisando tus documentos. Esto generalmente toma 24-48 horas. Te enviaremos un correo cuando se complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kycStatus === "rejected" && (
          <Card className="mb-8 border-red-500/30 bg-red-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-100">Verificacion Requiere Atencion</h3>
                  <p className="text-sm text-red-300">
                    No pudimos verificar tu identidad. Por favor, envia nuevos documentos a continuacion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(!kycStatus || kycStatus === "rejected") && user && (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Completa tu Verificacion</CardTitle>
              <CardDescription className="text-slate-400">
                Sigue los pasos para verificar tu identidad. Necesitaras una identificacion oficial vigente y una selfie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonaKYCWidget
                userId={user?.id}
                userEmail={user?.email}
                onComplete={handleComplete}
                onError={handleError}
              />
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router?.back()}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <p className="text-sm text-slate-500">
            <Shield className="inline h-4 w-4 mr-1" />
            Tus datos estan encriptados y almacenados de forma segura. Cumplimos con regulaciones internacionales de proteccion de datos.
          </p>
        </div>
      </div>
    </div>
  );
}
