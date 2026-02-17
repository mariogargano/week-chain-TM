import { locales, defaultLocale, type Locale } from "./config"

export function detectLocale(): Locale {
  // Check localStorage first
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("locale") as Locale
    if (saved && locales.includes(saved)) return saved
  }

  // Check browser language
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

export function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale)
    window.dispatchEvent(new Event("localechange"))
    // Reload page to apply new locale
    window.location.reload()
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("locale") as Locale
    if (saved && locales.includes(saved)) return saved
  }
  return defaultLocale
}
