"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RoleGuard } from "@/components/role-guard";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";


export default function AdminPropertyApprovalsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminPropertyApprovalsContent />
    </RoleGuard>
  )
}

function AdminPropertyApprovalsContent() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending")

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  const fetchSubmissions = async () => {
    const supabase = createClient()
    let query = supabase
      .from("property_submissions")
      .select("*, users!property_submissions_owner_id_fkey(full_name, email)")
      .eq("notary_status", "approved")
      .order("notary_reviewed_at", { ascending: false })

    if (filter === "pending") {
      query = query.is("admin_reviewed_at", null)
    } else if (filter === "approved") {
      query = query.not("admin_reviewed_at", "is", null).eq("admin_status", "approved")
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

  return (
  <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Aprobacion Final de Propiedades
            </h1>
            <p className="text-slate-500 mt-1">Revisa y aprueba propiedades verificadas por notarios</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
              className={filter === "all" ? "bg-sky-500 hover:bg-sky-600" : "border-sky-500/20"}
            >
              Todas
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              size="sm"
              className={filter === "pending" ? "bg-sky-500 hover:bg-sky-600" : "border-sky-500/20"}
            >
              Pendientes
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
              size="sm"
              className={filter === "approved" ? "bg-sky-500 hover:bg-sky-600" : "border-sky-500/20"}
            >
              Aprobadas
            </Button>
          </div>
        </div>

          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl shadow-lg shadow-sky-500/5">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o ubicacion..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-sky-500/20"
                />
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl shadow-lg shadow-sky-500/5">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-slate-500">Cargando propiedades...</p>
              </CardContent>
            </Card>
          ) : filteredSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredSubmissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="border-sky-500/20 bg-white/80 backdrop-blur-xl shadow-lg shadow-sky-500/5 hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-lg bg-sky-50 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                        {submission.admin_reviewed_at ? (
                          submission.admin_status === "approved" ? (
                            <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-500" />
                          ) : (
                            <XCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500" />
                          )
                        ) : (
                          <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-2">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">{submission.property_name}</h3>
                            <p className="text-slate-600">{submission.property_location}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              Propietario: {submission.users?.full_name || submission.users?.email}
                            </p>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2">Aprobado por Notario</Badge>
                          </div>
                          {submission.admin_reviewed_at && (
                            <Badge
                              className={
                                submission.admin_status === "approved" ?"bg-emerald-50 text-emerald-700 border border-emerald-200" :"bg-red-50 text-red-700 border border-red-200"
                              }
                            >
                              {submission.admin_status === "approved" ? "Aprobado" : "Rechazado"}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
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
                            <p className="text-xs text-slate-500">Revisado por Notario</p>
                            <p className="font-semibold text-slate-900">
                              {new Date(submission.notary_reviewed_at).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/admin/property-approvals/${submission.id}`)}
                          className="border-sky-500/30 text-sky-700 hover:bg-sky-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar y Aprobar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl shadow-lg shadow-sky-500/5">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay propiedades para aprobar</p>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
  )
}
