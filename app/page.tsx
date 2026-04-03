import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LegalDisclaimer } from "@/components/legal-disclaimer"
import { ReferralCTAButton } from "@/components/referral-cta-button"
import { MobileAppSection } from "@/components/mobile-app-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { TrustBadges } from "@/components/trust-badges"
import { PlatformShowcase } from "@/components/platform-showcase"
import { AnimatedHero } from "@/components/ui/animated-hero"
import { CommunitySphereSection } from "@/components/community-sphere-section"
import { UtilitiesModal } from "@/components/utilities-modal"
import { ExitStrategyModal } from "@/components/exit-strategy-modal"
import { VacationDecorations } from "@/components/vacation-decorations"
import { ComplianceSection } from "@/components/compliance-section"
import { CertificateFeaturesSection } from "@/components/certificate-features-section"
import { ArrowRight, Building2, Calendar, CheckCircle2, Coins, Shield, Sparkles, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ReferralCTAButton />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFDAC1]/30 via-[#B5EAD7]/20 to-[#C7CEEA]/30">
        <VacationDecorations />
        <AnimatedHero />
      </section>

      <TrustBadges />

      {/* Community Sphere Section */}
      <CommunitySphereSection />

      {/* Platform Showcase */}
      <PlatformShowcase />

      {/* Enhanced Broker Section */}
      <section className="relative bg-gradient-to-br from-[#FF9AA2] via-[#FFB7B2] to-[#FFDAC1] px-4 sm:px-6 py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="container mx-auto max-w-6xl relative z-10 px-4">
          <div className="text-center mb-12 md:mb-16">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg">
              <Users className="h-5 w-5" />
              El Motor del Ecosistema
            </div>
            <h2 className="mb-4 md:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900">
              Conviértete en Broker Elite
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-800 leading-relaxed font-medium max-w-3xl mx-auto px-2">
              Trae propiedades al ecosistema WEEK-CHAIN™ y construye un negocio recurrente con comisiones multinivel
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 mb-8 md:mb-12">
            {[
              {
                title: "Comisión Multinivel 5-2-1",
                desc: "5% directo en cada venta + 2% nivel 2 + 1% nivel 3. Construye tu red y multiplica tus ingresos.",
              },
              {
                title: "2 Semanas Elite + Beneficios",
                desc: "Recibe 2 semanas de baja temporada como beneficio exclusivo. Úsalas, intercámbialas o réntalas.",
              },
              {
                title: "10% en Exit Strategy",
                desc: "Participa en las ganancias cuando la propiedad se vende después de 15 años.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white shadow-lg"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold flex-shrink-0 mt-1">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-slate-900">{item.title}</h4>
                  <p className="text-slate-800">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto sm:min-w-[280px] bg-slate-900 text-white hover:bg-slate-800 text-base md:text-lg font-semibold h-14 md:h-16 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
            >
              <Link href="/broker-elite">
                Conocer Broker Elite
                <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative bg-gradient-to-br from-[#C7CEEA]/20 via-white to-[#B5EAD7]/20 px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-[#FF9AA2]/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-[#C7CEEA]/10 blur-3xl" />

        <div className="container mx-auto max-w-7xl relative z-10 px-4">
          <div className="mb-16 md:mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#FF9AA2]" />
              Proceso Simple y Seguro
            </div>
            <h2 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight text-balance">
              ¿Cómo Funciona?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-pretty px-2">
              Cuatro pasos sencillos para participar en la preventa y obtener tu NFT de semana vacacional
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12 md:mb-16">
            {[
              {
                icon: Building2,
                title: "Selecciona Propiedad",
                description:
                  "Explora propiedades en preventa verificadas. Se necesitan 48 semanas vendidas para confirmar la construcción",
                color: "#FF9AA2",
                bgGradient: "from-[#FF9AA2]/20 to-[#FFB7B2]/10",
                iconBg: "bg-[#FF9AA2]/10",
                borderColor: "border-[#FF9AA2]/30",
              },
              {
                icon: Coins,
                title: "Paga tu Semana",
                description:
                  "Elige tu método: USDC en blockchain, tarjeta, SPEI o pago en Oxxo. Tu pago va directo a escrow multisig seguro",
                color: "#FFB7B2",
                bgGradient: "from-[#FFB7B2]/20 to-[#FFDAC1]/10",
                iconBg: "bg-[#FFB7B2]/10",
                borderColor: "border-[#FFB7B2]/30",
              },
              {
                icon: Calendar,
                title: "Recibe tu Voucher",
                description:
                  "Obtén inmediatamente tu certificado de compra digital. Reserva tu semana específica con precios estacionales",
                color: "#B5EAD7",
                bgGradient: "from-[#B5EAD7]/20 to-[#E2F0CB]/10",
                iconBg: "bg-[#B5EAD7]/10",
                borderColor: "border-[#B5EAD7]/30",
              },
              {
                icon: Shield,
                title: "Canjea por NFT",
                description:
                  "Al alcanzar 48 semanas vendidas, canjea tu voucher por NFT en Solana. Disfruta 1 semana/año durante 15 años",
                color: "#C7CEEA",
                bgGradient: "from-[#C7CEEA]/20 to-[#FF9AA2]/10",
                iconBg: "bg-[#C7CEEA]/10",
                borderColor: "border-[#C7CEEA]/30",
              },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-6 -left-6 text-[120px] font-black text-slate-100 leading-none select-none transition-all duration-500 group-hover:text-slate-200 group-hover:scale-110">
                  {i + 1}
                </div>

                <div
                  className={`relative h-full rounded-3xl bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm border-2 ${step.borderColor} p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 glass`}
                >
                  <div
                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${step.iconBg} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-md relative z-10`}
                  >
                    <step.icon
                      className="h-10 w-10 transition-transform duration-500 group-hover:scale-110"
                      style={{ color: step.color }}
                    />
                  </div>

                  <h3 className="relative mb-4 text-2xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-pretty">{step.description}</p>

                  <div className="mt-6 flex items-center gap-2">
                    {[...Array(4)].map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx <= i ? "w-8" : "w-2"}`}
                        style={{
                          backgroundColor: idx <= i ? step.color : "#e2e8f0",
                          opacity: idx <= i ? 1 : 0.3,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-20">
                    <ArrowRight className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "100% Seguro",
                desc: "Escrow multisig protege tu compra",
                color: "#FF9AA2",
              },
              {
                icon: CheckCircle2,
                title: "Pago en Oxxo",
                desc: "Reserva tu semana pagando en efectivo",
                color: "#B5EAD7",
              },
              {
                icon: Sparkles,
                title: "Sin Intermediarios",
                desc: "Blockchain elimina costos adicionales",
                color: "#C7CEEA",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl glass border border-slate-200/60 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${benefit.color}20` }}
                >
                  <benefit.icon className="h-7 w-7" style={{ color: benefit.color }} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-1">{benefit.title}</h4>
                  <p className="text-sm text-slate-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CertificateFeaturesSection />

      <TestimonialsSection />
      
      <ComplianceSection />

      {/* Modal Buttons Section */}
      <section className="bg-white px-6 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Información Adicional</h3>
            <p className="text-slate-600">Conoce más sobre las utilidades y la estrategia a largo plazo</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <UtilitiesModal />
            <ExitStrategyModal />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-50 to-white px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-4xl text-center px-4">
          <h2 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
            ¿Listo para Comenzar?
          </h2>
          <p className="mb-8 md:mb-12 text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto px-2">
            Únete a la comunidad WEEK-CHAIN™ y sé parte del futuro de las propiedades vacacionales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto sm:min-w-[240px] bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:from-[#ff8a92] hover:via-[#ffa7a2] hover:to-[#b7beda] text-white text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl md:rounded-2xl shadow-lg shadow-[#FF9AA2]/25 hover:shadow-xl hover:shadow-[#FF9AA2]/30 transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth/login">
                Comenzar
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-[240px] border-2 border-[#C7CEEA] text-slate-700 hover:bg-[#C7CEEA]/10 hover:border-[#b7beda] text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl md:rounded-2xl transition-all duration-300 glass bg-transparent"
            >
              <Link href="/properties">Ver Propiedades</Link>
            </Button>
          </div>
        </div>
      </section>

      <MobileAppSection />
      <LegalDisclaimer />
    </div>
  )
}
