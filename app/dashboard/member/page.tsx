"use client"

import { createBrowserClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Check,
  ChevronRight,
  Calendar,
  MapPin,
  Loader2,
  Shield,
  AlertCircle,
  User,
  Mail,
  Phone,
  QrCode,
  FileCheck,
  ShoppingCart,
  ExternalLink,
  RefreshCw,
  Copy,
  Share2,
  UserCog,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { RoleGuard } from "@/components/role-guard"

interface UserProfile {
  id: string
  email: string
  full_name: string
  account_type: string
  referral_code: string
  total_referrals: number
  member_since: string
  phone?: string
  role: string
}

interface Certificate {
  id: string
  max_pax: number
  max_estancias_per_year: number
  annual_entitlement_estancias: number
  status: string
  created_at: string
  start_date: string | null
  end_date: string | null
  purchase_price_usd: number | null
  stripe_session_id: string | null
  product_id: string | null
}

interface WeekToken {
  id: string
  certificate_id: string | null
  user_certificate_v2_id: string | null
  blockchain_hash: string | null
  qr_code: string | null
  status: string
  created_at: string
}

interface KycStatus {
  status: string
  kyc_updated_at: string | null
}

export default function MemberDashboardPage() {
  const searchParams = useSearchParams()
  const purchaseStatus = searchParams?.get("purchase")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [tokens, setTokens] = useState<WeekToken[]>([])
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Fetch profile
    const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()
    if (userData) {
      setProfile({
        ...userData,
        email: user.email || userData.email,
        referral_code: userData.referral_code || `WC${user.id.slice(0, 6).toUpperCase()}`,
      })
    } else {
      const referralCode = `WC${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const newUser = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
        account_type: "individual",
        referral_code: referralCode,
        total_referrals: 0,
        total_sales: 0,
        role: "user",
      }
      await supabase.from("users").insert(newUser)
      setProfile({
        ...newUser,
        member_since: new Date().toISOString(),
      } as UserProfile)
    }

    // Fetch certificates
    const { data: certs } = await supabase
      .from("user_certificates_v2")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (certs) setCertificates(certs)

    // Fetch tokens linked to certificates
    if (certs && certs.length > 0) {
      const certIds = certs.map((c) => c.id)
      const { data: tkns } = await supabase
        .from("week_tokens")
        .select("*")
        .in("user_certificate_v2_id", certIds)
      if (tkns) setTokens(tkns as WeekToken[])
    }

    // Fetch KYC status
    const { data: kyc } = await supabase
      .from("kyc_users")
      .select("status, kyc_updated_at")
      .eq("user_id", user.id)
      .single()
    if (kyc) setKycStatus(kyc)

    setLoading(false)
  }

  const refreshCertificates = async () => {
    setRefreshing(true)
    await fetchAll()
    setRefreshing(false)
    toast.success("Datos actualizados")
  }

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return
    try {
      await navigator.clipboard.writeText(profile.referral_code)
      setCopied(true)
      toast.success("Codigo copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Error al copiar")
    }
  }

  const shareReferralLink = async () => {
    const url = `${window.location.origin}/auth?ref=${profile?.referral_code}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Unete a WEEK-CHAIN",
          text: `${profile?.full_name || "Un amigo"} te invita a WEEK-CHAIN. Codigo: ${profile?.referral_code}`,
          url,
        })
      } catch {
        copyReferralCode()
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Enlace de referido copiado")
      } catch {
        toast.error("Error al copiar enlace")
      }
    }
  }

  const getKycLabel = () => {
    switch (kycStatus?.status) {
      case "approved": return { text: "Verificado", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
      case "pending": return { text: "En revision", color: "bg-amber-100 text-amber-700 border-amber-200" }
      case "failed": return { text: "Rechazado", color: "bg-red-100 text-red-700 border-red-200" }
      default: return { text: "Sin verificar", color: "bg-slate-100 text-slate-600 border-slate-200" }
    }
  }

  const kycLabel = getKycLabel()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="rounded-2xl p-8 text-center bg-background shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={["user", "member", "admin", "broker", "broker_elite"]}>
    <div className="space-y-6">
      {/* Purchase status banners */}
      {purchaseStatus === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">Compra exitosa</p>
            <p className="text-sm text-emerald-700">Tu certificado vacacional ha sido emitido. Revisa la seccion "Mis Certificados" abajo.</p>
            {certificates.length === 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span className="text-sm text-emerald-600">Estamos emitiendo tu certificado...</span>
                <Button size="sm" variant="outline" onClick={refreshCertificates} className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Actualizar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {purchaseStatus === "canceled" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Pago cancelado</p>
            <p className="text-sm text-amber-700">No se realizo ningun cargo. Puedes intentarlo de nuevo.</p>
            <Button asChild size="sm" className="mt-3 bg-sky-500 hover:bg-sky-600">
              <Link href="/#certificados">Reintentar pago</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-foreground text-balance">
            Bienvenido, {profile?.full_name?.split(" ")[0] || "Usuario"}
          </h1>
          <p className="text-sm text-muted-foreground">Tu panel de certificados vacacionales</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${kycLabel.color} border`}>{kycLabel.text}</Badge>
          <Button asChild variant="outline" size="sm" className="min-h-[40px]">
            <Link href="/dashboard/member/profile">
              <UserCog className="w-4 h-4 mr-2" />
              Perfil
            </Link>
          </Button>
        </div>
      </div>

      {/* KYC Banner - if not approved */}
      {kycStatus?.status !== "approved" && (
        <div className={`rounded-xl p-4 border ${
          kycStatus?.status === "pending"
            ? "bg-amber-50 border-amber-200"
            : kycStatus?.status === "failed"
            ? "bg-red-50 border-red-200"
            : "bg-sky-50 border-sky-200"
        }`}>
          <div className="flex items-start gap-3">
            <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              kycStatus?.status === "pending" ? "text-amber-500"
                : kycStatus?.status === "failed" ? "text-red-500"
                : "text-sky-500"
            }`} />
            <div className="flex-1">
              <p className={`font-semibold ${
                kycStatus?.status === "pending" ? "text-amber-900"
                  : kycStatus?.status === "failed" ? "text-red-900"
                  : "text-sky-900"
              }`}>
                {kycStatus?.status === "pending"
                  ? "Verificacion en proceso"
                  : kycStatus?.status === "failed"
                  ? "Verificacion rechazada"
                  : "Verifica tu identidad"}
              </p>
              <p className={`text-sm ${
                kycStatus?.status === "pending" ? "text-amber-700"
                  : kycStatus?.status === "failed" ? "text-red-700"
                  : "text-sky-700"
              }`}>
                {kycStatus?.status === "pending"
                  ? "Estamos revisando tu documentacion. Te notificaremos cuando este lista."
                  : kycStatus?.status === "failed"
                  ? "No se pudo verificar tu identidad. Intenta de nuevo o contacta soporte."
                  : "La verificacion KYC es obligatoria antes de realizar una compra. Toma solo unos minutos."}
              </p>
              {kycStatus?.status !== "pending" && (
                <Button asChild size="sm" className="mt-3 bg-sky-500 hover:bg-sky-600">
                  <Link href="/dashboard/member/kyc">
                    <Shield className="w-4 h-4 mr-2" />
                    {kycStatus?.status === "failed" ? "Reintentar verificacion" : "Iniciar verificacion"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Certificates */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Certificates */}
          <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-sky-500" />
                <h2 className="text-lg font-semibold text-foreground">Mis Certificados</h2>
              </div>
              <Button size="sm" variant="ghost" onClick={refreshCertificates} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-sky-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Aun no tienes certificados</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adquiere tu primer Certificado de Servicios Vacacionales y disfruta de 15 anos de acceso.
                </p>
                <Button asChild className="bg-sky-500 hover:bg-sky-600">
                  <Link href="/#certificados">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adquirir Certificado
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {certificates.map((cert) => {
                  const token = tokens.find((t) => t.user_certificate_v2_id === cert.id)
                  const estancias = cert.max_estancias_per_year || cert.annual_entitlement_estancias || 1
                  const validFrom = new Date(cert.start_date || cert.created_at)
                  const validUntil = cert.end_date
                    ? new Date(cert.end_date)
                    : new Date(new Date(validFrom).setFullYear(validFrom.getFullYear() + 15))
                  const isActive = cert.status === "active" || cert.status === "confirmed"

                  return (
                    <div
                      key={cert.id}
                      className={`rounded-xl border p-4 sm:p-5 transition-colors ${
                        isActive ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              Certificado SVC - {cert.max_pax} PAX
                            </h3>
                            <Badge className={isActive
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                            }>
                              {isActive ? "Activo" : cert.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {estancias} estancia{estancias > 1 ? "s" : ""} por ano
                          </p>
                        </div>
                        <div className="text-right">
                          {cert.purchase_price_usd && (
                            <p className="text-sm font-semibold text-foreground">
                              ${cert.purchase_price_usd.toLocaleString("en-US")} USD
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            ID: {cert.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="bg-background rounded-lg p-2.5 border border-border">
                          <p className="text-xs text-muted-foreground">PAX</p>
                          <p className="font-semibold text-foreground flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {cert.max_pax}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-2.5 border border-border">
                          <p className="text-xs text-muted-foreground">Estancias/ano</p>
                          <p className="font-semibold text-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {estancias}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-2.5 border border-border">
                          <p className="text-xs text-muted-foreground">Desde</p>
                          <p className="font-semibold text-foreground text-sm">
                            {validFrom.toLocaleDateString("es-MX", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-2.5 border border-border">
                          <p className="text-xs text-muted-foreground">Hasta</p>
                          <p className="font-semibold text-foreground text-sm">
                            {validUntil.toLocaleDateString("es-MX", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {token && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={`/verify/${cert.id}`}>
                              <QrCode className="h-4 w-4 mr-2" />
                              Ver QR / Verificar
                            </Link>
                          </Button>
                          {token.blockchain_hash && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              Hash: {token.blockchain_hash.slice(0, 12)}...
                            </div>
                          )}
                        </div>
                      )}
                      {!token && isActive && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Emitiendo token y QR... esto puede tomar unos segundos.
                          <Button size="sm" variant="ghost" onClick={refreshCertificates} className="ml-auto">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Buy More CTA */}
          {certificates.length > 0 && (
            <div className="bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Adquiere mas certificados</h3>
                  <p className="text-white/80 text-sm">Amplia tu acceso vacacional con certificados adicionales.</p>
                </div>
                <Button asChild className="bg-white text-sky-600 hover:bg-white/90">
                  <Link href="/#certificados">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Comprar
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Profile & Referrals */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-background rounded-2xl p-5 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                <User className="h-6 w-6 text-sky-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{profile?.full_name}</h3>
                <p className="text-sm text-muted-foreground">Miembro desde {new Date(profile?.member_since || Date.now()).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 flex-shrink-0 text-sky-500" />
                <Badge variant="outline" className={`${kycLabel.color} border text-xs`}>{kycLabel.text}</Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
                <p className="text-xs text-muted-foreground">Certificados</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{profile?.total_referrals || 0}</p>
                <p className="text-xs text-muted-foreground">Referidos</p>
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="bg-background rounded-2xl p-5 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-sky-500" />
              <h3 className="font-semibold text-foreground">Programa de Referidos</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Comparte tu codigo y recibe un <span className="font-semibold text-sky-600">4% de comision</span> por cada venta realizada a traves de tu referido.
            </p>
            <div className="bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-sky-700">Comision directa y sin niveles: 4% sobre el valor de cada certificado vendido a tu referido.</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 mb-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Tu codigo</p>
              <p className="text-xl font-bold text-sky-600 tracking-wider">{profile?.referral_code}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyReferralCode}
                variant="outline"
                size="sm"
                className="flex-1 min-h-[40px]"
              >
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button
                onClick={shareReferralLink}
                size="sm"
                className="flex-1 bg-sky-500 hover:bg-sky-600 min-h-[40px]"
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background rounded-2xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-3">Acciones Rapidas</h3>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-between bg-transparent min-h-[44px]">
                <Link href="/#certificados">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                    Comprar Certificado
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              {kycStatus?.status !== "approved" && (
                <Button asChild variant="outline" className="w-full justify-between bg-transparent min-h-[44px]">
                  <Link href="/dashboard/member/kyc">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      Verificar Identidad (KYC)
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="w-full justify-between bg-transparent min-h-[44px]">
                <Link href="/dashboard/member/profile">
                  <span className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 flex-shrink-0" />
                    Editar Perfil
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between bg-transparent min-h-[44px]">
                <Link href="/properties">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    Explorar Destinos
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
