import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/config/logger"

export const ADMIN_EMAIL = "corporativo@morises.com"

export type UserRole =
  | "admin"
  | "super_admin"
  | "management"
  | "broker"
  | "broker_elite"
  | "notaria"
  | "of_counsel"
  | "service_provider"
  | "vafi_manager"
  | "dao_member"
  | "property_owner"
  | "staff"
  | "user"

export interface RoleInfo {
  role: UserRole
  name: string
  email: string
}

export async function getUserRoleByEmail(email: string): Promise<RoleInfo | null> {
  try {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, role, full_name")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (userError) {
      logger.debug("[v0] Users table query error:", userError.message)
    }

    if (userData && userData.role) {
      return {
        role: userData.role as UserRole,
        name: userData.full_name || email.split("@")[0],
        email: userData.email,
      }
    }

    return {
      role: "user",
      name: email.split("@")[0],
      email: email,
    }
  } catch (error) {
    logger.error("[v0] Error in getUserRoleByEmail:", error)
    return {
      role: "user",
      name: email.split("@")[0],
      email: email,
    }
  }
}

export const rolePermissions = {
  admin: {
    canManageUsers: true,
    canManageProperties: true,
    canManageTransactions: true,
    canViewReports: true,
    canManageSystem: true,
    canApproveDocuments: true,
    canManageServices: true,
    canManageLoans: true,
    canManageDAO: true,
    canAccessAllDashboards: true,
  },
  super_admin: {
    canManageUsers: true,
    canManageProperties: true,
    canManageTransactions: true,
    canViewReports: true,
    canManageSystem: true,
    canApproveDocuments: true,
    canManageServices: true,
    canManageLoans: true,
    canManageDAO: true,
    canAccessAllDashboards: true,
  },
  management: {
    canManageUsers: false,
    canManageProperties: true,
    canManageTransactions: true,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: true,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  broker: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: true,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  broker_elite: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: true,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  notaria: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: false,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: true,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  of_counsel: {
    canManageUsers: false,
    canManageProperties: true,
    canManageTransactions: true,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: true,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  service_provider: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: false,
    canViewReports: false,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: true,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  vafi_manager: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: true,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: false,
    canManageLoans: true,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  dao_member: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: false,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: true,
    canAccessAllDashboards: false,
  },
  property_owner: {
    canManageUsers: false,
    canManageProperties: true,
    canManageTransactions: false,
    canViewReports: false,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  staff: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: false,
    canViewReports: true,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
  user: {
    canManageUsers: false,
    canManageProperties: false,
    canManageTransactions: false,
    canViewReports: false,
    canManageSystem: false,
    canApproveDocuments: false,
    canManageServices: false,
    canManageLoans: false,
    canManageDAO: false,
    canAccessAllDashboards: false,
  },
}

export function hasPermission(role: UserRole, permission: keyof typeof rolePermissions.admin): boolean {
  return rolePermissions[role]?.[permission] ?? false
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  super_admin: "Super Administrador",
  management: "Gestión",
  broker: "Intermediario",
  broker_elite: "Intermediario Elite",
  notaria: "Notaría",
  of_counsel: "Of Counsel",
  service_provider: "Proveedor de Servicios",
  vafi_manager: "Manager VA-FI",
  dao_member: "Miembro DAO",
  property_owner: "Propietario",
  staff: "Staff",
  user: "Usuario",
}

export const getUserRole = getUserRoleByEmail
