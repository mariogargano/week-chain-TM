import { html } from "@react-email/html"
import { body } from "@react-email/body"
import { container } from "@react-email/container"
import { text } from "@react-email/text"
import { heading } from "@react-email/heading"
import { button } from "@react-email/button"

export const emailTemplates = {
  kycApproved: ({
    fullName,
    certificateNumber,
    dashboardUrl,
  }: {
    fullName: string
    certificateNumber: string
    dashboardUrl: string
  }) => ({
    subject: "Tu verificación KYC fue aprobada ✓",
    html: `
      <h1>¡Bienvenido, ${fullName}!</h1>
      <p>Tu verificación de identidad ha sido aprobada exitosamente.</p>
      <p>Tu certificado SVC está listo:</p>
      <p><strong>Número: ${certificateNumber}</strong></p>
      <p>Ahora puedes solicitar tus estancias en el calendario de reservas.</p>
      <a href="${dashboardUrl}" style="background: #0284c7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
        Ir al Dashboard
      </a>
    `,
  }),
  
  kycRejected: ({
    fullName,
    reason,
    retryUrl,
  }: {
    fullName: string
    reason: string
    retryUrl: string
  }) => ({
    subject: "Tu verificación KYC requiere más información",
    html: `
      <h1>Verificación pendiente, ${fullName}</h1>
      <p>Tu solicitud de KYC necesita revisión adicional:</p>
      <p>${reason}</p>
      <p>Puedes intentar nuevamente con documentos más claros.</p>
      <a href="${retryUrl}" style="background: #0284c7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
        Reintentar Verificación
      </a>
    `,
  }),

  estanciaConfirmed: ({
    fullName,
    certificateNumber,
    propertyName,
    checkIn,
    checkOut,
    reservationNumber,
  }: {
    fullName: string
    certificateNumber: string
    propertyName: string
    checkIn: string
    checkOut: string
    reservationNumber: string
  }) => ({
    subject: `Tu estancia en ${propertyName} está confirmada`,
    html: `
      <h1>¡Reserva Confirmada!</h1>
      <p>Hola ${fullName},</p>
      <p>Tu estancia ha sido confirmada:</p>
      <p>
        <strong>Propiedad:</strong> ${propertyName}<br/>
        <strong>Check-in:</strong> ${checkIn}<br/>
        <strong>Check-out:</strong> ${checkOut}<br/>
        <strong>Número de Reserva:</strong> ${reservationNumber}
      </p>
      <p>En breve recibirás instrucciones de acceso.</p>
    `,
  }),

  commissionPaid: ({
    agentName,
    amount,
    currency,
    periodStart,
    periodEnd,
  }: {
    agentName: string
    amount: number
    currency: string
    periodStart: string
    periodEnd: string
  }) => ({
    subject: "Tu comisión ha sido pagada",
    html: `
      <h1>Pago de Comisión Procesado</h1>
      <p>Hola ${agentName},</p>
      <p>Tu comisión del período ${periodStart} - ${periodEnd} ha sido pagada:</p>
      <p><strong>${amount} ${currency}</strong></p>
      <p>Puedes verificar los detalles en tu dashboard.</p>
    `,
  }),
}
