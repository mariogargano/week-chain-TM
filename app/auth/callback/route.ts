import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const errorParam = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const next = requestUrl.searchParams.get("next") || "/dashboard/member"

  // Handle OAuth errors (e.g., user cancelled, access denied)
  if (errorParam) {
    const errorMsg = errorDescription || errorParam || "Authentication failed"
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMsg)}`, requestUrl.origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth?error=No%20authentication%20code%20provided", requestUrl.origin)
    )
  }

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[Auth Callback] Session exchange error:", error.message)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  if (!data.user) {
    return NextResponse.redirect(
      new URL("/auth?error=No%20user%20data%20returned", requestUrl.origin)
    )
  }

  const userEmail = data.user.email?.toLowerCase() || ""
  const isAdmin = userEmail === "corporativo@morises.com"

  // Check if user has a profile in the users table
  // The database trigger should create this, but we handle it as fallback
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", data.user.id)
    .maybeSingle()

  const assignedRole = isAdmin ? "admin" : "user"

  if (!existingUser) {
    // Fallback: Auto-create user profile for new OAuth users
    // This handles cases where the database trigger might not have fired yet
    const metadata = data.user.user_metadata || {}
    await supabase.from("users").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: metadata.full_name || metadata.name || "",
      avatar_url: metadata.avatar_url || metadata.picture || "",
      role: assignedRole,
      account_type: "individual",
      referral_code: generateReferralCode(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })

    // Also create a profile entry if it doesn't exist
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      display_name: metadata.full_name || metadata.name || "",
      avatar_url: metadata.avatar_url || metadata.picture || "",
      username: generateUsername(data.user.email || ""),
      role: assignedRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
  } else if (isAdmin && existingUser.role !== "admin") {
    // Ensure admin email always has admin role
    await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", data.user.id)
  }

  // Admin email always goes to admin dashboard
  if (isAdmin) {
    return NextResponse.redirect(new URL("/dashboard/admin", requestUrl.origin))
  }

  // Redirect based on role
  const userRole = existingUser?.role || assignedRole
  const roleRouteMap: Record<string, string> = {
    admin: "/dashboard/admin",
    super_admin: "/dashboard/admin",
    broker: "/dashboard/broker",
    broker_elite: "/dashboard/broker",
    management: "/dashboard/management",
    notaria: "/dashboard/notaria",
    of_counsel: "/dashboard/of-counsel",
    service_provider: "/dashboard/service-provider",
    vafi_manager: "/dashboard/vafi",
    dao_member: "/dashboard/dao",
    property_owner: "/dashboard/owner",
  }

  const redirectPath = roleRouteMap[userRole] || next
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "WC-"
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateUsername(email: string): string {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
  const suffix = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `${base}${suffix}`
}
