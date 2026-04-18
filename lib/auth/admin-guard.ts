import { createClient } from "@/lib/supabase/server"
import { ADMIN_EMAIL } from "@/lib/auth/roles"

/**
 * Server-side admin authentication check
 * Returns admin user data if authorized, null otherwise
 *
 * REQUIREMENTS (in priority order):
 * 1. User has role 'admin' or 'super_admin' in users table (primary)
 * 2. User email matches NEXT_PUBLIC_ADMIN_EMAIL env var (bootstrap/fallback)
 * 3. admin_users entry with status='active' (legacy)
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

    const userEmail = user.email?.toLowerCase() || ""

    // PRIMARY CHECK: Role in users table
    const { data: userRoleData } = await supabase
      .from("users")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle()

    const hasAdminRole = userRoleData?.role === "admin" || userRoleData?.role === "super_admin"

    // FALLBACK CHECK: Env var admin email
    const isEnvAdmin = ADMIN_EMAIL && userEmail === ADMIN_EMAIL.toLowerCase()

    if (!hasAdminRole && !isEnvAdmin) {
      await logAdminAccess(user.email, "denied", "insufficient_role")
      return null
    }

    // Fetch or create admin_users entry
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", userEmail)
      .eq("status", "active")
      .maybeSingle()

    if (!adminUser && (hasAdminRole || isEnvAdmin)) {
      const { data: newAdmin } = await supabase
        .from("admin_users")
        .upsert(
          {
            email: userEmail,
            name: userRoleData?.full_name || "Administrador WEEK-CHAIN",
            role: userRoleData?.role === "super_admin" ? "super_admin" : "admin",
            status: "active",
            user_id: user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" },
        )
        .select()
        .single()

      await logAdminAccess(user.email, "granted", "auto_created_admin")
      return {
        user,
        adminUser: newAdmin,
        email: user.email,
        role: newAdmin?.role || "admin",
        isActive: true,
      }
    }

    await logAdminAccess(user.email, "granted", "full_access")

    return {
      user,
      adminUser,
      email: user.email,
      role: adminUser?.role || userRoleData?.role || "admin",
      isActive: adminUser?.status === "active",
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
  }
}

/**
 * Client-side admin check (lightweight)
 * Checks role in users table via Supabase client
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const { createClient: createBrowserClient } = await import("@/lib/supabase/client")
    const supabase = createBrowserClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return false
    }

    // Check role in users table
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()

    if (userData?.role === "admin" || userData?.role === "super_admin") {
      return true
    }

    // Fallback: env admin email
    if (ADMIN_EMAIL && session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return true
    }

    return false
  } catch (error) {
    return false
  }
}
