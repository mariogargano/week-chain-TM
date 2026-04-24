"use client"

import { useEffect, useState } from "react"
import { Star, Quote, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Testimonial {
  id: string
  author_first_name: string
  city: string | null
  pax: number | null
  tier_label: string | null
  quote: string
  rating: number
  photo_url: string | null
  created_at: string
}

export function TestimonialsShowcase() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials/list?limit=6&approved=true")

        if (!response.ok) {
          const errorData = await response.json()
          console.warn("[v0] Testimonials API returned error:", errorData)

          if (errorData.error?.includes("does not exist") || errorData.error?.includes("42P01")) {
            console.warn("[v0] Testimonials table does not exist yet. Please run script 200_EXECUTE_THIS_FIRST.sql")
            setError("database_not_ready")
            setTestimonials([])
            return
          }

          throw new Error(errorData.error || "Failed to fetch testimonials")
        }

        const data = await response.json()
        if (data.testimonials) {
          setTestimonials(data.testimonials)
          setError(null)
        }
      } catch (error) {
        console.error("[v0] Error fetching testimonials:", error)
        setError("fetch_failed")
        setTestimonials([])
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Experiencias reales de usuarios beta</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-slate-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error === "database_not_ready" && process.env.NODE_ENV !== "production") {
    return (
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <Quote className="h-16 w-16 text-amber-300 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Testimonios (En Configuración)</h2>
            <p className="text-lg text-slate-600 mb-4">La tabla de testimonios aún no existe en la base de datos.</p>
            <p className="text-sm text-slate-500 font-mono bg-slate-100 p-4 rounded-lg">
              Ejecuta el script: <strong>scripts/200_EXECUTE_THIS_FIRST.sql</strong>
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return (
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <Quote className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Sé de los Primeros en Compartir tu Experiencia
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Estamos en fase beta y valoramos enormemente la retroalimentación de nuestros usuarios pioneros.
            </p>
            <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800">
              <Link href="/testimonios/enviar">Comparte tu Experiencia</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Lo que Dicen Nuestros Clientes
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Experiencias reales de usuarios del sistema Smart Vacational Certificate
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-white border-slate-200 hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-slate-200" />
                  <p className="text-slate-700 leading-relaxed pl-6 pr-2 italic">{testimonial.quote}</p>
                </div>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#B5EAD7] to-[#C7CEEA] flex items-center justify-center">
                      <span className="text-slate-800 font-bold text-lg">
                        {testimonial.author_first_name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{testimonial.author_first_name || "Usuario"}</h4>
                    {testimonial.city && (
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.city}
                      </p>
                    )}
                    {testimonial.tier_label && <p className="text-xs text-slate-500 mt-1">{testimonial.tier_label}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="border-2 border-slate-300 bg-transparent">
            <Link href="/testimonios">Ver Todos los Testimonios</Link>
          </Button>
        </div>

        <p className="text-xs text-center text-slate-400 mt-6 max-w-lg mx-auto">
          Todos los testimonios son de usuarios reales verificados. Solo se publican testimonios aprobados con
          consentimiento expreso del usuario.
        </p>
      </div>
    </section>
  )
}
