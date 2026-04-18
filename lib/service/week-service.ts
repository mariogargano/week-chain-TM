import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

export interface PreStayReminder {
  booking_id: string
  reminder_type: 'T-7' | 'T-2' | 'T-1' | 'T-24h' | 'T-6h' | 'T-1h'
  scheduled_at: Date
  sent_at?: Date
  status: 'pending' | 'sent' | 'failed'
}

export interface StayCheckList {
  booking_id: string
  items: {
    name: string
    completed: boolean
    due_date: Date
    category: 'documentation' | 'payment' | 'setup' | 'safety' | 'communication'
  }[]
}

class WeekServiceEngine {
  private supabase = createClient()

  /**
   * Schedule pre-stay reminders (T-7, T-2, T-24h, etc.)
   */
  async schedulePreStayReminders(booking_id: string): Promise<void> {
    const { data: booking } = await this.supabase
      .from('confirmed_reservations')
      .select('check_in_date, guest_id, property_id')
      .eq('id', booking_id)
      .maybeSingle()

    if (!booking) return

    const checkInDate = new Date(booking.check_in_date)
    const reminders: PreStayReminder[] = [
      {
        booking_id,
        reminder_type: 'T-7',
        scheduled_at: new Date(checkInDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        booking_id,
        reminder_type: 'T-2',
        scheduled_at: new Date(checkInDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        booking_id,
        reminder_type: 'T-24h',
        scheduled_at: new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        booking_id,
        reminder_type: 'T-6h',
        scheduled_at: new Date(checkInDate.getTime() - 6 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        booking_id,
        reminder_type: 'T-1h',
        scheduled_at: new Date(checkInDate.getTime() - 1 * 60 * 60 * 1000),
        status: 'pending'
      }
    ]

    await this.supabase.from('pre_stay_reminders').insert(reminders)
  }

  /**
   * Get and send overdue reminders
   */
  async sendOverdueReminders(): Promise<void> {
    const now = new Date()

    const { data: reminders } = await this.supabase
      .from('pre_stay_reminders')
      .select(`
        *,
        bookings:booking_id (
          guest_id,
          property_id,
          check_in_date,
          check_out_date,
          guest_email,
          property_name
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .limit(100)

    if (!reminders || reminders.length === 0) return

    for (const reminder of reminders) {
      try {
        await this.sendReminderNotification(reminder)
        
        // Mark as sent
        await this.supabase
          .from('pre_stay_reminders')
          .update({ status: 'sent', sent_at: now.toISOString() })
          .eq('id', reminder.id)
      } catch (error) {
        console.error(`[WEEK-SERVICE] Failed to send reminder ${reminder.id}:`, error)
        
        // Mark as failed
        await this.supabase
          .from('pre_stay_reminders')
          .update({ status: 'failed' })
          .eq('id', reminder.id)
      }
    }
  }

  /**
   * Send reminder notification via multiple channels
   */
  private async sendReminderNotification(reminder: any): Promise<void> {
    const { reminder_type, bookings } = reminder
    const { guest_email, property_name, check_in_date } = bookings[0]

    let subject = ''
    let message = ''

    switch (reminder_type) {
      case 'T-7':
        subject = `Tu viaje a ${property_name} inicia en 7 días`
        message = `Hola! Tu estancia en ${property_name} comienza en 7 días. Te recomendamos revisar los documentos necesarios y confirmar los detalles de tu reserva.`
        break
      case 'T-2':
        subject = `Recordatorio: Tu viaje a ${property_name} inicia en 2 días`
        message = `Tu check-in es en 2 días. Asegúrate de tener listos tus documentos (identificación, pasaporte, etc.) y revisa la información de acceso a la propiedad.`
        break
      case 'T-24h':
        subject = `Última confirmación: Check-in mañana en ${property_name}`
        message = `Tu check-in es mañana a partir de las 3 PM. Consulta los datos de acceso y cualquier instrucción especial en tu portal.`
        break
      case 'T-6h':
        subject = `¡Casi aquí! Tu check-in es en 6 horas`
        message = `Tu check-in en ${property_name} es en 6 horas. Confirma tu hora de llegada estimada para que el equipo esté listo.`
        break
      case 'T-1h':
        subject = `¡Check-in en 1 hora! ${property_name}`
        message = `¡Bienvenido! Tu check-in es en menos de 1 hora. Si tienes preguntas, contacta al concierge.`
        break
    }

    // Queue email notification (using existing email system)
    await this.supabase.from('queued_notifications').insert({
      recipient_email: guest_email,
      notification_type: 'pre_stay_reminder',
      subject,
      message,
      metadata: {
        booking_id: reminder.booking_id,
        reminder_type,
        check_in_date,
        property_name
      }
    })
  }

  /**
   * Create stay checklist for new booking
   */
  async createStayChecklist(booking_id: string): Promise<StayCheckList> {
    const { data: booking } = await this.supabase
      .from('confirmed_reservations')
      .select('check_in_date')
      .eq('id', booking_id)
      .maybeSingle()

    if (!booking) throw new Error('Booking not found')

    const checkInDate = new Date(booking.check_in_date)
    const checklist: StayCheckList = {
      booking_id,
      items: [
        // Documentation
        {
          name: 'Identificación válida lista',
          completed: false,
          due_date: new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000),
          category: 'documentation'
        },
        {
          name: 'Confirmación de reserva descargada',
          completed: false,
          due_date: new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000),
          category: 'documentation'
        },
        // Payment
        {
          name: 'Pago completado',
          completed: false,
          due_date: new Date(checkInDate.getTime() - 48 * 60 * 60 * 1000),
          category: 'payment'
        },
        // Setup
        {
          name: 'Revisar instrucciones de acceso',
          completed: false,
          due_date: new Date(checkInDate.getTime() - 6 * 60 * 60 * 1000),
          category: 'setup'
        },
        {
          name: 'Descargar app WEEK-CHAIN',
          completed: false,
          due_date: new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000),
          category: 'setup'
        },
        // Safety
        {
          name: 'Revisar protocolos de seguridad',
          completed: false,
          due_date: checkInDate,
          category: 'safety'
        },
        {
          name: 'Contacto de emergencia registrado',
          completed: false,
          due_date: new Date(checkInDate.getTime() - 12 * 60 * 60 * 1000),
          category: 'safety'
        },
        // Communication
        {
          name: 'Comunicarse con el anfitrión si es necesario',
          completed: false,
          due_date: new Date(checkInDate.getTime() - 12 * 60 * 60 * 1000),
          category: 'communication'
        }
      ]
    }

    await this.supabase.from('stay_checklists').insert({
      booking_id,
      checklist_items: checklist.items
    })

    return checklist
  }

  /**
   * Get stay checklist progress
   */
  async getChecklistProgress(booking_id: string): Promise<{ completed: number; total: number; percentage: number }> {
    const { data: checklist } = await this.supabase
      .from('stay_checklists')
      .select('checklist_items')
      .eq('booking_id', booking_id)
      .maybeSingle()

    if (!checklist?.checklist_items) {
      return { completed: 0, total: 0, percentage: 0 }
    }

    const items = checklist.checklist_items
    const completed = items.filter((i: any) => i.completed).length
    const total = items.length

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  /**
   * Send post-stay review request
   */
  async requestPostStayReview(booking_id: string): Promise<void> {
    const { data: booking } = await this.supabase
      .from('confirmed_reservations')
      .select('guest_id, guest_email, property_id, property_name, check_out_date')
      .eq('id', booking_id)
      .maybeSingle()

    if (!booking) return

    // Queue review request notification
    await this.supabase.from('queued_notifications').insert({
      recipient_email: booking.guest_email,
      notification_type: 'post_stay_review',
      subject: `¿Qué tal tu estancia en ${booking.property_name}?`,
      message: `Nos encantaría conocer tu experiencia. Tu reseña ayuda a otros huéspedes a descubrir increíbles propiedades.`,
      metadata: {
        booking_id,
        property_id: booking.property_id,
        check_out_date: booking.check_out_date
      }
    })
  }
}

export const weekService = new WeekServiceEngine()
