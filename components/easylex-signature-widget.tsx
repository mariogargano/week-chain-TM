"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface EasylexSignatureWidgetProps {
  documentId: string
  signerId: string
  onComplete?: (success: boolean) => void
  onError?: (error: string) => void
}

export function EasylexSignatureWidget({ documentId, signerId, onComplete, onError }: EasylexSignatureWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "signing" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin
      if (!event.origin.includes("easylex.com")) return

      const { type, data } = event.data

      switch (type) {
        case "easylex:ready":
          setStatus("ready")
          break

        case "easylex:signing":
          setStatus("signing")
          break

        case "easylex:success":
          setStatus("success")
          onComplete?.(true)
          break

        case "easylex:error":
          setStatus("error")
          setErrorMessage(data.message || "Error desconocido")
          onError?.(data.message)
          break

        case "easylex:cancelled":
          setStatus("error")
          setErrorMessage("Firma cancelada por el usuario")
          onComplete?.(false)
          break
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onComplete, onError])

  const widgetUrl = `https://sandboxwg.easylex.com?documentId=${documentId}&signerId=${signerId}`

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Firma Electrónica NOM-151</h3>
          {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
        </div>

        {status === "error" && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Documento firmado exitosamente. La evidencia digital ha sido registrada conforme a NOM-151.
            </AlertDescription>
          </Alert>
        )}

        {status !== "success" && (
          <div className="border rounded-lg overflow-hidden">
            <iframe
              ref={iframeRef}
              src={widgetUrl}
              className="w-full h-[600px]"
              allow="camera; microphone"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        )}

        {status === "ready" && (
          <p className="text-sm text-muted-foreground">
            Por favor, completa el proceso de firma electrónica. Este documento cumple con la NOM-151-SCFI-2016 para
            evidencia digital en México.
          </p>
        )}
      </div>
    </Card>
  )
}
