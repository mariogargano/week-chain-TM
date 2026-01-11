import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ valid: false, error: "ID de certificado requerido" }, { status: 400 })
  }

  const supabase = await createClient()

  // Try to find by week ID
  const { data: week, error } = await supabase
    .from("weeks")
    .select(`
      id,
      status,
      created_at,
      week_number,
      season,
      owner_wallet,
      property:properties(name, location)
    `)
    .eq("id", id)
    .single()

  if (error || !week) {
    // Try to find by reservation ID
    const { data: reservation } = await supabase
      .from("reservations")
      .select(`
        id,
        status,
        created_at,
        usdc_equivalent,
        user_wallet
      `)
      .eq("id", id)
      .single()

    if (!reservation) {
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

    const isValid = ["confirmed", "active", "sold"].includes(reservation.status?.toLowerCase())

    return NextResponse.json({
      valid: isValid,
      certificate: {
        id: reservation.id,
        type: "reservation",
        status: reservation.status,
        issued_at: reservation.created_at,
        value_usd: reservation.usdc_equivalent,
        holder: reservation.user_wallet
          ? `${reservation.user_wallet.slice(0, 6)}...${reservation.user_wallet.slice(-4)}`
          : null,
      },
      issuer: {
        name: "WEEK-CHAIN SAPI de CV",
        rfc: "WCH240101XXX",
        regulatory_framework: "NOM-029-SCFI-2010",
      },
      verified_at: new Date().toISOString(),
    })
  }

  const isValid = ["confirmed", "active", "sold", "available"].includes(week.status?.toLowerCase())
  const propertyData = week.property

  return NextResponse.json({
    valid: isValid,
    certificate: {
      id: week.id,
      type: "week",
      status: week.status,
      week_number: week.week_number,
      season: week.season,
      issued_at: week.created_at,
      property: {
        name: Array.isArray(propertyData) ? propertyData[0]?.name : propertyData?.name,
        location: Array.isArray(propertyData) ? propertyData[0]?.location : propertyData?.location,
      },
      holder: week.owner_wallet ? `${week.owner_wallet.slice(0, 6)}...${week.owner_wallet.slice(-4)}` : null,
    },
    issuer: {
      name: "WEEK-CHAIN SAPI de CV",
      rfc: "WCH240101XXX",
      regulatory_framework: "NOM-029-SCFI-2010",
    },
    verified_at: new Date().toISOString(),
  })
}
