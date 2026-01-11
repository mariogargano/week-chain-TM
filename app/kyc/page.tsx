"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle2, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"
import { PersonaKYCWidget } from "@/components/persona-kyc-widget"

export default function KYCPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please sign in to complete KYC")
      router.push("/auth?redirect=/kyc")
      return
    }

    setUser(user)

    const { data: kycData } = await supabase.from("kyc_users").select("*").eq("email", user.email).single()

    if (kycData) {
      setKycStatus(kycData.status)
      if (kycData.status === "approved") {
        toast.success("Your KYC is already approved!")
      }
    }

    setLoading(false)
  }

  const handleComplete = () => {
    toast.success("KYC verification submitted! We'll review your application shortly.")
    setKycStatus("pending")
  }

  const handleError = (error: any) => {
    toast.error("An error occurred during verification. Please try again.")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading verification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Secure Verification</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Identity Verification</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete your KYC verification to unlock full platform access and start investing in tokenized real estate.
          </p>
        </div>

        {kycStatus === "approved" && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Verification Approved</h3>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Your identity has been verified. You have full access to all platform features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kycStatus === "pending" && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Verification In Progress</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    We're reviewing your documents. This typically takes 24-48 hours. We'll email you once complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kycStatus === "rejected" && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Verification Requires Attention</h3>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    We were unable to verify your identity. Please submit new documents below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(!kycStatus || kycStatus === "rejected") && user && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Verification</CardTitle>
              <CardDescription>
                Follow the steps below to verify your identity. You'll need a government-issued ID and a selfie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonaKYCWidget
                userId={user.id}
                userEmail={user.email}
                onComplete={handleComplete}
                onError={handleError}
              />
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Shield className="inline h-4 w-4 mr-1" />
            Your data is encrypted and securely stored. We comply with international data protection regulations.
          </p>
        </div>
      </div>
    </div>
  )
}
