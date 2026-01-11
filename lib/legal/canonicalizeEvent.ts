import crypto from "crypto"

/**
 * NOM-151 Compliant Event Canonicalization
 *
 * Converts event payloads to deterministic canonical form for SHA-256 hashing.
 * Ensures identical events produce identical hashes for legal evidence.
 */

export interface EvidenceEvent {
  event_type: string
  entity_type: string
  entity_id: string
  user_id?: string
  actor_role?: string
  payload: Record<string, any>
  document_version?: string
  ip_address?: string
  user_agent?: string
}

export interface CanonicalizedEvent {
  canonical: Record<string, any>
  hash: string
  timestamp: string
}

/**
 * Recursively sorts object keys alphabetically for deterministic JSON output
 */
function sortKeysRecursive(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sortKeysRecursive)
  }

  const sorted: Record<string, any> = {}
  const keys = Object.keys(obj).sort()

  for (const key of keys) {
    sorted[key] = sortKeysRecursive(obj[key])
  }

  return sorted
}

/**
 * Normalizes values for consistent hashing
 */
function normalizeValue(value: any): any {
  // Convert dates to ISO strings
  if (value instanceof Date) {
    return value.toISOString()
  }

  // Convert numbers to strings to avoid floating point issues
  if (typeof value === "number") {
    return value.toString()
  }

  // Convert booleans to strings
  if (typeof value === "boolean") {
    return value.toString()
  }

  // Remove undefined values
  if (value === undefined) {
    return null
  }

  return value
}

/**
 * Canonicalizes event payload for deterministic hashing
 */
export function canonicalizeEvent(event: EvidenceEvent): CanonicalizedEvent {
  const timestamp = new Date().toISOString()

  // Create canonical payload
  const canonical = {
    event_type: event.event_type,
    entity_type: event.entity_type,
    entity_id: event.entity_id,
    user_id: event.user_id || null,
    actor_role: event.actor_role || null,
    timestamp,
    payload: sortKeysRecursive(
      Object.fromEntries(
        Object.entries(event.payload)
          .map(([key, value]) => [key, normalizeValue(value)])
          .filter(([_, value]) => value !== null),
      ),
    ),
  }

  // Add optional fields if present
  if (event.document_version) {
    canonical["document_version"] = event.document_version
  }

  // Generate deterministic JSON string (no whitespace)
  const canonicalJson = JSON.stringify(canonical)

  // Generate SHA-256 hash
  const hash = crypto.createHash("sha256").update(canonicalJson, "utf8").digest("hex")

  return {
    canonical,
    hash,
    timestamp,
  }
}

/**
 * Verifies event integrity by comparing hash
 */
export function verifyEventIntegrity(storedPayload: Record<string, any>, storedHash: string): boolean {
  try {
    const canonicalJson = JSON.stringify(storedPayload)
    const computedHash = crypto.createHash("sha256").update(canonicalJson, "utf8").digest("hex")

    return computedHash === storedHash
  } catch (error) {
    console.error("[Evidence] Hash verification failed:", error)
    return false
  }
}

/**
 * Logs evidence event to database
 */
export async function logEvidenceEvent(
  supabase: any,
  event: EvidenceEvent,
): Promise<{ id: string; hash: string } | null> {
  try {
    const { canonical, hash, timestamp } = canonicalizeEvent(event)

    const { data, error } = await supabase.rpc("log_evidence_event", {
      p_event_type: event.event_type,
      p_entity_type: event.entity_type,
      p_entity_id: event.entity_id,
      p_user_id: event.user_id || null,
      p_actor_role: event.actor_role || null,
      p_payload_canonical: canonical,
      p_hash_sha256: hash,
      p_document_version: event.document_version || null,
      p_ip_address: event.ip_address || null,
      p_user_agent: event.user_agent || null,
    })

    if (error) {
      console.error("[Evidence] Failed to log event:", error)
      return null
    }

    return { id: data, hash }
  } catch (error) {
    console.error("[Evidence] Exception logging event:", error)
    return null
  }
}
