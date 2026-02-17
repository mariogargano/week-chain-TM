import { createClient } from "@/lib/supabase/server"

export interface WebhookEventData {
  source: "conekta" | "legalario" | "solana" | "other"
  eventId: string
  eventType: string
  payload: any
  ipAddress?: string
  userAgent?: string
  signatureValid?: boolean
  payloadDigest?: string
  signatureReceived?: string
}

export class WebhookLogger {
  /**
   * Registra un evento de webhook en la base de datos
   */
  static async log(data: WebhookEventData): Promise<string | null> {
    try {
      const supabase = createClient()

      const enhancedPayload = {
        ...data.payload,
        _security: {
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          signatureValid: data.signatureValid,
          payloadDigest: data.payloadDigest,
          timestamp: new Date().toISOString(),
        },
      }

      const { data: result, error } = await supabase.rpc("log_webhook_event", {
        p_source: data.source,
        p_event_id: data.eventId,
        p_event_type: data.eventType,
        p_payload: enhancedPayload,
        p_ip_address: data.ipAddress || null,
        p_user_agent: data.userAgent || null,
        p_signature_valid: data.signatureValid ?? true,
      })

      if (error) {
        console.error("[WebhookLogger] Error logging webhook:", error)
        return null
      }

      return result as string
    } catch (error) {
      console.error("[WebhookLogger] Exception logging webhook:", error)
      return null
    }
  }

  /**
   * Marca un webhook como procesado exitosamente
   */
  static async markProcessed(webhookId: string): Promise<boolean> {
    try {
      const supabase = createClient()

      const { error } = await supabase.rpc("mark_webhook_processed", {
        p_webhook_id: webhookId,
        p_success: true,
        p_error_message: null,
      })

      if (error) {
        console.error("[WebhookLogger] Error marking webhook as processed:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("[WebhookLogger] Exception marking webhook as processed:", error)
      return false
    }
  }

  /**
   * Marca un webhook como fallido
   */
  static async markFailed(webhookId: string, errorMessage: string): Promise<boolean> {
    try {
      const supabase = createClient()

      const { error } = await supabase.rpc("mark_webhook_processed", {
        p_webhook_id: webhookId,
        p_success: false,
        p_error_message: errorMessage,
      })

      if (error) {
        console.error("[WebhookLogger] Error marking webhook as failed:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("[WebhookLogger] Exception marking webhook as failed:", error)
      return false
    }
  }

  /**
   * Obtiene webhooks pendientes de procesar
   */
  static async getPending(source?: string, limit = 100) {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.rpc("get_pending_webhooks", {
        p_source: source || null,
        p_limit: limit,
      })

      if (error) {
        console.error("[WebhookLogger] Error getting pending webhooks:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("[WebhookLogger] Exception getting pending webhooks:", error)
      return []
    }
  }

  /**
   * Limpia webhooks antiguos
   */
  static async cleanup(daysOld = 90): Promise<number> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.rpc("cleanup_old_webhooks", {
        p_days_old: daysOld,
      })

      if (error) {
        console.error("[WebhookLogger] Error cleaning up webhooks:", error)
        return 0
      }

      return (data as number) || 0
    } catch (error) {
      console.error("[WebhookLogger] Exception cleaning up webhooks:", error)
      return 0
    }
  }
}
