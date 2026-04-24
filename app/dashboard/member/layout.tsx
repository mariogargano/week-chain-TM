"use client"

import type React from "react"

import { createBrowserClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, User, CreditCard, Users, Settings, LogOut, Menu, X, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { SocialShareSidebar } from "@/components/social-share-sidebar"
import { Suspense } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard/member", icon: LayoutDashboard },
  { name: "Mi Perfil", href: "/dashboard/member/profile", icon: User },
  { name: "Mis Semanas", href: "/dashboard/member/weeks", icon: CreditCard },
  { name: "Referidos", href: "/dashboard/member/referrals", icon: Users },
  { name: "Configuración", href: "/dashboard/member/settings", icon: Settings },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
      if (data) setProfile(data)
    }
  }

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-secondary/30">
      {/* Sidebar izquierdo - Navegación */}
      <Suspense fallback={null}>
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1d29] text-white transition-transform duration-300 ease-in-out lg:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="text-xl sm:text-2xl font-bold text-white">WEEK-CHAIN</div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-[0.95] transition-all"
                aria-label="Cerrar menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Profile */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-cyan-600">{profile?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">{profile?.full_name || "Usuario"}</p>
                  <p className="truncate text-xs text-gray-400">{profile?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3 sm:p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 min-h-[44px] text-sm font-medium transition-colors active:scale-[0.98] ${
                      isActive ? "bg-cyan-600 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 p-3 sm:p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 min-h-[44px] text-sm font-medium text-gray-300 transition-colors hover:bg-red-600/20 hover:text-red-400 active:scale-[0.98]"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                Cerrar Sesion
              </button>
            </div>
          </div>
        </aside>
      </Suspense>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b bg-background px-3 sm:px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary lg:hidden active:scale-[0.95] transition-all"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center gap-4 lg:ml-0">
            <p className="text-sm font-semibold text-foreground lg:hidden">WEEK-CHAIN</p>
            <div className="relative hidden w-full max-w-md lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-10" />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <div className="container mx-auto px-3 py-4 sm:p-4 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Sidebar derecho - Social Share */}
      <Suspense fallback={null}>
        <SocialShareSidebar />
      </Suspense>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
