import { createClient } from "@/lib/supabase/client"

export type AuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "password_reset"
  | "2fa_enabled"
  | "2fa_disabled"
  | "role_change"
  | "user_create"
  | "user_update"
  | "user_delete"
  | "property_create"
  | "property_update"
  | "property_delete"
  | "property_approve"
  | "property_reject"
  | "week_purchase"
  | "week_transfer"
  | "transaction_create"
  | "payment_create"
  | "payment_complete"
  | "payment_failed"
  | "voucher_create"
  | "voucher_redeem"
  | "kyc_submit"
  | "kyc_approve"
  | "kyc_reject"
  | "escrow_deposit"
  | "escrow_release"
  | "escrow_refund"
  | "commission_calculate"
  | "commission_paid"
  | "broker_upgrade"
  | "contract_sign"
  | "dao_proposal_create"
  | "dao_vote"
  | "admin_action"
  | "data_export"
  | "settings_change"
  | "integration_connect"
  | "integration_disconnect"

export type AuditSeverity = "info" | "warning" | "error" | "critical"

interface AuditLogParams {
  action: AuditAction
  resourceType?: string
  resourceId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  severity?: AuditSeverity
  metadata?: Record<string, unknown>
}

export async function logAudit(params: AuditLogParams) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    let ipAddress = "unknown"
    let userAgent = "server"

    if (typeof window !== "undefined") {
      try {
        const ipResponse = await fetch("/api/client-ip")
        const ipData = await ipResponse.json()
        ipAddress = ipData.ip || "unknown"
      } catch {
        ipAddress = "unknown"
      }
      userAgent = navigator.userAgent
    }

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: params.action,
      severity: params.severity || "info",
      details: JSON.stringify({
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        old_value: params.oldValue,
        new_value: params.newValue,
        metadata: params.metadata,
        ip_address: ipAddress,
        user_agent: userAgent,
      }),
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Failed to log audit:", error)
    }
  } catch (error) {
    console.error("Audit logging error:", error)
  }
}

export async function logAuditServer(
  params: AuditLogParams & {
    userId: string
    ipAddress?: string
    userAgent?: string
  },
) {
  try {
    const { createClient: createServerClient } = await import("@/lib/supabase/server")
    const supabase = await createServerClient()

    const { error } = await supabase.from("audit_logs").insert({
      user_id: params.userId,
      action: params.action,
      severity: params.severity || "info",
      details: JSON.stringify({
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        old_value: params.oldValue,
        new_value: params.newValue,
        metadata: params.metadata,
        ip_address: params.ipAddress || "server",
        user_agent: params.userAgent || "server",
      }),
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Failed to log server audit:", error)
    }
  } catch (error) {
    console.error("Server audit logging error:", error)
  }
}

export const auditHelpers = {
  logLogin: (userId: string, success = true) =>
    logAudit({
      action: success ? "login" : "login_failed",
      severity: success ? "info" : "warning",
    }),

  logPropertyAction: (action: "property_create" | "property_update" | "property_approve", propertyId: string) =>
    logAudit({
      action,
      resourceType: "property",
      resourceId: propertyId,
      severity: "info",
    }),

  logPayment: (action: "payment_create" | "payment_complete" | "payment_failed", paymentId: string, amount?: number) =>
    logAudit({
      action,
      resourceType: "payment",
      resourceId: paymentId,
      severity: action === "payment_failed" ? "error" : "info",
      metadata: { amount },
    }),

  logKYC: (action: "kyc_approve" | "kyc_reject", kycId: string, reason?: string) =>
    logAudit({
      action,
      resourceType: "kyc",
      resourceId: kycId,
      severity: "info",
      metadata: { reason },
    }),

  logAdminAction: (description: string, targetUserId?: string) =>
    logAudit({
      action: "admin_action",
      severity: "warning",
      metadata: { description, targetUserId },
    }),
}
