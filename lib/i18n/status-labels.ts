// Status label translations for consistent UI display
// Maps status enums to translated user-friendly labels

type Locale = "es-MX" | "en-US" | "it-IT"

// Booking/Reservation status labels
export function getBookingStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    pending: {
      "es-MX": "Pendiente",
      "en-US": "Pending",
      "it-IT": "In attesa",
    },
    confirmed: {
      "es-MX": "Confirmada",
      "en-US": "Confirmed",
      "it-IT": "Confermata",
    },
    cancelled: {
      "es-MX": "Cancelada",
      "en-US": "Cancelled",
      "it-IT": "Annullata",
    },
    completed: {
      "es-MX": "Completada",
      "en-US": "Completed",
      "it-IT": "Completata",
    },
    draft: {
      "es-MX": "Borrador",
      "en-US": "Draft",
      "it-IT": "Bozza",
    },
    submitted: {
      "es-MX": "Enviada",
      "en-US": "Submitted",
      "it-IT": "Inviata",
    },
    reviewing: {
      "es-MX": "En revisión",
      "en-US": "Under review",
      "it-IT": "In revisione",
    },
    offers_sent: {
      "es-MX": "Ofertas enviadas",
      "en-US": "Offers sent",
      "it-IT": "Offerte inviate",
    },
    accepted: {
      "es-MX": "Aceptada",
      "en-US": "Accepted",
      "it-IT": "Accettata",
    },
    expired: {
      "es-MX": "Expirada",
      "en-US": "Expired",
      "it-IT": "Scaduta",
    },
  }

  return labels[status]?.[locale] || status
}

// Payment status labels
export function getPaymentStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    held: {
      "es-MX": "Retenido",
      "en-US": "Held",
      "it-IT": "Trattenuto",
    },
    settled: {
      "es-MX": "Liquidado",
      "en-US": "Settled",
      "it-IT": "Liquidato",
    },
    refunded: {
      "es-MX": "Reembolsado",
      "en-US": "Refunded",
      "it-IT": "Rimborsato",
    },
    failed: {
      "es-MX": "Fallido",
      "en-US": "Failed",
      "it-IT": "Fallito",
    },
    pending: {
      "es-MX": "Pendiente",
      "en-US": "Pending",
      "it-IT": "In attesa",
    },
    completed: {
      "es-MX": "Completado",
      "en-US": "Completed",
      "it-IT": "Completato",
    },
  }

  return labels[status]?.[locale] || status
}

// KYC status labels
export function getKYCStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    not_started: {
      "es-MX": "No iniciado",
      "en-US": "Not started",
      "it-IT": "Non iniziato",
    },
    pending: {
      "es-MX": "Pendiente",
      "en-US": "Pending",
      "it-IT": "In attesa",
    },
    approved: {
      "es-MX": "Aprobado",
      "en-US": "Approved",
      "it-IT": "Approvato",
    },
    rejected: {
      "es-MX": "Rechazado",
      "en-US": "Rejected",
      "it-IT": "Rifiutato",
    },
    requires_review: {
      "es-MX": "Requiere revisión",
      "en-US": "Requires review",
      "it-IT": "Richiede revisione",
    },
  }

  return labels[status]?.[locale] || status
}

// User status labels
export function getUserStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    active: {
      "es-MX": "Activo",
      "en-US": "Active",
      "it-IT": "Attivo",
    },
    suspended: {
      "es-MX": "Suspendido",
      "en-US": "Suspended",
      "it-IT": "Sospeso",
    },
    pending_kyc: {
      "es-MX": "KYC pendiente",
      "en-US": "KYC pending",
      "it-IT": "KYC in attesa",
    },
    archived: {
      "es-MX": "Archivado",
      "en-US": "Archived",
      "it-IT": "Archiviato",
    },
  }

  return labels[status]?.[locale] || status
}

// Contract status labels
export function getContractStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    pending: {
      "es-MX": "Pendiente",
      "en-US": "Pending",
      "it-IT": "In attesa",
    },
    signed: {
      "es-MX": "Firmado",
      "en-US": "Signed",
      "it-IT": "Firmato",
    },
    certified: {
      "es-MX": "Certificado",
      "en-US": "Certified",
      "it-IT": "Certificato",
    },
    minted: {
      "es-MX": "NFT creado",
      "en-US": "NFT minted",
      "it-IT": "NFT coniato",
    },
  }

  return labels[status]?.[locale] || status
}

// Refund status labels
export function getRefundStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    pending: {
      "es-MX": "Pendiente",
      "en-US": "Pending",
      "it-IT": "In attesa",
    },
    approved: {
      "es-MX": "Aprobado",
      "en-US": "Approved",
      "it-IT": "Approvato",
    },
    executed: {
      "es-MX": "Ejecutado",
      "en-US": "Executed",
      "it-IT": "Eseguito",
    },
    rejected: {
      "es-MX": "Rechazado",
      "en-US": "Rejected",
      "it-IT": "Rifiutato",
    },
  }

  return labels[status]?.[locale] || status
}

// Payout status labels
export function getPayoutStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    pending: {
      "es-MX": "Pendiente",
      "en-US": "Pending",
      "it-IT": "In attesa",
    },
    approved: {
      "es-MX": "Aprobado",
      "en-US": "Approved",
      "it-IT": "Approvato",
    },
    paid: {
      "es-MX": "Pagado",
      "en-US": "Paid",
      "it-IT": "Pagato",
    },
    rejected: {
      "es-MX": "Rechazado",
      "en-US": "Rejected",
      "it-IT": "Rifiutato",
    },
  }

  return labels[status]?.[locale] || status
}

// Loan status labels (VA-FI)
export function getLoanStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    draft: {
      "es-MX": "Borrador",
      "en-US": "Draft",
      "it-IT": "Bozza",
    },
    signed: {
      "es-MX": "Firmado",
      "en-US": "Signed",
      "it-IT": "Firmato",
    },
    funded: {
      "es-MX": "Financiado",
      "en-US": "Funded",
      "it-IT": "Finanziato",
    },
    repaid: {
      "es-MX": "Pagado",
      "en-US": "Repaid",
      "it-IT": "Rimborsato",
    },
    default: {
      "es-MX": "En mora",
      "en-US": "Default",
      "it-IT": "Insolvente",
    },
  }

  return labels[status]?.[locale] || status
}

// Review status labels
export function getReviewStatusLabel(status: string, locale: Locale = "es-MX"): string {
  const labels: Record<string, Record<Locale, string>> = {
    pending: {
      "es-MX": "Pendiente moderación",
      "en-US": "Pending moderation",
      "it-IT": "In attesa di moderazione",
    },
    approved: {
      "es-MX": "Aprobada",
      "en-US": "Approved",
      "it-IT": "Approvata",
    },
    rejected: {
      "es-MX": "Rechazada",
      "en-US": "Rejected",
      "it-IT": "Rifiutata",
    },
    flagged: {
      "es-MX": "Marcada",
      "en-US": "Flagged",
      "it-IT": "Segnalata",
    },
  }

  return labels[status]?.[locale] || status
}

// Generic status badge color helper
export function getStatusBadgeColor(status: string): string {
  const colorMap: Record<string, string> = {
    // Success states
    approved: "bg-green-100 text-green-800 border-green-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    active: "bg-green-100 text-green-800 border-green-200",
    settled: "bg-green-100 text-green-800 border-green-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    minted: "bg-green-100 text-green-800 border-green-200",
    funded: "bg-green-100 text-green-800 border-green-200",
    repaid: "bg-green-100 text-green-800 border-green-200",
    executed: "bg-green-100 text-green-800 border-green-200",
    signed: "bg-green-100 text-green-800 border-green-200",
    certified: "bg-green-100 text-green-800 border-green-200",

    // Pending states
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    submitted: "bg-yellow-100 text-yellow-800 border-yellow-200",
    reviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending_kyc: "bg-yellow-100 text-yellow-800 border-yellow-200",
    held: "bg-yellow-100 text-yellow-800 border-yellow-200",
    not_started: "bg-yellow-100 text-yellow-800 border-yellow-200",
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",

    // Warning states
    requires_review: "bg-orange-100 text-orange-800 border-orange-200",
    flagged: "bg-orange-100 text-orange-800 border-orange-200",

    // Error states
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
    refunded: "bg-red-100 text-red-800 border-red-200",
    default: "bg-red-100 text-red-800 border-red-200",
    expired: "bg-red-100 text-red-800 border-red-200",

    // Neutral states
    archived: "bg-gray-100 text-gray-800 border-gray-200",
    offers_sent: "bg-blue-100 text-blue-800 border-blue-200",
    accepted: "bg-blue-100 text-blue-800 border-blue-200",
  }

  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200"
}
