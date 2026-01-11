import { type NextRequest, NextResponse } from "next/server"

// =====================================================
// WEEK-CHAIN™ - Advanced Rate Limiting Middleware
// =====================================================
// Rate limiting con múltiples estrategias y límites por endpoint
// =====================================================

interface RateLimitConfig {
  limit: number // Número máximo de requests
  windowMs: number // Ventana de tiempo en milisegundos
  message?: string // Mensaje personalizado
}

interface RateLimitState {
  count: number
  resetAt: number
}

// Store en memoria (en producción usar Redis)
const rateLimitStore = new Map<string, RateLimitState>()

// Configuraciones por tipo de endpoint
export const RATE_LIMIT_CONFIGS = {
  default: { limit: 120, windowMs: 60_000 }, // 120 req/min
  auth: { limit: 5, windowMs: 60_000, message: "Demasiados intentos de login" }, // 5 req/min
  payment: { limit: 10, windowMs: 60_000, message: "Demasiadas solicitudes de pago" }, // 10 req/min
  api: { limit: 60, windowMs: 60_000 }, // 60 req/min
  webhook: { limit: 1000, windowMs: 60_000 }, // 1000 req/min (webhooks externos)
  admin: { limit: 200, windowMs: 60_000 }, // 200 req/min (admins)
} as const

/**
 * Verifica si una request está dentro del límite de rate
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default,
): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = getClientIP(req)
  const key = `${ip}:${req.nextUrl.pathname}`
  const now = Date.now()

  let state = rateLimitStore.get(key)

  // Si no existe o la ventana expiró, crear nuevo estado
  if (!state || now > state.resetAt) {
    state = {
      count: 1,
      resetAt: now + config.windowMs,
    }
    rateLimitStore.set(key, state)
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: state.resetAt,
    }
  }

  // Incrementar contador
  state.count++

  // Verificar si excede el límite
  if (state.count > config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: state.resetAt,
    }
  }

  return {
    allowed: true,
    remaining: config.limit - state.count,
    resetAt: state.resetAt,
  }
}

/**
 * Middleware de rate limiting
 */
export function rateLimitMiddleware(req: NextRequest, config?: RateLimitConfig): NextResponse | null {
  const result = checkRateLimit(req, config)

  // Agregar headers de rate limit
  const headers = new Headers()
  headers.set("X-RateLimit-Limit", config?.limit.toString() || "120")
  headers.set("X-RateLimit-Remaining", result.remaining.toString())
  headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString())

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: config?.message || "Too many requests",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers,
      },
    )
  }

  return null // Permitir continuar
}

/**
 * Obtiene la IP del cliente considerando proxies
 */
function getClientIP(req: NextRequest): string {
  return req.ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown"
}

/**
 * Limpia entradas expiradas del store (ejecutar periódicamente)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, state] of rateLimitStore.entries()) {
    if (now > state.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Limpiar cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

/**
 * Rate limit específico por usuario autenticado
 */
export function userRateLimit(userId: string, config: RateLimitConfig): boolean {
  const key = `user:${userId}`
  const now = Date.now()

  let state = rateLimitStore.get(key)

  if (!state || now > state.resetAt) {
    state = { count: 1, resetAt: now + config.windowMs }
    rateLimitStore.set(key, state)
    return true
  }

  state.count++
  return state.count <= config.limit
}
