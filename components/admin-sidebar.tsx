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
  FileText,
  TrendingUp,
  Settings,
  Calendar,
  Bell,
  BarChart3,
  LogOut,
  Ticket,
  CreditCard,
  UserCheck,
  ShoppingBag,
  Wrench,
  FolderOpen,
  Mail,
  Send,
  MessageSquare,
  Shield,
  Activity,
  Globe,
  DollarSign,
  Scale,
  Wallet,
  Lock,
  Database,
  Webhook,
  Star,
  BookOpen,
  Calculator,
  MonitorDot,
  BadgeCheck,
  Briefcase,
  PlaneTakeoff,
  HousePlus,
  Coins,
  ArrowLeftRight,
  RefreshCcw,
  ClipboardCheck,
  Inbox,
  Landmark,
  PiggyBank,
  MapPin,
  Package,
  UsersRound,
  FileSearch,
  Layers,
  ShieldAlert,
  QrCode,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileSignature,
  Percent,
  Receipt,
  CircleDollarSign,
  Building,
  UserCog,
  Eye,
  Handshake,
  GanttChart,
  Target,
  Megaphone,
  TrendingDown,
  Gauge,
  ServerCog,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigationItems = [
  // 1. RBAC - Identity, Roles and Permissions
  {
    title: "1. Identidad y RBAC",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
      { title: "Usuarios Internos", icon: UsersRound, href: "/dashboard/admin/team" },
      { title: "WEEK-AGENTS", icon: Briefcase, href: "/dashboard/admin/broker-network" },
      { title: "Owners / Partners", icon: Building, href: "/dashboard/admin/property-approvals" },
      { title: "Holders (KYC)", icon: BadgeCheck, href: "/dashboard/admin/kyc" },
      { title: "Matriz de Permisos", icon: Shield, href: "/dashboard/admin/security" },
      { title: "Bitacora de Accesos", icon: FileSearch, href: "/dashboard/admin/audit-logs" },
    ],
  },
  // 2. Product Governance (SVC)
  {
    title: "2. Producto SVC",
    items: [
      { title: "Configurador SVC", icon: Settings, href: "/dashboard/admin/certificates" },
      { title: "Motor Capacidad (48+4)", icon: Activity, href: "/dashboard/admin/supply" },
      { title: "Blackouts y Politicas", icon: Clock, href: "/dashboard/admin/capacity-risk" },
      { title: "Upgrades/Downgrades", icon: ArrowLeftRight, href: "/dashboard/admin/pricing-calculator" },
      { title: "Ciclo de Vida Cert", icon: RefreshCcw, href: "/dashboard/admin/week-balance" },
      { title: "Inventario Certificados", icon: Layers, href: "/dashboard/admin/weeks" },
    ],
  },
  // 3. Properties + SPV
  {
    title: "3. Propiedades + SPV",
    items: [
      { title: "Propiedades", icon: Building2, href: "/dashboard/admin/properties" },
      { title: "Destinos", icon: MapPin, href: "/dashboard/admin/destinations" },
      { title: "Aprobar Propiedades", icon: ClipboardCheck, href: "/dashboard/admin/approvals" },
      { title: "Nueva Propiedad", icon: HousePlus, href: "/dashboard/admin/properties/new" },
      { title: "Semanas por Propiedad", icon: Calendar, href: "/dashboard/admin/bookings" },
      { title: "Proveedores / SLAs", icon: Package, href: "/dashboard/admin/providers" },
      { title: "Indicadores por SPV", icon: BarChart3, href: "/dashboard/admin/analytics" },
    ],
  },
  // 4. REQUEST → OFFER → CONFIRM
  {
    title: "4. REQUEST→OFFER→CONFIRM",
    items: [
      { title: "Bandeja Requests (SLA)", icon: Inbox, href: "/dashboard/admin/reservations" },
      { title: "Generar Ofertas", icon: Send, href: "/dashboard/admin/reservations?tab=offer" },
      { title: "Confirmaciones", icon: CheckCircle, href: "/dashboard/admin/reservations?tab=confirmed" },
      { title: "Rentas Activas", icon: PlaneTakeoff, href: "/dashboard/admin/rentals" },
      { title: "Cambios/Cancelaciones", icon: RefreshCcw, href: "/dashboard/admin/reservations?tab=changes" },
      { title: "Plantillas Operativas", icon: FileText, href: "/dashboard/admin/email-templates" },
    ],
  },
  // 5. Payments, Escrow, Payouts (Stripe)
  {
    title: "5. Cobranza y Escrow",
    items: [
      { title: "Links de Pago", icon: CreditCard, href: "/dashboard/admin/payments" },
      { title: "Estado Pagos (Hold)", icon: PiggyBank, href: "/dashboard/admin/escrow-contable" },
      { title: "Liberacion y Payouts", icon: CircleDollarSign, href: "/dashboard/admin/transactions" },
      { title: "Conciliacion Stripe", icon: ArrowLeftRight, href: "/dashboard/admin/wallets" },
      { title: "Chargebacks/Disputas", icon: AlertTriangle, href: "/dashboard/admin/payments?tab=disputes" },
      { title: "Facturacion", icon: Receipt, href: "/dashboard/admin/vouchers" },
    ],
  },
  // 6. Margins and Splits
  {
    title: "6. Margenes y Splits",
    items: [
      { title: "Config Splits (4%)", icon: Percent, href: "/dashboard/admin/broker-network?tab=config" },
      { title: "Calculo por Transaccion", icon: Calculator, href: "/dashboard/admin/pricing-calculator" },
      { title: "Simulador Rentabilidad", icon: TrendingUp, href: "/dashboard/admin/exit-strategy" },
      { title: "Alertas de Margen", icon: TrendingDown, href: "/dashboard/admin/capacity-risk?tab=margins" },
      { title: "Comisiones Agentes", icon: DollarSign, href: "/dashboard/admin/broker-network?tab=commissions" },
      { title: "Reservas Notariales", icon: Landmark, href: "/dashboard/admin/escrow" },
    ],
  },
  // 7. Legal Compliance
  {
    title: "7. Compliance Legal",
    items: [
      { title: "Contratos / Versiones", icon: FileSignature, href: "/dashboard/admin/legalario" },
      { title: "Aceptacion T&Cs", icon: FileText, href: "/dashboard/admin/certifications" },
      { title: "NOM-151 / Sellado", icon: QrCode, href: "/dashboard/admin/legalario?tab=nom151" },
      { title: "KYC/KYB Estados", icon: UserCheck, href: "/dashboard/admin/kyc" },
      { title: "AML / Monitoreo", icon: ShieldAlert, href: "/dashboard/admin/compliance" },
      { title: "Centro Auditoria", icon: Eye, href: "/dashboard/admin/audit-logs" },
    ],
  },
  // 8. Cryptographic Integrity
  {
    title: "8. Integridad Cripto",
    items: [
      { title: "Generador Hash+QR", icon: QrCode, href: "/dashboard/admin/certificates?tab=hash" },
      { title: "Verificador Interno", icon: CheckCircle, href: "/dashboard/admin/certificates?tab=verify" },
      { title: "Registro de Eventos", icon: Activity, href: "/dashboard/admin/audit-logs?tab=crypto" },
      { title: "Incidencias QR", icon: AlertTriangle, href: "/dashboard/admin/system-diagnostics" },
    ],
  },
  // 9. Service Operations (WEEK-SERVICE)
  {
    title: "9. Operacion Servicio",
    items: [
      { title: "Checklists Pre/Post", icon: ClipboardCheck, href: "/dashboard/admin/services" },
      { title: "Proveedores + SLAs", icon: Handshake, href: "/dashboard/admin/providers" },
      { title: "Tickets/Incidencias", icon: MessageSquare, href: "/dashboard/admin/contact-inbox" },
      { title: "NPS y Resenas", icon: Star, href: "/dashboard/admin/testimonials" },
      { title: "Compensaciones", icon: Coins, href: "/dashboard/admin/vouchers?tab=credits" },
    ],
  },
  // 10. CRM and Go-to-Market
  {
    title: "10. CRM y Marketing",
    items: [
      { title: "Embudo de Leads", icon: Target, href: "/dashboard/admin/marketing" },
      { title: "Campanas y Tiers", icon: Megaphone, href: "/dashboard/admin/presale" },
      { title: "Asignacion Agentes", icon: UserCog, href: "/dashboard/admin/broker-network?tab=assign" },
      { title: "Lead → Holder", icon: TrendingUp, href: "/dashboard/admin/users" },
      { title: "KPIs Comerciales", icon: BarChart3, href: "/dashboard/admin/reports" },
    ],
  },
  // 11. Executive Reporting and KPIs
  {
    title: "11. Reportes y KPIs",
    items: [
      { title: "SLA Dashboard", icon: Gauge, href: "/dashboard/admin/real-time-monitor" },
      { title: "Ocupacion", icon: Calendar, href: "/dashboard/admin/bookings?tab=occupancy" },
      { title: "Ingresos por SPV", icon: DollarSign, href: "/dashboard/admin/analytics?tab=revenue" },
      { title: "Riesgo Global", icon: ShieldAlert, href: "/dashboard/admin/capacity-risk" },
      { title: "Calidad (NPS)", icon: Star, href: "/dashboard/admin/testimonials?tab=nps" },
      { title: "Forecast", icon: TrendingUp, href: "/dashboard/admin/reports?tab=forecast" },
    ],
  },
  // 12. Data Administration (Backoffice)
  {
    title: "12. Admin Datos",
    items: [
      { title: "Master Data", icon: Database, href: "/dashboard/admin/database" },
      { title: "Import/Export CSV", icon: ArrowLeftRight, href: "/dashboard/admin/database?tab=import" },
      { title: "Deduplicacion", icon: Layers, href: "/dashboard/admin/database?tab=dedup" },
      { title: "Correccion Auditada", icon: Wrench, href: "/dashboard/admin/database?tab=edit" },
      { title: "Respaldos", icon: ServerCog, href: "/dashboard/admin/database?tab=backup" },
    ],
  },
  // 13. Alerts and Automations
  {
    title: "13. Alertas y Automatismos",
    items: [
      { title: "Alertas SLA", icon: Clock, href: "/dashboard/admin/notifications?tab=sla" },
      { title: "Alertas Overbooking", icon: AlertTriangle, href: "/dashboard/admin/notifications?tab=booking" },
      { title: "Alertas Margen", icon: TrendingDown, href: "/dashboard/admin/notifications?tab=margin" },
      { title: "Alertas KYC/KYB", icon: UserCheck, href: "/dashboard/admin/notifications?tab=kyc" },
      { title: "Alertas Disputas", icon: ShieldAlert, href: "/dashboard/admin/notifications?tab=disputes" },
      { title: "Email Automation", icon: Mail, href: "/dashboard/admin/email-automation" },
    ],
  },
  // 14. System Configuration
  {
    title: "14. Sistema",
    items: [
      { title: "Webhooks", icon: Webhook, href: "/dashboard/admin/webhooks" },
      { title: "Sync OTA", icon: RefreshCcw, href: "/dashboard/admin/ota-sync" },
      { title: "VA-FI Tokenizacion", icon: Coins, href: "/dashboard/admin/vafi" },
      { title: "DAO Governance", icon: Landmark, href: "/dashboard/admin/dao" },
      { title: "Diagnosticos", icon: Wrench, href: "/dashboard/admin/system-diagnostics" },
      { title: "Configuracion", icon: Settings, href: "/dashboard/admin/settings" },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r border-sky-500/20 bg-gradient-to-b from-sky-500/[0.06] to-blue-600/[0.03] backdrop-blur-xl">
      <SidebarHeader className="border-b border-sky-500/15 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-[0_4px_16px_rgba(14,165,233,0.3)]">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 tracking-wide">WEEK-WORLD</span>
              <span className="text-[10px] font-medium text-sky-600">Control Center</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 overflow-y-auto">
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title} className="pb-1">
            <SidebarGroupLabel className="text-[9px] font-bold uppercase text-slate-400 tracking-widest px-3 mb-0.5">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const baseHref = item.href.split("?")[0]
                  const isActive = pathname === baseHref || (baseHref !== "/dashboard/admin" && pathname.startsWith(baseHref + "/"))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 min-h-[32px] transition-all duration-200 text-xs",
                            isActive
                              ? "bg-gradient-to-r from-sky-500/15 to-blue-600/10 text-sky-700 font-semibold border border-sky-500/25 shadow-[0_2px_8px_rgba(14,165,233,0.1)]"
                              : "text-slate-600 hover:bg-sky-500/[0.06] hover:text-sky-700",
                          )}
                        >
                          <item.icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-sky-600" : "text-slate-400")} />
                          {state === "expanded" && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sky-500/15 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={state === "collapsed" ? "Salir" : undefined}>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 min-h-[32px] text-red-600 transition-all duration-150 hover:bg-red-50 font-medium text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                {state === "expanded" && <span>Salir al Sitio</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
