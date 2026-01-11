import type { Locale } from "./config"

export const fmtDate = (d: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(d)

export const fmtCurrency = (n: number, locale: Locale, currency = "USD") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(n)

export const fmtNumber = (n: number, locale: Locale) => new Intl.NumberFormat(locale).format(n)

export const fmtPercent = (n: number, locale: Locale) =>
  new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 2 }).format(n)

export const fmtDateTime = (d: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)

export const fmtRelativeTime = (d: Date, locale: Locale) => {
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (days > 0) return rtf.format(-days, "day")
  if (hours > 0) return rtf.format(-hours, "hour")
  if (minutes > 0) return rtf.format(-minutes, "minute")
  return rtf.format(-seconds, "second")
}
