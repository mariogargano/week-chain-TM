"use client"

import { useEffect, useState } from "react"
import { detectLocale, type Locale } from "./locale"
import { defaultLocale } from "./config"
import { translations } from "./translations"
import { fmtDate, fmtCurrency, fmtNumber, fmtPercent, fmtDateTime, fmtRelativeTime } from "./format"

export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    setLocaleState(detectLocale())

    const handleLocaleChange = () => {
      setLocaleState(detectLocale())
    }

    window.addEventListener("localechange", handleLocaleChange)
    return () => window.removeEventListener("localechange", handleLocaleChange)
  }, [])

  const t = translations[locale] || translations[defaultLocale]

  const setLocale = (newLocale: Locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale)
      window.dispatchEvent(new Event("localechange"))
      window.location.reload()
    }
  }

  return {
    t,
    locale,
    setLocale,
    // Format helpers
    fmtDate: (d: Date) => fmtDate(d, locale),
    fmtCurrency: (n: number, currency?: string) => fmtCurrency(n, locale, currency),
    fmtNumber: (n: number) => fmtNumber(n, locale),
    fmtPercent: (n: number) => fmtPercent(n, locale),
    fmtDateTime: (d: Date) => fmtDateTime(d, locale),
    fmtRelativeTime: (d: Date) => fmtRelativeTime(d, locale),
  }
}
