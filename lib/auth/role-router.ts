import type { UserRole } from "./roles"

/**
 * WEEK-CHAIN Role-Based Routing System
 *
 * Este módulo maneja el routing automático basado en roles después de la autenticación.
 * Cada rol tiene un dashboard específico y permisos asociados.
 */

export interface DashboardRoute {
  path: string
  label: string
  description: string
}

/**
 * Mapa de roles a sus dashboards correspondientes
 */
export const ROLE_DASHBOARDS: Record<UserRole, DashboardRoute> = {
  admin: {
    path: "/dashboard/admin",
    label: "Panel Administrativo",
    description: "Gestión completa del sistema WEEK-CHAIN",
  },
  super_admin: {
    path: "/dashboard/admin",
    label: "Panel Super Admin",
    description: "Acceso total al sistema y configuración",
  },
  management: {
    path: "/management",
    label: "Panel de Gestión",
    description: "Administración de propiedades y servicios",
  },
  broker: {
    path: "/dashboard/broker",
    label: "Panel de Intermediario",
    description: "Comisiones del 4% sobre referidos directos",
  },
  broker_elite: {
    path: "/dashboard/broker",
    label: "Panel de Intermediario Elite",
    description: "Comisiones del 4% + beneficios exclusivos",
  },
  notaria: {
    path: "/notaria",
    label: "Panel Notarial",
    description: "Revisión y aprobación de documentos legales",
  },
  of_counsel: {
    path: "/dashboard/admin",
    label: "Panel Legal",
    description: "Asesoría legal y compliance",
  },
  service_provider: {
    path: "/dashboard/service-provider",
    label: "Panel de Servicios",
    description: "Gestión de servicios y mantenimiento",
  },
  vafi_manager: {
    path: "/dashboard/vafi",
    label: "Panel VA-FI",
    description: "Gestión de préstamos respaldados por NFT",
  },
  dao_member: {
    path: "/dashboard/dao",
    label: "Panel DAO",
    description: "Gobernanza y votaciones",
  },
  property_owner: {
    path: "/dashboard/owner",
    label: "Panel de Propietario",
    description: "Gestión de propiedades tokenizadas",
  },
  staff: {
    path: "/dashboard/member",
    label: "Panel de Staff",
    description: "Operaciones y soporte",
  },
  user: {
    path: "/dashboard/member",
    label: "Mi Dashboard",
    description: "Gestión de certificados y reservaciones",
  },
}

/**
 * Obtiene la ruta del dashboard correspondiente al rol del usuario
 */
export function getDashboardRoute(role: UserRole): string {
  return ROLE_DASHBOARDS[role]?.path || "/dashboard/member"
}

/**
 * Verifica si un usuario tiene acceso a una ruta específica
 */
export function canAccessRoute(userRole: UserRole, requestedPath: string): boolean {
  // Admin y super_admin tienen acceso a todo
  if (userRole === "admin" || userRole === "super_admin") {
    return true
  }

  // Verificar si el usuario está intentando acceder a su propio dashboard
  const userDashboard = getDashboardRoute(userRole)
  if (requestedPath.startsWith(userDashboard)) {
    return true
  }

  // Rutas públicas
  const publicPaths = ["/", "/destinos", "/servicios", "/intermediarios", "/proceso-completo", "/como-funciona"]
  if (publicPaths.includes(requestedPath)) {
    return true
  }

  return false
}

/**
 * Obtiene el nombre friendly del dashboard
 */
export function getDashboardLabel(role: UserRole): string {
  return ROLE_DASHBOARDS[role]?.label || "Dashboard"
}

/**
 * Obtiene la descripción del dashboard
 */
export function getDashboardDescription(role: UserRole): string {
  return ROLE_DASHBOARDS[role]?.description || ""
}
