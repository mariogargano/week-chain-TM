import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Globe,
  FileCheck,
  Lock,
  CheckCircle,
  Users,
  Scale,
  Building,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Clock,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Marco de Cumplimiento Global | WEEK-CHAIN",
  description:
    "Descubre cómo WEEK-CHAIN cumple con regulaciones de turismo en Europa, Américas y Asia mediante Smart Vacational Certificates conformes a NOM-151.",
}

export default async function CompliancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 py-32">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-float-delayed" />

        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-full px-6 py-2 mb-6">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Cumplimiento Global</span>
          </div>
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl leading-[1.1]">
            Marco de Cumplimiento <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              WEEK-CHAIN
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-pretty text-xl text-slate-300 md:text-2xl leading-relaxed">
            La primera plataforma de Smart Vacational Certificates diseñada para cumplir con las nuevas leyes globales
            de turismo
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">3</div>
              <div className="text-sm text-slate-300">Continentes</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-emerald-400 mb-1">30+</div>
              <div className="text-sm text-slate-300">Países Cubiertos</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400 mb-1">100%</div>
              <div className="text-sm text-slate-300">Certificación Digital</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Compliance Matters */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-[#0F1628] text-white">Por Qué Importa</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              El Desafío Regulatorio del Turismo Global
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              La industria turística enfrenta un paisaje regulatorio cada vez más complejo. WEEK-CHAIN fue construido
              desde cero para navegar estas complejidades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Fragmentación Global",
                desc: "Cada país tiene regulaciones únicas para derechos de uso vacacional, certificados digitales y protección al consumidor.",
                color: "blue",
                stat: "150+",
                statLabel: "Leyes Analizadas",
              },
              {
                icon: Scale,
                title: "Evolución Legislativa",
                desc: "Nuevas leyes como NOM-151 en México y GDPR en Europa requieren adaptación tecnológica constante.",
                color: "emerald",
                stat: "12",
                statLabel: "Actualizaciones/Año",
              },
              {
                icon: AlertTriangle,
                title: "Riesgos de Incumplimiento",
                desc: "Las plataformas tradicionales luchan por cumplir, exponiendo a usuarios y operadores a riesgos legales.",
                color: "amber",
                stat: "€20M+",
                statLabel: "Multas Evitadas",
              },
            ].map((item, i) => (
              <Card key={i} className={`border-2 hover:shadow-2xl transition-all relative overflow-hidden group`}>
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-${item.color}-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity`}
                />
                <CardHeader className="relative z-10">
                  <div
                    className={`h-14 w-14 rounded-xl bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-2xl font-bold text-${item.color}-600`}>{item.stat}</span>
                    <span className="text-xs text-slate-500">{item.statLabel}</span>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Evolución Regulatoria Global</h3>
            <div className="relative">
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 top-6"></div>
              <div className="grid grid-cols-4 gap-4 relative">
                {[
                  { year: "2008", event: "Directiva UE 2008/122/EC", region: "Europa", color: "blue" },
                  { year: "2016", event: "NOM-151 Certificación Digital", region: "México", color: "emerald" },
                  { year: "2018", event: "GDPR Implementado", region: "Europa", color: "blue" },
                  { year: "2024", event: "WEEK-CHAIN Lanzamiento", region: "Global", color: "purple" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full bg-${item.color}-500 flex items-center justify-center text-white font-bold shadow-lg mb-3 relative z-10`}
                    >
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className={`text-center bg-white rounded-xl p-3 shadow-md border-2 border-${item.color}-200`}>
                      <div className={`text-sm font-bold text-${item.color}-600 mb-1`}>{item.year}</div>
                      <div className="text-xs text-slate-900 font-medium mb-1">{item.event}</div>
                      <Badge variant="secondary" className="text-xs">
                        {item.region}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Compliance */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Cumplimiento Regional</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              WEEK-CHAIN opera en conformidad con las regulaciones específicas de cada región
            </p>
          </div>

          <div className="space-y-8">
            {/* Europa */}
            <Card className="border-2 border-blue-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Globe className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-1">Europa</CardTitle>
                      <CardDescription className="text-base">27 países cubiertos</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-sm">Activo</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Regulaciones Clave
                    </h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          Directiva 2008/122/EC sobre protección de consumidores en contratos de tiempo compartido
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>GDPR (Reglamento General de Protección de Datos)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>PSD2 (Directiva de Servicios de Pago)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Implementación WEEK-CHAIN
                    </h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Período de reflexión de 14 días implementado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Consentimiento GDPR con evidencia digital</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Procesamiento de pagos PSD2-conforme via Stripe</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Américas */}
            <Card className="border-2 border-emerald-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Globe className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-1">Américas</CardTitle>
                      <CardDescription className="text-base">Enfoque principal: México</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-sm">Activo</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Regulaciones Clave
                    </h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>NOM-029-SCFI-2010 (Tiempo Compartido)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>NOM-151-SCFI-2016 (Certificación Digital)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>LFPDPPP (Protección de Datos Personales)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>Regulaciones PROFECO</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      Implementación WEEK-CHAIN
                    </h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Contratos certificados digitalmente vía EasyLex (NOM-151)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Evidencia digital SHA-256 de cada transacción</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Registro PROFECO en proceso</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Aviso de privacidad conforme a LFPDPPP</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asia */}
            <Card className="border-2 border-purple-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Globe className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-1">Asia</CardTitle>
                      <CardDescription className="text-base">Mercados emergentes de lujo</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 text-sm">En Desarrollo</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Enfoque Regulatorio
                    </h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Adaptación a regulaciones locales de propiedad vacacional</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Cumplimiento con leyes de protección al consumidor</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Gestión de transacciones transfronterizas</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Plan de Expansión
                    </h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">→</span>
                        <span>Turquía (Bosphorus Yalı Villa ya disponible)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">→</span>
                        <span>Tailandia y Bali en roadmap 2026</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">→</span>
                        <span>Alianzas con PSC locales en evaluación</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Implementation */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Implementación Técnica</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Cómo WEEK-CHAIN garantiza el cumplimiento mediante tecnología avanzada
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileCheck,
                title: "Certificación Digital",
                desc: "Todos los contratos certificados vía PSC autorizado (EasyLex) conforme a NOM-151",
                badge: "NOM-151",
              },
              {
                icon: Lock,
                title: "Evidencia Inmutable",
                desc: "Hash SHA-256 de cada evento crítico almacenado en evidence_events",
                badge: "Blockchain-Ready",
              },
              {
                icon: Users,
                title: "Verificación KYC",
                desc: "Identidad verificada en tiempo real con evidencia digital completa",
                badge: "AML/KYC",
              },
              {
                icon: Shield,
                title: "Consentimiento Legal",
                desc: "Middleware requireConsent bloquea acciones sin aceptación de términos",
                badge: "PROFECO",
              },
            ].map((item, i) => (
              <Card key={i} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-400" />
                Stack Tecnológico de Cumplimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-400">Certificación Digital</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• EasyLex (PSC NOM-151)</li>
                    <li>• SHA-256 hashing</li>
                    <li>• Timestamp con zona horaria</li>
                    <li>• Firma electrónica avanzada</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-emerald-400">Gestión de Datos</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• Supabase con RLS policies</li>
                    <li>• Encriptación end-to-end</li>
                    <li>• Auditoría completa de accesos</li>
                    <li>• Backup automático diario</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-purple-400">Pagos Seguros</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• Stripe (Europa/USA)</li>
                    <li>• Conekta (México)</li>
                    <li>• PCI DSS Level 1 compliant</li>
                    <li>• 3D Secure 2.0</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Company Info */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Información Corporativa</h2>
          </div>

          <Card className="border-2 border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building className="h-6 w-6 text-slate-700" />
                WEEK-CHAIN SAPI de CV
              </CardTitle>
              <CardDescription className="text-base">Información legal y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">RFC</p>
                  <p className="text-slate-900">WCH240101XXX</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">Domicilio Fiscal</p>
                  <p className="text-slate-900">Tulum, Quintana Roo, México</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">Contacto Cumplimiento</p>
                  <a href="mailto:compliance@week-chain.com" className="text-blue-600 hover:underline">
                    compliance@week-chain.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">Contacto Legal</p>
                  <a href="mailto:legal@week-chain.com" className="text-blue-600 hover:underline">
                    legal@week-chain.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-16 w-16 text-blue-400 mx-auto mb-6" />
          <h2 className="mb-6 text-4xl md:text-5xl font-bold text-white tracking-tight">
            Construido para Cumplir, <br />
            Diseñado para Crecer
          </h2>
          <p className="mb-10 text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            WEEK-CHAIN no solo cumple con las regulaciones actuales, sino que está preparado para adaptarse a las
            futuras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="min-w-[240px] bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-base font-semibold h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
              className="min-w-[240px] border-2 border-white text-white hover:bg-white/10 text-base font-semibold h-14 rounded-xl transition-all duration-300 bg-white/5 backdrop-blur-sm"
            >
              <Link href="/legal">Ver Documentos Legales</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
