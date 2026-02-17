import { createClient } from "@/lib/supabase/server"

/**
 * STEP 3 - ANNUAL RESET ENFORCEMENT
 * Reset all certificates' remaining_weeks_this_year on their anniversary
 */
export async function resetAnnualWeeks() {
  const supabase = await createClient()

  console.log("[v0] Running annual weeks reset...")

  // Find all active certificates where year_start_date anniversary has passed
  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const { data: certificates, error } = await supabase
    .from("user_certificates")
    .select("id, weeks_per_year, year_start_date")
    .eq("status", "active")
    .lte("year_start_date", oneYearAgo.toISOString())

  if (error || !certificates || certificates.length === 0) {
    console.log("[v0] No certificates to reset")
    return
  }

  console.log(`[v0] Resetting ${certificates.length} certificates`)

  // Reset each certificate
  for (const cert of certificates) {
    const newYearStartDate = new Date(cert.year_start_date)
    newYearStartDate.setFullYear(newYearStartDate.getFullYear() + 1)

    await supabase
      .from("user_certificates")
      .update({
        remaining_weeks_this_year: cert.weeks_per_year,
        year_start_date: newYearStartDate.toISOString(),
      })
      .eq("id", cert.id)
  }

  console.log("[v0] Annual reset complete")
}

/**
 * STEP 3 - 15-YEAR EXPIRATION ENFORCEMENT
 * Mark expired certificates as inactive
 */
export async function enforceExpirations() {
  const supabase = await createClient()

  console.log("[v0] Checking for expired certificates...")

  const today = new Date().toISOString()

  const { data, error } = await supabase
    .from("user_certificates")
    .update({ status: "expired" })
    .eq("status", "active")
    .lte("end_date", today)
    .select()

  if (error) {
    console.error("[v0] Error enforcing expirations:", error)
    return
  }

  if (data && data.length > 0) {
    console.log(`[v0] Expired ${data.length} certificates`)
  } else {
    console.log("[v0] No certificates to expire")
  }
}

/**
 * Check if certificate can make reservations (not expired, has weeks left)
 */
export async function canCertificateRequestReservation(certificateId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const supabase = await createClient()

  const { data: cert, error } = await supabase
    .from("user_certificates")
    .select("status, end_date, remaining_weeks_this_year")
    .eq("id", certificateId)
    .single()

  if (error || !cert) {
    return { allowed: false, reason: "Certificate not found" }
  }

  if (cert.status === "expired") {
    return { allowed: false, reason: "Certificate has expired" }
  }

  if (cert.status !== "active") {
    return { allowed: false, reason: "Certificate is not active" }
  }

  if (new Date(cert.end_date) < new Date()) {
    return { allowed: false, reason: "Certificate validity period has ended" }
  }

  if (cert.remaining_weeks_this_year <= 0) {
    return { allowed: false, reason: "No weeks remaining this year" }
  }

  return { allowed: true }
}
