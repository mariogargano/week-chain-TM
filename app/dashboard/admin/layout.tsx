"use client";
import type React from "react";
import { useEffect, useState } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { RoleGuard } from "@/components/role-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(true) // Default to mobile/collapsed

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-br from-slate-50 via-sky-50/20 to-white">
              <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RoleGuard>
  )
}
