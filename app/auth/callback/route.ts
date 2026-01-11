import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  console.log("[v0 Auth Callback] Processing authentication...")
  console.log("[v0 Auth Callback] Code received:", !!code)

  if (code) {
    try {
      const cookieStore = await cookies()

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options)
                })
              } catch (error) {
                console.error("[v0 Auth Callback] Error setting cookies:", error)
              }
            },
          },
        },
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0 Auth Callback] Session error:", error)
        return NextResponse.redirect(new URL("/auth/login?error=auth_failed", requestUrl.origin))
      }

      console.log("[v0 Auth Callback] Session created successfully for:", data.user.email)

      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: data.user.id,
        email: data.user.email,
        full_name:
          data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0],
        avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
        role: data.user.email === "corporativo@morises.com" ? "admin" : "user",
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("[v0 Auth Callback] Profile error:", profileError)
      }

      const dashboardUrl = data.user.email === "corporativo@morises.com" ? "/dashboard/admin" : "/dashboard"

      console.log("[v0 Auth Callback] Redirecting to:", dashboardUrl)

      const response = NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin))

      return response
    } catch (error) {
      console.error("[v0 Auth Callback] Unexpected error:", error)
      return NextResponse.redirect(new URL("/auth/login?error=unexpected", requestUrl.origin))
    }
  }

  console.log("[v0 Auth Callback] No code provided, redirecting to login")
  return NextResponse.redirect(new URL("/auth/login?error=no_code", requestUrl.origin))
}
