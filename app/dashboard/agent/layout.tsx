import type { ReactNode } from "react"

export default function AgentDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</div>
    </div>
  )
}
