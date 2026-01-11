import Link from "next/link"
import { Cookie, Shield, Settings, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Cookie className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Política de Cookies</h1>
          <p className="text-lg text-slate-600">Información sobre el uso de cookies en WEEK-CHAIN</p>
        </div>

        <div className="space-y-8">
          {/* Qué son las cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-blue-600" />
                ¿Qué son las cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro
                sitio web. Nos ayudan a mejorar su experiencia, recordar sus preferencias y analizar cómo utiliza
                nuestra plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Tipos de cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Tipos de Cookies que Utilizamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cookies esenciales */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Esenciales</Badge>
                  <span className="text-sm text-slate-500">Siempre activas</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Cookies necesarias:</strong> Permiten la navegación básica y el acceso a áreas seguras. Sin
                  estas cookies, la plataforma no puede funcionar correctamente.
                </p>
                <ul className="list-disc list-inside text-slate-600 ml-4 space-y-1">
                  <li>Autenticación de sesión</li>
                  <li>Seguridad y prevención de fraude</li>
                  <li>Preferencias de idioma</li>
                  <li>Carrito de compra</li>
                </ul>
              </div>

              {/* Cookies funcionales */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Funcionales</Badge>
                  <span className="text-sm text-slate-500">Opcionales</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Cookies de funcionalidad:</strong> Mejoran la experiencia recordando sus elecciones y
                  preferencias.
                </p>
                <ul className="list-disc list-inside text-slate-600 ml-4 space-y-1">
                  <li>Recordar inicio de sesión</li>
                  <li>Preferencias de visualización</li>
                  <li>Configuración de notificaciones</li>
                </ul>
              </div>

              {/* Cookies analíticas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-600 text-green-600">
                    Analíticas
                  </Badge>
                  <span className="text-sm text-slate-500">Opcionales</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Cookies de análisis:</strong> Nos ayudan a entender cómo los usuarios interactúan con la
                  plataforma.
                </p>
                <ul className="list-disc list-inside text-slate-600 ml-4 space-y-1">
                  <li>Google Analytics (anonimizado)</li>
                  <li>Métricas de rendimiento</li>
                  <li>Análisis de comportamiento</li>
                </ul>
              </div>

              {/* Cookies de marketing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-600 text-orange-600">
                    Marketing
                  </Badge>
                  <span className="text-sm text-slate-500">Opcionales</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Cookies de publicidad:</strong> Se utilizan para mostrar anuncios relevantes y medir la
                  efectividad de campañas.
                </p>
                <ul className="list-disc list-inside text-slate-600 ml-4 space-y-1">
                  <li>Publicidad personalizada</li>
                  <li>Retargeting</li>
                  <li>Seguimiento de conversiones</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cookies de terceros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-600" />
                Cookies de Terceros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Utilizamos servicios de terceros que pueden establecer sus propias cookies:
              </p>
              <div className="grid gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Stripe</h4>
                  <p className="text-sm text-slate-600">Procesamiento de pagos y prevención de fraude</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Google Analytics</h4>
                  <p className="text-sm text-slate-600">Análisis de tráfico y comportamiento (anonimizado)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Vercel</h4>
                  <p className="text-sm text-slate-600">Hosting y optimización de rendimiento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestionar cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Cómo Gestionar las Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Puede controlar y eliminar cookies a través de la configuración de su navegador:
              </p>
              <ul className="list-disc list-inside text-slate-600 ml-4 space-y-2">
                <li>
                  <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies
                </li>
                <li>
                  <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies
                </li>
                <li>
                  <strong>Safari:</strong> Preferencias → Privacidad → Cookies
                </li>
                <li>
                  <strong>Edge:</strong> Configuración → Privacidad → Cookies
                </li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-900">
                  <strong>Nota:</strong> Bloquear todas las cookies puede afectar la funcionalidad de la plataforma. Las
                  cookies esenciales son necesarias para el correcto funcionamiento del sitio.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Más información */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Más Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Para más información sobre cómo protegemos su privacidad, consulte:
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/privacy">
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                    Política de Privacidad
                  </Badge>
                </Link>
                <Link href="/legal/terms">
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                    Términos y Condiciones
                  </Badge>
                </Link>
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Contacto:</strong> Para preguntas sobre cookies, escriba a{" "}
                  <a href="mailto:privacy@week-chain.com" className="text-blue-600 hover:underline">
                    privacy@week-chain.com
                  </a>
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Última actualización:{" "}
                  {new Date().toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
