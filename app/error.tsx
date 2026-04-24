"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Root error boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-2xl font-bold text-destructive">Algo salió mal!</h2>
        <p className="text-muted-foreground">{error.message || "Ha ocurrido un error inesperado"}</p>
        <Button onClick={reset}>Intentar de nuevo</Button>
      </div>
    </div>
  )
}
