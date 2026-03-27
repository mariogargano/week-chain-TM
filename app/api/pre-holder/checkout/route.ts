import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const TIER_PRODUCTS = {
  'holder-bronze': { name: 'Bronze Pre-Holder', price: 9900 },
  'holder-silver': { name: 'Silver Pre-Holder', price: 29900 },
  'holder-gold': { name: 'Gold Pre-Holder', price: 79900 },
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, tier, referralCode } = await req.json()

    if (!email || !name || !phone || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const tierInfo = TIER_PRODUCTS[tier as keyof typeof TIER_PRODUCTS]
    if (!tierInfo) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierInfo.name,
              description: 'WEEK-CHAIN Pre-Holder Access',
            },
            unit_amount: tierInfo.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pre-holder/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pre-holder`,
      customer_email: email,
      metadata: {
        tier,
        referral_code: referralCode || 'none',
      },
    })

    // Store in pre_holders table
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('pre_holders')
      .insert({
        email,
        name,
        phone,
        tier,
        stripe_session_id: session.id,
        referral_code: referralCode || null,
        status: 'pending',
      })
      .select()

    if (error) {
      console.error('Error storing pre-holder:', error)
      return NextResponse.json(
        { error: 'Error storing registration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: session.url,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout error' },
      { status: 500 }
    )
  }
}
