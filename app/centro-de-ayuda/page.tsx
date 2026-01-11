"use client"

import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  Book,
  Video,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export default function HelpCenterPage() {
  const helpCategories = [
    {
      title: "Preguntas Frecuentes",
      description: "Respuestas detalladas a las 30+ preguntas más comunes sobre el modelo SVC",
      icon: HelpCircle,
      color: "from-blue-500 to-cyan-500",
      href: "/faq",
    },
    {
      title: "Términos y Condiciones",
      description: "Contrato de adhesión completo con todos los derechos y obligaciones",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      href: "/terms",
    },
    {
      title: "Disclaimer Legal",
      description: "Información legal crucial sobre lo que NO constituye el certificado SVC",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      href: "/disclaimer",
    },
    {
      title: "Política de Cancelación",
      description: "Periodo de retracto, condiciones y procedimientos de cancelación",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500",
      href: "/cancellation",
    },
    {
      title: "Documentación Completa",
      description: "Acceso a contratos modelo, anexos y documentación técnica del sistema",
      icon: Book,
      color: "from-indigo-500 to-purple-500",
      href: "/legal",
    },
    {
      title: "Tutoriales y Guías",
      description: "Guías paso a paso sobre cómo usar el sistema REQUEST → OFFER → CONFIRM",
      icon: Video,
      color: "from-rose-500 to-pink-500",
      href: "/onboarding",
    },
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email General",
      value: "info@week-chain.com",
      href: "mailto:info@week-chain.com",
      description: "Consultas generales y ventas",
      color: "text-blue-500",
    },
    {
      icon: Mail,
      title: "Email Soporte",
      value: "soporte@week-chain.com",
      href: "mailto:soporte@week-chain.com",
      description: "Asistencia técnica y seguimiento",
      color: "text-green-500",
    },
    {
      icon: Phone,
      title: "WhatsApp Business",
      value: "+52 998 XXX XXXX",
      href: "https://wa.me/5299812345",
      description: "Lunes a Viernes, 9am-7pm CST",
      color: "text-emerald-500",
    },
    {
      icon: MessageSquare,
      title: "Formulario de Contacto",
      value: "Envía tu consulta",
      href: "/contact",
      description: "Respuesta en 24-48 horas",
      color: "text-purple-500",
    },
  ]

  const quickGuides = [
    {
      title: "Cómo Solicitar tu Primera Estancia",
      description: "Guía completa del flujo REQUEST → OFFER → CONFIRM paso a paso",
      duration: "5 min lectura",
    },
    {
      title: "Qué Hacer si Recibes una Oferta",
      description: "Cómo evaluar ofertas, qué revisar antes de confirmar y plazos",
      duration: "3 min lectura",
    },
    {
      title: "Gestión Opcional con WEEK-Management",
      description: "Cómo solicitar coordinación de renta y qué esperar del servicio",
      duration: "4 min lectura",
    },
    {
      title: "Política de Cancelación y Cambios",
      description: "Periodo de retracto, cambios de fecha y emergencias",
      duration: "3 min lectura",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
            <HelpCircle className="h-4 w-4 mr-2 inline" />
            Centro de Ayuda WEEK-CHAIN
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">¿Cómo podemos ayudarte?</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            Encuentra respuestas, documentación y soporte para aprovechar al máximo tu Smart Vacational Certificate
          </p>
        </div>

        {/* Search Box */}
        <Card className="max-w-3xl mx-auto mb-16 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Busca información sobre disponibilidad, cancelaciones, management..."
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Buscar
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Busca por palabras clave: disponibilidad, cancelar, management, cambiar fecha, reembolso, etc.
            </p>
          </CardContent>
        </Card>

        {/* Help Categories Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Categorías de Ayuda</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {helpCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <Link key={index} href={category.href}>
                  <Card className="h-full border-2 border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group">
                    <CardHeader>
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                        Explorar
                        <ExternalLink className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Guides */}
        <div className="mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Guías Rápidas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickGuides.map((guide, index) => (
              <Card
                key={index}
                className="border-2 border-slate-200 hover:border-purple-400 transition-all cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Book className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">{guide.title}</CardTitle>
                      <CardDescription className="text-sm">{guide.description}</CardDescription>
                      <Badge variant="outline" className="mt-2 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {guide.duration}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Contacta con Soporte</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <a key={index} href={method.href} target={method.href.startsWith("http") ? "_blank" : undefined}>
                  <Card className="h-full border-2 border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors`}
                      >
                        <Icon className={`h-6 w-6 ${method.color}`} />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">{method.title}</h3>
                      <p className={`text-sm font-semibold ${method.color} mb-1`}>{method.value}</p>
                      <p className="text-xs text-slate-500">{method.description}</p>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <Card className="max-w-4xl mx-auto border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-900">
              <Shield className="h-6 w-6" />
              Aviso Importante para Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-900">
            <p>
              El Smart Vacational Certificate (SVC) otorga derechos personales y temporales de solicitud de uso
              vacacional, sujetos a disponibilidad del sistema WEEK-CHAIN. NO constituye propiedad, tiempo compartido
              tradicional, inversión ni garantiza acceso a destinos o fechas específicas.
            </p>
            <p className="font-semibold">
              Todas las solicitudes están sujetas al flujo obligatorio REQUEST → OFFER → CONFIRM. Lee completa y
              cuidadosamente los términos y condiciones antes de activar tu certificado.
            </p>
            <div className="flex gap-3 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/terms">Leer Términos Completos</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/disclaimer">Disclaimer Legal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Horarios */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Horarios de Atención</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="font-semibold text-slate-900 mb-1">Soporte General</p>
                <p className="text-sm text-slate-600">Lunes a Viernes</p>
                <p className="text-sm text-slate-600">9:00 AM - 7:00 PM CST</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="font-semibold text-slate-900 mb-1">Emergencias (Usuarios Activos)</p>
                <p className="text-sm text-slate-600">24/7 vía Email</p>
                <p className="text-sm text-slate-600">Respuesta en 2-4 horas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
