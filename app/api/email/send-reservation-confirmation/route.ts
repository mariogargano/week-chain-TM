import { type NextRequest, NextResponse } from "next/server"
import { resend, FROM_EMAIL } from "@/lib/email/resend-client"
import { ReservationConfirmation } from "@/lib/email/templates/reservation-confirmation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, propertyName, checkIn, checkOut, guests, reservationId } = body

    if (!email || !propertyName || !checkIn || !checkOut || !reservationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reservation Confirmed - ${propertyName}`,
      react: ReservationConfirmation({
        userName: userName || "there",
        propertyName,
        checkIn,
        checkOut,
        guests: guests || 1,
        reservationId,
      }),
    })

    if (error) {
      console.error("[v0] Error sending reservation confirmation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in send-reservation-confirmation route:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
