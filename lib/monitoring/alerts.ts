/**
 * WEEK-CHAIN Alerts & SLA Monitoring System
 * Real-time monitoring, breach detection, and notification routing
 * Based on the 360° REaaS Architecture Document
 */

import { createClient } from "@/lib/supabase/server"

// ============================================================================
// TYPES
// ============================================================================

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertType = 
  | 'sla_breach'
  | 'sla_warning'
  | 'capacity_alert'
  | 'compliance_alert'
  | 'payment_alert'
  | 'booking_alert'
  | 'incident_alert'
  | 'system_alert'
  | 'security_alert'

export interface Alert {
  id?: string
  alertType: AlertType
  severity: AlertSeverity
  entityType?: string
  entityId?: string
  title: string
  message: string
  metadata?: Record<string, unknown>
  notifyRoles?: string[]
  notifyUsers?: string[]
  channels?: ('email' | 'whatsapp' | 'slack' | 'in_app')[]
  createdAt?: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface SLAConfig {
  name: string
  entityType: string
  fromStatus: string
  toStatus: string
  targetMinutes: number
  warningThresholdPercent: number // Alert at this % of target (e.g., 80%)
  escalationRoles: string[]
}

// ============================================================================
// SLA CONFIGURATIONS
// ============================================================================

export const SLA_CONFIGS: SLAConfig[] = [
  // Request SLAs (from architecture doc)
  {
    name: 'Request to Offer',
    entityType: 'request',
    fromStatus: 'received',
    toStatus: 'offer_sent',
    targetMinutes: 240, // 4 hours
    warningThresholdPercent: 75,
    escalationRoles: ['operations', 'admin'],
  },
  {
    name: 'Offer to Response',
    entityType: 'request',
    fromStatus: 'offer_sent',
    toStatus: 'offer_accepted',
    targetMinutes: 1440, // 24 hours
    warningThresholdPercent: 80,
    escalationRoles: ['sales', 'operations'],
  },
  {
    name: 'Total Request Resolution',
    entityType: 'request',
    fromStatus: 'received',
    toStatus: 'offer_accepted',
    targetMinutes: 2880, // 48 hours total
    warningThresholdPercent: 70,
    escalationRoles: ['admin'],
  },
  
  // Incident SLAs
  {
    name: 'Incident Triage',
    entityType: 'incident',
    fromStatus: 'open',
    toStatus: 'triage',
    targetMinutes: 30,
    warningThresholdPercent: 80,
    escalationRoles: ['service', 'operations'],
  },
  {
    name: 'Incident First Response',
    entityType: 'incident',
    fromStatus: 'triage',
    toStatus: 'in_progress',
    targetMinutes: 60,
    warningThresholdPercent: 75,
    escalationRoles: ['service', 'operations', 'admin'],
  },
  {
    name: 'Critical Incident Resolution',
    entityType: 'incident',
    fromStatus: 'open',
    toStatus: 'resolved',
    targetMinutes: 240, // 4 hours for critical
    warningThresholdPercent: 50,
    escalationRoles: ['operations', 'admin'],
  },
  
  // Compliance SLAs
  {
    name: 'KYC Review',
    entityType: 'compliance',
    fromStatus: 'pending',
    toStatus: 'approved',
    targetMinutes: 1440, // 24 hours
    warningThresholdPercent: 80,
    escalationRoles: ['compliance', 'legal'],
  },
  {
    name: 'ARCO Request Response',
    entityType: 'arco_request',
    fromStatus: 'pending',
    toStatus: 'completed',
    targetMinutes: 20160, // 14 days (legal requirement is 20 business days)
    warningThresholdPercent: 70,
    escalationRoles: ['legal', 'compliance', 'admin'],
  },
  
  // Booking SLAs
  {
    name: 'Pre-Arrival Communication',
    entityType: 'booking',
    fromStatus: 'confirmed',
    toStatus: 'pre_arrival',
    targetMinutes: 4320, // 3 days before
    warningThresholdPercent: 90,
    escalationRoles: ['service', 'operations'],
  },
]

// ============================================================================
// ALERT THRESHOLDS
// ============================================================================

export const ALERT_THRESHOLDS = {
  capacity: {
    low_availability: 15, // Alert when <15% weeks available
    overbooking_risk: 95, // Alert when >95% booked
  },
  financial: {
    large_transaction_usd: 10000,
    daily_volume_usd: 100000,
    failed_payment_count: 3,
    chargeback_rate_percent: 1,
  },
  compliance: {
    kyc_pending_days: 3,
    contract_unsigned_days: 7,
    aml_high_risk_score: 50,
  },
  operational: {
    incident_open_hours: 24,
    request_pending_hours: 4,
    review_negative_threshold: 3, // Star rating
  },
}

// ============================================================================
// CORE ALERT FUNCTIONS
// ============================================================================

/**
 * Create a new alert
 */
export async function createAlert(alert: Alert): Promise<{ success: boolean; alertId?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('system_alerts')
    .insert({
      alert_type: alert.alertType,
      severity: alert.severity,
      entity_type: alert.entityType,
      entity_id: alert.entityId,
      title: alert.title,
      message: alert.message,
      metadata: alert.metadata || {},
      notify_roles: alert.notifyRoles || [],
      notify_users: alert.notifyUsers || [],
      channels: alert.channels || ['in_app', 'email'],
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to create alert:', error)
    return { success: false }
  }
  
  // Route notifications
  await routeAlertNotifications(data)
  
  return { success: true, alertId: data.id }
}

/**
 * Route alert notifications to appropriate channels
 */
async function routeAlertNotifications(alert: Record<string, unknown>): Promise<void> {
  const supabase = await createClient()
  const channels = (alert.channels as string[]) || ['in_app', 'email']
  const notifyRoles = (alert.notify_roles as string[]) || []
  const notifyUsers = (alert.notify_users as string[]) || []
  
  // Get users to notify
  let usersToNotify: { id: string; email: string; phone?: string }[] = []
  
  if (notifyRoles.length > 0) {
    const { data: roleUsers } = await supabase
      .from('users')
      .select('id, email, phone')
      .in('role', notifyRoles)
    
    if (roleUsers) {
      usersToNotify = [...usersToNotify, ...roleUsers]
    }
  }
  
  if (notifyUsers.length > 0) {
    const { data: specificUsers } = await supabase
      .from('users')
      .select('id, email, phone')
      .in('id', notifyUsers)
    
    if (specificUsers) {
      usersToNotify = [...usersToNotify, ...specificUsers]
    }
  }
  
  // Deduplicate
  const uniqueUsers = Array.from(new Map(usersToNotify.map(u => [u.id, u])).values())
  
  // Queue notifications
  for (const user of uniqueUsers) {
    // In-app notification
    if (channels.includes('in_app')) {
      await supabase.from('user_notifications').insert({
        user_id: user.id,
        title: alert.title,
        message: alert.message,
        type: alert.alert_type,
        severity: alert.severity,
        entity_type: alert.entity_type,
        entity_id: alert.entity_id,
        read: false,
        created_at: new Date().toISOString(),
      })
    }
    
    // Email notification
    if (channels.includes('email') && user.email) {
      await supabase.from('notification_queue').insert({
        channel: 'email',
        recipient: user.email,
        template: `alert_${alert.severity}`,
        payload: {
          title: alert.title,
          message: alert.message,
          alertType: alert.alert_type,
          entityType: alert.entity_type,
          entityId: alert.entity_id,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/alerts`,
        },
        status: 'pending',
      })
    }
    
    // WhatsApp for critical alerts
    if (channels.includes('whatsapp') && user.phone && alert.severity === 'critical') {
      await supabase.from('notification_queue').insert({
        channel: 'whatsapp',
        recipient: user.phone,
        template: 'critical_alert',
        payload: {
          title: alert.title,
          message: alert.message,
        },
        status: 'pending',
      })
    }
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  alertId: string,
  userId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('system_alerts')
    .update({
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: userId,
    })
    .eq('id', alertId)
    .is('acknowledged_at', null)
  
  return { success: !error }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(
  alertId: string,
  userId: string,
  resolution?: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('system_alerts')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
      resolution_notes: resolution,
    })
    .eq('id', alertId)
    .is('resolved_at', null)
  
  return { success: !error }
}

// ============================================================================
// SLA MONITORING
// ============================================================================

/**
 * Check for SLA warnings and breaches
 */
export async function checkSLAStatus(): Promise<{
  warnings: number
  breaches: number
  alerts: Alert[]
}> {
  const supabase = await createClient()
  const alerts: Alert[] = []
  let warnings = 0
  let breaches = 0
  
  // Get all active SLA tracking records
  const { data: activeSLAs } = await supabase
    .from('sla_tracking')
    .select('*')
    .is('completed_at', null)
    .is('breached_at', null)
  
  if (!activeSLAs) return { warnings: 0, breaches: 0, alerts: [] }
  
  const now = new Date()
  
  for (const sla of activeSLAs) {
    const deadline = new Date(sla.deadline_at)
    const started = new Date(sla.started_at)
    const totalDuration = deadline.getTime() - started.getTime()
    const elapsed = now.getTime() - started.getTime()
    const percentComplete = (elapsed / totalDuration) * 100
    
    // Find matching SLA config
    const config = SLA_CONFIGS.find(c => 
      c.entityType === sla.entity_type && 
      c.name.toLowerCase().includes(sla.transition_name.replace(/_/g, ' '))
    )
    
    const warningThreshold = config?.warningThresholdPercent || 80
    
    if (now > deadline) {
      // SLA Breached
      breaches++
      
      // Mark as breached in DB
      await supabase
        .from('sla_tracking')
        .update({ breached_at: now.toISOString() })
        .eq('id', sla.id)
      
      const alert: Alert = {
        alertType: 'sla_breach',
        severity: 'critical',
        entityType: sla.entity_type,
        entityId: sla.entity_id,
        title: `SLA Breach: ${sla.transition_name}`,
        message: `SLA for ${sla.transition_name} was breached. Deadline was ${deadline.toISOString()}`,
        metadata: {
          slaId: sla.id,
          slaMinutes: sla.sla_minutes,
          deadline: sla.deadline_at,
        },
        notifyRoles: config?.escalationRoles || ['admin'],
        channels: ['email', 'in_app', 'whatsapp'],
      }
      
      alerts.push(alert)
      await createAlert(alert)
      
    } else if (percentComplete >= warningThreshold) {
      // SLA Warning
      warnings++
      
      // Check if warning already sent
      const { data: existingWarning } = await supabase
        .from('system_alerts')
        .select('id')
        .eq('alert_type', 'sla_warning')
        .eq('entity_id', sla.entity_id)
        .gte('created_at', sla.started_at)
        .limit(1)
        .single()
      
      if (!existingWarning) {
        const minutesRemaining = Math.floor((deadline.getTime() - now.getTime()) / 60000)
        
        const alert: Alert = {
          alertType: 'sla_warning',
          severity: 'high',
          entityType: sla.entity_type,
          entityId: sla.entity_id,
          title: `SLA Warning: ${sla.transition_name}`,
          message: `SLA at ${Math.round(percentComplete)}% of target. ${minutesRemaining} minutes remaining.`,
          metadata: {
            slaId: sla.id,
            percentComplete: Math.round(percentComplete),
            minutesRemaining,
          },
          notifyRoles: config?.escalationRoles || ['operations'],
          channels: ['email', 'in_app'],
        }
        
        alerts.push(alert)
        await createAlert(alert)
      }
    }
  }
  
  return { warnings, breaches, alerts }
}

/**
 * Start SLA tracking for an entity
 */
export async function startSLATracking(
  entityType: string,
  entityId: string,
  transitionName: string,
  slaMinutes: number
): Promise<{ success: boolean; trackingId?: string }> {
  const supabase = await createClient()
  
  const now = new Date()
  const deadline = new Date(now.getTime() + slaMinutes * 60000)
  
  const { data, error } = await supabase
    .from('sla_tracking')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      transition_name: transitionName,
      started_at: now.toISOString(),
      deadline_at: deadline.toISOString(),
      sla_minutes: slaMinutes,
    })
    .select()
    .single()
  
  return { success: !error, trackingId: data?.id }
}

/**
 * Complete SLA tracking
 */
export async function completeSLATracking(
  entityType: string,
  entityId: string,
  transitionName: string
): Promise<{ success: boolean; wasBreached: boolean }> {
  const supabase = await createClient()
  
  const now = new Date()
  
  // Find and update the tracking record
  const { data: tracking } = await supabase
    .from('sla_tracking')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('transition_name', transitionName)
    .is('completed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (!tracking) {
    return { success: false, wasBreached: false }
  }
  
  const wasBreached = now > new Date(tracking.deadline_at)
  
  await supabase
    .from('sla_tracking')
    .update({
      completed_at: now.toISOString(),
      breached_at: wasBreached ? tracking.deadline_at : null,
    })
    .eq('id', tracking.id)
  
  return { success: true, wasBreached }
}

// ============================================================================
// THRESHOLD MONITORING
// ============================================================================

/**
 * Check capacity alerts
 */
export async function checkCapacityAlerts(): Promise<Alert[]> {
  const supabase = await createClient()
  const alerts: Alert[] = []
  
  // Get properties with availability
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, name,
      weeks(status)
    `)
    .eq('status', 'active')
  
  if (!properties) return alerts
  
  for (const property of properties) {
    const weeks = (property.weeks as { status: string }[]) || []
    const totalWeeks = weeks.length
    const availableWeeks = weeks.filter(w => w.status === 'available').length
    const availabilityPercent = totalWeeks > 0 ? (availableWeeks / totalWeeks) * 100 : 0
    
    if (availabilityPercent < ALERT_THRESHOLDS.capacity.low_availability) {
      const alert: Alert = {
        alertType: 'capacity_alert',
        severity: availabilityPercent < 5 ? 'critical' : 'high',
        entityType: 'properties',
        entityId: property.id,
        title: `Low Availability: ${property.name}`,
        message: `Only ${availableWeeks} weeks available (${availabilityPercent.toFixed(1)}%)`,
        metadata: { availableWeeks, totalWeeks, availabilityPercent },
        notifyRoles: ['operations', 'sales'],
        channels: ['email', 'in_app'],
      }
      
      alerts.push(alert)
      await createAlert(alert)
    }
  }
  
  return alerts
}

/**
 * Check financial alerts
 */
export async function checkFinancialAlerts(): Promise<Alert[]> {
  const supabase = await createClient()
  const alerts: Alert[] = []
  
  // Check for failed payments
  const { data: failedPayments } = await supabase
    .from('payments')
    .select('user_id, count')
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  
  // Group by user
  const userFailures: Record<string, number> = {}
  for (const payment of failedPayments || []) {
    userFailures[payment.user_id] = (userFailures[payment.user_id] || 0) + 1
  }
  
  for (const [userId, count] of Object.entries(userFailures)) {
    if (count >= ALERT_THRESHOLDS.financial.failed_payment_count) {
      const alert: Alert = {
        alertType: 'payment_alert',
        severity: 'high',
        entityType: 'users',
        entityId: userId,
        title: `Multiple Failed Payments`,
        message: `User has ${count} failed payment attempts in the last 7 days`,
        metadata: { failedCount: count },
        notifyRoles: ['finance', 'operations'],
        channels: ['email', 'in_app'],
      }
      
      alerts.push(alert)
      await createAlert(alert)
    }
  }
  
  // Check for chargebacks
  const { data: chargebacks } = await supabase
    .from('payments')
    .select('id')
    .eq('status', 'chargeback')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  
  const { data: totalPayments } = await supabase
    .from('payments')
    .select('id')
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  
  const chargebackRate = totalPayments?.length 
    ? ((chargebacks?.length || 0) / totalPayments.length) * 100 
    : 0
  
  if (chargebackRate > ALERT_THRESHOLDS.financial.chargeback_rate_percent) {
    const alert: Alert = {
      alertType: 'payment_alert',
      severity: 'critical',
      title: `High Chargeback Rate`,
      message: `Chargeback rate is ${chargebackRate.toFixed(2)}% (threshold: ${ALERT_THRESHOLDS.financial.chargeback_rate_percent}%)`,
      metadata: { chargebackRate, chargebackCount: chargebacks?.length, totalPayments: totalPayments?.length },
      notifyRoles: ['finance', 'admin', 'legal'],
      channels: ['email', 'in_app', 'whatsapp'],
    }
    
    alerts.push(alert)
    await createAlert(alert)
  }
  
  return alerts
}

/**
 * Check compliance alerts
 */
export async function checkComplianceAlerts(): Promise<Alert[]> {
  const supabase = await createClient()
  const alerts: Alert[] = []
  
  // Check for pending KYC
  const kycThresholdDate = new Date()
  kycThresholdDate.setDate(kycThresholdDate.getDate() - ALERT_THRESHOLDS.compliance.kyc_pending_days)
  
  const { data: pendingKYC } = await supabase
    .from('users')
    .select('id, email, full_name, created_at')
    .eq('kyc_status', 'pending')
    .lt('created_at', kycThresholdDate.toISOString())
  
  for (const user of pendingKYC || []) {
    const alert: Alert = {
      alertType: 'compliance_alert',
      severity: 'medium',
      entityType: 'users',
      entityId: user.id,
      title: `KYC Pending: ${user.full_name || user.email}`,
      message: `User KYC has been pending for more than ${ALERT_THRESHOLDS.compliance.kyc_pending_days} days`,
      metadata: { createdAt: user.created_at },
      notifyRoles: ['compliance'],
      channels: ['email', 'in_app'],
    }
    
    alerts.push(alert)
    await createAlert(alert)
  }
  
  // Check for unsigned contracts
  const contractThresholdDate = new Date()
  contractThresholdDate.setDate(contractThresholdDate.getDate() - ALERT_THRESHOLDS.compliance.contract_unsigned_days)
  
  const { data: unsignedContracts } = await supabase
    .from('legal_contracts')
    .select('id, user_id, contract_type, created_at')
    .eq('status', 'pending_signature')
    .lt('created_at', contractThresholdDate.toISOString())
  
  for (const contract of unsignedContracts || []) {
    const alert: Alert = {
      alertType: 'compliance_alert',
      severity: 'high',
      entityType: 'legal_contracts',
      entityId: contract.id,
      title: `Unsigned Contract`,
      message: `Contract has been awaiting signature for more than ${ALERT_THRESHOLDS.compliance.contract_unsigned_days} days`,
      metadata: { contractType: contract.contract_type, createdAt: contract.created_at },
      notifyRoles: ['legal', 'compliance'],
      channels: ['email', 'in_app'],
    }
    
    alerts.push(alert)
    await createAlert(alert)
  }
  
  return alerts
}

// ============================================================================
// SCHEDULED MONITORING
// ============================================================================

/**
 * Run all monitoring checks (call via cron job)
 */
export async function runAllMonitoringChecks(): Promise<{
  slaWarnings: number
  slaBreaches: number
  capacityAlerts: number
  financialAlerts: number
  complianceAlerts: number
  totalAlerts: number
}> {
  const slaResult = await checkSLAStatus()
  const capacityAlerts = await checkCapacityAlerts()
  const financialAlerts = await checkFinancialAlerts()
  const complianceAlerts = await checkComplianceAlerts()
  
  const totalAlerts = 
    slaResult.alerts.length + 
    capacityAlerts.length + 
    financialAlerts.length + 
    complianceAlerts.length
  
  return {
    slaWarnings: slaResult.warnings,
    slaBreaches: slaResult.breaches,
    capacityAlerts: capacityAlerts.length,
    financialAlerts: financialAlerts.length,
    complianceAlerts: complianceAlerts.length,
    totalAlerts,
  }
}

/**
 * Get alert statistics
 */
export async function getAlertStats(days = 7): Promise<{
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  acknowledged: number
  resolved: number
  pending: number
}> {
  const supabase = await createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const { data: alerts } = await supabase
    .from('system_alerts')
    .select('*')
    .gte('created_at', since.toISOString())
  
  if (!alerts) {
    return {
      total: 0,
      byType: {},
      bySeverity: {},
      acknowledged: 0,
      resolved: 0,
      pending: 0,
    }
  }
  
  const byType: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  let acknowledged = 0
  let resolved = 0
  
  for (const alert of alerts) {
    byType[alert.alert_type] = (byType[alert.alert_type] || 0) + 1
    bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1
    if (alert.acknowledged_at) acknowledged++
    if (alert.resolved_at) resolved++
  }
  
  return {
    total: alerts.length,
    byType,
    bySeverity,
    acknowledged,
    resolved,
    pending: alerts.length - resolved,
  }
}
