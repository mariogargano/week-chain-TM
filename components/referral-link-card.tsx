"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2, Network, Mail, MessageCircle, QrCode } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ReferralLinkCardProps {
  brokerId: string
  isBroker?: boolean
}

export function ReferralLinkCard({ brokerId, isBroker = true }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/properties?ref=${brokerId}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `🏖️ ¡Adquiere propiedades vacacionales con WEEK-CHAIN!\n\nTokenización de semanas vacacionales con blockchain.\n\n${referralLink}`,
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const shareViaTelegram = () => {
    const message = encodeURIComponent(
      "🏖️ Adquiere propiedades vacacionales con WEEK-CHAIN! Tokenización de semanas con blockchain.",
    )
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${message}`, "_blank")
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Adquiere WEEK-CHAIN - Propiedades Vacacionales Tokenizadas")
    const body = encodeURIComponent(
      `Hola,\n\nQuiero compartir contigo una oportunidad única de adquisición de propiedades vacacionales.\n\nWEEK-CHAIN te permite comprar semanas de propiedades de lujo usando tecnología blockchain.\n\nBeneficios:\n✓ Propiedad fraccionada de propiedades premium\n✓ NFTs en Solana como certificado de propiedad\n✓ Intercambio de semanas con otros propietarios\n✓ Adquisición desde $5,000 USD\n\nDescubre más aquí: ${referralLink}\n\n¡Saludos!`,
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const shareViaTwitter = () => {
    const text = encodeURIComponent(
      "🏖️ Adquiere propiedades vacacionales con tecnología blockchain. Semanas tokenizadas en propiedades de lujo 🚀",
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, "_blank")
  }

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank")
  }

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, "_blank")
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Únete a WEEK-CHAIN",
          text: "Adquiere propiedades vacacionales por semana con tecnología blockchain",
          url: referralLink,
        })
      } catch (error) {
        console.error("[v0] Share error:", error)
      }
    } else {
      copyToClipboard()
    }
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(referralLink)}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Tu Enlace de Referido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isBroker
            ? "Comparte este enlace con potenciales clientes. Ganarás comisiones en cada venta exitosa."
            : "Comparte este enlace con amigos. Ganarás 3% de comisión en cada compra que realicen."}
        </p>

        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-sm" />
          <Button onClick={copyToClipboard} variant="outline" size="icon">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Compartir en:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={shareViaWhatsApp} variant="outline" size="sm" className="w-full bg-transparent">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button onClick={shareViaTelegram} variant="outline" size="sm" className="w-full bg-transparent">
              <MessageCircle className="mr-2 h-4 w-4" />
              Telegram
            </Button>
            <Button onClick={shareViaEmail} variant="outline" size="sm" className="w-full bg-transparent">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Dialog open={showQR} onOpenChange={setShowQR}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Código QR de Referido</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-64 h-64" />
                  <p className="text-sm text-muted-foreground text-center">
                    Escanea este código para acceder a tu enlace de referido
                  </p>
                  <Button onClick={copyToClipboard} variant="outline" className="w-full bg-transparent">
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    Copiar Enlace
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={shareViaTwitter} variant="outline" size="sm" className="w-full bg-transparent">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter
            </Button>
            <Button onClick={shareViaFacebook} variant="outline" size="sm" className="w-full bg-transparent">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
            <Button onClick={shareViaLinkedIn} variant="outline" size="sm" className="w-full bg-transparent">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </Button>
          </div>
        </div>

        <Button onClick={shareNative} className="w-full bg-[#FF9AA2] hover:bg-[#FFB7B2]">
          <Share2 className="mr-2 h-4 w-4" />
          Compartir Enlace
        </Button>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Network className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-semibold">
              {isBroker ? "Estructura de Comisiones Multinivel" : "Comisión de Referido"}
            </h4>
          </div>
          {isBroker ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 min-w-[30px]">5%</span>
                <span>Nivel 1 - Ventas directas con tu código</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600 min-w-[30px]">2%</span>
                <span>Nivel 2 - Ventas de brokers que referiste</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600 min-w-[30px]">1%</span>
                <span>Nivel 3 - Ventas de la red de tus referidos</span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 min-w-[30px]">3%</span>
                <span>Comisión directa por cada amigo que refiera</span>
              </li>
            </ul>
          )}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              • Pagado después de completar el minteo del NFT
              <br />• Sin límite en ganancias
              <br />• Seguimiento en tiempo real
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
