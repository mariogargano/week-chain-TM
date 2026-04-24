"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  check: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function AdminDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string>("")

  const runDiagnostics = async () => {
    setLoading(true)
    const results: DiagnosticResult[] = []
    const supabase = createBrowserClient()

    try {
      // 1. Check Supabase connection
      const { error: connectionError } = await supabase.from("users").select("count").limit(1)
      results.push({
        check: "Supabase Connection",
        status: connectionError ? "error" : "success",
        message: connectionError ? `Connection failed: ${connectionError.message}` : "Connected successfully",
      })

      // 2. Get wallet address from localStorage
      const wallet = localStorage.getItem("walletAddress") || ""
      setWalletAddress(wallet)
      results.push({
        check: "Wallet Address",
        status: wallet ? "success" : "error",
        message: wallet ? `Wallet found: ${wallet}` : "No wallet address in localStorage",
        details: wallet,
      })

      if (wallet) {
        // 3. Check admin_wallets table
        const { data: adminWallet, error: adminError } = await supabase
          .from("admin_wallets")
          .select("*")
          .eq("wallet_address", wallet)
          .single()

        results.push({
          check: "Admin Wallets Table",
          status: adminWallet ? "success" : "warning",
          message: adminWallet
            ? `Found in admin_wallets with role: ${adminWallet.role}`
            : "Not found in admin_wallets table",
          details: adminWallet,
        })

        // 4. Check users table
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("wallet_address", wallet)
          .single()

        results.push({
          check: "Users Table",
          status: user ? "success" : "warning",
          message: user ? `Found in users with role: ${user.role}` : "Not found in users table",
          details: user,
        })

        // 5. Check profiles table
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          results.push({
            check: "Profiles Table",
            status: profile ? "success" : "warning",
            message: profile ? `Found in profiles with role: ${profile.role}` : "Not found in profiles table",
            details: profile,
          })
        }

        // 6. Check if user has admin role in any table
        const hasAdminRole = adminWallet?.role === "admin" || user?.role === "admin" || (user && user.role === "admin")

        results.push({
          check: "Admin Role Verification",
          status: hasAdminRole ? "success" : "error",
          message: hasAdminRole ? "User has admin role" : "User does NOT have admin role in any table",
        })

        // 7. Test database function
        const { data: roleData, error: roleError } = await supabase.rpc("get_user_role", { wallet })

        results.push({
          check: "Database Function (get_user_role)",
          status: roleError ? "error" : "success",
          message: roleError ? `Function error: ${roleError.message}` : `Function returned: ${roleData}`,
          details: roleData,
        })

        // 8. Check RLS policies
        const { data: testQuery, error: rlsError } = await supabase.from("admin_activity").select("count").limit(1)

        results.push({
          check: "RLS Policies",
          status: rlsError ? "warning" : "success",
          message: rlsError ? `RLS might be blocking: ${rlsError.message}` : "RLS policies allow access",
        })
      }
    } catch (error: any) {
      results.push({
        check: "General Error",
        status: "error",
        message: error.message || "Unknown error occurred",
      })
    }

    setDiagnostics(results)
    setLoading(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: DiagnosticResult["status"]) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
    } as const

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Access Diagnostics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive system check for admin dashboard access</p>
        </div>
        <Button onClick={runDiagnostics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Run Diagnostics
        </Button>
      </div>

      {walletAddress && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="bg-muted p-2 rounded block break-all">{walletAddress}</code>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {diagnostics.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <CardTitle className="text-lg">{result.check}</CardTitle>
                  {getStatusBadge(result.status)}
                </div>
              </div>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            {result.details && (
              <CardContent>
                <details className="cursor-pointer">
                  <summary className="font-semibold mb-2">View Details</summary>
                  <pre className="bg-muted p-4 rounded overflow-auto text-xs">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {!loading && diagnostics.length > 0 && (
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnostics.some((d) => d.status === "error") && (
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Critical Issues Found</p>
                  <p className="text-sm text-muted-foreground">
                    Run the SQL script <code>041_fix_admin_access.sql</code> to fix admin access issues.
                  </p>
                </div>
              </div>
            )}
            {diagnostics.some((d) => d.status === "warning") && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Warnings Detected</p>
                  <p className="text-sm text-muted-foreground">
                    Some tables are missing user data. This might cause issues with role verification.
                  </p>
                </div>
              </div>
            )}
            {diagnostics.every((d) => d.status === "success") && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">All Systems Operational</p>
                  <p className="text-sm text-muted-foreground">
                    Admin access is properly configured. You should be able to access the admin dashboard.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
