import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        message: "Resend API key not configured",
      })
    }

    // Simple validation - just check if key exists and has correct format
    if (!apiKey.startsWith("re_")) {
      return NextResponse.json({
        configured: false,
        message: "Invalid Resend API key format",
      })
    }

    return NextResponse.json({
      configured: true,
      message: "Email service configured",
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      message: `Email service error: ${error.message}`,
    })
  }
}
