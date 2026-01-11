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

  if (!savedState) {
    console.log("[v0] WARNING: No saved state cookie found - cookie may not have persisted")
    // Continue anyway for now to complete the flow
  } else if (state !== savedState) {
    console.log("[v0] State mismatch - URL state vs cookie state differ")
    return NextResponse.redirect(new URL("/auth?error=state_mismatch", request.url))
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

    const googlePassword = `google_oauth_${userInfo.id}`
    console.log("[v0] Attempting sign in...")

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: googlePassword,
    })

    console.log("[v0] Sign in result:", signInData?.user?.email, "Error:", signInError?.message)

    if (signInData?.user) {
      console.log("[v0] Sign in successful, getting dashboard URL...")
      const dashboardUrl = await getDashboardUrlServer(userInfo.email)
      console.log("[v0] Redirecting to:", dashboardUrl)

      const response = NextResponse.redirect(new URL(dashboardUrl, request.url))
      response.cookies.delete("google_oauth_state")
      response.cookies.delete("google_oauth_referral")
      return response
    }

    console.log("[v0] Creating new account...")

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userInfo.email,
      password: googlePassword,
      options: {
        data: {
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          provider: "google",
          email_verified: true,
          referral_code_used: referralCode || undefined,
        },
        emailRedirectTo: undefined, // No email confirmation needed for Google OAuth
      },
    })

    console.log("[v0] Sign up result:", signUpData?.user?.email, "Error:", signUpError?.message)

    if (signUpError) {
      console.log("[v0] Sign up failed:", signUpError.message)

      if (signUpError.message.includes("already registered")) {
        console.log("[v0] User already exists, redirecting to login with message")
        return NextResponse.redirect(
          new URL(
            "/auth?error=email_exists&message=Este email ya está registrado. Usa tu contraseña original.",
            request.url,
          ),
        )
      }

      return NextResponse.redirect(
        new URL(`/auth?error=signup_failed&message=${encodeURIComponent(signUpError.message)}`, request.url),
      )
    }

    if (signUpData?.user) {
      console.log("[v0] New user created:", signUpData.user.id)

      try {
        const { createClient: createAdminClient } = await import("@supabase/supabase-js")
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        )

        await supabaseAdmin.auth.admin.updateUserById(signUpData.user.id, {
          email_confirm: true,
        })
        console.log("[v0] Email confirmed via admin API")
      } catch (adminError) {
        console.log("[v0] Admin email confirm failed:", adminError)
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: signUpData.user.id,
          email: userInfo.email.toLowerCase(),
          display_name: userInfo.name,
          avatar_url: userInfo.picture,
          role: "user",
        },
        { onConflict: "id" },
      )

      if (profileError) {
        console.log("[v0] Profile creation error:", profileError.message)
      }

      // Apply referral code if exists
      if (referralCode && signUpData.user.id) {
        console.log("[v0] Applying referral code:", referralCode)
        try {
          await supabase.rpc("register_referral", {
            p_referral_code: referralCode,
            p_new_user_id: signUpData.user.id,
          })
        } catch (refError) {
          console.log("[v0] Referral error:", refError)
        }
      }

      console.log("[v0] Signing in new user...")
      const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: userInfo.email,
        password: googlePassword,
      })

      console.log("[v0] New sign in result:", newSignIn?.user?.email, "Error:", newSignInError?.message)

      if (newSignIn?.user) {
        const dashboardUrl = await getDashboardUrlServer(userInfo.email)
        console.log("[v0] New user redirecting to:", dashboardUrl)

        const response = NextResponse.redirect(new URL(dashboardUrl, request.url))
        response.cookies.delete("google_oauth_state")
        response.cookies.delete("google_oauth_referral")
        return response
      }

      if (newSignInError?.message.includes("Email not confirmed")) {
        console.log("[v0] Email confirmation still required - this shouldn't happen")
        return NextResponse.redirect(new URL("/auth?message=Revisa tu email para confirmar tu cuenta", request.url))
      }
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
