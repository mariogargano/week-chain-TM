import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  Users,
  Building2,
  CheckCircle2,
  Globe,
  Shield,
  TrendingUp,
  Zap,
  Award,
  Lock,
  Smartphone,
  CreditCard,
  Calendar,
  MapPin,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cómo Funciona WEEK-CHAIN | Plataforma Completa",
  description:
    "Descubre cómo funciona WEEK-CHAIN: La primera plataforma de Smart Vacational Certificates conforme a NOM-151 y PROFECO",
}

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-40 left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/40 px-6 py-2 text-base">
              <Zap className="h-5 w-5 mr-2" />
              Plataforma Completa
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight">
              Cómo Funciona
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                WEEK-CHAIN
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
              La primera plataforma de Smart Vacational Certificates 100% conforme a regulaciones globales: NOM-151
              (México), GDPR (Europa), y PROFECO
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/proceso-completo">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold text-lg px-8 py-6"
                >
                  Ver Proceso Step-by-Step
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800 bg-transparent text-lg px-8 py-6"
                >
                  Comenzar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares de la Plataforma */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              4 Pilares de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Innovación
              </span>
            </h2>
            <p className="text-xl text-slate-400">Tecnología de punta con cumplimiento legal total</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Cumplimiento Legal",
                description: "NOM-151, NOM-029, GDPR, PROFECO",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: <Globe className="h-10 w-10" />,
                title: "Red Global",
                description: "Destinos en 4 países y creciendo",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: <Smartphone className="h-10 w-10" />,
                title: "100% Digital",
                description: "Apple Wallet, Google Wallet, QR",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: <Award className="h-10 w-10" />,
                title: "Sin Cuotas",
                description: "$0 en mantenimiento anual",
                color: "from-amber-500 to-amber-600",
              },
            ].map((pilar, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl hover:border-slate-600 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pilar.color} flex items-center justify-center mb-4 text-white`}
                  >
                    {pilar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{pilar.title}</h3>
                  <p className="text-slate-400">{pilar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosistema Completo */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ecosistema Completo</h2>
            <p className="text-xl text-slate-400">7 plataformas integradas trabajando en sinergia</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "WEEK-CHAIN",
                description: "Plataforma principal de certificados",
                icon: <Award className="h-6 w-6" />,
                color: "blue",
              },
              {
                name: "WEEK Management",
                description: "Administración de certificados",
                icon: <Building2 className="h-6 w-6" />,
                color: "emerald",
              },
              {
                name: "WEEK Booking",
                description: "Sistema de solicitudes REQUEST→OFFER→CONFIRM",
                icon: <Calendar className="h-6 w-6" />,
                color: "purple",
              },
              {
                name: "WEEK Market",
                description: "Coordinación de uso entre usuarios",
                icon: <TrendingUp className="h-6 w-6" />,
                color: "amber",
              },
              {
                name: "VA-FI",
                description: "Protocolo de verificación",
                icon: <Lock className="h-6 w-6" />,
                color: "pink",
              },
              {
                name: "WEEK Fundación",
                description: "1% de ventas a causas sociales",
                icon: <Users className="h-6 w-6" />,
                color: "red",
              },
            ].map((plataforma, index) => (
              <Card
                key={index}
                className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl hover:bg-slate-800/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-${plataforma.color}-500/20 border border-${plataforma.color}-500/30 flex items-center justify-center mb-4 text-${plataforma.color}-400`}
                  >
                    {plataforma.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{plataforma.name}</h3>
                  <p className="text-sm text-slate-400">{plataforma.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Características Técnicas */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Stack Tecnológico</h2>
            <p className="text-xl text-slate-400">Tecnología empresarial de última generación</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Frontend</h3>
                <ul className="space-y-3">
                  {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Shadcn UI"].map((tech, index) => (
                    <li key={index} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Backend</h3>
                <ul className="space-y-3">
                  {[
                    "Supabase PostgreSQL",
                    "94 Tablas Relacionales",
                    "Row Level Security",
                    "Inngest (async jobs)",
                    "Webhooks",
                  ].map((tech, index) => (
                    <li key={index} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Integraciones</h3>
                <ul className="space-y-3">
                  {["EasyLex (NOM-151)", "Conekta Payments", "Stripe", "Resend (Email)", "Apple/Google Wallet"].map(
                    (tech, index) => (
                      <li key={index} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0" />
                        <span>{tech}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Por Qué Es Único */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Por Qué WEEK-CHAIN es{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Único</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "NO es Tiempo Compartido",
                description:
                  "Certificados de derecho de uso temporal. Sin propiedad inmobiliaria. 100% conforme PROFECO.",
                icon: <Shield className="h-8 w-8" />,
              },
              {
                title: "Sistema REQUEST-OFFER-CONFIRM",
                description:
                  "No hay calendario fijo. Solicitas fechas, recibes ofertas, confirmas. Control total de capacidad.",
                icon: <Calendar className="h-8 w-8" />,
              },
              {
                title: "Sin Cuotas de Mantenimiento",
                description: "$0 en cuotas anuales. Pago único por certificado. 15 años de uso incluido.",
                icon: <CreditCard className="h-8 w-8" />,
              },
              {
                title: "Red Global en Crecimiento",
                description:
                  "México, Albania, Turquía, Italia. Nuevos destinos desbloqueándose continuamente con modelo EXIT.",
                icon: <MapPin className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-purple-500/10 border-blue-500/30 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para ver la plataforma en acción?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Descubre el proceso completo desde registro hasta checkout
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/proceso-completo">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold text-lg px-8"
                  >
                    Ver Proceso Completo
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-800 bg-transparent text-lg px-8"
                  >
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
