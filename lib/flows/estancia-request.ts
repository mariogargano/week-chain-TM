import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/config/logger"

/**
 * Create an estancia REQUEST (atomic lock with 30-day minimum)
 * Returns: { ok: true, estanciaId, status: "lock_pending" }
 */
export async function createEstanciaRequest({
  userId,
  weekNumber,
  isoYear,
  destinationId,
  propertyId,
  huespedes,
}: {
  userId: string
  weekNumber: number
  isoYear: number
  destinationId: string
  propertyId: string
  huespedes: number
}) {
  const supabase = await createClient()

  // 1. Validate certificate PAX >= requested huespedes
  const { data: cert } = await supabase
    .from("user_certificates_v2")
    .select("max_pax")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  if (!cert || cert.max_pax < huespedes) {
    throw new Error("Certificate PAX insufficient for requested guests")
  }

  // 2. Try atomic lock on availability
  const { data: lock, error: lockError } = await supabase
    .from("property_availability")
    .update({
      locked_by: userId,
      locked_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min lock
    })
    .eq("property_id", propertyId)
    .eq("week_number", weekNumber)
    .eq("iso_year", isoYear)
    .eq("locked_by", null)
    .select()
    .single()

  if (lockError || !lock) {
    logger.warn("[estancia-request] Lock failed (slot taken)", {
      userId,
      propertyId,
      week: `${isoYear}W${weekNumber}`,
    })
    throw new Error("Week not available - someone else just booked it")
  }

  // 3. Create estancia in DB (in "lock_pending" state)
  const { data: estancia, error: estError } = await supabase
    .from("estancias")
    .insert({
      user_id: userId,
      property_id: propertyId,
      destination_id: destinationId,
      check_in: new Date(`${isoYear}-W${String(weekNumber).padStart(2, "0")}`).toISOString(),
      check_out: new Date(
        new Date(`${isoYear}-W${String(weekNumber).padStart(2, "0")}`).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      num_guests: huespedes,
      status: "confirmed", // Phase 4 = instant confirm, no manual OFFER
      reservation_number: `RES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    })
    .select()
    .single()

  if (estError) {
    logger.error("[estancia-request] Insert error", estError)
    throw new Error("Failed to create reservation")
  }

  logger.info("[estancia-request] Estancia created", {
    estanciaId: estancia?.id,
    userId,
    week: `${isoYear}W${weekNumber}`,
  })

  return { ok: true, estancia }
}
