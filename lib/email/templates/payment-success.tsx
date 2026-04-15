import type * as React from "react";

interface PaymentSuccessProps {
  userName: string
  propertyName: string
  weekNumber: number
  amount: string
  currency: string
  paymentMethod: string
  voucherId: string
  paymentIntentId: string
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  userName,
  propertyName,
  weekNumber,
  amount,
  currency,
  paymentMethod,
  voucherId,
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
        .success-box {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
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
          background: linear-gradient(135deg, #FF9AA2 0%, #FFB7B2 100%);
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
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
        <h1 style={{ margin: 0, fontSize: "28px" }}>¡Pago Exitoso! 🎉</h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Tu semana ha sido confirmada</p>
      </div>
      <div className="content">
        <p>Hola {userName},</p>
        <p>
          ¡Excelentes noticias! Tu pago para la Semana #{weekNumber} en {propertyName} ha sido procesado exitosamente.
          Tu certificado NFT está listo.
        </p>

        <div className="success-box">
          <strong>✅ Transacción Completada</strong>
          <p style={{ margin: "10px 0 0 0" }}>
            Tu voucher ha sido creado y está disponible en tu dashboard. Ahora eres propietario oficial de esta semana
            vacacional tokenizada.
          </p>
        </div>

        <div className="details-box">
          <h3 style={{ marginTop: 0 }}>Detalles de la Compra</h3>
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
              <strong>Monto Pagado:</strong>
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
              <strong>Voucher ID:</strong>
            </span>
            <span style={{ fontSize: "12px", fontFamily: "monospace" }}>{voucherId}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>ID de Transacción:</strong>
            </span>
            <span style={{ fontSize: "12px", fontFamily: "monospace" }}>{paymentIntentId}</span>
          </div>
        </div>

        <p>
          <strong>Próximos Pasos:</strong>
        </p>
        <ul>
          <li>✅ Accede a tu dashboard para ver tu certificado NFT</li>
          <li>✅ Descarga tu voucher oficial en formato PDF</li>
          <li>✅ Programa tu estancia con 30 días de anticipación</li>
          <li>✅ Revende tu semana en nuestro marketplace cuando quieras</li>
        </ul>

        <div style={{ textAlign: "center" }}>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://week-chain.com"}/dashboard/user/vouchers`}
            className="button"
          >
            Ver Mi Certificado NFT
          </a>
        </div>

        <p>
          ¿Tienes preguntas? Estamos aquí para ayudarte:
          <br />📧 <a href="mailto:support@week-chain.com">support@week-chain.com</a>
          <br />💬 WhatsApp: +52 998 123 4567
        </p>

        <p>
          ¡Bienvenido a la comunidad WEEK-CHAIN™!
          <br />
          El Equipo de WEEK-CHAIN™
        </p>
      </div>
      <div className="footer">
        <p>© 2025 WEEK-CHAIN™. Todos los derechos reservados.</p>
        <p>Tus vacaciones ahora son un activo digital respaldado legalmente.</p>
      </div>
    </body>
  </html>
)
