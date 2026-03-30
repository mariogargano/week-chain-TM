import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

const DEPOSIT_AMOUNT_USD = 100 // Fixed deposit in USD
const DEPOSIT_AMOUNT_CENTS = DEPOSIT_AMOUNT_USD * 100 // Convert to cents for Stripe

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, depositAmount } = await request.json()

    // Validate input
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Nombre, email y teléfono son requeridos' },
        { status: 400 }
      )
    }

    if (depositAmount !== DEPOSIT_AMOUNT_USD) {
      return NextResponse.json(
        { error: `El depósito debe ser exactamente $${DEPOSIT_AMOUNT_USD} USD` },
        { status: 400 }
      )
    }

    // Create Stripe checkout session for deposit
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pre-Holder Deposit (100% Refundable)',
              description: `$${DEPOSIT_AMOUNT_USD} USD refundable deposit. 5% discount + $${DEPOSIT_AMOUNT_USD} credit on certificate purchase.`,
            },
            unit_amount: DEPOSIT_AMOUNT_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pre-holder/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pre-holder`,
      customer_email: email,
      metadata: {
        fullName,
        email,
        phone,
        depositType: 'pre-holder',
        timestamp: new Date().toISOString(),
      },
    })

    // Store pre-holder metadata in Supabase (optional - for admin tracking)
    const supabase = await createClient()
    await supabase.from('pre_holders').insert({
      email,
      full_name: fullName,
      phone,
      stripe_session_id: session.id,
      deposit_amount_usd: DEPOSIT_AMOUNT_USD,
      payment_status: 'pending',
      discount_percent: 5.00,
      status: 'pending',
    }).select().single()

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('[v0] Pre-holder deposit error:', error)
    return NextResponse.json(
      { error: error.message || 'Error processing deposit' },
      { status: 500 }
    )
  }
}
