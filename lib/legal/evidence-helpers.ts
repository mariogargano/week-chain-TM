import { createClient } from "@/lib/supabase/server"
import { logEvidenceEvent } from "./canonicalizeEvent"

/**
 * Helper functions for logging evidence events in WEEK-CHAIN
 */

export async function logCertificateActivation(params: {
  certificateId: string
  userId: string
  certificateNumber: string
  tier: string
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = createClient()

  return await logEvidenceEvent(supabase, {
    event_type: "certificate_activated",
    entity_type: "certificate",
    entity_id: params.certificateId,
    user_id: params.userId,
    actor_role: "member",
    payload: {
      certificate_number: params.certificateNumber,
      tier: params.tier,
      action: "activate",
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  })
}

export async function logReservationRequest(params: {
  reservationId: string
  userId: string
  certificateId: string
  destinationId: string
  checkIn: string
  checkOut: string
  guests: number
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = createClient()

  return await logEvidenceEvent(supabase, {
    event_type: "reservation_requested",
    entity_type: "reservation",
    entity_id: params.reservationId,
    user_id: params.userId,
    actor_role: "member",
    payload: {
      certificate_id: params.certificateId,
      destination_id: params.destinationId,
      check_in: params.checkIn,
      check_out: params.checkOut,
      guests: params.guests,
      status: "pending",
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  })
}

export async function logOfferGeneration(params: {
  offerId: string
  reservationId: string
  adminUserId: string
  price: number
  expiresAt: string
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = createClient()

  return await logEvidenceEvent(supabase, {
    event_type: "offer_generated",
    entity_type: "offer",
    entity_id: params.offerId,
    user_id: params.adminUserId,
    actor_role: "admin",
    payload: {
      reservation_id: params.reservationId,
      price_mxn: params.price,
      expires_at: params.expiresAt,
      status: "pending",
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  })
}

export async function logOfferAcceptance(params: {
  offerId: string
  userId: string
  reservationId: string
  price: number
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = createClient()

  return await logEvidenceEvent(supabase, {
    event_type: "offer_accepted",
    entity_type: "offer",
    entity_id: params.offerId,
    user_id: params.userId,
    actor_role: "member",
    payload: {
      reservation_id: params.reservationId,
      price_mxn: params.price,
      action: "accept",
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  })
}

export async function logConsentAcceptance(params: {
  consentId: string
  userId: string
  documentType: string
  documentVersion: string
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = createClient()

  return await logEvidenceEvent(supabase, {
    event_type: "consent_accepted",
    entity_type: "consent",
    entity_id: params.consentId,
    user_id: params.userId,
    actor_role: "user",
    payload: {
      document_type: params.documentType,
      acceptance_method: "click_wrap",
    },
    document_version: params.documentVersion,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  })
}

export async function logCertificateIssuance(params: {
  certificateId: string
  userId: string
  tier: string
  certificateNumber: string
  purchasePrice: number
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = createClient()

  return await logEvidenceEvent(supabase, {
    event_type: "certificate_issued",
    entity_type: "certificate",
    entity_id: params.certificateId,
    user_id: params.userId,
    actor_role: "system",
    payload: {
      tier: params.tier,
      certificate_number: params.certificateNumber,
      purchase_price_mxn: params.purchasePrice,
      status: "issued",
    },
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  })
}
