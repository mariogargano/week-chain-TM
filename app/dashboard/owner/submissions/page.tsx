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
import { Building2, Search, ArrowLeft, Eye, Edit, CheckCircle, Clock, XCircle, FileText } from "lucide-react"

export default function OwnerSubmissionsPage() {
  return (
    <RoleGuard allowedRoles={["property_owner", "admin"]}>
      <OwnerSubmissionsContent />
    </RoleGuard>
  )
}

function OwnerSubmissionsContent() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("property_submissions")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "draft":
        return <FileText className="h-5 w-5 text-slate-400" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "draft":
        return "bg-slate-100 text-slate-700"
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/owner")}
              className="bg-white/90 backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Mis Propiedades
              </h1>
              <p className="text-slate-600">Gestiona todas tus propiedades enviadas</p>
            </div>
          </div>

          <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                        {getStatusIcon(submission.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{submission.property_name}</h3>
                            <p className="text-slate-600">{submission.property_location}</p>
                          </div>
                          <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500">Valor Total</p>
                            <p className="font-semibold text-slate-900">
                              ${submission.total_value_usd?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Semanas</p>
                            <p className="font-semibold text-slate-900">{submission.weeks_to_tokenize}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Precio/Semana</p>
                            <p className="font-semibold text-slate-900">
                              ${submission.price_per_week_usd?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Enviado</p>
                            <p className="font-semibold text-slate-900">
                              {submission.submitted_at
                                ? new Date(submission.submitted_at).toLocaleDateString("es-ES")
                                : "Borrador"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/owner/submissions/${submission.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                          {submission.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/owner/submissions/${submission.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          )}
                        </div>
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
                  <p className="text-slate-600 mb-4">
                    {searchTerm ? "No se encontraron propiedades" : "No has enviado propiedades aún"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
