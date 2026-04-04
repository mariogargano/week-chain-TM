"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, Gift, TrendingUp, Users } from "lucide-react"
import { toast } from "sonner"

export function VisitorReferralWidget() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Verificar si ya tiene un código de referido en localStorage
    const savedCode = localStorage.getItem("visitor_referral_code")
    if (savedCode) {
      setReferralCode(savedCode)
      loadStats(savedCode)
    }
  }, [])

  const generateReferralCode = async () => {
    setLoading(true)
    try {
      // Obtener fingerprint del navegador (simplificado)
      const fingerprint = navigator.userAgent + navigator.language

      const response = await fetch("/api/referral/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_fingerprint: fingerprint,
          visitor_ip: null, // Se puede obtener del servidor
          visitor_country: null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setReferralCode(data.referral_code)
        localStorage.setItem("visitor_referral_code", data.referral_code)
        toast.success("¡Código de referido generado!")
      } else {
        toast.error("Error al generar código")
      }
    } catch (error) {
      console.error("Error generating referral code:", error)
      toast.error("Error al generar código")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (code: string) => {
    try {
      const response = await fetch(`/api/referral/stats?code=${code}`)
      const data = await response.json()
      if (data.success) {
        setStats(data.referral)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const copyToClipboard = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success("¡Link copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnSocial = (platform: string) => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`
    const text = "¡Descubre WEEK-CHAIN! Tokeniza semanas vacacionales en NFTs 🏖️"

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + referralLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
    }

    window.open(urls[platform], "_blank", "width=600,height=400")
  }

  if (!referralCode) {
    return (
      <Card
        className="border-2 border-[#C7CEEA]/30 bg-gradient-to-br from-[#C7CEEA]/10 to-[#FF9AA2]/10"
        data-referral-widget
      >
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF9AA2]/20">
              <Gift className="h-6 w-6 text-[#FF9AA2]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Gana Comisiones</CardTitle>
              <CardDescription className="text-base">Comparte WEEK-CHAIN y gana 3%</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 leading-relaxed">
            Genera tu link de referido único y gana <span className="font-bold text-[#FF9AA2]">3% de comisión</span> por
            cada persona que se registre y compre a través de tu link.
          </p>
          <Button
            onClick={generateReferralCode}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:from-[#ff8a92] hover:to-[#b7beda] text-white font-semibold h-12"
          >
            {loading ? "Generando..." : "Generar Mi Link de Referido"}
            <Share2 className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="border-2 border-[#C7CEEA]/30 bg-gradient-to-br from-[#C7CEEA]/10 to-[#FF9AA2]/10"
      data-referral-widget
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF9AA2]/20">
            <Share2 className="h-6 w-6 text-[#FF9AA2]" />
          </div>
          <div>
            <CardTitle className="text-2xl">Tu Link de Referido</CardTitle>
            <CardDescription className="text-base">Comparte y gana 3% de comisión</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <Users className="h-5 w-5 text-[#C7CEEA] mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stats.total_referrals}</div>
              <div className="text-xs text-slate-600">Referidos</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-[#B5EAD7] mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">${stats.total_sales_usdc?.toFixed(0) || 0}</div>
              <div className="text-xs text-slate-600">Ventas</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <Gift className="h-5 w-5 text-[#FF9AA2] mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">${stats.total_commissions_usdc?.toFixed(0) || 0}</div>
              <div className="text-xs text-slate-600">Comisiones</div>
            </div>
          </div>
        )}

        {/* Link de referido */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Tu Link de Referido</label>
          <div className="flex gap-2">
            <Input
              value={`${typeof window !== "undefined" ? window.location.origin : ""}?ref=${referralCode}`}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyToClipboard} variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Botones de compartir */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Compartir en Redes Sociales</label>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => shareOnSocial("whatsapp")} variant="outline" className="w-full">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </Button>
            <Button onClick={() => shareOnSocial("telegram")} variant="outline" className="w-full">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Telegram
            </Button>
            <Button onClick={() => shareOnSocial("twitter")} variant="outline" className="w-full">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Twitter
            </Button>
            <Button onClick={() => shareOnSocial("facebook")} variant="outline" className="w-full">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>
        </div>

        {/* Nota sobre registro */}
        <div className="rounded-xl bg-[#FFB7B2]/10 border border-[#FFB7B2]/30 p-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold">💡 Tip:</span> Cuando te registres en WEEK-CHAIN, podrás reclamar todas las
            comisiones acumuladas de tus referidos. ¡No pierdas tus ganancias!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
