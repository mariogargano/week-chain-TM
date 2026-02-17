// ============================================
// EMAIL CONFIGURATION
// Central configuration for email system
// ============================================

export const EMAIL_CONFIG = {
  // Provider settings
  provider: "resend" as const,

  // From addresses
  from: {
    default: "WEEK-CHAIN <soporte@week-chain.com>",
    noreply: "WEEK-CHAIN <noreply@week-chain.com>",
    support: "Soporte WEEK-CHAIN <soporte@week-chain.com>",
    owners: "WEEK-CHAIN Propietarios <owners@week-chain.com>",
  },

  // Reply-to addresses
  replyTo: {
    default: "soporte@week-chain.com",
    support: "soporte@week-chain.com",
    owners: "owners@week-chain.com",
  },

  // Rate limiting
  rateLimit: {
    testEmails: {
      maxPerHour: 100,
      maxPerDay: 500,
    },
    automated: {
      maxPerMinute: 60,
      maxPerHour: 3000,
    },
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMs: [1000, 5000, 15000], // 1s, 5s, 15s
  },

  // Template configuration
  templates: {
    autoSaveIntervalMs: 30000, // 30 seconds
    maxVariablesPerTemplate: 50,
    maxBodyLength: 100000, // 100KB
  },

  // Analytics
  analytics: {
    refreshIntervalMs: 3600000, // 1 hour
    defaultLookbackDays: 30,
  },

  // Tracking
  tracking: {
    openTracking: true,
    clickTracking: true,
    linkTracking: true,
  },

  // URLs
  urls: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.week-chain.com",
    adminDashboard: "/dashboard/admin",
    userDashboard: "/dashboard/user",
    unsubscribe: "/api/emails/unsubscribe",
  },

  // Company info (for footer)
  company: {
    name: "WEEK-CHAIN",
    email: "soporte@week-chain.com",
    phone: "+52 55 1234 5678",
    whatsapp: "+52 55 1234 5678",
    address: "Ciudad de México, México",
    website: "https://www.week-chain.com",
  },

  // Feature flags
  features: {
    enableTestMode: process.env.NODE_ENV !== "production",
    enableAnalytics: true,
    enableUnsubscribe: true,
    enableVersioning: true,
  },
} as const

// ============================================
// VARIABLE GROUPS
// For UI organization in variable picker
// ============================================

export const VARIABLE_GROUPS = {
  user: {
    label: "Usuario",
    icon: "👤",
    variables: ["user_first_name", "user_last_name", "user_full_name", "user_email"],
  },
  certificate: {
    label: "Certificado",
    icon: "📜",
    variables: [
      "certificate_number",
      "certificate_tier",
      "certificate_pax",
      "certificate_start_date",
      "certificate_end_date",
      "certificate_qr_url",
    ],
  },
  booking: {
    label: "Reserva",
    icon: "📅",
    variables: [
      "booking_number",
      "booking_status",
      "requested_destination",
      "check_in_date",
      "check_out_date",
      "guests_count",
    ],
  },
  property: {
    label: "Propiedad",
    icon: "🏠",
    variables: [
      "property_name",
      "property_address",
      "property_destination",
      "property_pax",
      "property_bedrooms",
      "property_bathrooms",
      "property_amenities",
      "property_photos",
      "property_check_in_time",
      "property_check_out_time",
      "property_access_instructions",
      "property_rating",
    ],
  },
  offer: {
    label: "Oferta",
    icon: "🎁",
    variables: ["offer_expires_at", "offer_accept_url", "hours_until_expiry"],
  },
  owner: {
    label: "Propietario",
    icon: "🏘️",
    variables: [
      "owner_first_name",
      "owner_last_name",
      "owner_property_name",
      "owner_earnings_amount",
      "owner_payout_period",
    ],
  },
  payment: {
    label: "Pago",
    icon: "💳",
    variables: ["payment_amount", "payment_method", "payment_date"],
  },
  review: {
    label: "Reseña",
    icon: "⭐",
    variables: ["review_rating", "review_comment", "review_url"],
  },
  company: {
    label: "Empresa",
    icon: "🏢",
    variables: [
      "company_name",
      "company_email",
      "company_phone",
      "company_whatsapp",
      "site_url",
      "support_url",
      "unsubscribe_url",
    ],
  },
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get from address based on template type
 */
export function getFromAddress(templateType: string): string {
  if (templateType.startsWith("OWNER_")) {
    return EMAIL_CONFIG.from.owners
  }
  return EMAIL_CONFIG.from.default
}

/**
 * Get reply-to address based on template type
 */
export function getReplyToAddress(templateType: string): string {
  if (templateType.startsWith("OWNER_")) {
    return EMAIL_CONFIG.replyTo.owners
  }
  return EMAIL_CONFIG.replyTo.default
}

/**
 * Generate unsubscribe URL
 */
export function getUnsubscribeUrl(email: string): string {
  const encoded = encodeURIComponent(email)
  return `${EMAIL_CONFIG.urls.siteUrl}${EMAIL_CONFIG.urls.unsubscribe}?email=${encoded}`
}

/**
 * Check if test mode is enabled
 */
export function isTestMode(): boolean {
  return EMAIL_CONFIG.features.enableTestMode
}
