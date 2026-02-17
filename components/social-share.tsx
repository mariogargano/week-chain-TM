"use client"

import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SocialShareProps {
  url?: string
  title?: string
  description?: string
  className?: string
}

export function SocialShare({
  url = typeof window !== "undefined" ? window.location.href : "https://weekchain.com",
  title = "WEEK-CHAIN - Semanas Vacacionales de Lujo",
  description = "Compra semanas vacacionales en alojamientos de lujo en México",
  className = "",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-slate-600 mr-2">Compartir:</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent"
        onClick={() => window.open(shareLinks.facebook, "_blank", "width=600,height=400")}
        aria-label="Compartir en Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200 bg-transparent"
        onClick={() => window.open(shareLinks.twitter, "_blank", "width=600,height=400")}
        aria-label="Compartir en Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 bg-transparent"
        onClick={() => window.open(shareLinks.linkedin, "_blank", "width=600,height=400")}
        aria-label="Compartir en LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-slate-100 bg-transparent"
        onClick={copyToClipboard}
        aria-label="Copiar enlace"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
