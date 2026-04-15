import type * as React from "react";

interface PaymentFailedProps {
  userName: string
  propertyName: string
  weekNumber: number
  amount: string
  currency: string
  paymentMethod: string
  failureReason?: string
  paymentIntentId: string
}

export const PaymentFailed: React.FC<PaymentFailedProps> = ({
  userName,
  propertyName,
  weekNumber,
  amount,
  currency,
  paymentMethod,
  failureReason,
  paymentIntentId,
}) => (
  <html>
    <head>
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .alert-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .details-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      `}</style>
    </head>
    <body>
      <div className="header">
        <h1 style={{ margin: 0, fontSize: "28px" }}>Pago No Procesado</h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Tu transacción no pudo completarse</p>
      </div>
      <div className="content">
        <p>Hola {userName},</p>
        <p>
          Lamentamos informarte que tu pago para la Semana #{weekNumber} en {propertyName} no pudo ser procesado
          exitosamente.
        </p>

        <div className="alert-box">
          <strong>⚠️ Razón del fallo:</strong>
          <p style={{ margin: "10px 0 0 0" }}>
            {failureReason ||
              "El pago fue rechazado. Por favor verifica la información de tu método de pago e intenta nuevamente."}
          </p>
        </div>

        <div className="details-box">
          <h3 style={{ marginTop: 0 }}>Detalles de la Transacción</h3>
          <div className="detail-row">
            <span>
              <strong>Propiedad:</strong>
            </span>
            <span>{propertyName}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Semana:</strong>
            </span>
            <span>#{weekNumber}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Monto:</strong>
            </span>
            <span>
              {amount} {currency}
            </span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Método de Pago:</strong>
            </span>
            <span>{paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>ID de Transacción:</strong>
            </span>
            <span style={{ fontSize: "12px", fontFamily: "monospace" }}>{paymentIntentId}</span>
          </div>
        </div>

        <p>
          <strong>¿Qué puedes hacer ahora?</strong>
        </p>
        <ul>
          <li>Verifica que tu método de pago tenga fondos suficientes</li>
          <li>Confirma que la información de pago sea correcta</li>
          <li>Intenta con un método de pago diferente</li>
          <li>Contacta a tu banco si el problema persiste</li>
        </ul>

        <div style={{ textAlign: "center" }}>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://week-chain.com"}/properties/${propertyName.toLowerCase().replace(/\s/g, "-")}`}
            className="button"
          >
            Intentar Nuevamente
          </a>
        </div>

        <p>
          ¿Necesitas ayuda? Contáctanos:
          <br />📧 <a href="mailto:support@week-chain.com">support@week-chain.com</a>
          <br />💬 WhatsApp: +52 998 123 4567
        </p>

        <p>
          Saludos,
          <br />
          El Equipo de WEEK-CHAIN™
        </p>
      </div>
      <div className="footer">
        <p>© 2025 WEEK-CHAIN™. Todos los derechos reservados.</p>
      </div>
    </body>
  </html>
)
