interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
}

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // If no record or window expired, create new record
  if (!record || now >= record.resetAt) {
    const resetAt = now + RATE_LIMIT.windowMs
    rateLimitStore.set(identifier, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxRequests - 1,
      resetAt,
    }
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    }
  }

  // Increment count
  record.count++
  rateLimitStore.set(identifier, record)

  return {
    allowed: true,
    remaining: RATE_LIMIT.maxRequests - record.count,
    resetAt: record.resetAt,
  }
}

// Cleanup old entries periodically
setInterval(
  () => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now >= record.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000,
) // Every 5 minutes

// Keep backward compatibility with existing class-based API
export class RateLimiter {
  private static readonly MAX_REQUESTS = RATE_LIMIT.maxRequests
  private static readonly WINDOW_MS = RATE_LIMIT.windowMs

  static check(ip: string): { allowed: boolean; remaining: number } {
    const result = checkRateLimit(ip)
    return { allowed: result.allowed, remaining: result.remaining }
  }

  static reset(ip: string) {
    rateLimitStore.delete(ip)
  }
}
