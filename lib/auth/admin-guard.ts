import { createClient } from "@/lib/supabase/server"
import { ADMIN_EMAIL } from "@/lib/auth/roles"

/**
 * Server-side admin authentication check
 * Returns admin user data if authorized, null otherwise
 *
 * REQUIREMENTS:
 * 1. Email must match corporativo@morises.com exactly
 * 2. User must exist in admin_users table with matching email
 * 3. admin_users.status must be 'active'
 * 4. admin_users.role must be 'super_admin'
 */
export async function checkAdminAuth() {
  try {
    const supabase = await createClient()

    // Get current session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      await logAdminAccess(null, "denied", "no_session")
      return null
    }

    // CRITICAL CHECK: Email must match exactly
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await logAdminAccess(user.email, "denied", "unauthorized_email")
      return null
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", ADMIN_EMAIL.toLowerCase())
      .eq("status", "active")
      .eq("role", "super_admin")
      .maybeSingle()

    if (adminError || !adminUser) {
      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        const { data: newAdmin, error: createError } = await supabase
          .from("admin_users")
          .upsert(
            {
              email: ADMIN_EMAIL.toLowerCase(),
              name: "Administrador WEEK-CHAIN",
              role: "super_admin",
              status: "active",
              user_id: user.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" },
          )
          .select()
          .single()

        if (createError) {
          await logAdminAccess(user.email, "denied", "admin_creation_failed")
          return null
        }

        await logAdminAccess(user.email, "granted", "auto_created_admin")
        return {
          user,
          adminUser: newAdmin,
          email: user.email,
          role: "super_admin",
          isActive: true,
        }
      }

      await logAdminAccess(user.email, "denied", "not_in_admin_users")
      return null
    }

    // SUCCESS: All checks passed
    await logAdminAccess(user.email, "granted", "full_access")

    return {
      user,
      adminUser,
      email: user.email,
      role: adminUser.role,
      isActive: adminUser.status === "active",
    }
  } catch (error) {
    console.error("[Admin Guard] Error checking admin auth:", error)
    return null
  }
}

export { checkAdminAuth as checkAdminAccess }

/**
 * Log admin access attempts to audit table
 */
async function logAdminAccess(email: string | null, result: "granted" | "denied", reason: string) {
  try {
    const supabase = await createClient()

    await supabase.from("admin_audit_log").insert({
      actor_email: email,
      action: "ADMIN_ACCESS_ATTEMPT",
      entity_type: "admin_dashboard",
      metadata: {
        result,
        reason,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    // Silent fail - don't block auth flow for logging errors
    console.error("[Admin Guard] Failed to log access attempt:", error)
  }
}

/**
 * Client-side admin check (lightweight)
 * Should be used in conjunction with server-side checks
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const { createClient: createBrowserClient } = await import("@/lib/supabase/client")
    const supabase = createBrowserClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return false
    }

    // Quick email check
    return session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  } catch (error) {
    return false
  }
}
