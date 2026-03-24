/**
 * WEEK-CHAIN Rate Limiting System
 * Protects sensitive API routes from abuse
 * 
 * Uses in-memory store with sliding window algorithm
 * For production, integrate with Upstash Redis
 */

import { NextRequest, NextResponse } from "next/server"

// Rate limit configuration by route type
export const RATE_LIMITS = {
  // Authentication routes - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: "Demasiados intentos de autenticacion. Intenta de nuevo en 15 minutos."
  },
  
  // Payment routes - very strict
  payments: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: "Demasiadas operaciones de pago. Intenta de nuevo mas tarde."
  },
  
  // KYC/sensitive data routes
  kyc: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: "Demasiadas solicitudes de verificacion. Intenta de nuevo mas tarde."
  },
  
  // Admin routes - moderate limits
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: "Demasiadas solicitudes administrativas. Espera un momento."
  },
  
  // General API - relaxed limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: "Demasiadas solicitudes. Intenta de nuevo en un momento."
  },
  
  // Webhooks - very relaxed (external services)
  webhooks: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    message: "Rate limit exceeded"
  },
  
  // OTP/2FA - very strict
  otp: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Demasiados intentos de verificacion. Espera 15 minutos."
  },
  
  // File uploads
  uploads: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: "Demasiadas subidas de archivos. Intenta mas tarde."
  }
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

// In-memory store for rate limiting
// In production, replace with Redis/Upstash
interface RateLimitEntry {
  count: number
  firstRequest: number
  blocked: boolean
  blockedUntil?: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    const config = RATE_LIMITS[key.split(':')[0] as RateLimitType] || RATE_LIMITS.api
    if (now - entry.firstRequest > config.windowMs * 2) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 1000) // Clean every minute

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  
  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0]?.trim() || "unknown"
  
  // Also include user agent for more granular limiting
  const userAgent = request.headers.get("user-agent") || "unknown"
  const hash = simpleHash(userAgent)
  
  return `${ip}:${hash}`
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).substring(0, 8)
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = "api"
): { allowed: boolean; remaining: number; resetIn: number; message?: string } {
  const config = RATE_LIMITS[type]
  const clientId = getClientId(request)
  const key = `${type}:${clientId}`
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)
  
  // Check if currently blocked
  if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.blockedUntil - now) / 1000),
      message: config.message
    }
  }
  
  // Reset if window expired
  if (!entry || now - entry.firstRequest > config.windowMs) {
    entry = {
      count: 1,
      firstRequest: now,
      blocked: false
    }
    rateLimitStore.set(key, entry)
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000)
    }
  }
  
  // Increment counter
  entry.count++
  
  // Check if over limit
  if (entry.count > config.maxRequests) {
    entry.blocked = true
    entry.blockedUntil = now + config.windowMs
    rateLimitStore.set(key, entry)
    
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(config.windowMs / 1000),
      message: config.message
    }
  }
  
  rateLimitStore.set(key, entry)
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.firstRequest + config.windowMs - now) / 1000)
  }
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  type: RateLimitType = "api"
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const result = checkRateLimit(request, type)
    
    if (!result.allowed) {
      return NextResponse.json(
        { 
          error: "rate_limit_exceeded",
          message: result.message,
          retryAfter: result.resetIn
        },
        { 
          status: 429,
          headers: {
            "Retry-After": result.resetIn.toString(),
            "X-RateLimit-Limit": RATE_LIMITS[type].maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.resetIn.toString()
          }
        }
      )
    }
    
    const response = await handler(request, ...args)
    
    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Limit", RATE_LIMITS[type].maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", result.resetIn.toString())
    
    return response
  }
}

/**
 * Rate limit check for use in API routes
 */
export function rateLimitCheck(
  request: NextRequest,
  type: RateLimitType = "api"
): NextResponse | null {
  const result = checkRateLimit(request, type)
  
  if (!result.allowed) {
    return NextResponse.json(
      { 
        error: "rate_limit_exceeded",
        message: result.message,
        retryAfter: result.resetIn
      },
      { 
        status: 429,
        headers: {
          "Retry-After": result.resetIn.toString(),
          "X-RateLimit-Limit": RATE_LIMITS[type].maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.resetIn.toString()
        }
      }
    )
  }
  
  return null // Request allowed
}

/**
 * Blocked IPs list (for manual blocking)
 */
const blockedIps = new Set<string>()
const blockedUserAgents = new Set<string>()

export function blockIp(ip: string): void {
  blockedIps.add(ip)
}

export function unblockIp(ip: string): void {
  blockedIps.delete(ip)
}

export function isIpBlocked(request: NextRequest): boolean {
  const clientId = getClientId(request)
  const ip = clientId.split(":")[0]
  return blockedIps.has(ip)
}

/**
 * Suspicious activity detection
 */
interface SuspiciousActivity {
  failedLogins: number
  failedPayments: number
  rapidRequests: number
  lastActivity: number
}

const suspiciousActivities = new Map<string, SuspiciousActivity>()

export function recordSuspiciousActivity(
  request: NextRequest,
  type: "failedLogin" | "failedPayment" | "rapidRequest"
): void {
  const clientId = getClientId(request)
  const now = Date.now()
  
  let activity = suspiciousActivities.get(clientId)
  
  if (!activity || now - activity.lastActivity > 24 * 60 * 60 * 1000) {
    activity = {
      failedLogins: 0,
      failedPayments: 0,
      rapidRequests: 0,
      lastActivity: now
    }
  }
  
  switch (type) {
    case "failedLogin":
      activity.failedLogins++
      break
    case "failedPayment":
      activity.failedPayments++
      break
    case "rapidRequest":
      activity.rapidRequests++
      break
  }
  
  activity.lastActivity = now
  suspiciousActivities.set(clientId, activity)
  
  // Auto-block if too suspicious
  if (activity.failedLogins > 10 || activity.failedPayments > 5 || activity.rapidRequests > 100) {
    const ip = clientId.split(":")[0]
    blockIp(ip)
  }
}

/**
 * Get rate limit status for admin dashboard
 */
export function getRateLimitStatus(): {
  activeEntries: number
  blockedIps: number
  suspiciousClients: number
} {
  return {
    activeEntries: rateLimitStore.size,
    blockedIps: blockedIps.size,
    suspiciousClients: suspiciousActivities.size
  }
}
