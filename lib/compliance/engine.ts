/**
 * WEEK-CHAIN Compliance Engine
 * Handles PROFECO, NOM-151, LFPDPPP, and AML/LFPIORPI compliance
 * Based on the 360° REaaS Architecture Document
 */

import { createClient } from "@/lib/supabase/server";

// ============================================================================
// TYPES
// ============================================================================

export type ComplianceType = 
  | 'kyc_individual' |'kyc_business' |'aml_check' |'pep_check' |'sanctions_check' |'profeco_contract' |'nom_151_signature' |'lfpdppp_consent' |'arco_request'

export type ComplianceResult = {
  passed: boolean
  score?: number
  flags: string[]
  details: Record<string, unknown>
  requiresManualReview: boolean
}

export interface PROFECOContractValidation {
  hasRegistrationNumber: boolean
  registrationNumber?: string
  hasRequiredClauses: boolean
  missingClauses: string[]
  hasProhibitedTerms: boolean
  prohibitedTermsFound: string[]
  hasCancellationPolicy: boolean
  hasRefundPolicy: boolean
  isValid: boolean
}

export interface NOM151Validation {
  hasDigitalSignature: boolean
  signatureProvider?: string
  certificateNumber?: string
  timestamp?: string
  sha256Hash?: string
  isValid: boolean
}

// ============================================================================
// PROFECO COMPLIANCE (Tiempo Compartido)
// ============================================================================

// Required clauses for PROFECO-compliant timeshare contracts in Mexico
const PROFECO_REQUIRED_CLAUSES = [
  'derecho_cancelacion_5_dias', // Right to cancel within 5 business days
  'descripcion_unidad_habitacional', // Description of accommodation unit
  'temporada_uso', // Season of use
  'duracion_contrato', // Contract duration
  'precio_total', // Total price
  'forma_pago', // Payment terms
  'gastos_mantenimiento', // Maintenance fees
  'procedimiento_reservacion', // Reservation procedure
  'politica_cancelacion', // Cancellation policy
  'procedimiento_quejas', // Complaint procedure
  'datos_proveedor', // Provider information (RFC, domicilio, etc.)
  'numero_registro_profeco', // PROFECO registration number
]

// Terms prohibited in timeshare contracts per PROFECO
const PROFECO_PROHIBITED_TERMS = [
  'no reembolsable',
  'sin derecho a cancelacion',
  'renuncia a derechos',
  'clausula penal excesiva',
  'liberacion de responsabilidad total',
  'modificacion unilateral',
  'renovacion automatica sin consentimiento',
  'cobros no autorizados',
]

// Copy guardrails - marketing terms that should trigger warnings
const MARKETING_GUARDRAILS = {
  prohibited: [
    'inversion garantizada',
    'rentabilidad asegurada',
    'retorno garantizado',
    'plusvalia garantizada',
    'sin riesgo',
    'ganancias seguras',
  ],
  requiresDisclaimer: [
    'inversion',
    'rendimiento',
    'plusvalia',
    'revalorizacion',
    'apreciacion',
  ],
}

/**
 * Validate a contract against PROFECO requirements
 */
export async function validatePROFECOContract(
  contractText: string,
  contractMetadata: Record<string, unknown>
): Promise<PROFECOContractValidation> {
  const textLower = contractText.toLowerCase()
  
  // Check for PROFECO registration number
  const registrationMatch = contractText.match(/registro\s*profeco[:\s]*([A-Z0-9-]+)/i)
  const hasRegistrationNumber = !!registrationMatch
  const registrationNumber = registrationMatch?.[1]
  
  // Check for required clauses
  const missingClauses: string[] = []
  for (const clause of PROFECO_REQUIRED_CLAUSES) {
    const clauseKeywords = clause.replace(/_/g, ' ').split(' ')
    const hasClause = clauseKeywords.some(kw => textLower.includes(kw))
    if (!hasClause) {
      missingClauses.push(clause)
    }
  }
  
  // Check for prohibited terms
  const prohibitedTermsFound: string[] = []
  for (const term of PROFECO_PROHIBITED_TERMS) {
    if (textLower.includes(term)) {
      prohibitedTermsFound.push(term)
    }
  }
  
  // Check cancellation policy (5 business days required by Mexican law)
  const hasCancellationPolicy = textLower.includes('cancelacion') && 
    (textLower.includes('5 dias') || textLower.includes('cinco dias'))
  
  // Check refund policy
  const hasRefundPolicy = textLower.includes('reembolso') || textLower.includes('devolucion')
  
  const isValid = 
    hasRegistrationNumber &&
    missingClauses.length === 0 &&
    prohibitedTermsFound.length === 0 &&
    hasCancellationPolicy &&
    hasRefundPolicy
  
  return {
    hasRegistrationNumber,
    registrationNumber,
    hasRequiredClauses: missingClauses.length === 0,
    missingClauses,
    hasProhibitedTerms: prohibitedTermsFound.length > 0,
    prohibitedTermsFound,
    hasCancellationPolicy,
    hasRefundPolicy,
    isValid,
  }
}

/**
 * Validate marketing copy against guardrails
 */
export function validateMarketingCopy(text: string): {
  isValid: boolean
  issues: string[]
  warnings: string[]
} {
  const textLower = text.toLowerCase()
  const issues: string[] = []
  const warnings: string[] = []
  
  // Check prohibited terms
  for (const term of MARKETING_GUARDRAILS.prohibited) {
    if (textLower.includes(term)) {
      issues.push(`Termino prohibido encontrado: "${term}"`)
    }
  }
  
  // Check terms requiring disclaimer
  for (const term of MARKETING_GUARDRAILS.requiresDisclaimer) {
    if (textLower.includes(term)) {
      warnings.push(`Termino "${term}" requiere disclaimer legal`)
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  }
}

// ============================================================================
// NOM-151 COMPLIANCE (Electronic Signatures)
// ============================================================================

/**
 * Validate NOM-151 electronic signature
 */
export async function validateNOM151Signature(
  documentId: string,
  signatureData: Record<string, unknown>
): Promise<NOM151Validation> {
  const supabase = await createClient()
  
  // Get document from legal_contracts
  const { data: contract } = await supabase
    .from('legal_contracts')
    .select('*')
    .eq('id', documentId)
    .single()
  
  if (!contract) {
    return {
      hasDigitalSignature: false,
      isValid: false,
    }
  }
  
  // Check if signed via Legalario/Mifiel
  const hasDigitalSignature = !!contract.signature_provider && !!contract.signature_certificate
  
  return {
    hasDigitalSignature,
    signatureProvider: contract.signature_provider,
    certificateNumber: contract.signature_certificate,
    timestamp: contract.signed_at,
    sha256Hash: contract.sha256_hash,
    isValid: hasDigitalSignature && !!contract.sha256_hash,
  }
}

/**
 * Generate NOM-151 compliant constancia
 */
export async function generateNOM151Constancia(
  contractId: string
): Promise<{ success: boolean; constanciaId?: string; error?: string }> {
  const supabase = await createClient()
  
  const { data: contract } = await supabase
    .from('legal_contracts')
    .select('*')
    .eq('id', contractId)
    .single()
  
  if (!contract) {
    return { success: false, error: 'Contract not found' }
  }
  
  // Create constancia record
  const constanciaData = {
    contract_id: contractId,
    document_type: contract.contract_type,
    parties: contract.parties,
    signature_provider: contract.signature_provider,
    signature_certificate: contract.signature_certificate,
    signed_at: contract.signed_at,
    sha256_hash: contract.sha256_hash,
    nom_151_compliant: true,
    generated_at: new Date().toISOString(),
  }
  
  const { data: constancia, error } = await supabase
    .from('nom_151_constancias')
    .insert(constanciaData)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, constanciaId: constancia.id }
}

// ============================================================================
// LFPDPPP COMPLIANCE (Data Privacy)
// ============================================================================

export interface LFPDPPPConsent {
  userId: string
  consentType: 'full' | 'limited' | 'sensitive'
  purposes: string[]
  transfers: string[]
  consentedAt: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Record LFPDPPP consent
 */
export async function recordPrivacyConsent(
  consent: LFPDPPPConsent
): Promise<{ success: boolean; consentId?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('privacy_consents')
    .insert({
      user_id: consent.userId,
      consent_type: consent.consentType,
      purposes: consent.purposes,
      transfers: consent.transfers,
      consented_at: consent.consentedAt,
      ip_address: consent.ipAddress,
      user_agent: consent.userAgent,
      is_active: true,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false }
  }
  
  return { success: true, consentId: data.id }
}

/**
 * Handle ARCO request (Acceso, Rectificacion, Cancelacion, Oposicion)
 */
export async function handleARCORequest(
  userId: string,
  requestType: 'access' | 'rectification' | 'cancellation' | 'opposition',
  details: string
): Promise<{ success: boolean; requestId?: string; deadline: string }> {
  const supabase = await createClient()
  
  // LFPDPPP requires response within 20 business days
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 28) // ~20 business days
  
  const { data, error } = await supabase
    .from('arco_requests')
    .insert({
      user_id: userId,
      request_type: requestType,
      details,
      status: 'pending',
      deadline: deadline.toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, deadline: deadline.toISOString() }
  }
  
  // Notify compliance team
  await supabase.from('notification_queue').insert({
    channel: 'email',
    recipient: 'compliance@week-chain.com',
    template: 'arco_request',
    payload: {
      requestId: data.id,
      requestType,
      userId,
      deadline: deadline.toISOString(),
    },
    status: 'pending',
  })
  
  return { 
    success: true, 
    requestId: data.id,
    deadline: deadline.toISOString(),
  }
}

// ============================================================================
// AML/LFPIORPI COMPLIANCE
// ============================================================================

export interface AMLCheckResult {
  userId: string
  riskScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
  pepMatch: boolean
  sanctionsMatch: boolean
  adverseMediaMatch: boolean
  requiresEDD: boolean // Enhanced Due Diligence
  recommendation: 'approve' | 'review' | 'reject'
}

// Transaction thresholds for AML reporting (in USD)
const AML_THRESHOLDS = {
  single_transaction: 10000,
  monthly_aggregate: 50000,
  cash_transaction: 5000,
  international_transfer: 3000,
}

/**
 * Perform AML check on user
 */
export async function performAMLCheck(
  userId: string,
  transactionAmount?: number
): Promise<AMLCheckResult> {
  const supabase = await createClient()
  
  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*, kyc_users(*)')
    .eq('id', userId)
    .single()
  
  if (!user) {
    return {
      userId,
      riskScore: 100,
      riskLevel: 'critical',
      flags: ['user_not_found'],
      pepMatch: false,
      sanctionsMatch: false,
      adverseMediaMatch: false,
      requiresEDD: true,
      recommendation: 'reject',
    }
  }
  
  const flags: string[] = []
  let riskScore = 0
  
  // Check KYC status
  if (!user.kyc_users || user.kyc_users.status !== 'approved') {
    flags.push('kyc_incomplete')
    riskScore += 30
  }
  
  // Check for high-risk countries (simplified list)
  const highRiskCountries = ['IR', 'KP', 'SY', 'CU', 'VE']
  if (user.country && highRiskCountries.includes(user.country)) {
    flags.push('high_risk_country')
    riskScore += 40
  }
  
  // Check transaction amount thresholds
  if (transactionAmount) {
    if (transactionAmount >= AML_THRESHOLDS.single_transaction) {
      flags.push('large_transaction')
      riskScore += 20
    }
  }
  
  // Check monthly transaction volume
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
  
  const monthlyTotal = recentPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  if (monthlyTotal >= AML_THRESHOLDS.monthly_aggregate) {
    flags.push('high_monthly_volume')
    riskScore += 25
  }
  
  // PEP check (would integrate with external service in production)
  const pepMatch = false // Placeholder
  if (pepMatch) {
    flags.push('pep_match')
    riskScore += 35
  }
  
  // Sanctions check (would integrate with OFAC/UN lists in production)
  const sanctionsMatch = false // Placeholder
  if (sanctionsMatch) {
    flags.push('sanctions_match')
    riskScore = 100 // Automatic highest risk
  }
  
  // Determine risk level
  let riskLevel: AMLCheckResult['riskLevel']
  if (riskScore >= 75) riskLevel = 'critical'
  else if (riskScore >= 50) riskLevel = 'high'
  else if (riskScore >= 25) riskLevel = 'medium'
  else riskLevel = 'low'
  
  // Determine recommendation
  let recommendation: AMLCheckResult['recommendation']
  if (riskScore >= 75) recommendation = 'reject'
  else if (riskScore >= 40) recommendation = 'review'
  else recommendation = 'approve'
  
  // Record check in database
  await supabase.from('aml_checks').insert({
    user_id: userId,
    risk_score: riskScore,
    risk_level: riskLevel,
    flags,
    pep_match: pepMatch,
    sanctions_match: sanctionsMatch,
    recommendation,
    transaction_amount: transactionAmount,
    checked_at: new Date().toISOString(),
  })
  
  // Create alert if high risk
  if (riskLevel === 'high' || riskLevel === 'critical') {
    await supabase.from('system_alerts').insert({
      alert_type: 'aml_alert',
      severity: riskLevel === 'critical' ? 'critical' : 'high',
      entity_type: 'users',
      entity_id: userId,
      title: `AML Alert: ${riskLevel.toUpperCase()} risk user`,
      message: `User ${user.email} flagged with risk score ${riskScore}. Flags: ${flags.join(', ')}`,
      metadata: { riskScore, flags, recommendation },
    })
  }
  
  return {
    userId,
    riskScore,
    riskLevel,
    flags,
    pepMatch,
    sanctionsMatch,
    adverseMediaMatch: false,
    requiresEDD: riskLevel === 'high' || riskLevel === 'critical',
    recommendation,
  }
}

/**
 * Check if transaction requires STR (Suspicious Transaction Report)
 */
export async function checkSTRRequirement(
  userId: string,
  transactionAmount: number,
  transactionType: string
): Promise<{ required: boolean; reason?: string }> {
  // Perform AML check
  const amlResult = await performAMLCheck(userId, transactionAmount)
  
  if (amlResult.riskLevel === 'critical') {
    return { required: true, reason: 'Critical risk level detected' }
  }
  
  if (transactionAmount >= AML_THRESHOLDS.single_transaction) {
    return { required: true, reason: 'Transaction exceeds reporting threshold' }
  }
  
  if (amlResult.sanctionsMatch) {
    return { required: true, reason: 'Sanctions match detected' }
  }
  
  return { required: false }
}

// ============================================================================
// COMPREHENSIVE COMPLIANCE CHECK
// ============================================================================

/**
 * Run full compliance check for a user/transaction
 */
export async function runFullComplianceCheck(
  userId: string,
  context: {
    transactionAmount?: number
    contractId?: string
    checkTypes?: ComplianceType[]
  } = {}
): Promise<ComplianceResult> {
  const supabase = await createClient()
  const flags: string[] = []
  const details: Record<string, unknown> = {}
  let requiresManualReview = false
  let overallScore = 100 // Start at 100, deduct for issues
  
  // AML Check
  if (!context.checkTypes || context.checkTypes.includes('aml_check')) {
    const amlResult = await performAMLCheck(userId, context.transactionAmount)
    details.aml = amlResult
    
    if (amlResult.riskLevel !== 'low') {
      overallScore -= amlResult.riskScore
      flags.push(...amlResult.flags)
    }
    
    if (amlResult.requiresEDD) {
      requiresManualReview = true
    }
  }
  
  // KYC Check
  if (!context.checkTypes || context.checkTypes.includes('kyc_individual')) {
    const { data: user } = await supabase
      .from('users')
      .select('kyc_status, kyc_verified_at')
      .eq('id', userId)
      .single()
    
    if (!user?.kyc_status || user.kyc_status !== 'verified') {
      flags.push('kyc_not_verified')
      overallScore -= 25
      requiresManualReview = true
    }
    details.kyc = { status: user?.kyc_status, verifiedAt: user?.kyc_verified_at }
  }
  
  // PROFECO Contract Check
  if (context.contractId && (!context.checkTypes || context.checkTypes.includes('profeco_contract'))) {
    const { data: contract } = await supabase
      .from('legal_contracts')
      .select('contract_text')
      .eq('id', context.contractId)
      .single()
    
    if (contract?.contract_text) {
      const profecoResult = await validatePROFECOContract(contract.contract_text, {})
      details.profeco = profecoResult
      
      if (!profecoResult.isValid) {
        flags.push('profeco_contract_invalid')
        overallScore -= 20
        if (profecoResult.prohibitedTermsFound.length > 0) {
          flags.push('profeco_prohibited_terms')
        }
      }
    }
  }
  
  // Privacy Consent Check
  if (!context.checkTypes || context.checkTypes.includes('lfpdppp_consent')) {
    const { data: consent } = await supabase
      .from('privacy_consents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('consented_at', { ascending: false })
      .limit(1)
      .single()
    
    if (!consent) {
      flags.push('privacy_consent_missing')
      overallScore -= 15
    }
    details.privacyConsent = consent ? { hasConsent: true, consentedAt: consent.consented_at } : { hasConsent: false }
  }
  
  // Record compliance check
  await supabase.from('compliance_records').insert({
    user_id: userId,
    check_type: 'full_compliance',
    status: overallScore >= 70 ? 'approved' : overallScore >= 40 ? 'alert' : 'blocked',
    score: overallScore,
    flags,
    details,
    requires_manual_review: requiresManualReview,
    checked_at: new Date().toISOString(),
  })
  
  return {
    passed: overallScore >= 70 && !requiresManualReview,
    score: overallScore,
    flags,
    details,
    requiresManualReview,
  }
}
