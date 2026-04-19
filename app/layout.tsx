import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { RootLayoutClient } from "./_root-layout-client"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.week-chain.com"),
  title: {
    default: "WEEK-CHAIN™ | Certificados de Servicios Vacacionales en México",
    template: "%s | WEEK-CHAIN",
  },
  description:
    "Descubre WEEK-CHAIN: certificados de servicios vacacionales en destinos premium de México. Disfruta de 15 años de experiencias únicas en Cancún, Tulum, Playa del Carmen y Los Cabos. Sistema innovador, transparente y 100% protegido.",
  keywords: [
    "certificados vacacionales",
    "servicios vacacionales México",
    "vacaciones Cancún",
    "vacaciones Tulum",
    "vacaciones Los Cabos",
    "derechos de uso vacacional",
    "WEEK-CHAIN",
    "vacaciones premium",
    "PROFECO",
    "turismo México",
    "Playa del Carmen",
    "Puerto Vallarta",
  ],
  authors: [{ name: "WEEK-CHAIN", url: "https://www.week-chain.com" }],
  creator: "WEEK-CHAIN",
  publisher: "WEEK-CHAIN",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://www.week-chain.com",
    siteName: "WEEK-CHAIN",
    title: "WEEK-CHAIN™ | Certificados de Servicios Vacacionales",
    description:
      "Sistema innovador de certificados vacacionales. 15 años de experiencias en destinos premium de México. Transparente, seguro y protegido.",
    images: [
      {
        url: "/weekchain-logo.png",
        width: 1024,
        height: 1024,
        alt: "WEEK-CHAIN - Certificados de Servicios Vacacionales",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WEEK-CHAIN™ | Certificados de Servicios Vacacionales",
    description: "15 años de experiencias únicas en destinos premium de México. Sistema innovador y protegido.",
    creator: "@weekchain",
    site: "@weekchain",
    images: ["/weekchain-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.week-chain.com",
    languages: {
      "es-MX": "https://www.week-chain.com",
    },
  },
  category: "Tourism",
  classification: "Business",
  referrer: "origin-when-cross-origin",
  icons: {
    icon: [
      { url: "/weekchain-logo.png", type: "image/png" },
      { url: "/weekchain-logo.png", type: "image/png", sizes: "192x192" },
      { url: "/weekchain-logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/weekchain-logo.png",
    apple: [
      { url: "/weekchain-logo.png", type: "image/png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RootLayoutClient interVariable={inter.variable}>{children}</RootLayoutClient>
}
