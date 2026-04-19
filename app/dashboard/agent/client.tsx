"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Shield,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Link2,
  Receipt,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface AgentProfile {
  id: string
  referral_code: string
  status: string
  display_name: string | null
  total_sales: number | null
  total_commissions: number | null
  created_at: string
}

interface CommissionRow {
  id: string
  certificate_tier: string | null
  sale_amount: number
  commission_rate: number
  commission_amount: number
  status: string
  hold_until: string | null
  approved_at: string | null
  paid_at: string | null
  created_at: string
  buyer_user_id: string | null
  order_id: string | null
}

interface AttributionRow {
  id: string
  lead_email: string | null
  lead_user_id: string | null
  created_at: string
  expires_at: string
  converted_at: string | null
}

interface KycRow {
  status: string
  submitted_at: string | null
  reviewed_at: string | null
}

interface Props {
  profile: AgentProfile
  kyc: KycRow | null
  commissions: CommissionRow[]
  attributions: AttributionRow[]
  userFullName: string
  userEmail: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function formatDate(iso: string | null) {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: {
    label: "En retencion",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  approved: {
    label: "Aprobada",
    className: "bg-sky-100 text-sky-800 border-sky-200",
  },
  paid: {
    label: "Pagada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  reversed: {
    label: "Reversada",
    className: "bg-red-100 text-red-800 border-red-200",
  },
}

export function AgentDashboardClient({
  profile,
  kyc,
  commissions,
  attributions,
  userFullName,
  userEmail,
}: Props) {
  const searchParams = useSearchParams()
  const isWelcome = searchParams?.get("welcome") === "1"

  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [origin, setOrigin] = useState("https://week-chain.com")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const referralLink = `${origin}/certificates?ref=${profile.referral_code}`

  const stats = useMemo(() => {
    const paid = commissions.filter((c) => c.status === "paid")
    const pending = commissions.filter((c) => c.status === "pending")
    const approved = commissions.filter((c) => c.status === "approved")
    const reversed = commissions.filter((c) => c.status === "reversed")

    const totalPaid = paid.reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    const totalPending = pending.reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    const totalApproved = approved.reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    const totalSales = commissions
      .filter((c) => c.status !== "reversed")
      .reduce((s, c) => s + Number(c.sale_amount || 0), 0)

    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)
    const thisMonthPaid = paid
      .filter((c) => new Date(c.created_at) >= thisMonthStart)
      .reduce((s, c) => s + Number(c.commission_amount || 0), 0)

    const totalLeads = attributions.length
    const converted = attributions.filter((a) => a.converted_at).length
    const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0

    return {
      totalPaid,
      totalPending,
      totalApproved,
      totalSales,
      thisMonthPaid,
      totalLeads,
      converted,
      conversionRate,
      reversedCount: reversed.length,
      totalCommissions: commissions.length,
    }
  }, [commissions, attributions])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success("Enlace copiado al portapapeles")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referral_code)
      setCopiedCode(true)
      toast.success("Codigo copiado")
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  const shareLink = async () => {
    const shareData = {
      title: "Certificado Digital WEEK-CHAIN",
      text: `${userFullName} te invita a WEEK-CHAIN. Obten tu certificado de uso vacacional con 15 anos de vigencia.`,
      url: referralLink,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  const kycApproved = kyc?.status === "approved"
  const kycPending = kyc?.status === "pending" || kyc?.status === "submitted"

  return (
    <div className="space-y-6">
      {isWelcome && (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-amber-900">Bienvenido al programa de agentes, {userFullName.split(" ")[0]}</p>
              <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                Tu enlace personal esta listo. Cada certificado vendido a traves de tu link te genera una comision del 4%. Completa tu KYC para habilitar cobros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard de Agente</h1>
            <Badge className="bg-amber-500 text-white hover:bg-amber-600">4% comision</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Hola {userFullName.split(" ")[0]}, gestiona tu link, ventas y comisiones.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/member">
              Vista cliente
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
            <Link href="/certificates">
              Comprar certificado
            </Link>
          </Button>
        </div>
      </div>

      {/* KYC gate banner */}
      {!kycApproved && (
        <div
          className={`rounded-2xl border p-4 md:p-5 ${
            kycPending ? "border-amber-300 bg-amber-50" : "border-sky-300 bg-sky-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <Shield className={`mt-0.5 h-5 w-5 flex-shrink-0 ${kycPending ? "text-amber-600" : "text-sky-600"}`} />
            <div className="flex-1">
              <p className={`font-semibold ${kycPending ? "text-amber-900" : "text-sky-900"}`}>
                {kycPending ? "Tu KYC esta en revision" : "Completa tu KYC para recibir pagos"}
              </p>
              <p className={`mt-1 text-sm ${kycPending ? "text-amber-800" : "text-sky-800"}`}>
                {kycPending
                  ? "Te notificaremos cuando este aprobado. Ya puedes empezar a compartir tu enlace, tus comisiones se acumulan."
                  : "Puedes compartir tu enlace desde ya, pero las comisiones solo se liberan una vez completes el KYC."}
              </p>
              {!kycPending && (
                <Button asChild size="sm" className="mt-3 bg-sky-600 text-white hover:bg-sky-700">
                  <Link href="/dashboard/member/kyc">
                    <Shield className="mr-1.5 h-4 w-4" />
                    Iniciar verificacion KYC
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Referral link - hero card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Tu enlace de referido</p>
              </div>
              <p className="mt-3 break-all rounded-lg bg-slate-950/70 px-3 py-2.5 font-mono text-xs text-amber-100 md:text-sm">
                {referralLink}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Atribucion: 30 dias</span>
                <span className="opacity-50">&middot;</span>
                <span>Codigo: <span className="font-mono font-semibold text-amber-400">{profile.referral_code}</span></span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:w-auto md:grid-cols-3">
              <Button
                onClick={copyCode}
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <span className="text-xs">Codigo</span>}
              </Button>
              <Button
                onClick={copyLink}
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                onClick={shareLink}
                size="sm"
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Pagado total"
          value={formatCurrency(stats.totalPaid)}
          sub={`${commissions.filter((c) => c.status === "paid").length} comisiones`}
          tone="emerald"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="En retencion"
          value={formatCurrency(stats.totalPending)}
          sub="45 dias de hold"
          tone="amber"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Este mes"
          value={formatCurrency(stats.thisMonthPaid)}
          sub={new Date().toLocaleDateString("es-MX", { month: "long" })}
          tone="sky"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Referidos"
          value={stats.totalLeads.toString()}
          sub={`${stats.conversionRate.toFixed(0)}% conversion`}
          tone="slate"
        />
      </div>

      {/* Secondary info row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <MiniStat label="Ventas totales" value={formatCurrency(stats.totalSales)} />
        <MiniStat label="Aprobadas por liberar" value={formatCurrency(stats.totalApproved)} />
        <MiniStat label="Ordenes confirmadas" value={stats.totalCommissions.toString()} />
      </div>

      {/* Tabs: commissions / leads / how it works */}
      <Tabs defaultValue="commissions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commissions" className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Comisiones
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Referidos
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Como funciona
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-3">
          {commissions.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-8 w-8 text-amber-500" />}
              title="Aun no tienes comisiones"
              description="Comparte tu enlace en WhatsApp, Instagram o donde prefieras. Cada certificado vendido te genera un 4%."
              cta={
                <Button onClick={shareLink} className="bg-amber-500 text-white hover:bg-amber-600">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir enlace
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {commissions.map((c) => {
                const meta = STATUS_LABEL[c.status] || {
                  label: c.status,
                  className: "bg-slate-100 text-slate-700 border-slate-200",
                }
                return (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {c.certificate_tier || "CERT"}
                            </Badge>
                            <Badge className={meta.className}>{meta.label}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Venta: <span className="font-semibold text-foreground">{formatCurrency(c.sale_amount)}</span>{" "}
                            &middot; Rate: {(Number(c.commission_rate) * 100).toFixed(1)}%
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(c.created_at)}
                            {c.status === "pending" && c.hold_until && (
                              <> &middot; Liberable el {formatDate(c.hold_until)}</>
                            )}
                            {c.status === "paid" && c.paid_at && (
                              <> &middot; Pagada el {formatDate(c.paid_at)}</>
                            )}
                          </p>
                        </div>
                        <div className="text-right sm:min-w-[120px]">
                          <p className="text-xl font-bold text-foreground">
                            {formatCurrency(c.commission_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">Tu comision</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-3">
          {attributions.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-sky-500" />}
              title="Aun no hay visitas atribuidas"
              description="Cuando alguien entre con tu enlace, aparecera aqui. La atribucion dura 30 dias."
            />
          ) : (
            <div className="space-y-3">
              {attributions.map((a) => {
                const converted = !!a.converted_at
                const expired = new Date(a.expires_at) < new Date()
                return (
                  <Card key={a.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {a.lead_email || a.lead_user_id || "Visitante anonimo"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Referido {formatDate(a.created_at)} &middot; Expira {formatDate(a.expires_at)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {converted ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              Compro
                            </Badge>
                          ) : expired ? (
                            <Badge variant="outline" className="text-muted-foreground">Expirado</Badge>
                          ) : (
                            <Badge className="bg-sky-100 text-sky-800 border-sky-200">Activo</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guide" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Asi funciona tu comision</CardTitle>
              <CardDescription>Todo lo que necesitas saber para ganar con WEEK-CHAIN</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GuideStep
                n={1}
                title="Comparte tu enlace"
                text="Usa WhatsApp, Instagram, email o SMS. El enlace marca al visitante con una cookie de 30 dias."
              />
              <GuideStep
                n={2}
                title="El cliente compra"
                text="Si compra un certificado en los 30 dias siguientes, el sistema genera automaticamente tu comision del 4%."
              />
              <GuideStep
                n={3}
                title="Periodo de retencion"
                text="La comision entra en retencion por 45 dias (proteccion anti-fraude y reembolsos)."
              />
              <GuideStep
                n={4}
                title="Aprobacion con KYC"
                text="Pasados los 45 dias, si tu KYC esta aprobado, la comision cambia a 'aprobada' y entra al siguiente lote de pago."
              />
              <GuideStep
                n={5}
                title="Cobro"
                text="Nuestro equipo ejecuta el pago del lote y marca tus comisiones como 'pagadas'. Puedes ver el historial completo arriba."
              />
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-semibold">Reglas clave</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li>Comision flat del 4% sobre cualquier certificado.</li>
                  <li>No se permite auto-referido (no puedes cobrarte a ti mismo).</li>
                  <li>Reembolsos y contracargos reversan la comision automaticamente.</li>
                  <li>Todas las comisiones requieren KYC aprobado para ser liberadas.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plantillas para compartir</CardTitle>
              <CardDescription>Copia y pega en tus canales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ShareTemplate
                title="WhatsApp"
                body={`Hola! Te comparto WEEK-CHAIN: un Certificado Digital de uso vacacional con 15 anos de vigencia, pago unico, hasta 8 personas. Te dejo mi enlace personal: ${referralLink}`}
              />
              <ShareTemplate
                title="Instagram / Story"
                body={`Reserva tu proxima vacacion con WEEK-CHAIN. Certificado digital, 15 anos, hasta 8 personas. Registrate aqui: ${referralLink}`}
              />
              <ShareTemplate
                title="Email corto"
                body={`Te paso el enlace de WEEK-CHAIN, son certificados digitales de uso vacacional con vigencia de 15 anos. Si entras desde mi link aprovechan atencion personalizada. ${referralLink}`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <p>
          <strong className="text-slate-900">Aviso legal:</strong> el programa de agentes WEEK-CHAIN paga una comision
          flat del 4% sobre la venta directa de certificados digitales. No hay pagos multinivel. Las comisiones se
          retienen 45 dias desde la fecha de venta como proteccion anti-fraude. Requiere KYC aprobado para liberacion.
          Reembolsos, contracargos o disputas reversan automaticamente la comision. WEEK-CHAIN puede suspender o cancelar
          la cuenta del agente en caso de violar las politicas de uso.
        </p>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone: "emerald" | "amber" | "sky" | "slate"
}) {
  const toneMap: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${toneMap[tone]}`}>
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <p className="text-xl font-bold text-foreground sm:text-2xl">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode
  title: string
  description: string
  cta?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          {icon}
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        {cta && <div className="mt-4">{cta}</div>}
      </CardContent>
    </Card>
  )
}

function GuideStep({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
        {n}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function ShareTemplate({ title, body }: { title: string; body: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body)
      setDone(true)
      toast.success(`Plantilla ${title} copiada`)
      setTimeout(() => setDone(false), 2000)
    } catch {
      toast.error("No se pudo copiar")
    }
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <Button size="sm" variant="ghost" onClick={copy}>
          {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-line">{body}</p>
    </div>
  )
}
