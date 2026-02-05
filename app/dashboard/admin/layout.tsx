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
        <div className="fixed inset-0 flex overflow-hidden">
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-auto bg-slate-50/50">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </RoleGuard>
  )
}
