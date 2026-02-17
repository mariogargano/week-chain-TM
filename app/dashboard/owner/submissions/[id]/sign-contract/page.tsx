"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { FileText, CheckCircle, Download, Pen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import SignatureCanvas from "react-signature-canvas"

export default function SignContractPage() {
  return (
    <RoleGuard allowedRoles={["property_owner", "admin"]}>
      <SignContractContent />
    </RoleGuard>
  )
}

function SignContractContent() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const signatureRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [submission, setSubmission] = useState<any>(null)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    fetchSubmission()
  }, [])

  const fetchSubmission = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("property_submissions").select("*").eq("id", params.id).single()

    if (!error && data) {
      setSubmission(data)
    }
    setLoading(false)
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
  }

  const signContract = async () => {
    if (!agreed) {
      toast({ title: "Error", description: "Debes aceptar los términos", variant: "destructive" })
      return
    }

    if (signatureRef.current?.isEmpty()) {
      toast({ title: "Error", description: "Debes firmar el contrato", variant: "destructive" })
      return
    }

    setSigning(true)
    const supabase = createClient()
    const signatureData = signatureRef.current?.toDataURL()

    const { error } = await supabase
      .from("property_submissions")
      .update({
        contract_signed_by_owner: true,
        contract_signed_at: new Date().toISOString(),
        owner_signature_data: signatureData,
      })
      .eq("id", params.id)

    setSigning(false)

    if (error) {
      toast({ title: "Error", description: "No se pudo firmar el contrato", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Contrato firmado correctamente" })
      router.push("/dashboard/owner")
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <p className="text-slate-600">Cargando contrato...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Firma del Contrato
            </h1>
            <p className="text-slate-600 mt-2">Revisa y firma el contrato de listado de propiedad</p>
          </div>

          {/* Contract Preview */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle>Contrato de Listado de Propiedad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-lg mb-4">ACUERDO DE LISTADO DE PROPIEDAD</h3>

                <p className="mb-4">
                  Este acuerdo se celebra entre <strong>{submission?.property_name}</strong> (en adelante "el
                  Propietario") y Week-Chain Platform (en adelante "la Plataforma").
                </p>

                <h4 className="font-semibold mt-4 mb-2">1. OBJETO DEL CONTRATO</h4>
                <p className="mb-4">
                  El Propietario autoriza a la Plataforma a listar, promocionar y vender tokens NFT que representan
                  semanas de uso de la propiedad ubicada en <strong>{submission?.property_location}</strong>.
                </p>

                <h4 className="font-semibold mt-4 mb-2">2. DETALLES DE LA PROPIEDAD</h4>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Valor Total: ${submission?.total_value_usd?.toLocaleString()} USD</li>
                  <li>Semanas a Tokenizar: {submission?.weeks_to_tokenize}</li>
                  <li>Precio por Semana: ${submission?.price_per_week_usd?.toLocaleString()} USD</li>
                </ul>

                <h4 className="font-semibold mt-4 mb-2">3. COMISIONES Y PAGOS</h4>
                <p className="mb-4">
                  La Plataforma retendrá una comisión del 10% sobre cada venta de semana. El Propietario recibirá el 90%
                  del precio de venta en su cuenta bancaria registrada dentro de 5 días hábiles posteriores a la venta.
                </p>

                <h4 className="font-semibold mt-4 mb-2">4. OBLIGACIONES DEL PROPIETARIO</h4>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Mantener la propiedad en condiciones óptimas</li>
                  <li>Respetar las reservas de los compradores de NFTs</li>
                  <li>Proporcionar acceso a la propiedad según lo acordado</li>
                  <li>Mantener todos los permisos y licencias vigentes</li>
                </ul>

                <h4 className="font-semibold mt-4 mb-2">5. DURACIÓN Y TERMINACIÓN</h4>
                <p className="mb-4">
                  Este contrato tiene una duración de {submission?.property_duration_years || 10} años desde la fecha de
                  firma, renovable automáticamente salvo notificación contraria con 90 días de anticipación.
                </p>

                <h4 className="font-semibold mt-4 mb-2">6. LEY APLICABLE</h4>
                <p className="mb-4">
                  Este contrato se rige por las leyes de México y cualquier disputa será resuelta en los tribunales
                  competentes.
                </p>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Descargar Contrato Completo (PDF)
              </Button>
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle>Firma Digital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                  <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                    He leído y acepto todos los términos y condiciones del contrato de listado de propiedad. Entiendo
                    que esta firma digital tiene la misma validez legal que una firma manuscrita.
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Firma aquí</Label>
                <div className="border-2 border-slate-300 rounded-lg bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-48 cursor-crosshair",
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearSignature}>
                    <Pen className="h-4 w-4 mr-2" />
                    Limpiar Firma
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push("/dashboard/owner")} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={signContract}
                  disabled={!agreed || signing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {signing ? "Firmando..." : "Firmar y Enviar"}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function Label({ children, ...props }: any) {
  return (
    <label className="text-sm font-medium text-slate-700" {...props}>
      {children}
    </label>
  )
}
