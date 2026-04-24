"use client"

import Link from "next/link"
import { Mail, FileText, Zap, Send, ArrowUpRight, Inbox } from "lucide-react"
import { Card } from "@/components/ui/card"

const sections = [
  {
    title: "Templates",
    description: "Plantillas de email para transaccionales y marketing",
    icon: FileText,
    href: "/dashboard/admin/email-templates",
    color: "bg-sky-500",
  },
  {
    title: "Automation",
    description: "Flujos automaticos (bienvenida, recordatorios, post-estancia)",
    icon: Zap,
    href: "/dashboard/admin/email-automation",
    color: "bg-violet-500",
  },
  {
    title: "Logs de envio",
    description: "Historial completo con estado de entrega",
    icon: Send,
    href: "/dashboard/admin/email-logs",
    color: "bg-emerald-500",
  },
  {
    title: "Bandeja de contacto",
    description: "Mensajes entrantes desde el sitio publico",
    icon: Inbox,
    href: "/dashboard/admin/contact-inbox",
    color: "bg-amber-500",
  },
] as const

export default function EmailsCenterPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Centro de emails</h1>
            <p className="text-sm text-slate-500">Plantillas, automation, logs y bandeja de entrada consolidados</p>
          </div>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="p-5 border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer h-full group">
              <div className="flex items-start justify-between mb-3">
                <div className={`${s.color} h-12 w-12 rounded-xl flex items-center justify-center`}>
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-sky-500 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{s.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-4 border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500">
          <strong className="text-slate-700">Consejo:</strong> las secciones individuales se mantienen para acceso directo, pero desde aqui las encuentras agrupadas y con vista rapida unificada.
        </p>
      </Card>
    </div>
  )
}
