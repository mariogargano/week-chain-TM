import { NextResponse, NextRequest } from 'next/server';
import { twoFactorAuth } from '@/lib/auth/two-factor';

export async function POST(request: NextRequest) {
  try {
    const { userId, token, method = 'totp' } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Missing userId or token' },
        { status: 400 }
      );
    }

    let isValid = false;

    if (method === 'totp') {
      // Get user's TOTP secret
      const { createServerClient } = await import('@supabase/ssr');
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

      const { data, error } = await supabase
        .from('user_2fa')
        .select('secret_encrypted')
        .eq('user_id', userId)
        .eq('method', 'totp')
        .eq('enabled', true)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: '2FA not enabled for this user' },
          { status: 403 }
        );
      }

      isValid = twoFactorAuth.verifyTOTPToken(data.secret_encrypted, token);
    } else if (method === 'backup') {
      // Verify backup code
      isValid = await twoFactorAuth.verifyBackupCode(userId, token);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
    });
  } catch (error) {
    console.error('Error in 2FA verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
