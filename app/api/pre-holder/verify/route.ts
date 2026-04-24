import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requerido' },
        { status: 400 }
      )
    }

    // Retrieve session from Stripe
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Pago no confirmado' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update pre_holder record
    const { data: preHolder, error } = await supabase
      .from('pre_holders')
      .update({
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('stripe_session_id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Calculate early access window (14 days)
    const now = new Date()
    const earlyAccessEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    return NextResponse.json({
      fullName: session.metadata?.fullName,
      email: session.metadata?.email,
      phone: session.metadata?.phone,
      depositAmount: 100,
      discountPercent: 5,
      referralCode: preHolder?.referral_code,
      earlyAccessEnds: earlyAccessEnd.toISOString(),
      status: 'success',
    })
  } catch (error: any) {
    console.error('[v0] Verify deposit error:', error)
    return NextResponse.json(
      { error: error.message || 'Error verificando depósito' },
      { status: 500 }
    )
  }
}
