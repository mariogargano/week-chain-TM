"use client"

import { useState, useEffect } from "react"
import { translations } from "./translations"
import type { Locale } from "./config"
import { defaultLocale, locales } from "./config"

/**
 * Unified i18n system - single source of truth
 * localStorage key: "locale"
 * Event: "localechange"
 */

export function getLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale
  const saved = localStorage.getItem("locale") as Locale
  if (saved && locales.includes(saved)) return saved

  // Detect from browser
  if (typeof navigator !== "undefined") {
    const nav = navigator.language.split("-")[0] as Locale
    if (locales.includes(nav)) return nav
  }
  return defaultLocale
}

export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLocaleState(getLocale())

    const handleLocaleChange = () => {
      setLocaleState(getLocale())
    }

    window.addEventListener("localechange", handleLocaleChange)
    window.addEventListener("storage", handleLocaleChange)
    return () => {
      window.removeEventListener("localechange", handleLocaleChange)
      window.removeEventListener("storage", handleLocaleChange)
    }
  }, [])

  // Return default on server/before mount to avoid hydration mismatch
  if (!mounted) return defaultLocale
  return locale
}

export function useTranslations() {
  const locale = useLocale()
  return translations[locale] || translations[defaultLocale]
}

export function setLocale(locale: Locale) {
  if (typeof window === "undefined") return
  if (!locales.includes(locale)) return

  localStorage.setItem("locale", locale)
  // Dispatch event so all components using useLocale/useTranslations re-render
  window.dispatchEvent(new CustomEvent("localechange", { detail: locale }))
}
