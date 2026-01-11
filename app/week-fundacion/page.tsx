"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Users, Home, GraduationCap, Droplets, Sparkles, ArrowRight, Mail } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function WeekCarePage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Newsletter subscription:", email)
    alert("¡Gracias por suscribirte a WEEK-CARE!")
    setEmail("")
  }

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Contact form:", { email, message })
    alert("¡Gracias por tu mensaje! Nos pondremos en contacto pronto.")
    setEmail("")
    setMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral-200/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo with heart */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] rounded-full mb-8 shadow-lg">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6">WEEK Fundación</h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-4 font-light">Fundación Humanitaria</p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Transformando vidas a través del acceso a vivienda digna, educación y bienestar. Nuestro programa
              WEEK-CARE es el corazón de nuestra misión humanitaria.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white shadow-lg text-base"
              >
                <Heart className="w-5 h-5 mr-2" />
                Hacer una Donación
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#FF9AA2] text-[#FF9AA2] hover:bg-pink-50 text-base bg-transparent"
              >
                Ser Voluntario
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { number: "15,000+", label: "Familias Apoyadas", icon: Users },
              { number: "48", label: "Proyectos Activos", icon: Home },
              { number: "12", label: "Países", icon: Droplets },
              { number: "2,500+", label: "Voluntarios", icon: Sparkles },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Nuestra Misión</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              WEEK Fundación, a través de su programa insignia WEEK-CARE, utiliza el poder del modelo de tiempo
              compartido para crear impacto social. Por cada semana vendida, destinamos recursos para proporcionar
              vivienda temporal, educación y oportunidades a comunidades en necesidad.
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] rounded-2xl p-8 text-center shadow-xl">
              <div className="inline-flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full mb-4">
                <Heart className="w-6 h-6 text-white fill-white" />
                <span className="text-white font-bold text-lg">Programa WEEK-CARE</span>
              </div>
              <p className="text-white/90 text-lg max-w-3xl mx-auto">
                Nuestro programa principal dedicado a proporcionar vivienda, educación y salud a familias en situación
                vulnerable. WEEK-CARE conecta el mundo de las propiedades vacacionales con el impacto social real.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Home,
                title: "Vivienda Digna",
                description:
                  "Proporcionamos acceso a alojamiento seguro y confortable para familias en situación vulnerable durante crisis o transiciones.",
              },
              {
                icon: GraduationCap,
                title: "Educación",
                description:
                  "Becas y programas educativos para niños y jóvenes, dándoles las herramientas para un futuro mejor.",
              },
              {
                icon: Droplets,
                title: "Agua y Salud",
                description: "Proyectos de agua potable, saneamiento y atención médica básica en comunidades remotas.",
              },
            ].map((item, i) => (
              <Card key={i} className="p-8 hover:shadow-xl transition-shadow border-2 border-slate-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] rounded-2xl mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project with Image */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-pink-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80"
                  alt="Proyecto WEEK-CARE"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-[#FF9AA2]/10 text-[#FF9AA2] rounded-full text-sm font-semibold mb-6">
                  Proyecto Destacado
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Casas de Esperanza</h2>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  En colaboración con comunidades locales en Oaxaca, estamos construyendo viviendas dignas para 50
                  familias que perdieron sus hogares. Cada familia recibirá no solo una casa, sino también capacitación
                  en oficios y apoyo para la autosuficiencia.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "25 casas ya completadas",
                    "120 niños beneficiados con educación",
                    "Acceso a agua potable para toda la comunidad",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white"
                >
                  Apoyar este Proyecto
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Cómo Puedes Ayudar</h2>
            <p className="text-lg text-slate-600">
              Hay muchas formas de unirte a nuestra misión y hacer una diferencia real
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] text-white border-0 shadow-xl">
              <Heart className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Donación Única o Mensual</h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Tu aporte directo transforma vidas. Cada donación va 100% a nuestros proyectos.
              </p>
              <Button size="lg" className="bg-white text-[#FF9AA2] hover:bg-slate-50 w-full">
                Donar Ahora
              </Button>
            </Card>

            <Card className="p-8 border-2 border-slate-200 hover:border-[#FF9AA2] transition-colors">
              <Users className="w-12 h-12 mb-6 text-[#FF9AA2]" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Voluntariado</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Comparte tu tiempo y habilidades. Desde trabajo en campo hasta diseño y marketing.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#FF9AA2] text-[#FF9AA2] hover:bg-pink-50 w-full bg-transparent"
              >
                Ser Voluntario
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 text-[#FF9AA2]" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Mantente Conectado</h2>
            <p className="text-slate-300 mb-8 text-lg">
              Recibe historias de impacto, actualizaciones de proyectos y formas de involucrarte
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white"
              >
                Suscribirse
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">¿Tienes una Pregunta?</h2>
              <p className="text-lg text-slate-600">Nos encantaría saber de ti. Envíanos un mensaje.</p>
            </div>

            <Card className="p-8 border-2 border-slate-200">
              <form onSubmit={handleContact} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje</label>
                  <Textarea
                    placeholder="Cuéntanos cómo te gustaría ayudar..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white"
                >
                  Enviar Mensaje
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
