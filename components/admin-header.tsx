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
import { Bell, Search, Settings, User, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AdminHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState("Admin")
  const [userWallet, setUserWallet] = useState("")

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()

      // Get wallet from localStorage
      const wallet = localStorage.getItem("walletAddress")
      if (wallet) {
        setUserWallet(wallet)

        // Get user data from database
        const { data } = await supabase.from("admin_wallets").select("name").eq("wallet_address", wallet).single()

        if (data?.name) {
          setUserName(data.name)
        }
      }
    }

    loadUserData()
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error("[v0] Error signing out from Supabase:", error)
    }

    localStorage.removeItem("walletAddress")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-slate-200 bg-background px-3 sm:px-6">
      <SidebarTrigger className="min-h-[44px] min-w-[44px]" />

      <div className="flex flex-1 items-center justify-between min-w-0">
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar..."
              className="h-9 w-48 lg:w-64 rounded-lg border border-border bg-secondary pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-2 min-h-[44px]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/admin-avatar.png" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {userWallet ? `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}` : "Admin"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/admin/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/admin/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
