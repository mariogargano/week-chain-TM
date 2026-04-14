import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { fraudDetection } from '@/lib/security/fraud-detection';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // setAll called from Server Component
            }
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get additional context from request
    const { ip_address, country, device_fingerprint } = await request.json()

    // Assess fraud risk
    const assessment = await fraudDetection.assessFraudRisk(user.id, {
      ip_address: ip_address || request.headers.get('x-forwarded-for') || 'unknown',
      country: country || 'unknown',
      device_fingerprint
    })

    // If risk is critical or high, optionally block or challenge
    if (assessment.risk_level === 'critical') {
      return NextResponse.json({
        ...assessment,
        action_required: true,
        message: 'Your account has been flagged for suspicious activity. Please verify your identity.'
      }, { status: 403 })
    }

    if (assessment.risk_level === 'high') {
      return NextResponse.json({
        ...assessment,
        action_required: true,
        message: 'Additional verification required'
      }, { status: 202 })
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('[Fraud Detection API] Error:', error)
    return NextResponse.json(
      { error: 'Fraud detection failed' },
      { status: 500 }
    )
  }
}
