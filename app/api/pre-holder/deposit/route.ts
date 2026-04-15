import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

const DEPOSIT_AMOUNT_USD = 100
const DEPOSIT_AMOUNT_CENTS = DEPOSIT_AMOUNT_USD * 100

function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, depositAmount } = await request.json()

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Nombre, email y telefono son requeridos' },
        { status: 400 }
      )
    }

    if (depositAmount !== DEPOSIT_AMOUNT_USD) {
      return NextResponse.json(
        { error: `El deposito debe ser exactamente $${DEPOSIT_AMOUNT_USD} USD` },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl(request)
    
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'WEEK-CHAIN Pre-Holder Deposit',
              description: 'Deposito reembolsable $100 USD. 5% descuento + credito de $100 en tu compra.',
            },
            unit_amount: DEPOSIT_AMOUNT_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/pre-holder/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pre-holder`,
      customer_email: email,
      metadata: {
        fullName,
        email,
        phone,
        depositType: 'pre-holder',
        timestamp: new Date().toISOString(),
      },
    })

    // Store in Supabase (non-blocking)
    try {
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
      })
    } catch (dbError) {
      console.error('[v0] Pre-holder Supabase error:', dbError)
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('[v0] Pre-holder deposit error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el deposito' },
      { status: 500 }
    )
  }
}
