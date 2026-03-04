"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { RoleGuard } from "@/components/role-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20">
              <div className="p-3 sm:p-4 lg:p-6">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RoleGuard>
  )
}
