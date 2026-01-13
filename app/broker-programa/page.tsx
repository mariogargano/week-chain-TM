import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Award,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Shield,
  FileText,
  Globe,
  CreditCard,
  Smartphone,
  QrCode,
  CheckCircle,
} from "lucide-react"
import type { Metadata } from "next"
import { BrokerDashboardPreview } from "@/components/broker-dashboard-preview"

export const metadata: Metadata = {
  title: "Programa de Intermediación | WEEK-CHAIN™",
  description:
    "Únete al programa de intermediación WEEK-CHAIN™. Obtén 4% de honorarios por cada venta efectiva de servicios vacacionales. Registro disponible en todos los países.",
}

export default function BrokerProgramaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#C7CEEA]/10">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-[#FF9AA2]/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#C7CEEA]/20 blur-3xl" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-2 mb-6">
              <Badge className="bg-[#FF9AA2]/20 text-[#FF9AA2] border-[#FF9AA2]/40 text-sm font-semibold px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                Programa de Intermediación Comercial
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-sm font-semibold px-4 py-2">
                <Globe className="h-4 w-4 mr-2" />
                Disponible Globalmente
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Obtén <span className="text-[#FF9AA2]">4%</span> de Honorarios
              <br />
              por Cada Venta Efectiva
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Únete al programa de intermediación de WEEK-CHAIN™ y obtén 4% de honorarios por cada referido directo que
              compre un certificado vacacional. Sistema simple y transparente sin niveles. Puedes registrarte como
              persona física o empresa desde cualquier país.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:opacity-90 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/broker/apply">
                  Registrarme como Intermediario
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-300 text-slate-700 font-semibold px-8 py-6 text-lg rounded-xl bg-transparent"
              >
                <Link href="/dashboard/broker">Ya soy Intermediario</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Aviso Legal */}
      <section className="px-4 py-8 bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-amber-800 mb-2">Aviso Legal Importante</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Los honorarios derivan exclusivamente de servicios de intermediación comercial en la venta de servicios
                de tiempo compartido vacacional conforme a la NOM-029-SCFI-2010.
                <strong>
                  {" "}
                  No constituyen inversión, rendimiento financiero ni esquema de compensación basado en reclutamiento.
                </strong>{" "}
                Los pagos se realizan únicamente por ventas efectivas de servicios a usuarios finales. El intermediario
                actúa como facilitador comercial, no como agente inmobiliario.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20 bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">Tu Tarjeta Digital</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Así será tu Tarjeta de Presentación WEEK-CHAIN™
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Al registrarte, recibirás tu tarjeta digital profesional con QR único. Compatible con Apple Wallet y
              Google Wallet.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* iPhone with Apple Wallet Image */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-[#FF9AA2]/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#C7CEEA]/20 rounded-full blur-3xl" />

              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/hand-holding-iphone-showing-apple-wallet-with-eleg.jpg"
                  alt="Tarjeta WEEK-CHAIN en Apple Wallet - iPhone mostrando la tarjeta digital con acceso a cerraduras inteligentes"
                  className="w-full h-auto"
                />
                {/* Overlay gradient for branding */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold text-sm">Tu tarjeta todo-en-uno</p>
                  <p className="text-slate-300 text-xs">
                    Presentación profesional + Acceso a cerraduras inteligentes de tu semana vacacional
                  </p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-xl">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
                    fill="black"
                  />
                </svg>
              </div>
              <div className="absolute bottom-12 -left-4 bg-white rounded-full p-3 shadow-xl">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13999 18.63 6.70999 16.7 5.83999 14.1H2.17999 V16.94C3.98999 20.53 7.69999 23 12 23Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.83999 14.09Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69999 1 3.98999 3.47 2.17999 7.07L5.83999 9.91C6.70999 7.31 9.13999 5.38 12 5.38Z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
            </div>

            {/* Card Features - moved to right */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF9AA2]/20 flex items-center justify-center flex-shrink-0">
                  <QrCode className="h-6 w-6 text-[#FF9AA2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Código QR Único</h3>
                  <p className="text-slate-400 text-sm">
                    Tu código QR enlaza directamente a WEEK-CHAIN™ con tu código de referido. Los clientes que escaneen
                    tu QR quedarán vinculados a ti automáticamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C7CEEA]/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-6 w-6 text-[#C7CEEA]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Apple Wallet y Google Wallet</h3>
                  <p className="text-slate-400 text-sm">
                    Agrega tu tarjeta a tu wallet digital para tenerla siempre disponible. Comparte con un toque o
                    muestra el QR directamente desde tu teléfono.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Acceso a Cerraduras Inteligentes</h3>
                  <p className="text-slate-400 text-sm">
                    Tu tarjeta también funciona como llave digital. Al comprar una semana vacacional, tu tarjeta en el
                    wallet se convierte en la llave de acceso a la cerradura inteligente de la propiedad durante tu
                    estancia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Tarjeta para Empresas</h3>
                  <p className="text-slate-400 text-sm">
                    Si te registras como empresa, podrás generar múltiples tarjetas para tus colaboradores, todas
                    vinculadas a tu cuenta principal.
                  </p>
                </div>
              </div>

              <Button asChild size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                <Link href="/broker/apply">
                  Obtener Mi Tarjeta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Registro */}
      <section className="px-4 py-16 md:py-20"></section>

      {/* Sistema de Honorarios */}
      <section className="px-4 py-16 md:py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200">Sistema de Honorarios</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comisión Flat sobre Referidos Directos
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Recibe 4% de honorarios por cada venta efectiva de tus referidos directos. Sistema simple y transparente,
              sin niveles ni complicaciones.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-md">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF9AA2] to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#C7CEEA] to-transparent rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Header */}
                <div className="relative flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                      WEEK-CHAIN<span className="text-[#FF9AA2] text-xs align-super">™</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">Sistema Intermediarios</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] text-white border-none">FLAT 4%</Badge>
                </div>

                {/* Percentage */}
                <div className="relative text-center mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#FF9AA2]/30 to-[#C7CEEA]/20 border-4 border-[#FF9AA2] flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-bold text-white">4%</span>
                  </div>
                  <p className="text-[#B5EAD7] text-sm mt-3 font-medium">Sobre cada venta de referido directo</p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Comisión</span>
                      <span className="text-white font-bold text-xl">4% Flat</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Costo de Registro</span>
                      <span className="text-green-400 font-bold text-lg">GRATIS</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Niveles</span>
                      <span className="text-white font-semibold">Solo Directos</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Sistema</p>
                      <p className="text-white font-bold text-lg">Simple y Transparente</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF9AA2] via-[#C7CEEA] to-[#FF9AA2]" />
              </div>
            </div>
          </div>

          {/* Condiciones claras */}
          <Card className="border border-slate-200 bg-white shadow-lg max-w-4xl mx-auto overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA]" />
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4 text-center">Condiciones del Programa</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm">
                    <strong>Pago por venta efectiva:</strong> Los honorarios se generan únicamente cuando un cliente que
                    tú referiste completa la contratación.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm">
                    <strong>Sin cuotas ni pagos iniciales:</strong> No pagas nada por registrarte ni por acceder a la
                    plataforma.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm">
                    <strong>Pago directo a tu cuenta:</strong> Los honorarios se depositan directamente en tu cuenta
                    bancaria.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm">
                    <strong>Seguimiento en tiempo real:</strong> Monitorea todas tus ventas y comisiones desde tu
                    dashboard personal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aviso Legal Reforzado */}
          <div className="max-w-4xl mx-auto mt-8 p-5 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 mb-1">Marco Legal de los Honorarios</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Los honorarios corresponden exclusivamente a servicios de intermediación comercial por ventas
                  efectivas a usuarios finales.
                  <strong>
                    {" "}
                    Este NO es un esquema de inversión, multinivel, ni de compensación basado en reclutamiento de
                    personas.
                  </strong>{" "}
                  No se paga por registrar nuevos intermediarios ni por el volumen de afiliaciones. WEEK-CHAIN™ cumple
                  con la legislación aplicable en materia de protección al consumidor y prácticas comerciales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Broker Dashboard Preview */}
      <BrokerDashboardPreview />

      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200">Broker Extra Benefit</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">¿Qué obtienes al registrarte?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Beneficios exclusivos para todos los intermediarios WEEK-CHAIN™
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tarjeta Digital con QR */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF9AA2] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C7CEEA] rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">WC</span>
                    </div>
                    <span className="text-white/80 text-sm font-medium">WEEK-CHAIN™</span>
                  </div>
                  <Badge className="bg-[#FF9AA2]/20 text-[#FF9AA2] border-[#FF9AA2]/30 text-xs">Incluido</Badge>
                </div>

                {/* Icon central */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center shadow-lg">
                    <CreditCard className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-3">Tarjeta Digital con QR</h3>

                {/* Description */}
                <p className="text-slate-400 text-sm text-center mb-6">
                  Tarjeta de presentación digital con QR único. Compatible con Apple Wallet y Google Wallet.
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>QR único personalizado</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Apple & Google Wallet</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Compartir por NFC</span>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2]" />
              </div>
            </div>

            {/* Dashboard Profesional */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#C7CEEA] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#B5EAD7] rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C7CEEA] to-[#B5EAD7] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">WC</span>
                    </div>
                    <span className="text-white/80 text-sm font-medium">WEEK-CHAIN™</span>
                  </div>
                  <Badge className="bg-[#C7CEEA]/20 text-[#C7CEEA] border-[#C7CEEA]/30 text-xs">Incluido</Badge>
                </div>

                {/* Icon central */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C7CEEA] to-[#B5EAD7] flex items-center justify-center shadow-lg">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-3">Dashboard Profesional</h3>

                {/* Description */}
                <p className="text-slate-400 text-sm text-center mb-6">
                  Panel de control con métricas de ventas, seguimiento de clientes y reportes en tiempo real.
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Métricas en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Seguimiento de clientes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Reportes descargables</span>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-[#C7CEEA] to-[#B5EAD7]" />
              </div>
            </div>

            {/* Materiales de Venta */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-300 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">WC</span>
                    </div>
                    <span className="text-white/80 text-sm font-medium">WEEK-CHAIN™</span>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Incluido</Badge>
                </div>

                {/* Icon central */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-3">Materiales de Venta</h3>

                {/* Description */}
                <p className="text-slate-400 text-sm text-center mb-6">
                  Acceso a catálogos digitales, fichas técnicas de destinos y materiales promocionales.
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Catálogos digitales</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Fichas técnicas</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#B5EAD7]" />
                    <span>Material promocional</span>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-20 bg-slate-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para ser parte del equipo WEEK-CHAIN™?</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Únete a nuestro programa de intermediación y comienza a generar honorarios por facilitar la contratación de
            servicios vacacionales de calidad. Registro disponible en todos los países.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-6 text-lg rounded-xl"
          >
            <Link href="/broker/apply">
              Aplicar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
