export const locales = ["es", "en", "it", "fr"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "es"

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
  it: "Italiano",
  fr: "Français",
}

export const localeFlags: Record<Locale, string> = {
  es: "🇲🇽",
  en: "🇺🇸",
  it: "🇮🇹",
  fr: "🇫🇷",
}
