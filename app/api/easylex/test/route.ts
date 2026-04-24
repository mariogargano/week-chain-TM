import { NextResponse } from "next/server"
import { easylexClient } from "@/lib/easylex/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { signerName, signerEmail, documentName, documentContent } = body

    if (!signerName || !signerEmail) {
      return NextResponse.json({ error: "Nombre y email del firmante son requeridos" }, { status: 400 })
    }

    // Generate test document ID
    const testDocumentId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const testSignerId = `signer-${Date.now()}`

    // Convert content to base64 (simulating PDF)
    const base64Content = Buffer.from(documentContent).toString("base64")

    console.log("[v0] Creating EasyLex test document:", {
      documentId: testDocumentId,
      signerName,
      signerEmail,
    })

    // Create document in EasyLex
    const document = await easylexClient.createDocument({
      documentId: testDocumentId,
      documentName: documentName || "Documento de Prueba",
      documentContent: base64Content,
      signers: [
        {
          name: signerName,
          email: signerEmail,
          role: "Firmante",
          order: 1,
        },
      ],
      metadata: {
        testMode: true,
        createdAt: new Date().toISOString(),
      },
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/easylex/webhook`,
    })

    console.log("[v0] EasyLex document created successfully:", document.documentId)

    return NextResponse.json({
      success: true,
      documentId: document.documentId,
      signerId: testSignerId,
      status: document.status,
      signUrl: document.signUrl,
      nom151Hash: document.nom151Hash,
      message: "Documento creado exitosamente. Usa el widget para firmar.",
    })
  } catch (error: any) {
    console.error("[v0] EasyLex test error:", error)
    return NextResponse.json(
      {
        error: error.message || "Error al crear documento de prueba",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
