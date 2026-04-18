/**
 * WEEK-CHAIN KPI Calculations
 * Business Intelligence metrics for the 360° REaaS platform
 * Based on the architecture document KPIs
 */

import { createClient } from "@/lib/supabase/server"

// ============================================================================
// TYPES
// ============================================================================

export interface KPIMetric {
  name: string
  value: number
  unit: string
  trend?: 'up' | 'down' | 'stable'
  trendPercent?: number
  target?: number
  status?: 'good' | 'warning' | 'critical'
}

export interface DashboardKPIs {
  financial: KPIMetric[]
  operational: KPIMetric[]
  sales: KPIMetric[]
  service: KPIMetric[]
  compliance: KPIMetric[]
}

export interface RoleKPIs {
  role: string
  kpis: KPIMetric[]
  lastUpdated: string
}

// ============================================================================
// FINANCIAL KPIs
// ============================================================================

/**
 * Calculate Gross Booking Value (GBV)
 */
export async function calculateGBV(
  startDate?: Date,
  endDate?: Date
): Promise<KPIMetric> {
  const supabase = await createClient()
  
  let query = supabase
    .from('payments')
    .select('amount, currency')
    .eq('status', 'completed')
  
  if (startDate) {
    query = query.gte('created_at', startDate.toISOString())
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString())
  }
  
  const { data: payments } = await query
  
  const gbv = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  
  // Calculate previous period for trend
  const periodDays = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 30
  
  const prevStart = new Date((startDate || new Date()).getTime() - periodDays * 24 * 60 * 60 * 1000)
  const prevEnd = startDate || new Date()
  
  const { data: prevPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', prevStart.toISOString())
    .lt('created_at', prevEnd.toISOString())
  
  const prevGbv = prevPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const trendPercent = prevGbv > 0 ? ((gbv - prevGbv) / prevGbv) * 100 : 0
  
  return {
    name: 'Gross Booking Value',
    value: gbv,
    unit: 'USD',
    trend: trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'stable',
    trendPercent: Math.abs(trendPercent),
  }
}

/**
 * Calculate Monthly Recurring Revenue (MRR) from maintenance fees
 */
export async function calculateMRR(): Promise<KPIMetric> {
  const supabase = await createClient()
  
  // Get active certificates with maintenance fees
  const { data: activeCerts } = await supabase
    .from('user_certificates_v2')
    .select('maintenance_fee_annual')
    .eq('status', 'active')
  
  const annualFees = activeCerts?.reduce((sum, c) => sum + (c.maintenance_fee_annual || 0), 0) || 0
  const mrr = annualFees / 12
  
  return {
    name: 'Monthly Recurring Revenue',
    value: mrr,
    unit: 'USD',
    trend: 'stable',
  }
}

/**
 * Calculate Average Revenue Per User (ARPU)
 */
export async function calculateARPU(months = 12): Promise<KPIMetric> {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, user_id')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
  
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const uniqueUsers = new Set(payments?.map(p => p.user_id) || []).size
  const arpu = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0
  
  return {
    name: 'Average Revenue Per User',
    value: arpu,
    unit: 'USD',
    status: arpu > 5000 ? 'good' : arpu > 2000 ? 'warning' : 'critical',
  }
}

// ============================================================================
// OPERATIONAL KPIs
// ============================================================================

/**
 * Calculate Occupancy Rate
 */
export async function calculateOccupancyRate(
  propertyId?: string,
  year?: number
): Promise<KPIMetric> {
  const supabase = await createClient()
  const targetYear = year || new Date().getFullYear()
  
  let weeksQuery = supabase
    .from('weeks')
    .select('status, property_id')
    .eq('year', targetYear)
  
  if (propertyId) {
    weeksQuery = weeksQuery.eq('property_id', propertyId)
  }
  
  const { data: weeks } = await weeksQuery
  
  if (!weeks || weeks.length === 0) {
    return { name: 'Occupancy Rate', value: 0, unit: '%', status: 'warning' }
  }
  
  const occupiedWeeks = weeks.filter(w => 
    ['reserved', 'sold', 'booked'].includes(w.status)
  ).length
  
  const occupancyRate = (occupiedWeeks / weeks.length) * 100
  
  return {
    name: 'Occupancy Rate',
    value: occupancyRate,
    unit: '%',
    target: 75,
    status: occupancyRate >= 75 ? 'good' : occupancyRate >= 50 ? 'warning' : 'critical',
  }
}

/**
 * Calculate RevPAR (Revenue Per Available Room/Week)
 */
export async function calculateRevPAR(
  startDate?: Date,
  endDate?: Date
): Promise<KPIMetric> {
  const gbv = await calculateGBV(startDate, endDate)
  const occupancy = await calculateOccupancyRate()
  
  // RevPAR = ADR × Occupancy Rate
  // Simplified: Total Revenue / Total Available Weeks
  const supabase = await createClient()
  
  const { count: totalWeeks } = await supabase
    .from('weeks')
    .select('id', { count: 'exact' })
    .eq('year', new Date().getFullYear())
  
  const revpar = totalWeeks ? gbv.value / totalWeeks : 0
  
  return {
    name: 'RevPAR',
    value: revpar,
    unit: 'USD/week',
    status: revpar > 1000 ? 'good' : revpar > 500 ? 'warning' : 'critical',
  }
}

/**
 * Calculate Average Daily Rate (ADR)
 */
export async function calculateADR(): Promise<KPIMetric> {
  const supabase = await createClient()
  
  const { data: bookings } = await supabase
    .from('confirmed_reservations')
    .select('total_price, check_in, check_out')
    .eq('status', 'completed')
    .gte('check_out', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  
  let totalRevenue = 0
  let totalNights = 0
  
  for (const booking of bookings || []) {
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    totalRevenue += booking.total_price || 0
    totalNights += nights
  }
  
  const adr = totalNights > 0 ? totalRevenue / totalNights : 0
  
  return {
    name: 'Average Daily Rate',
    value: adr,
    unit: 'USD/night',
    status: adr > 200 ? 'good' : adr > 100 ? 'warning' : 'critical',
  }
}

// ============================================================================
// SALES KPIs
// ============================================================================

/**
 * Calculate SVC Sales metrics
 */
export async function calculateSVCSales(days = 30): Promise<KPIMetric[]> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: sales, count } = await supabase
    .from('user_certificates_v2')
    .select('id, price_paid, tier', { count: 'exact' })
    .gte('purchased_at', startDate.toISOString())
  
  const totalSales = count || 0
  const totalRevenue = sales?.reduce((sum, s) => sum + (s.price_paid || 0), 0) || 0
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0
  
  // Sales by tier
  const tierCounts: Record<string, number> = {}
  for (const sale of sales || []) {
    tierCounts[sale.tier] = (tierCounts[sale.tier] || 0) + 1
  }
  
  return [
    {
      name: 'SVC Sales (units)',
      value: totalSales,
      unit: 'units',
      target: 50,
      status: totalSales >= 50 ? 'good' : totalSales >= 25 ? 'warning' : 'critical',
    },
    {
      name: 'SVC Revenue',
      value: totalRevenue,
      unit: 'USD',
    },
    {
      name: 'Average Ticket',
      value: avgTicket,
      unit: 'USD',
      status: avgTicket > 10000 ? 'good' : avgTicket > 5000 ? 'warning' : 'critical',
    },
  ]
}

/**
 * Calculate Lead Conversion Rate
 */
export async function calculateConversionRate(days = 30): Promise<KPIMetric> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  // Count leads
  const { count: totalLeads } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .gte('created_at', startDate.toISOString())
  
  // Count conversions (users with certificates)
  const { count: conversions } = await supabase
    .from('user_certificates_v2')
    .select('user_id', { count: 'exact' })
    .gte('purchased_at', startDate.toISOString())
  
  const conversionRate = totalLeads ? ((conversions || 0) / totalLeads) * 100 : 0
  
  return {
    name: 'Lead Conversion Rate',
    value: conversionRate,
    unit: '%',
    target: 5,
    status: conversionRate >= 5 ? 'good' : conversionRate >= 2 ? 'warning' : 'critical',
  }
}

// ============================================================================
// SERVICE KPIs
// ============================================================================

/**
 * Calculate NPS (Net Promoter Score)
 */
export async function calculateNPS(days = 90): Promise<KPIMetric> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('nps_score')
    .gte('created_at', startDate.toISOString())
    .not('nps_score', 'is', null)
  
  if (!reviews || reviews.length === 0) {
    return { name: 'NPS', value: 0, unit: 'score', status: 'warning' }
  }
  
  const promoters = reviews.filter(r => r.nps_score >= 9).length
  const detractors = reviews.filter(r => r.nps_score <= 6).length
  const nps = ((promoters - detractors) / reviews.length) * 100
  
  return {
    name: 'Net Promoter Score',
    value: nps,
    unit: 'score',
    target: 50,
    status: nps >= 50 ? 'good' : nps >= 0 ? 'warning' : 'critical',
  }
}

/**
 * Calculate Customer Satisfaction (CSAT)
 */
export async function calculateCSAT(days = 30): Promise<KPIMetric> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .gte('created_at', startDate.toISOString())
  
  if (!reviews || reviews.length === 0) {
    return { name: 'CSAT', value: 0, unit: '%', status: 'warning' }
  }
  
  const satisfied = reviews.filter(r => r.rating >= 4).length
  const csat = (satisfied / reviews.length) * 100
  
  return {
    name: 'Customer Satisfaction',
    value: csat,
    unit: '%',
    target: 85,
    status: csat >= 85 ? 'good' : csat >= 70 ? 'warning' : 'critical',
  }
}

/**
 * Calculate SLA Compliance Rate
 */
export async function calculateSLACompliance(days = 30): Promise<KPIMetric> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: slaRecords } = await supabase
    .from('sla_tracking')
    .select('breached_at')
    .gte('created_at', startDate.toISOString())
    .not('completed_at', 'is', null)
  
  if (!slaRecords || slaRecords.length === 0) {
    return { name: 'SLA Compliance', value: 100, unit: '%', status: 'good' }
  }
  
  const breached = slaRecords.filter(s => s.breached_at).length
  const compliance = ((slaRecords.length - breached) / slaRecords.length) * 100
  
  return {
    name: 'SLA Compliance',
    value: compliance,
    unit: '%',
    target: 95,
    status: compliance >= 95 ? 'good' : compliance >= 85 ? 'warning' : 'critical',
  }
}

/**
 * Calculate Average Response Time
 */
export async function calculateAvgResponseTime(days = 30): Promise<KPIMetric> {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: incidents } = await supabase
    .from('incidents')
    .select('created_at, first_response_at')
    .gte('created_at', startDate.toISOString())
    .not('first_response_at', 'is', null)
  
  if (!incidents || incidents.length === 0) {
    return { name: 'Avg Response Time', value: 0, unit: 'minutes', status: 'good' }
  }
  
  let totalMinutes = 0
  for (const incident of incidents) {
    const created = new Date(incident.created_at)
    const responded = new Date(incident.first_response_at)
    totalMinutes += (responded.getTime() - created.getTime()) / 60000
  }
  
  const avgMinutes = totalMinutes / incidents.length
  
  return {
    name: 'Avg Response Time',
    value: avgMinutes,
    unit: 'minutes',
    target: 30,
    status: avgMinutes <= 30 ? 'good' : avgMinutes <= 60 ? 'warning' : 'critical',
  }
}

// ============================================================================
// COMPLIANCE KPIs
// ============================================================================

/**
 * Calculate KYC Completion Rate
 */
export async function calculateKYCCompletion(): Promise<KPIMetric> {
  const supabase = await createClient()
  
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .neq('role', 'admin')
  
  const { count: verifiedUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('kyc_status', 'verified')
  
  const completionRate = totalUsers ? ((verifiedUsers || 0) / totalUsers) * 100 : 0
  
  return {
    name: 'KYC Completion Rate',
    value: completionRate,
    unit: '%',
    target: 90,
    status: completionRate >= 90 ? 'good' : completionRate >= 70 ? 'warning' : 'critical',
  }
}

/**
 * Calculate Contract Signature Rate
 */
export async function calculateContractSignatureRate(): Promise<KPIMetric> {
  const supabase = await createClient()
  
  const { count: totalContracts } = await supabase
    .from('legal_contracts')
    .select('id', { count: 'exact' })
  
  const { count: signedContracts } = await supabase
    .from('legal_contracts')
    .select('id', { count: 'exact' })
    .eq('status', 'signed')
  
  const signatureRate = totalContracts ? ((signedContracts || 0) / totalContracts) * 100 : 0
  
  return {
    name: 'Contract Signature Rate',
    value: signatureRate,
    unit: '%',
    target: 95,
    status: signatureRate >= 95 ? 'good' : signatureRate >= 85 ? 'warning' : 'critical',
  }
}

// ============================================================================
// ROLE-BASED DASHBOARDS
// ============================================================================

/**
 * Get KPIs for a specific role
 */
export async function getKPIsForRole(role: string): Promise<RoleKPIs> {
  const kpis: KPIMetric[] = []
  
  switch (role) {
    case 'admin':
    case 'super_admin':
      // Executive dashboard - all KPIs
      const gbv = await calculateGBV()
      const mrr = await calculateMRR()
      const occupancy = await calculateOccupancyRate()
      const nps = await calculateNPS()
      const slaCompliance = await calculateSLACompliance()
      const conversion = await calculateConversionRate()
      kpis.push(gbv, mrr, occupancy, nps, slaCompliance, conversion)
      break
      
    case 'finance':
    case 'treasury':
      // Financial KPIs
      const finGbv = await calculateGBV()
      const finMrr = await calculateMRR()
      const arpu = await calculateARPU()
      const finSales = await calculateSVCSales()
      kpis.push(finGbv, finMrr, arpu, ...finSales)
      break
      
    case 'operations':
      // Operational KPIs
      const opOccupancy = await calculateOccupancyRate()
      const revpar = await calculateRevPAR()
      const adr = await calculateADR()
      const opSla = await calculateSLACompliance()
      kpis.push(opOccupancy, revpar, adr, opSla)
      break
      
    case 'sales':
    case 'broker':
      // Sales KPIs
      const salesMetrics = await calculateSVCSales()
      const salesConversion = await calculateConversionRate()
      kpis.push(...salesMetrics, salesConversion)
      break
      
    case 'service':
      // Service KPIs
      const serviceNps = await calculateNPS()
      const csat = await calculateCSAT()
      const responseTime = await calculateAvgResponseTime()
      const serviceSla = await calculateSLACompliance()
      kpis.push(serviceNps, csat, responseTime, serviceSla)
      break
      
    case 'compliance':
    case 'legal':
      // Compliance KPIs
      const kyc = await calculateKYCCompletion()
      const contracts = await calculateContractSignatureRate()
      const complianceSla = await calculateSLACompliance()
      kpis.push(kyc, contracts, complianceSla)
      break
      
    case 'property_owner':
      // Owner dashboard
      const ownerOccupancy = await calculateOccupancyRate()
      const ownerRevpar = await calculateRevPAR()
      kpis.push(ownerOccupancy, ownerRevpar)
      break
      
    default:
      // Default user KPIs
      const defaultNps = await calculateNPS()
      kpis.push(defaultNps)
  }
  
  return {
    role,
    kpis,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Get complete dashboard data for admin
 */
export async function getAdminDashboardData(): Promise<DashboardKPIs> {
  const [
    gbv, mrr, arpu,
    occupancy, revpar, adr,
    salesMetrics, conversion,
    nps, csat, responseTime, slaCompliance,
    kyc, contracts
  ] = await Promise.all([
    calculateGBV(),
    calculateMRR(),
    calculateARPU(),
    calculateOccupancyRate(),
    calculateRevPAR(),
    calculateADR(),
    calculateSVCSales(),
    calculateConversionRate(),
    calculateNPS(),
    calculateCSAT(),
    calculateAvgResponseTime(),
    calculateSLACompliance(),
    calculateKYCCompletion(),
    calculateContractSignatureRate(),
  ])
  
  return {
    financial: [gbv, mrr, arpu],
    operational: [occupancy, revpar, adr],
    sales: [...salesMetrics, conversion],
    service: [nps, csat, responseTime, slaCompliance],
    compliance: [kyc, contracts],
  }
}
