export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WEEK-CHAIN",
    alternateName: "WEEK-CHAIN™",
    url: "https://weekchain.com",
    logo: "https://weekchain.com/logo.png",
    description:
      "Plataforma de certificados vacacionales inteligentes. Compra semanas vacacionales en alojamientos de lujo en México respaldadas por certificados digitales verificados.",
    foundingDate: "2024",
    founders: [
      {
        "@type": "Person",
        name: "WEEK-CHAIN Team",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "MX",
      addressLocality: "Ciudad de México",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English"],
      email: "soporte@weekchain.com",
    },
    sameAs: [
      "https://twitter.com/weekchain",
      "https://facebook.com/weekchain",
      "https://linkedin.com/company/weekchain",
      "https://instagram.com/weekchain",
    ],
    areaServed: {
      "@type": "Country",
      name: "Mexico",
    },
    knowsAbout: [
      "Smart Vacational Certificate",
      "Vacation Access Rights",
      "Luxury Vacation Rentals",
      "Digital Certificates",
      "Vacation Usage Rights",
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WEEK-CHAIN",
    alternateName: "WEEK-CHAIN™",
    url: "https://weekchain.com",
    description: "Plataforma de certificados vacacionales inteligentes en alojamientos de lujo en México",
    inLanguage: "es-MX",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://weekchain.com/properties?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "USD",
  availability = "InStock",
  url,
}: {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  url: string
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
      seller: {
        "@type": "Organization",
        name: "WEEK-CHAIN",
      },
    },
    brand: {
      "@type": "Brand",
      name: "WEEK-CHAIN",
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "WEEK-CHAIN",
    description:
      "Plataforma de certificados vacacionales inteligentes. Semanas vacacionales en alojamientos de lujo en México.",
    url: "https://weekchain.com",
    logo: "https://weekchain.com/logo.png",
    image: "https://weekchain.com/og-image.jpg",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "19.4326",
      longitude: "-99.1332",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    areaServed: [
      { "@type": "City", name: "Cancún" },
      { "@type": "City", name: "Tulum" },
      { "@type": "City", name: "Playa del Carmen" },
      { "@type": "City", name: "Los Cabos" },
      { "@type": "City", name: "Puerto Vallarta" },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
