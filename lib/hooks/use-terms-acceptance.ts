"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/config/logger"

export function useTermsAcceptance() {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkTermsAcceptance()
  }, [])

  const checkTermsAcceptance = async () => {
    try {
      const localAcceptance = localStorage.getItem("terms_accepted")
      if (localAcceptance === "true") {
        setHasAccepted(true)
        setIsLoading(false)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setHasAccepted(false)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("terms_acceptance")
        .select("id")
        .eq("user_id", user.id)
        .order("accepted_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          logger.warn("terms_acceptance table does not exist - using localStorage only")
          setHasAccepted(localAcceptance === "true")
          setIsLoading(false)
          return
        }
        logger.error("Error checking terms acceptance:", error)
      }

      const accepted = !!data
      setHasAccepted(accepted)

      if (accepted) {
        localStorage.setItem("terms_accepted", "true")
      }
    } catch (error) {
      logger.error("Error in checkTermsAcceptance:", error)
      const localAcceptance = localStorage.getItem("terms_accepted")
      setHasAccepted(localAcceptance === "true")
    } finally {
      setIsLoading(false)
    }
  }

  const acceptTerms = async (termsVersion = "1.0") => {
    try {
      logger.debug("Accepting terms version:", termsVersion)

      localStorage.setItem("terms_accepted", "true")
      localStorage.setItem("terms_version", termsVersion)
      localStorage.setItem("terms_accepted_at", new Date().toISOString())

      const response = await fetch("/api/legal/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terms_version: termsVersion }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        let errorData: any = {}

        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json()
        } else {
          const text = await response.text()
          errorData = { error: text || `HTTP ${response.status}` }
        }

        if (errorData.warning || (errorData.error && errorData.error.includes("does not exist"))) {
          logger.warn("Terms saved locally only:", errorData.warning || errorData.error)
          setHasAccepted(true)
          return true
        }

        logger.error("Failed to accept terms:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })

        throw new Error(errorData.error || errorData.details || "Failed to accept terms")
      }

      const result = await response.json()
      logger.info("Terms accepted successfully:", result)

      setHasAccepted(true)
      return true
    } catch (error) {
      logger.warn("Terms acceptance API failed but saved locally:", error instanceof Error ? error.message : error)
      setHasAccepted(true)
      return true
    }
  }

  return { hasAccepted, isLoading, acceptTerms, checkTermsAcceptance }
}
