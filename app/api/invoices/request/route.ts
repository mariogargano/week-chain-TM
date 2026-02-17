import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      voucherId,
      rfc,
      razonSocial,
      emailFacturacion,
      calle,
      numeroExterior,
      numeroInterior,
      colonia,
      municipio,
      estado,
      codigoPostal,
      pais,
      usoCfdi,
    } = body

    // Validar que el voucher pertenece al usuario
    const { data: voucher, error: voucherError } = await supabase
      .from("certificate_vouchers")
      .select("*")
      .eq("id", voucherId)
      .eq("user_id", user.id)
      .single()

    if (voucherError || !voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    // Crear solicitud de factura
    const { data: invoiceRequest, error: invoiceError } = await supabase
      .from("invoice_requests")
      .insert({
        user_id: user.id,
        voucher_id: voucherId,
        rfc,
        razon_social: razonSocial,
        email_facturacion: emailFacturacion,
        calle,
        numero_exterior: numeroExterior,
        numero_interior: numeroInterior,
        colonia,
        municipio,
        estado,
        codigo_postal: codigoPostal,
        pais,
        uso_cfdi: usoCfdi,
        status: "pending",
      })
      .select()
      .single()

    if (invoiceError) {
      console.error("[v0] Error creating invoice request:", invoiceError)
      return NextResponse.json({ error: "Failed to create invoice request" }, { status: 500 })
    }

    // TODO: En producción, aquí se llamaría al PAC (Proveedor Autorizado de Certificación)
    // para generar la factura automáticamente

    return NextResponse.json({
      success: true,
      invoiceRequestId: invoiceRequest.id,
      message: "Solicitud de factura creada. Recibirás tu factura por email en las próximas 24 horas.",
    })
  } catch (error) {
    console.error("[v0] Error in invoice request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
