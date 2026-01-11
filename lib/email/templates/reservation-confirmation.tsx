import type * as React from "react"

interface ReservationConfirmationProps {
  userName: string
  propertyName: string
  checkIn: string
  checkOut: string
  guests: number
  reservationId: string
}

export const ReservationConfirmation: React.FC<ReservationConfirmationProps> = ({
  userName,
  propertyName,
  checkIn,
  checkOut,
  guests,
  reservationId,
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
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
        <h1 style={{ margin: 0, fontSize: "28px" }}>Reservation Confirmed!</h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Your stay is booked</p>
      </div>
      <div className="content">
        <p>Hi {userName},</p>
        <p>Great news! Your reservation at {propertyName} has been confirmed. We look forward to hosting you!</p>

        <div className="details-box">
          <h3 style={{ marginTop: 0 }}>Reservation Details</h3>
          <div className="detail-row">
            <span>
              <strong>Property:</strong>
            </span>
            <span>{propertyName}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Check-in:</strong>
            </span>
            <span>{checkIn}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Check-out:</strong>
            </span>
            <span>{checkOut}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Guests:</strong>
            </span>
            <span>{guests}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Reservation ID:</strong>
            </span>
            <span>{reservationId}</span>
          </div>
        </div>

        <p>
          <strong>Before Your Arrival:</strong>
        </p>
        <ul>
          <li>Check-in time is 3:00 PM</li>
          <li>Check-out time is 11:00 AM</li>
          <li>You'll receive access instructions 24 hours before check-in</li>
          <li>Contact property management for any special requests</li>
        </ul>

        <div style={{ textAlign: "center" }}>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://week-chain.com"}/dashboard/my-weeks`}
            className="button"
          >
            View Reservation
          </a>
        </div>

        <p>
          Need to make changes? Contact us at <a href="mailto:support@week-chain.com">support@week-chain.com</a>
        </p>

        <p>
          Have a wonderful stay!
          <br />
          The WeekChain Team
        </p>
      </div>
      <div className="footer">
        <p>© 2025 WeekChain. All rights reserved.</p>
      </div>
    </body>
  </html>
)
