import { translations as baseTranslations } from "./translations"

// Extender traducciones existentes con nuevas secciones
export const translationsExtended = {
  ...baseTranslations,
  es: {
    ...baseTranslations.es,
    properties: {
      title: "Propiedades Vacacionales Tokenizadas",
      subtitle: "Compra semanas de vacaciones con pagos flexibles",
      paymentMethods: "Acepta tarjetas, SPEI, transferencias y pago en Oxxo",
      search: "Buscar por ubicación, tipo de propiedad...",
      searchButton: "Buscar",
      available: "Propiedades Disponibles",
      found: "propiedades encontradas",
      noProperties: "No hay propiedades disponibles en este momento. ¡Vuelve pronto!",
      demoHighlight: "Propiedad Demo Destacada",
      demoBanner: "Estamos en fase BETA - Esta es una propiedad de demostración",
    },
    partnership: {
      badge: "Programa de Partnerships",
      title: "Construyamos el Futuro del Real Estate Juntos",
      subtitle:
        "Únete al ecosistema de tokenización inmobiliaria más innovador de Latinoamérica. Crea valor, genera ingresos y revoluciona el mercado vacacional.",
      ctaPrimary: "Quiero Participar al Programa",
      ctaSecondary: "Ver Pitch Deck",
      benefitsTitle: "Beneficios del Partnership",
      benefitsSubtitle: "Accede a un ecosistema completo de herramientas, tecnología y oportunidades",
      typesTitle: "Tipos de Partnership",
      typesSubtitle: "Soluciones personalizadas para cada tipo de socio estratégico",
      finalCTA: "¿Listo para Revolucionar el Mercado?",
      finalSubtitle:
        "Únete a WEEK-CHAIN™ y sé parte de la transformación del real estate vacacional. Agenda una reunión con nuestro equipo para explorar oportunidades de colaboración.",
    },
    about: {
      title: "Sobre WEEK-CHAIN™",
      mission: "Nuestra Misión",
      vision: "Nuestra Visión",
      values: "Nuestros Valores",
    },
    staff: {
      title: "Nuestro Equipo",
      subtitle: "Conoce a las personas detrás de WEEK-CHAIN™",
      founders: "Fundadores",
      team: "Equipo",
      advisors: "Asesores",
      partners: "Socios Estratégicos",
    },
  },
  en: {
    ...baseTranslations.en,
    properties: {
      title: "Tokenized Vacation Properties",
      subtitle: "Buy vacation weeks with flexible payments",
      paymentMethods: "Accepts cards, SPEI, transfers and Oxxo payment",
      search: "Search by location, property type...",
      searchButton: "Search",
      available: "Available Properties",
      found: "properties found",
      noProperties: "No properties available at this time. Come back soon!",
      demoHighlight: "Featured Demo Property",
      demoBanner: "We are in BETA phase - This is a demonstration property",
    },
    partnership: {
      badge: "Partnership Program",
      title: "Let's Build the Future of Real Estate Together",
      subtitle:
        "Join the most innovative real estate tokenization ecosystem in Latin America. Create value, generate income and revolutionize the vacation market.",
      ctaPrimary: "I Want to Join the Program",
      ctaSecondary: "View Pitch Deck",
      benefitsTitle: "Partnership Benefits",
      benefitsSubtitle: "Access a complete ecosystem of tools, technology and opportunities",
      typesTitle: "Partnership Types",
      typesSubtitle: "Customized solutions for each type of strategic partner",
      finalCTA: "Ready to Revolutionize the Market?",
      finalSubtitle:
        "Join WEEK-CHAIN™ and be part of the vacation real estate transformation. Schedule a meeting with our team to explore collaboration opportunities.",
    },
    about: {
      title: "About WEEK-CHAIN™",
      mission: "Our Mission",
      vision: "Our Vision",
      values: "Our Values",
    },
    staff: {
      title: "Our Team",
      subtitle: "Meet the people behind WEEK-CHAIN™",
      founders: "Founders",
      team: "Team",
      advisors: "Advisors",
      partners: "Strategic Partners",
    },
  },
  // Agregar traducciones para pt, fr, it...
}
