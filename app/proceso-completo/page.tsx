import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  UserPlus,
  FileText,
  ShieldCheck,
  CreditCard,
  Calendar,
  CheckCircle,
  ArrowRight,
  Wallet,
  QrCode,
  Key,
  Lock,
  Mail,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proceso Completo | WEEK-CHAIN™",
  description:
    "Descubre el proceso completo de registro, firma de contrato, compra de certificado y selección de semana en WEEK-CHAIN™",
}

export default function ProcesoCompletoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/40 px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Proceso Completo
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Tu Viaje con WEEK-CHAIN™
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Del Registro al Checkout
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Descubre cómo funciona todo el sistema paso a paso, desde tu registro hasta la confirmación de tu semana
              vacacional
            </p>
          </div>

          {/* Timeline Visual */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-emerald-500 to-purple-500" />

            {/* Steps */}
            <div className="space-y-12">
              {/* Step 1: Registro */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                    <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4 md:justify-end">
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">Paso 1</Badge>
                          <h3 className="text-2xl font-bold text-white">Registro de Usuario</h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Crea tu cuenta con email y contraseña. Recibes confirmación por correo.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Verifica tu email</span>
                            <Mail className="h-4 w-4 text-blue-400" />
                          </li>
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Completa tu perfil</span>
                            <UserPlus className="h-4 w-4 text-blue-400" />
                          </li>
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Accede a tu dashboard</span>
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-slate-900 flex items-center justify-center z-10 order-1 md:order-2">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>

                  <div className="md:w-1/2 md:pl-12 order-3"></div>
                </div>
              </div>

              {/* Step 2: Firma de Contrato */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="md:w-1/2 md:pr-12 order-2"></div>

                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-4 border-slate-900 flex items-center justify-center z-10 order-1 md:order-2">
                    <FileText className="h-8 w-8 text-white" />
                  </div>

                  <div className="md:w-1/2 md:pl-12 order-3">
                    <Card className="bg-slate-800/50 border-emerald-500/30 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">Paso 2</Badge>
                          <h3 className="text-2xl font-bold text-white">Firma de Contrato Digital</h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Firma tu contrato con EasyLex cumpliendo NOM-151. Certificación legal automática.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span>Firma electrónica NOM-151</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-emerald-400" />
                            <span>Certificado legal válido</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            <span>Protección PROFECO</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Step 3: Dashboard Access */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                    <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4 md:justify-end">
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">Paso 3</Badge>
                          <h3 className="text-2xl font-bold text-white">Acceso al Dashboard</h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Una vez firmado el contrato, accede a tu dashboard completo con todas las funciones.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Ver certificados disponibles</span>
                            <CheckCircle className="h-4 w-4 text-purple-400" />
                          </li>
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Calculadora de precios</span>
                            <CheckCircle className="h-4 w-4 text-purple-400" />
                          </li>
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Gestión de perfil</span>
                            <CheckCircle className="h-4 w-4 text-purple-400" />
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-slate-900 flex items-center justify-center z-10 order-1 md:order-2">
                    <Key className="h-8 w-8 text-white" />
                  </div>

                  <div className="md:w-1/2 md:pl-12 order-3"></div>
                </div>
              </div>

              {/* Step 4: Compra de Certificado */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="md:w-1/2 md:pr-12 order-2"></div>

                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 border-4 border-slate-900 flex items-center justify-center z-10 order-1 md:order-2">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>

                  <div className="md:w-1/2 md:pl-12 order-3">
                    <Card className="bg-slate-800/50 border-amber-500/30 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">Paso 4</Badge>
                          <h3 className="text-2xl font-bold text-white">Compra de Certificado</h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Selecciona personas (2-10 PAX) y duración (1-2 semanas). Pago seguro con Conekta o Stripe.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-amber-400" />
                            <span>Pago con tarjeta seguro</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-amber-400" />
                            <span>Precios desde $6,500 USD</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-amber-400" />
                            <span>Voucher digital inmediato</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Step 5: Selección de Semana */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                    <Card className="bg-slate-800/50 border-pink-500/30 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4 md:justify-end">
                          <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/40">Paso 5</Badge>
                          <h3 className="text-2xl font-bold text-white">Selección de Semana</h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Elige destino, fechas y propiedad. Sistema REQUEST → OFFER → CONFIRM en tiempo real.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Calendario interactivo</span>
                            <Calendar className="h-4 w-4 text-pink-400" />
                          </li>
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Verificación capacidad</span>
                            <CheckCircle className="h-4 w-4 text-pink-400" />
                          </li>
                          <li className="flex items-center gap-2 md:justify-end">
                            <span>Confirmación inmediata</span>
                            <CheckCircle className="h-4 w-4 text-pink-400" />
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 border-4 border-slate-900 flex items-center justify-center z-10 order-1 md:order-2">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>

                  <div className="md:w-1/2 md:pl-12 order-3"></div>
                </div>
              </div>

              {/* Step 6: Confirmación Final */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="md:w-1/2 md:pr-12 order-2"></div>

                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 border-4 border-slate-900 flex items-center justify-center z-10 order-1 md:order-2">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>

                  <div className="md:w-1/2 md:pl-12 order-3">
                    <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/40">Paso 6</Badge>
                          <h3 className="text-2xl font-bold text-white">Confirmación y Checkout</h3>
                        </div>
                        <p className="text-slate-300 mb-4">
                          Recibe tu tarjeta digital en Apple/Google Wallet con QR de acceso a la propiedad.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-green-400" />
                            <span>QR para cerradura inteligente</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-green-400" />
                            <span>Tarjeta en tu wallet</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-400" />
                            <span>Confirmación por email</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-blue-500/30 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">¿Listo para comenzar?</h3>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Únete a WEEK-CHAIN™ hoy y comienza a disfrutar de vacaciones sin complicaciones con cumplimiento legal
                  completo
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold"
                  >
                    <Link href="/auth/sign-up">
                      Crear mi Cuenta
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-800 bg-transparent"
                  >
                    <Link href="/destinos">Ver Destinos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
