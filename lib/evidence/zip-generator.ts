import AdmZip from "adm-zip"
import { createClient } from "@supabase/supabase-js"
import { getEnv } from "@/lib/config/env-schema"

export interface EvidenceFiles {
  contract_pdf: Buffer
  certificate_pdf: Buffer
  metadata_json: string
  transaction_receipt: string
}

export async function generateEvidenceZip(
  contractId: string,
  files: EvidenceFiles,
): Promise<{ zipBuffer: Buffer; storagePath: string }> {
  const env = getEnv()

  // Create ZIP file
  const zip = new AdmZip()

  // Add files to ZIP
  zip.addFile("contract.pdf", files.contract_pdf)
  zip.addFile("certificate.pdf", files.certificate_pdf)
  zip.addFile("metadata.json", Buffer.from(files.metadata_json, "utf-8"))
  zip.addFile("transaction_receipt.txt", Buffer.from(files.transaction_receipt, "utf-8"))

  // Add README
  const readme = `
WEEK-CHAIN™ Legal Evidence Package
===================================

Contract ID: ${contractId}
Generated: ${new Date().toISOString()}

This package contains:
1. contract.pdf - Signed legal contract (NOM-151 certified)
2. certificate.pdf - NOM-151 certification document
3. metadata.json - NFT metadata with NOM-151 data
4. transaction_receipt.txt - Blockchain transaction details

All documents are cryptographically verified and stored on Solana blockchain.

For verification, visit: https://week-chain.com/verify/${contractId}
`
  zip.addFile("README.txt", Buffer.from(readme, "utf-8"))

  const zipBuffer = zip.toBuffer()

  // Upload to Supabase Storage
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  const storagePath = `evidence/${contractId}/evidence-package-${Date.now()}.zip`

  const { error } = await supabase.storage.from("legal-documents").upload(storagePath, zipBuffer, {
    contentType: "application/zip",
    upsert: false,
  })

  if (error) {
    throw new Error(`Failed to upload evidence ZIP: ${error.message}`)
  }

  console.log("[v0] Evidence ZIP generated and uploaded:", storagePath)

  return { zipBuffer, storagePath }
}
