import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const hits = new Map<string, { n: number; t: number }>()

const SITE_PROTECTION_ENABLED = false
const ADMIN_EMAIL = "corporativo@morises.com"

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown"
  const now = Date.now()
  const rec = hits.get(ip) ?? { n: 0, t: now }

  if (now - rec.t > 60_000) {
    rec.n = 0
    rec.t = now
  }

  rec.n++
  hits.set(ip, rec)

  // Stricter rate limit for API routes (especially webhooks)
  const isWebhookRoute = request.nextUrl.pathname.startsWith("/api/legalario/webhook")
  const maxRequests = isWebhookRoute ? 10 : 120

  if (rec.n > maxRequests) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "X-RateLimit-Limit": maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(rec.t + 60000).toISOString(),
      },
    })
  }

  if (SITE_PROTECTION_ENABLED) {
    const pathname = request.nextUrl.pathname
    const excludedPaths = ["/access", "/api/auth/site-access", "/_next", "/favicon.ico", "/images", "/fonts"]
    const isExcluded = excludedPaths.some((path) => pathname.startsWith(path))

    if (!isExcluded) {
      const siteAccess = request.cookies.get("site_access")?.value
      if (siteAccess !== "granted") {
        return NextResponse.redirect(new URL("/access", request.url))
      }
    }
  }

  const response = await updateSession(request)

  // Protected routes check
  const protectedRoutes = [
    "/dashboard/admin",
    "/dashboard/member",
    "/dashboard/user",
    "/dashboard/broker",
    "/dashboard/owner",
    "/dashboard/notaria",
    "/dashboard/intermediary",
    "/dashboard/workspace",
    "/management",
    "/notaria",
    "/dashboard/service-provider",
    "/dashboard/vafi",
    "/dashboard/dao",
  ]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const { createServerClient } = await import("@supabase/ssr")

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      })

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const loginUrl = new URL("/auth", request.url)
        loginUrl.searchParams.set("next", request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // RBAC: Check role-based access
      const pathname = request.nextUrl.pathname

      // Get user's profile with role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile) {
        console.log("[v0] No profile found for user:", user.id)
        // Redirect to auth if profile doesn't exist
        return NextResponse.redirect(new URL("/auth?error=no_profile", request.url))
      }

      // Define role-based route permissions
      const roleRouteMap: Record<string, string[]> = {
        // Admin routes
        "/dashboard/admin": ["admin_super", "admin_ops", "admin_finance", "admin_compliance"],
        "/admin": ["admin_super", "admin_ops", "admin_finance", "admin_compliance"],

        // Holder/Member routes
        "/dashboard/holder": ["holder"],
        "/dashboard/member": ["holder"], // Legacy member route
        "/dashboard/user": ["holder"], // Legacy user route

        // Management routes
        "/dashboard/management": ["management"],
        "/management": ["management"],

        // Booking coordinator routes
        "/dashboard/booking": ["booking"],

        // Agent routes
        "/dashboard/agent": ["agent"],
        "/dashboard/broker": ["agent"], // Legacy broker route

        // Service provider routes
        "/dashboard/service-provider": ["service_provider_company"],

        // Insurance routes
        "/dashboard/insurance": ["insurance"],

        // Vendor routes
        "/dashboard/vendor": ["vendor"],

        // Review moderation routes
        "/dashboard/review-moderation": ["review_moderation"],

        // Track/Logistics routes
        "/dashboard/track": ["booking", "vendor", "admin_ops"],

        // Foundation routes
        "/dashboard/foundation": ["foundation", "admin_super"],

        // VA-FI routes
        "/dashboard/vafi": ["vafi", "admin_finance"],
        "/dashboard/dao": ["holder", "admin_super"],

        // Agency B2B routes
        "/dashboard/agency": ["agency_b2b"],

        // Support routes
        "/dashboard/support": ["support_l2", "admin_ops"],
      }

      // Check if current route requires specific role
      let isAuthorized = true
      let requiredRoles: string[] = []

      for (const [routePrefix, allowedRoles] of Object.entries(roleRouteMap)) {
        if (pathname.startsWith(routePrefix)) {
          requiredRoles = allowedRoles
          isAuthorized = allowedRoles.includes(profile.role)
          break
        }
      }

      if (!isAuthorized && requiredRoles.length > 0) {
        console.log("[v0] RBAC: Access denied for role:", profile.role, "to route:", pathname)

        // Redirect to user's appropriate dashboard
        const userDashboardMap: Record<string, string> = {
          admin_super: "/dashboard/admin",
          admin_ops: "/dashboard/admin",
          admin_finance: "/dashboard/admin",
          admin_compliance: "/dashboard/admin",
          holder: "/dashboard/holder",
          management: "/dashboard/management",
          booking: "/dashboard/booking",
          agent: "/dashboard/agent",
          service_provider_company: "/dashboard/service-provider",
          insurance: "/dashboard/insurance",
          vendor: "/dashboard/vendor",
          review_moderation: "/dashboard/review-moderation",
          foundation: "/dashboard/foundation",
          vafi: "/dashboard/vafi",
          agency_b2b: "/dashboard/agency",
          support_l2: "/dashboard/support",
        }

        const redirectPath = userDashboardMap[profile.role] || "/dashboard/holder"
        console.log("[v0] RBAC: Redirecting to:", redirectPath)
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }

      console.log("[v0] RBAC: Access granted for role:", profile.role, "to route:", pathname)
    }
  }

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("X-DNS-Prefetch-Control", "off")
  response.headers.set("X-Download-Options", "noopen")
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.conekta.io;",
    )
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
