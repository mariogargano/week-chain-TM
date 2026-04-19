import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
  theme?: "light" | "dark"
  headerContent?: ReactNode
  sidebarContent?: ReactNode
}

export function DashboardLayout({ children, theme = "light", headerContent, sidebarContent }: DashboardLayoutProps) {
  const isDark = theme === "dark"

  return (
    <div
      className={cn(
        "min-h-screen",
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 to-slate-100",
      )}
    >
      {headerContent && (
        <div className="border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">{headerContent}</div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {sidebarContent ? (
          <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-1">{sidebarContent}</div>
            <div className="lg:col-span-3">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  avatar?: string
  userName?: string
  theme?: "light" | "dark"
  actions?: ReactNode
}

export function DashboardHeader({ title, subtitle, avatar, userName, theme = "light", actions }: DashboardHeaderProps) {
  const isDark = theme === "dark"

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {avatar && (
          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden ring-2 ring-white/20 bg-gradient-to-br from-blue-500 to-purple-500">
            {avatar.startsWith("http") ? (
              <img src={avatar || "/placeholder.svg"} alt={userName || "avatar"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-base sm:text-xl font-bold">
                {avatar}
              </div>
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className={cn("text-xl sm:text-2xl md:text-3xl font-bold truncate", isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn("text-xs sm:text-sm line-clamp-2", isDark ? "text-slate-400" : "text-slate-600")}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

interface DashboardStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  theme?: "light" | "dark"
}

export function DashboardStatCard({ title, value, subtitle, icon, trend, theme = "light" }: DashboardStatCardProps) {
  const isDark = theme === "dark"

  return (
    <Card
      className={cn(
        "p-4 sm:p-6",
        isDark ? "bg-white/5 backdrop-blur-sm border-white/10" : "bg-white/80 backdrop-blur border-0 shadow-lg",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        {icon && <div className={cn("p-2 rounded-lg shrink-0", isDark ? "bg-white/10" : "bg-slate-100")}>{icon}</div>}
        {trend && (
          <span className={cn("text-xs flex items-center gap-1 shrink-0", trend.positive ? "text-green-500" : "text-red-500")}>
            {trend.value}
          </span>
        )}
      </div>
      <p className={cn("text-2xl sm:text-3xl font-bold mb-1 truncate", isDark ? "text-white" : "text-slate-900")}>
        {value}
      </p>
      <p className={cn("text-xs sm:text-sm", isDark ? "text-slate-400" : "text-slate-600")}>{title}</p>
      {subtitle && <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-500")}>{subtitle}</p>}
    </Card>
  )
}

interface DashboardCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  theme?: "light" | "dark"
  className?: string
}

export function DashboardCard({ title, subtitle, children, theme = "light", className }: DashboardCardProps) {
  const isDark = theme === "dark"

  return (
    <Card
      className={cn(
        "p-4 sm:p-6",
        isDark ? "bg-white/5 backdrop-blur-sm border-white/10" : "bg-white/80 backdrop-blur border-0 shadow-lg",
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className={cn("text-base sm:text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>{title}</h3>}
          {subtitle && <p className={cn("text-xs sm:text-sm mt-1", isDark ? "text-slate-400" : "text-slate-600")}>{subtitle}</p>}
        </div>
      )}
      {children}
    </Card>
  )
}
