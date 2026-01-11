import type * as React from "react"

interface WelcomeEmailProps {
  userName: string
  userEmail: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userName, userEmail }) => (
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .button {
          display: inline-block;
          background: #667eea;
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
        <h1 style={{ margin: 0, fontSize: "28px" }}>Welcome to WeekChain!</h1>
      </div>
      <div className="content">
        <p>Hi {userName || "there"},</p>
        <p>
          Welcome to WeekChain - the future of fractional real estate ownership! We're excited to have you join our
          community.
        </p>
        <p>
          With WeekChain, you can own tokenized weeks at luxury properties around the world. Here's what you can do:
        </p>
        <ul>
          <li>Browse and purchase NFT weeks at premium properties</li>
          <li>Make reservations for your owned weeks</li>
          <li>Trade your weeks on the secondary market</li>
          <li>Earn referral commissions by inviting friends</li>
        </ul>
        <div style={{ textAlign: "center" }}>
          <a href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://week-chain.com"}/properties`} className="button">
            Explore Properties
          </a>
        </div>
        <p>
          If you have any questions, our support team is here to help at{" "}
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
        <p>You're receiving this email because you signed up at week-chain.com</p>
      </div>
    </body>
  </html>
)
