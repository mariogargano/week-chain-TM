import { getUserRoleByEmail, ADMIN_EMAIL } from "./roles"

/**
 * Mapeo de roles a rutas de dashboard
 * Updated user role to redirect to /dashboard/member instead of /dashboard/user
 */
export const roleRoutes: Record<string, string> = {
  admin: "/dashboard/admin",
  super_admin: "/dashboard/admin",
  management: "/dashboard/management",
  broker: "/dashboard/member",
  broker_elite: "/dashboard/member",
  notaria: "/dashboard/notaria",
  of_counsel: "/dashboard/of-counsel",
  service_provider: "/dashboard/service-provider",
  vafi_manager: "/dashboard/vafi",
  dao_member: "/dashboard/dao",
  property_owner: "/dashboard/owner",
  owner: "/dashboard/owner",
  investor: "/dashboard/member",
  user: "/dashboard/member",
}

/**
 * Obtiene la URL del dashboard correcto según el rol del usuario
 * Versión client-side - usa Supabase client
 * @param email Email del usuario
 * @returns URL del dashboard correspondiente
 */
export async function getDashboardUrl(email: string): Promise<string> {
  // Garantizar que admin siempre vaya a /dashboard/admin
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return "/dashboard/admin"
  }

  const roleInfo = await getUserRoleByEmail(email)

  if (!roleInfo) {
    return "/dashboard/member"
  }

  return roleRoutes[roleInfo.role] || "/dashboard/member"
}

/**
 * Obtiene la URL del dashboard para el usuario actualmente autenticado
 * Versión client-side (usa Supabase client)
 */
export async function getCurrentUserDashboardUrl(): Promise<string> {
  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return "/dashboard/member"
  }

  return getDashboardUrl(user.email)
}
