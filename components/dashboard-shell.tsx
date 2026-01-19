"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  header?: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

/**
 * Fixed Viewport Dashboard Shell
 * Ensures no page scroll, only internal content scrolling.
 */
export function DashboardShell({ children, header, sidebar, className }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/50">
      {/* Sidebar */}
      {sidebar && (
        <div className="hidden border-r bg-white lg:block lg:w-64 xl:w-72">
          {sidebar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Fixed Header */}
        {header && (
          <header className="flex-shrink-0 border-b bg-white">
            {header}
          </header>
        )}

        {/* Scrollable Content */}
        <main className={cn("flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
