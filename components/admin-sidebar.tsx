"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CreditCard,
  BadgeCheck,
  Briefcase,
  BarChart3,
  Settings,
  Home,
  Bot,
  Mail,
  Shield,
  ShieldCheck,
  Scale,
  Search,
  ChevronDown,
  ChevronRight,
  Database,
  Network,
  Activity,
  Coins,
  FileText,
  MapPin,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type Item = {
  title: string
  href: string
  icon: any
  superAdminOnly?: boolean
  description?: string
}

type Group = {
  id: string
  label: string
  icon: any
  defaultOpen?: boolean
  superAdminOnly?: boolean
  items: Item[]
}

const groups: Group[] = [
  {
    id: "operacion",
    label: "Operacion diaria",
    icon: Sparkles,
    defaultOpen: true,
    items: [
      { title: "Panel principal", href: "/dashboard/admin", icon: LayoutDashboard, description: "Vista general" },
      { title: "Reservaciones", href: "/dashboard/admin/reservations", icon: Calendar, description: "Request, Offer, Confirm" },
      { title: "KYC y verificacion", href: "/dashboard/admin/kyc", icon: BadgeCheck, description: "Aprobaciones" },
      { title: "Check-in / Check-out", href: "/dashboard/admin/bookings", icon: MapPin, description: "Estancias activas" },
      { title: "Aprobaciones", href: "/dashboard/admin/approvals", icon: ShieldCheck, description: "Pendientes" },
    ],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    icon: Coins,
    defaultOpen: true,
    items: [
      { title: "Centro financiero", href: "/dashboard/admin/finanzas", icon: Coins, description: "Vision global" },
      { title: "Pagos", href: "/dashboard/admin/payments", icon: CreditCard, description: "Cobros y estados" },
      { title: "Escrow contable", href: "/dashboard/admin/escrow-contable", icon: Shield, description: "Liberaciones" },
      { title: "Transacciones", href: "/dashboard/admin/transactions", icon: FileText, description: "Historial" },
      { title: "Wallets", href: "/dashboard/admin/wallets", icon: Briefcase, description: "Retiros / balances" },
    ],
  },
  {
    id: "inventario",
    label: "Inventario",
    icon: Building2,
    items: [
      { title: "Propiedades", href: "/dashboard/admin/properties", icon: Building2, description: "Catalogo completo" },
      { title: "Destinos", href: "/dashboard/admin/destinations", icon: MapPin, description: "Ubicaciones" },
      { title: "Certificados SVC", href: "/dashboard/admin/certificates", icon: BadgeCheck, description: "Silver, Gold, Platinum" },
      { title: "Semanas", href: "/dashboard/admin/weeks", icon: Calendar, description: "Inventario vacacional" },
      { title: "Supply", href: "/dashboard/admin/supply", icon: ShoppingBag, description: "Oferta disponible" },
      { title: "OTA Sync", href: "/dashboard/admin/ota-sync", icon: Network, description: "Booking, Airbnb, etc" },
      { title: "Rentas", href: "/dashboard/admin/rentals", icon: Home, description: "Alquileres activos" },
    ],
  },
  {
    id: "comercial",
    label: "Comercial",
    icon: Briefcase,
    items: [
      { title: "Usuarios", href: "/dashboard/admin/users", icon: Users, description: "Holders" },
      { title: "Red de brokers", href: "/dashboard/admin/broker-network", icon: Network, description: "WEEK-Agent 4%" },
      { title: "Vouchers", href: "/dashboard/admin/vouchers", icon: BadgeCheck, description: "Codigos promocionales" },
      { title: "Marketing", href: "/dashboard/admin/marketing", icon: Sparkles, description: "Campanas" },
      { title: "Testimonios", href: "/dashboard/admin/testimonials", icon: MessageSquare, description: "Resenas" },
    ],
  },
  {
    id: "comunicacion",
    label: "Comunicacion",
    icon: Mail,
    items: [
      { title: "Centro de emails", href: "/dashboard/admin/emails", icon: Mail, description: "Templates, logs, automation" },
      { title: "Notificaciones", href: "/dashboard/admin/notifications", icon: MessageSquare, description: "Push y sistema" },
      { title: "Bandeja contacto", href: "/dashboard/admin/contact-inbox", icon: Mail, description: "Mensajes entrantes" },
    ],
  },
  {
    id: "analitica",
    label: "Analisis",
    icon: BarChart3,
    items: [
      { title: "Analitica general", href: "/dashboard/admin/analytics", icon: BarChart3, description: "KPIs y metricas" },
      { title: "Reportes", href: "/dashboard/admin/reports", icon: FileText, description: "Exportables" },
      { title: "Riesgo de capacidad", href: "/dashboard/admin/capacity-risk", icon: Shield, description: "Motor 48+4" },
      { title: "Alertas", href: "/dashboard/admin/alerts", icon: Activity, description: "Sistema de alertas" },
    ],
  },
  {
    id: "legal",
    label: "Legal y compliance",
    icon: Scale,
    items: [
      { title: "Legalario NOM-151", href: "/dashboard/admin/legalario", icon: Scale, description: "Constancias" },
      { title: "Compliance PROFECO", href: "/dashboard/admin/compliance", icon: Shield, description: "Consents y evidence" },
      { title: "Certificaciones", href: "/dashboard/admin/certifications", icon: BadgeCheck, description: "NOM-029, etc" },
      { title: "Documentos", href: "/dashboard/admin/documents", icon: FileText, description: "Repositorio" },
      { title: "Aprobacion propiedades", href: "/dashboard/admin/property-approvals", icon: Building2, description: "Verificacion" },
    ],
  },
  {
    id: "super",
    label: "Super admin",
    icon: ShieldCheck,
    superAdminOnly: true,
    items: [
      { title: "Configuracion", href: "/dashboard/admin/settings", icon: Settings, superAdminOnly: true, description: "Sistema global" },
      { title: "Seguridad", href: "/dashboard/admin/security", icon: Shield, superAdminOnly: true, description: "2FA, sesiones" },
      { title: "Registro de auditoria", href: "/dashboard/admin/audit-logs", icon: FileText, superAdminOnly: true, description: "Eventos NOM-151" },
      { title: "Equipo y roles", href: "/dashboard/admin/team", icon: Users, superAdminOnly: true, description: "RBAC" },
      { title: "Webhooks", href: "/dashboard/admin/webhooks", icon: Network, superAdminOnly: true, description: "Integraciones" },
      { title: "Base de datos", href: "/dashboard/admin/database", icon: Database, superAdminOnly: true, description: "Supabase admin" },
      { title: "Monitor tiempo real", href: "/dashboard/admin/real-time-monitor", icon: Activity, superAdminOnly: true, description: "Live events" },
      { title: "Oficina virtual IA", href: "/dashboard/admin/virtual-office", icon: Bot, superAdminOnly: true, description: "Agentes IA" },
      { title: "Proveedores", href: "/dashboard/admin/providers", icon: Globe, superAdminOnly: true, description: "Supply partners" },
      { title: "DAO (avanzado)", href: "/dashboard/admin/dao", icon: Globe, superAdminOnly: true, description: "Gobernanza futura" },
      { title: "VA-FI (avanzado)", href: "/dashboard/admin/vafi", icon: Coins, superAdminOnly: true, description: "Tokenizacion Q1 2027" },
      { title: "Exit strategy", href: "/dashboard/admin/exit-strategy", icon: ShieldCheck, superAdminOnly: true, description: "Salida inversores" },
      { title: "WEEK balance", href: "/dashboard/admin/week-balance", icon: Coins, superAdminOnly: true, description: "Contabilidad tokens" },
      { title: "Servicios", href: "/dashboard/admin/services", icon: Globe, superAdminOnly: true, description: "Addons vacacionales" },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state, setOpenMobile } = useSidebar()
  const [query, setQuery] = useState("")
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [userEmail, setUserEmail] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email || "")
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()
          if (data?.role) setUserRole(data.role)
        }
      } catch {
        // silent
      }
    }
    load()
  }, [])

  const isSuperAdmin = useMemo(() => {
    const envEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase()
    const email = userEmail.toLowerCase()
    return userRole === "super_admin" || (envEmail !== "" && email === envEmail)
  }, [userEmail, userRole])

  useEffect(() => {
    const initial: Record<string, boolean> = {}
    groups.forEach((g) => {
      if (g.superAdminOnly && !isSuperAdmin) return
      const hasActive = g.items.some((i) => {
        const base = i.href.split("?")[0]
        return pathname === base || (base !== "/dashboard/admin" && pathname.startsWith(base + "/"))
      })
      initial[g.id] = hasActive || !!g.defaultOpen
    })
    setOpenGroups(initial)
  }, [pathname, isSuperAdmin])

  const visibleGroups = useMemo(() => {
    const result = groups
      .filter((g) => !g.superAdminOnly || isSuperAdmin)
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => !i.superAdminOnly || isSuperAdmin),
      }))
      .filter((g) => g.items.length > 0)

    if (!query.trim()) return result
    const q = query.toLowerCase()
    return result
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q) ||
            g.label.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0)
  }, [isSuperAdmin, query])

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleLinkClick = () => {
    setOpenMobile(false)
  }

  const isActive = (href: string) => {
    const base = href.split("?")[0]
    if (pathname === base) return true
    if (base !== "/dashboard/admin" && pathname.startsWith(base + "/")) return true
    return false
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-100 p-3">
        <Link href="/dashboard/admin" onClick={handleLinkClick} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-sm flex-shrink-0">
            <span className="text-white font-bold">W</span>
          </div>
          {state === "expanded" && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">WEEK-CHAIN</span>
              <span className="text-[10px] font-medium text-slate-500">
                {isSuperAdmin ? "Super administrador" : "Administrador"}
              </span>
            </div>
          )}
        </Link>
        {state === "expanded" && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar seccion..."
              aria-label="Buscar seccion"
              className="h-9 pl-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-sky-400"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 overflow-y-auto">
        {visibleGroups.map((group) => {
          const open = openGroups[group.id] ?? true
          const groupActive = group.items.some((i) => isActive(i.href))

          if (state === "collapsed") {
            return (
              <SidebarGroup key={group.id}>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href)
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                            <Link
                              href={item.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "flex items-center justify-center rounded-lg h-10 w-10 mx-auto",
                                active ? "bg-sky-50 text-sky-600" : "text-slate-600 hover:bg-slate-50",
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          }

          return (
            <SidebarGroup key={group.id} className="mb-1">
              <SidebarGroupLabel asChild>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={open}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors",
                    group.superAdminOnly
                      ? "text-amber-700 hover:bg-amber-50"
                      : "text-slate-500 hover:bg-slate-50",
                    groupActive && "text-sky-600",
                  )}
                >
                  <group.icon className={cn("h-3.5 w-3.5", group.superAdminOnly && "text-amber-600")} />
                  <span className="flex-1 text-left truncate">{group.label}</span>
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                </button>
              </SidebarGroupLabel>

              {open && (
                <SidebarGroupContent className="mt-0.5">
                  <SidebarMenu className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href)
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={active}>
                            <Link
                              href={item.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 min-h-[40px] transition-colors",
                                active
                                  ? "bg-sky-50 text-sky-700 font-semibold"
                                  : "text-slate-700 hover:bg-slate-50",
                              )}
                            >
                              <item.icon
                                className={cn(
                                  "h-4 w-4 flex-shrink-0",
                                  active ? "text-sky-600" : "text-slate-400",
                                )}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm truncate leading-tight">{item.title}</span>
                                {item.description && (
                                  <span
                                    className={cn(
                                      "text-[10px] leading-tight truncate",
                                      active ? "text-sky-600" : "text-slate-400",
                                    )}
                                  >
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          )
        })}
        {visibleGroups.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            Sin resultados para <strong>{query}</strong>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-2 safe-bottom">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={state === "collapsed" ? "Ir al sitio" : undefined}>
              <Link
                href="/"
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-slate-600 transition-all hover:bg-slate-50"
              >
                <Home className="h-4 w-4 text-slate-400 flex-shrink-0" />
                {state === "expanded" && <span className="text-sm font-medium">Ir al sitio</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
