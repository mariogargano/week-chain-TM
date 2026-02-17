interface LegalarioConfig {
  apiUrl: string
  apiKey: string
}

interface LegalarioSigner {
  name: string
  email: string
  role: string
}

interface LegalarioContract {
  id: string
  title: string
  status: string
  signers: Array<{
    name: string
    email: string
    role: string
    signature_url: string
    signed_at?: string
  }>
  created_at: string
  signed_at?: string
  certificate_url?: string
}

interface CreateContractParams {
  title: string
  file: string // URL to PDF file
  signers: LegalarioSigner[]
  callback_url?: string
}

export class LegalarioClient {
  private config: LegalarioConfig

  constructor(config?: Partial<LegalarioConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.LEGALARIO_API_URL || "https://api.legalario.com/v1",
      apiKey: config?.apiKey || process.env.LEGALARIO_API_KEY || "",
    }

    if (!this.config.apiKey) {
      throw new Error("Legalario API credentials not configured")
    }
  }

  private getAuthHeader(): string {
    return `Bearer ${this.config.apiKey}`
  }

  /**
   * Create a contract in Legalario for signature
   */
  async createContract(params: CreateContractParams): Promise<LegalarioContract> {
    const response = await fetch(`${this.config.apiUrl}/contracts`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: params.title,
        file: params.file,
        signers: params.signers,
        callback_url: params.callback_url,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Legalario API error: ${response.status} - ${error}`)
    }

    return await response.json()
  }

  /**
   * Get contract status and certificate
   */
  async getContract(contractId: string): Promise<LegalarioContract> {
    const response = await fetch(`${this.config.apiUrl}/contracts/${contractId}`, {
      headers: {
        Authorization: this.getAuthHeader(),
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Legalario API error: ${response.status} - ${error}`)
    }

    return await response.json()
  }

  /**
   * Download signed contract PDF
   */
  async downloadContract(contractId: string): Promise<Buffer> {
    const response = await fetch(`${this.config.apiUrl}/contracts/${contractId}/download`, {
      headers: {
        Authorization: this.getAuthHeader(),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download contract: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}

export default LegalarioClient
