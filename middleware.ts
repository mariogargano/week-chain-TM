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
      const userEmail = user.email?.toLowerCase() || ""

      // Admin email always gets full access
      if (userEmail === ADMIN_EMAIL.toLowerCase()) {
        // Admin email - full access granted
      } else {
        // Get user's role from users table (primary source)
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        const userRole = userData?.role || "user"

        // Define role-based route permissions using actual role names
        const roleRouteMap: Record<string, string[]> = {
          "/dashboard/admin": ["admin", "super_admin"],
          "/dashboard/member": ["user", "broker", "broker_elite", "dao_member", "property_owner", "staff", "admin", "super_admin"],
          "/dashboard/broker": ["broker", "broker_elite", "admin", "super_admin"],
          "/dashboard/management": ["management", "admin", "super_admin"],
          "/dashboard/notaria": ["notaria", "admin", "super_admin"],
          "/dashboard/of-counsel": ["of_counsel", "admin", "super_admin"],
          "/dashboard/service-provider": ["service_provider", "admin", "super_admin"],
          "/dashboard/vafi": ["vafi_manager", "admin", "super_admin"],
          "/dashboard/dao": ["dao_member", "user", "admin", "super_admin"],
          "/dashboard/owner": ["property_owner", "admin", "super_admin"],
          "/dashboard/staff": ["staff", "admin", "super_admin"],
          "/dashboard/user": ["user", "admin", "super_admin"],
          "/dashboard/intermediary": ["broker", "broker_elite", "admin", "super_admin"],
          "/management": ["management", "admin", "super_admin"],
          "/notaria": ["notaria", "admin", "super_admin"],
        }

        // Check if current route requires specific role
        let isAuthorized = true
        let requiredRoles: string[] = []

        for (const [routePrefix, allowedRoles] of Object.entries(roleRouteMap)) {
          if (pathname.startsWith(routePrefix)) {
            requiredRoles = allowedRoles
            isAuthorized = allowedRoles.includes(userRole)
            break
          }
        }

        if (!isAuthorized && requiredRoles.length > 0) {
          // Redirect to user's appropriate dashboard
          const userDashboardMap: Record<string, string> = {
            admin: "/dashboard/admin",
            super_admin: "/dashboard/admin",
            broker: "/dashboard/broker",
            broker_elite: "/dashboard/broker",
            management: "/dashboard/management",
            notaria: "/dashboard/notaria",
            of_counsel: "/dashboard/of-counsel",
            service_provider: "/dashboard/service-provider",
            vafi_manager: "/dashboard/vafi",
            dao_member: "/dashboard/dao",
            property_owner: "/dashboard/owner",
            staff: "/dashboard/member",
          }

          const redirectPath = userDashboardMap[userRole] || "/dashboard/member"
          return NextResponse.redirect(new URL(redirectPath, request.url))
        }
      }
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
