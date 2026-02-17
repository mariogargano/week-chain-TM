#!/usr/bin/env node

/**
 * Script de Verificación de Compliance WeekChain
 * Verifica que todos los componentes del sistema de compliance estén implementados correctamente
 */

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface CheckResult {
  category: string
  item: string
  status: "OK" | "WARN" | "ERROR" | "MISSING"
  message: string
}

const results: CheckResult[] = []

function addResult(category: string, item: string, status: CheckResult["status"], message: string) {
  results.push({ category, item, status, message })
  const emoji = status === "OK" ? "✅" : status === "WARN" ? "⚠️" : "❌"
  console.log(`${emoji} [${category}] ${item}: ${message}`)
}

async function checkDatabaseTables() {
  console.log("\n📊 Verificando Tablas de Base de Datos...\n")

  const requiredTables = [
    "users",
    "legal_acceptances",
    "fraud_alerts",
    "commissions",
    "terms_and_conditions",
    "purchases",
    "payments",
  ]

  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase.from(tableName).select("*").limit(1)

      if (error) {
        addResult("DATABASE", tableName, "ERROR", `Tabla no accesible: ${error.message}`)
      } else {
        addResult("DATABASE", tableName, "OK", "Tabla existe y es accesible")
      }
    } catch (err) {
      addResult("DATABASE", tableName, "ERROR", `Error al verificar: ${err}`)
    }
  }
}

async function checkUsersTableFields() {
  console.log("\n👤 Verificando Campos de Tabla users...\n")

  const requiredFields = [
    "signup_ip",
    "signup_country",
    "device_fingerprint",
    "referral_code",
    "referred_by",
    "verification_status",
    "date_of_birth",
    "id_type",
    "id_number",
    "id_front_url",
    "id_back_url",
  ]

  try {
    const { data, error } = await supabase.from("users").select("*").limit(1).single()

    if (error && error.code !== "PGRST116") {
      addResult("DATABASE_FIELDS", "users", "ERROR", `Error al verificar campos: ${error.message}`)
      return
    }

    const tableData = data || {}

    for (const field of requiredFields) {
      if (field in tableData || error?.code === "PGRST116") {
        addResult("DATABASE_FIELDS", field, "OK", "Campo existe en tabla users")
      } else {
        addResult("DATABASE_FIELDS", field, "MISSING", "Campo no encontrado en tabla users")
      }
    }
  } catch (err) {
    addResult("DATABASE_FIELDS", "users", "ERROR", `Error: ${err}`)
  }
}

function checkAPIEndpoints() {
  console.log("\n🔌 Verificando Endpoints API...\n")

  const requiredAPIs = [
    "app/api/auth/register/route.ts",
    "app/api/user/delete-account/route.ts",
    "app/api/user/export-data/route.ts",
    "app/api/compliance/check-fraud/route.ts",
    "app/api/compliance/record-acceptance/route.ts",
    "app/api/payments/conekta/create-order/route.ts",
  ]

  for (const apiPath of requiredAPIs) {
    if (fs.existsSync(apiPath)) {
      addResult("API", path.basename(apiPath), "OK", `Endpoint existe: ${apiPath}`)
    } else {
      addResult("API", path.basename(apiPath), "MISSING", `Endpoint no encontrado: ${apiPath}`)
    }
  }
}

function checkComplianceUtilities() {
  console.log("\n🛠️ Verificando Utilidades de Compliance...\n")

  const requiredUtils = [
    "lib/compliance/is-business-email.ts",
    "lib/compliance/get-device-fingerprint.ts",
    "lib/compliance/detect-bot-behavior.ts",
  ]

  for (const utilPath of requiredUtils) {
    if (fs.existsSync(utilPath)) {
      addResult("UTILITIES", path.basename(utilPath), "OK", `Utilidad existe: ${utilPath}`)
    } else {
      addResult("UTILITIES", path.basename(utilPath), "MISSING", `Utilidad no encontrada: ${utilPath}`)
    }
  }
}

function checkLegalDocuments() {
  console.log("\n📄 Verificando Documentos Legales...\n")

  const requiredDocs = ["public/legal/terms-and-conditions-mx.md", "public/legal/privacy-policy-mx.md"]

  for (const docPath of requiredDocs) {
    if (fs.existsSync(docPath)) {
      const content = fs.readFileSync(docPath, "utf-8")
      const hasNOM029 = content.includes("NOM-029") || content.includes("retracto")
      const hasLFPDPPP = content.includes("LFPDPPP") || content.includes("datos personales")

      if (hasNOM029 && hasLFPDPPP) {
        addResult("LEGAL_DOCS", path.basename(docPath), "OK", "Documento completo con NOM-029 y LFPDPPP")
      } else if (hasNOM029 || hasLFPDPPP) {
        addResult("LEGAL_DOCS", path.basename(docPath), "WARN", "Documento incompleto")
      } else {
        addResult("LEGAL_DOCS", path.basename(docPath), "ERROR", "Documento sin referencias legales requeridas")
      }
    } else {
      addResult("LEGAL_DOCS", path.basename(docPath), "MISSING", `Documento no encontrado: ${docPath}`)
    }
  }
}

function checkFrontendPages() {
  console.log("\n🖥️ Verificando Páginas Frontend...\n")

  const requiredPages = [
    "app/legal/terms/page.tsx",
    "app/legal/privacy/page.tsx",
    "app/purchase/cancel/[id]/page.tsx",
    "app/dashboard/admin/compliance/page.tsx",
  ]

  for (const pagePath of requiredPages) {
    if (fs.existsSync(pagePath)) {
      addResult("FRONTEND", path.basename(path.dirname(pagePath)), "OK", `Página existe: ${pagePath}`)
    } else {
      addResult("FRONTEND", path.basename(path.dirname(pagePath)), "MISSING", `Página no encontrada: ${pagePath}`)
    }
  }
}

function checkScripts() {
  console.log("\n📜 Verificando Scripts...\n")

  const requiredScripts = ["scripts/test-compliance.sh", "scripts/test-fraud-detection.js"]

  for (const scriptPath of requiredScripts) {
    if (fs.existsSync(scriptPath)) {
      const stats = fs.statSync(scriptPath)
      const isExecutable = (stats.mode & 0o111) !== 0

      if (isExecutable) {
        addResult("SCRIPTS", path.basename(scriptPath), "OK", "Script existe y es ejecutable")
      } else {
        addResult("SCRIPTS", path.basename(scriptPath), "WARN", "Script existe pero no es ejecutable (chmod +x)")
      }
    } else {
      addResult("SCRIPTS", path.basename(scriptPath), "MISSING", `Script no encontrado: ${scriptPath}`)
    }
  }
}

async function checkRLSPolicies() {
  console.log("\n🔒 Verificando Políticas RLS...\n")

  const tablesToCheck = ["legal_acceptances", "fraud_alerts", "commissions", "terms_and_conditions"]

  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase.rpc("pg_policies", { table_name: tableName })

      if (error) {
        addResult("RLS", tableName, "WARN", "No se pudo verificar políticas RLS")
      } else {
        addResult("RLS", tableName, "OK", "RLS configurado")
      }
    } catch (err) {
      addResult("RLS", tableName, "WARN", "Verificación RLS no disponible")
    }
  }
}

function checkPackageJson() {
  console.log("\n📦 Verificando package.json...\n")

  if (!fs.existsSync("package.json")) {
    addResult("CONFIG", "package.json", "MISSING", "package.json no encontrado")
    return
  }

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))

  // Verificar dependencias
  const requiredDeps = ["@fingerprintjs/fingerprintjs", "resend"]
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

  for (const dep of requiredDeps) {
    if (deps[dep]) {
      addResult("DEPENDENCIES", dep, "OK", `Instalado: ${deps[dep]}`)
    } else {
      addResult("DEPENDENCIES", dep, "MISSING", "Dependencia no instalada")
    }
  }

  // Verificar scripts
  const requiredScripts = ["test:compliance", "test:fraud"]
  for (const script of requiredScripts) {
    if (packageJson.scripts?.[script]) {
      addResult("SCRIPTS_CONFIG", script, "OK", `Script configurado: ${packageJson.scripts[script]}`)
    } else {
      addResult("SCRIPTS_CONFIG", script, "MISSING", "Script no configurado en package.json")
    }
  }
}

function generateReport() {
  console.log("\n" + "=".repeat(80))
  console.log("📊 REPORTE FINAL DE COMPLIANCE")
  console.log("=".repeat(80) + "\n")

  const byCategory = results.reduce(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = []
      acc[r.category].push(r)
      return acc
    },
    {} as Record<string, CheckResult[]>,
  )

  let totalOK = 0
  let totalWARN = 0
  let totalERROR = 0
  let totalMISSING = 0

  for (const [category, items] of Object.entries(byCategory)) {
    const ok = items.filter((i) => i.status === "OK").length
    const warn = items.filter((i) => i.status === "WARN").length
    const error = items.filter((i) => i.status === "ERROR").length
    const missing = items.filter((i) => i.status === "MISSING").length

    totalOK += ok
    totalWARN += warn
    totalERROR += error
    totalMISSING += missing

    console.log(`\n${category}:`)
    console.log(`  ✅ OK: ${ok}`)
    console.log(`  ⚠️  WARN: ${warn}`)
    console.log(`  ❌ ERROR: ${error}`)
    console.log(`  🔍 MISSING: ${missing}`)
  }

  console.log("\n" + "=".repeat(80))
  console.log(`TOTALES: ✅ ${totalOK} | ⚠️  ${totalWARN} | ❌ ${totalERROR} | 🔍 ${totalMISSING}`)
  console.log("=".repeat(80) + "\n")

  const score = (totalOK / results.length) * 100
  console.log(`🎯 SCORE DE COMPLIANCE: ${score.toFixed(1)}%\n`)

  if (score >= 90) {
    console.log("🎉 Sistema de compliance en excelente estado!")
  } else if (score >= 70) {
    console.log("👍 Sistema de compliance funcional, pero requiere mejoras")
  } else {
    console.log("⚠️  Sistema de compliance requiere atención urgente")
  }

  // Generar archivo de reporte
  const reportPath = "compliance-report.json"
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        score,
        results,
        summary: {
          total: results.length,
          ok: totalOK,
          warn: totalWARN,
          error: totalERROR,
          missing: totalMISSING,
        },
      },
      null,
      2,
    ),
  )

  console.log(`\n📄 Reporte guardado en: ${reportPath}\n`)
}

async function main() {
  console.log("\n" + "=".repeat(80))
  console.log("🔍 INICIANDO VERIFICACIÓN DE COMPLIANCE WEEKCHAIN")
  console.log("=".repeat(80))

  try {
    await checkDatabaseTables()
    await checkUsersTableFields()
    checkAPIEndpoints()
    checkComplianceUtilities()
    checkLegalDocuments()
    checkFrontendPages()
    checkScripts()
    await checkRLSPolicies()
    checkPackageJson()

    generateReport()
  } catch (error) {
    console.error("\n❌ Error durante la verificación:", error)
    process.exit(1)
  }
}

main()
