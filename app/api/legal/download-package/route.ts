import { type NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"
import { createClient } from "@/lib/supabase/server"
import { createHash } from "crypto"

function sha256(buf: Uint8Array | ArrayBuffer): string {
  const buffer = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
  return createHash("sha256").update(buffer).digest("hex")
}

export async function GET(req: NextRequest) {
  try {
    const bookingId = req.nextUrl.searchParams.get("booking_id")

    if (!bookingId) {
      return NextResponse.json({ error: "booking_id is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("user_wallet")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const userRole = user.user_metadata?.role
    const isAdmin = userRole === "admin" || userRole === "management"

    if (!isAdmin && booking.user_wallet !== user.user_metadata?.wallet_address) {
      return NextResponse.json({ error: "Forbidden: You don't own this booking" }, { status: 403 })
    }

    const zip = new JSZip()
    let filesAdded = 0
    const manifestFiles: Array<{ name: string; sha256: string; size: number }> = []

    // 1. Contract PDF
    try {
      const { data: contractPDF } = await supabase.storage.from("legal").download(`contracts/${bookingId}.pdf`)

      if (contractPDF) {
        const buffer = await contractPDF.arrayBuffer()
        const hash = sha256(buffer)
        zip.file("1_contrato_compraventa.pdf", buffer)
        manifestFiles.push({ name: "1_contrato_compraventa.pdf", sha256: hash, size: buffer.byteLength })
        filesAdded++
      }
    } catch (error) {
      console.error("[v0] Error downloading contract:", error)
    }

    // 2. NOM-151 Certificate PDF
    try {
      const { data: certPDF } = await supabase.storage.from("legal").download(`certificates/${bookingId}.pdf`)

      if (certPDF) {
        const buffer = await certPDF.arrayBuffer()
        const hash = sha256(buffer)
        zip.file("2_certificado_nom151.pdf", buffer)
        manifestFiles.push({ name: "2_certificado_nom151.pdf", sha256: hash, size: buffer.byteLength })
        filesAdded++
      }
    } catch (error) {
      console.error("[v0] Error downloading certificate:", error)
    }

    // 3. NFT Metadata JSON
    try {
      const { data: metadata } = await supabase
        .from("nft_metadata")
        .select("metadata")
        .eq("booking_id", bookingId)
        .single()

      if (metadata?.metadata) {
        const content = JSON.stringify(metadata.metadata, null, 2)
        const buffer = new TextEncoder().encode(content)
        const hash = sha256(buffer)
        zip.file("3_metadata_nft.json", content)
        manifestFiles.push({ name: "3_metadata_nft.json", sha256: hash, size: buffer.byteLength })
        filesAdded++
      }
    } catch (error) {
      console.error("[v0] Error fetching metadata:", error)
    }

    // 4. Escrow Receipt PDF
    try {
      const { data: escrowPDF } = await supabase.storage.from("legal").download(`escrow/${bookingId}.pdf`)

      if (escrowPDF) {
        const buffer = await escrowPDF.arrayBuffer()
        const hash = sha256(buffer)
        zip.file("4_comprobante_escrow.pdf", buffer)
        manifestFiles.push({ name: "4_comprobante_escrow.pdf", sha256: hash, size: buffer.byteLength })
        filesAdded++
      }
    } catch (error) {
      console.error("[v0] Error downloading escrow receipt:", error)
    }

    // 5. Payment Receipt PDF
    try {
      const { data: paymentPDF } = await supabase.storage.from("legal").download(`payments/${bookingId}.pdf`)

      if (paymentPDF) {
        const buffer = await paymentPDF.arrayBuffer()
        const hash = sha256(buffer)
        zip.file("5_comprobante_pago.pdf", buffer)
        manifestFiles.push({ name: "5_comprobante_pago.pdf", sha256: hash, size: buffer.byteLength })
        filesAdded++
      }
    } catch (error) {
      console.error("[v0] Error downloading payment receipt:", error)
    }

    // 6. Terms & Conditions (accepted version)
    try {
      const { data: acceptance } = await supabase
        .from("terms_acceptances")
        .select(`
          version,
          terms_versions(content)
        `)
        .eq("user_id", user.id)
        .eq("booking_id", bookingId)
        .single()

      if (acceptance?.terms_versions?.content) {
        const content = acceptance.terms_versions.content
        const buffer = new TextEncoder().encode(content)
        const hash = sha256(buffer)
        zip.file("6_terminos_y_condiciones.txt", content)
        manifestFiles.push({ name: "6_terminos_y_condiciones.txt", sha256: hash, size: buffer.byteLength })
        filesAdded++
      }
    } catch (error) {
      console.error("[v0] Error fetching terms:", error)
    }

    // 7. Add README with information
    const readme = `
WEEK-CHAIN™ - Paquete de Documentación Legal
============================================

Booking ID: ${bookingId}
Fecha de descarga: ${new Date().toISOString()}
Usuario: ${user.email}

Contenido del paquete:
----------------------
1. Contrato de Compraventa
2. Certificado NOM-151-SCFI-2016 (Documento Digital Certificado)
3. Metadata del NFT (JSON)
4. Comprobante de Escrow
5. Comprobante de Pago
6. Términos y Condiciones Aceptados
7. Manifest.json (Checksums SHA-256 de todos los archivos)

Información Legal:
------------------
Todos los documentos en este paquete son legalmente vinculantes y han sido
certificados bajo la NOM-151-SCFI-2016 para documentos digitales en México.

El certificado NOM-151 garantiza:
- Autenticidad del documento
- Integridad del contenido (SHA-256)
- No repudio de las partes firmantes
- Validez legal equivalente a documento físico

Verificación de Integridad:
---------------------------
Este paquete incluye un archivo manifest.json con los checksums SHA-256 de
todos los documentos. Para verificar la integridad de cualquier archivo:

1. Calcule el SHA-256 del archivo descargado
2. Compare con el hash en manifest.json
3. Si coinciden, el archivo no ha sido modificado

El ZIP completo también incluye un checksum SHA-256 en el header HTTP
X-Checksum-SHA256 para verificar la integridad del paquete completo.

Para verificar la autenticidad de cualquier documento, puede consultar:
- Folio NOM-151 en el certificado
- Hash SHA-256 del documento
- Timestamp de certificación

Contacto:
---------
WEEK-CHAIN™
Email: legal@week-chain.com
Web: https://week-chain.com

Property of MORISES LLC
© ${new Date().getFullYear()} WEEK-CHAIN™. All rights reserved.
`
    const readmeBuffer = new TextEncoder().encode(readme)
    const readmeHash = sha256(readmeBuffer)
    zip.file("README.txt", readme)
    manifestFiles.push({ name: "README.txt", sha256: readmeHash, size: readmeBuffer.byteLength })

    const manifest = {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      bookingId,
      userId: user.id,
      userEmail: user.email,
      filesCount: filesAdded,
      files: manifestFiles,
      note: "Verify file integrity by comparing SHA-256 checksums. All documents are legally binding and NOM-151 certified.",
    }

    const manifestContent = JSON.stringify(manifest, null, 2)
    zip.file("manifest.json", manifestContent)

    if (filesAdded === 0) {
      return NextResponse.json({ error: "No documents found for this booking" }, { status: 404 })
    }

    const content = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    })

    const zipChecksum = sha256(content)

    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "download_legal_package",
      resource_type: "booking",
      resource_id: bookingId,
      metadata: {
        files_count: filesAdded,
        zip_checksum: zipChecksum,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        user_agent: req.headers.get("user-agent"),
      },
    })

    return new Response(content, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="WEEKCHAIN-Legal-${bookingId}-${Date.now()}.zip"`,
        "Content-Length": content.length.toString(),
        "X-Checksum-SHA256": zipChecksum,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating legal package:", error)
    return NextResponse.json({ error: "Failed to generate legal package" }, { status: 500 })
  }
}
