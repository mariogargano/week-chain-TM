import { getEnv } from "@/lib/config/env-schema"

export interface EasylexConfig {
  apiUrl: string
  widgetUrl: string
  apiKey: string
  environment: "sandbox" | "production"
}

export interface EasylexDocumentRequest {
  documentId: string
  documentName: string
  documentContent: string // Base64 encoded PDF
  signers: Array<{
    name: string
    email: string
    role: string
    order: number
  }>
  metadata?: Record<string, any>
  webhookUrl?: string
}

export interface EasylexDocumentResponse {
  documentId: string
  status: "pending" | "signed" | "rejected"
  signUrl: string
  nom151Hash: string
  createdAt: string
}

export interface EasylexSignatureStatus {
  documentId: string
  status: "pending" | "signed" | "rejected" | "expired"
  signedAt?: string
  nom151Hash?: string
  certificateUrl?: string
  evidencePackage?: string
}

export class EasylexClient {
  private config: EasylexConfig

  constructor() {
    const env = getEnv()

    this.config = {
      apiUrl: env.EASYLEX_API_URL || "https://sandboxapi.easylex.com",
      widgetUrl: env.EASYLEX_WIDGET_URL || "https://sandboxwg.easylex.com",
      apiKey: env.EASYLEX_API_KEY || "",
      environment: (env.EASYLEX_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(`EasyLex API error: ${response.status} - ${error.message || error.error}`)
    }

    return response.json()
  }

  async createDocument(request: EasylexDocumentRequest): Promise<EasylexDocumentResponse> {
    return this.makeRequest<EasylexDocumentResponse>("/api/v1/documents", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async getDocumentStatus(documentId: string): Promise<EasylexSignatureStatus> {
    return this.makeRequest<EasylexSignatureStatus>(`/api/v1/documents/${documentId}`)
  }

  async getEvidencePackage(documentId: string): Promise<Blob> {
    const response = await fetch(`${this.config.apiUrl}/api/v1/documents/${documentId}/evidence`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get evidence package: ${response.status}`)
    }

    return response.blob()
  }

  getWidgetUrl(documentId: string, signerId: string): string {
    return `${this.config.widgetUrl}?documentId=${documentId}&signerId=${signerId}&apiKey=${this.config.apiKey}`
  }
}

export const easylexClient = new EasylexClient()
