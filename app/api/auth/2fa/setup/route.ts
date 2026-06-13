import { NextResponse, NextRequest } from 'next/server';
import { twoFactorAuth } from '@/lib/auth/two-factor';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { userId, method = 'totp' } = await request.json();

    if (!userId || !['totp', 'sms', 'email'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid userId or method' },
        { status: 400 }
      );
    }

    // Get user email
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (method === 'totp') {
      const { secret, qrCode, backupCodes } = await twoFactorAuth.generateTOTPSecret(
        userId,
        userData.email
      );

      return NextResponse.json({
        method: 'totp',
        secret,
        qrCode,
        backupCodes,
        message: 'Scan QR code with authenticator app',
      });
    }

    // SMS and Email methods would go here
    return NextResponse.json(
      { error: 'Method not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in 2FA setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
