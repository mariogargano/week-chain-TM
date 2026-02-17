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
        url: "https://www.week-chain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WEEK-CHAIN - Certificados de Servicios Vacacionales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WEEK-CHAIN™ | Certificados de Servicios Vacacionales",
    description: "15 años de experiencias únicas en destinos premium de México. Sistema innovador y protegido.",
    creator: "@weekchain",
    site: "@weekchain",
    images: ["https://www.week-chain.com/og-image.jpg"],
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.jpg", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.jpg", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RootLayoutClient interVariable={inter.variable}>{children}</RootLayoutClient>
}
