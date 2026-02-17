"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText, Loader2, XCircle } from "lucide-react"

interface User {
  name: string
  email: string
  role: string
}

export function LegalarioFlow() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [status, setStatus] = useState<{ [key: string]: "idle" | "loading" | "success" | "error" }>({})

  // Mock users - replace with actual data from Supabase
  useEffect(() => {
    setUsers([
      { name: "John Developer", email: "john@dev.com", role: "developer" },
      { name: "Lisa Broker", email: "lisa@broker.com", role: "broker" },
      { name: "Alex Provider", email: "alex@provider.com", role: "provider" },
    ])
  }, [])

  const sendContract = async (user: User) => {
    try {
      setLoading(user.email)
      setStatus((prev) => ({ ...prev, [user.email]: "loading" }))

      const response = await fetch("/api/legalario/init-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signerName: user.name,
          signerEmail: user.email,
          role: user.role,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send contract")
      }

      const data = await response.json()

      // Open signature URL in new tab
      if (data.signature_url) {
        window.open(data.signature_url, "_blank")
      }

      setStatus((prev) => ({ ...prev, [user.email]: "success" }))
    } catch (err) {
      console.error("[v0] Error sending contract:", err)
      setStatus((prev) => ({ ...prev, [user.email]: "error" }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">WEEK-CHAIN™ Legalario Signature Flow</h1>
        <p className="text-slate-600 leading-relaxed">
          Manage all legal onboarding through Legalario. Each user signs a single Master Agreement covering Terms,
          Privacy Policy, and Service Conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.email} className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription className="uppercase font-semibold text-brand-coral">{user.role}</CardDescription>
              <p className="text-sm text-slate-500">{user.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                disabled={loading === user.email}
                onClick={() => sendContract(user)}
                className="w-full bg-gradient-to-r from-brand-coral to-brand-lavender hover:from-brand-coral/90 hover:to-brand-lavender/90 text-white rounded-xl"
              >
                {loading === user.email ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Send Legalario Contract
                  </>
                )}
              </Button>

              {status[user.email] === "success" && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Contract sent! Check email for signature link.
                </div>
              )}

              {status[user.email] === "error" && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <XCircle className="h-4 w-4" />
                  Error sending contract. Please try again.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-2 border-brand-mint/30 bg-brand-mint/5">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-coral/20 text-brand-coral font-bold flex-shrink-0">
              1
            </div>
            <p>Click "Send Legalario Contract" to create a signature request for the user</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-coral/20 text-brand-coral font-bold flex-shrink-0">
              2
            </div>
            <p>The user receives an email with a secure signature link from Legalario</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-coral/20 text-brand-coral font-bold flex-shrink-0">
              3
            </div>
            <p>Once signed, a webhook updates the database and the user can proceed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
