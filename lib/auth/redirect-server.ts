import { ADMIN_EMAIL } from "./roles"
import { roleRoutes } from "./redirect"

/**
 * Versión server-side para obtener URL de dashboard
 * SOLO usar en Server Components y Route Handlers
 */
export async function getDashboardUrlServer(email: string): Promise<string> {
  // Garantizar que admin siempre vaya a /dashboard/admin
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return "/dashboard/admin"
  }

  // Import dinámico del cliente de Supabase server
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  // Check users table for role
  const { data: userData } = await supabase.from("users").select("role").eq("email", email.toLowerCase()).maybeSingle()

  if (userData?.role) {
    return roleRoutes[userData.role] || "/dashboard/user"
  }

  // Check profiles table as fallback
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("email", email.toLowerCase())
    .maybeSingle()

  if (profileData?.role) {
    return roleRoutes[profileData.role] || "/dashboard/user"
  }

  return "/dashboard/user"
}
