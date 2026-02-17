import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Home, Sparkles, ArrowRight, Heart, Plane, Gift, Users, Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"

export default async function WeekInLifePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const lifestyleFeatures = [
    {
      icon: Plane,
      title: "Vacaciones Aseguradas",
      description: "1-2 semanas anuales garantizadas en destinos premium por 15 años consecutivos.",
    },
    {
      icon: Heart,
      title: "Estilo de Vida Premium",
      description: "Acceso a propiedades verificadas con estándares de lujo y confort.",
    },
    {
      icon: Users,
      title: "Experiencias Familiares",
      description: "Crea recuerdos inolvidables con tus seres queridos año tras año.",
    },
    {
      icon: Gift,
      title: "Beneficios Exclusivos",
      description: "Acceso a servicios adicionales del ecosistema WEEK-CHAIN.",
    },
  ]

  const stats = [
    { value: "15", label: "Años de Uso", sublabel: "Garantizado", icon: Calendar },
    { value: "120+", label: "Propiedades", sublabel: "Verificadas", icon: MapPin },
    { value: "24/7", label: "Soporte", sublabel: "Disponible", icon: Clock },
    { value: "100%", label: "Digital", sublabel: "Sin papel", icon: Sparkles },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="relative flex-1">
        <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-sm flex items-start justify-center pt-32">
          <div className="max-w-2xl mx-auto text-center px-6">
            <div className="mb-8">
              <Sparkles className="w-16 h-16 text-[#FF6B6B] mx-auto mb-6 animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Un nuevo estilo de vida está{" "}
              <span className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] bg-clip-text text-transparent">
                por comenzar
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
              WEEK-In Life transformará tu manera de vacacionar
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/properties">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#FF5A5A] hover:to-[#3DBDB5] text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                >
                  Explorar Propiedades
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="mt-10 text-sm text-slate-400">WEEK-In Life™ estará disponible próximamente</p>
          </div>
        </div>
        {/* End of overlay */}

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden px-4 sm:px-6 py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400">
                      <Home className="h-4 w-4 mr-2" />
                      Próximamente
                    </Badge>
                    <Badge variant="outline" className="border-cyan-300 text-cyan-300 bg-cyan-500/10">
                      <Clock className="h-3 w-3 mr-1" />
                      Lista de Espera
                    </Badge>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    Vive Más
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      Vacaciones Aseguradas
                    </span>
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl">
                    WEEK-In Life™ es tu pasaporte a 15 años de vacaciones garantizadas. Un certificado digital que
                    asegura tu derecho de uso vacacional con la libertad de elegir cuándo y dónde disfrutar.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link href="/auth">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                      >
                        Unirse a Lista de Espera
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-slate-300 text-slate-300 hover:bg-slate-800 bg-transparent"
                      >
                        Más Información
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Certificate Preview Card */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-blue-500/20">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400 to-transparent rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-slate-400 text-sm">Smart Vacational Certificate</p>
                          <h3 className="text-xl font-bold text-white">WEEK-In Life™</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Home className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {stats.map((stat, i) => (
                          <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <stat.icon className="h-4 w-4 text-blue-400" />
                              <span className="text-xs text-slate-400">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                              {stat.value}
                              {stat.sublabel && (
                                <span className="text-blue-400 text-sm ml-1 block">{stat.sublabel}</span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-3">Ejemplo de Certificado</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Capacidad</span>
                            <span className="text-white">2-10 personas</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Semanas anuales</span>
                            <span className="text-blue-400 font-semibold">1-2 semanas</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Duración</span>
                            <span className="text-white">15 años</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600" />
                  </div>

                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Próximamente
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Beneficios del Estilo de Vida</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Por Qué WEEK-In Life™?</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Un nuevo enfoque para vivir vacaciones sin límites
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {lifestyleFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Comienza tu Estilo de Vida WEEK</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Únete a la lista de espera y sé de los primeros en acceder a WEEK-In Life™
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 shadow-lg px-8">
                    Unirse Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 bg-transparent"
                  >
                    Más Información
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
