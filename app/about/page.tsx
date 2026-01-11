import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Target, Eye, Heart, Award, Users, Globe, TrendingUp } from "lucide-react"

export default async function AboutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFDAC1]/30 via-[#B5EAD7]/20 to-[#C7CEEA]/30 px-6 py-32">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#FF9AA2]/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#C7CEEA]/20 blur-3xl animate-float-delayed" />

        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-balance text-6xl font-bold tracking-tight text-slate-900 md:text-7xl leading-[1.1]">
            Sobre WEEK-CHAIN™
          </h1>
          <p className="mx-auto max-w-3xl text-pretty text-xl text-slate-600 md:text-2xl leading-relaxed font-medium">
            Plataforma digital de Smart Vacational Certificates con sistema de solicitud de uso temporal conforme a
            NOM-151
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Mission */}
            <div className="rounded-3xl bg-gradient-to-br from-[#FF9AA2]/10 to-[#FFB7B2]/5 border-2 border-[#FF9AA2]/20 p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF9AA2]/20 mb-6">
                <Target className="h-8 w-8 text-[#FF9AA2]" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Nuestra Misión</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Facilitar el acceso a solicitudes de uso vacacional en destinos participantes mediante Smart Vacational
                Certificates (SVC) conforme a NOM-151, creando un sistema transparente donde los certificados otorgan
                derechos de solicitud temporal sujetos a disponibilidad, sin barreras de entrada ni compromisos de
                propiedad inmobiliaria.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Operamos una plataforma digital donde los certificados otorgan derechos de solicitud de uso temporal
                mediante flujo REQUEST → OFFER → CONFIRM, sin constituir propiedad inmobiliaria, inversión ni asignación
                garantizada de activos específicos.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-3xl bg-gradient-to-br from-[#C7CEEA]/10 to-[#B5EAD7]/5 border-2 border-[#C7CEEA]/20 p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C7CEEA]/20 mb-6">
                <Eye className="h-8 w-8 text-[#C7CEEA]" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Nuestra Visión</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Consolidarnos como plataforma de referencia en Smart Vacational Certificates, transformando el modelo
                tradicional en un sistema digital moderno basado en derechos de solicitud temporal conformes a
                regulación mexicana vigente.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Aspiramos a crear un nuevo estándar donde la tecnología facilite transparencia en la gestión de
                solicitudes, administración eficiente de disponibilidad y experiencias vacacionales para los titulares
                de certificados mediante un sistema de oferta y aceptación claro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section - Mario Gargano */}
      <section className="bg-gradient-to-br from-[#B5EAD7]/20 via-white to-[#C7CEEA]/20 px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Users className="h-4 w-4 text-[#FF9AA2]" />
              Fundador y CEO
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-4">Mario Gargano</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Visionario detrás de WEEK-CHAIN™</p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9AA2]/20 to-[#C7CEEA]/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src="/mario-gargano.jpg"
                  alt="Mario Gargano - Fundador y CEO de WEEK-CHAIN"
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Mario Gargano es un emprendedor visionario con más de 15 años de experiencia en tecnología, hospitalidad
                y sistemas de gestión operativa. Su visión de crear un sistema transparente de certificados de uso
                vacacional nació de la observación de las ineficiencias y falta de claridad en la industria tradicional
                de tiempo compartido.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Con WEEK-CHAIN™, Mario ha creado un sistema completo de Smart Vacational Certificates que otorgan
                derechos de solicitud temporal, permitiendo que cualquier persona pueda acceder a experiencias
                vacacionales mediante certificados legales conformes a NOM-151, sin compromisos de propiedad
                inmobiliaria.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Su enfoque innovador incluye la certificación digital de derechos de solicitud con respaldo legal
                conforme a normativa mexicana, garantizando una experiencia transparente donde los usuarios comprenden
                que su certificado NO constituye propiedad, inversión ni asigna activos específicos.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  { icon: Award, label: "15+ años", desc: "Experiencia en Tecnología y Hospitalidad" },
                  { icon: Globe, label: "70+", desc: "Destinos de Referencia" },
                  { icon: Users, label: "21", desc: "Intermediarios Comerciales" },
                  { icon: TrendingUp, label: "9", desc: "Empresas de Servicios Integradas" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-2xl glass border border-slate-200/60 p-4 text-center">
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-[#FF9AA2]" />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.label}</div>
                    <div className="text-sm text-slate-600">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">Nuestros Valores</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Los principios que guían cada decisión en WEEK-CHAIN™
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Transparencia",
                desc: "Toda la información sobre disponibilidad del sistema, reglas de solicitud y gestión operativa es accesible en nuestra plataforma. Sin promesas de garantías.",
                color: "#FF9AA2",
              },
              {
                icon: Users,
                title: "Comunidad",
                desc: "Construimos un sistema donde todos los titulares de certificados comprenden sus derechos de solicitud: usuarios, intermediarios y operadores.",
                color: "#B5EAD7",
              },
              {
                icon: TrendingUp,
                title: "Conformidad",
                desc: "Utilizamos tecnología de vanguardia cumpliendo estrictamente con NOM-151 y regulación mexicana para crear un sistema legalmente robusto.",
                color: "#C7CEEA",
              },
            ].map((value, i) => (
              <div
                key={i}
                className="rounded-3xl border-2 p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ borderColor: `${value.color}40`, backgroundColor: `${value.color}05` }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
                  style={{ backgroundColor: `${value.color}20` }}
                >
                  <value.icon className="h-8 w-8" style={{ color: value.color }} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-lg text-slate-700 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#FF9AA2] via-[#FFB7B2] to-[#FFDAC1] px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
            Activa Tu Certificado Digital
          </h2>
          <p className="mb-12 text-xl text-slate-800 leading-relaxed max-w-2xl mx-auto font-medium">
            Obtén tu Smart Vacational Certificate y accede al sistema de solicitudes de uso vacacional temporal sujeto a
            disponibilidad. Inicia el proceso hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="min-w-[240px] bg-slate-900 text-white hover:bg-slate-800 text-base font-semibold h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[240px] border-2 border-slate-900 text-slate-900 hover:bg-slate-900/10 text-base font-semibold h-14 rounded-xl transition-all duration-300 bg-white/90"
            >
              <Link href="/contact">Contactar</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
