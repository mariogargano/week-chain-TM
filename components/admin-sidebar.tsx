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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "General",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/admin",
        description: "Panel principal",
      },
      {
        title: "Analytics",
        icon: BarChart3,
        href: "/dashboard/admin/analytics",
        description: "Métricas y estadísticas",
      },
    ],
  },
  {
    title: "Gestión",
    items: [
      {
        title: "Usuarios",
        icon: Users,
        href: "/dashboard/admin/users",
        description: "Cuentas y roles",
      },
      {
        title: "Propiedades",
        icon: Building2,
        href: "/dashboard/admin/properties",
        description: "Listado de propiedades",
      },
      {
        title: "Vouchers",
        icon: Ticket,
        href: "/dashboard/admin/vouchers",
        description: "Certificados de compra",
      },
      {
        title: "Brokers",
        icon: UserCheck,
        href: "/dashboard/admin/users?role=broker",
        description: "Red de afiliados",
      },
      {
        title: "Documentos",
        icon: FolderOpen,
        href: "/dashboard/admin/certifications",
        description: "Contratos y certificados",
      },
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        title: "Pagos",
        icon: CreditCard,
        href: "/dashboard/admin/payments",
        description: "Transacciones Conekta",
      },
      {
        title: "KYC",
        icon: FileText,
        href: "/dashboard/admin/kyc",
        description: "Verificación de identidad",
      },
      {
        title: "Reservas",
        icon: Calendar,
        href: "/dashboard/admin/bookings",
        description: "Reservaciones",
      },
      {
        title: "Servicios",
        icon: ShoppingBag,
        href: "/dashboard/admin/services",
        description: "Marketplace de servicios",
      },
    ],
  },
  {
    title: "Email Automation",
    items: [
      {
        title: "Templates",
        icon: Mail,
        href: "/dashboard/admin/email-templates",
        description: "Gestión de plantillas",
      },
      {
        title: "Email Logs",
        icon: MessageSquare,
        href: "/dashboard/admin/email-logs",
        description: "Historial y métricas",
      },
      {
        title: "Test Email",
        icon: Send,
        href: "/dashboard/admin/email-test",
        description: "Pruebas de envío",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Notificaciones",
        icon: Bell,
        href: "/dashboard/admin/notifications",
        description: "Alertas del sistema",
      },
      {
        title: "Reportes",
        icon: TrendingUp,
        href: "/dashboard/admin/reports",
        description: "Generar informes",
      },
      {
        title: "Diagnósticos",
        icon: Wrench,
        href: "/dashboard/admin/system-diagnostics",
        description: "Estado del sistema",
      },
      {
        title: "Configuración",
        icon: Settings,
        href: "/dashboard/admin/settings",
        description: "Ajustes generales",
      },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r border-blue-100 bg-white">
      <SidebarHeader className="border-b border-blue-100 p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">WEEK-CHAIN</span>
              <span className="text-xs font-medium text-blue-100">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 bg-white">
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase text-blue-600 tracking-wider px-3 mb-1">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
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
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md"
                              : "text-slate-700 hover:bg-blue-50 hover:text-blue-700",
                          )}
                        >
                          <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-blue-500")} />
                          {state === "expanded" && (
                            <div className="flex flex-col">
                              <span className="text-sm">{item.title}</span>
                              {item.description && (
                                <span
                                  className={cn(
                                    "text-[10px] font-normal",
                                    isActive ? "text-blue-100" : "text-slate-500",
                                  )}
                                >
                                  {item.description}
                                </span>
                              )}
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
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-100 p-4 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={state === "collapsed" ? "Salir" : undefined}>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 transition-all duration-200 hover:bg-red-50 font-medium"
              >
                <LogOut className="h-5 w-5" />
                {state === "expanded" && <span>Salir</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
