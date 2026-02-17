import { createClient } from "@/lib/supabase/server"

/**
 * RLS Helper Functions
 * These functions interact with Supabase RLS policies to enforce security
 */

export async function isAdmin(): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("is_admin")

  if (error) {
    console.error("[RLS] Error checking admin status:", error)
    return false
  }

  return data === true
}

export async function hasAdminRole(
  role: "super_admin" | "ops" | "finance" | "compliance" | "support",
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("has_admin_role", { required_role: role })

  if (error) {
    console.error("[RLS] Error checking admin role:", error)
    return false
  }

  return data === true
}

export async function getAdminUser() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  return adminUser
}

export async function logAdminAction(action: string, entityType: string, entityId: string | null, changes: any = null) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from("admin_audit_log").insert({
    admin_user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    changes,
  })
}
