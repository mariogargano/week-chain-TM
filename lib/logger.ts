// F-10 FIX: Production-ready logger that controls debug output
// In production, debug logs are suppressed. In development, they show.

const isProduction = process.env.NODE_ENV === "production"
const isDebugEnabled = process.env.DEBUG_LOGS === "true"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  data?: Record<string, unknown>
  timestamp: string
}

function formatLog(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

// Sanitize sensitive data from logs
function sanitize(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return undefined
  
  const sensitiveKeys = ["password", "token", "secret", "key", "authorization", "cookie", "session"]
  const sanitized = { ...data }
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = "[REDACTED]"
    }
  }
  
  return sanitized
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    // Only show debug logs in development or when explicitly enabled
    if (!isProduction || isDebugEnabled) {
      const entry = formatLog("debug", message, sanitize(data))
      console.log(`[DEBUG] ${entry.timestamp} - ${message}`, data ? sanitize(data) : "")
    }
  },
  
  info: (message: string, data?: Record<string, unknown>) => {
    const entry = formatLog("info", message, sanitize(data))
    console.info(`[INFO] ${entry.timestamp} - ${message}`, data ? sanitize(data) : "")
  },
  
  warn: (message: string, data?: Record<string, unknown>) => {
    const entry = formatLog("warn", message, sanitize(data))
    console.warn(`[WARN] ${entry.timestamp} - ${message}`, data ? sanitize(data) : "")
  },
  
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    const entry = formatLog("error", message, sanitize(data))
    const errorInfo = error instanceof Error ? { name: error.name, message: error.message } : error
    console.error(`[ERROR] ${entry.timestamp} - ${message}`, errorInfo, data ? sanitize(data) : "")
  },
}

export default logger
