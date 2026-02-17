"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { isDemoMode } from "@/lib/config/environment"
import { useEffect } from "react"

export default function VerifyEmailPage() {
  const router = useRouter()

  useEffect(() => {
    if (isDemoMode()) {
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }
  }, [router])

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{isDemoMode() ? "Demo Mode Active" : "Check your email"}</CardTitle>
            <CardDescription>
              {isDemoMode() ? "Email verification is disabled in demo mode" : "We've sent you a verification link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              {isDemoMode()
                ? "You can access all features without email verification. Redirecting to dashboard..."
                : "Please check your email and click the verification link to activate your account. You can close this page once you've verified your email."}
            </p>
            {isDemoMode() && (
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
