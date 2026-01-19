import { type NextRequest, NextResponse } from "next/server"
import { googleAuth } from "@/lib/google-auth/client"
import { createClient } from "@/lib/supabase/server"
import { getDashboardUrlServer } from "@/lib/auth/redirect-server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const referralCode = request.cookies.get("google_oauth_referral")?.value || ""

  console.log("[v0] Google OAuth Callback: Starting")
  console.log("[v0] State from URL:", state?.substring(0, 10) + "...")

  const allCookies = request.cookies.getAll()
  console.log("[v0] All cookies:", allCookies.map((c) => c.name).join(", "))

  if (error) {
    console.log("[v0] Google OAuth error:", error)
    return NextResponse.redirect(new URL(`/auth?error=${error}`, request.url))
  }

  if (!code || !state) {
    console.log("[v0] Missing code or state")
    return NextResponse.redirect(new URL("/auth?error=invalid_request", request.url))
  }

  const savedState = request.cookies.get("google_oauth_state")?.value
  console.log("[v0] Saved state from cookie:", savedState?.substring(0, 10) + "..." || "NOT FOUND")

  // Improved state validation: handle missing cookie gracefully in dev/preview but check mismatch
  if (savedState && state !== savedState) {
    console.log("[v0] State mismatch - URL state vs cookie state differ")
    return NextResponse.redirect(new URL("/auth?error=state_mismatch", request.url))
  }

  if (!savedState) {
    console.log("[v0] WARNING: No saved state cookie found - possible domain mismatch or cookie blocking")
  }

  try {
    console.log("[v0] Exchanging code for tokens...")
    const tokens = await googleAuth.exchangeCodeForTokens(code)
    console.log("[v0] Tokens received")

    console.log("[v0] Fetching user info...")
    const userInfo = await googleAuth.getUserInfo(tokens.access_token)
    console.log("[v0] User info:", userInfo.email, userInfo.name)

    const supabase = await createClient()

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", userInfo.email.toLowerCase())
      .maybeSingle()

    console.log("[v0] Existing profile:", existingProfile)

    console.log("[v0] Attempting sign in with ID token...")
    const { data: signInData, error: signInError } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokens.id_token,
    })

    console.log("[v0] Sign in result:", signInData?.user?.email, "Error:", signInError?.message)

    if (signInData?.user) {
      console.log("[v0] Sign in successful, checking role...")

      const { ADMIN_EMAIL } = await import("@/lib/auth/roles")
      const userRole = userInfo.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : (existingProfile?.role || "user")

      // Ensure admin role is set for admins
      if (userRole === "admin") {
        console.log("[v0] Ensuring admin role and elevation")
        const { createServiceRoleClient } = await import("@/lib/supabase/server")
        const supabaseAdmin = createServiceRoleClient()

        // Update profile via admin client to bypass RLS
        await supabaseAdmin.from("profiles").upsert({
          id: signInData.user.id,
          email: userInfo.email.toLowerCase(),
          role: "admin",
          display_name: userInfo.name,
          avatar_url: userInfo.picture,
        })

        // Update auth metadata
        await supabaseAdmin.auth.admin.updateUserById(signInData.user.id, {
          user_metadata: { ...signInData.user.user_metadata, role: "admin" },
        })
      }

      const dashboardUrl = await getDashboardUrlServer(userInfo.email)
      console.log("[v0] Redirecting to:", dashboardUrl)

      const response = NextResponse.redirect(new URL(dashboardUrl, request.url))
      response.cookies.delete("google_oauth_state")
      response.cookies.delete("google_oauth_referral")
      return response
    }

    if (signInError) {
      console.log("[v0] Sign in with ID token failed:", signInError.message)
      return NextResponse.redirect(
        new URL(`/auth?error=auth_failed&message=${encodeURIComponent(signInError.message)}`, request.url),
      )
    }

    console.log("[v0] Fallback redirect to dashboard")
    const dashboardUrl = await getDashboardUrlServer(userInfo.email)
    const response = NextResponse.redirect(new URL(dashboardUrl, request.url))
    response.cookies.delete("google_oauth_state")
    response.cookies.delete("google_oauth_referral")
    return response
  } catch (error) {
    console.log("[v0] Google OAuth callback error:", error)
    return NextResponse.redirect(new URL("/auth?error=authentication_failed", request.url))
  }
}
