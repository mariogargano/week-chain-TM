"use client"

import { useState } from "react"
import { Star, Shield, CheckCircle, Award, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WeekReviewPage() {
  const [certificateNumber, setCertificateNumber] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleVerifyCertificate = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/vouchers/verify?code=${certificateNumber}`)
      const data = await response.json()
      setIsVerified(data.valid)
      if (!data.valid) {
        alert("Certificado no encontrado. Verifica el código e intenta nuevamente.")
      }
    } catch (error) {
      console.error("Error verifying certificate:", error)
      alert("Error al verificar. Por favor intenta más tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReview = async () => {
    setIsSubmitting(true)
    try {
      await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateNumber,
          rating,
          reviewText,
        }),
      })
      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Error al enviar. Por favor intenta más tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const recentReviews = [
    {
      id: 1,
      author: "María García",
      certificateId: "WC-2023-****",
      rating: 5,
      text: "Llevamos 3 años utilizando nuestro certificado. El proceso de solicitud de reservaciones ha sido ágil y la atención al cliente excelente.",
      date: "2025-01-10",
      yearsCompleted: 3,
    },
    {
      id: 2,
      author: "Carlos Rodríguez",
      certificateId: "WC-2022-****",
      rating: 5,
      text: "Excelente servicio de gestión. Hemos podido solicitar acceso a diferentes propiedades cada año, sujeto a disponibilidad. Muy satisfechos.",
      date: "2025-01-08",
      yearsCompleted: 5,
    },
    {
      id: 3,
      author: "Ana Martínez",
      certificateId: "WC-2024-****",
      rating: 4,
      text: "Buen servicio de gestión. La plataforma es clara y el proceso de solicitud funciona bien. Algunos detalles por mejorar en la app móvil.",
      date: "2025-01-05",
      yearsCompleted: 1,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200&text=Certificate+Holders')] bg-cover bg-center opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Solo para Titulares de Certificados Verificados</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">WEEK Review</h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Comparte tu experiencia como titular de certificado Week-Chain
            </p>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Tu opinión nos ayuda a mejorar continuamente la plataforma y el servicio de gestión de solicitudes de
              acceso vacacional.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-1">1,247</div>
              <div className="text-sm text-blue-100">Reviews Verificadas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold mb-1">4.8/5</div>
              <div className="text-sm text-blue-100">Rating Promedio</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-1">98%</div>
              <div className="text-sm text-blue-100">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review Form */}
          <div>
            <Card className="border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Star className="h-6 w-6 text-blue-600" />
                  Deja tu Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isVerified ? (
                  <>
                    <Alert className="bg-blue-50 border-blue-200">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900">
                        Primero verifica tu certificado para poder dejar una review
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="certificate">Número de Certificado</Label>
                      <Input
                        id="certificate"
                        placeholder="Ej: WC-2023-12345"
                        value={certificateNumber}
                        onChange={(e) => setCertificateNumber(e.target.value)}
                      />
                      <p className="text-sm text-slate-500">
                        Encuentra tu número en tu certificado digital o tarjeta física
                      </p>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleVerifyCertificate}
                      disabled={!certificateNumber || isSubmitting}
                    >
                      {isSubmitting ? "Verificando..." : "Verificar Certificado"}
                    </Button>
                  </>
                ) : submitted ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">¡Gracias por tu Review!</h3>
                    <p className="text-slate-600">
                      Tu opinión nos ayuda a mejorar y será visible para otros titulares en breve.
                    </p>
                  </div>
                ) : (
                  <>
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-900">
                        Certificado verificado: {certificateNumber}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Tu Calificación</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-10 w-10 ${
                                star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="review">Tu Experiencia</Label>
                      <Textarea
                        id="review"
                        placeholder="Cuéntanos sobre tu experiencia con Week-Chain. ¿Qué te ha gustado más? ¿Qué podríamos mejorar?"
                        rows={6}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                      <p className="text-sm text-slate-500">Mínimo 50 caracteres</p>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleSubmitReview}
                      disabled={!rating || reviewText.length < 50 || isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Publicar Review"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Why Reviews Matter */}
            <Card className="mt-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Por qué tu opinión importa
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Mejoramos continuamente el servicio basándonos en tu retroalimentación</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Ayudas a futuros solicitantes a conocer experiencias reales de la plataforma</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Tu experiencia como titular es valiosa para mantener la transparencia del servicio</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews Recientes</h2>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-900">{review.author}</div>
                          <div className="text-sm text-slate-500">
                            {review.certificateId} • {review.yearsCompleted} años completados
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">Verificado</span>
                        </div>
                      </div>

                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-slate-700 mb-3">{review.text}</p>
                      <div className="text-xs text-slate-500">{review.date}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Average Ratings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desglose de Calificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${stars === 5 ? 85 : stars === 4 ? 12 : stars === 3 ? 3 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-12 text-right">
                      {stars === 5 ? "85%" : stars === 4 ? "12%" : stars === 3 ? "3%" : "0%"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
