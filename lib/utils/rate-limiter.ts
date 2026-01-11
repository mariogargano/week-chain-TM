interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs
      this.attempts.set(identifier, { count: 1, resetTime })
      return { allowed: true, remaining: this.maxAttempts - 1, resetTime }
    }

    if (entry.count >= this.maxAttempts) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime }
    }

    entry.count++
    return { allowed: true, remaining: this.maxAttempts - entry.count, resetTime: entry.resetTime }
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const signupRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour

// Cleanup old entries every 5 minutes
if (typeof window === "undefined") {
  setInterval(
    () => {
      loginRateLimiter.cleanup()
      signupRateLimiter.cleanup()
      passwordResetRateLimiter.cleanup()
    },
    5 * 60 * 1000,
  )
}
