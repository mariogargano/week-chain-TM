"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, MapPin, Home, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NotaryReviewDetailPage() {
  return (
    <RoleGuard allowedRoles={["notaria", "admin"]}>
      <NotaryReviewDetailContent />
    </RoleGuard>
  )
}

function NotaryReviewDetailContent() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<any>(null)
  const [comments, setComments] = useState("")
  const [decision, setDecision] = useState<"approved" | "rejected" | "needs_changes" | null>(null)

  useEffect(() => {
    fetchSubmission()
  }, [])

  const fetchSubmission = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("property_submissions")
      .select("*, users!property_submissions_owner_id_fkey(full_name, email, wallet_address)")
      .eq("id", params.id)
      .single()

    if (!error && data) {
      setSubmission(data)
      setComments(data.notary_comments || "")
    }
    setLoading(false)
  }

  const submitReview = async () => {
    if (!decision) {
      toast({ title: "Error", description: "Debes seleccionar una decisión", variant: "destructive" })
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const updateData: any = {
      notary_reviewed_by: user?.id,
      notary_reviewed_at: new Date().toISOString(),
      notary_status: decision,
      notary_comments: comments,
    }

    // If approved by notary, move to admin review
    if (decision === "approved") {
      updateData.status = "admin_review"
    } else if (decision === "rejected") {
      updateData.status = "rejected"
      updateData.rejection_reason = comments
    }

    const { error } = await supabase.from("property_submissions").update(updateData).eq("id", params.id)

    setSubmitting(false)

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar la revisión", variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Revisión guardada correctamente" })
      router.push("/dashboard/notaria/property-reviews")
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={true} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <p className="text-slate-600">Cargando propiedad...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/notaria/property-reviews")}
              className="bg-white/90 backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Revisión Legal
              </h1>
              <p className="text-slate-600">Verifica la documentación de la propiedad</p>
            </div>
            {submission?.notary_reviewed_at && (
              <Badge
                className={
                  submission.notary_status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }
              >
                {submission.notary_status === "approved" ? "Aprobado" : "Rechazado"}
              </Badge>
            )}
          </div>

          {/* Property Details */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle>Detalles de la Propiedad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{submission?.property_name}</h3>
                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    {submission?.property_location}
                  </div>
                  <p className="text-slate-700">{submission?.property_description}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-slate-500">Tipo</p>
                      <p className="font-semibold capitalize">{submission?.property_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-slate-500">Valor Total</p>
                      <p className="font-semibold">${submission?.total_value_usd?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-slate-500">Área</p>
                  <p className="font-semibold">{submission?.total_area_sqm} m²</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Habitaciones</p>
                  <p className="font-semibold">{submission?.bedrooms}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Baños</p>
                  <p className="font-semibold">{submission?.bathrooms}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Semanas</p>
                  <p className="font-semibold">{submission?.weeks_to_tokenize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Info */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle>Información del Propietario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Nombre</p>
                  <p className="font-semibold">{submission?.users?.full_name || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-semibold">{submission?.users?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle>Documentos Legales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-semibold">Contrato Firmado</p>
                    <p className="text-sm text-slate-500">
                      {submission?.contract_signed_by_owner ? "Firmado digitalmente" : "Pendiente de firma"}
                    </p>
                  </div>
                </div>
                {submission?.contract_signed_by_owner && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                )}
              </div>

              {submission?.owner_signature_data && (
                <div className="border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">Firma Digital del Propietario</p>
                  <img
                    src={submission.owner_signature_data || "/placeholder.svg"}
                    alt="Firma"
                    className="h-24 border border-slate-200 rounded bg-white"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Section */}
          {!submission?.notary_reviewed_at && (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle>Decisión de Revisión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Comentarios</Label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Agrega comentarios sobre la revisión..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Decisión</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={decision === "approved" ? "default" : "outline"}
                      onClick={() => setDecision("approved")}
                      className={
                        decision === "approved"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "border-green-500 text-green-700 hover:bg-green-50"
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      variant={decision === "needs_changes" ? "default" : "outline"}
                      onClick={() => setDecision("needs_changes")}
                      className={
                        decision === "needs_changes"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      }
                    >
                      Requiere Cambios
                    </Button>
                    <Button
                      variant={decision === "rejected" ? "default" : "outline"}
                      onClick={() => setDecision("rejected")}
                      className={
                        decision === "rejected"
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "border-red-500 text-red-700 hover:bg-red-50"
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={submitReview}
                  disabled={!decision || submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {submitting ? "Guardando..." : "Guardar Revisión"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Previous Review */}
          {submission?.notary_reviewed_at && (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle>Revisión Completada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Fecha de Revisión</p>
                  <p className="font-semibold">{new Date(submission.notary_reviewed_at).toLocaleString("es-ES")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Decisión</p>
                  <Badge
                    className={
                      submission.notary_status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {submission.notary_status === "approved" ? "Aprobado" : "Rechazado"}
                  </Badge>
                </div>
                {submission.notary_comments && (
                  <div>
                    <p className="text-sm text-slate-500">Comentarios</p>
                    <p className="text-slate-700">{submission.notary_comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
