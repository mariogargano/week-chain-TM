"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTranslations, useLocale, setLocale as setLocaleFunc } from "./use-translations"
import type { Locale } from "./config"

/**
 * LEGACY wrapper for backwards compatibility.
 * Delegates to the unified useTranslations/useLocale system.
 * New code should import directly from "./use-translations".
 */

interface LanguageContextType {
  language: Locale
  setLanguage: (lang: Locale) => void
  t: ReturnType<typeof useTranslations>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useLocale()
  const t = useTranslations()

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: setLocaleFunc,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
