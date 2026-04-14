import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// User roles from profiles table
export type UserRole =
  | "admin_super" |"admin_ops" |"admin_finance" |"admin_compliance" |"support_l2" |"holder" |"management" |"booking" |"agency_b2b" |"agent" |"service_provider_company" |"vendor" |"insurance" |"review_moderation" |"foundation" |"vafi"

// Actions that can be performed
export type Action = "view" | "create" | "edit" | "delete" | "approve" | "override"

// Resources in the system
export type Resource =
  | "properties" |"reservations" |"payments" |"users" |"kyc" |"payouts" |"reviews" |"services" |"insurance_policies" |"foundation_projects" |"vafi_loans"

/**
 * Require specific roles for a server action or page
 * Redirects to unauthorized page if user doesn't have required role
 *
 * @example
 * await requireRole(["admin_super", "admin_ops"])
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<{ userId: string; role: UserRole }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", user.id).maybeSingle()

  if (!profile) {
    redirect("/auth?error=no_profile")
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect("/unauthorized")
  }

  return { userId: user.id, role: profile.role as UserRole }
}

/**
 * Check if a user has permission to perform an action on a resource
 *
 * @example
 * const hasPermission = await can(user, "approve", "kyc")
 */
export async function can(
  userId: string,
  action: Action,
  resource: Resource,
): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", userId).maybeSingle()

  if (!profile || profile.status !== "active") {
    return false
  }

  const role = profile.role as UserRole

  // Permission matrix
  const permissions: Record<UserRole, Record<Resource, Action[]>> = {
    admin_super: {
      properties: ["view", "create", "edit", "delete", "approve", "override"],
      reservations: ["view", "create", "edit", "delete", "approve", "override"],
      payments: ["view", "create", "edit", "delete", "approve", "override"],
      users: ["view", "create", "edit", "delete", "approve", "override"],
      kyc: ["view", "approve", "override"],
      payouts: ["view", "approve", "override"],
      reviews: ["view", "approve", "delete", "override"],
      services: ["view", "create", "edit", "delete", "approve"],
      insurance_policies: ["view", "approve"],
      foundation_projects: ["view", "create", "edit", "approve"],
      vafi_loans: ["view", "approve", "override"],
    },
    admin_ops: {
      properties: ["view", "create", "edit", "approve"],
      reservations: ["view", "create", "edit", "approve"],
      payments: ["view"],
      users: ["view"],
      kyc: ["view", "approve"],
      payouts: ["view"],
      reviews: ["view", "approve", "delete"],
      services: ["view", "approve"],
      insurance_policies: ["view"],
      foundation_projects: ["view"],
      vafi_loans: ["view"],
    },
    admin_finance: {
      properties: ["view"],
      reservations: ["view"],
      payments: ["view", "approve"],
      users: ["view"],
      kyc: ["view"],
      payouts: ["view", "approve"],
      reviews: ["view"],
      services: ["view"],
      insurance_policies: ["view"],
      foundation_projects: ["view"],
      vafi_loans: ["view", "approve"],
    },
    admin_compliance: {
      properties: ["view"],
      reservations: ["view"],
      payments: ["view"],
      users: ["view"],
      kyc: ["view", "approve", "override"],
      payouts: ["view"],
      reviews: ["view", "approve"],
      services: ["view"],
      insurance_policies: ["view"],
      foundation_projects: ["view"],
      vafi_loans: ["view"],
    },
    support_l2: {
      properties: ["view"],
      reservations: ["view", "edit"],
      payments: ["view"],
      users: ["view"],
      kyc: ["view"],
      payouts: [],
      reviews: ["view"],
      services: ["view"],
      insurance_policies: ["view"],
      foundation_projects: [],
      vafi_loans: [],
    },
    holder: {
      properties: ["view"],
      reservations: ["view", "create"],
      payments: ["view"],
      users: [],
      kyc: [],
      payouts: [],
      reviews: ["view", "create"],
      services: ["view"],
      insurance_policies: ["view"],
      foundation_projects: [],
      vafi_loans: ["view", "create"],
    },
    management: {
      properties: ["view", "edit"],
      reservations: ["view", "edit"],
      payments: ["view"],
      users: [],
      kyc: [],
      payouts: ["view"],
      reviews: ["view"],
      services: ["view", "create", "edit"],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: [],
    },
    booking: {
      properties: ["view"],
      reservations: ["view", "create", "edit", "approve"],
      payments: ["view"],
      users: ["view"],
      kyc: [],
      payouts: [],
      reviews: ["view"],
      services: ["view"],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: [],
    },
    agency_b2b: {
      properties: ["view"],
      reservations: ["view", "create"],
      payments: ["view"],
      users: ["view"],
      kyc: [],
      payouts: ["view"],
      reviews: ["view"],
      services: ["view"],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: [],
    },
    agent: {
      properties: ["view"],
      reservations: ["view"],
      payments: ["view"],
      users: ["view"],
      kyc: [],
      payouts: ["view"],
      reviews: [],
      services: [],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: [],
    },
    service_provider_company: {
      properties: [],
      reservations: ["view"],
      payments: ["view"],
      users: [],
      kyc: [],
      payouts: ["view"],
      reviews: ["view"],
      services: ["view", "create", "edit"],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: [],
    },
    vendor: {
      properties: [],
      reservations: [],
      payments: ["view"],
      users: [],
      kyc: [],
      payouts: ["view"],
      reviews: [],
      services: ["view", "create", "edit"],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: [],
    },
    insurance: {
      properties: ["view"],
      reservations: ["view"],
      payments: ["view"],
      users: ["view"],
      kyc: ["view"],
      payouts: ["view"],
      reviews: [],
      services: [],
      insurance_policies: ["view", "create", "edit", "approve"],
      foundation_projects: [],
      vafi_loans: [],
    },
    review_moderation: {
      properties: ["view"],
      reservations: [],
      payments: [],
      users: ["view"],
      kyc: [],
      payouts: [],
      reviews: ["view", "approve", "delete"],
      services: [],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: [],
    },
    foundation: {
      properties: [],
      reservations: [],
      payments: ["view"],
      users: [],
      kyc: [],
      payouts: ["view"],
      reviews: [],
      services: [],
      insurance_policies: [],
      foundation_projects: ["view", "create", "edit"],
      vafi_loans: [],
    },
    vafi: {
      properties: [],
      reservations: [],
      payments: ["view"],
      users: ["view"],
      kyc: ["view"],
      payouts: ["view"],
      reviews: [],
      services: [],
      insurance_policies: [],
      foundation_projects: [],
      vafi_loans: ["view", "create", "edit", "approve"],
    },
  }

  const rolePermissions = permissions[role]
  if (!rolePermissions) {
    return false
  }

  const resourceActions = rolePermissions[resource]
  if (!resourceActions) {
    return false
  }

  return resourceActions.includes(action)
}

/**
 * Check if user can perform action, throw error if not
 *
 * @example
 * await requirePermission(userId, "approve", "kyc")
 */
export async function requirePermission(
  userId: string,
  action: Action,
  resource: Resource,
): Promise<void> {
  const hasPermission = await can(userId, action, resource)

  if (!hasPermission) {
    throw new Error(`Permission denied: cannot ${action} ${resource}`)
  }
}

/**
 * Get user's profile with role
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, status, kyc_status, locale")
    .eq("id", userId)
    .maybeSingle()

  return profile
}

/**
 * Check if user is admin (any admin role)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  if (!profile) return false

  const adminRoles: UserRole[] = ["admin_super", "admin_ops", "admin_finance", "admin_compliance"]
  return adminRoles.includes(profile.role as UserRole)
}
