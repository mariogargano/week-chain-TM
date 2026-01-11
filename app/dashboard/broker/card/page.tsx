"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { RoleGuard } from "@/components/role-guard"
import { createClient } from "@/lib/supabase/client"
import {
  Download,
  Share2,
  Wallet,
  Copy,
  Check,
  Mail,
  Phone,
  Globe,
  MapPin,
  Award,
  ArrowLeft,
  Smartphone,
} from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

interface BrokerProfile {
  id: string
  display_name: string
  username: string
  email?: string
  phone?: string
  location?: string
  avatar_url?: string
  referral_code: string
  total_weeks_sold: number
  broker_level_id?: string
  is_broker_elite: boolean
  created_at: string
}

function BrokerCardContent() {
  const [profile, setProfile] = useState<BrokerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [addingToWallet, setAddingToWallet] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (data) {
          setProfile({
            ...data,
            email: user.email,
          })
        }
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const referralLink = profile ? `https://week-chain.com/ref/${profile.referral_code}` : ""

  const handleCopyLink = async () => {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!profile) return

    const shareData = {
      title: `${profile.display_name} - Intermediario WEEK-CHAIN™`,
      text: `Contrata servicios vacacionales de tiempo compartido con mi código: ${profile.referral_code}`,
      url: referralLink,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyLink()
    }
  }

  const handleAddToWallet = async () => {
    setAddingToWallet(true)

    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile?.display_name || "Intermediario WEEK-CHAIN™"}
ORG:WEEK-CHAIN™
TITLE:Intermediario de Servicios Vacacionales
TEL:${profile?.phone || ""}
EMAIL:${profile?.email || ""}
URL:${referralLink}
NOTE:Código de referido: ${profile?.referral_code}
END:VCARD`

    const blob = new Blob([vCard], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `WEEK-CHAIN-${profile?.referral_code}.vcf`
    a.click()
    URL.revokeObjectURL(url)

    setAddingToWallet(false)
  }

  const handleDownloadCard = () => {
    alert("La descarga de imagen estará disponible próximamente")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#C7CEEA]/10">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9AA2]" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#C7CEEA]/10">
        <Navbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-slate-600">No se encontró tu perfil de intermediario.</p>
          <Button asChild className="mt-4">
            <Link href="/broker/apply">Registrarme como Intermediario</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#C7CEEA]/10">
      <Navbar />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <Link href="/dashboard/broker" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mi Tarjeta Digital WEEK-CHAIN™</h1>
          <p className="text-slate-600">
            Comparte tu tarjeta con potenciales clientes para facilitar la contratación de servicios vacacionales
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Digital Card Preview */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              {/* Card Header with gradient */}
              <div className="h-24 bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={profile.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF9AA2] to-[#C7CEEA] flex items-center justify-center text-white text-2xl font-bold">
                        {profile.display_name?.charAt(0) || "B"}
                      </div>
                    )}
                  </div>
                </div>
                {profile.is_broker_elite && (
                  <Badge className="absolute top-4 right-4 bg-amber-500 text-white border-0">
                    <Award className="h-3 w-3 mr-1" />
                    Elite
                  </Badge>
                )}
              </div>

              <CardContent className="pt-14 pb-6 px-6">
                {/* Name and Title */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">{profile.display_name || profile.username}</h2>
                  <p className="text-slate-400 text-sm">Intermediario de Servicios Vacacionales</p>
                  <p className="text-[#FF9AA2] text-sm font-semibold mt-1">WEEK-CHAIN™</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  {profile.email && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-300">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">week-chain.com</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeSVG value={referralLink} size={120} level="H" includeMargin={false} fgColor="#1e293b" />
                  </div>
                </div>

                {/* Referral Code */}
                <div className="mt-4 text-center">
                  <p className="text-slate-500 text-xs mb-1">Código de Referido</p>
                  <p className="text-white font-mono font-bold tracking-wider">{profile.referral_code}</p>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-4 border-t border-slate-700 flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profile.total_weeks_sold || 0}</p>
                    <p className="text-slate-500 text-xs">Ventas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{new Date(profile.created_at).getFullYear()}</p>
                    <p className="text-slate-500 text-xs">Desde</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="order-1 lg:order-2 space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Compartir Tarjeta</CardTitle>
                <CardDescription>Comparte tu tarjeta digital con potenciales clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Copy Link */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-100 rounded-lg px-4 py-3 text-sm text-slate-600 truncate">
                    {referralLink}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="flex-shrink-0 bg-transparent"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleShare} className="bg-[#FF9AA2] hover:bg-[#FF9AA2]/90">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                  <Button onClick={handleDownloadCard} variant="outline" className="border-slate-300 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Agregar a Wallet
                </CardTitle>
                <CardDescription>Guarda tu tarjeta en tu teléfono para acceso rápido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleAddToWallet}
                  disabled={addingToWallet}
                  className="w-full bg-black hover:bg-black/90 text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {addingToWallet ? "Generando..." : "Agregar a Apple Wallet"}
                </Button>
                <Button
                  onClick={handleAddToWallet}
                  disabled={addingToWallet}
                  variant="outline"
                  className="w-full border-slate-300 bg-transparent"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Agregar a Google Wallet
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Se descargará un archivo de contacto (.vcf) que puedes guardar en tu teléfono
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> Muestra el código QR de tu tarjeta a potenciales clientes. Al escanearlo, serán
                  dirigidos a WEEK-CHAIN™ con tu código de referido ya aplicado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function BrokerCardPage() {
  return (
    <RoleGuard allowedRoles={["broker", "admin"]}>
      <BrokerCardContent />
    </RoleGuard>
  )
}
