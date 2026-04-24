import { NextResponse } from "next/server"
import { isTierAvailable } from "@/lib/capacity-engine/engine"
import type { CertificateTier } from "@/lib/capacity-engine/types"

export async function POST(req: Request) {
  try {
    const { tier } = await req.json()

    if (!tier || !["Silver", "Gold", "Platinum", "Signature"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    const isAvailable = await isTierAvailable(tier as CertificateTier)

    return NextResponse.json({
      available: isAvailable,
      tier,
      message: isAvailable
        ? "Certificate tier is available for purchase"
        : "This tier is currently unavailable. Join the waitlist to be notified when it becomes available.",
    })
  } catch (error) {
    console.error("[v0] Error checking availability:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
