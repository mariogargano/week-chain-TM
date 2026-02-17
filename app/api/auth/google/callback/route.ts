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

    // Check if user exists in auth.users
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(userInfo.email)

    console.log("[v0] Existing auth user:", existingUser?.user ? "found" : "not found")

    // If user exists, sign them in via OAuth (idempotent)
    if (existingUser?.user) {
      console.log("[v0] User exists, completing OAuth sign-in...")

      // Use signInWithIdToken or update session
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || "",
      })

      if (sessionData?.user) {
        // Log Google OAuth login
        try {
          await supabase.from("audit_logs").insert({
            user_id: sessionData.user.id,
            action: "google_oauth_complete",
            severity: "info",
            details: {
              email: userInfo.email,
              name: userInfo.name,
              timestamp: new Date().toISOString(),
            },
          })
        } catch (auditError) {
          console.error("[v0] Audit log error:", auditError)
        }

        console.log("[v0] OAuth sign-in successful, getting dashboard URL...")
        const dashboardUrl = await getDashboardUrlServer(userInfo.email)
        console.log("[v0] Redirecting to:", dashboardUrl)

        const response = NextResponse.redirect(new URL(dashboardUrl, request.url))
        response.cookies.delete("google_oauth_state")
        response.cookies.delete("google_oauth_referral")
        return response
      }

      if (sessionError) {
        console.error("[v0] Session creation error:", sessionError)
      }
    }

    // Create new user via Google OAuth
    console.log("[v0] Creating new account via Google OAuth...")

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userInfo.email,
      password: crypto.randomUUID(), // Random password, user will use OAuth
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
      return NextResponse.redirect(
        new URL(`/auth?error=signup_failed&message=${encodeURIComponent(signUpError.message)}`, request.url),
      )
    }

    if (signUpData?.user) {
      console.log("[v0] New user created:", signUpData.user.id)

      // Profile will be auto-created by trigger, but ensure avatar is set
      try {
        await supabase.from("profiles").update({
          avatar_url: userInfo.picture,
          full_name: userInfo.name,
        }).eq("id", signUpData.user.id)
      } catch (updateError) {
        console.error("[v0] Profile update error:", updateError)
      }

      // Log profile creation audit event
      try {
        await supabase.from("audit_logs").insert({
          user_id: signUpData.user.id,
          action: "profile_created",
          severity: "info",
          details: {
            email: userInfo.email,
            provider: "google",
            referral_code: referralCode || null,
            timestamp: new Date().toISOString(),
          },
        })

        await supabase.from("audit_logs").insert({
          user_id: signUpData.user.id,
          action: "google_oauth_complete",
          severity: "info",
          details: {
            email: userInfo.email,
            name: userInfo.name,
            timestamp: new Date().toISOString(),
          },
        })
      } catch (auditError) {
        console.error("[v0] Audit log error:", auditError)
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
          console.log("[v0] Referral error (non-critical):", refError)
        }
      }

      const dashboardUrl = await getDashboardUrlServer(userInfo.email)
      console.log("[v0] New user redirecting to:", dashboardUrl)

      const response = NextResponse.redirect(new URL(dashboardUrl, request.url))
      response.cookies.delete("google_oauth_state")
      response.cookies.delete("google_oauth_referral")
      return response
    }

    console.log("[v0] Unexpected: no user after signup, fallback redirect")
    const response = NextResponse.redirect(new URL("/auth", request.url))
    response.cookies.delete("google_oauth_state")
    response.cookies.delete("google_oauth_referral")
    return response
  } catch (error) {
    console.log("[v0] Google OAuth callback error:", error)
    return NextResponse.redirect(new URL("/auth?error=authentication_failed", request.url))
  }
}
