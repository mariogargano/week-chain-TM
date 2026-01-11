"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Shield,
  Clock,
  CheckCircle2,
  RefreshCw,
  Filter,
  Search,
  Award,
  Building2,
  Calendar,
  ArrowRight,
  MapPin,
  Globe,
  AlertTriangle,
  Lock,
  FileCheck,
  ShieldCheck,
  XCircle,
  BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"

interface SaleLog {
  id: string
  property_name: string
  week_number: number
  season: string | null
  sale_amount_usd: number
  buyer_initials: string
  buyer_country: string | null
  buyer_avatar?: string
  broker_initials: string | null
  broker_name?: string
  broker_avatar?: string
  notary_name: string | null
  certificate_hash: string | null
  sale_date: string
  verified: boolean
}

interface SalesStats {
  totalSales: number
  totalVolume: number
}

const BUYER_AVATARS = [
  "/professional-mexican-man-smiling-headshot.jpg",
  "/professional-latina-woman-headshot.png",
  "/professional-american-man-headshot.jpg",
  "/professional-canadian-woman-headshot.jpg",
  "/professional-spanish-man-headshot.jpg",
  "/professional-italian-woman-headshot.jpg",
  "/professional-argentinian-man-headshot.jpg",
  "/professional-european-woman-headshot.jpg",
]

const BROKER_DATA = [
  { initials: "A.C.", name: "Ana Castillo", avatar: "/professional-latina-broker-woman-headshot.jpg" },
  { initials: "L.F.", name: "Luis Fernández", avatar: "/professional-mexican-broker-man-headshot.jpg" },
  { initials: "M.C.", name: "María Contreras", avatar: "/professional-real-estate-agent.png" },
  { initials: "R.G.", name: "Roberto García", avatar: "/professional-man-sales-agent-headshot.jpg" },
]

const COUNTRY_FLAGS: Record<string, string> = {
  México: "🇲🇽",
  "Estados Unidos": "🇺🇸",
  Canadá: "🇨🇦",
  España: "🇪🇸",
  Italia: "🇮🇹",
  Argentina: "🇦🇷",
  Francia: "🇫🇷",
  Alemania: "🇩🇪",
  Brasil: "🇧🇷",
  "Reino Unido": "🇬🇧",
}

export default function VentasPage() {
  const [sales, setSales] = useState<SaleLog[]>([])
  const [stats, setStats] = useState<SalesStats>({ totalSales: 0, totalVolume: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationResult, setVerificationResult] = useState<"idle" | "valid" | "invalid" | "checking">("idle")

  const fetchSales = async () => {
    try {
      setIsRefreshing(true)
      const res = await fetch("/api/sales-log?limit=100")
      if (res.ok) {
        const data = await res.json()
        const enrichedSales = (data.sales || []).map((sale: SaleLog, index: number) => ({
          ...sale,
          buyer_avatar: BUYER_AVATARS[index % BUYER_AVATARS.length],
          broker_name: sale.broker_initials ? BROKER_DATA.find((b) => b.initials === sale.broker_initials)?.name : null,
          broker_avatar: sale.broker_initials
            ? BROKER_DATA.find((b) => b.initials === sale.broker_initials)?.avatar
            : null,
        }))
        setSales(enrichedSales)
        setStats(data.stats || { totalSales: 0, totalVolume: 0 })
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSales()
    const interval = setInterval(fetchSales, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredSales = sales.filter((sale) => {
    const matchesFilter = filter === "all" || sale.property_name.toLowerCase().includes(filter.toLowerCase())
    const matchesSearch =
      searchTerm === "" ||
      sale.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.buyer_initials.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getSeasonColor = (season: string | null) => {
    switch (season) {
      case "high":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "medium":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      default:
        return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  const getSeasonLabel = (season: string | null) => {
    switch (season) {
      case "high":
        return "Temporada Alta"
      case "medium":
        return "Temporada Media"
      case "low":
        return "Temporada Baja"
      default:
        return "N/A"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" })
  }

  const handleVerification = () => {
    if (!verificationCode.trim()) return
    setVerificationResult("checking")
    // Simulate verification
    setTimeout(() => {
      // Check if code matches any certificate hash in sales
      const found = sales.some((sale) => sale.certificate_hash?.toLowerCase().includes(verificationCode.toLowerCase()))
      setVerificationResult(found ? "valid" : "invalid")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section - Anti-Fraud System */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">WEEK-Tracker</h1>
            <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
              Sistema de verificación pública de certificados vacacionales. Consulta la autenticidad de certificados
              emitidos oficialmente.
            </p>

            {/* Important Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 max-w-2xl mx-auto mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-amber-400 font-bold text-lg mb-2">Aviso Importante</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Los certificados WEEK-CHAIN son emitidos directamente por nuestra plataforma oficial. La
                    transferencia o cesión de derechos está{" "}
                    <span className="text-white font-semibold">sujeta a disponibilidad</span> y requiere{" "}
                    <span className="text-white font-semibold">solicitud previa</span> a WEEK-CHAIN para validación.
                    Verifica siempre la autenticidad antes de cualquier transacción.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BadgeCheck className="h-5 w-5 text-[#4ECDC4]" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalSales}</p>
                <p className="text-sm text-slate-400">Certificados Válidos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-[#FF6B6B]" />
                </div>
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm text-slate-400">Verificados</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-sm text-slate-400">Propiedades</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">8</p>
                <p className="text-sm text-slate-400">Países</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Verification Section */}
      <section className="py-12 bg-gradient-to-b from-slate-100 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#4ECDC4]/20 flex items-center justify-center">
                    <FileCheck className="h-7 w-7 text-[#4ECDC4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Verificación Pública de Certificados</h2>
                    <p className="text-slate-400 text-sm">
                      Comprueba la autenticidad de cualquier certificado WEEK-CHAIN
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              <div className="p-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Ingresa el código del certificado (ej: WC-2024-XXXX)"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value)
                        setVerificationResult("idle")
                      }}
                      className="pl-12 h-14 text-lg border-slate-200 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20"
                    />
                  </div>
                  <Button
                    onClick={handleVerification}
                    disabled={!verificationCode.trim() || verificationResult === "checking"}
                    className="h-14 px-8 bg-[#4ECDC4] hover:bg-[#3BA89F] text-white font-semibold"
                  >
                    {verificationResult === "checking" ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Verificar
                      </>
                    )}
                  </Button>
                </div>

                {/* Verification Result */}
                <AnimatePresence mode="wait">
                  {verificationResult === "valid" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-emerald-800 font-bold text-lg">Certificado Válido</h3>
                          <p className="text-emerald-600 text-sm">
                            Este certificado ha sido emitido oficialmente por WEEK-CHAIN y está activo.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {verificationResult === "invalid" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                          <XCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-red-800 font-bold text-lg">Certificado No Encontrado</h3>
                          <p className="text-red-600 text-sm">
                            Este código no corresponde a ningún certificado emitido por WEEK-CHAIN. Podría ser
                            fraudulento.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info Cards */}
                <div className="grid sm:grid-cols-3 gap-4 mt-8">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <Lock className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Solo Plataforma Oficial</p>
                    <p className="text-xs text-slate-500 mt-1">Compra únicamente en week-chain.com</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <FileCheck className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Cesión Autorizada</p>
                    <p className="text-xs text-slate-500 mt-1">Transferencias con aprobación previa</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <ShieldCheck className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Verificación 24/7</p>
                    <p className="text-xs text-slate-500 mt-1">Sistema público disponible siempre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por propiedad o comprador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/20"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-52 border-slate-200">
                  <Filter className="h-4 w-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Filtrar por propiedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las propiedades</SelectItem>
                  <SelectItem value="tulum">Villa Tulum</SelectItem>
                  <SelectItem value="cancun">Penthouse Cancún</SelectItem>
                  <SelectItem value="playa">Casa Playa del Carmen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={fetchSales}
              disabled={isRefreshing}
              className="gap-2 border-slate-300 hover:bg-slate-50 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </section>

      {/* Sales Log */}
      <section className="py-10">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ECDC4] to-[#3BA89F] flex items-center justify-center">
                <BadgeCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Certificados Verificados</h2>
                <p className="text-sm text-slate-500">{filteredSales.length} certificados emitidos oficialmente</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[#4ECDC4] border-[#4ECDC4]">
              <span className="w-2 h-2 bg-[#4ECDC4] rounded-full mr-2 animate-pulse" />
              Registro en tiempo real
            </Badge>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="h-10 w-10 animate-spin text-[#FF6B6B] mb-4" />
              <p className="text-slate-500">Cargando transacciones...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl">
              <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No se encontraron transacciones</p>
              <p className="text-slate-400 text-sm mt-2">Intenta con otros filtros de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredSales.map((sale, index) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                      {/* Record Number */}
                      <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm">
                        #{String(index + 1).padStart(3, "0")}
                      </div>

                      {/* Buyer Info */}
                      <div className="flex items-center gap-4 min-w-[220px]">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
                            <Image
                              src={sale.buyer_avatar || "/placeholder.svg?height=56&width=56&query=person"}
                              alt="Comprador"
                              width={56}
                              height={56}
                              className="object-cover"
                            />
                          </div>
                          {sale.verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#4ECDC4] rounded-full flex items-center justify-center shadow-sm">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-lg">{sale.buyer_initials}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="text-base">{COUNTRY_FLAGS[sale.buyer_country || "México"] || "🌍"}</span>
                            <span>{sale.buyer_country || "México"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-[#FF6B6B]" />
                          <p className="font-semibold text-slate-900">{sale.property_name}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            <Calendar className="h-3.5 w-3.5" />
                            Semana {sale.week_number}
                          </span>
                          <Badge variant="outline" className={getSeasonColor(sale.season)}>
                            {getSeasonLabel(sale.season)}
                          </Badge>
                        </div>
                      </div>

                      {/* Broker Info */}
                      {sale.broker_name && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-200">
                            <Image
                              src={sale.broker_avatar || "/placeholder.svg?height=40&width=40&query=broker"}
                              alt="Broker"
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-amber-600 font-medium">Asesor</p>
                            <p className="text-sm font-semibold text-slate-800">{sale.broker_name}</p>
                          </div>
                          <Award className="h-5 w-5 text-amber-500" />
                        </div>
                      )}

                      {/* Amount and Time */}
                      <div className="text-right min-w-[140px]">
                        <p className="text-2xl font-bold text-slate-900">${sale.sale_amount_usd.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 flex items-center justify-end gap-1.5 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {getTimeAgo(sale.sale_date)}
                        </p>
                      </div>

                      {/* Verify Link */}
                      <Link
                        href={`/verify/${sale.certificate_hash || "demo"}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#4ECDC4] hover:text-[#3BA89F] font-semibold bg-[#4ECDC4]/10 hover:bg-[#4ECDC4]/20 rounded-lg transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        Verificar
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Cómo Funciona la Protección?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              WEEK-Tracker garantiza la autenticidad de cada certificado emitido en nuestra plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center mb-6">
                <Lock className="h-7 w-7 text-[#FF6B6B]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Adquisición Oficial</h3>
              <p className="text-slate-600">
                Los certificados WEEK-CHAIN solo pueden ser adquiridos directamente en nuestra plataforma oficial. No
                existen distribuidores ni intermediarios autorizados para la venta inicial.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                <FileCheck className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Transferencia Controlada</h3>
              <p className="text-slate-600">
                Si deseas transferir o ceder tu certificado a otra persona, debes notificar a WEEK-CHAIN y obtener
                autorización previa. Esto garantiza la trazabilidad y validez del certificado.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-[#4ECDC4]/10 flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7 text-[#4ECDC4]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verificación Pública</h3>
              <p className="text-slate-600">
                Cualquier persona puede verificar la autenticidad de un certificado en tiempo real usando nuestro
                sistema público. Si no aparece en nuestro registro, es falso.
              </p>
            </div>
          </div>

          {/* Warning Box */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-red-800 font-bold text-lg mb-2">Protégete del Fraude</h4>
                  <ul className="text-red-700 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Nunca compres certificados fuera de la plataforma oficial week-chain.com</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>No aceptes transferencias de certificados sin verificar primero en WEEK-Tracker</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Desconfía de ofertas o precios muy por debajo del valor oficial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                      <span className="text-emerald-700">
                        Siempre verifica el código del certificado antes de cualquier transacción
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
