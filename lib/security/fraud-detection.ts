'use client';
import { createClient } from '@/lib/supabase/client';

export interface FraudSignal {
  type: 'multiple_accounts' | 'suspicious_login' | 'high_velocity' | 'chargeback_pattern' | 'document_forgery' | 'suspicious_device' | 'unusual_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  score: number
  reason: string
  timestamp: Date
  context?: Record<string, any>
}

export interface FraudRiskAssessment {
  user_id: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_score: number // 0-100
  signals: FraudSignal[]
  recommended_action: 'allow' | 'challenge' | 'block' | 'manual_review'
  requires_otp: boolean
  requires_kyc_refresh: boolean
}

class FraudDetectionEngine {
  private supabase = createClient()

  /**
   * Detect multiple accounts from same IP/device
   */
  async detectMultipleAccounts(
    identifier: string, // IP, device_id, email_domain
    limit: number = 5
  ): Promise<FraudSignal | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .or(`last_ip_address.eq.${identifier},device_fingerprint.eq.${identifier}`)
      .limit(limit)

    if (error || !data || data.length <= 1) return null

    return {
      type: 'multiple_accounts',
      severity: data.length > 10 ? 'critical' : data.length > 5 ? 'high' : 'medium',
      score: Math.min(100, data.length * 10),
      reason: `${data.length} accounts detected from same identifier`,
      timestamp: new Date(),
      context: { account_count: data.length, identifier }
    }
  }

  /**
   * Detect suspicious login patterns (impossible travel, unusual times)
   */
  async detectSuspiciousLogin(
    user_id: string,
    current_ip: string,
    current_country: string
  ): Promise<FraudSignal | null> {
    const { data: lastLogin } = await this.supabase
      .from('audit_log_immutable')
      .select('created_at, ip_address, metadata')
      .eq('user_id', user_id)
      .eq('action', 'login')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!lastLogin) return null

    const timeDiff = (new Date().getTime() - new Date(lastLogin.created_at).getTime()) / 1000 / 60 // minutes
    const lastCountry = lastLogin.metadata?.country

    // Impossible travel: same country but different IP within 10 minutes
    if (lastCountry === current_country && lastLogin.ip_address !== current_ip && timeDiff < 10) {
      return {
        type: 'suspicious_login',
        severity: 'high',
        score: 85,
        reason: 'Impossible travel detected - different IP, same country, 10 minutes apart',
        timestamp: new Date(),
        context: { last_ip: lastLogin.ip_address, current_ip, last_country: lastCountry, current_country, time_diff: timeDiff }
      }
    }

    // Login from new country at unusual hour (midnight-6am local time)
    if (lastCountry && lastCountry !== current_country) {
      const hour = new Date().getHours()
      if (hour >= 0 && hour < 6) {
        return {
          type: 'suspicious_login',
          severity: 'medium',
          score: 65,
          reason: 'Login from new country at unusual hour',
          timestamp: new Date(),
          context: { last_country: lastCountry, current_country, hour, last_ip: lastLogin.ip_address, current_ip }
        }
      }
    }

    return null
  }

  /**
   * Detect high velocity transactions (rapid succession of payments)
   */
  async detectHighVelocity(user_id: string, limit: number = 5): Promise<FraudSignal | null> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const { data, error } = await this.supabase
      .from('payments')
      .select('id, created_at, amount')
      .eq('user_id', user_id)
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false })

    if (error || !data) return null

    if (data.length >= limit) {
      const total = data.reduce((sum, p) => sum + (p.amount || 0), 0)
      return {
        type: 'high_velocity',
        severity: total > 50000 ? 'critical' : total > 20000 ? 'high' : 'medium',
        score: Math.min(100, (data.length * 20) + (total / 1000)),
        reason: `${data.length} transactions in 5 minutes, total $${total}`,
        timestamp: new Date(),
        context: { transaction_count: data.length, total_amount: total }
      }
    }

    return null
  }

  /**
   * Detect chargeback patterns
   */
  async detectChargebackPattern(user_id: string, window_days: number = 90): Promise<FraudSignal | null> {
    const windowStart = new Date(Date.now() - window_days * 24 * 60 * 60 * 1000)

    const { data: chargebacks } = await this.supabase
      .from('payments')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'chargeback')
      .gte('created_at', windowStart.toISOString())

    if (!chargebacks || chargebacks.length === 0) return null

    return {
      type: 'chargeback_pattern',
      severity: chargebacks.length > 3 ? 'critical' : chargebacks.length > 1 ? 'high' : 'medium',
      score: Math.min(100, chargebacks.length * 30),
      reason: `${chargebacks.length} chargebacks in last ${window_days} days`,
      timestamp: new Date(),
      context: { chargeback_count: chargebacks.length, window_days }
    }
  }

  /**
   * Detect document forgery patterns
   */
  async detectDocumentForgery(user_id: string): Promise<FraudSignal | null> {
    const { data: kyc } = await this.supabase
      .from('kyc_users')
      .select('id, kyc_documents, verification_status, created_at')
      .eq('user_id', user_id)
      .maybeSingle()

    if (!kyc) return null

    const now = new Date()
    const createdAt = new Date(kyc.created_at)
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

    // Multiple rapid document submissions (>3 in 1 day) is suspicious
    if (kyc.kyc_documents && Array.isArray(kyc.kyc_documents)) {
      const submissions = kyc.kyc_documents.filter(d => daysSinceCreation < 1)
      if (submissions.length > 3) {
        return {
          type: 'document_forgery',
          severity: 'high',
          score: 80,
          reason: 'Multiple rapid document submissions detected',
          timestamp: new Date(),
          context: { submission_count: submissions.length, days: daysSinceCreation }
        }
      }
    }

    return null
  }

  /**
   * Detect suspicious device patterns
   */
  async detectSuspiciousDevice(user_id: string): Promise<FraudSignal | null> {
    const { data: devices } = await this.supabase
      .from('audit_log_immutable')
      .select('metadata')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!devices || devices.length < 5) return null

    const uniqueDevices = new Set()
    devices.forEach(d => {
      if (d.metadata?.device_fingerprint) {
        uniqueDevices.add(d.metadata.device_fingerprint)
      }
    })

    if (uniqueDevices.size > 10) {
      return {
        type: 'suspicious_device',
        severity: 'medium',
        score: 70,
        reason: `${uniqueDevices.size} unique devices used in last 20 logins`,
        timestamp: new Date(),
        context: { device_count: uniqueDevices.size }
      }
    }

    return null
  }

  /**
   * Detect unusual behavioral patterns
   */
  async detectUnusualPattern(user_id: string): Promise<FraudSignal | null> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const { data: logins } = await this.supabase
      .from('audit_log_immutable')
      .select('created_at')
      .eq('user_id', user_id)
      .eq('action', 'login')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (!logins || logins.length < 2) return null

    const avgDaysBetweenLogins = 30 / logins.length

    // Significant spike in activity
    const lastWeek = logins.filter(l => {
      const date = new Date(l.created_at)
      return date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    }).length

    if (avgDaysBetweenLogins > 5 && lastWeek > 10) {
      return {
        type: 'unusual_pattern',
        severity: 'low',
        score: 45,
        reason: 'Unusual spike in login activity after period of inactivity',
        timestamp: new Date(),
        context: { avg_days_between_logins: avgDaysBetweenLogins, logins_last_week: lastWeek }
      }
    }

    return null
  }

  /**
   * Run comprehensive fraud assessment
   */
  async assessFraudRisk(user_id: string, additional_context?: Record<string, any>): Promise<FraudRiskAssessment> {
    const signals: FraudSignal[] = []

    // Run all detection methods in parallel
    const [
      multipleAccounts,
      suspiciousLogin,
      highVelocity,
      chargebackPattern,
      documentForgery,
      suspiciousDevice,
      unusualPattern
    ] = await Promise.all([
      this.detectMultipleAccounts(user_id),
      this.detectSuspiciousLogin(user_id, additional_context?.ip_address, additional_context?.country),
      this.detectHighVelocity(user_id),
      this.detectChargebackPattern(user_id),
      this.detectDocumentForgery(user_id),
      this.detectSuspiciousDevice(user_id),
      this.detectUnusualPattern(user_id)
    ])

    // Collect non-null signals
    ;[multipleAccounts, suspiciousLogin, highVelocity, chargebackPattern, documentForgery, suspiciousDevice, unusualPattern]
      .filter((s): s is FraudSignal => s !== null)
      .forEach(s => signals.push(s))

    // Calculate composite risk score
    const riskScore = signals.reduce((sum, signal) => {
      const weights = {
        multiple_accounts: 1.2,
        suspicious_login: 1.0,
        high_velocity: 1.3,
        chargeback_pattern: 1.5,
        document_forgery: 1.4,
        suspicious_device: 0.8,
        unusual_pattern: 0.5
      }
      return sum + signal.score * (weights[signal.type] || 1.0)
    }, 0) / Math.max(signals.length, 1)

    // Determine risk level and actions
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let recommended_action: 'allow' | 'challenge' | 'block' | 'manual_review' = 'allow'
    let requires_otp = false
    let requires_kyc_refresh = false

    if (riskScore < 30) {
      risk_level = 'low'
      recommended_action = 'allow'
    } else if (riskScore < 50) {
      risk_level = 'medium'
      recommended_action = 'challenge'
      requires_otp = true
    } else if (riskScore < 75) {
      risk_level = 'high'
      recommended_action = 'manual_review'
      requires_otp = true
      requires_kyc_refresh = true
    } else {
      risk_level = 'critical'
      recommended_action = 'block'
      requires_otp = true
      requires_kyc_refresh = true
    }

    // Log fraud assessment
    await this.supabase.from('audit_log_immutable').insert({
      user_id,
      action: 'fraud_assessment',
      ip_address: additional_context?.ip_address,
      metadata: {
        risk_score: riskScore,
        risk_level,
        signal_count: signals.length,
        signals: signals.map(s => ({ type: s.type, severity: s.severity }))
      }
    })

    return {
      user_id,
      risk_level,
      risk_score: Math.min(100, riskScore),
      signals,
      recommended_action,
      requires_otp,
      requires_kyc_refresh
    }
  }
}

export const fraudDetection = new FraudDetectionEngine()
