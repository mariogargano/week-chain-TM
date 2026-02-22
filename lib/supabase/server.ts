import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

async function createSupabaseServerClientWithCookies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase credentials not found. Returning mock client.")
    const mockQueryBuilder: any = {
      select: () => mockQueryBuilder,
      eq: () => mockQueryBuilder,
      neq: () => mockQueryBuilder,
      gt: () => mockQueryBuilder,
      lt: () => mockQueryBuilder,
      gte: () => mockQueryBuilder,
      lte: () => mockQueryBuilder,
      like: () => mockQueryBuilder,
      ilike: () => mockQueryBuilder,
      is: () => mockQueryBuilder,
      in: () => mockQueryBuilder,
      contains: () => mockQueryBuilder,
      containedBy: () => mockQueryBuilder,
      rangeGt: () => mockQueryBuilder,
      rangeGte: () => mockQueryBuilder,
      rangeLt: () => mockQueryBuilder,
      rangeLte: () => mockQueryBuilder,
      rangeAdjacent: () => mockQueryBuilder,
      overlaps: () => mockQueryBuilder,
      match: () => mockQueryBuilder,
      not: () => mockQueryBuilder,
      or: () => mockQueryBuilder,
      filter: () => mockQueryBuilder,
      order: () => mockQueryBuilder,
      limit: () => mockQueryBuilder,
      range: () => mockQueryBuilder,
      abortSignal: () => mockQueryBuilder,
      single: () => Promise.resolve({ data: null, error: null, count: 0 }),
      maybeSingle: () => Promise.resolve({ data: null, error: null, count: 0 }),
      then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
    }

    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => mockQueryBuilder,
    } as any
  }

  const cookieStore = await cookies()

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[v0] Service role credentials not found. URL:", !!supabaseUrl, "Key:", !!supabaseServiceRoleKey)
    throw new Error("Service role credentials not configured")
  }

  // Use @supabase/supabase-js createClient for service role (bypasses RLS)
  return createSupabaseJsClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export as both names for compatibility
export const createClient = createSupabaseServerClientWithCookies
export const createServerClient = createSupabaseServerClientWithCookies
export const createServerSupabaseClient = createSupabaseServerClientWithCookies
