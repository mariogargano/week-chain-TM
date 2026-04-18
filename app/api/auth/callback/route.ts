import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDashboardUrlServer } from "@/lib/auth/redirect-server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/"
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle error from auth provider
  if (error) {
    console.error("[v0] Auth callback error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "")}`, request.url)
    )
  }

  // Handle missing code
  if (!code) {
    console.error("[v0] No code provided in callback")
    return NextResponse.redirect(new URL("/auth?error=missing_code", request.url))
  }

  try {
    const supabase = await createClient()

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("[v0] Code exchange error:", exchangeError)
      throw exchangeError
    }

    if (!data.user) {
      console.error("[v0] No user after code exchange")
      return NextResponse.redirect(new URL("/auth?error=no_user", request.url))
    }

    // Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role, status, kyc_status")
      .eq("id", data.user.id)
      .maybeSingle()

    // Create profile if it doesn't exist (shouldn't happen with trigger, but safety check)
    if (!profile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: data.user.id,
        user_id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
        role: "holder",
        status: "pending_kyc",
        locale: "es-MX",
        kyc_status: "not_started",
      })

      if (insertError) {
        console.error("[v0] Profile creation error:", insertError)
      }
    }

    // Log audit event for magic link login
    try {
      await supabase.from("audit_logs").insert({
        user_id: data.user.id,
        action: "magic_link_used",
        severity: "info",
        details: {
          email: data.user.email,
          timestamp: new Date().toISOString(),
          ip_address: request.headers.get("x-forwarded-for") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        },
      })
    } catch (auditError) {
      console.error("[v0] Audit log error:", auditError)
    }

    // Get role-appropriate dashboard
    const dashboardUrl = await getDashboardUrlServer(data.user.email!)

    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  } catch (error: any) {
    console.error("[v0] Auth callback error:", error)
    return NextResponse.redirect(
      new URL(`/auth?error=callback_error&message=${encodeURIComponent(error.message || "Authentication failed")}`, request.url)
    )
  }
}
