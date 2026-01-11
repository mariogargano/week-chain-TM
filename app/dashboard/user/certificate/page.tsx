"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { createBrowserClient } from "@supabase/ssr"
import {
  Download,
  Share2,
  Copy,
  Check,
  Calendar,
  MapPin,
  ArrowLeft,
  Smartphone,
  Shield,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  FileText,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import QRCode from "qrcode"

interface WeekCertificate {
  id: string
  voucher_code: string
  property_name: string
  property_location: string
  property_image: string
  week_number: number
  season: string
  start_date: string
  end_date: string
  contract_start: string
  contract_end: string
  holder_name: string
  holder_email: string
  certificate_status: string
  nft_minted: boolean
  amount: number
}

const seasonConfig = {
  high: {
    icon: Sun,
    color: "from-amber-500 to-orange-500",
    label: "Alta",
    bg: "bg-amber-50",
    textColor: "text-amber-500",
  },
  medium: {
    icon: Flower2,
    color: "from-pink-500 to-rose-500",
    label: "Media",
    bg: "bg-pink-50",
    textColor: "text-pink-500",
  },
  low: {
    icon: Leaf,
    color: "from-emerald-500 to-green-500",
    label: "Baja",
    bg: "bg-emerald-50",
    textColor: "text-emerald-500",
  },
  alta: {
    icon: Sun,
    color: "from-amber-500 to-orange-500",
    label: "Alta",
    bg: "bg-amber-50",
    textColor: "text-amber-500",
  },
  media: {
    icon: Flower2,
    color: "from-pink-500 to-rose-500",
    label: "Media",
    bg: "bg-pink-50",
    textColor: "text-pink-500",
  },
  baja: {
    icon: Leaf,
    color: "from-emerald-500 to-green-500",
    label: "Baja",
    bg: "bg-emerald-50",
    textColor: "text-emerald-500",
  },
  winter: {
    icon: Snowflake,
    color: "from-blue-500 to-cyan-500",
    label: "Invierno",
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
}

export default function HolderCertificatePage() {
  const [certificates, setCertificates] = useState<WeekCertificate[]>([])
  const [selectedCert, setSelectedCert] = useState<WeekCertificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    if (selectedCert?.voucher_code) {
      generateQRCode(selectedCert.voucher_code)
    }
  }, [selectedCert?.voucher_code])

  const generateQRCode = async (code: string) => {
    try {
      const url = `${window.location.origin}/verify/${code}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 120,
        margin: 1,
        color: { dark: "#1a2332", light: "#ffffff" },
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      console.log("[v0] QR error:", err)
    }
  }

  const fetchCertificates = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: vouchers } = await supabase
        .from("purchase_vouchers")
        .select(`
          *,
          weeks (week_number, start_date, end_date, season, nft_minted, price),
          properties (name, location, image_url)
        `)
        .eq("user_id", user.id)
        .in("status", ["paid", "used", "confirmed"])
        .order("created_at", { ascending: false })

      const { data: reservations } = await supabase
        .from("reservations")
        .select(`
          *,
          weeks (week_number, start_date, end_date, season, price),
          properties (name, location, image_url)
        `)
        .eq("user_id", user.id)
        .in("status", ["confirmed", "completed"])
        .order("created_at", { ascending: false })

      const certs: WeekCertificate[] = []

      // Process vouchers
      if (vouchers && vouchers.length > 0) {
        vouchers.forEach((v: any) => {
          certs.push({
            id: v.id,
            voucher_code: v.voucher_code,
            property_name: v.properties?.name || "Destino Premium WEEK-CHAIN",
            property_location: v.properties?.location || "México",
            property_image: v.properties?.image_url || "/luxury-resort-beach.png",
            week_number: v.weeks?.week_number || v.week_number || 1,
            season: v.weeks?.season || "high",
            start_date: v.weeks?.start_date || "",
            end_date: v.weeks?.end_date || "",
            contract_start: v.created_at,
            contract_end: new Date(
              new Date(v.created_at).setFullYear(new Date(v.created_at).getFullYear() + 15),
            ).toISOString(),
            holder_name: v.user_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Titular",
            holder_email: user.email || "",
            certificate_status: v.status || "active",
            nft_minted: v.weeks?.nft_minted || false,
            amount: v.amount || v.weeks?.price || 0,
          })
        })
      }

      // Process reservations not already in vouchers
      if (reservations && reservations.length > 0) {
        reservations.forEach((r: any) => {
          const exists = certs.some((c) => c.voucher_code === r.booking_id)
          if (!exists) {
            certs.push({
              id: r.id,
              voucher_code: r.booking_id,
              property_name: r.properties?.name || "Destino Premium WEEK-CHAIN",
              property_location: r.properties?.location || "México",
              property_image: r.properties?.image_url || "/luxury-resort-beach.png",
              week_number: r.weeks?.week_number || 1,
              season: r.weeks?.season || "high",
              start_date: r.weeks?.start_date || "",
              end_date: r.weeks?.end_date || "",
              contract_start: r.created_at,
              contract_end: new Date(
                new Date(r.created_at).setFullYear(new Date(r.created_at).getFullYear() + 15),
              ).toISOString(),
              holder_name: r.user_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Titular",
              holder_email: user.email || "",
              certificate_status: r.status || "active",
              nft_minted: r.nft_issued || false,
              amount: r.amount || r.weeks?.price || 0,
            })
          }
        })
      }

      setCertificates(certs)
      if (certs.length > 0) {
        setSelectedCert(certs[0])
      }
    }
    setLoading(false)
  }

  const handleCopyCode = async () => {
    if (!selectedCert) return
    await navigator.clipboard.writeText(selectedCert.voucher_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!selectedCert) return

    const shareData = {
      title: `Mi Derecho de Uso WEEK-CHAIN™`,
      text: `Tengo un derecho de uso vacacional en ${selectedCert.property_name} - Semana ${selectedCert.week_number}`,
      url: `${window.location.origin}/verify/${selectedCert.voucher_code}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        handleCopyCode()
      }
    } else {
      handleCopyCode()
    }
  }

  const handleAddToWallet = async () => {
    if (!selectedCert) return

    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:WEEK-CHAIN™ - Semana ${selectedCert.week_number}
ORG:WEEK-CHAIN™
TITLE:${selectedCert.property_name}
NOTE:Código: ${selectedCert.voucher_code}\\nTemporada: ${selectedCert.season}\\nVigencia: ${new Date(selectedCert.contract_start).getFullYear()} - ${new Date(selectedCert.contract_end).getFullYear()}
URL:${window.location.origin}/verify/${selectedCert.voucher_code}
END:VCARD`

    const blob = new Blob([vCard], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `WEEK-CHAIN-${selectedCert.voucher_code}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = async () => {
    if (!selectedCert) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const element = document.getElementById("certificate-card")
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      })

      const link = document.createElement("a")
      link.download = `WEEK-CHAIN-Certificado-${selectedCert.voucher_code}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.log("[v0] Download error:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-700/50 flex items-center justify-center">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No tienes certificados aún</h2>
          <p className="text-slate-400 mb-6">
            Compra tu primera semana vacacional para obtener tu certificado digital.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Link href="/properties">Explorar Destinos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const cert = selectedCert!
  const season = seasonConfig[cert.season as keyof typeof seasonConfig] || seasonConfig.high
  const SeasonIcon = season.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-white">
            <Link href="/dashboard/member">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Mi Certificado Digital</h1>
            <p className="text-slate-400">Derecho de uso vacacional WEEK-CHAIN™</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Certificate Card - Blue Premium Design matching home page */}
          <div className="relative">
            <div id="certificate-card" className="relative overflow-hidden rounded-3xl shadow-2xl">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img
                  src={cert.property_image || "/placeholder.svg"}
                  alt={cert.property_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
              </div>

              {/* Certificate Content */}
              <div className="relative p-8 min-h-[500px] flex flex-col">
                {/* Top Section */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">W</span>
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg tracking-tight">WEEK-CHAIN</div>
                        <div className="text-amber-400 text-[10px] font-medium -mt-1">™ CERTIFICADO DIGITAL</div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-sm">
                      <Shield className="h-3 w-3 mr-1" />
                      NOM-151
                    </Badge>
                    <Badge className={`${season.bg} text-slate-800 border-0`}>
                      <SeasonIcon className="h-3 w-3 mr-1" />
                      Temporada {season.label}
                    </Badge>
                  </div>
                </div>

                {/* Week Number - Hero */}
                <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
                  <div className="text-amber-400/80 text-sm font-medium tracking-widest uppercase mb-2">Semana</div>
                  <div className="text-8xl font-black text-white drop-shadow-2xl mb-2">{cert.week_number}</div>
                  <div className="text-white/90 text-xl font-semibold">{cert.property_name}</div>
                  <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
                    <MapPin className="h-3 w-3" />
                    {cert.property_location}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-auto">
                  {/* Holder Info */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Titular</div>
                        <div className="text-white font-bold text-lg">{cert.holder_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Vigencia</div>
                        <div className="text-white font-bold">
                          {new Date(cert.contract_start).getFullYear()} - {new Date(cert.contract_end).getFullYear()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Code & QR */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Código de Certificado</div>
                      <div className="font-mono text-amber-400 font-bold text-lg tracking-wider">
                        {cert.voucher_code}
                      </div>
                    </div>
                    {qrDataUrl && (
                      <div className="bg-white rounded-xl p-2 shadow-xl">
                        <img src={qrDataUrl || "/placeholder.svg"} alt="QR Code" className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full blur-3xl" />
              </div>
            </div>

            {/* Multiple certificates selector */}
            {certificates.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center flex-wrap">
                {certificates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCert(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCert?.id === c.id
                        ? "bg-amber-500 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Semana {c.week_number}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="space-y-6">
            {/* Certificate Details */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  Detalles del Certificado
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Tipo de Derecho</span>
                    <span className="text-white font-medium">Derecho Personal de Uso</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Modalidad</span>
                    <span className="text-white font-medium">Tiempo Compartido</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Duración</span>
                    <span className="text-white font-medium">15 años</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Semana Asignada</span>
                    <span className="text-white font-medium">Semana {cert.week_number} de 52</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Temporada</span>
                    <Badge className={`${season.bg} text-slate-800 border-0`}>
                      <SeasonIcon className="h-3 w-3 mr-1" />
                      {season.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Valor</span>
                    <span className="text-white font-medium">${cert.amount?.toLocaleString()} USD</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <span className="text-slate-400">Certificado Digital</span>
                    <Badge
                      className={
                        cert.nft_minted ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }
                    >
                      {cert.nft_minted ? "Emitido" : "Pendiente"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-400">Certificación Legal</span>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">NOM-151-SCFI-2016</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Acciones</h3>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copiado" : "Copiar Código"}
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                  <Button
                    onClick={handleAddToWallet}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Agregar a Wallet
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PNG
                  </Button>
                </div>

                <Button
                  className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                  asChild
                >
                  <Link href="/dashboard/member">
                    <Calendar className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Legal Disclaimer */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong className="text-slate-300">Aviso Legal:</strong> Este certificado acredita un derecho personal
                de uso temporal conforme a la Ley Federal de Protección al Consumidor y la NOM-029-SE-2021 de tiempo
                compartido. El titular NO adquiere propiedad inmobiliaria ni derechos reales sobre el alojamiento
                participante. Este documento está certificado bajo NOM-151-SCFI-2016 con validez legal probatoria.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
