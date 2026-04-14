"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Building2, Calendar, CreditCard, UserCheck, Briefcase, BarChart3, Settings, ChevronRight, Home, Bot,  } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Simplified navigation with descriptions - 6 main sections
const navigationItems = [
  {
    title: "Dashboard",
    description: "Vista general del ecosistema",
    icon: LayoutDashboard,
    href: "/dashboard/admin",
  },
  {
    title: "Usuarios y KYC",
    description: "Gestionar holders, verificacion de identidad",
    icon: Users,
    href: "/dashboard/admin/users",
    subItems: [
      { title: "Todos los Usuarios", href: "/dashboard/admin/users" },
      { title: "Verificacion KYC", href: "/dashboard/admin/kyc" },
      { title: "Pre-Holders", href: "/dashboard/admin/pre-holders" },
    ],
  },
  {
    title: "Reservaciones",
    description: "Solicitudes, ofertas y confirmaciones",
    icon: Calendar,
    href: "/dashboard/admin/reservations",
    subItems: [
      { title: "Todas las Reservas", href: "/dashboard/admin/reservations" },
      { title: "Pendientes (SLA)", href: "/dashboard/admin/reservations?tab=pending" },
      { title: "Confirmadas", href: "/dashboard/admin/reservations?tab=confirmed" },
      { title: "Rentas Activas", href: "/dashboard/admin/rentals" },
    ],
  },
  {
    title: "Pagos y Escrow",
    description: "Cobros, liberaciones y facturacion",
    icon: CreditCard,
    href: "/dashboard/admin/payments",
    subItems: [
      { title: "Estado de Pagos", href: "/dashboard/admin/payments" },
      { title: "Escrow Pendiente", href: "/dashboard/admin/escrow" },
      { title: "Transacciones", href: "/dashboard/admin/transactions" },
      { title: "Facturacion", href: "/dashboard/admin/vouchers" },
    ],
  },
  {
    title: "Propiedades",
    description: "Inventario, destinos y disponibilidad",
    icon: Building2,
    href: "/dashboard/admin/properties",
    subItems: [
      { title: "Todas las Propiedades", href: "/dashboard/admin/properties" },
      { title: "Destinos", href: "/dashboard/admin/destinations" },
      { title: "Aprobaciones", href: "/dashboard/admin/approvals" },
      { title: "Disponibilidad", href: "/dashboard/admin/bookings" },
    ],
  },
  {
    title: "WEEK-AGENTS",
    description: "Red de agentes, comision fija 4%",
    icon: Briefcase,
    href: "/dashboard/admin/broker-network",
    subItems: [
      { title: "Todos los Agentes", href: "/dashboard/admin/broker-network" },
      { title: "Comisiones (4%)", href: "/dashboard/admin/broker-network?tab=commissions" },
      { title: "Solicitudes", href: "/dashboard/admin/broker-network?tab=pending" },
    ],
  },
  {
    title: "Certificados",
    description: "Productos SVC, precios, capacidad",
    icon: UserCheck,
    href: "/dashboard/admin/certificates",
    subItems: [
      { title: "Configurador SVC", href: "/dashboard/admin/certificates" },
      { title: "Motor 48+4", href: "/dashboard/admin/capacity-risk" },
      { title: "Ventas Activas", href: "/dashboard/admin/certificates?tab=active" },
    ],
  },
  {
    title: "Oficina Virtual",
    description: "Equipo de agentes IA especializados",
    icon: Bot,
    href: "/dashboard/admin/virtual-office",
    subItems: [
      { title: "Agentes en Vivo", href: "/dashboard/admin/virtual-office" },
      { title: "Conversaciones", href: "/dashboard/admin/virtual-office?tab=conversations" },
      { title: "Notificaciones", href: "/dashboard/admin/virtual-office?tab=notifications" },
      { title: "Escalaciones", href: "/dashboard/admin/virtual-office?tab=escalations" },
      { title: "Reportes", href: "/dashboard/admin/virtual-office?tab=reports" },
    ],
  },
  {
    title: "Reportes",
    description: "Analiticas, KPIs y metricas",
    icon: BarChart3,
    href: "/dashboard/admin/reports",
    subItems: [
      { title: "Dashboard KPIs", href: "/dashboard/admin/analytics" },
      { title: "Ingresos", href: "/dashboard/admin/reports?tab=revenue" },
      { title: "Ocupacion", href: "/dashboard/admin/bookings?tab=occupancy" },
    ],
  },
]

const secondaryItems = [
  {
    title: "Configuracion",
    description: "Sistema, integraciones y ajustes",
    icon: Settings,
    href: "/dashboard/admin/settings",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    setOpenMobile(false)
  }

  const isItemActive = (item: typeof navigationItems[0]) => {
    const baseHref = item.href.split("?")[0]
    if (pathname === baseHref) return true
    if (baseHref !== "/dashboard/admin" && pathname.startsWith(baseHref)) return true
    if (item.subItems) {
      return item.subItems.some((sub) => {
        const subBase = sub.href.split("?")[0]
        return pathname === subBase || pathname.startsWith(subBase + "/")
      })
    }
    return false
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-100 p-4">
        <Link href="/dashboard/admin" onClick={handleLinkClick} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900">WEEK-CHAIN</span>
              <span className="text-xs font-medium text-slate-500">Panel Admin</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = isItemActive(item)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-start gap-3 rounded-xl px-3 py-3 min-h-[56px] transition-all duration-200",
                          isActive
                            ? "bg-sky-50 border border-sky-200 shadow-sm"
                            : "hover:bg-slate-50 border border-transparent",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            isActive
                              ? "bg-sky-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                        {state === "expanded" && (
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "text-sm font-semibold truncate",
                                  isActive ? "text-sky-900" : "text-slate-800",
                                )}
                              >
                                {item.title}
                              </span>
                              {item.subItems && (
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    isActive ? "text-sky-500" : "text-slate-400",
                                  )}
                                />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-xs leading-tight mt-0.5",
                                isActive ? "text-sky-700" : "text-slate-500",
                              )}
                            >
                              {item.description}
                            </span>
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary items */}
        <SidebarGroup className="mt-4 pt-4 border-t border-slate-100">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryItems.map((item) => {
                const isActive = pathname.startsWith(item.href.split("?")[0])
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-start gap-3 rounded-xl px-3 py-3 min-h-[56px] transition-all duration-200",
                          isActive
                            ? "bg-slate-100 border border-slate-200" :"hover:bg-slate-50 border border-transparent",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            isActive
                              ? "bg-slate-600 text-white" :"bg-slate-100 text-slate-500",
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                        {state === "expanded" && (
                          <div className="flex flex-col flex-1 min-w-0">
                            <span
                              className={cn(
                                "text-sm font-semibold truncate",
                                isActive ? "text-slate-900" : "text-slate-800",
                              )}
                            >
                              {item.title}
                            </span>
                            <span className="text-xs text-slate-500 leading-tight mt-0.5">
                              {item.description}
                            </span>
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={state === "collapsed" ? "Ir al Sitio" : undefined}>
              <Link
                href="/"
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 transition-all duration-200 hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Home className="h-5 w-5 text-slate-500" />
                </div>
                {state === "expanded" && (
                  <span className="text-sm font-medium">Ir al Sitio</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
