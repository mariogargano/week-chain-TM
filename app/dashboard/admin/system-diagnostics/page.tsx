"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  CreditCard,
  Mail,
  Shield,
  FileText,
  Wallet,
} from "lucide-react"

interface DiagnosticCheck {
  name: string
  category: string
  status: "success" | "warning" | "error"
  message: string
  required: boolean
}

export default function SystemDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    const checks: DiagnosticCheck[] = []

    // Database checks
    try {
      const dbCheck = await fetch("/api/diagnostics/database")
      const dbResult = await dbCheck.json()
      checks.push({
        name: "Supabase Connection",
        category: "database",
        status: dbResult.connected ? "success" : "error",
        message: dbResult.connected ? "Database connected successfully" : "Database connection failed",
        required: true,
      })
    } catch (error) {
      checks.push({
        name: "Supabase Connection",
        category: "database",
        status: "error",
        message: "Failed to check database connection",
        required: true,
      })
    }

    // Payment checks
    try {
      const conektaCheck = await fetch("/api/diagnostics/conekta")
      const conektaResult = await conektaCheck.json()
      checks.push({
        name: "Conekta Integration",
        category: "payment",
        status: conektaResult.configured ? "success" : "warning",
        message: conektaResult.message || "Conekta not fully configured",
        required: true,
      })
    } catch (error) {
      checks.push({
        name: "Conekta Integration",
        category: "payment",
        status: "error",
        message: "Failed to check Conekta configuration",
        required: true,
      })
    }

    // Email checks
    try {
      const emailCheck = await fetch("/api/diagnostics/email")
      const emailResult = await emailCheck.json()
      checks.push({
        name: "Email Service (Resend)",
        category: "email",
        status: emailResult.configured ? "success" : "warning",
        message: emailResult.message || "Email service not configured",
        required: true,
      })
    } catch (error) {
      checks.push({
        name: "Email Service (Resend)",
        category: "email",
        status: "warning",
        message: "Failed to check email service",
        required: true,
      })
    }

    // Auth checks
    checks.push({
      name: "Google OAuth",
      category: "auth",
      status: typeof window !== "undefined" && (window as any).GOOGLE_CLIENT_ID ? "success" : "warning",
      message: "Google OAuth is optional but recommended",
      required: false,
    })

    // KYC checks
    checks.push({
      name: "KYC Provider",
      category: "kyc",
      status: "warning",
      message: "KYC provider is optional for MVP",
      required: false,
    })

    // Legal checks
    checks.push({
      name: "Legalario Integration",
      category: "legal",
      status: "warning",
      message: "Legal automation is optional",
      required: false,
    })

    setDiagnostics(checks)
    setLastCheck(new Date())
    setLoading(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="h-5 w-5" />
      case "payment":
        return <CreditCard className="h-5 w-5" />
      case "email":
        return <Mail className="h-5 w-5" />
      case "auth":
        return <Shield className="h-5 w-5" />
      case "kyc":
        return <Shield className="h-5 w-5" />
      case "legal":
        return <FileText className="h-5 w-5" />
      case "blockchain":
        return <Wallet className="h-5 w-5" />
      default:
        return null
    }
  }

  const criticalIssues = diagnostics.filter((d) => d.status === "error" && d.required).length
  const warnings = diagnostics.filter((d) => d.status === "warning").length
  const healthy = diagnostics.filter((d) => d.status === "success").length

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-gradient">System Diagnostics</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Monitor the health and status of all platform integrations
          </p>
        </div>
        <Button onClick={runDiagnostics} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Checks
        </Button>
      </div>

      {lastCheck && (
        <p className="text-xs md:text-sm text-muted-foreground">Last check: {lastCheck.toLocaleString()}</p>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthy}</div>
            <p className="text-xs text-muted-foreground">Services operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warnings}</div>
            <p className="text-xs text-muted-foreground">Optional services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalIssues}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {criticalIssues > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Critical Issues Detected</AlertTitle>
          <AlertDescription>
            {criticalIssues} critical {criticalIssues === 1 ? "service is" : "services are"} not functioning properly.
            Please check the details below and fix the issues immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Diagnostic Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {["database", "payment", "email", "auth", "kyc", "legal"].map((category) => {
          const categoryChecks = diagnostics.filter((d) => d.category === category)
          if (categoryChecks.length === 0) return null

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg capitalize">
                  {getCategoryIcon(category)}
                  {category}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category === "database" && "Database connectivity and schema"}
                  {category === "payment" && "Payment processor integrations"}
                  {category === "email" && "Transactional email service"}
                  {category === "auth" && "Authentication providers"}
                  {category === "kyc" && "Identity verification services"}
                  {category === "legal" && "Legal automation tools"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryChecks.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{check.name}</p>
                        {check.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-words">{check.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Environment Information</CardTitle>
          <CardDescription className="text-sm">Current deployment configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Environment</p>
              <p className="text-muted-foreground">Browser</p>
            </div>
            <div>
              <p className="font-medium">Platform Status</p>
              <Badge variant={criticalIssues === 0 ? "default" : "destructive"}>
                {criticalIssues === 0 ? "Operational" : "Degraded"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
