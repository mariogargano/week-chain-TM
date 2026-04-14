/**
 * WEEK-CHAIN Workflow Actions
 * Implements all side-effect actions triggered by state transitions
 */

import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

type ActionHandler = (
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>
) => Promise<void>

// ============================================================================
// ACTION HANDLERS
// ============================================================================

export const WorkflowActions: Record<string, ActionHandler> = {
  // --------------------------------------------------------------------------
  // SVC Actions
  // --------------------------------------------------------------------------
  
  async generate_svc_certificate(entityType, entityId, payload) {
    const supabase = await createClient()
    
    // Get certificate data
    const { data: cert } = await supabase
      .from('user_certificates_v2')
      .select('*, users(email, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!cert) return
    
    // Generate unique certificate number
    const certNumber = `SVC-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`
    
    // Generate SHA256 hash for blockchain verification
    const hashData = JSON.stringify({
      id: entityId,
      certNumber,
      userId: cert.user_id,
      propertyId: cert.property_id,
      weekNumber: cert.week_number,
      tier: cert.tier,
      createdAt: new Date().toISOString(),
    })
    const sha256Hash = crypto.createHash('sha256').update(hashData).digest('hex')
    
    // Update certificate with hash and number
    await supabase
      .from('user_certificates_v2')
      .update({
        certificate_number: certNumber,
        sha256_hash: sha256Hash,
        issued_at: new Date().toISOString(),
      })
      .eq('id', entityId)
    
    // Create week_token record
    await supabase.from('week_tokens').upsert({
      certificate_id: entityId,
      token_hash: sha256Hash,
      property_id: cert.property_id,
      week_number: cert.week_number,
      year: new Date().getFullYear(),
      status: 'active',
      created_at: new Date().toISOString(),
    }, { onConflict: 'certificate_id' })
  },
  
  async send_payment_confirmation_email(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: cert } = await supabase
      .from('user_certificates_v2')
      .select('*, users(email, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!cert?.users?.email) return
    
    // Queue email notification
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: cert.users.email,
      template: 'payment_confirmation',
      payload: {
        name: cert.users.full_name,
        certificateId: entityId,
        amount: cert.price_paid,
        currency: cert.currency || 'USD',
      },
      status: 'pending',
    })
  },
  
  async generate_google_wallet_pass(entityType, entityId, payload) {
    const supabase = await createClient()
    
    // Mark certificate for Google Wallet generation
    await supabase
      .from('certificate_visual_state')
      .upsert({
        certificate_id: entityId,
        google_wallet_pending: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'certificate_id' })
  },
  
  async send_svc_issued_email(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: cert } = await supabase
      .from('user_certificates_v2')
      .select('*, users(email, full_name), properties(name, location)')
      .eq('id', entityId)
      .single()
    
    if (!cert?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: cert.users.email,
      template: 'svc_issued',
      payload: {
        name: cert.users.full_name,
        certificateNumber: cert.certificate_number,
        propertyName: cert.properties?.name,
        weekNumber: cert.week_number,
        tier: cert.tier,
      },
      status: 'pending',
    })
  },
  
  async create_legal_contract(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: cert } = await supabase
      .from('user_certificates_v2')
      .select('*, users(*), properties(*)')
      .eq('id', entityId)
      .single()
    
    if (!cert) return
    
    // Create legal contract record
    await supabase.from('legal_contracts').insert({
      certificate_id: entityId,
      user_id: cert.user_id,
      contract_type: 'svc_purchase',
      status: 'pending_signature',
      template_version: '2.0',
      parties: {
        buyer: {
          id: cert.user_id,
          name: cert.users?.full_name,
          email: cert.users?.email,
        },
        seller: {
          name: 'WEEK-CHAIN S.A. de C.V.',
          rfc: 'WCH260101XXX',
        },
      },
      contract_data: {
        certificateId: entityId,
        certificateNumber: cert.certificate_number,
        propertyId: cert.property_id,
        propertyName: cert.properties?.name,
        weekNumber: cert.week_number,
        tier: cert.tier,
        pricePaid: cert.price_paid,
        currency: cert.currency,
      },
      created_at: new Date().toISOString(),
    })
  },
  
  async enable_booking_rights(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: cert } = await supabase
      .from('user_certificates_v2')
      .select('user_id, tier')
      .eq('id', entityId)
      .single()
    
    if (!cert) return
    
    // Update user's booking capabilities based on tier
    const bookingRights = {
      'platinum': { advanceBookingDays: 365, priorityLevel: 1 },
      'gold': { advanceBookingDays: 270, priorityLevel: 2 },
      'silver': { advanceBookingDays: 180, priorityLevel: 3 },
      'bronze': { advanceBookingDays: 90, priorityLevel: 4 },
    }
    
    const rights = bookingRights[cert.tier as keyof typeof bookingRights] || bookingRights.bronze
    
    await supabase
      .from('user_booking_rights')
      .upsert({
        user_id: cert.user_id,
        certificate_id: entityId,
        advance_booking_days: rights.advanceBookingDays,
        priority_level: rights.priorityLevel,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'certificate_id' })
  },
  
  async notify_holder_activation(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: cert } = await supabase
      .from('user_certificates_v2')
      .select('*, users(email, full_name, phone)')
      .eq('id', entityId)
      .single()
    
    if (!cert?.users) return
    
    // Send email
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: cert.users.email,
      template: 'svc_activated',
      payload: {
        name: cert.users.full_name,
        certificateNumber: cert.certificate_number,
      },
      status: 'pending',
    })
    
    // Send WhatsApp if phone available
    if (cert.users.phone) {
      await supabase.from('notification_queue').insert({
        channel: 'whatsapp',
        recipient: cert.users.phone,
        template: 'svc_activated_wa',
        payload: {
          name: cert.users.full_name,
          certificateNumber: cert.certificate_number,
        },
        status: 'pending',
      })
    }
  },
  
  async disable_booking_rights(entityType, entityId, payload) {
    const supabase = await createClient()
    
    await supabase
      .from('user_booking_rights')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('certificate_id', entityId)
  },
  
  async send_suspension_notice(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: cert } = await supabase
      .from('user_certificates_v2')
      .select('*, users(email, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!cert?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: cert.users.email,
      template: 'svc_suspended',
      payload: {
        name: cert.users.full_name,
        certificateNumber: cert.certificate_number,
        reason: payload.reason || 'Contacte a soporte para mas informacion',
      },
      status: 'pending',
    })
  },
  
  // --------------------------------------------------------------------------
  // Request Actions
  // --------------------------------------------------------------------------
  
  async validate_holder_eligibility(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('*, user_certificates_v2(*)')
      .eq('id', entityId)
      .single()
    
    if (!request) return
    
    // Check certificate is active
    const cert = request.user_certificates_v2
    const isEligible = cert?.status === 'active'
    
    await supabase
      .from('reservation_requests')
      .update({
        eligibility_check: isEligible ? 'passed' : 'failed',
        eligibility_checked_at: new Date().toISOString(),
      })
      .eq('id', entityId)
  },
  
  async check_week_availability(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('*')
      .eq('id', entityId)
      .single()
    
    if (!request) return
    
    // Check if the requested weeks are available
    const { data: conflictingBookings } = await supabase
      .from('confirmed_reservations')
      .select('id')
      .eq('property_id', request.property_id)
      .gte('check_in', request.check_in)
      .lte('check_out', request.check_out)
      .in('status', ['confirmed', 'checked_in', 'in_progress'])
    
    const isAvailable = !conflictingBookings || conflictingBookings.length === 0
    
    await supabase
      .from('reservation_requests')
      .update({
        availability_check: isAvailable ? 'available' : 'unavailable',
        availability_checked_at: new Date().toISOString(),
      })
      .eq('id', entityId)
  },
  
  async send_offer_email(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('*, users(email, full_name), properties(name, location)')
      .eq('id', entityId)
      .single()
    
    if (!request?.users?.email) return
    
    const { data: offer } = await supabase
      .from('reservation_offers')
      .select('*')
      .eq('request_id', entityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: request.users.email,
      template: 'booking_offer',
      payload: {
        name: request.users.full_name,
        propertyName: request.properties?.name,
        checkIn: request.check_in,
        checkOut: request.check_out,
        offerId: offer?.id,
        expiresAt: offer?.expires_at,
        offerUrl: `${process.env.NEXT_PUBLIC_APP_URL}/offers/${offer?.id}`,
      },
      status: 'pending',
    })
  },
  
  async send_offer_whatsapp(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('*, users(phone, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!request?.users?.phone) return
    
    await supabase.from('notification_queue').insert({
      channel: 'whatsapp',
      recipient: request.users.phone,
      template: 'booking_offer_wa',
      payload: {
        name: request.users.full_name,
        checkIn: request.check_in,
        checkOut: request.check_out,
      },
      status: 'pending',
    })
  },
  
  async start_offer_expiry_timer(entityType, entityId, payload) {
    const supabase = await createClient()
    
    // Set offer to expire in 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    await supabase
      .from('reservation_offers')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('request_id', entityId)
      .is('expires_at', null)
  },
  
  async create_booking_from_request(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('*, reservation_offers(*)')
      .eq('id', entityId)
      .single()
    
    if (!request) return
    
    const offer = request.reservation_offers?.[0]
    
    // Create confirmed reservation
    await supabase.from('confirmed_reservations').insert({
      request_id: entityId,
      offer_id: offer?.id,
      user_id: request.user_id,
      certificate_id: request.certificate_id,
      property_id: request.property_id,
      check_in: request.check_in,
      check_out: request.check_out,
      guests: request.guests,
      status: 'confirmed',
      total_price: offer?.total_price || 0,
      currency: offer?.currency || 'USD',
      confirmed_at: new Date().toISOString(),
    })
  },
  
  async send_booking_confirmation(entityType, entityId, payload) {
    // Handled by booking lifecycle
  },
  
  async block_week_inventory(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('property_id, check_in, check_out')
      .eq('id', entityId)
      .single()
    
    if (!request) return
    
    // Mark weeks as blocked
    await supabase
      .from('weeks')
      .update({ status: 'reserved' })
      .eq('property_id', request.property_id)
      .gte('start_date', request.check_in)
      .lte('end_date', request.check_out)
  },
  
  async release_tentative_hold(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('property_id, check_in, check_out')
      .eq('id', entityId)
      .single()
    
    if (!request) return
    
    // Release tentative holds
    await supabase
      .from('weeks')
      .update({ status: 'available' })
      .eq('property_id', request.property_id)
      .eq('status', 'tentative')
      .gte('start_date', request.check_in)
      .lte('end_date', request.check_out)
  },
  
  async notify_holder_expiry(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: request } = await supabase
      .from('reservation_requests')
      .select('*, users(email, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!request?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: request.users.email,
      template: 'offer_expired',
      payload: {
        name: request.users.full_name,
        requestId: entityId,
      },
      status: 'pending',
    })
  },
  
  // --------------------------------------------------------------------------
  // Booking Actions
  // --------------------------------------------------------------------------
  
  async send_confirmation_email(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('*, users(email, full_name), properties(name, address, location)')
      .eq('id', entityId)
      .single()
    
    if (!booking?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: booking.users.email,
      template: 'booking_confirmed',
      payload: {
        name: booking.users.full_name,
        propertyName: booking.properties?.name,
        propertyAddress: booking.properties?.address,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        guests: booking.guests,
        confirmationCode: booking.confirmation_code,
      },
      status: 'pending',
    })
  },
  
  async create_calendar_event(entityType, entityId, payload) {
    // Integration with Google Calendar / iCal would go here
    const supabase = await createClient()
    
    await supabase
      .from('confirmed_reservations')
      .update({ calendar_event_created: true })
      .eq('id', entityId)
  },
  
  async notify_property_manager(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('*, properties(owner_id, users(email, full_name))')
      .eq('id', entityId)
      .single()
    
    const ownerEmail = booking?.properties?.users?.email
    if (!ownerEmail) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: ownerEmail,
      template: 'new_booking_owner',
      payload: {
        name: booking?.properties?.users?.full_name,
        checkIn: booking?.check_in,
        checkOut: booking?.check_out,
        guests: booking?.guests,
      },
      status: 'pending',
    })
  },
  
  async send_pre_arrival_info(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('*, users(email, full_name), properties(name, address, check_in_instructions)')
      .eq('id', entityId)
      .single()
    
    if (!booking?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: booking.users.email,
      template: 'pre_arrival',
      payload: {
        name: booking.users.full_name,
        propertyName: booking.properties?.name,
        propertyAddress: booking.properties?.address,
        checkIn: booking.check_in,
        checkInInstructions: booking.properties?.check_in_instructions,
      },
      status: 'pending',
    })
  },
  
  async generate_access_codes(entityType, entityId, payload) {
    const supabase = await createClient()
    
    // Generate unique access code
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    await supabase
      .from('confirmed_reservations')
      .update({ 
        access_code: accessCode,
        access_code_generated_at: new Date().toISOString(),
      })
      .eq('id', entityId)
  },
  
  async schedule_housekeeping(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('property_id, check_in, check_out')
      .eq('id', entityId)
      .single()
    
    if (!booking) return
    
    // Create housekeeping tasks
    await supabase.from('housekeeping_tasks').insert([
      {
        booking_id: entityId,
        property_id: booking.property_id,
        task_type: 'pre_arrival_clean',
        scheduled_date: booking.check_in,
        status: 'pending',
      },
      {
        booking_id: entityId,
        property_id: booking.property_id,
        task_type: 'checkout_clean',
        scheduled_date: booking.check_out,
        status: 'pending',
      },
    ])
  },
  
  async send_welcome_message(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('*, users(email, phone, full_name), properties(name)')
      .eq('id', entityId)
      .single()
    
    if (!booking?.users) return
    
    // Send welcome email
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: booking.users.email,
      template: 'welcome_checkin',
      payload: {
        name: booking.users.full_name,
        propertyName: booking.properties?.name,
      },
      status: 'pending',
    })
    
    // Send WhatsApp if available
    if (booking.users.phone) {
      await supabase.from('notification_queue').insert({
        channel: 'whatsapp',
        recipient: booking.users.phone,
        template: 'welcome_checkin_wa',
        payload: {
          name: booking.users.full_name,
        },
        status: 'pending',
      })
    }
  },
  
  async activate_concierge_support(entityType, entityId, payload) {
    const supabase = await createClient()
    
    await supabase
      .from('confirmed_reservations')
      .update({ concierge_active: true })
      .eq('id', entityId)
  },
  
  async send_review_request(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('*, users(email, full_name), properties(name)')
      .eq('id', entityId)
      .single()
    
    if (!booking?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: booking.users.email,
      template: 'review_request',
      payload: {
        name: booking.users.full_name,
        propertyName: booking.properties?.name,
        reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/review/${entityId}`,
      },
      status: 'pending',
    })
  },
  
  async schedule_cleaning(entityType, entityId, payload) {
    // Already handled by schedule_housekeeping
  },
  
  async generate_stay_report(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('*')
      .eq('id', entityId)
      .single()
    
    if (!booking) return
    
    // Calculate stay metrics
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    await supabase.from('stay_reports').insert({
      booking_id: entityId,
      property_id: booking.property_id,
      user_id: booking.user_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      nights,
      guests: booking.guests,
      total_revenue: booking.total_price,
      currency: booking.currency,
      created_at: new Date().toISOString(),
    })
  },
  
  async release_security_deposit(entityType, entityId, payload) {
    const supabase = await createClient()
    
    await supabase
      .from('confirmed_reservations')
      .update({ 
        deposit_released: true,
        deposit_released_at: new Date().toISOString(),
      })
      .eq('id', entityId)
  },
  
  async update_occupancy_stats(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: booking } = await supabase
      .from('confirmed_reservations')
      .select('property_id, check_in, check_out')
      .eq('id', entityId)
      .single()
    
    if (!booking) return
    
    const checkIn = new Date(booking.check_in)
    const year = checkIn.getFullYear()
    const month = checkIn.getMonth() + 1
    
    // Update or create occupancy record
    await supabase.rpc('increment_occupancy_stats', {
      p_property_id: booking.property_id,
      p_year: year,
      p_month: month,
    })
  },
  
  // --------------------------------------------------------------------------
  // Incident Actions
  // --------------------------------------------------------------------------
  
  async assign_priority(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: incident } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', entityId)
      .single()
    
    if (!incident) return
    
    // Auto-assign priority based on keywords and context
    let priority = 'medium'
    const description = (incident.description || '').toLowerCase()
    
    if (description.includes('emergencia') || description.includes('urgente') || description.includes('seguridad')) {
      priority = 'critical'
    } else if (description.includes('no funciona') || description.includes('roto')) {
      priority = 'high'
    } else if (description.includes('pregunta') || description.includes('consulta')) {
      priority = 'low'
    }
    
    await supabase
      .from('incidents')
      .update({ priority, triaged_at: new Date().toISOString() })
      .eq('id', entityId)
  },
  
  async notify_support_team(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: incident } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', entityId)
      .single()
    
    if (!incident) return
    
    // Get support team emails
    const { data: supportTeam } = await supabase
      .from('users')
      .select('email')
      .in('role', ['service', 'operations', 'admin'])
    
    if (!supportTeam) return
    
    for (const member of supportTeam) {
      await supabase.from('notification_queue').insert({
        channel: 'email',
        recipient: member.email,
        template: 'new_incident',
        payload: {
          incidentId: entityId,
          priority: incident.priority,
          subject: incident.subject,
        },
        status: 'pending',
      })
    }
  },
  
  async send_resolution_notification(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: incident } = await supabase
      .from('incidents')
      .select('*, users(email, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!incident?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: incident.users.email,
      template: 'incident_resolved',
      payload: {
        name: incident.users.full_name,
        incidentId: entityId,
        subject: incident.subject,
        resolution: incident.resolution_notes,
      },
      status: 'pending',
    })
  },
  
  async request_satisfaction_rating(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: incident } = await supabase
      .from('incidents')
      .select('*, users(email, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!incident?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: incident.users.email,
      template: 'satisfaction_survey',
      payload: {
        name: incident.users.full_name,
        incidentId: entityId,
        surveyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/survey/incident/${entityId}`,
      },
      status: 'pending',
    })
  },
  
  // --------------------------------------------------------------------------
  // Compliance Actions
  // --------------------------------------------------------------------------
  
  async update_kyc_status(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: record } = await supabase
      .from('compliance_records')
      .select('user_id')
      .eq('id', entityId)
      .single()
    
    if (!record) return
    
    await supabase
      .from('users')
      .update({ 
        kyc_status: 'verified',
        kyc_verified_at: new Date().toISOString(),
      })
      .eq('id', record.user_id)
  },
  
  async enable_full_access(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: record } = await supabase
      .from('compliance_records')
      .select('user_id')
      .eq('id', entityId)
      .single()
    
    if (!record) return
    
    await supabase
      .from('users')
      .update({ 
        access_level: 'full',
        restrictions: null,
      })
      .eq('id', record.user_id)
  },
  
  async notify_compliance_team(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: record } = await supabase
      .from('compliance_records')
      .select('*, users(full_name, email)')
      .eq('id', entityId)
      .single()
    
    // Get compliance team
    const { data: complianceTeam } = await supabase
      .from('users')
      .select('email')
      .in('role', ['compliance', 'legal', 'admin'])
    
    if (!complianceTeam) return
    
    for (const member of complianceTeam) {
      await supabase.from('notification_queue').insert({
        channel: 'email',
        recipient: member.email,
        template: 'compliance_alert',
        payload: {
          recordId: entityId,
          userName: record?.users?.full_name,
          userEmail: record?.users?.email,
          alertType: record?.alert_type,
          details: record?.alert_details,
        },
        status: 'pending',
      })
    }
  },
  
  async create_review_task(entityType, entityId, payload) {
    const supabase = await createClient()
    
    await supabase.from('tasks').insert({
      task_type: 'compliance_review',
      entity_type: 'compliance_records',
      entity_id: entityId,
      title: 'Review compliance alert',
      priority: 'high',
      status: 'pending',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    })
  },
  
  async disable_account_features(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: record } = await supabase
      .from('compliance_records')
      .select('user_id')
      .eq('id', entityId)
      .single()
    
    if (!record) return
    
    await supabase
      .from('users')
      .update({ 
        access_level: 'restricted',
        restrictions: ['booking', 'transfer', 'withdraw'],
      })
      .eq('id', record.user_id)
    
    // Disable all booking rights
    await supabase
      .from('user_booking_rights')
      .update({ is_active: false })
      .eq('user_id', record.user_id)
  },
  
  async send_blocked_notice(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: record } = await supabase
      .from('compliance_records')
      .select('*, users(email, full_name)')
      .eq('id', entityId)
      .single()
    
    if (!record?.users?.email) return
    
    await supabase.from('notification_queue').insert({
      channel: 'email',
      recipient: record.users.email,
      template: 'account_blocked',
      payload: {
        name: record.users.full_name,
        reason: 'Verificacion de compliance requerida',
        supportEmail: 'compliance@week-chain.com',
      },
      status: 'pending',
    })
  },
  
  async notify_legal_team(entityType, entityId, payload) {
    const supabase = await createClient()
    
    const { data: legalTeam } = await supabase
      .from('users')
      .select('email')
      .in('role', ['legal', 'admin'])
    
    if (!legalTeam) return
    
    for (const member of legalTeam) {
      await supabase.from('notification_queue').insert({
        channel: 'email',
        recipient: member.email,
        template: 'legal_alert',
        payload: {
          complianceRecordId: entityId,
          action: 'Account blocked - legal review required',
        },
        status: 'pending',
      })
    }
  },
}
