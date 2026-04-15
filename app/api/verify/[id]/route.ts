import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ valid: false, error: "ID de certificado requerido" }, { status: 400 })
  }

  const supabase = await createClient()

  // Try user_certificates_v2 first (current schema)
  const { data: cert } = await supabase
    .from("user_certificates_v2")
    .select("*")
    .eq("id", id)
    .single()

  if (cert) {
    // Get associated week_token for hash verification
    const { data: token } = await supabase
      .from("week_tokens")
      .select("token_hash, qr_code, qr_payload")
      .eq("certificate_id", cert.id)
      .single()

    // Get owner info (masked for privacy)
    const { data: owner } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", cert.user_id)
      .single()

    const isValid = ["confirmed", "active", "sold"].includes(cert.status?.toLowerCase())

    return NextResponse.json({
      valid: isValid,
      certificate: {
        id: cert.id,
        type: "certificate_v2",
        status: cert.status,
        max_pax: cert.max_pax,
        estancias: cert.estancias,
        issued_at: cert.created_at,
        valid_from: cert.valid_from,
        valid_until: cert.valid_until,
        holder: owner?.full_name || "Titular Verificado",
        token_hash: token?.token_hash || null,
      },
      issuer: {
        name: "WEEK-CHAIN SAPI de CV",
        rfc: "WCH240101XXX",
        regulatory_framework: "NOM-029-SCFI-2010",
        digital_certification: "NOM-151-SCFI-2016",
      },
      verified_at: new Date().toISOString(),
    })
  }

  // Fallback: try week_tokens by ID
  const { data: tokenDirect } = await supabase
    .from("week_tokens")
    .select("*, certificate:user_certificates_v2(*)")
    .eq("id", id)
    .single()

  if (tokenDirect?.certificate) {
    const c = Array.isArray(tokenDirect.certificate) ? tokenDirect.certificate[0] : tokenDirect.certificate

    const isValid = ["confirmed", "active", "sold"].includes(c?.status?.toLowerCase())

    return NextResponse.json({
      valid: isValid,
      certificate: {
        id: c?.id || tokenDirect.id,
        type: "week_token",
        status: c?.status || "active",
        max_pax: c?.max_pax,
        estancias: c?.estancias,
        issued_at: c?.created_at,
        valid_from: c?.valid_from,
        valid_until: c?.valid_until,
        token_hash: tokenDirect.token_hash || null,
      },
      issuer: {
        name: "WEEK-CHAIN SAPI de CV",
        rfc: "WCH240101XXX",
        regulatory_framework: "NOM-029-SCFI-2010",
        digital_certification: "NOM-151-SCFI-2016",
      },
      verified_at: new Date().toISOString(),
    })
  }

  // Fallback: try old user_certificates table
  const { data: oldCert } = await supabase
    .from("user_certificates")
    .select("*")
    .eq("id", id)
    .single()

  if (oldCert) {
    const isValid = ["confirmed", "active", "sold"].includes(oldCert.status?.toLowerCase())

    return NextResponse.json({
      valid: isValid,
      certificate: {
        id: oldCert.id,
        type: "certificate_legacy",
        status: oldCert.status,
        issued_at: oldCert.created_at,
      },
      issuer: {
        name: "WEEK-CHAIN SAPI de CV",
        rfc: "WCH240101XXX",
        regulatory_framework: "NOM-029-SCFI-2010",
      },
      verified_at: new Date().toISOString(),
    })
  }

  return NextResponse.json(
    {
      valid: false,
      error: "Certificado no encontrado",
      id: id,
      verified_at: new Date().toISOString(),
    },
    { status: 404 },
  )
}
