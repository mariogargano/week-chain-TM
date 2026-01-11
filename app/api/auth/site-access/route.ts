import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Contraseña de acceso al sitio - cambiar por una segura
const SITE_PASSWORD = process.env.SITE_ACCESS_PASSWORD || "weekchain2024"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === SITE_PASSWORD) {
      const cookieStore = await cookies()

      // Cookie de acceso válida por 7 días
      cookieStore.set("site_access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
