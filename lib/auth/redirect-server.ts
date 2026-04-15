import { ADMIN_EMAIL } from "./roles";
import { roleRoutes } from "./redirect";

/**
 * Version server-side para obtener URL de dashboard
 * SOLO usar en Server Components y Route Handlers
 */
export async function getDashboardUrlServer(email: string): Promise<string> {
  // Admin email always goes to admin dashboard
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return "/dashboard/admin"
  }

  // Import dynamic server client
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  // Check users table for role (primary source of truth)
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("email", email.toLowerCase())
    .maybeSingle()

  if (userData?.role) {
    return roleRoutes[userData.role] || "/dashboard/member"
  }

  return "/dashboard/member"
}
