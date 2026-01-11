# EasyLex - Ejemplos de Uso

## Ejemplo 1: Emisión de Certificado con Firma Electrónica

```typescript
import { easylexClient } from "@/lib/easylex/client"
import { ContractGenerator } from "@/lib/pdf/contract-generator"

async function issueCertificateWithSignature(
  userId: string,
  certificateId: string,
  userData: any
) {
  // 1. Generar contrato PDF
  const contractData = {
    userId,
    series: "CERT",
    folio: `CERT-${Date.now()}`,
    propertyId: "property-123",
    weekNumber: 1,
    userName: userData.name,
    userEmail: userData.email,
  }

  const contract = await ContractGenerator.generateContract(contractData)

  // 2. Enviar a EasyLex para firma
  const document = await easylexClient.createDocument({
    documentId: `cert-${certificateId}`,
    documentName: `Certificado WEEK-CHAIN - ${contract.folio}`,
    documentContent: contract.pdfBase64,
    signers: [
      {
        name: userData.name,
        email: userData.email,
        role: "Titular del Certificado",
        order: 1,
      },
    ],
    metadata: {
      certificateId,
      userId,
      folio: contract.folio,
      documentHash: contract.documentHash,
    },
    webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/easylex/webhook`,
  })

  // 3. Guardar referencia en BD
  await supabase.from("user_certificates_v2").update({
    easylex_document_id: document.documentId,
    signature_status: "pending",
    signature_url: document.signUrl,
    nom151_hash: document.nom151Hash,
  }).eq("id", certificateId)

  return {
    documentId: document.documentId,
    signUrl: document.signUrl,
    widgetUrl: easylexClient.getWidgetUrl(document.documentId, userId),
  }
}
```

## Ejemplo 2: Reservación con Consentimiento Firmado

```typescript
async function createReservationWithConsent(
  userId: string,
  reservationData: any
) {
  // 1. Crear documento de consentimiento
  const consentDocument = generateConsentDocument(userId, reservationData)
  const base64Content = Buffer.from(consentDocument).toString("base64")

  // 2. Enviar a EasyLex
  const document = await easylexClient.createDocument({
    documentId: `reservation-${reservationData.id}`,
    documentName: "Consentimiento de Reservación",
    documentContent: base64Content,
    signers: [
      {
        name: reservationData.userName,
        email: reservationData.userEmail,
        role: "Usuario",
        order: 1,
      },
    ],
    metadata: {
      reservationId: reservationData.id,
      userId,
      propertyId: reservationData.propertyId,
    },
    webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/easylex/webhook`,
  })

  // 3. Actualizar reservación
  await supabase.from("reservation_requests").update({
    easylex_document_id: document.documentId,
    consent_signature_status: "pending",
  }).eq("id", reservationData.id)

  return document
}
```

## Ejemplo 3: Verificar Estado de Firma

```typescript
async function checkSignatureStatus(documentId: string) {
  const status = await easylexClient.getDocumentStatus(documentId)

  console.log("Signature status:", {
    documentId: status.documentId,
    status: status.status,
    signedAt: status.signedAt,
    nom151Hash: status.nom151Hash,
  })

  if (status.status === "signed") {
    // Descargar paquete de evidencia
    const evidencePackage = await easylexClient.getEvidencePackage(documentId)
    
    // Guardar evidencia
    // ... storage logic
  }

  return status
}
```

## Ejemplo 4: Usar Widget en Componente React

```tsx
import { EasylexSignatureWidget } from "@/components/easylex-signature-widget"

function CertificateSigningPage() {
  const [documentId, setDocumentId] = useState("")
  const [signerId, setSignerId] = useState("")

  const handleSignatureComplete = (data: any) => {
    console.log("Signature completed!", data)
    // Actualizar UI, mostrar confirmación, etc.
  }

  return (
    <div>
      <h1>Firma tu Certificado</h1>
      <EasylexSignatureWidget
        documentId={documentId}
        signerId={signerId}
        onComplete={handleSignatureComplete}
        onError={(error) => console.error(error)}
        height="700px"
      />
    </div>
  )
}
```

## Flujo Completo de Webhook

Cuando un usuario completa la firma en EasyLex:

1. **EasyLex envía webhook** a `/api/easylex/webhook`
2. **Webhook handler verifica** firma HMAC-SHA256
3. **Handler actualiza** el estado en la BD:
   - `signature_status: "signed"`
   - `signed_at: timestamp`
   - `nom151_hash: hash from EasyLex`
4. **Handler descarga** paquete de evidencia
5. **Handler registra** evento en `evidence_events`
6. **Sistema notifica** al usuario por email

## Testing

Para probar la integración:

1. Visita `/dashboard/admin/easylex-test`
2. Completa el formulario de prueba
3. Haz clic en "Crear Documento de Prueba"
4. El widget de firma aparecerá
5. Completa el proceso de firma
6. Verifica que el webhook se ejecute correctamente

## Variables de Entorno Requeridas

```
EASYLEX_API_KEY=bd70840c-65ce-4466-a629-80771870c3a8
EASYLEX_API_SECRET=77194297-19b7-4ef1-b402-0b87ca4f3490
EASYLEX_ENVIRONMENT=sandbox
EASYLEX_API_URL=https://sandboxapi.easylex.com
EASYLEX_WIDGET_URL=https://sandboxwg.easylex.com
EASYLEX_WEBHOOK_SECRET=<tu-webhook-secret>
```

## Mejores Prácticas

1. **Siempre verifica** la firma del webhook con HMAC-SHA256
2. **Guarda el documentId** en tu base de datos para referencia
3. **Descarga el paquete de evidencia** cuando el documento esté firmado
4. **Registra eventos** en `evidence_events` para cumplimiento NOM-151
5. **Maneja errores** gracefully y notifica al usuario
6. **Usa el widget** en lugar de redirigir a URLs externas
7. **Testea en sandbox** antes de ir a producción
