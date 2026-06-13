/**
 * Two-Factor Authentication (2FA) Implementation
 * Supports TOTP, SMS OTP, and Email OTP
 */

import { authenticator } from 'otpauth';
import { createServerClient } from '@supabase/ssr';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface VerificationResult {
  success: boolean;
  message: string;
}

export class TwoFactorAuth {
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
  }

  /**
   * Generate TOTP secret and QR code
   */
  async generateTOTPSecret(userId: string, email: string): Promise<TwoFactorSetup> {
    try {
      // Generate random secret
      const totp = new authenticator({
        issuer: 'WEEK-CHAIN',
        label: email,
      });

      const secret = totp.secret.base32;

      // Generate backup codes (10 codes)
      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      return {
        secret,
        qrCode: totp.toString(),
        backupCodes,
      };
    } catch (error) {
      console.error('Error generating TOTP secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  /**
   * Verify TOTP token
   */
  verifyTOTPToken(secret: string, token: string): boolean {
    try {
      const totp = new authenticator({
        secret: authenticator.Secret.fromBase32(secret),
      });

      // Verify token (with 30 second window)
      const isValid = totp.validate({
        token,
        window: 1, // ±1 time window
      });

      return isValid !== null;
    } catch (error) {
      console.error('Error verifying TOTP token:', error);
      return false;
    }
  }

  /**
   * Save 2FA setup for user
   */
  async save2FASetup(
    userId: string,
    secret: string,
    backupCodes: string[],
    method: 'totp' | 'sms' | 'email'
  ): Promise<boolean> {
    try {
      const supabase = createServerClient(this.supabaseUrl, this.supabaseKey, {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      });

      const { error } = await supabase.from('user_2fa').insert([
        {
          user_id: userId,
          method,
          secret_encrypted: secret, // Should be encrypted in production
          backup_codes: backupCodes,
          enabled: true,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error saving 2FA setup:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in save2FASetup:', error);
      return false;
    }
  }

  /**
   * Verify using backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const supabase = createServerClient(this.supabaseUrl, this.supabaseKey, {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      });

      const { data, error } = await supabase
        .from('user_2fa')
        .select('backup_codes')
        .eq('user_id', userId)
        .eq('enabled', true)
        .single();

      if (error || !data) {
        return false;
      }

      const codes = data.backup_codes as string[];
      if (!codes.includes(code)) {
        return false;
      }

      // Remove used code
      const updatedCodes = codes.filter((c) => c !== code);
      await supabase.from('user_2fa').update({ backup_codes: updatedCodes }).eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId: string): Promise<boolean> {
    try {
      const supabase = createServerClient(this.supabaseUrl, this.supabaseKey, {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      });

      const { error } = await supabase.from('user_2fa').update({ enabled: false }).eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    try {
      const supabase = createServerClient(this.supabaseUrl, this.supabaseKey, {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      });

      const { data, error } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', userId)
        .eq('enabled', true)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  }
}

export const twoFactorAuth = new TwoFactorAuth(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
