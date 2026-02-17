import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export interface InvoiceData {
  userId: string
  voucherId: string
  rfc: string
  razonSocial: string
  emailFacturacion: string
  calle: string
  numeroExterior: string
  numeroInterior?: string
  colonia: string
  municipio: string
  estado: string
  codigoPostal: string
  pais: string
  usoCfdi: string
}

export async function generateInvoice(
  data: InvoiceData,
): Promise<{ invoiceId: string; status: string; facturaUuid?: string }> {
  const cookieStore = cookies()
  const supabase = createClient()

  // Insertar solicitud de factura
  const { data: invoiceRequest, error } = await supabase
    .from("invoice_requests")
    .insert({
      user_id: data.userId,
      voucher_id: data.voucherId,
      rfc: data.rfc,
      razon_social: data.razonSocial,
      email_facturacion: data.emailFacturacion,
      calle: data.calle,
      numero_exterior: data.numeroExterior,
      numero_interior: data.numeroInterior,
      colonia: data.colonia,
      municipio: data.municipio,
      estado: data.estado,
      codigo_postal: data.codigoPostal,
      pais: data.pais,
      uso_cfdi: data.usoCfdi,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating invoice request:", error)
    throw new Error("Failed to generate invoice request")
  }

  console.log("[v0] Invoice request created successfully:", invoiceRequest.id)

  // En producción, aquí se llamaría a la API del PAC (Proveedor Autorizado de Certificación)
  // Por ahora, retornamos el ID de la solicitud
  return {
    invoiceId: invoiceRequest.id,
    status: "pending",
  }
}
