"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Search, Eye, Clock, CheckCircle, XCircle } from "lucide-react"

export default function NotaryPropertyReviewsPage() {
  return (
    <RoleGuard allowedRoles={["notaria", "admin"]}>
      <NotaryPropertyReviewsContent />
    </RoleGuard>
  )
}

function NotaryPropertyReviewsContent() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("pending")

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  const fetchSubmissions = async () => {
    const supabase = createClient()
    let query = supabase
      .from("property_submissions")
      .select("*, users!property_submissions_owner_id_fkey(full_name, email)")
      .in("status", ["submitted", "notary_review", "admin_review"])
      .order("submitted_at", { ascending: false })

    if (filter === "pending") {
      query = query.is("notary_reviewed_at", null)
    } else if (filter === "reviewed") {
      query = query.not("notary_reviewed_at", "is", null)
    }

    const { data, error } = await query

    if (!error && data) {
      setSubmissions(data)
    }
    setLoading(false)
  }

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.property_location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (submission: any) => {
    if (submission.notary_reviewed_at) {
      return submission.notary_status === "approved" ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )
    }
    return <Clock className="h-5 w-5 text-yellow-500" />
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Revisión de Propiedades
            </h1>
            <p className="text-slate-600 mt-2">Verifica la documentación legal de las propiedades</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
            >
              Todas
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className={filter === "pending" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
            >
              Pendientes
            </Button>
            <Button
              variant={filter === "reviewed" ? "default" : "outline"}
              onClick={() => setFilter("reviewed")}
              className={filter === "reviewed" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
            >
              Revisadas
            </Button>
          </div>

          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-slate-600">Cargando propiedades...</p>
              </CardContent>
            </Card>
          ) : filteredSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredSubmissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(submission)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{submission.property_name}</h3>
                            <p className="text-slate-600">{submission.property_location}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              Propietario: {submission.users?.full_name || submission.users?.email}
                            </p>
                          </div>
                          <Badge
                            className={
                              submission.notary_reviewed_at
                                ? submission.notary_status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {submission.notary_reviewed_at
                              ? submission.notary_status === "approved"
                                ? "Aprobado"
                                : "Rechazado"
                              : "Pendiente"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500">Valor Total</p>
                            <p className="font-semibold text-slate-900">
                              ${submission.total_value_usd?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Tipo</p>
                            <p className="font-semibold text-slate-900 capitalize">{submission.property_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Enviado</p>
                            <p className="font-semibold text-slate-900">
                              {new Date(submission.submitted_at).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Contrato</p>
                            <p className="font-semibold text-slate-900">
                              {submission.contract_signed_by_owner ? "Firmado" : "Sin firmar"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/notaria/property-reviews/${submission.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar Propiedad
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No hay propiedades para revisar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
