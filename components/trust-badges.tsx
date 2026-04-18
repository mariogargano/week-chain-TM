"use client"

import { Shield, Lock, CheckCircle2, Award, FileCheck } from "lucide-react"

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Protección Bancaria", // Changed from "Escrow Contable" to "Protección Bancaria"
      description: "Cuentas dedicadas", // Changed from "Fondos protegidos" to "Cuentas dedicadas"
      color: "#FF9AA2",
    },
    {
      icon: Lock,
      title: "Certificados NOM-151",
      description: "Validez legal",
      color: "#B5EAD7",
    },
    {
      icon: CheckCircle2,
      title: "KYC Verificado",
      description: "Usuarios validados",
      color: "#C7CEEA",
    },
    {
      icon: Award,
      title: "Propiedades Verificadas",
      description: "Due diligence completo",
      color: "#FFB7B2",
    },
    {
      icon: FileCheck,
      title: "Contratos Legales",
      description: "Respaldo jurídico",
      color: "#FFDAC1",
    },
  ]

  return (
    <section className="bg-white py-8 px-4 border-b border-slate-100">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${badge.color}20` }}
              >
                <badge.icon className="h-5 w-5" style={{ color: badge.color }} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{badge.title}</p>
                <p className="text-xs text-slate-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
