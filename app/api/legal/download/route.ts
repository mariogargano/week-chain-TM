import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import type { NOM151Data } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const series = searchParams.get("series")
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user data
    const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single()

    // Get contract data
    const { data: contractData } = await supabase
      .from("legal_contracts")
      .select("*, purchase_vouchers(*), properties(*)")
      .eq("user_id", userId)
      .eq("series_id", series || "")
      .single()

    if (!contractData) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    const nom151: NOM151Data = {
      folio: contractData.nom151_folio,
      sha256: contractData.sha256_hash,
    }

    // Generate PDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("WEEKCHAIN", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text("Contrato de Cesión de Uso de Tiempo Compartido", 105, 30, { align: "center" })

    doc.setFontSize(10)
    doc.text(`Folio NOM-151: ${nom151.folio}`, 20, 45)
    doc.text(`Hash SHA-256: ${nom151.sha256}`, 20, 52)
    doc.text(`Fecha de emisión: ${new Date(contractData.created_at).toLocaleDateString("es-MX")}`, 20, 59)

    // Separator
    doc.line(20, 65, 190, 65)

    // User Information
    doc.setFontSize(12)
    doc.text("DATOS DEL ADQUIRENTE", 20, 75)
    doc.setFontSize(10)
    doc.text(`Nombre: ${userData?.full_name || "N/A"}`, 20, 85)
    doc.text(`Email: ${userData?.email || "N/A"}`, 20, 92)
    doc.text(`ID de Usuario: ${userId}`, 20, 99)

    // Property Information
    doc.setFontSize(12)
    doc.text("DATOS DE LA PROPIEDAD", 20, 115)
    doc.setFontSize(10)
    doc.text(`Propiedad: ${contractData.properties?.name || "N/A"}`, 20, 125)
    doc.text(`Ubicación: ${contractData.properties?.location || "N/A"}`, 20, 132)
    doc.text(`Serie: ${contractData.series_id}`, 20, 139)

    // Legal Text
    doc.setFontSize(12)
    doc.text("TÉRMINOS Y CONDICIONES", 20, 155)
    doc.setFontSize(9)
    const legalText = `
Este documento certifica la cesión de uso de tiempo compartido conforme a la NOM-029-SE-2021
y ha sido digitalizado conforme a la NOM-151-SCFI-2016 para garantizar su integridad y autenticidad.

El adquirente tiene derecho a:
- Uso de la propiedad durante la semana asignada
- Acceso al marketplace de servicios WEEKCHAIN
- Participación en el programa de referidos
- Transferencia o venta de su semana en el marketplace

Este contrato está sujeto a las leyes mexicanas y cuenta con un periodo de reflexión de 5 días
hábiles conforme a la NOM-029-SE-2021.
    `.trim()

    const lines = doc.splitTextToSize(legalText, 170)
    doc.text(lines, 20, 165)

    // Footer
    doc.setFontSize(8)
    doc.text("Este documento es legalmente válido conforme a la legislación mexicana", 105, 280, { align: "center" })
    doc.text("NOM-029-SE-2021 | NOM-151-SCFI-2016 | LFPDPPP", 105, 285, { align: "center" })

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-weekchain-${nom151.folio}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
