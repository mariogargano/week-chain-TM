"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface LegalDocument {
  id: string
  document_type: string
  version: string
  title: string
  content: string
  effective_date: string
}

interface LegalAcceptanceModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (acceptanceData: AcceptanceData) => Promise<void>
  documents: LegalDocument[]
}

export interface AcceptanceData {
  document_id: string
  document_type: string
  document_version: string
  scroll_percentage: number
  time_spent_seconds: number
  explicit_checkbox_checked: boolean
  ip_address?: string
  user_agent?: string
}

export function LegalAcceptanceModal({ isOpen, onClose, onAccept, documents }: LegalAcceptanceModalProps) {
  const [currentDocIndex, setCurrentDocIndex] = useState(0)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptedDocs, setAcceptedDocs] = useState<Set<string>>(new Set())

  const currentDoc = documents[currentDocIndex]
  const allDocsAccepted = acceptedDocs.size === documents.length
  const canProceed = scrollPercentage >= 80 && timeSpent >= 10 && checkboxChecked

  // Timer para tracking de tiempo
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, currentDocIndex])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight - target.clientHeight
    const percentage = Math.round((scrollTop / scrollHeight) * 100)
    setScrollPercentage(Math.max(scrollPercentage, percentage))
  }

  const handleAcceptDocument = async () => {
    if (!canProceed || !currentDoc) return

    setIsAccepting(true)
    try {
      const acceptanceData: AcceptanceData = {
        document_id: currentDoc.id,
        document_type: currentDoc.document_type,
        document_version: currentDoc.version,
        scroll_percentage: scrollPercentage,
        time_spent_seconds: timeSpent,
        explicit_checkbox_checked: checkboxChecked,
        user_agent: navigator.userAgent,
      }

      await onAccept(acceptanceData)
      setAcceptedDocs((prev) => new Set(prev).add(currentDoc.id))

      // Si hay más documentos, pasar al siguiente
      if (currentDocIndex < documents.length - 1) {
        setCurrentDocIndex(currentDocIndex + 1)
        setScrollPercentage(0)
        setTimeSpent(0)
        setCheckboxChecked(false)
      } else {
        // Todos los documentos aceptados
        onClose()
      }
    } catch (error) {
      console.error("Error accepting document:", error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (!currentDoc) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {currentDoc.title}
          </DialogTitle>
          <DialogDescription>
            Documento {currentDocIndex + 1} de {documents.length} • Versión {currentDoc.version}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicators */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                scrollPercentage >= 80 ? "bg-green-500" : "bg-amber-500 animate-pulse",
              )}
            />
            <span className="text-muted-foreground">
              Lectura: {scrollPercentage}% {scrollPercentage < 80 && "(mínimo 80%)"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn("h-2 w-2 rounded-full", timeSpent >= 10 ? "bg-green-500" : "bg-amber-500 animate-pulse")}
            />
            <span className="text-muted-foreground">
              Tiempo: {timeSpent}s {timeSpent < 10 && "(mínimo 10s)"}
            </span>
          </div>
        </div>

        {/* Document content */}
        <ScrollArea className="flex-1 border rounded-md p-6 bg-muted/20" onScrollCapture={handleScroll}>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{currentDoc.content}</div>
          </div>
        </ScrollArea>

        {/* Warning notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Evidencia Legal Click-Wrap</p>
            <p>
              Tu aceptación será registrada con evidencia completa incluyendo: porcentaje de lectura, tiempo dedicado,
              dirección IP y marca temporal. Esta información tiene validez legal conforme a la legislación mexicana.
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-start space-x-3 py-4">
          <Checkbox
            id="accept-terms"
            checked={checkboxChecked}
            onCheckedChange={(checked) => setCheckboxChecked(checked as boolean)}
            disabled={scrollPercentage < 80 || timeSpent < 10}
          />
          <label
            htmlFor="accept-terms"
            className="text-sm font-medium leading-relaxed cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            He leído completamente y acepto los <span className="font-bold text-slate-900">{currentDoc.title}</span>.
            Entiendo que este documento tiene validez legal y que mi aceptación será registrada con evidencia completa.
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAccepting}>
            Cancelar
          </Button>
          <Button onClick={handleAcceptDocument} disabled={!canProceed || isAccepting}>
            {isAccepting
              ? "Registrando..."
              : currentDocIndex < documents.length - 1
                ? "Aceptar y Continuar"
                : "Aceptar y Finalizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
