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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "General",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/admin" },
      { title: "Analytics", icon: BarChart3, href: "/dashboard/admin/analytics" },
      { title: "Monitor en Tiempo Real", icon: MonitorDot, href: "/dashboard/admin/real-time-monitor" },
      { title: "Reportes", icon: TrendingUp, href: "/dashboard/admin/reports" },
    ],
  },
  {
    title: "Usuarios y Roles",
    items: [
      { title: "Usuarios", icon: Users, href: "/dashboard/admin/users" },
      { title: "Equipo Interno", icon: UsersRound, href: "/dashboard/admin/team" },
      { title: "KYC / Verificacion", icon: BadgeCheck, href: "/dashboard/admin/kyc" },
      { title: "Red de Brokers", icon: Briefcase, href: "/dashboard/admin/approvals" },
    ],
  },
  {
    title: "Propiedades y Destinos",
    items: [
      { title: "Propiedades", icon: Building2, href: "/dashboard/admin/properties" },
      { title: "Destinos", icon: MapPin, href: "/dashboard/admin/destinations" },
      { title: "Aprobar Propiedades", icon: ClipboardCheck, href: "/dashboard/admin/property-approvals" },
      { title: "Nueva Propiedad", icon: HousePlus, href: "/dashboard/admin/properties/new" },
      { title: "Proveedores", icon: Package, href: "/dashboard/admin/providers" },
    ],
  },
  {
    title: "Certificados y WEEKS",
    items: [
      { title: "WEEK Certificates", icon: Ticket, href: "/dashboard/admin/certificates" },
      { title: "Vouchers", icon: FileText, href: "/dashboard/admin/vouchers" },
      { title: "WEEK Balance", icon: Coins, href: "/dashboard/admin/week-balance" },
      { title: "Weeks Disponibles", icon: Layers, href: "/dashboard/admin/weeks" },
      { title: "Preventa", icon: Star, href: "/dashboard/admin/presale" },
      { title: "Supply / Capacidad", icon: Activity, href: "/dashboard/admin/supply" },
      { title: "Riesgo Capacidad", icon: ShieldAlert, href: "/dashboard/admin/capacity-risk" },
      { title: "Calculadora Pricing", icon: Calculator, href: "/dashboard/admin/pricing-calculator" },
    ],
  },
  {
    title: "Reservas y Rentas",
    items: [
      { title: "Reservaciones", icon: Calendar, href: "/dashboard/admin/reservations" },
      { title: "Bookings", icon: BookOpen, href: "/dashboard/admin/bookings" },
      { title: "Rentas Activas", icon: PlaneTakeoff, href: "/dashboard/admin/rentals" },
      { title: "Sync OTA", icon: RefreshCcw, href: "/dashboard/admin/ota-sync" },
      { title: "Servicios", icon: ShoppingBag, href: "/dashboard/admin/services" },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { title: "Pagos y Cobros", icon: CreditCard, href: "/dashboard/admin/payments" },
      { title: "Transacciones", icon: ArrowLeftRight, href: "/dashboard/admin/transactions" },
      { title: "Escrow Contable", icon: PiggyBank, href: "/dashboard/admin/escrow-contable" },
      { title: "Escrow Blockchain", icon: Lock, href: "/dashboard/admin/escrow" },
      { title: "Wallets", icon: Wallet, href: "/dashboard/admin/wallets" },
      { title: "VA-FI Tokenizacion", icon: Coins, href: "/dashboard/admin/vafi" },
      { title: "Exit Strategy", icon: DollarSign, href: "/dashboard/admin/exit-strategy" },
    ],
  },
  {
    title: "Legal y Compliance",
    items: [
      { title: "Legalario / Firmas", icon: Scale, href: "/dashboard/admin/legalario" },
      { title: "Documentos", icon: FolderOpen, href: "/dashboard/admin/certifications" },
      { title: "Compliance", icon: Shield, href: "/dashboard/admin/compliance" },
      { title: "Audit Logs", icon: FileSearch, href: "/dashboard/admin/audit-logs" },
      { title: "DAO Governance", icon: Landmark, href: "/dashboard/admin/dao" },
    ],
  },
  {
    title: "Marketing y CRM",
    items: [
      { title: "Marketing", icon: Globe, href: "/dashboard/admin/marketing" },
      { title: "Testimonios", icon: Star, href: "/dashboard/admin/testimonials" },
      { title: "Contacto Inbox", icon: Inbox, href: "/dashboard/admin/contact-inbox" },
    ],
  },
  {
    title: "Email Automation",
    items: [
      { title: "Automatizacion", icon: Mail, href: "/dashboard/admin/email-automation" },
      { title: "Templates", icon: MessageSquare, href: "/dashboard/admin/email-templates" },
      { title: "Email Logs", icon: Send, href: "/dashboard/admin/email-logs" },
      { title: "Test Email", icon: Send, href: "/dashboard/admin/email-test" },
      { title: "Test Flow", icon: RefreshCcw, href: "/dashboard/admin/email-test-flow" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { title: "Notificaciones", icon: Bell, href: "/dashboard/admin/notifications" },
      { title: "Seguridad", icon: Lock, href: "/dashboard/admin/security" },
      { title: "Diagnosticos", icon: Wrench, href: "/dashboard/admin/system-diagnostics" },
      { title: "Base de Datos", icon: Database, href: "/dashboard/admin/database" },
      { title: "Webhooks", icon: Webhook, href: "/dashboard/admin/webhooks" },
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
              <span className="text-[10px] font-medium text-sky-600">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 overflow-y-auto">
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title} className="pb-1">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-3 mb-0.5">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href + "/"))
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
                            "flex items-center gap-2.5 rounded-xl px-3 py-2 min-h-[38px] transition-all duration-200 text-sm",
                            isActive
                              ? "bg-gradient-to-r from-sky-500/15 to-blue-600/10 text-sky-700 font-semibold border border-sky-500/25 shadow-[0_2px_8px_rgba(14,165,233,0.1)]"
                              : "text-slate-600 hover:bg-sky-500/[0.06] hover:text-sky-700",
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-sky-600" : "text-slate-400")} />
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
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 min-h-[38px] text-red-600 transition-all duration-150 hover:bg-red-50 font-medium text-sm"
              >
                <LogOut className="h-4 w-4" />
                {state === "expanded" && <span>Salir al Sitio</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
