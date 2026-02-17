// ============================================
// EMAIL TYPES
// TypeScript definitions for Email Automation System
// ============================================

export type EmailTemplateType =
  | "REQUEST_RECEIVED"
  | "OFFER_SENT"
  | "OFFER_ACCEPTED"
  | "OFFER_EXPIRED"
  | "OFFER_DECLINED"
  | "PRE_ARRIVAL"
  | "POST_CHECKOUT"
  | "PAYMENT_CONFIRMATION"
  | "CERTIFICATE_ISSUED"
  | "OWNER_BOOKING_NOTIFICATION"
  | "OWNER_PAYOUT_NOTIFICATION"
  | "OWNER_NEW_REVIEW"
  | "SYSTEM_ALERT"

export type EmailTemplateStatus = "draft" | "published" | "archived"

export interface EmailTemplate {
  id: string
  name: string
  type: EmailTemplateType
  subject: string
  body_html: string
  body_json: any // TipTap JSON
  variables: string[]
  status: EmailTemplateStatus
  version: number
  is_active: boolean
  description?: string
  tags: string[]
  preview_text?: string
  created_by?: string
  created_at: string
  updated_at: string
  published_at?: string
}

export interface EmailLog {
  id: string
  template_id?: string
  template_type: EmailTemplateType
  recipient_email: string
  recipient_name?: string
  user_id?: string
  subject: string
  body_html: string
  sent_at: string
  provider: "resend" | "sendgrid" | "ses"
  provider_message_id?: string

  // Tracking
  opened_at?: string
  first_opened_at?: string
  open_count: number
  clicked_at?: string
  first_clicked_at?: string
  click_count: number
  clicked_links: string[]

  bounced: boolean
  bounced_at?: string
  bounce_type?: "hard" | "soft" | "complaint"
  bounce_reason?: string

  unsubscribed: boolean
  unsubscribed_at?: string

  // Error
  failed: boolean
  error_message?: string
  retry_count: number

  metadata: Record<string, any>
  created_at: string
}

export interface TemplateVariables {
  // User variables
  user_first_name?: string
  user_last_name?: string
  user_email?: string
  user_full_name?: string

  // Certificate variables
  certificate_number?: string
  certificate_tier?: string
  certificate_pax?: number
  certificate_start_date?: string
  certificate_end_date?: string
  certificate_qr_url?: string

  // Booking variables
  booking_number?: string
  booking_status?: string
  requested_destination?: string
  check_in_date?: string
  check_out_date?: string
  guests_count?: number

  // Property variables
  property_name?: string
  property_address?: string
  property_destination?: string
  property_pax?: number
  property_bedrooms?: number
  property_bathrooms?: number
  property_amenities?: string[]
  property_photos?: string[]
  property_check_in_time?: string
  property_check_out_time?: string
  property_access_instructions?: string
  property_rating?: number

  // Offer variables
  offer_expires_at?: string
  offer_accept_url?: string
  hours_until_expiry?: number

  // Owner variables
  owner_first_name?: string
  owner_last_name?: string
  owner_property_name?: string
  owner_earnings_amount?: string
  owner_payout_period?: string

  // System variables
  company_name?: string
  company_email?: string
  company_phone?: string
  company_whatsapp?: string
  site_url?: string
  support_url?: string
  unsubscribe_url?: string

  // Review variables
  review_rating?: number
  review_comment?: string
  review_url?: string

  // Payment variables
  payment_amount?: string
  payment_method?: string
  payment_date?: string

  // Custom
  [key: string]: any
}

export interface SendEmailRequest {
  to: string | string[]
  subject: string
  html: string
  from?: string
  reply_to?: string
  cc?: string | string[]
  bcc?: string | string[]
  template_type?: EmailTemplateType
  metadata?: Record<string, any>
}

export interface SendEmailResponse {
  success: boolean
  message_id?: string
  error?: string
}
