import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import { Users, Building2, Shield, CreditCard, Calendar, FileText, CheckCircle2, ArrowRight, Database, Globe, Wallet, Award, UserCheck, Briefcase, Scale, Home, TrendingUp, MessageSquare, Bell, Settings, BarChart3, Gavel, DollarSign, RefreshCw, Layers,  } from "lucide-react";

export const metadata: Metadata = {
  title: "Explicativo de Funcionamiento | WEEK-CHAIN",
  description:
    "Documentacion completa del funcionamiento de la plataforma WEEK-CHAIN: arquitectura, roles, flujos y sistemas.",
}

export default function ExplicativoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-6 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Documentacion Tecnica
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Explicativo de Funcionamiento
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                WEEK-CHAIN
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              Guia completa de la arquitectura, roles, flujos y sistemas que componen la plataforma de Smart Vacational
              Certificates
            </p>
          </div>
        </div>
      </section>

      {/* Tabla de Contenidos */}
      <section className="py-8 px-4 border-b border-slate-800">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-xl font-bold text-white mb-4">Indice</h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            {[
              "1. Vision General",
              "2. Arquitectura del Sistema",
              "3. Roles de Usuario",
              "4. Flujo de Compra",
              "5. Sistema de Reservaciones",
              "6. Programa de Brokers",
              "7. Sistema de Pagos",
              "8. Compliance y Legal",
              "9. Administracion",
              "10. Integraciones",
            ].map((item, i) => (
              <a key={i} href={`#section-${i + 1}`} className="text-slate-400 hover:text-blue-400 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Seccion 1: Vision General */}
      <section id="section-1" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">1. Vision General</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Que es WEEK-CHAIN</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <p>
                  WEEK-CHAIN es una plataforma de <strong>Smart Vacational Certificates (SVC)</strong> que permite a los
                  usuarios adquirir certificados que otorgan derecho de solicitud de uso vacacional por 15 anos en una
                  red de destinos participantes.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-300 text-sm">
                    <strong>Importante:</strong> Los certificados NO constituyen propiedad inmobiliaria. Son derechos de
                    uso temporal sujetos a disponibilidad y terminos del contrato.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Modelo de Negocio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Pago unico por certificado (sin cuotas de mantenimiento)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>15 anos de derecho de solicitud de uso</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Sistema REQUEST-OFFER-CONFIRM (no calendario fijo)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Red de destinos en expansion (Mexico, Albania, Turquia, Italia)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>100% conforme NOM-151, NOM-029 y PROFECO</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seccion 2: Arquitectura */}
      <section id="section-2" className="py-16 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Database className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">2. Arquitectura del Sistema</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Frontend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300 text-sm">
                <p>Next.js 15 con App Router</p>
                <p>React 19</p>
                <p>TypeScript</p>
                <p>Tailwind CSS</p>
                <p>Shadcn UI Components</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Backend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300 text-sm">
                <p>Supabase PostgreSQL</p>
                <p>94 tablas relacionales</p>
                <p>Row Level Security (RLS)</p>
                <p>API Routes de Next.js</p>
                <p>Inngest (jobs asincronos)</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-lg">Integraciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300 text-sm">
                <p>Conekta (pagos MX)</p>
                <p>Stripe (pagos internacionales)</p>
                <p>Resend (emails)</p>
                <p>EasyLex (NOM-151)</p>
                <p>Apple/Google Wallet</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Estructura de Base de Datos Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Usuarios</h4>
                  <ul className="text-slate-400 space-y-1">
                    <li>users</li>
                    <li>profiles</li>
                    <li>user_two_factor</li>
                    <li>kyc_users</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Propiedades</h4>
                  <ul className="text-slate-400 space-y-1">
                    <li>properties</li>
                    <li>weeks</li>
                    <li>week_tokens</li>
                    <li>seasons</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">Transacciones</h4>
                  <ul className="text-slate-400 space-y-1">
                    <li>reservations</li>
                    <li>payments</li>
                    <li>fiat_payments</li>
                    <li>vouchers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">Brokers</h4>
                  <ul className="text-slate-400 space-y-1">
                    <li>broker_levels</li>
                    <li>broker_commissions</li>
                    <li>referral_tree</li>
                    <li>commissions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seccion 3: Roles */}
      <section id="section-3" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">3. Roles de Usuario</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                role: "Usuario (Miembro)",
                icon: <UserCheck className="h-6 w-6" />,
                color: "blue",
                permisos: [
                  "Comprar certificados",
                  "Solicitar reservaciones",
                  "Ver historial de estancias",
                  "Descargar documentos legales",
                  "Gestionar perfil y 2FA",
                ],
                dashboard: "/dashboard/user",
              },
              {
                role: "Broker",
                icon: <Briefcase className="h-6 w-6" />,
                color: "emerald",
                permisos: [
                  "Referir nuevos usuarios",
                  "Ver comisiones ganadas",
                  "Acceder a materiales marketing",
                  "Calculadora de comisiones",
                  "Subir de nivel (6 niveles)",
                ],
                dashboard: "/dashboard/broker",
              },
              {
                role: "Broker Elite",
                icon: <Award className="h-6 w-6" />,
                color: "amber",
                permisos: [
                  "Todo lo de Broker +",
                  "Semanas de uso gratis anuales",
                  "Bonos especiales por ventas",
                  "Acceso a propiedades exclusivas",
                  "Retiro anticipado de comisiones",
                ],
                dashboard: "/broker-elite/dashboard",
              },
              {
                role: "Owner (Propietario)",
                icon: <Home className="h-6 w-6" />,
                color: "purple",
                permisos: [
                  "Someter propiedades",
                  "Firmar contratos digitales",
                  "Ver ventas de semanas",
                  "Recibir pagos",
                  "Ver notificaciones",
                ],
                dashboard: "/dashboard/owner",
              },
              {
                role: "Notario",
                icon: <Gavel className="h-6 w-6" />,
                color: "red",
                permisos: [
                  "Revisar propiedades sometidas",
                  "Validar documentacion legal",
                  "Aprobar/rechazar submissions",
                  "Firmar contratos",
                ],
                dashboard: "/dashboard/notaria",
              },
              {
                role: "Admin",
                icon: <Settings className="h-6 w-6" />,
                color: "slate",
                permisos: [
                  "Gestion completa del sistema",
                  "Aprobar KYC",
                  "Gestionar propiedades",
                  "Ver analytics",
                  "Configurar sistema",
                ],
                dashboard: "/dashboard/admin",
              },
            ].map((item, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-${item.color}-500/20 flex items-center justify-center text-${item.color}-400`}>
                      {item.icon}
                    </div>
                    <CardTitle className="text-white text-lg">{item.role}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300 mb-4">
                    {item.permisos.map((permiso, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{permiso}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500">Dashboard: {item.dashboard}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seccion 4: Flujo de Compra */}
      <section id="section-4" className="py-16 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">4. Flujo de Compra de Certificados</h2>
          </div>

          <div className="grid gap-4 max-w-4xl">
            {[
              {
                paso: 1,
                titulo: "Registro y Verificacion",
                descripcion:
                  "Usuario crea cuenta (email, Google o wallet). Acepta terminos y condiciones. Opcionalmente completa KYC.",
                tabla: "users, profiles, terms_acceptance, kyc_users",
              },
              {
                paso: 2,
                titulo: "Exploracion de Destinos",
                descripcion:
                  "Usuario navega catalogo de propiedades. Cada propiedad tiene 52 semanas con precios por temporada.",
                tabla: "properties, weeks, seasons, week_seasons",
              },
              {
                paso: 3,
                titulo: "Seleccion de Semana",
                descripcion:
                  "Usuario selecciona semana disponible. El precio varia segun temporada (Alta, Media, Baja, Premium).",
                tabla: "weeks (status = 'available')",
              },
              {
                paso: 4,
                titulo: "Creacion de Reservacion",
                descripcion:
                  "Se crea registro de reservacion con estado 'pending'. Se genera ID unico y se bloquea la semana temporalmente.",
                tabla: "reservations (status = 'pending')",
              },
              {
                paso: 5,
                titulo: "Pago",
                descripcion:
                  "Usuario selecciona metodo: Tarjeta (Conekta), SPEI, OXXO, o Stripe. Se procesa el pago y se registra.",
                tabla: "payments, fiat_payments",
              },
              {
                paso: 6,
                titulo: "Confirmacion",
                descripcion:
                  "Al confirmar pago, reservacion cambia a 'confirmed'. Se actualiza semana a 'sold'. Se asigna wallet del usuario.",
                tabla: "reservations (status = 'confirmed'), weeks (status = 'sold')",
              },
              {
                paso: 7,
                titulo: "Emision de Certificado",
                descripcion:
                  "Se genera certificado digital. Se envia email de confirmacion. Se crea registro en Apple/Google Wallet.",
                tabla: "week_tokens, nft_provisional",
              },
              {
                paso: 8,
                titulo: "Comisiones",
                descripcion:
                  "Si hay broker referidor, se calculan comisiones segun nivel. Se registra en broker_commissions.",
                tabla: "broker_commissions, commissions, referral_tree",
              },
            ].map((item, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {item.paso}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{item.titulo}</h3>
                      <p className="text-slate-300 text-sm mb-3">{item.descripcion}</p>
                      <p className="text-xs text-slate-500 font-mono">Tablas: {item.tabla}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seccion 5: Sistema de Reservaciones */}
      <section id="section-5" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">5. Sistema de Reservaciones (REQUEST-OFFER-CONFIRM)</h2>
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50 mb-8">
            <CardContent className="p-6">
              <p className="text-slate-300 mb-6">
                A diferencia de tiempos compartidos tradicionales, WEEK-CHAIN usa un sistema de{" "}
                <strong className="text-white">solicitud de uso</strong> que no garantiza fechas fijas, sino que permite
                al usuario solicitar fechas y recibir ofertas basadas en disponibilidad real.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">1. REQUEST</h3>
                  <p className="text-slate-400 text-sm">
                    Usuario solicita fechas deseadas. Sistema verifica disponibilidad en la red de destinos.
                  </p>
                </div>

                <div className="text-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">2. OFFER</h3>
                  <p className="text-slate-400 text-sm">
                    Sistema genera ofertas disponibles. Usuario recibe opciones con fechas y destinos alternativos.
                  </p>
                </div>

                <div className="text-center p-6 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">3. CONFIRM</h3>
                  <p className="text-slate-400 text-sm">
                    Usuario acepta oferta. Se bloquea la fecha y se genera confirmacion de estancia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Estados de Reservacion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { estado: "pending", desc: "Reservacion creada, esperando pago" },
                    { estado: "payment_pending", desc: "Pago en proceso" },
                    { estado: "confirmed", desc: "Pago completado, reservacion activa" },
                    { estado: "cancelled", desc: "Cancelada por usuario o sistema" },
                    { estado: "refunded", desc: "Reembolso procesado" },
                    { estado: "expired", desc: "Tiempo de pago expirado" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <code className="text-emerald-400 text-sm">{item.estado}</code>
                      <span className="text-slate-400 text-sm">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Temporadas y Precios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { temporada: "Premium", multiplicador: "2.0x", color: "text-amber-400" },
                    { temporada: "Alta", multiplicador: "1.5x", color: "text-red-400" },
                    { temporada: "Media", multiplicador: "1.0x", color: "text-blue-400" },
                    { temporada: "Baja", multiplicador: "0.7x", color: "text-emerald-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className={`font-medium ${item.color}`}>{item.temporada}</span>
                      <span className="text-white font-mono">{item.multiplicador}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seccion 6: Programa de Brokers */}
      <section id="section-6" className="py-16 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">6. Programa de Brokers (MLM 6 Niveles)</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Estructura de Niveles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nivel: 1, nombre: "Starter", comision: "5%", requisito: "Registro aprobado" },
                    { nivel: 2, nombre: "Builder", comision: "7%", requisito: "3 referidos + 2 semanas" },
                    { nivel: 3, nombre: "Achiever", comision: "10%", requisito: "10 referidos + 5 semanas" },
                    { nivel: 4, nombre: "Leader", comision: "12%", requisito: "25 referidos + 15 semanas" },
                    { nivel: 5, nombre: "Director", comision: "15%", requisito: "50 referidos + 30 semanas" },
                    { nivel: 6, nombre: "Elite", comision: "18%", requisito: "100 referidos + 75 semanas" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                          {item.nivel}
                        </span>
                        <span className="text-white font-medium">{item.nombre}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{item.comision}</span>
                        <p className="text-slate-500 text-xs">{item.requisito}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Comisiones Multinivel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <p className="text-sm">El sistema soporta comisiones en cascada hasta 3 niveles de profundidad:</p>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <span className="text-blue-400 font-medium">Nivel 1 (Directo):</span>
                    <span className="text-white ml-2">Comision segun nivel del broker</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <span className="text-emerald-400 font-medium">Nivel 2 (Indirecto):</span>
                    <span className="text-white ml-2">2% del monto de venta</span>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <span className="text-purple-400 font-medium">Nivel 3 (Terciario):</span>
                    <span className="text-white ml-2">1% del monto de venta</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Tablas: broker_levels, broker_commissions, referral_tree, commissions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seccion 7: Sistema de Pagos */}
      <section id="section-7" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">7. Sistema de Pagos</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { metodo: "Tarjeta de Credito/Debito", provider: "Conekta", icono: <CreditCard className="h-6 w-6" /> },
              { metodo: "SPEI", provider: "Conekta", icono: <RefreshCw className="h-6 w-6" /> },
              { metodo: "OXXO", provider: "Conekta", icono: <Building2 className="h-6 w-6" /> },
              { metodo: "Internacional", provider: "Stripe", icono: <Globe className="h-6 w-6" /> },
            ].map((item, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-300">
                    {item.icono}
                  </div>
                  <h3 className="text-white font-medium mb-1">{item.metodo}</h3>
                  <p className="text-slate-500 text-sm">{item.provider}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Flujo de Pago con Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4 text-center">
                {[
                  "Usuario inicia pago",
                  "Se crea orden en Conekta/Stripe",
                  "Usuario completa pago",
                  "Webhook recibe confirmacion",
                  "Sistema actualiza reservacion",
                ].map((paso, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold mb-2">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 text-sm">{paso}</p>
                    {i < 4 && <ArrowRight className="h-5 w-5 text-slate-600 mt-2 hidden md:block" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-6">
                Endpoints: /api/payments/conekta/*, /api/webhooks/conekta, /api/webhooks/stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seccion 8: Compliance */}
      <section id="section-8" className="py-16 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Scale className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">8. Compliance y Marco Legal</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Regulaciones Cumplidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    norma: "NOM-151-SCFI",
                    desc: "Conservacion de mensajes de datos y digitalizacion de documentos",
                    provider: "EasyLex",
                  },
                  {
                    norma: "NOM-029-SCFI",
                    desc: "Practicas comerciales para tiempos compartidos",
                    provider: "Interno",
                  },
                  { norma: "PROFECO", desc: "Proteccion al consumidor", provider: "Interno" },
                  { norma: "GDPR", desc: "Proteccion de datos (usuarios EU)", provider: "Interno" },
                  { norma: "PCI-DSS", desc: "Seguridad de datos de tarjetas", provider: "Conekta/Stripe" },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-emerald-400 font-medium">{item.norma}</span>
                      <Badge variant="outline" className="text-slate-400 border-slate-600">
                        {item.provider}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Sistemas de Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <div>
                  <h4 className="text-white font-medium mb-2">KYC (Know Your Customer)</h4>
                  <p className="text-sm text-slate-400">
                    Verificacion de identidad para compras mayores. Tabla: kyc_users, kyc_documents
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Aceptacion de Terminos</h4>
                  <p className="text-sm text-slate-400">
                    Clickwrap con firma digital, IP, timestamp. Tabla: terms_acceptance, legal_acceptances
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Audit Logs</h4>
                  <p className="text-sm text-slate-400">
                    Registro de todas las acciones criticas. Tabla: audit_logs, compliance_audit_log
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Deteccion de Fraude</h4>
                  <p className="text-sm text-slate-400">
                    Sistema de alertas automaticas. Tabla: fraud_alerts
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seccion 9: Administracion */}
      <section id="section-9" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">9. Panel de Administracion</h2>
          </div>

          <p className="text-slate-300 mb-8">
            El dashboard de administracion (/dashboard/admin) incluye mas de 40 secciones para gestionar todos los
            aspectos de la plataforma:
          </p>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { seccion: "Analytics", ruta: "/analytics", icono: <BarChart3 className="h-5 w-5" /> },
              { seccion: "Propiedades", ruta: "/properties", icono: <Building2 className="h-5 w-5" /> },
              { seccion: "Usuarios", ruta: "/users", icono: <Users className="h-5 w-5" /> },
              { seccion: "Pagos", ruta: "/payments", icono: <CreditCard className="h-5 w-5" /> },
              { seccion: "KYC", ruta: "/kyc", icono: <UserCheck className="h-5 w-5" /> },
              { seccion: "Reservaciones", ruta: "/bookings", icono: <Calendar className="h-5 w-5" /> },
              { seccion: "Vouchers", ruta: "/vouchers", icono: <FileText className="h-5 w-5" /> },
              { seccion: "Email Templates", ruta: "/email-templates", icono: <Bell className="h-5 w-5" /> },
              { seccion: "Webhooks", ruta: "/webhooks", icono: <RefreshCw className="h-5 w-5" /> },
              { seccion: "Compliance", ruta: "/compliance", icono: <Shield className="h-5 w-5" /> },
              { seccion: "Testimonios", ruta: "/testimonials", icono: <MessageSquare className="h-5 w-5" /> },
              { seccion: "Capacidad", ruta: "/capacity-risk", icono: <Layers className="h-5 w-5" /> },
            ].map((item, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400">
                    {item.icono}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.seccion}</p>
                    <p className="text-slate-500 text-xs">/dashboard/admin{item.ruta}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seccion 10: Integraciones */}
      <section id="section-10" className="py-16 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Layers className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">10. Integraciones Externas</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                nombre: "Supabase",
                tipo: "Database & Auth",
                uso: "PostgreSQL, autenticacion, RLS, storage",
                env: "SUPABASE_URL, SUPABASE_ANON_KEY",
              },
              {
                nombre: "Conekta",
                tipo: "Pagos MX",
                uso: "Tarjeta, SPEI, OXXO para Mexico",
                env: "CONEKTA_SECRET_KEY",
              },
              {
                nombre: "Stripe",
                tipo: "Pagos INT",
                uso: "Pagos internacionales, subscripciones",
                env: "STRIPE_SECRET_KEY",
              },
              {
                nombre: "Resend",
                tipo: "Email",
                uso: "Envio de emails transaccionales",
                env: "RESEND_API_KEY",
              },
              {
                nombre: "EasyLex",
                tipo: "Legal",
                uso: "Firma electronica NOM-151",
                env: "EASYLEX_API_KEY",
              },
              {
                nombre: "Inngest",
                tipo: "Jobs",
                uso: "Procesos asincronos, cron jobs",
                env: "INNGEST_SIGNING_KEY",
              },
            ].map((item, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">{item.nombre}</h3>
                    <Badge className="bg-slate-700 text-slate-300">{item.tipo}</Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{item.uso}</p>
                  <p className="text-xs text-slate-500 font-mono">{item.env}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resumen Final */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-purple-500/10 border-blue-500/30">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Resumen de la Plataforma</h2>
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-4xl font-bold text-blue-400">94</p>
                  <p className="text-slate-400 text-sm">Tablas en BD</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-emerald-400">200+</p>
                  <p className="text-slate-400 text-sm">API Endpoints</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-purple-400">6</p>
                  <p className="text-slate-400 text-sm">Roles de Usuario</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-amber-400">4</p>
                  <p className="text-slate-400 text-sm">Paises Destino</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/como-funciona">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white"
                  >
                    Ver Como Funciona
                  </Button>
                </Link>
                <Link href="/dashboard/admin">
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent">
                    Ir al Admin
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
