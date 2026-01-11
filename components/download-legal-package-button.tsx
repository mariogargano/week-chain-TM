"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, FileArchive } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DownloadLegalPackageButtonProps {
  bookingId: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function DownloadLegalPackageButton({
  bookingId,
  variant = "default",
  size = "default",
  className,
}: DownloadLegalPackageButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      const response = await fetch(`/api/legal/download-package?booking_id=${bookingId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to download package")
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] || `WEEKCHAIN-Legal-${bookingId}.zip`

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Descarga exitosa",
        description: "El paquete de documentos legales se ha descargado correctamente.",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error al descargar",
        description: error instanceof Error ? error.message : "No se pudo descargar el paquete",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isDownloading} variant={variant} size={size} className={className}>
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Descargando...
        </>
      ) : (
        <>
          <FileArchive className="mr-2 h-4 w-4" />
          Descargar Paquete Legal
        </>
      )}
    </Button>
  )
}
