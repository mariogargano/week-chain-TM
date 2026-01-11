"use client"

import { useState } from "react"
import {
  Building2,
  Users,
  CreditCard,
  Globe,
  Shield,
  TrendingUp,
  Database,
  Code,
  Smartphone,
  Scale,
  Award,
  Target,
  DollarSign,
  BarChart3,
  Layers,
  Lock,
  FileText,
  CheckCircle,
  Printer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ValuationPage() {
  const [activeSection, setActiveSection] = useState("overview")

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white print:bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 print:py-8 print:bg-slate-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8 print:hidden">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Documento Confidencial</Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              WEEK-CHAIN<sup className="text-lg">™</sup>
            </h1>
            <p className="text-xl text-slate-300 mb-2">Documento de Valuación de Negocio</p>
            <p className="text-slate-400">
              Fecha: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl py-12 print:py-6">
        {/* Executive Summary */}
        <section className="mb-16 print:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF9AA2] to-[#C7CEEA] flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">1. Resumen Ejecutivo</h2>
          </div>

          <Card className="border-l-4 border-l-[#FF9AA2]">
            <CardContent className="p-6">
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>WEEK-CHAIN™</strong> es una plataforma tecnológica de servicios de tiempo compartido vacacional
                que digitaliza y moderniza la industria tradicional de tiempo compartido en México. La plataforma ofrece
                derechos personales de uso vacacional por semanas con una vigencia de 15 años, cumpliendo estrictamente
                con la <strong>Ley Federal de Protección al Consumidor (PROFECO)</strong> y la
                <strong>NOM-029-SCFI-2010</strong>.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#FF9AA2]">15</p>
                  <p className="text-sm text-slate-600">Años de Vigencia</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#FFB7B2]">52</p>
                  <p className="text-sm text-slate-600">Semanas/Propiedad</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#B5EAD7]">6%</p>
                  <p className="text-sm text-slate-600">Honorarios Broker</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#C7CEEA]">5+</p>
                  <p className="text-sm text-slate-600">Idiomas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Business Model */}
        <section className="mb-16 print:mb-8 print:break-before-page">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B5EAD7] to-[#E2F0CB] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">2. Modelo de Negocio</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#B5EAD7]" />
                  Fuentes de Ingreso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Venta de Derechos de Uso</p>
                    <p className="text-sm text-slate-600">Semanas vacacionales por 15 años ($3,500 - $8,000 USD)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">WEEK-Management™</p>
                    <p className="text-sm text-slate-600">Comisión del 15% por gestión de rentas en Airbnb</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">WEEK-Service™</p>
                    <p className="text-sm text-slate-600">Servicios de concierge premium (margen 20-30%)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">VA-FI™ (Próximamente)</p>
                    <p className="text-sm text-slate-600">Préstamos colateralizados con derechos de uso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C7CEEA]" />
                  Segmentos de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#FF9AA2]/20 text-[#FF9AA2] border-[#FF9AA2]/30">B2C</Badge>
                  <div>
                    <p className="font-medium">Compradores de Semanas</p>
                    <p className="text-sm text-slate-600">Usuarios finales que contratan derechos de uso vacacional</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#B5EAD7]/20 text-emerald-700 border-[#B5EAD7]/50">B2B</Badge>
                  <div>
                    <p className="font-medium">Intermediarios/Brokers</p>
                    <p className="text-sm text-slate-600">Red de intermediación comercial con honorarios del 6%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#C7CEEA]/20 text-indigo-700 border-[#C7CEEA]/50">B2B</Badge>
                  <div>
                    <p className="font-medium">Propietarios de Inmuebles</p>
                    <p className="text-sm text-slate-600">Dueños que integran propiedades a la plataforma</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#FFDAC1]/20 text-orange-700 border-[#FFDAC1]/50">B2B</Badge>
                  <div>
                    <p className="font-medium">Proveedores de Servicios</p>
                    <p className="text-sm text-slate-600">Concierge, limpieza, transporte, experiencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16 print:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C7CEEA] to-[#FF9AA2] flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">3. Stack Tecnológico</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF9AA2]"></div>
                    Next.js 15 (App Router)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FFB7B2]"></div>
                    React 19 con Server Components
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FFDAC1]"></div>
                    TypeScript 5.x
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E2F0CB]"></div>
                    Tailwind CSS 4.0
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#B5EAD7]"></div>
                    Framer Motion (animaciones)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C7CEEA]"></div>
                    shadcn/ui (componentes)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Backend & Database</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#B5EAD7]"></div>
                    Supabase (PostgreSQL)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E2F0CB]"></div>
                    Row Level Security (RLS)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FFDAC1]"></div>
                    Supabase Auth (autenticación)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FFB7B2]"></div>
                    API Routes (Next.js)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF9AA2]"></div>
                    Server Actions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C7CEEA]"></div>
                    67 tablas en producción
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Integraciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#635BFF]"></div>
                    Stripe (pagos internacionales)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00A1E4]"></div>
                    Conekta (pagos México)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#003087]"></div>
                    PayPal
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF5A5F]"></div>
                    OTA Sync (Airbnb, Booking)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4285F4]"></div>
                    Google OAuth
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00D4AA]"></div>
                    Resend (emails transaccionales)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Database Schema Summary */}
        <section className="mb-16 print:mb-8 print:break-before-page">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E2F0CB] to-[#B5EAD7] flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">4. Estructura de Base de Datos</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-6">
                La plataforma cuenta con <strong>67 tablas</strong> en PostgreSQL (Supabase) organizadas en los
                siguientes módulos:
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Core Business</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• properties (propiedades)</li>
                    <li>• weeks (semanas)</li>
                    <li>• reservations (reservaciones)</li>
                    <li>• week_tokens (tokens de semana)</li>
                    <li>• seasons (temporadas)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Usuarios & Auth</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• users (usuarios)</li>
                    <li>• profiles (perfiles)</li>
                    <li>• user_profiles (perfiles extendidos)</li>
                    <li>• admin_users (administradores)</li>
                    <li>• kyc_users (verificación)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Programa Broker</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• broker_levels (niveles)</li>
                    <li>• broker_commissions (honorarios)</li>
                    <li>• broker_elite_benefits (beneficios)</li>
                    <li>• broker_time_bonuses (bonos)</li>
                    <li>• referral_tree (árbol referidos)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Pagos & Escrow</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• escrow_deposits (depósitos)</li>
                    <li>• week_transactions (transacciones)</li>
                    <li>• week_balances (balances)</li>
                    <li>• rental_income (ingresos renta)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg opacity-60">
                  <h4 className="font-semibold text-slate-900 mb-2">VA-FI™ (Próximamente)</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• vafi_loans (préstamos)</li>
                    <li>• vafi_payments (pagos)</li>
                    <li>• vafi_liquidations (liquidaciones)</li>
                    <li className="text-xs italic">Módulo no habilitado actualmente</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Gestión & Social</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• nft_management (gestión)</li>
                    <li>• week_rentals (rentas)</li>
                    <li>• posts, comments, likes</li>
                    <li>• dao_proposals, dao_votes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Features & Functionality */}
        <section className="mb-16 print:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFDAC1] to-[#FFB7B2] flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">5. Funcionalidades de la Plataforma</h2>
          </div>

          <div className="space-y-6">
            {/* Public Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Páginas Públicas (20+)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-slate-50 rounded">Homepage con Hero animado</div>
                  <div className="p-3 bg-slate-50 rounded">Catálogo de Propiedades</div>
                  <div className="p-3 bg-slate-50 rounded">Detalle de Propiedad</div>
                  <div className="p-3 bg-slate-50 rounded">Programa Broker</div>
                  <div className="p-3 bg-slate-50 rounded">WEEK-Management</div>
                  <div className="p-3 bg-slate-50 rounded">WEEK-Service</div>
                  <div className="p-3 bg-slate-50 rounded opacity-60">VA-FI™ (Próximamente)</div>
                  <div className="p-3 bg-slate-50 rounded">Contacto</div>
                  <div className="p-3 bg-slate-50 rounded">FAQ / Ayuda</div>
                  <div className="p-3 bg-slate-50 rounded">Términos y Condiciones</div>
                  <div className="p-3 bg-slate-50 rounded">Política de Privacidad</div>
                  <div className="p-3 bg-slate-50 rounded">Política de Cookies</div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboards por Rol (8 tipos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-red-100 text-red-700">Admin</Badge>
                    <p className="text-sm text-slate-600">
                      35+ páginas de administración: usuarios, propiedades, pagos, KYC, escrow, analytics, etc.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-blue-100 text-blue-700">Usuario</Badge>
                    <p className="text-sm text-slate-600">
                      Mis semanas, certificado digital, préstamos, referidos, vouchers, seguridad
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-green-100 text-green-700">Broker</Badge>
                    <p className="text-sm text-slate-600">
                      Panel de honorarios, estadísticas, tarjeta digital, QR de referido
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-purple-100 text-purple-700">Owner</Badge>
                    <p className="text-sm text-slate-600">Gestión de propiedades, ventas, contratos, notificaciones</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-amber-100 text-amber-700">Notaría</Badge>
                    <p className="text-sm text-slate-600">Revisión legal de propiedades, validación de documentos</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-indigo-100 text-indigo-700">Of-Counsel</Badge>
                    <p className="text-sm text-slate-600">Asesoría legal, compliance, revisión de contratos</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-teal-100 text-teal-700">Management</Badge>
                    <p className="text-sm text-slate-600">Gestión de rentas, sincronización OTA, servicios</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2 bg-pink-100 text-pink-700">Service Provider</Badge>
                    <p className="text-sm text-slate-600">Proveedores de concierge, limpieza, experiencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Endpoints (80+)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">Pagos (15 endpoints)</h5>
                    <ul className="text-slate-600 space-y-1">
                      <li>• Stripe checkout/intent</li>
                      <li>• Conekta card/OXXO/SPEI</li>
                      <li>• PayPal create/capture</li>
                      <li>• Webhooks de confirmación</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Autenticación (12 endpoints)</h5>
                    <ul className="text-slate-600 space-y-1">
                      <li>• Login/Register/Logout</li>
                      <li>• Google OAuth</li>
                      <li>• 2FA (TOTP)</li>
                      <li>• Password reset</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Business (50+ endpoints)</h5>
                    <ul className="text-slate-600 space-y-1">
                      <li>• CRUD propiedades/semanas</li>
                      <li>• Reservaciones</li>
                      <li>• Broker commissions</li>
                      <li>• KYC, Escrow, Loans</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Legal Compliance */}
        <section className="mb-16 print:mb-8 print:break-before-page">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">6. Cumplimiento Legal</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Shield className="w-5 h-5" />
                  Normativas Cumplidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Ley Federal de Protección al Consumidor</p>
                    <p className="text-sm text-slate-600">Art. 65-65 BIS (Tiempo Compartido)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">NOM-029-SCFI-2010</p>
                    <p className="text-sm text-slate-600">Servicios de Tiempo Compartido</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">NOM-151-SCFI-2016</p>
                    <p className="text-sm text-slate-600">Conservación de mensajes de datos (certificación digital)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Ley Federal de Protección de Datos Personales</p>
                    <p className="text-sm text-slate-600">LFPDPPP - Tratamiento de datos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C7CEEA]" />
                  Documentación Legal Integrada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contrato de Derechos de Uso Vacacional</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Términos y Condiciones (multi-idioma)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Aviso de Privacidad</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Política de Cancelación (5 días hábiles)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contrato de Intermediación Comercial (Brokers)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="mb-16 print:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFB7B2] to-[#FFDAC1] flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">7. Ventajas Competitivas</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <Globe className="w-12 h-12 mx-auto mb-4 text-[#FF9AA2]" />
              <h3 className="font-bold text-lg mb-2">Alcance Global</h3>
              <p className="text-sm text-slate-600">
                Plataforma en 5+ idiomas (ES, EN, IT, FR, PT) con registro internacional de brokers
              </p>
            </Card>

            <Card className="text-center p-6">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-[#B5EAD7]" />
              <h3 className="font-bold text-lg mb-2">Pagos Flexibles</h3>
              <p className="text-sm text-slate-600">
                Stripe, Conekta, PayPal, OXXO, SPEI. Múltiples opciones para México e internacional
              </p>
            </Card>

            <Card className="text-center p-6">
              <Lock className="w-12 h-12 mx-auto mb-4 text-[#C7CEEA]" />
              <h3 className="font-bold text-lg mb-2">Certificación Digital</h3>
              <p className="text-sm text-slate-600">
                Certificados con validez legal NOM-151, QR verificable y trazabilidad completa
              </p>
            </Card>

            <Card className="text-center p-6">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-[#FFDAC1]" />
              <h3 className="font-bold text-lg mb-2">Tarjetas Digitales</h3>
              <p className="text-sm text-slate-600">Tarjetas de broker y certificados para Apple/Google Wallet</p>
            </Card>

            <Card className="text-center p-6">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#E2F0CB]" />
              <h3 className="font-bold text-lg mb-2">Gestión de Rentas</h3>
              <p className="text-sm text-slate-600">Sincronización automática con Airbnb y Booking.com (OTA Sync)</p>
            </Card>

            <Card className="text-center p-6">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#FFB7B2]" />
              <h3 className="font-bold text-lg mb-2">Analytics Avanzado</h3>
              <p className="text-sm text-slate-600">Dashboard administrativo con métricas en tiempo real y monitoreo</p>
            </Card>
          </div>
        </section>

        {/* Revenue Projections */}
        <section className="mb-16 print:mb-8 print:break-before-page">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B5EAD7] to-[#E2F0CB] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">8. Proyecciones de Ingresos</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Concepto</th>
                      <th className="text-right py-3 px-4">Año 1</th>
                      <th className="text-right py-3 px-4">Año 2</th>
                      <th className="text-right py-3 px-4">Año 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Propiedades Activas</td>
                      <td className="text-right py-3 px-4">5</td>
                      <td className="text-right py-3 px-4">15</td>
                      <td className="text-right py-3 px-4">30</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Semanas Vendidas</td>
                      <td className="text-right py-3 px-4">260</td>
                      <td className="text-right py-3 px-4">780</td>
                      <td className="text-right py-3 px-4">1,560</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Precio Promedio/Semana</td>
                      <td className="text-right py-3 px-4">$4,500 USD</td>
                      <td className="text-right py-3 px-4">$5,000 USD</td>
                      <td className="text-right py-3 px-4">$5,500 USD</td>
                    </tr>
                    <tr className="border-b bg-slate-50">
                      <td className="py-3 px-4 font-medium">Ingresos Venta Semanas</td>
                      <td className="text-right py-3 px-4 font-medium">$1,170,000</td>
                      <td className="text-right py-3 px-4 font-medium">$3,900,000</td>
                      <td className="text-right py-3 px-4 font-medium">$8,580,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Management (15%)</td>
                      <td className="text-right py-3 px-4">$87,750</td>
                      <td className="text-right py-3 px-4">$292,500</td>
                      <td className="text-right py-3 px-4">$643,500</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Servicios Concierge</td>
                      <td className="text-right py-3 px-4">$50,000</td>
                      <td className="text-right py-3 px-4">$200,000</td>
                      <td className="text-right py-3 px-4">$500,000</td>
                    </tr>
                    <tr className="bg-[#B5EAD7]/20">
                      <td className="py-3 px-4 font-bold">TOTAL INGRESOS</td>
                      <td className="text-right py-3 px-4 font-bold">$1,307,750</td>
                      <td className="text-right py-3 px-4 font-bold">$4,392,500</td>
                      <td className="text-right py-3 px-4 font-bold">$9,723,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                * Proyecciones basadas en mercado mexicano de tiempo compartido. Valores en USD.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Assets Summary */}
        <section className="mb-16 print:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C7CEEA] to-[#FF9AA2] flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">9. Resumen de Activos</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activos de Código</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between py-2 border-b">
                    <span>Archivos de código fuente</span>
                    <span className="font-mono font-medium">700+</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span>Componentes React</span>
                    <span className="font-mono font-medium">140+</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span>Páginas/Rutas</span>
                    <span className="font-mono font-medium">110+</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span>API Endpoints</span>
                    <span className="font-mono font-medium">80+</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span>Tablas de Base de Datos</span>
                    <span className="font-mono font-medium">67</span>
                  </li>
                  <li className="flex justify-between py-2">
                    <span>Líneas de código estimadas</span>
                    <span className="font-mono font-medium">100,000+</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activos de Marca</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between py-2 border-b">
                    <span>Marca Principal</span>
                    <span className="font-medium">WEEK-CHAIN™</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span>Sub-marcas</span>
                    <span className="font-medium">WEEK-Management™, WEEK-Service™, VA-FI™ (próximamente)</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span>Dominio</span>
                    <span className="font-mono">week-chain.com</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span>Paleta de colores</span>
                    <span className="font-medium">6 colores de marca</span>
                  </li>
                  <li className="flex justify-between py-2">
                    <span>Manual de marca</span>
                    <span className="font-medium">Disponible</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section className="print:break-before-page">
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Información de Contacto</h2>
              <p className="text-slate-300 mb-6">
                Para más información sobre esta valuación o discutir oportunidades de inversión:
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                <div>
                  <p className="text-slate-400 text-sm">Website</p>
                  <p className="font-medium">www.week-chain.com</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="font-medium">info@week-chain.com</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Fecha del Documento</p>
                  <p className="font-medium">{new Date().toLocaleDateString("es-MX")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-before-page {
            break-before: page;
          }
        }
      `}</style>
    </div>
  )
}
