import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/resend-client"

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send email to support team
    await sendEmail({
      to: "info@week-chain.com",
      subject: `[Contacto Web] ${subject}`,
      react: (
        <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ color: "#1f2937" }}>Nuevo Mensaje de Contacto</h2>
          <div style={{ backgroundColor: "#f3f4f6", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
            <p>
              <strong>Nombre:</strong> {name}
            </p>
            <p>
              <strong>Email:</strong> {email}
            </p>
            <p>
              <strong>Asunto:</strong> {subject}
            </p>
            <p>
              <strong>Mensaje:</strong>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
          </div>
          <p style={{ marginTop: "20px", color: "#6b7280", fontSize: "14px" }}>
            Este mensaje fue enviado desde el formulario de contacto de week-chain.com
          </p>
        </div>
      ),
    })

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: "Hemos recibido tu mensaje - WeekChain",
      react: (
        <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ color: "#1f2937" }}>Gracias por contactarnos, {name}</h2>
          <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
            Hemos recibido tu mensaje y nuestro equipo lo revisará pronto. Te responderemos en las próximas 24-48 horas.
          </p>
          <div style={{ backgroundColor: "#f3f4f6", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
            <p>
              <strong>Tu mensaje:</strong>
            </p>
            <p style={{ whiteSpace: "pre-wrap", color: "#6b7280" }}>{message}</p>
          </div>
          <p style={{ marginTop: "30px", color: "#6b7280" }}>
            Saludos,
            <br />
            <strong>El equipo de WeekChain</strong>
          </p>
        </div>
      ),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending contact email:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
