"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

interface Testimonial {
  id: string
  user_name: string
  user_email: string
  user_city?: string
  certificate_type?: string
  rating: number
  title: string
  comment: string
  would_recommend: boolean
  status: "pending" | "approved" | "rejected"
  admin_notes?: string
  created_at: string
  reviewed_by?: string
  reviewed_at?: string
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    fetchTestimonials()
  }, [statusFilter])

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/testimonials?status=${statusFilter}`)
      const data = await response.json()

      if (response.ok) {
        setTestimonials(data.testimonials || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateTestimonialStatus = async (testimonialId: string, status: "approved" | "rejected", notes?: string) => {
    try {
      const response = await fetch("/api/admin/testimonials/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonialId, status, adminNotes: notes }),
      })

      if (response.ok) {
        fetchTestimonials()
        setSelectedTestimonial(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error("[v0] Error updating testimonial:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: "bg-yellow-500", icon: Clock, label: "Pendiente" },
      approved: { color: "bg-green-500", icon: CheckCircle2, label: "Aprobado" },
      rejected: { color: "bg-red-500", icon: XCircle, label: "Rechazado" },
    }
    const { color, icon: Icon, label } = config[status as keyof typeof config]
    return (
      <Badge className={`${color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
          />
        ))}
        <span className="text-sm text-slate-600 ml-1">({rating}/5)</span>
      </div>
    )
  }

  const stats = {
    pending: testimonials.filter((t) => t.status === "pending").length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    rejected: testimonials.filter((t) => t.status === "rejected").length,
    total: testimonials.length,
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Testimonios</h1>
            <p className="text-slate-600">Modera y aprueba testimonios de usuarios beta</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-10 w-10 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Aprobados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Rechazados</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <MessageSquare className="h-10 w-10 text-slate-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="approved">Aprobados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchTestimonials} variant="outline">
                  Refrescar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* List */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-500">Cargando testimonios...</p>
                  </CardContent>
                </Card>
              ) : testimonials.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No hay testimonios {statusFilter !== "all" && statusFilter}</p>
                  </CardContent>
                </Card>
              ) : (
                testimonials.map((testimonial) => (
                  <Card
                    key={testimonial.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTestimonial?.id === testimonial.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedTestimonial(testimonial)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">{testimonial.title}</CardTitle>
                          {renderStars(testimonial.rating)}
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3" />
                              {testimonial.user_name}
                              {testimonial.user_city && ` • ${testimonial.user_city}`}
                            </div>
                          </CardDescription>
                        </div>
                        {getStatusBadge(testimonial.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 line-clamp-3 mb-3">{testimonial.comment}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(testimonial.created_at).toLocaleDateString("es-MX")}
                        </div>
                        {testimonial.would_recommend ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Recomienda
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            No recomienda
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:sticky lg:top-8 h-fit">
              {selectedTestimonial ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Detalle del Testimonio</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTestimonial(null)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Info */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Información del Usuario</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Nombre:</span> {selectedTestimonial.user_name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {selectedTestimonial.user_email}
                        </p>
                        {selectedTestimonial.user_city && (
                          <p>
                            <span className="font-medium">Ciudad:</span> {selectedTestimonial.user_city}
                          </p>
                        )}
                        {selectedTestimonial.certificate_type && (
                          <p>
                            <span className="font-medium">Certificado:</span> {selectedTestimonial.certificate_type}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Calificación</h3>
                      {renderStars(selectedTestimonial.rating)}
                    </div>

                    {/* Comment */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Comentario</h3>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">{selectedTestimonial.title}</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTestimonial.comment}</p>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-700 mb-2">Recomendación</h3>
                      {selectedTestimonial.would_recommend ? (
                        <Badge className="bg-green-500 text-white">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Sí recomendaría WEEK-CHAIN
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white">
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          No recomendaría WEEK-CHAIN
                        </Badge>
                      )}
                    </div>

                    {/* Admin Notes */}
                    {selectedTestimonial.status === "pending" && (
                      <div>
                        <h3 className="font-semibold text-sm text-slate-700 mb-2">Notas de Moderación (opcional)</h3>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Agregar notas internas sobre la revisión..."
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    {selectedTestimonial.status === "pending" && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            updateTestimonialStatus(selectedTestimonial.id, "approved", adminNotes || undefined)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Aprobar y Publicar
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            updateTestimonialStatus(selectedTestimonial.id, "rejected", adminNotes || undefined)
                          }
                        >
                          <EyeOff className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    )}

                    {selectedTestimonial.status !== "pending" && (
                      <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Estado actual:</span> {selectedTestimonial.status}
                        </p>
                        {selectedTestimonial.reviewed_at && (
                          <p className="text-sm text-slate-600 mt-1">
                            Revisado el {new Date(selectedTestimonial.reviewed_at).toLocaleDateString("es-MX")}
                          </p>
                        )}
                        {selectedTestimonial.admin_notes && (
                          <p className="text-sm text-slate-600 mt-2">
                            <span className="font-medium">Notas:</span> {selectedTestimonial.admin_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Selecciona un testimonio para revisar</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
