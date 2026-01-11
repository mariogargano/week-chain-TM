"use client"

import type React from "react"
import { SiteFooter } from "@/components/site-footer"
import { Navbar } from "@/components/navbar"
import { PostHogProvider } from "@/lib/analytics/posthog-provider"
import { ScrollToTop } from "@/components/scroll-to-top"
import { useLocale } from "@/lib/i18n/use-translations"
import { LanguageProvider } from "@/lib/i18n/use-language"
import { SupportChatbot } from "@/components/support-chatbot"
import { OrganizationJsonLd, WebsiteJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { MicrosoftClarity } from "@/components/analytics/microsoft-clarity"
import { BetaBanner } from "@/components/beta-banner"
import { ComplianceBanner } from "@/components/compliance-banner"

interface RootLayoutClientProps {
  children: React.ReactNode
  interVariable: string
}

export function RootLayoutClient({ children, interVariable }: RootLayoutClientProps) {
  const locale = useLocale()

  return (
    <html lang={locale} className={interVariable}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <LocalBusinessJsonLd />
        <GoogleAnalytics />
        <MicrosoftClarity />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Saltar al contenido principal
        </a>
        <PostHogProvider>
          <LanguageProvider>
            <ComplianceBanner />
            <BetaBanner />
            <ScrollToTop />
            <Navbar />
            <main id="main-content" className="min-h-[calc(100vh-4rem)] pt-20">
              {children}
            </main>
            <SiteFooter />
            <SupportChatbot />
          </LanguageProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
