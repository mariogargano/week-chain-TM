"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function useRequireAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [kycStatus, setKycStatus] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Check KYC status
        const { data: kycData } = await supabase.from("kyc_users").select("status").eq("email", user.email).single()

        setKycStatus(kycData?.status || null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const requireAuth = (action = "continue") => {
    return {
      isAuthenticated: !!user,
      hasKYC: kycStatus === "approved",
      kycStatus,
      user,
      action,
    }
  }

  return { user, loading, kycStatus, requireAuth, checkAuth }
}
