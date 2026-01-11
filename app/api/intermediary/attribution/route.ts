/**
 * PUBLIC endpoint for creating referral attribution
 * Called when: User clicks referral link or signs up with code
 */

import { type NextRequest, NextResponse } from "next/server"
import { createReferralAttribution } from "@/lib/intermediary/flows"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { referralCode, email, userId } = body

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code required" }, { status: 400 })
    }

    const result = await createReferralAttribution({
      referralCode,
      email,
      userId,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
