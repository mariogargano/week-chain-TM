/**
 * WEEK-CHAIN Workflow Engine
 * Handles state transitions, SLA tracking, and event processing
 * Based on the 360° REaaS Architecture Document
 */

import { createClient } from "@/lib/supabase/server";

// ============================================================================
// TYPES
// ============================================================================

export type EntityType = 'lead' | 'svc' | 'request' | 'booking' | 'incident' | 'compliance'

export type LeadStatus = 'lead' | 'prospect' | 'qualified' | 'customer' | 'holder_active' | 'holder_renewal' | 'holder_expired' | 'churned'
export type SVCStatus = 'draft' | 'pending_payment' | 'paid' | 'issued' | 'active' | 'suspended' | 'expired' | 'cancelled' | 'transferred'
export type RequestStatus = 'received' | 'validating' | 'queued' | 'offer_pending' | 'offer_sent' | 'offer_accepted' | 'offer_rejected' | 'offer_expired' | 'cancelled'
export type BookingStatus = 'pending' | 'confirmed' | 'pre_arrival' | 'checked_in' | 'in_progress' | 'checked_out' | 'completed' | 'post_stay' | 'cancelled' | 'no_show'
export type IncidentStatus = 'open' | 'triage' | 'assigned' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed' | 'reopened'
export type ComplianceStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'alert' | 'blocked' | 'expired'

export interface TransitionResult {
  success: boolean
  newStatus?: string
  error?: string
  slaDeadline?: string
  triggeredActions?: string[]
}

export interface WorkflowEvent {
  id: string
  entityType: EntityType
  entityId: string
  eventType: string
  payload: Record<string, unknown>
  triggeredBy: string
  createdAt: string
}

// ============================================================================
// STATE MACHINE DEFINITIONS
// ============================================================================

export const STATE_MACHINES = {
  lead: {
    initial: 'lead',
    states: {
      lead: { next: ['prospect', 'churned'] },
      prospect: { next: ['qualified', 'churned'] },
      qualified: { next: ['customer', 'churned'] },
      customer: { next: ['holder_active', 'churned'] },
      holder_active: { next: ['holder_renewal', 'holder_expired', 'churned'] },
      holder_renewal: { next: ['holder_active', 'holder_expired', 'churned'] },
      holder_expired: { next: ['holder_renewal', 'churned'] },
      churned: { next: ['lead'] }, // Can re-engage
    },
  },
  svc: {
    initial: 'draft',
    states: {
      draft: { next: ['pending_payment', 'cancelled'] },
      pending_payment: { next: ['paid', 'cancelled'] },
      paid: { next: ['issued'] },
      issued: { next: ['active'] },
      active: { next: ['suspended', 'expired', 'transferred'] },
      suspended: { next: ['active', 'cancelled'] },
      expired: { next: ['cancelled'] },
      transferred: { next: [] }, // Terminal
      cancelled: { next: [] }, // Terminal
    },
  },
  request: {
    initial: 'received',
    states: {
      received: { next: ['validating', 'cancelled'] },
      validating: { next: ['queued', 'cancelled'] },
      queued: { next: ['offer_pending'] },
      offer_pending: { next: ['offer_sent', 'cancelled'] },
      offer_sent: { next: ['offer_accepted', 'offer_rejected', 'offer_expired'] },
      offer_accepted: { next: [] }, // Terminal - becomes Booking
      offer_rejected: { next: ['queued'] }, // Can retry
      offer_expired: { next: ['queued', 'cancelled'] },
      cancelled: { next: [] }, // Terminal
    },
  },
  booking: {
    initial: 'pending',
    states: {
      pending: { next: ['confirmed', 'cancelled'] },
      confirmed: { next: ['pre_arrival', 'cancelled'] },
      pre_arrival: { next: ['checked_in', 'no_show', 'cancelled'] },
      checked_in: { next: ['in_progress'] },
      in_progress: { next: ['checked_out'] },
      checked_out: { next: ['completed'] },
      completed: { next: ['post_stay'] },
      post_stay: { next: [] }, // Terminal
      cancelled: { next: [] }, // Terminal
      no_show: { next: [] }, // Terminal
    },
  },
  incident: {
    initial: 'open',
    states: {
      open: { next: ['triage'] },
      triage: { next: ['assigned', 'closed'] },
      assigned: { next: ['in_progress', 'closed'] },
      in_progress: { next: ['pending_customer', 'resolved'] },
      pending_customer: { next: ['in_progress', 'resolved', 'closed'] },
      resolved: { next: ['closed', 'reopened'] },
      closed: { next: ['reopened'] },
      reopened: { next: ['triage'] },
    },
  },
  compliance: {
    initial: 'pending',
    states: {
      pending: { next: ['in_review'] },
      in_review: { next: ['approved', 'rejected', 'alert'] },
      approved: { next: ['expired', 'alert'] },
      rejected: { next: ['pending'] }, // Can retry
      alert: { next: ['blocked', 'approved'] },
      blocked: { next: ['pending'] }, // Manual unblock
      expired: { next: ['pending'] }, // Re-verify
    },
  },
}

// SLA definitions in minutes
export const SLA_DEFINITIONS = {
  request: {
    received_to_validating: 30, // 30 min
    validating_to_queued: 60, // 1 hour
    queued_to_offer_sent: 240, // 4 hours (Request-to-Offer <4h)
    offer_sent_to_response: 1440, // 24 hours (Offer-to-Confirm <24h)
  },
  booking: {
    confirmed_to_pre_arrival: 4320, // 3 days before
    pre_arrival_to_checked_in: 1440, // 24 hours
    checked_out_to_completed: 60, // 1 hour
  },
  incident: {
    open_to_triage: 30, // 30 min
    triage_to_assigned: 60, // 1 hour
    assigned_to_response: 240, // 4 hours
  },
  compliance: {
    pending_to_review: 1440, // 24 hours
    review_to_decision: 2880, // 48 hours
  },
}

// ============================================================================
// WORKFLOW ENGINE FUNCTIONS
// ============================================================================

/**
 * Validate if a state transition is allowed
 */
export function isTransitionAllowed(
  entityType: EntityType,
  currentStatus: string,
  newStatus: string
): boolean {
  const machine = STATE_MACHINES[entityType]
  if (!machine) return false
  
  const currentState = machine.states[currentStatus as keyof typeof machine.states]
  if (!currentState) return false
  
  return currentState.next.includes(newStatus)
}

/**
 * Execute a state transition with validation and side effects
 */
export async function executeTransition(
  entityType: EntityType,
  entityId: string,
  newStatus: string,
  actorId: string,
  metadata?: Record<string, unknown>
): Promise<TransitionResult> {
  const supabase = await createClient()
  
  // Get current entity status
  const tableMap: Record<EntityType, string> = {
    lead: 'users',
    svc: 'user_certificates_v2',
    request: 'reservation_requests',
    booking: 'confirmed_reservations',
    incident: 'incidents',
    compliance: 'compliance_records',
  }
  
  const statusFieldMap: Record<EntityType, string> = {
    lead: 'lead_status',
    svc: 'status',
    request: 'status',
    booking: 'status',
    incident: 'status',
    compliance: 'status',
  }
  
  const table = tableMap[entityType]
  const statusField = statusFieldMap[entityType]
  
  // Fetch current status
  const { data: entity, error: fetchError } = await supabase
    .from(table)
    .select(`id, ${statusField}`)
    .eq('id', entityId)
    .single()
  
  if (fetchError || !entity) {
    return { success: false, error: `Entity not found: ${entityId}` }
  }
  
  const currentStatus = entity[statusField]
  
  // Validate transition
  if (!isTransitionAllowed(entityType, currentStatus, newStatus)) {
    return { 
      success: false, 
      error: `Invalid transition: ${currentStatus} -> ${newStatus} for ${entityType}` 
    }
  }
  
  // Check actor permissions via RBAC
  const { data: hasPermission } = await supabase.rpc('check_permission', {
    p_user_id: actorId,
    p_resource: `${entityType}s`,
    p_action: 'update',
  })
  
  if (!hasPermission) {
    return { success: false, error: 'Permission denied for this transition' }
  }
  
  // Execute transition
  const { error: updateError } = await supabase
    .from(table)
    .update({ 
      [statusField]: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entityId)
  
  if (updateError) {
    return { success: false, error: updateError.message }
  }
  
  // Record in state history
  await supabase.from('state_history').insert({
    entity_type: entityType,
    entity_id: entityId,
    from_status: currentStatus,
    to_status: newStatus,
    changed_by: actorId,
    metadata: metadata || {},
  })
  
  // Calculate SLA deadline if applicable
  let slaDeadline: string | undefined
  const slaKey = `${currentStatus}_to_${newStatus}` as keyof typeof SLA_DEFINITIONS.request
  const slaDef = SLA_DEFINITIONS[entityType as keyof typeof SLA_DEFINITIONS]
  
  if (slaDef && slaKey in slaDef) {
    const slaMinutes = slaDef[slaKey as keyof typeof slaDef]
    const deadline = new Date()
    deadline.setMinutes(deadline.getMinutes() + slaMinutes)
    slaDeadline = deadline.toISOString()
    
    // Record SLA tracking
    await supabase.from('sla_tracking').insert({
      entity_type: entityType,
      entity_id: entityId,
      transition_name: slaKey,
      started_at: new Date().toISOString(),
      deadline_at: slaDeadline,
      sla_minutes: slaMinutes,
    })
  }
  
  // Trigger side effects based on transition
  const triggeredActions = await triggerTransitionActions(
    entityType,
    entityId,
    currentStatus,
    newStatus,
    actorId
  )
  
  return {
    success: true,
    newStatus,
    slaDeadline,
    triggeredActions,
  }
}

/**
 * Trigger side effects for state transitions
 */
async function triggerTransitionActions(
  entityType: EntityType,
  entityId: string,
  fromStatus: string,
  toStatus: string,
  actorId: string
): Promise<string[]> {
  const actions: string[] = []
  const supabase = await createClient()
  
  // SVC Lifecycle Actions
  if (entityType === 'svc') {
    if (toStatus === 'paid') {
      // Issue SVC and generate certificate
      actions.push('generate_svc_certificate')
      actions.push('send_payment_confirmation_email')
      
      // Queue for issuance
      await supabase.from('workflow_queue').insert({
        workflow_type: 'svc_issuance',
        entity_type: entityType,
        entity_id: entityId,
        payload: { fromStatus, toStatus },
        priority: 1,
      })
    }
    
    if (toStatus === 'issued') {
      actions.push('generate_google_wallet_pass')
      actions.push('send_svc_issued_email')
      actions.push('create_legal_contract')
    }
    
    if (toStatus === 'active') {
      actions.push('enable_booking_rights')
      actions.push('notify_holder_activation')
    }
    
    if (toStatus === 'suspended') {
      actions.push('disable_booking_rights')
      actions.push('send_suspension_notice')
    }
  }
  
  // Request Lifecycle Actions
  if (entityType === 'request') {
    if (toStatus === 'validating') {
      actions.push('validate_holder_eligibility')
      actions.push('check_week_availability')
    }
    
    if (toStatus === 'offer_sent') {
      actions.push('send_offer_email')
      actions.push('send_offer_whatsapp')
      actions.push('start_offer_expiry_timer')
    }
    
    if (toStatus === 'offer_accepted') {
      actions.push('create_booking_from_request')
      actions.push('send_booking_confirmation')
      actions.push('block_week_inventory')
    }
    
    if (toStatus === 'offer_expired') {
      actions.push('release_tentative_hold')
      actions.push('notify_holder_expiry')
    }
  }
  
  // Booking Lifecycle Actions
  if (entityType === 'booking') {
    if (toStatus === 'confirmed') {
      actions.push('send_confirmation_email')
      actions.push('create_calendar_event')
      actions.push('notify_property_manager')
    }
    
    if (toStatus === 'pre_arrival') {
      actions.push('send_pre_arrival_info')
      actions.push('generate_access_codes')
      actions.push('schedule_housekeeping')
    }
    
    if (toStatus === 'checked_in') {
      actions.push('send_welcome_message')
      actions.push('activate_concierge_support')
    }
    
    if (toStatus === 'checked_out') {
      actions.push('send_review_request')
      actions.push('schedule_cleaning')
      actions.push('generate_stay_report')
    }
    
    if (toStatus === 'completed') {
      actions.push('release_security_deposit')
      actions.push('update_occupancy_stats')
    }
  }
  
  // Incident Lifecycle Actions
  if (entityType === 'incident') {
    if (toStatus === 'triage') {
      actions.push('assign_priority')
      actions.push('notify_support_team')
    }
    
    if (toStatus === 'resolved') {
      actions.push('send_resolution_notification')
      actions.push('request_satisfaction_rating')
    }
  }
  
  // Compliance Lifecycle Actions
  if (entityType === 'compliance') {
    if (toStatus === 'approved') {
      actions.push('update_kyc_status')
      actions.push('enable_full_access')
    }
    
    if (toStatus === 'alert') {
      actions.push('notify_compliance_team')
      actions.push('create_review_task')
    }
    
    if (toStatus === 'blocked') {
      actions.push('disable_account_features')
      actions.push('send_blocked_notice')
      actions.push('notify_legal_team')
    }
  }
  
  // Log triggered actions
  for (const action of actions) {
    await supabase.from('workflow_queue').insert({
      workflow_type: action,
      entity_type: entityType,
      entity_id: entityId,
      payload: { fromStatus, toStatus, actorId },
      priority: 2,
    })
  }
  
  return actions
}

/**
 * Process pending workflow queue items
 */
export async function processWorkflowQueue(limit = 10): Promise<number> {
  const supabase = await createClient()
  
  // Get pending items ordered by priority and created_at
  const { data: items, error } = await supabase
    .from('workflow_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit)
  
  if (error || !items) return 0
  
  let processed = 0
  
  for (const item of items) {
    // Mark as processing
    await supabase
      .from('workflow_queue')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', item.id)
    
    try {
      // Execute workflow action
      await executeWorkflowAction(item.workflow_type, item.entity_type, item.entity_id, item.payload)
      
      // Mark as completed
      await supabase
        .from('workflow_queue')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', item.id)
      
      processed++
    } catch (err) {
      // Mark as failed
      await supabase
        .from('workflow_queue')
        .update({ 
          status: 'failed', 
          error_message: err instanceof Error ? err.message : 'Unknown error',
          retry_count: (item.retry_count || 0) + 1,
        })
        .eq('id', item.id)
    }
  }
  
  return processed
}

/**
 * Execute a specific workflow action
 */
async function executeWorkflowAction(
  actionType: string,
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>
): Promise<void> {
  // Import action handlers dynamically to avoid circular deps
  const { WorkflowActions } = await import('./actions')
  
  const handler = WorkflowActions[actionType as keyof typeof WorkflowActions]
  if (handler) {
    await handler(entityType, entityId, payload)
  }
}

/**
 * Check and alert on SLA breaches
 */
export async function checkSLABreaches(): Promise<number> {
  const supabase = await createClient()
  
  // Find breached SLAs
  const { data: breached, error } = await supabase
    .from('sla_tracking')
    .select('*')
    .is('completed_at', null)
    .is('breached_at', null)
    .lt('deadline_at', new Date().toISOString())
  
  if (error || !breached) return 0
  
  for (const sla of breached) {
    // Mark as breached
    await supabase
      .from('sla_tracking')
      .update({ breached_at: new Date().toISOString() })
      .eq('id', sla.id)
    
    // Create alert
    await supabase.from('system_alerts').insert({
      alert_type: 'sla_breach',
      severity: 'high',
      entity_type: sla.entity_type,
      entity_id: sla.entity_id,
      title: `SLA Breach: ${sla.transition_name}`,
      message: `SLA for ${sla.transition_name} was breached. Deadline was ${sla.deadline_at}`,
      metadata: { sla_id: sla.id, sla_minutes: sla.sla_minutes },
    })
  }
  
  return breached.length
}
