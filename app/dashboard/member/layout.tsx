"use client"

import type React from "react"

import { createBrowserClient } from "@supabase/ssr"
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar izquierdo - Navegación */}
      <Suspense fallback={null}>
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1d29] text-white transition-transform duration-300 ease-in-out lg:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="text-2xl font-bold">WEEK-CHAIN</div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
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
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-cyan-600 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-red-600/20 hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>
      </Suspense>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-gray-100 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center gap-4 lg:ml-0">
            <div className="relative hidden w-full max-w-md lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Buscar..." className="pl-10" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Sidebar derecho - Social Share */}
      <Suspense fallback={null}>
        <SocialShareSidebar />
      </Suspense>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
