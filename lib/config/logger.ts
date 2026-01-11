// Production-safe logging utility
// Automatically disabled in production unless explicitly enabled

type LogLevel = "debug" | "info" | "warn" | "error"

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix: string
}

class Logger {
  private config: LoggerConfig

  constructor(config?: Partial<LoggerConfig>) {
    const debugEnabled = process.env.NEXT_PUBLIC_DEBUG === "true"

    this.config = {
      enabled: debugEnabled || typeof window === "undefined",
      level: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "debug",
      prefix: "[WEEK-CHAIN]",
      ...config,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false

    const levels: LogLevel[] = ["debug", "info", "warn", "error"]
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog("debug")) {
      console.log(`${this.config.prefix} [DEBUG]`, message, ...args)
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog("info")) {
      console.log(`${this.config.prefix} [INFO]`, message, ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog("warn")) {
      console.warn(`${this.config.prefix} [WARN]`, message, ...args)
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog("error")) {
      console.error(`${this.config.prefix} [ERROR]`, message, ...args)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export factory for custom loggers
export function createLogger(prefix: string): Logger {
  return new Logger({ prefix: `[${prefix}]` })
}
