import { locales, defaultLocale, type Locale } from "./config"

/**
 * Read-only helpers for locale detection.
 * For reactive hooks and setLocale, use lib/i18n/use-translations.ts
 */

export function detectLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("locale") as Locale
    if (saved && locales.includes(saved)) return saved
  }

  if (typeof navigator !== "undefined") {
    const nav = navigator.language.split("-")[0] as Locale
    if (locales.includes(nav)) {
      if (typeof window !== "undefined") {
        localStorage.setItem("locale", nav)
      }
      return nav
    }
  }

  return defaultLocale
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("locale") as Locale
    if (saved && locales.includes(saved)) return saved
  }
  return defaultLocale
}

// Re-export setLocale from use-translations as the single source of truth
export { setLocale } from "./use-translations"
