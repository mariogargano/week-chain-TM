import { NextResponse } from "next/server"

export async function GET() {
  const configured = !!process.env.CONEKTA_SECRET_KEY

  return NextResponse.json({
    configured,
    message: configured ? "Conekta está configurado correctamente" : "CONEKTA_SECRET_KEY no está configurada",
  })
}
