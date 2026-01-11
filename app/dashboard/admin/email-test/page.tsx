"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, CheckCircle2, XCircle, Loader2 } from "lucide-react"

const EMAIL_TYPES = [
  { value: "welcome", label: "Welcome Email" },
  { value: "certificate_purchased", label: "Certificate Purchased" },
  { value: "reservation_request_submitted", label: "Reservation Request Submitted" },
  { value: "reservation_offer_available", label: "Reservation Offer Available" },
  { value: "reservation_confirmed", label: "Reservation Confirmed" },
  { value: "payment_reminder", label: "Payment Reminder" },
  { value: "kyc_approved", label: "KYC Approved" },
  { value: "kyc_rejected", label: "KYC Rejected" },
]

export default function EmailTestPage() {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [templateType, setTemplateType] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSendTest() {
    if (!recipientEmail || !templateType) {
      setResult({ success: false, message: "Please fill all fields" })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          templateType,
          context: generateTestContext(templateType),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: `Test email sent successfully! Message ID: ${data.message_id}`,
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to send test email",
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Error sending test email",
      })
    } finally {
      setSending(false)
    }
  }

  function generateTestContext(type: string): Record<string, any> {
    const baseContext = {
      user_name: "Test User",
      dashboard_url: `${window.location.origin}/dashboard`,
      unsubscribe_url: `${window.location.origin}/unsubscribe`,
      support_email: "soporte@week-chain.com",
      support_phone: "+52 55 1234 5678",
    }

    switch (type) {
      case "certificate_purchased":
        return {
          ...baseContext,
          certificate_id: "WC-2025-TEST",
          amount_usd: "1,499",
          payment_date: new Date().toLocaleDateString(),
        }
      case "reservation_request_submitted":
      case "reservation_offer_available":
      case "reservation_confirmed":
        return {
          ...baseContext,
          property_name: "Villa Paradise Cancún",
          property_location: "Cancún, Quintana Roo, México",
          check_in_date: "15 Marzo 2025",
          check_out_date: "22 Marzo 2025",
          booking_reference: "BK-TEST-001",
          offer_expires_at: "18 Marzo 2025 14:00",
          confirm_url: `${window.location.origin}/booking/confirm/test`,
        }
      default:
        return baseContext
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Test Email System</h1>
            <p className="text-slate-600 mt-1">Send test emails to verify templates and delivery</p>
          </div>

          {/* Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Select a template type and recipient to send a test email with sample data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Email Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select template type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSendTest} disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Flow Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">1. Verify Email Delivery</h4>
                <p>Send test emails to check SMTP configuration and Resend integration</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">2. Check Template Rendering</h4>
                <p>Verify that variables are replaced correctly and HTML renders properly</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">3. Test Tracking</h4>
                <p>Open and click emails to verify tracking pixels and analytics logging</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">4. Review Logs</h4>
                <p>Check Email Logs page to see delivery status, opens, clicks and errors</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
