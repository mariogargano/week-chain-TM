"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  BadgeCheck,
  CreditCard,
  Building2,
  Users,
  Briefcase,
  Mail,
  BarChart3,
  FileText,
  Scale,
  Shield,
  Settings,
  ShieldCheck,
  Bot,
  Coins,
  Activity,
  MapPin,
  ShoppingBag,
  Sparkles,
  Home,
  Plus,
  Zap,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

type PaletteItem = {
  label: string
  href: string
  icon: any
  group: string
  superAdminOnly?: boolean
  keywords?: string[]
}

const items: PaletteItem[] = [
  { label: "Panel principal", href: "/dashboard/admin", icon: Home, group: "Operacion", keywords: ["home", "dashboard", "inicio"] },
  { label: "Reservaciones", href: "/dashboard/admin/reservations", icon: Calendar, group: "Operacion", keywords: ["request", "offer", "confirm", "bookings"] },
  { label: "KYC y verificacion", href: "/dashboard/admin/kyc", icon: BadgeCheck, group: "Operacion", keywords: ["identidad", "persona"] },
  { label: "Aprobaciones pendientes", href: "/dashboard/admin/approvals", icon: ShieldCheck, group: "Operacion" },
  { label: "Check-in / Check-out", href: "/dashboard/admin/bookings", icon: MapPin, group: "Operacion" },

  { label: "Centro financiero", href: "/dashboard/admin/finanzas", icon: Coins, group: "Finanzas", keywords: ["dinero", "finance"] },
  { label: "Pagos", href: "/dashboard/admin/payments", icon: CreditCard, group: "Finanzas", keywords: ["conekta", "stripe"] },
  { label: "Escrow contable", href: "/dashboard/admin/escrow-contable", icon: Shield, group: "Finanzas" },
  { label: "Transacciones", href: "/dashboard/admin/transactions", icon: FileText, group: "Finanzas" },
  { label: "Wallets", href: "/dashboard/admin/wallets", icon: Briefcase, group: "Finanzas" },

  { label: "Propiedades", href: "/dashboard/admin/properties", icon: Building2, group: "Inventario" },
  { label: "Destinos", href: "/dashboard/admin/destinations", icon: MapPin, group: "Inventario" },
  { label: "Certificados SVC", href: "/dashboard/admin/certificates", icon: BadgeCheck, group: "Inventario", keywords: ["silver", "gold", "platinum"] },
  { label: "Semanas", href: "/dashboard/admin/weeks", icon: Calendar, group: "Inventario" },
  { label: "Supply", href: "/dashboard/admin/supply", icon: ShoppingBag, group: "Inventario" },

  { label: "Usuarios", href: "/dashboard/admin/users", icon: Users, group: "Comercial" },
  { label: "Red de brokers", href: "/dashboard/admin/broker-network", icon: Briefcase, group: "Comercial", keywords: ["week-agent", "4%"] },
  { label: "Vouchers", href: "/dashboard/admin/vouchers", icon: BadgeCheck, group: "Comercial", keywords: ["descuento", "codigo"] },
  { label: "Testimonios", href: "/dashboard/admin/testimonials", icon: Sparkles, group: "Comercial" },

  { label: "Centro de emails", href: "/dashboard/admin/emails", icon: Mail, group: "Comunicacion" },
  { label: "Notificaciones", href: "/dashboard/admin/notifications", icon: Activity, group: "Comunicacion" },
  { label: "Bandeja de contacto", href: "/dashboard/admin/contact-inbox", icon: Mail, group: "Comunicacion" },

  { label: "Analitica general", href: "/dashboard/admin/analytics", icon: BarChart3, group: "Analisis", keywords: ["kpi", "metricas"] },
  { label: "Reportes", href: "/dashboard/admin/reports", icon: FileText, group: "Analisis" },
  { label: "Riesgo de capacidad", href: "/dashboard/admin/capacity-risk", icon: Shield, group: "Analisis", keywords: ["48+4"] },
  { label: "Alertas", href: "/dashboard/admin/alerts", icon: Activity, group: "Analisis" },

  { label: "Legalario (NOM-151)", href: "/dashboard/admin/legalario", icon: Scale, group: "Legal" },
  { label: "Compliance PROFECO", href: "/dashboard/admin/compliance", icon: Shield, group: "Legal" },
  { label: "Documentos", href: "/dashboard/admin/documents", icon: FileText, group: "Legal" },

  { label: "Configuracion", href: "/dashboard/admin/settings", icon: Settings, group: "Super admin", superAdminOnly: true },
  { label: "Seguridad", href: "/dashboard/admin/security", icon: Shield, group: "Super admin", superAdminOnly: true },
  { label: "Registro de auditoria", href: "/dashboard/admin/audit-logs", icon: FileText, group: "Super admin", superAdminOnly: true },
  { label: "Equipo y roles", href: "/dashboard/admin/team", icon: Users, group: "Super admin", superAdminOnly: true },
  { label: "Oficina virtual (IA)", href: "/dashboard/admin/virtual-office", icon: Bot, group: "Super admin", superAdminOnly: true },
  { label: "Monitor tiempo real", href: "/dashboard/admin/real-time-monitor", icon: Activity, group: "Super admin", superAdminOnly: true },
  { label: "Webhooks", href: "/dashboard/admin/webhooks", icon: Activity, group: "Super admin", superAdminOnly: true },
]

const quickActions = [
  { label: "Nueva reservacion manual", href: "/dashboard/admin/reservations?action=new", icon: Plus, shortcut: "R" },
  { label: "Aprobar KYC pendientes", href: "/dashboard/admin/kyc?tab=pending", icon: BadgeCheck, shortcut: "K" },
  { label: "Liberar escrow", href: "/dashboard/admin/escrow-contable?tab=pending", icon: Coins, shortcut: "E" },
  { label: "Ver alertas", href: "/dashboard/admin/alerts", icon: Zap, shortcut: "A" },
]

type Props = {
  isSuperAdmin?: boolean
}

export function CommandPalette({ isSuperAdmin = false }: Props) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  const grouped = React.useMemo(() => {
    const filtered = items.filter((i) => !i.superAdminOnly || isSuperAdmin)
    const byGroup: Record<string, PaletteItem[]> = {}
    for (const it of filtered) {
      if (!byGroup[it.group]) byGroup[it.group] = []
      byGroup[it.group].push(it)
    }
    return byGroup
  }, [isSuperAdmin])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 transition-colors hover:bg-white hover:border-slate-300 min-w-[240px] focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        aria-label="Abrir paleta de comandos"
      >
        <span className="inline-flex h-4 w-4 items-center justify-center text-slate-400">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="flex-1 text-left">Buscar o ir a...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-white"
        aria-label="Abrir busqueda"
      >
        <Sparkles className="h-4 w-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Escribe una seccion, accion o atajo..." />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>

          <CommandGroup heading="Acciones rapidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.href}
                onSelect={() => runCommand(() => router.push(action.href))}
                value={`accion ${action.label}`}
              >
                <action.icon className="mr-2 h-4 w-4 text-sky-500" />
                <span>{action.label}</span>
                <CommandShortcut>{action.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {Object.entries(grouped).map(([group, groupItems]) => (
            <CommandGroup key={group} heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  value={`${item.label} ${item.keywords?.join(" ") || ""}`}
                >
                  <item.icon className="mr-2 h-4 w-4 text-slate-500" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
