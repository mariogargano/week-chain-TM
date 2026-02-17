import { logger } from "@/lib/config/logger"

export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

export class GoogleAuthClient {
  private get clientId(): string {
    return process.env.GOOGLE_CLIENT_ID || ""
  }

  private get clientSecret(): string {
    return process.env.GOOGLE_CLIENT_SECRET || ""
  }

  private get redirectUri(): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return `${baseUrl}/api/auth/google/callback`
  }

  isConfigured(): boolean {
    const configured = Boolean(this.clientId && this.clientSecret)
    if (!configured) {
      logger.warn("Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET")
    }
    return configured
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account", // Changed from 'consent' to 'select_account' for better UX
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string
    id_token: string
    refresh_token?: string
  }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error("Failed to exchange code for tokens:", error)
      throw new Error("Failed to authenticate with Google")
    }

    return response.json()
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error("Failed to get user info:", error)
      throw new Error("Failed to get user information from Google")
    }

    return response.json()
  }
}

export const googleAuth = new GoogleAuthClient()
