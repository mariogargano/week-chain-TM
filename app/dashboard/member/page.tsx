"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Download,
  Wallet,
  Copy,
  Check,
  ArrowUpRight,
  Gift,
  Building2,
  Mail,
  Phone,
  User,
  TrendingUp,
  Users,
  ChevronRight,
  BarChart3,
  Sparkles,
  Trophy,
  Calendar,
  MapPin,
  Loader2,
  Shield,
  Sun,
  Leaf,
  Flower2,
  UserCog,
  AlertCircle,
  Share2,
  Camera,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import QRCode from "qrcode"
import { Badge } from "@/components/ui/badge"
import { SocialShareSidebar } from "@/components/social-share-sidebar"

interface UserProfile {
  id: string
  email: string
  full_name: string
  account_type: "individual" | "company"
  company_name?: string
  broker_level: string
  referral_code: string
  total_referrals: number
  total_sales: number
  member_since: string
  avatar_url?: string
  phone?: string
}

interface Voucher {
  id: string
  voucher_code: string
  week_number: number
  start_date: string
  end_date: string
  amount: number
  season: string
  status: string
  certificate_issued: boolean
  certificate_id: string | null
  property_name: string
  property_location: string
  property_image: string
  created_at: string
}

interface Week {
  id: string
  voucher_code: string
  week_number: number
  start_date: string
  end_date: string
  amount: number
  season: string
  status: string
  certificate_issued: boolean
  certificate_id: string | null
  property_name: string
  property_location: string
  property_image: string
  created_at: string
}

const BROKER_LEVELS = {
  entry: {
    name: "STANDARD",
    commission: 4,
    minWeeks: 0,
    maxWeeks: 23,
    benefit: 0,
    color: "border-slate-500",
    circleColor: "border-slate-400",
    textColor: "text-slate-400",
  },
  silver: {
    name: "SILVER",
    commission: 5,
    minWeeks: 24,
    maxWeeks: 47,
    benefit: 1,
    color: "border-slate-400",
    circleColor: "border-slate-300",
    textColor: "text-slate-300",
  },
  gold: {
    name: "GOLD",
    commission: 6,
    minWeeks: 48,
    maxWeeks: 96,
    benefit: 2,
    color: "border-yellow-500",
    circleColor: "border-yellow-400",
    textColor: "text-yellow-400",
  },
}

const seasonConfig = {
  high: { icon: Sun, label: "Alta", color: "text-amber-500", bg: "bg-amber-500/20" },
  medium: { icon: Flower2, label: "Media", color: "text-pink-500", bg: "bg-pink-500/20" },
  low: { icon: Leaf, label: "Baja", color: "text-emerald-500", bg: "bg-emerald-500/20" },
  alta: { icon: Sun, label: "Alta", color: "text-amber-500", bg: "bg-amber-500/20" },
  media: { icon: Flower2, label: "Media", color: "text-pink-500", bg: "bg-pink-500/20" },
  baja: { icon: Leaf, label: "Baja", color: "text-emerald-500", bg: "bg-emerald-500/20" },
}

export default function MemberDashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isAddingToWallet, setIsAddingToWallet] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    activeClients: 0,
    closeRate: 0,
    weeksReferred: 0,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile?.referral_code) {
      generateQRCode()
    }
    if (profile?.id) {
      fetchStats()
    }
  }, [profile?.referral_code, profile?.id])

  const fetchProfile = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (userData) {
        setProfile({
          ...userData,
          email: user.email || userData.email,
          referral_code: userData.referral_code || `WC${user.id.slice(0, 6).toUpperCase()}`,
        })
      } else {
        // Create user profile if doesn't exist
        const referralCode = `WC${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        const newUser = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
          account_type: "individual" as const,
          broker_level: "entry",
          referral_code: referralCode,
          total_referrals: 0,
          total_sales: 0,
          role: "user",
        }
        await supabase.from("users").insert(newUser)
        setProfile({
          ...newUser,
          member_since: new Date().toISOString(),
        })
      }
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    if (!profile?.id) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Count referrals
    const { count: referralCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", profile.id)

    // Get sales from reservations
    const { data: sales } = await supabase
      .from("reservations")
      .select("amount")
      .eq("user_id", profile.id)
      .in("status", ["confirmed", "completed"])

    const totalSales = sales?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0

    setStats({
      totalEarnings: Math.round(totalSales * 0.04), // 4% commission
      monthlyEarnings: Math.round((totalSales * 0.04) / 12),
      activeClients: referralCount || 0,
      closeRate: 0,
      weeksReferred: referralCount || 0,
    })
  }

  const generateQRCode = async () => {
    if (!profile?.referral_code) return
    try {
      // Use /register with ref parameter - closed page without navigation
      const url = `${window.location.origin}/register?ref=${profile.referral_code}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 120,
        margin: 1,
        color: { dark: "#1a2332", light: "#ffffff" },
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      console.error("QR generation error:", err)
    }
  }

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return
    try {
      await navigator.clipboard.writeText(profile.referral_code)
      setCopied(true)
      toast.success("Código copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Error al copiar")
    }
  }

  const downloadCard = async () => {
    if (!cardRef.current) return
    setIsDownloading(true)

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: "#1a2332",
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const link = document.createElement("a")
      link.download = `WEEK-CHAIN-${profile?.referral_code || "card"}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("Tarjeta descargada")
    } catch (err) {
      console.log("[v0] Download error:", err)
      toast.error("Error al descargar la tarjeta")
    } finally {
      setIsDownloading(false)
    }
  }

  const addToAppleWallet = async () => {
    setIsAddingToWallet(true)
    try {
      const response = await fetch("/api/wallet/apple-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile?.full_name,
          email: profile?.email,
          phone: profile?.phone,
          referralCode: profile?.referral_code,
          accountType: profile?.account_type,
          brokerLevel: profile?.broker_level,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `WEEK-CHAIN-${profile?.referral_code}.html`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Tarjeta guardada")
      }
    } catch (err) {
      toast.error("Error al generar tarjeta")
    } finally {
      setIsAddingToWallet(false)
    }
  }

  const shareReferralLink = async () => {
    const url = `${window.location.origin}/register?ref=${profile?.referral_code}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Únete a WEEK-CHAIN",
          text: `${profile?.full_name || "Un amigo"} te invita a unirte a WEEK-CHAIN. Usa mi código de referido: ${profile?.referral_code}`,
          url: url,
        })
      } catch (err) {
        // User cancelled or error
        copyReferralCode()
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Enlace de referido copiado")
      } catch (err) {
        toast.error("Error al copiar enlace")
      }
    }
  }

  const sharePDF = async () => {
    if (!profile?.referral_code) return
    setIsDownloading(true)

    try {
      // Generate card as image first
      const html2canvas = (await import("html2canvas")).default
      if (!cardRef.current) return

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#1a2332",
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const cardImageData = canvas.toDataURL("image/png")
      const referralUrl = `${window.location.origin}/auth?ref=${profile.referral_code}`

      // Create HTML document that will be saved as PDF
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación WEEK-CHAIN - ${profile.full_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .container {
      max-width: 500px;
      background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #2dd4bf, #22d3ee);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-icon svg {
      width: 24px;
      height: 24px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: white;
      letter-spacing: -0.5px;
    }
    .logo sup {
      font-size: 10px;
      vertical-align: super;
    }
    .subtitle {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 32px;
    }
    .card-image {
      width: 100%;
      max-width: 400px;
      border-radius: 16px;
      margin: 24px auto;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    }
    .invite-text {
      color: #94a3b8;
      font-size: 14px;
      margin-top: 24px;
    }
    .invite-name {
      color: white;
      font-size: 24px;
      font-weight: bold;
      margin: 8px 0 24px;
    }
    .benefits {
      text-align: left;
      margin: 24px 0;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .benefit {
      color: #e2e8f0;
      font-size: 14px;
      padding: 10px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .benefit-icon {
      width: 24px;
      height: 24px;
      min-width: 24px;
      background: linear-gradient(135deg, #2dd4bf, #22d3ee);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0f172a;
      font-weight: bold;
      font-size: 12px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%);
      color: #0f172a;
      font-size: 18px;
      font-weight: bold;
      padding: 18px 60px;
      border-radius: 14px;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 10px 30px -5px rgba(45, 212, 191, 0.4);
      margin-top: 24px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px -5px rgba(45, 212, 191, 0.5);
    }
    .code-text {
      color: #64748b;
      font-size: 13px;
      margin-top: 20px;
    }
    .code {
      color: #2dd4bf;
      font-weight: bold;
      font-size: 15px;
      background: rgba(45, 212, 191, 0.1);
      padding: 4px 12px;
      border-radius: 6px;
      margin-left: 8px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: #475569;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12L7 16L12 8L17 14L21 10" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span class="logo">WEEK-CHAIN<sup>™</sup></span>
    </div>
    <div class="subtitle">Sistema de Acceso Vacacional</div>
    
    <img src="${cardImageData}" alt="Tarjeta de ${profile.full_name}" class="card-image" />
    
    <p class="invite-text">Has sido invitado por</p>
    <p class="invite-name">${profile.full_name}</p>
    
    <div class="benefits">
      <div class="benefit">
        <span class="benefit-icon">✓</span>
        <span>Sistema de acceso vacacional gestionado</span>
      </div>
      <div class="benefit">
        <span class="benefit-icon">✓</span>
        <span>Certificados digitales de acceso verificables</span>
      </div>
      <div class="benefit">
        <span class="benefit-icon">✓</span>
        <span>Comisiones por referidos hasta 6%</span>
      </div>
      <div class="benefit">
        <span class="benefit-icon">✓</span>
        <span>Semanas de uso propio gratis</span>
      </div>
    </div>
    
    <a href="${referralUrl}" class="cta-button">Comenzar Ahora</a>
    
    <p class="code-text">Usa el código <span class="code">${profile.referral_code}</span> al registrarte</p>
    
    <div class="footer">
      © ${new Date().getFullYear()} WEEK-CHAIN. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`

      // Create blob and download as HTML
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      // Try to use Web Share API if available
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `Invitacion-WEEK-CHAIN-${profile.referral_code}.html`, { type: "text/html" })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Invitación WEEK-CHAIN de ${profile.full_name}`,
            text: `${profile.full_name} te invita a unirte a WEEK-CHAIN. Usa el código ${profile.referral_code}`,
            files: [file],
          })
          toast.success("Invitación compartida")
        } else {
          // Fallback: download the file
          const link = document.createElement("a")
          link.href = url
          link.download = `Invitacion-WEEK-CHAIN-${profile.referral_code}.html`
          link.click()
          toast.success("Invitación descargada - Ábrela y guarda como PDF")
        }
      } else {
        // Fallback: download the file
        const link = document.createElement("a")
        link.href = url
        link.download = `Invitacion-WEEK-CHAIN-${profile.referral_code}.html`
        link.click()
        toast.success("Invitación descargada - Ábrela y guarda como PDF")
      }

      URL.revokeObjectURL(url)
    } catch (err) {
      console.log("[v0] Share PDF error:", err)
      toast.error("Error al compartir")
    } finally {
      setIsDownloading(false)
    }
  }

  const currentLevel = BROKER_LEVELS[(profile?.broker_level as keyof typeof BROKER_LEVELS) || "entry"]

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${profile?.referral_code}`
      : `https://weekchain.com/register?ref=${profile?.referral_code}`

  const getProfileCompletion = () => {
    if (!profile) return 0
    const fields = [profile.full_name, profile.phone, profile.avatar_url]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }

  const profileCompletion = getProfileCompletion()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      {profile?.referral_code && (
        <SocialShareSidebar
          referralCode={profile.referral_code}
          referralUrl={referralUrl}
          userName={profile.full_name || "Usuario"}
        />
      )}

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Bienvenido, {profile?.full_name?.split(" ")[0] || "Usuario"}
              </h1>
              <p className="text-slate-600">Panel de Intermediario WEEK-CHAIN</p>
            </div>
            <div className="flex items-center gap-3">
              {profileCompletion < 100 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-700">Completa tu perfil</span>
                </div>
              )}
              <Button asChild variant="outline">
                <Link href="/dashboard/member/profile">
                  <UserCog className="w-4 h-4 mr-2" />
                  Mi Perfil
                </Link>
              </Button>
            </div>
          </div>

          {profileCompletion < 100 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Completa tu perfil para verificar tu cuenta</h3>
                    <p className="text-white/80 text-sm">
                      Sube tus documentos para prevenir fraudes y habilitar todas las funciones
                    </p>
                  </div>
                </div>
                <Button asChild className="bg-white text-amber-600 hover:bg-white/90">
                  <Link href="/dashboard/member/profile">
                    Completar Perfil
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Member Card & Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Member Card - Exact design from reference */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Tu Tarjeta Digital</h2>

                <div
                  ref={cardRef}
                  className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden"
                  style={{ backgroundColor: "#1a2332" }}
                >
                  <div className="p-6">
                    {/* Header with Logo and Photo */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        {/* Logo SVG */}
                        <div className="flex items-center gap-2 mb-1">
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect width="40" height="40" rx="8" fill="url(#logo-gradient)" />
                            <path
                              d="M10 20L15 25L20 15L25 22L30 18"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="10" cy="20" r="2" fill="white" />
                            <circle cx="15" cy="25" r="2" fill="white" />
                            <circle cx="20" cy="15" r="2" fill="white" />
                            <circle cx="25" cy="22" r="2" fill="white" />
                            <circle cx="30" cy="18" r="2" fill="white" />
                            <defs>
                              <linearGradient
                                id="logo-gradient"
                                x1="0"
                                y1="0"
                                x2="40"
                                y2="40"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="#2dd4bf" />
                                <stop offset="1" stopColor="#22d3ee" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="text-white font-bold text-xl tracking-tight">
                            WEEK-CHAIN<sup className="text-[8px] ml-0.5">™</sup>
                          </div>
                        </div>
                        <div className="text-slate-400 text-sm ml-9">Intermediario Autorizado</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Profile Photo */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-700 border-2 border-slate-600">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url || "/placeholder.svg"}
                              alt={profile.full_name || "Foto"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <span className="text-2xl">🇲🇽</span>
                      </div>
                    </div>

                    {/* Name & Type */}
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-2xl mb-1">
                        {profile?.full_name || "Tu Nombre Apellido"}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <User className="h-4 w-4" />
                        <span>Intermediario {profile?.account_type === "company" ? "Empresa" : "Individual"}</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span>{profile?.email || "tu@email.com"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{profile?.phone || "+XX XXX XXX XXXX"}</span>
                      </div>
                    </div>

                    {/* Referral Code & QR Row */}
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Código de Referido</div>
                        <div className="text-cyan-400 font-bold text-2xl tracking-wider">
                          {profile?.referral_code || "TUCODIGO"}
                        </div>
                      </div>
                      {qrDataUrl && (
                        <div className="bg-white rounded-lg p-2">
                          <img src={qrDataUrl || "/placeholder.svg"} alt="QR Code" className="w-24 h-24" />
                        </div>
                      )}
                    </div>

                    {/* Share Button inside card */}
                    <button
                      onClick={sharePDF}
                      disabled={isDownloading}
                      className="w-full py-3.5 px-4 rounded-xl font-semibold text-slate-900 transition-all flex items-center justify-center gap-2 hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)",
                      }}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Share2 className="h-5 w-5" />
                          Compartir Invitación
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom gradient accent */}
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                </div>

                {/* Card Actions */}
                <div className="flex gap-3 mt-4 justify-center flex-wrap">
                  <Button
                    onClick={copyReferralCode}
                    variant="outline"
                    size="sm"
                    className="text-slate-600 bg-transparent"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copiado" : "Compartir Enlace"}
                  </Button>
                  <Button
                    onClick={downloadCard}
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                    className="text-slate-600 bg-transparent"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Descargar
                  </Button>
                  <Button
                    onClick={addToAppleWallet}
                    variant="outline"
                    size="sm"
                    disabled={isAddingToWallet}
                    className="text-slate-600 bg-transparent"
                  >
                    {isAddingToWallet ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4 mr-2" />
                    )}
                    Apple Wallet
                  </Button>
                </div>
              </div>

              {/* Stats Panel - Broker Dashboard Style */}
              <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#1a2332" }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={profile.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{profile?.full_name}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        México
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      WEEK-CHAIN<sup className="text-[8px]">™</sup>
                    </div>
                    <div className="text-slate-400 text-sm">Panel de Intermediario</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 font-bold">$</span>
                      </div>
                      {stats.totalEarnings > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          +12%
                        </Badge>
                      )}
                    </div>
                    <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
                    <div className="text-slate-400 text-xs">Honorarios Totales (IVA inc.)</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      {stats.monthlyEarnings > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          +8%
                        </Badge>
                      )}
                    </div>
                    <div className="text-2xl font-bold">${stats.monthlyEarnings.toLocaleString()}</div>
                    <div className="text-slate-400 text-xs">Este Mes (IVA inc.)</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.activeClients}</div>
                    <div className="text-slate-400 text-xs">Clientes Activos</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.closeRate}%</div>
                    <div className="text-slate-400 text-xs">Tasa de Cierre</div>
                  </div>
                </div>

                {/* Activity Chart Placeholder */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">Actividad Mensual</h4>
                      <p className="text-slate-400 text-sm">Últimos 6 meses</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="h-32 flex items-end justify-between gap-2">
                    {["Ene", "Feb", "Mar", "Abr", "May", "Jun"].map((month, i) => (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-500/50 to-emerald-500/20 rounded-t"
                          style={{ height: `${Math.random() * 60 + 20}%` }}
                        />
                        <span className="text-xs text-slate-500">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-slate-400">Dashboard actualizado en tiempo real</span>
                  <span className="flex items-center gap-2 text-emerald-400">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    En línea
                  </span>
                </div>
              </div>

              {/* Purchased Weeks Section */}
              {/* Remove entire "Purchased Weeks Section" */}
              {/* {purchasedWeeks.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Mis Semanas Compradas</h2>
                      <p className="text-slate-500 text-sm">
                        {purchasedWeeks.length} semana{purchasedWeeks.length !== 1 ? "s" : ""} adquirida
                        {purchasedWeeks.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/user/certificate">
                        Ver Certificados
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {purchasedWeeks.map((week) => {
                      const season = seasonConfig[week.season as keyof typeof seasonConfig] || seasonConfig.high
                      const SeasonIcon = season.icon

                      return (
                        <div
                          key={week.id}
                          className="relative overflow-hidden rounded-2xl border border-slate-200"
                          style={{ backgroundColor: "#1a2332" }}
                        >
                          <div className="flex flex-col md:flex-row">
                            
                            <div className="relative w-full md:w-48 h-32 md:h-auto">
                              <img
                                src={week.property_image || "/placeholder.svg"}
                                alt={week.property_name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a2332]/80 md:block hidden" />
                              <div className="absolute top-3 left-3">
                                <Badge className={`${season.bg} text-white border-0`}>
                                  <SeasonIcon className={`h-3 w-3 mr-1 ${season.color}`} />
                                  {season.label}
                                </Badge>
                              </div>
                            </div>

                            
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-white font-bold text-lg">{week.property_name}</h3>
                                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                                    <MapPin className="h-3 w-3" />
                                    {week.property_location}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-amber-400 text-xs uppercase tracking-wider">Semana</div>
                                  <div className="text-white font-bold text-3xl">{week.week_number}</div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                  <span className="text-slate-500">Valor:</span>
                                  <span className="text-white font-semibold ml-2">
                                    ${week.amount?.toLocaleString()} USD
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Estado:</span>
                                  <Badge
                                    className={`ml-2 ${
                                      week.certificate_issued
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-amber-500/20 text-amber-400"
                                    } border-0`}
                                  >
                                    {week.certificate_issued ? "Certificado Emitido" : "Procesando"}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-slate-500">Código:</span>
                                  <span className="text-emerald-400 font-mono ml-2">{week.voucher_code}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Button
                                  asChild
                                  size="sm"
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                >
                                  <Link href="/dashboard/user/certificate">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Certificado
                                  </Link>
                                </Button>
                                {week.certificate_id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 bg-transparent"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Verificar Certificado
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              
              {purchasedWeeks.length === 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No tienes semanas aún</h3>
                  <p className="text-slate-500 mb-4">Compra tu primera semana vacacional para verla aquí</p>
                  <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500">
                    <Link href="/properties">
                      Explorar Ejemplos de Destinos
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )} */}
            </div>

            {/* Right Column - Broker Benefits */}
            <div className="space-y-6">
              {/* Broker Level Card */}
              <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#1a2332" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">Broker Extra Benefit</h3>
                    <p className="text-slate-400 text-sm">Sistema de niveles</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-white font-bold text-sm">
                      WEEK-CHAIN<sup className="text-[6px]">™</sup>
                    </div>
                  </div>
                </div>

                {/* Current Level */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400">Nivel Actual</span>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${currentLevel.textColor}`}>{currentLevel.commission}%</span>
                      <div className="text-slate-500 text-xs">IVA incluido</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.weeksReferred}</div>
                      <div className="text-slate-500 text-xs">Semanas</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${currentLevel.textColor}`}>{currentLevel.name}</div>
                      <div className="text-slate-500 text-xs">Badge</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-400">{currentLevel.benefit} sem</div>
                      <div className="text-slate-500 text-xs">Uso Propio</div>
                    </div>
                  </div>
                </div>

                {/* Active Benefit */}
                <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30 mb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                    <Sparkles className="h-4 w-4" />
                    Beneficio Activo
                  </div>
                  <p className="text-white text-sm">
                    {currentLevel.benefit > 0
                      ? `${currentLevel.benefit} semana${currentLevel.benefit > 1 ? "s" : ""} de acceso anual prioritario, sujeto a disponibilidad del sistema WEEK-CHAIN`
                      : "Sube de nivel para obtener acceso prioritario"}
                  </p>
                </div>

                {/* Next Level */}
                {profile?.broker_level !== "gold" && (
                  <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                      <Trophy className="h-4 w-4" />
                      Próximo Nivel
                    </div>
                    <p className="text-white text-sm">
                      {profile?.broker_level === "entry"
                        ? "Refiere 24 semanas para alcanzar SILVER (5% comisión + 1 semana gratis)"
                        : "Refiere 48 semanas para alcanzar GOLD (6% comisión + 2 semanas gratis)"}
                    </p>
                  </div>
                )}

                <p className="text-slate-500 text-xs mt-4 text-center">Beneficios actualizados automáticamente</p>
              </div>

              {/* Commission Tiers */}
              <div className="space-y-4">
                {Object.entries(BROKER_LEVELS).map(([key, level]) => (
                  <div
                    key={key}
                    className={`rounded-xl p-4 border ${
                      profile?.broker_level === key ? "border-amber-500" : "border-slate-700"
                    }`}
                    style={{ backgroundColor: "#1a2332" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white font-bold">
                        WEEK-CHAIN<sup className="text-[6px]">™</sup>
                      </div>
                      {key === "silver" && <Badge className="bg-slate-600 text-white border-0 text-xs">POPULAR</Badge>}
                      {key === "gold" && <Badge className="bg-amber-500 text-slate-900 border-0 text-xs">ELITE</Badge>}
                    </div>
                    <div className="text-slate-400 text-sm mb-3">Sistema Intermediarios</div>

                    <div className="flex justify-center mb-3">
                      <div
                        className={`w-20 h-20 rounded-full border-4 ${level.circleColor} flex items-center justify-center`}
                      >
                        <span className={`text-2xl font-bold ${level.textColor}`}>{level.commission}%</span>
                      </div>
                    </div>

                    <div className="text-center text-slate-400 text-xs mb-3">IVA incluido</div>

                    <div className="bg-emerald-500 text-white text-center py-2 rounded-lg font-semibold mb-3">
                      COSTO GRATIS
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-slate-400">Rango</span>
                        <span className="text-white font-semibold">
                          {level.minWeeks} / {level.maxWeeks} <span className="text-slate-500">WEEK</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-slate-400">Badge</span>
                        <span className={`font-semibold flex items-center gap-1 ${level.textColor}`}>
                          <Trophy className="h-3 w-3" />
                          {level.name}
                        </span>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg px-3 py-3 text-center">
                        <div className="text-emerald-400 text-xs font-semibold mb-1">BENEFICIO EXTRA</div>
                        {level.benefit > 0 ? (
                          <>
                            <div className="text-white font-bold flex items-center justify-center gap-1">
                              <Gift className="h-4 w-4 text-amber-400" />
                              {level.benefit} WEEK{level.benefit > 1 ? "S" : ""}
                            </div>
                            <div className="text-slate-400 text-xs">Uso propio</div>
                            <div className="text-slate-500 text-xs flex items-center justify-center gap-1">
                              <Calendar className="h-3 w-3" />x 1 AÑO
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-500">NO</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-between bg-transparent">
                    <Link href="/properties">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Explorar Ejemplos de Destinos
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between bg-transparent">
                    <Link href="/dashboard/my-weeks">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Mis Semanas
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between bg-transparent">
                    <Link href="/dashboard/user/certificate">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Ver Certificados
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
