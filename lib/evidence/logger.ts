import { createClient } from "@/lib/supabase/server"
import { sha256 } from "@/lib/utils/crypto"

/**
 * NOM-151 Evidence Event Logger
 * Records immutable audit trail events with SHA-256 hashing
 */

export type EvidenceEventType =
  | "consent_accepted"
  | "certificate_activated"
  | "certificate_issued"
  | "reservation_requested"
  | "reservation_offered"
  | "offer_accepted"
  | "offer_rejected"
  | "reservation_confirmed"
  | "reservation_cancelled"
  | "payment_processed"
  | "document_signed"

export type EntityType = "certificate" | "reservation" | "offer" | "consent" | "payment" | "document"

export type ActorRole = "user" | "admin" | "system" | "broker" | "property_owner" | "notary"

export interface LogEvidenceParams {
  eventType: EvidenceEventType
  entityType: EntityType
  entityId: string
  userId: string
  actorRole: ActorRole
  payload: Record<string, any>
  documentVersion?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Canonicalize payload for deterministic hashing
 * Sorts keys alphabetically and removes undefined values
 */
function canonicalizePayload(payload: Record<string, any>): string {
  const sorted = Object.keys(payload)
    .sort()
    .reduce(
      (acc, key) => {
        const value = payload[key]
        if (value !== undefined && value !== null) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, any>,
    )

  return JSON.stringify(sorted)
}

/**
 * Log an evidence event to the database
 * Returns the created evidence event ID
 */
export async function logEvidenceEvent(params: LogEvidenceParams): Promise<string | null> {
  try {
    const supabase = createClient()

    // Canonicalize payload for hashing
    const canonicalPayload = canonicalizePayload(params.payload)

    // Generate SHA-256 hash
    const hash = sha256(canonicalPayload)

    // Insert evidence event
    const { data, error } = await supabase
      .from("evidence_events")
      .insert({
        event_type: params.eventType,
        entity_type: params.entityType,
        entity_id: params.entityId,
        user_id: params.userId,
        actor_role: params.actorRole,
        payload_canonical: params.payload,
        hash_sha256: hash,
        document_version: params.documentVersion,
        occurred_at: new Date().toISOString(),
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
      })
      .select("id")
      .single()

    if (error) {
      console.error("[v0] Evidence logging error:", error)
      return null
    }

    console.log(`[v0] Evidence logged: ${params.eventType} for ${params.entityType}:${params.entityId}`)
    return data.id
  } catch (error) {
    console.error("[v0] Evidence logging exception:", error)
    return null
  }
}

/**
 * Helper to extract IP and User Agent from Next.js request
 */
export function extractRequestMetadata(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"

  const userAgent = request.headers.get("user-agent") || "unknown"

  return { ip, userAgent }
}

/**
 * Verify evidence chain integrity for a specific entity
 */
export async function verifyEvidenceChain(entityId: string, entityType: EntityType) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc("verify_evidence_chain", {
      p_entity_id: entityId,
      p_entity_type: entityType,
    })

    if (error) {
      console.error("[v0] Evidence verification error:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("[v0] Evidence verification exception:", error)
    return null
  }
}
