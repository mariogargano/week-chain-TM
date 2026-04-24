import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, category, message } = body

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get client IP and user agent
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const user_agent = request.headers.get("user-agent") || "unknown"

    // Auto-assign priority based on category
    let priority = "normal"
    if (category === "legal" || category === "support") {
      priority = "high"
    } else if (category === "general") {
      priority = "low"
    }

    // Insert contact request
    const { data: contactRequest, error } = await supabase
      .from("contact_requests")
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        category,
        message,
        user_id: user?.id || null,
        ip_address,
        user_agent,
        priority,
        status: "pending",
        metadata: {
          source: "contact_form",
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating contact request:", error)
      return NextResponse.json({ error: "Error al enviar el mensaje. Por favor intenta de nuevo." }, { status: 500 })
    }

    // TODO: Send email notification to support team
    // TODO: Send confirmation email to user

    return NextResponse.json(
      {
        success: true,
        message: "Mensaje enviado exitosamente. Te responderemos en 24-48 horas.",
        requestId: contactRequest.id,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Contact form submission error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
