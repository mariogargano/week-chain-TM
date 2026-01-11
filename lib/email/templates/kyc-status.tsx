import type * as React from "react"

interface KYCStatusEmailProps {
  userName: string
  status: "approved" | "rejected" | "pending"
  reason?: string
}

export const KYCStatusEmail: React.FC<KYCStatusEmailProps> = ({ userName, status, reason }) => {
  const statusConfig = {
    approved: {
      color: "#10b981",
      title: "KYC Verification Approved!",
      message:
        "Your identity verification has been successfully completed. You now have full access to all WeekChain features.",
    },
    rejected: {
      color: "#ef4444",
      title: "KYC Verification Requires Attention",
      message:
        "We were unable to verify your identity with the information provided. Please review the reason below and resubmit.",
    },
    pending: {
      color: "#f59e0b",
      title: "KYC Verification In Progress",
      message:
        "We've received your verification documents and are currently reviewing them. This typically takes 24-48 hours.",
    },
  }

  const config = statusConfig[status]

  return (
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
            background: ${config.color};
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
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: ${config.color};
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
          <h1 style={{ margin: 0, fontSize: "28px" }}>{config.title}</h1>
        </div>
        <div className="content">
          <p>Hi {userName},</p>
          <p>{config.message}</p>

          {status === "rejected" && reason && (
            <div className="alert-box">
              <strong>Reason:</strong> {reason}
            </div>
          )}

          {status === "approved" && (
            <>
              <p>
                <strong>You can now:</strong>
              </p>
              <ul>
                <li>Purchase NFT weeks without limits</li>
                <li>List your weeks for sale</li>
                <li>Access premium features</li>
                <li>Participate in DAO governance</li>
              </ul>
            </>
          )}

          {status === "rejected" && (
            <>
              <p>
                <strong>Next Steps:</strong>
              </p>
              <ul>
                <li>Review the reason for rejection</li>
                <li>Prepare updated documentation</li>
                <li>Resubmit your verification</li>
              </ul>
            </>
          )}

          <div style={{ textAlign: "center" }}>
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://week-chain.com"}${
                status === "approved" ? "/properties" : "/kyc"
              }`}
              className="button"
            >
              {status === "approved" ? "Explore Properties" : "Update KYC"}
            </a>
          </div>

          <p>
            Questions? Contact us at <a href="mailto:management@week-chain.com">management@week-chain.com</a>
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
}
