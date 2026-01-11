import type { Metadata } from "next"
import HomePageClient from "./HomePageClient"

export { default as HomePageClient } from "./HomePageClient"

export const metadata: Metadata = {
  title: "WEEK-CHAIN™ | Smart Vacational Certificates en México",
  description:
    "Descubre WEEK-CHAIN: Smart Vacational Certificates (SVC) que otorgan derecho de solicitud de uso vacacional por 15 años en destinos participantes. No constituye propiedad inmobiliaria. 100% conforme NOM-151 y PROFECO.",
  alternates: {
    canonical: "https://www.week-chain.com",
  },
  keywords: [
    "smart vacational certificates",
    "certificados vacacionales México",
    "derecho de uso temporal",
    "uso vacacional legal",
    "WEEK-CHAIN",
    "NOM-151",
    "PROFECO",
    "sistema de acceso vacacional",
  ],
  openGraph: {
    title: "WEEK-CHAIN™ | Smart Vacational Certificates",
    description:
      "Adquiere certificados que otorgan derecho de solicitud de uso vacacional por 15 años. No constituye propiedad inmobiliaria. 100% conforme NOM-151.",
    url: "https://www.week-chain.com",
    type: "website",
    locale: "es_MX",
    siteName: "WEEK-CHAIN",
  },
  twitter: {
    card: "summary_large_image",
    title: "WEEK-CHAIN™ | Smart Vacational Certificates",
    description: "Certificados de derecho de solicitud de uso vacacional. 15 años en red de destinos participantes.",
    creator: "@weekchain",
    site: "@weekchain",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
