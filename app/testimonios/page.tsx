import { createClient } from "@/lib/supabase/server"
import { Star, Quote, MapPin, MessageSquarePlus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TestimoniosPage() {
  const supabase = await createClient()

  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error loading testimonials:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Quote className="h-16 w-16 text-white/50 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Testimonios de Clientes</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Experiencias reales de usuarios del sistema Smart Vacational Certificate
          </p>
          <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
            <Link href="/testimonios/enviar">
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Comparte tu Experiencia
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {!testimonials || testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Quote className="h-24 w-24 text-slate-200 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Aún no hay testimonios publicados</h2>
              <p className="text-slate-600 mb-8">Sé el primero en compartir tu experiencia con WEEK-CHAIN</p>
              <Button asChild size="lg">
                <Link href="/testimonios/enviar">Enviar Testimonio</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-white border-slate-200 hover:shadow-xl transition-all">
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
                      <p className="text-slate-700 leading-relaxed pl-6 pr-2">&ldquo;{testimonial.quote}&rdquo;</p>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#B5EAD7] to-[#C7CEEA] flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-800 font-bold text-lg">
                          {testimonial.author_first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{testimonial.author_first_name}</h4>
                        {testimonial.city && (
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {testimonial.city}
                          </p>
                        )}
                        {testimonial.tier_label && (
                          <p className="text-xs text-slate-500 mt-1">{testimonial.tier_label}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="bg-slate-100 py-8">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-slate-500 max-w-3xl mx-auto">
            Todos los testimonios publicados provienen de usuarios reales verificados que han dado su consentimiento
            expreso para compartir su experiencia. WEEK-CHAIN no modifica ni edita el contenido de los testimonios
            aprobados. Los testimonios reflejan experiencias individuales y no constituyen garantía de resultados
            similares para todos los usuarios.
          </p>
        </div>
      </section>
    </div>
  )
}
