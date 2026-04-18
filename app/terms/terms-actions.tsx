"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface TermsActionsProps {
  acceptLabel: string
  backButton: string
  acceptButton: string
  processing: string
  digitalSignature: string
}

export function TermsActions({
  acceptLabel,
  backButton,
  acceptButton,
  processing,
  digitalSignature,
}: TermsActionsProps) {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAcceptTerms = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/legal/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terms_version: "v1.0",
          accepted: true,
        }),
      })

      if (!response.ok) throw new Error("Error al aceptar términos")

      toast({
        title: "Términos Aceptados",
        description: "Has aceptado los términos y condiciones correctamente.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron aceptar los términos. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Checkbox
          id="accept"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked as boolean)}
          className="mt-1"
        />
        <label htmlFor="accept" className="text-sm font-medium leading-relaxed cursor-pointer">
          {acceptLabel}
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          {backButton}
        </Button>
        <Button disabled={!accepted || loading} onClick={handleAcceptTerms} className="flex-1">
          {loading ? processing : acceptButton}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">{digitalSignature}</p>
    </div>
  )
}
