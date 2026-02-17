import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.week-chain.com"
  const currentDate = new Date()

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/properties", priority: 0.95, changeFrequency: "daily" as const },
    { path: "/brokers", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/broker-elite", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/partnership", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/roadmap", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/valuation", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/pitch", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/auth", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/auth/login", priority: 0.5, changeFrequency: "yearly" as const },
    // Legal pages
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/disclaimer", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/cookies", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/cancellation", priority: 0.4, changeFrequency: "yearly" as const },
  ]

  return staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
