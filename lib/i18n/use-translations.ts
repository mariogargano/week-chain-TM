"use client"

import { useState, useEffect } from "react"
import { translations } from "./translations"
import type { Locale } from "./config"
import { defaultLocale } from "./config"
import { detectLocale } from "./locale"

export function useTranslations() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLocaleState(detectLocale())

    const handleLocaleChange = () => {
      setLocaleState(detectLocale())
    }

    window.addEventListener("localechange", handleLocaleChange)
    return () => window.removeEventListener("localechange", handleLocaleChange)
  }, [])

  // This ensures consistent server/client rendering
  if (!mounted) {
    return translations[defaultLocale]
  }

  return translations[locale] || translations[defaultLocale]
}

export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    setLocaleState(detectLocale())

    const handleLocaleChange = () => {
      setLocaleState(detectLocale())
    }

    window.addEventListener("localechange", handleLocaleChange)
    return () => window.removeEventListener("localechange", handleLocaleChange)
  }, [])

  return locale
}

export function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale)
    // Dispatch custom event to trigger re-renders without page reload
    window.dispatchEvent(new CustomEvent("localechange", { detail: locale }))

    // Use Next.js router refresh instead of full page reload for smoother transition
    // This triggers a soft refresh that updates the UI without losing state
    if (typeof window !== "undefined" && window.location) {
      // Small delay to allow state to update, then soft refresh
      setTimeout(() => {
        window.dispatchEvent(new Event("localechange"))
        // Force React to re-render by updating URL with same path
        const url = new URL(window.location.href)
        url.searchParams.set("_locale", locale)
        window.history.replaceState({}, "", url.pathname + url.search)
        // Remove the param immediately to keep URL clean
        url.searchParams.delete("_locale")
        window.history.replaceState({}, "", url.pathname + (url.search || ""))
      }, 50)
    }
  }
}
