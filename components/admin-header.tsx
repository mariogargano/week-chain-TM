"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Settings, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AdminHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState("Admin")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase?.auth?.getUser()
        if (user) {
          const email = user?.email || ""
          setUserEmail(email)
          const { data: userData } = await supabase?.from("users")?.select("full_name")?.eq("id", user?.id)?.maybeSingle()
          if (userData?.full_name) {
            setUserName(userData?.full_name)
          } else {
            setUserName(email?.split("@")?.[0] || "Admin")
          }
        }
      } catch {
        // Fallback silently
      }
    }
    loadUserData()
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase?.auth?.signOut()
    } catch {
      // Sign out failed silently
    }
    router?.push("/auth")
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-3">
      <SidebarTrigger className="min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-100" />
      {/* Logo on mobile only */}
      <div className="flex items-center gap-2 sm:hidden">
        <div className="h-7 w-7 rounded-lg bg-sky-500 flex items-center justify-center">
          <span className="text-white font-bold text-xs">WW</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">WEEK-WORLD</span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-1">
        {/* Search - hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="h-9 w-48 lg:w-64 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100 focus:bg-white placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <Link href="/dashboard/admin/notifications">
          <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>
        </Link>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 min-h-[44px] rounded-lg hover:bg-slate-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/admin-avatar.png" />
                <AvatarFallback className="bg-sky-100 text-sky-700 text-sm font-semibold">
                  {userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium text-slate-900">{userName}</span>
                <span className="text-[11px] text-slate-500 truncate max-w-28">
                  {userEmail || "Admin"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router?.push("/dashboard/admin/profile")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router?.push("/dashboard/admin/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configuracion
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
