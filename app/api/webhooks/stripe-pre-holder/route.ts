import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_PRE_HOLDER!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const supabase = await createClient()

      // Update pre_holder status to completed
      const { error } = await supabase
        .from('pre_holders')
        .update({
          status: 'completed',
          stripe_payment_id: session.payment_intent as string,
          completed_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)

      if (error) {
        console.error('Error updating pre-holder:', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
      }

      // TODO: Send email confirmation
      // TODO: Create holder account
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
