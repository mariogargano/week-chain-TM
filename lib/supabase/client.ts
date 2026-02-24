import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

const createMockClient = () => {
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
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
  }

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      onAuthStateChange: (callback: any) => {
        return {
          data: { subscription: { unsubscribe: () => {} } },
        }
      },
    },
    from: () => mockQueryBuilder,
  } as any
}

// Ensure env vars are accessed correctly in the browser
const getSupabaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}

const getSupabaseAnonKey = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | any = null

export function createBrowserClient(url?: string, key?: string) {
  const effectiveUrl = url && !url.includes("!") ? url : supabaseUrl
  const effectiveKey = key && !key.includes("!") ? key : supabaseAnonKey

  if (!effectiveUrl || !effectiveKey || effectiveUrl.startsWith("http://localhost") === false && effectiveUrl.includes("supabase.co") === false) {
    // Supabase credentials missing or invalid - using mock client
    if (!browserClient) {
      browserClient = createMockClient()
    }
    return browserClient
  }

  // Return existing instance if already created (singleton pattern)
  if (browserClient && !url && !key) {
    return browserClient
  }

  // Create new client
  browserClient = createSupabaseBrowserClient(effectiveUrl, effectiveKey, {
    cookies: {
      get(name: string) {
        if (typeof document === "undefined") return undefined
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift()
      },
      set(name: string, value: string, options: any) {
        if (typeof document === "undefined") return
        document.cookie = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge};` : ""}`
      },
      remove(name: string, options: any) {
        if (typeof document === "undefined") return
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
      },
    },
  })

  return browserClient
}

// Mantener compatibilidad con código existente
export function createClient() {
  return createBrowserClient()
}
