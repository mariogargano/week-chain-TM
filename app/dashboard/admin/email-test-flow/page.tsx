import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar"
import { CheckCircle2, XCircle, AlertCircle, Play, Database, Mail, User } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface TestResult {
  step: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  details?: any
}

async function runEmailSystemTests(): Promise<TestResult[]> {
  const results: TestResult[] = []
  const supabase = await createClient()

  // Test 1: Check if email tables exist
  try {
    const { error: templatesError } = await supabase.from("email_templates").select("count").limit(1)

    if (templatesError) {
      results.push({
        step: "1. Verificar Tablas de Email",
        status: "error",
        message: "Las tablas de email NO existen en la base de datos",
        details: {
          error: templatesError.message,
          solution: "Ejecuta el script: scripts/093_email_automation_complete_setup.sql",
        },
      })
    } else {
      results.push({
        step: "1. Verificar Tablas de Email",
        status: "success",
        message: "Tablas de email existen correctamente",
      })
    }
  } catch (error) {
    results.push({
      step: "1. Verificar Tablas de Email",
      status: "error",
      message: "Error al verificar tablas",
      details: error,
    })
  }

  // Test 2: Check if default templates are seeded
  try {
    const { data: templates, error } = await supabase.from("email_templates").select("*").eq("is_active", true)

    if (error) {
      results.push({
        step: "2. Verificar Templates",
        status: "error",
        message: "No se pueden consultar templates",
        details: error,
      })
    } else if (!templates || templates.length === 0) {
      results.push({
        step: "2. Verificar Templates",
        status: "warning",
        message: "No hay templates seeded",
        details: {
          solution: "Ejecuta el script para seed templates por defecto",
        },
      })
    } else {
      results.push({
        step: "2. Verificar Templates",
        status: "success",
        message: `${templates.length} templates activos encontrados`,
        details: {
          templates: templates.map((t) => ({ type: t.type, name: t.name })),
        },
      })
    }
  } catch (error) {
    results.push({
      step: "2. Verificar Templates",
      status: "error",
      message: "Error al consultar templates",
      details: error,
    })
  }

  // Test 3: Check admin access
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      results.push({
        step: "3. Verificar Acceso Admin",
        status: "error",
        message: "Usuario no autenticado",
      })
    } else {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role === "admin") {
        results.push({
          step: "3. Verificar Acceso Admin",
          status: "success",
          message: "Usuario tiene rol de admin",
          details: { email: user.email, role: profile.role },
        })
      } else {
        results.push({
          step: "3. Verificar Acceso Admin",
          status: "error",
          message: "Usuario NO tiene permisos de admin",
          details: { role: profile?.role || "unknown" },
        })
      }
    }
  } catch (error) {
    results.push({
      step: "3. Verificar Acceso Admin",
      status: "error",
      message: "Error al verificar permisos",
      details: error,
    })
  }

  // Test 4: Check Resend API Key
  try {
    const hasResendKey = !!process.env.RESEND_API_KEY

    if (hasResendKey) {
      results.push({
        step: "4. Verificar Resend API",
        status: "success",
        message: "RESEND_API_KEY está configurada",
      })
    } else {
      results.push({
        step: "4. Verificar Resend API",
        status: "error",
        message: "RESEND_API_KEY NO está configurada",
        details: {
          solution: "Agrega RESEND_API_KEY a las variables de entorno",
        },
      })
    }
  } catch (error) {
    results.push({
      step: "4. Verificar Resend API",
      status: "error",
      message: "Error al verificar configuración",
      details: error,
    })
  }

  // Test 5: Check email logs table
  try {
    const { data: logs, error } = await supabase.from("email_logs").select("count").limit(1)

    if (error) {
      results.push({
        step: "5. Verificar Email Logs",
        status: "error",
        message: "Tabla email_logs no accesible",
        details: error,
      })
    } else {
      results.push({
        step: "5. Verificar Email Logs",
        status: "success",
        message: "Tabla email_logs está operacional",
      })
    }
  } catch (error) {
    results.push({
      step: "5. Verificar Email Logs",
      status: "error",
      message: "Error al verificar logs",
      details: error,
    })
  }

  return results
}

export default async function EmailTestFlowPage() {
  const testResults = await runEmailSystemTests()

  const successCount = testResults.filter((r) => r.status === "success").length
  const errorCount = testResults.filter((r) => r.status === "error").length
  const warningCount = testResults.filter((r) => r.status === "warning").length
  const allPassed = errorCount === 0

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Test Flow de Email Automation</h1>
              <p className="text-slate-600 mt-1">Verificación exhaustiva del sistema completo</p>
            </div>
            <Link href="/dashboard/admin/email-automation">
              <Button variant="outline">Volver</Button>
            </Link>
          </div>

          {/* Summary Card */}
          <Card className={allPassed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {allPassed ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    Sistema Listo para Producción
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    Problemas Detectados - Requiere Atención
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {successCount} exitosos • {errorCount} errores • {warningCount} advertencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                  <p className="text-sm text-slate-600">Exitosos</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-sm text-slate-600">Errores</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                  <p className="text-sm text-slate-600">Advertencias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados del Test</CardTitle>
              <CardDescription>Verificación paso a paso del sistema de email automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {result.status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {result.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                        {result.status === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                        {result.status === "pending" && <Play className="w-5 h-5 text-blue-500" />}

                        <h4 className="font-semibold text-slate-900">{result.step}</h4>
                      </div>

                      <p className="text-sm text-slate-600 mb-2">{result.message}</p>

                      {result.details && (
                        <details className="text-xs bg-slate-50 p-3 rounded border mt-2">
                          <summary className="cursor-pointer font-medium text-slate-700">Ver detalles</summary>
                          <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(result.details, null, 2)}</pre>
                        </details>
                      )}
                    </div>

                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!allPassed && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Acción Requerida:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-red-800">
                    <li>Ejecuta el script SQL: scripts/093_email_automation_complete_setup.sql</li>
                    <li>Verifica que RESEND_API_KEY esté configurada en las variables de entorno</li>
                    <li>Asegúrate de tener rol 'admin' en la tabla profiles</li>
                    <li>Recarga esta página para verificar nuevamente</li>
                  </ol>
                </div>
              )}

              {allPassed && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Sistema Operacional</h4>
                    <p className="text-sm text-green-800">Todos los componentes están funcionando correctamente.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Link href="/dashboard/admin/email-automation/test">
                      <Button className="w-full" variant="default">
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Email de Prueba
                      </Button>
                    </Link>

                    <Link href="/dashboard/admin/email-templates">
                      <Button className="w-full bg-transparent" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        Gestionar Templates
                      </Button>
                    </Link>
                  </div>

                  <Card className="mt-4 bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base">Test Flow Sugerido - Usuario Final</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-medium">1. Usuario se registra</p>
                          <p className="text-slate-600">→ Recibe email "welcome"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-medium">2. Usuario compra certificado</p>
                          <p className="text-slate-600">→ Recibe email "certificate_purchased"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-medium">3. Usuario hace solicitud de uso</p>
                          <p className="text-slate-600">→ Recibe email "reservation_request_submitted"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-medium">4. Admin encuentra disponibilidad</p>
                          <p className="text-slate-600">→ Usuario recibe email "reservation_offer_available"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-medium">5. Usuario confirma oferta</p>
                          <p className="text-slate-600">→ Recibe email "reservation_confirmed"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
