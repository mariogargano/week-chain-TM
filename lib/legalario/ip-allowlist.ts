import { getEnv } from "@/lib/config/env-schema"

const LEGALARIO_IP_ALLOWLIST = [
  "::1", // localhost IPv6
  "127.0.0.1", // localhost IPv4
  // Add Legalario production IPs here when available
  // "203.0.113.10",
  // "203.0.113.20",
]

export function isIPAllowed(ip: string | null): boolean {
  const env = getEnv()

  // In development, allow all IPs
  if (env.NODE_ENV === "development") {
    return true
  }

  if (!ip) {
    return false
  }

  // Normalize IP (handle IPv6-mapped IPv4)
  const normalizedIP = ip.replace("::ffff:", "")

  return LEGALARIO_IP_ALLOWLIST.includes(normalizedIP)
}

export function getClientIP(request: Request): string | null {
  // Try multiple headers in order of preference
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwardedFor.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  // Fallback to localhost (for local testing)
  return "127.0.0.1"
}

// Keep backward compatibility with existing class-based API
export class IPAllowlist {
  private static readonly ALLOWED_IPS: string[] = LEGALARIO_IP_ALLOWLIST
  private static readonly isDevelopment = process.env.NODE_ENV === "development"

  static isAllowed(ip: string): boolean {
    return isIPAllowed(ip)
  }

  private static isInCIDR(ip: string, cidr: string): boolean {
    // Simple CIDR check - in production, use a proper library
    const [range, bits] = cidr.split("/")
    return ip.startsWith(
      range
        .split(".")
        .slice(0, Number.parseInt(bits) / 8)
        .join("."),
    )
  }
}
