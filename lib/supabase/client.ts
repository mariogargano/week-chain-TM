import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

const createMockClient = () => {
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
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        order: () => ({
          limit: () => ({ data: [], error: null }),
        }),
        limit: async () => ({ data: [], error: null }),
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }),
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

export function createBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase credentials missing - using mock client:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    if (!browserClient) {
      browserClient = createMockClient()
    }
    return browserClient
  }

  // Return existing instance if already created (singleton pattern)
  if (browserClient) {
    return browserClient
  }

  // Create new client
  browserClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
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

  console.log("[v0] Supabase client initialized successfully")
  return browserClient
}

// Mantener compatibilidad con código existente
export function createClient() {
  return createBrowserClient()
}
