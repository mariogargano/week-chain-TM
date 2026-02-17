import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Apple Wallet pass template (simplified version)
// For production, you would use the 'passkit-generator' library with proper certificates

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, email, phone, referralCode, brokerLevel, accountType, memberSince } = body

    // Verify user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate pass.json content for Apple Wallet
    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.weekchain.member",
      serialNumber: `WC-${referralCode}-${Date.now()}`,
      teamIdentifier: "WEEKCHAIN",
      organizationName: "WEEK-CHAIN",
      description: "Tarjeta de Intermediario WEEK-CHAIN",
      logoText: "WEEK-CHAIN™",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(26, 35, 50)",
      labelColor: "rgb(156, 163, 175)",
      generic: {
        primaryFields: [
          {
            key: "name",
            label: "INTERMEDIARIO",
            value: name,
          },
        ],
        secondaryFields: [
          {
            key: "level",
            label: "NIVEL",
            value: brokerLevel.toUpperCase(),
          },
          {
            key: "type",
            label: "TIPO",
            value: accountType === "company" ? "EMPRESA" : "INDIVIDUAL",
          },
        ],
        auxiliaryFields: [
          {
            key: "email",
            label: "EMAIL",
            value: email,
          },
          {
            key: "phone",
            label: "TELÉFONO",
            value: phone || "No registrado",
          },
        ],
        backFields: [
          {
            key: "referralCode",
            label: "CÓDIGO DE REFERIDO",
            value: referralCode,
          },
          {
            key: "memberSince",
            label: "MIEMBRO DESDE",
            value: new Date(memberSince).toLocaleDateString("es-MX"),
          },
          {
            key: "website",
            label: "SITIO WEB",
            value: "https://weekchain.com",
          },
          {
            key: "support",
            label: "SOPORTE",
            value: "soporte@weekchain.com",
          },
        ],
      },
      barcode: {
        format: "PKBarcodeFormatQR",
        message: `https://weekchain.com/ref/${referralCode}`,
        messageEncoding: "iso-8859-1",
      },
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: `https://weekchain.com/ref/${referralCode}`,
          messageEncoding: "iso-8859-1",
        },
      ],
    }

    // For now, return the pass.json as a downloadable file
    // In production, you would sign this with Apple certificates and package as .pkpass

    // Create a simple HTML card that can be saved
    const htmlCard = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WEEK-CHAIN Card - ${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      width: 350px;
      background: linear-gradient(135deg, #1a2332 0%, #0f1419 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .logo sup { font-size: 10px; }
    .subtitle { 
      font-size: 12px; 
      color: #9ca3af;
      margin-top: 4px;
    }
    .flag { font-size: 24px; }
    .name {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 20px;
    }
    .info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #d1d5db;
    }
    .icon { width: 20px; color: #6b7280; }
    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 16px;
      border-top: 1px solid #2d3748;
    }
    .ref-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .ref-code {
      font-size: 18px;
      font-weight: bold;
      color: #10b981;
      letter-spacing: 2px;
    }
    .qr {
      width: 70px;
      height: 70px;
      background: white;
      border-radius: 8px;
      padding: 6px;
    }
    .qr img { width: 100%; height: 100%; }
    .level-badge {
      display: inline-block;
      background: ${brokerLevel === "gold" ? "#eab308" : brokerLevel === "silver" ? "#9ca3af" : "#3b82f6"};
      color: ${brokerLevel === "gold" ? "#000" : "#fff"};
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="logo">WEEK-CHAIN<sup>™</sup></div>
        <div class="subtitle">Intermediario Autorizado</div>
      </div>
      <div class="flag">🇲🇽</div>
    </div>
    
    <div class="name">${name}</div>
    <div class="type">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      Intermediario ${accountType === "company" ? "Empresa" : "Individual"}
    </div>
    <span class="level-badge">${brokerLevel.toUpperCase()}</span>
    
    <div class="info">
      <div class="info-item">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        ${email}
      </div>
      <div class="info-item">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        ${phone || "No registrado"}
      </div>
    </div>
    
    <div class="bottom">
      <div>
        <div class="ref-label">Código de Referido</div>
        <div class="ref-code">${referralCode}</div>
      </div>
      <div class="qr">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://weekchain.com/ref/${referralCode}" alt="QR Code"/>
      </div>
    </div>
  </div>
</body>
</html>
    `

    // Return the HTML file which users can save and print
    // For true Apple Wallet integration, you need Apple Developer certificates
    return new NextResponse(htmlCard, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="weekchain-card-${referralCode}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating wallet pass:", error)
    return NextResponse.json({ error: "Error generating pass" }, { status: 500 })
  }
}
