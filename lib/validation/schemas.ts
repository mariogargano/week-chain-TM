import { z } from "zod"

// Mifiel NOM-151 Certification Schemas
export const MifielHashSchema = z.object({
  contractBytesBase64: z.string().min(20, "Contract data too short"),
  contractName: z.string().min(3, "Contract name too short"),
  contractId: z.string().uuid("Invalid contract ID"),
})

export const MintSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  weekId: z.string().uuid("Invalid week ID"),
  contractId: z.string().uuid("Invalid contract ID"),
  seriesId: z.string().uuid("Invalid series ID"),
})

// Loan System Schemas
export const CreateLoanSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  nftMint: z.string().min(20, "Invalid NFT mint address"),
  principal: z.number().min(100, "Principal must be at least 100"),
  apr: z.number().min(5).max(30, "APR must be between 5 and 30"),
  ltv: z.number().min(20).max(60, "LTV must be between 20 and 60"),
  dueDate: z.string(),
})

export const UpdateLoanStatusSchema = z.object({
  loanId: z.string().uuid("Invalid loan ID"),
  status: z.enum(["draft", "signed", "funded", "repaid", "default"]),
})

export const CreateCollateralSchema = z.object({
  loanId: z.string().uuid("Invalid loan ID"),
  vaultAddress: z.string().min(32, "Invalid vault address"),
  frozen: z.boolean().optional(),
})

// Authentication Schemas
export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Teléfono inválido")
    .optional(),
})

export const ResetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  token: z.string().min(20, "Token inválido"),
})

// Booking Schemas
export const CreateBookingSchema = z.object({
  property_id: z.string().uuid("ID de propiedad inválido"),
  week_number: z.number().int().min(1).max(52, "Semana debe estar entre 1 y 52"),
  year: z.number().int().min(2025).max(2050, "Año inválido"),
  check_in: z.string().datetime("Fecha de check-in inválida"),
  check_out: z.string().datetime("Fecha de check-out inválida"),
  guests: z.number().int().min(1).max(20, "Número de huéspedes inválido"),
  total_price: z.number().min(0, "Precio debe ser positivo"),
})

export const UpdateBookingSchema = z.object({
  booking_id: z.string().uuid("ID de reserva inválido"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  guests: z.number().int().min(1).max(20).optional(),
})

export const CancelBookingSchema = z.object({
  booking_id: z.string().uuid("ID de reserva inválido"),
  reason: z.string().min(10, "La razón debe tener al menos 10 caracteres").max(500, "Máximo 500 caracteres"),
})

// Payment Schemas
export const CreatePaymentSchema = z.object({
  booking_id: z.string().uuid("ID de reserva inválido").optional(),
  voucher_id: z.string().uuid("ID de voucher inválido").optional(),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  currency: z.enum(["USD", "MXN", "EUR"]),
  payment_method: z.enum(["card", "oxxo", "spei", "paypal"]),
  metadata: z.record(z.any()).optional(),
})

export const ConfirmPaymentSchema = z.object({
  payment_id: z.string().uuid("ID de pago inválido"),
  payment_intent_id: z.string().min(10, "Payment intent ID inválido"),
})

export const CreateOxxoPaymentSchema = z.object({
  voucher_id: z.string().uuid("ID de voucher inválido"),
  amount: z.number().min(100, "Monto mínimo: $100 MXN"),
  customer_email: z.string().email("Email inválido"),
  customer_name: z.string().min(3, "Nombre inválido"),
})

// Refund Schemas
export const RefundRequestSchema = z.object({
  booking_id: z.string().uuid("ID de reserva inválido").optional(),
  voucher_id: z.string().uuid("ID de voucher inválido").optional(),
  reason: z.string().min(10, "La razón debe tener al menos 10 caracteres").max(500, "Máximo 500 caracteres"),
  amount: z.number().min(0, "Monto inválido").optional(),
})

export const ApproveRefundSchema = z.object({
  refund_id: z.string().uuid("ID de reembolso inválido"),
  approved: z.boolean(),
  admin_notes: z.string().max(1000, "Máximo 1000 caracteres").optional(),
})

// KYC Schemas
export const SubmitKYCSchema = z.object({
  full_name: z.string().min(3, "Nombre completo requerido"),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  nationality: z.string().length(2, "Código de país de 2 letras (ISO 3166-1)"),
  document_type: z.enum(["passport", "national_id", "drivers_license"]),
  document_number: z.string().min(5, "Número de documento inválido"),
  address: z.object({
    street: z.string().min(5, "Calle requerida"),
    city: z.string().min(2, "Ciudad requerida"),
    state: z.string().min(2, "Estado requerido"),
    postal_code: z.string().min(3, "Código postal requerido"),
    country: z.string().length(2, "Código de país de 2 letras"),
  }),
})

export const UpdateKYCStatusSchema = z.object({
  kyc_id: z.string().uuid("ID de KYC inválido"),
  status: z.enum(["pending", "approved", "rejected", "requires_review"]),
  rejection_reason: z.string().max(500).optional(),
})

// Legal Schemas
export const AcceptTermsSchema = z.object({
  terms_version: z.string().min(1, "Versión de términos requerida"),
  ip_address: z.string().ip("IP inválida").optional(),
  user_agent: z.string().optional(),
})

export const RequestCancellationSchema = z.object({
  voucher_id: z.string().uuid("ID de voucher inválido"),
  reason: z.string().min(10, "La razón debe tener al menos 10 caracteres").max(500, "Máximo 500 caracteres"),
  refund_method: z.enum(["original", "wallet", "bank_transfer"]).optional(),
})

export const CertifyContractSchema = z.object({
  contract_id: z.string().uuid("ID de contrato inválido"),
  signers: z
    .array(
      z.object({
        email: z.string().email("Email inválido"),
        name: z.string().min(3, "Nombre requerido"),
        tax_id: z.string().optional(),
      }),
    )
    .min(1, "Al menos un firmante requerido"),
})

// Property Schemas
export const CreatePropertySchema = z.object({
  name: z.string().min(3, "Nombre de propiedad requerido"),
  description: z.string().min(20, "Descripción debe tener al menos 20 caracteres"),
  location: z.object({
    address: z.string().min(5, "Dirección requerida"),
    city: z.string().min(2, "Ciudad requerida"),
    state: z.string().min(2, "Estado requerido"),
    country: z.string().length(2, "Código de país de 2 letras"),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  amenities: z.array(z.string()).optional(),
  max_guests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(1),
  bathrooms: z.number().min(1),
  price_per_week: z.number().min(100, "Precio mínimo: $100"),
})

export const UpdatePropertySchema = CreatePropertySchema.partial().extend({
  property_id: z.string().uuid("ID de propiedad inválido"),
})

// Webhook Schemas
export const ConektaWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.any(),
})

export const MifielWebhookSchema = z.object({
  document_id: z.string(),
  status: z.enum(["signed", "rejected", "expired"]),
  signers: z.array(z.any()).optional(),
})

// Helper Functions
/**
 * Valida una request y retorna el resultado
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Formatea errores de validación para respuestas API
 */
export function formatValidationError(error: z.ZodError): { field: string; message: string }[] {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }))
}

/**
 * Middleware de validación para Next.js API routes
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return async (data: unknown): Promise<T> => {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw new Error(JSON.stringify(formatValidationError(result.error)))
    }
    return result.data
  }
}

// Type Exports
export type MifielHashInput = z.infer<typeof MifielHashSchema>
export type MintInput = z.infer<typeof MintSchema>
export type CreateLoanInput = z.infer<typeof CreateLoanSchema>
export type UpdateLoanStatusInput = z.infer<typeof UpdateLoanStatusSchema>
export type CreateCollateralInput = z.infer<typeof CreateCollateralSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>
export type RefundRequestInput = z.infer<typeof RefundRequestSchema>
export type SubmitKYCInput = z.infer<typeof SubmitKYCSchema>
export type AcceptTermsInput = z.infer<typeof AcceptTermsSchema>
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>
