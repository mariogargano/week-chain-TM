import { logger } from "@/lib/config/logger"

interface GoogleWalletConfig {
  issuerId: string
  serviceAccountEmail: string
  serviceAccountKey: string
}

interface WeekPass {
  propertyName: string
  weekNumber: number
  year: number
  checkIn: string
  checkOut: string
  voucherCode: string
  ownerName: string
  propertyImage?: string
}

export class GoogleWalletClient {
  private config: GoogleWalletConfig | null = null
  private accessToken: string | null = null
  private tokenExpiry = 0

  constructor() {
    if (
      process.env.GOOGLE_WALLET_ISSUER_ID &&
      process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY
    ) {
      this.config = {
        issuerId: process.env.GOOGLE_WALLET_ISSUER_ID,
        serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
        serviceAccountKey: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY,
      }
    }
  }

  isConfigured(): boolean {
    return this.config !== null
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    if (!this.config) {
      throw new Error("Google Wallet not configured")
    }

    try {
      const jwt = await this.createJWT()

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000 // 1 min buffer

      return this.accessToken
    } catch (error) {
      logger.error("Failed to get Google Wallet access token:", error)
      throw error
    }
  }

  private async createJWT(): Promise<string> {
    if (!this.config) throw new Error("Google Wallet not configured")

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: this.config.serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/wallet_object.issuer",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }

    const crypto = require("crypto")
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
    const signature = crypto
      .createSign("RSA-SHA256")
      .update(`${header}.${body}`)
      .sign(this.config.serviceAccountKey, "base64url")

    return `${header}.${body}.${signature}`
  }

  async createWeekPass(weekPass: WeekPass): Promise<string> {
    if (!this.isConfigured()) {
      logger.warn("Google Wallet not configured, returning demo URL")
      return `https://pay.google.com/gp/v/save/demo-${weekPass.voucherCode}`
    }

    try {
      const accessToken = await this.getAccessToken()
      const classId = `${this.config!.issuerId}.week_pass_class`
      const objectId = `${this.config!.issuerId}.${weekPass.voucherCode}`

      await this.createPassClass(classId, accessToken)

      const passObject = {
        id: objectId,
        classId: classId,
        state: "ACTIVE",
        heroImage: {
          sourceUri: {
            uri: weekPass.propertyImage || "https://week-chain.com/default-property.jpg",
          },
        },
        textModulesData: [
          {
            header: "Property",
            body: weekPass.propertyName,
          },
          {
            header: "Week",
            body: `Week ${weekPass.weekNumber}, ${weekPass.year}`,
          },
          {
            header: "Check-in",
            body: weekPass.checkIn,
          },
          {
            header: "Check-out",
            body: weekPass.checkOut,
          },
        ],
        barcode: {
          type: "QR_CODE",
          value: weekPass.voucherCode,
        },
        cardTitle: {
          defaultValue: {
            language: "en-US",
            value: weekPass.ownerName,
          },
        },
      }

      const response = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/genericObject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passObject),
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error("Failed to create Google Wallet pass:", error)
        throw new Error(`Failed to create pass: ${response.statusText}`)
      }

      const saveUrl = `https://pay.google.com/gp/v/save/${Buffer.from(JSON.stringify(passObject)).toString("base64url")}`

      logger.info("Google Wallet pass created successfully:", objectId)
      return saveUrl
    } catch (error) {
      logger.error("Error creating Google Wallet pass:", error)
      throw error
    }
  }

  private async createPassClass(classId: string, accessToken: string): Promise<void> {
    try {
      const classObject = {
        id: classId,
        classTemplateInfo: {
          cardTemplateOverride: {
            cardRowTemplateInfos: [
              {
                twoItems: {
                  startItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldPath: "object.textModulesData['property']",
                        },
                      ],
                    },
                  },
                  endItem: {
                    firstValue: {
                      fields: [
                        {
                          fieldPath: "object.textModulesData['week']",
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      }

      await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/genericClass`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classObject),
      })
    } catch (error) {
      // Class might already exist, ignore error
      logger.debug("Pass class creation skipped (may already exist)")
    }
  }
}

export const googleWallet = new GoogleWalletClient()
