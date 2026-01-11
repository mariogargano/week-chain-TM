"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Award,
  Gift,
  TrendingUp,
  Shield,
  Sparkles,
  CheckCircle2,
  Star,
  Calendar,
  Percent,
  Key,
  Users,
} from "lucide-react"
import Link from "next/link"

const tiers = [
  {
    name: "Tier 1: Fundador",
    contribution: "$50K - $100K",
    equity: "0.25% - 0.5%",
    color: "from-blue-500 to-cyan-500",
    icon: "🥉",
    benefits: [
      { icon: Calendar, text: "1 semana gratis por año (temporada media)" },
      { icon: Key, text: "Acceso prioritario a nuevas propiedades" },
      { icon: Percent, text: "25% descuento en fees de marketplace" },
      { icon: Users, text: "Invitación a eventos exclusivos de propietarios" },
      { icon: TrendingUp, text: "Reportes trimestrales de la empresa" },
    ],
  },
  {
    name: "Tier 2: Socio",
    contribution: "$100K - $250K",
    equity: "0.5% - 1.25%",
    color: "from-purple-500 to-pink-500",
    icon: "🥈",
    benefits: [
      { icon: Calendar, text: "3 semanas gratis por año (2 alta, 1 media)" },
      { icon: Key, text: "Acceso prioritario + pre-reserva 48h antes" },
      { icon: Percent, text: "50% descuento en fees de marketplace" },
      { icon: TrendingUp, text: "Acceso a VA-FI™ (Próximamente) - Módulo no habilitado actualmente" },
      { icon: Users, text: "Rol de asesor en decisiones de propiedades" },
      { icon: Shield, text: "Seguro de viaje incluido" },
    ],
  },
  {
    name: "Tier 3: Socio Estratégico",
    contribution: "$250K+",
    equity: "1.25%+",
    color: "from-amber-500 to-orange-500",
    icon: "🥇",
    benefits: [
      { icon: Calendar, text: "6 semanas gratis por año (incluye 1 ultra alta)" },
      { icon: Key, text: "Acceso VIP + reserva garantizada" },
      { icon: Percent, text: "100% descuento en fees (gratis)" },
      { icon: TrendingUp, text: "Co-ownership de 1 propiedad (5-10% ownership)" },
      { icon: Gift, text: "Revenue share del 2% de esa propiedad específica" },
      { icon: Users, text: "Asiento de observador en el consejo" },
      { icon: Shield, text: "Concierge personal + seguro premium" },
      { icon: Sparkles, text: "NFT exclusivo edición limitada" },
    ],
  },
]

export default function FounderNFTPage() {
  const [selectedTier, setSelectedTier] = useState(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/pitch">
                <Home className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">NFT de Fundador WEEK-CHAIN</h1>
              <p className="text-muted-foreground">Equity + Beneficios Tokenizados</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-12 h-12 text-primary" />
              <h2 className="text-4xl font-bold">Modelo Híbrido Innovador</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Combina lo mejor de ambos mundos: <strong>Equity tradicional</strong> para ownership del negocio +{" "}
              <strong>NFT de beneficios</strong> para utilidad inmediata
            </p>
          </div>
        </Card>

        {/* How It Works */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Equity Tradicional
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Ownership Real del Negocio</div>
                  <div className="text-sm text-muted-foreground">
                    Shares tradicionales en la cap table de WEEK-CHAIN
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Derechos de Dividendos</div>
                  <div className="text-sm text-muted-foreground">Participación en profits cuando se distribuyan</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Exit Potencial</div>
                  <div className="text-sm text-muted-foreground">Adquisición, IPO o venta secundaria</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Regulación Clara</div>
                  <div className="text-sm text-muted-foreground">Estructura legal tradicional y probada</div>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-400" />
              NFT de Beneficios
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Utilidad Inmediata</div>
                  <div className="text-sm text-muted-foreground">Semanas gratis, descuentos, acceso prioritario</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Transferible</div>
                  <div className="text-sm text-muted-foreground">Si vendes tu equity, puedes transferir el NFT</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Coleccionable</div>
                  <div className="text-sm text-muted-foreground">Diseño único por tier, edición limitada</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">NO es Security</div>
                  <div className="text-sm text-muted-foreground">Solo representa beneficios, no ownership</div>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Tiers de Financiamiento</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <Card
                key={index}
                className={`p-6 cursor-pointer transition-all ${
                  selectedTier === index ? "ring-2 ring-primary scale-105" : "hover:scale-102 hover:shadow-lg"
                }`}
                onClick={() => setSelectedTier(index)}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">{tier.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="space-y-1">
                    <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>{tier.contribution}</Badge>
                    <div className="text-sm text-muted-foreground">Equity: {tier.equity}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <benefit.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Why This Model Works */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">¿Por Qué Este Modelo Funciona?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Ventajas para Socios Fundadores</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>
                    <strong>Doble valor:</strong> Ownership + utilidad inmediata
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>
                    <strong>Validación del producto:</strong> Puedes usar las semanas tú mismo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>
                    <strong>Marketing viral:</strong> NFT coleccionable genera buzz
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>
                    <strong>Flexibilidad:</strong> Puedes transferir beneficios si vendes equity
                  </span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">Ventajas para WEEK-CHAIN</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>
                    <strong>Costo legal bajo:</strong> $50K vs $500K de STO completo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>
                    <strong>Rápido de implementar:</strong> 2-3 meses vs 12 meses
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>
                    <strong>Diferenciación:</strong> Único en el mercado de real estate
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>
                    <strong>Evangelistas:</strong> Socios fundadores se convierten en usuarios activos
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Example Scenario */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <h2 className="text-2xl font-bold mb-6">Ejemplo Concreto: Socio Fundador Tier 2</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-amber-400">Aportación</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span>Monto aportado</span>
                  <span className="font-bold">$150,000</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span>Equity recibido</span>
                  <span className="font-bold">0.75%</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span>NFT Tier</span>
                  <span className="font-bold">Socio (Tier 2)</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Valor Anual de Beneficios</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span>3 semanas gratis</span>
                  <span className="font-bold text-green-400">~$30,000</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span>50% descuento fees</span>
                  <span className="font-bold text-green-400">~$2,000</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span>VA-FI preferencial</span>
                  <span className="font-bold text-green-400">~$1,000</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded font-bold">
                  <span>Valor total anual</span>
                  <span className="text-green-400">~$33,000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-center">
              <strong className="text-green-400">ROI de beneficios:</strong> 22% anual solo en utilidad, sin contar
              apreciación del equity
            </p>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-8 text-center bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
          <h2 className="text-3xl font-bold mb-4">¿Listo para Participar?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Únete a nuestra ronda seed y recibe equity + tu NFT de fundador con beneficios inmediatos
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
              Agenda Reunión
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pitch">Ver Pitch Deck Completo</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
