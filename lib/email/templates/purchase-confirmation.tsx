import type * as React from "react"

interface PurchaseConfirmationProps {
  userName: string
  propertyName: string
  weekNumber: number
  purchaseAmount: string
  transactionId: string
}

export const PurchaseConfirmation: React.FC<PurchaseConfirmationProps> = ({
  userName,
  propertyName,
  weekNumber,
  purchaseAmount,
  transactionId,
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
          background: #10b981;
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
        <h1 style={{ margin: 0, fontSize: "28px" }}>Purchase Confirmed!</h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Your NFT week is now yours</p>
      </div>
      <div className="content">
        <p>Hi {userName},</p>
        <p>
          Congratulations! Your purchase has been successfully completed. You are now the proud owner of a tokenized
          week at {propertyName}.
        </p>

        <div className="details-box">
          <h3 style={{ marginTop: 0 }}>Purchase Details</h3>
          <div className="detail-row">
            <span>
              <strong>Property:</strong>
            </span>
            <span>{propertyName}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Week Number:</strong>
            </span>
            <span>Week {weekNumber}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Amount Paid:</strong>
            </span>
            <span>{purchaseAmount}</span>
          </div>
          <div className="detail-row">
            <span>
              <strong>Transaction ID:</strong>
            </span>
            <span style={{ fontSize: "12px", wordBreak: "break-all" }}>{transactionId}</span>
          </div>
        </div>

        <p>
          <strong>What's Next?</strong>
        </p>
        <ul>
          <li>View your NFT in your dashboard</li>
          <li>Make a reservation for your week</li>
          <li>List your week for rent or sale</li>
        </ul>

        <div style={{ textAlign: "center" }}>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://week-chain.com"}/dashboard/my-weeks`}
            className="button"
          >
            View My Weeks
          </a>
        </div>

        <p>
          If you have any questions about your purchase, please contact us at{" "}
          <a href="mailto:support@week-chain.com">support@week-chain.com</a>
        </p>

        <p>
          Best regards,
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
