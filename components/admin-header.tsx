"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Settings, User, LogOut, ShieldCheck, AlertTriangle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { CommandPalette } from "@/components/admin/command-palette"

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

export function AdminHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState("Admin")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("")

  const { data: alertsData } = useSWR<{ totalUrgent: number; totalPending: number }>(
    "/api/admin/alerts-summary",
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true },
  )

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const email = user.email || ""
          setUserEmail(email)
          const { data: userData } = await supabase
            .from("users")
            .select("full_name, role")
            .eq("id", user.id)
            .maybeSingle()
          if (userData?.full_name) setUserName(userData.full_name)
          else setUserName(email.split("@")[0] || "Admin")
          if (userData?.role) setUserRole(userData.role)
        }
      } catch {
        // silent
      }
    }
    loadUserData()
  }, [])

  const isSuperAdmin = useMemo(() => {
    const envEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase()
    const email = userEmail.toLowerCase()
    return userRole === "super_admin" || (envEmail !== "" && email === envEmail)
  }, [userEmail, userRole])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // silent
    }
    router.push("/auth")
  }

  const urgentCount = alertsData?.totalUrgent ?? 0
  const pendingCount = alertsData?.totalPending ?? 0
  const totalBadge = urgentCount + pendingCount

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-3">
      <SidebarTrigger className="min-h-[40px] min-w-[40px] rounded-lg hover:bg-slate-100" />

      <div className="flex items-center gap-2 sm:hidden">
        <div className="h-7 w-7 rounded-lg bg-sky-500 flex items-center justify-center">
          <span className="text-white font-bold text-xs">W</span>
        </div>
        <span className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">
          {isSuperAdmin ? "Super admin" : "Admin"}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5">
        <CommandPalette isSuperAdmin={isSuperAdmin} />

        {/* Alerts button with badge */}
        <Link href="/dashboard/admin/alerts">
          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-[40px] min-w-[40px] rounded-lg hover:bg-slate-100"
            aria-label={`Alertas: ${totalBadge} pendientes`}
          >
            {urgentCount > 0 ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Bell className="h-5 w-5 text-slate-600" />
            )}
            {totalBadge > 0 && (
              <span
                className={`absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                  urgentCount > 0 ? "bg-red-500 animate-pulse" : "bg-amber-500"
                }`}
              >
                {totalBadge > 99 ? "99+" : totalBadge}
              </span>
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 min-h-[40px] rounded-lg hover:bg-slate-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/admin-avatar.png" />
                <AvatarFallback className="bg-sky-100 text-sky-700 text-sm font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                  {userName}
                  {isSuperAdmin && <ShieldCheck className="h-3 w-3 text-amber-500" aria-label="Super admin" />}
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-28">
                  {userEmail || "Admin"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  {userName}
                  {isSuperAdmin && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                      SUPER
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/admin/profile")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            {isSuperAdmin && (
              <DropdownMenuItem onClick={() => router.push("/dashboard/admin/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuracion
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
