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
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      csv: () => mockQueryBuilder,
      then: (resolve: any) => resolve({ data: null, error: null }),
      insert: () => mockQueryBuilder,
      update: () => mockQueryBuilder,
      upsert: () => mockQueryBuilder,
      delete: () => mockQueryBuilder,
      rpc: () => Promise.resolve({ data: null, error: null }),
    }

    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => mockQueryBuilder,
      rpc: () => Promise.resolve({ data: null, error: null }),
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
    console.warn("[v0] Service role credentials missing - using mock client")
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
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      csv: () => mockQueryBuilder,
      then: (resolve: any) => resolve({ data: null, error: null }),
      insert: () => mockQueryBuilder,
      update: () => mockQueryBuilder,
      upsert: () => mockQueryBuilder,
      delete: () => mockQueryBuilder,
      rpc: () => Promise.resolve({ data: null, error: null }),
    }

    return {
      auth: {
        admin: {
          getUserById: () => Promise.resolve({ data: { user: null }, error: null }),
          listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
          updateUserById: () => Promise.resolve({ data: { user: null }, error: null }),
        },
      },
      from: () => mockQueryBuilder,
      rpc: () => Promise.resolve({ data: null, error: null }),
    } as any
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
