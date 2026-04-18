// F-07 FIX: Simple in-memory rate limiter for auth endpoints
// For production, consider using Upstash Rate Limit or Redis

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries lazily during checks instead of setInterval
// This avoids issues with Edge runtime and serverless environments
function cleanupExpiredEntries() {
  const now = Date.now()
  // Only cleanup if store has many entries (performance optimization)
  if (rateLimitStore.size > 100) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

export interface RateLimitConfig {
  maxRequests: number  // Max requests allowed
  windowMs: number     // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): RateLimitResult {
  // Lazy cleanup of expired entries
  cleanupExpiredEntries()
  
  const now = Date.now()
  const key = identifier
  
  let entry = rateLimitStore.get(key)
  
  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    }
  }
  
  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)
  
  const allowed = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  }
}

// Pre-configured rate limiters for different use cases
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60000, // 5 requests per minute for auth
}

export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 100 requests per minute for general API
}

export const ADMIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60000, // 30 requests per minute for admin endpoints
}
