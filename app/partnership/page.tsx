"use client"

import { motion } from "framer-motion"
import {
  Handshake,
  TrendingUp,
  Globe,
  Users,
  Zap,
  Shield,
  DollarSign,
  Target,
  Rocket,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const benefits = [
  {
    icon: TrendingUp,
    title: "Crecimiento Mutuo",
    description: "Accede a un ecosistema en expansión con oportunidades de crecimiento exponencial",
    color: "from-[#FF9AA2] to-[#FFB7B2]",
  },
  {
    icon: Globe,
    title: "Alcance Global",
    description: "Expande tu presencia en mercados internacionales con nuestra red global",
    color: "from-[#B5EAD7] to-[#E2F0CB]",
  },
  {
    icon: Users,
    title: "Red de Contactos",
    description: "Conecta con inversores, desarrolladores y profesionales del sector vacacional",
    color: "from-[#C7CEEA] to-[#FFDAC1]",
  },
  {
    icon: Zap,
    title: "Plataforma Digital",
    description: "Acceso a tecnología de vanguardia y herramientas de gestión avanzadas",
    color: "from-[#FFB7B2] to-[#FF9AA2]",
  },
  {
    icon: Shield,
    title: "Seguridad Legal",
    description: "Framework legal robusto con cumplimiento NOM-029 y NOM-151",
    color: "from-[#E2F0CB] to-[#B5EAD7]",
  },
  {
    icon: DollarSign,
    title: "Modelo de Ingresos",
    description: "Múltiples flujos de honorarios: comisiones hasta 6% y bonos por desempeño",
    color: "from-[#FFDAC1] to-[#C7CEEA]",
  },
]

const partnerTypes = [
  {
    title: "Desarrolladores Inmobiliarios",
    description: "Vende semanas vacacionales de tus propiedades y accede a un mercado global de compradores",
    features: [
      "Liquidez inmediata para tus proyectos",
      "Reducción de costos de comercialización",
      "Acceso a compradores internacionales",
      "Plataforma digital sin costo inicial",
    ],
    icon: Target,
  },
  {
    title: "Brokers & Agencias",
    description: "Expande tu portafolio con semanas vacacionales y gana comisiones recurrentes",
    features: [
      "Comisiones hasta 6% por venta",
      "Sistema multinivel (6%-4%-2% / 3%-2%-1%)",
      "Dashboard de gestión avanzado",
      "Herramientas de marketing digital",
    ],
    icon: Handshake,
  },
  {
    title: "Inversores & Compradores",
    description: "Adquiere semanas vacacionales en propiedades de lujo con contratos legales",
    features: [
      "Due diligence completo de propiedades",
      "Transparencia total en cada transacción",
      "Contratos notarizados por 15 años",
      "Bonus vacacional hasta 50% del valor",
    ],
    icon: Rocket,
  },
]

const stats = [
  { value: "15+", label: "Propiedades Disponibles" },
  { value: "$50M+", label: "Valor Total de Activos" },
  { value: "5", label: "Destinos Premium" },
  { value: "100+", label: "Partners Activos" },
]

export default function PartnershipPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFDAC1]/20 via-white to-[#B5EAD7]/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF9AA2]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C7CEEA]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-[#B5EAD7]/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0 px-6 py-2 text-sm">
              <Handshake className="w-4 h-4 mr-2" />
              Programa de Partnerships
            </Badge>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#FF9AA2] via-[#C7CEEA] to-[#B5EAD7] bg-clip-text text-transparent leading-tight">
              Construyamos el Futuro
              <br />
              de las Vacaciones Juntos
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Únete al ecosistema de <span className="font-bold text-[#FF9AA2]">semanas vacacionales</span> más
              innovador de Latinoamérica. Crea valor, genera ingresos y revoluciona el mercado vacacional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/contact")}
                className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:opacity-90 text-white text-lg px-8 py-6"
              >
                Quiero Participar al Programa
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-6 text-center border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-[#FF9AA2] to-[#B5EAD7] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </Card>
            ))}
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Beneficios del Partnership</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Accede a un ecosistema completo de herramientas, tecnología y oportunidades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Card className="group p-6 border-2 border-slate-200/50 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Partner Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Tipos de Partnership</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Soluciones personalizadas para cada tipo de socio estratégico
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {partnerTypes.map((type, index) => (
                <Card
                  key={index}
                  className="p-8 border-2 border-slate-200/50 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center mb-6">
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{type.title}</h3>
                  <p className="text-slate-600 mb-6">{type.description}</p>
                  <ul className="space-y-3">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#B5EAD7] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="p-12 text-center border-2 border-slate-200/50 bg-gradient-to-br from-white via-[#FFDAC1]/10 to-[#C7CEEA]/10 backdrop-blur-sm">
              <Rocket className="w-16 h-16 mx-auto mb-6 text-[#FF9AA2]" />
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                ¿Listo para Revolucionar el Mercado?
              </h2>
              <p className="text-lg text-slate-700 max-w-2xl mx-auto mb-8">
                Únete a WEEK-CHAIN™ y sé parte de la transformación del mercado vacacional. Agenda una reunión con
                nuestro equipo para explorar oportunidades de colaboración.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push("/contact")}
                  className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:opacity-90 text-white text-lg px-8 py-6"
                >
                  Quiero Participar al Programa
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => (window.location.href = "mailto:partnerships@weekchain.com")}
                  className="border-2 border-[#C7CEEA] text-slate-700 hover:bg-[#C7CEEA]/10 text-lg px-8 py-6"
                >
                  partnerships@weekchain.com
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
