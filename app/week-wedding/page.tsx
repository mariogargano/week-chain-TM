"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Gift, Calendar, Sparkles, Download, Apple, Smartphone, Check } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function WeekWeddingPage() {
  const [selectedCard, setSelectedCard] = useState<"classic" | "premium" | "luxury">("premium")

  const handleDownloadAppleWallet = () => {
    console.log("[v0] Downloading Apple Wallet pass")
    // TODO: Implement Apple Wallet pass generation
    alert("Descarga de Apple Wallet - Próximamente")
  }

  const handleDownloadGoogleWallet = () => {
    console.log("[v0] Downloading Google Wallet pass")
    // TODO: Implement Google Wallet pass generation
    alert("Descarga de Google Wallet - Próximamente")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-0 px-6 py-2 text-base">
                <Heart className="w-4 h-4 mr-2" />
                Smart Vacational Certificate
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                WEEK-WEDDING
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] mt-2">
                  Card
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-slate-600 mb-8 leading-relaxed">
                Un certificado de uso vacacional personal para solicitar 1 semana de alojamiento cada año por 15 años.
                <br />
                <span className="font-semibold text-[#FF9AA2]">
                  Sin fechas garantizadas. Sujeto a disponibilidad de alojamientos participantes.
                </span>
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white shadow-lg px-8 text-lg"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Adquirir Certificado
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#FF9AA2] text-[#FF9AA2] hover:bg-pink-50 px-8 text-lg bg-transparent"
                >
                  Ver Ejemplo Digital
                </Button>
              </div>
            </div>

            {/* Right side - Hero image of guests giving card to couple */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9AA2]/20 to-[#FFB7B2]/20 blur-3xl rounded-full" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/wedding-gift-presentation.jpg"
                  alt="Invitados entregando tarjeta WEEK-WEDDING metálica a los novios"
                  width={600}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Identificador Digital de Certificado</h2>
            <p className="text-xl text-slate-600">Representa tu derecho de uso - No es confirmación de reserva</p>
          </div>

          <div className="mb-20">
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] blur-3xl opacity-20 scale-105" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/bmwegpjb.jpeg"
                  alt="Tarjeta WEEK-WEDDING metálica de lujo en caja con flores y presentación elegante"
                  width={1200}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="text-center mt-6">
                <p className="text-slate-600 italic">Presentación de lujo con caja premium y tarjeta metálica</p>
              </div>
            </div>
          </div>

          {/* Interactive Card Display with metallic effect */}
          <div className="relative mx-auto max-w-2xl">
            {/* Glow effect behind card */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] blur-3xl opacity-30 scale-105" />

            <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              {/* Card Header with wedding gradient */}
              <div className="h-32 bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#FFC7C2] relative">
                {/* Metallic shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

                {/* Wedding rings icon */}
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white">
                    <div className="relative">
                      <Heart className="w-12 h-12 text-[#FF9AA2]" fill="#FF9AA2" />
                      <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Premium Badge */}
                <Badge className="absolute top-5 right-5 bg-white/90 text-[#FF9AA2] border-0 shadow-lg px-4 py-1.5">
                  <Gift className="h-4 w-4 mr-1.5" />
                  Gift Card
                </Badge>
              </div>

              <CardContent className="pt-16 pb-8 px-8">
                {/* Title and Product */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">WEEK-WEDDING Card</h2>
                  <p className="text-slate-400">Smart Vacational Certificate - 15 Años</p>
                  <p className="text-[#FFB7B2] font-semibold mt-1 text-sm">
                    Derecho de uso personal, no transferible sin autorización
                  </p>
                </div>

                {/* Main Value Display */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 mb-6 border border-slate-600">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-[#FFB7B2]" />
                      <span className="text-slate-400 text-sm">Solicitud anual según disponibilidad</span>
                    </div>
                    <div className="text-5xl font-bold text-white mb-2">15 Años</div>
                    <div className="text-xl text-slate-300">Derecho de solicitud • 1 semana/año</div>
                  </div>
                </div>

                {/* Couple Info */}
                <div className="space-y-3 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Para los novios:</p>
                        <p className="text-white font-bold text-lg">María & Carlos</p>
                      </div>
                      <Heart className="w-8 h-8 text-[#FF9AA2]" fill="#FF9AA2" />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Fecha de boda:</p>
                        <p className="text-white font-semibold">15 Junio 2025</p>
                      </div>
                      <Calendar className="w-6 h-6 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="bg-slate-800/30 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Check, text: "Solicitud anual" },
                      { icon: Heart, text: "No transferible*" },
                      { icon: Sparkles, text: "Sin fechas fijas" },
                      { icon: Gift, text: "Uso personal" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                          <item.icon className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-slate-300 text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card ID */}
                <div className="text-center border-t border-slate-700 pt-4">
                  <p className="text-slate-500 text-xs mb-1">Card ID</p>
                  <p className="text-white font-mono tracking-wider">
                    WW-2025-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Download Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleDownloadAppleWallet}
                size="lg"
                className="bg-black hover:bg-slate-800 text-white px-10 py-6 text-lg shadow-xl"
              >
                <Apple className="w-6 h-6 mr-3" />
                Descargar Identificador (Apple)
              </Button>
              <Button
                onClick={handleDownloadGoogleWallet}
                size="lg"
                variant="outline"
                className="border-2 border-slate-900 text-slate-900 hover:bg-slate-100 px-10 py-6 text-lg shadow-xl bg-white"
              >
                <Smartphone className="w-6 h-6 mr-3" />
                Descargar Identificador (Google)
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Cómo Funciona? */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">¿Cómo Funciona?</h2>
            <p className="text-xl text-slate-600">Sistema de solicitud de uso vacacional anual</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Gift,
                title: "Adquieres el Certificado",
                description:
                  "Adquieres un certificado que otorga derecho de solicitar alojamiento vacacional 1 vez al año durante 15 años consecutivos",
              },
              {
                step: "02",
                icon: Download,
                title: "Activas tu Certificado",
                description:
                  "Descargas el identificador digital del certificado en Apple o Google Wallet para consultar tu derecho de uso en cualquier momento",
              },
              {
                step: "03",
                icon: Calendar,
                title: "Solicitas Cada Año",
                description:
                  "Cada año puedes solicitar 1 semana en alojamientos participantes según disponibilidad operativa. Sin fechas ni destinos garantizados",
              },
            ].map((item) => (
              <Card
                key={item.step}
                className="border-2 border-slate-200 hover:border-[#FF9AA2] hover:shadow-xl transition-all"
              >
                <CardContent className="pt-8 text-center">
                  <div className="mb-6">
                    <div className="text-[#FF9AA2] text-6xl font-bold mb-4 opacity-20">{item.step}</div>
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-5xl font-bold text-center text-slate-900 mb-16">Características del Certificado</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "15 Años de Derecho",
                description: "Solicitud anual sin expiración por año",
              },
              {
                icon: Gift,
                title: "Uso Personal",
                description: "Derecho individual no comercial",
              },
              {
                icon: Sparkles,
                title: "Según Disponibilidad",
                description: "Alojamientos participantes variables",
              },
              {
                icon: Download,
                title: "Identificador Digital",
                description: "Certificado consultable, no reserva confirmada",
              },
            ].map((benefit, idx) => (
              <Card key={idx} className="border-2 border-slate-200 hover:shadow-lg transition-shadow text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-[#FF9AA2]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lo Que Incluye */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Derecho de Uso Anual</h2>
            <p className="text-xl text-slate-600">1 solicitud de alojamiento por año según disponibilidad</p>
          </div>

          <Card className="border-2 border-[#FF9AA2]">
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Derecho de solicitar 1 semana/año",
                  "Alojamientos participantes variables",
                  "Sin fechas ni destinos garantizados",
                  "Solicitudes flexibles de periodo",
                  "Disponibilidad no garantizada",
                  "Upgrades sujetos a costo adicional",
                  "Derecho renovable anualmente",
                  "Transferencia sujeta a aprobación",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Aviso Legal Obligatorio:</strong> Este certificado otorga
                  exclusivamente un derecho personal, no financiero y no inmobiliario, de SOLICITAR alojamiento
                  vacacional por 1 semana al año durante 15 años. NO constituye propiedad, inversión, garantía de
                  acceso, ni asigna fechas, destinos o propiedades específicas. Las solicitudes están sujetas a
                  disponibilidad operativa de alojamientos participantes al momento de la solicitud. NO genera
                  expectativa de ganancia, apreciación, reventa o ingreso. La disponibilidad es dinámica y no
                  vinculante. Los destinos y características de alojamientos pueden variar sin previo aviso.
                  Transferencia sujeta a aprobación según reglas de la plataforma WEEK-CHAIN.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2]">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Heart className="w-6 h-6" />
              <span className="text-lg font-semibold">Precio según nivel de certificado*</span>
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6">Adquiere tu Certificado de Uso Vacacional</h2>
          <p className="text-2xl mb-10 opacity-95">15 años de derecho de solicitud anual - Sujeto a disponibilidad</p>
          <Button size="lg" className="bg-white text-[#FF9AA2] hover:bg-slate-50 px-10 text-lg h-14">
            <Gift className="w-6 h-6 mr-2" />
            Consultar Disponibilidad
          </Button>
          <p className="mt-6 text-white/90 text-sm">
            Identificador digital descargable • NO constituye confirmación de reserva
          </p>
          <p className="mt-2 text-white/80 text-xs">
            *Precio sujeto a nivel de certificado y disponibilidad. No incluye alojamientos específicos, fechas
            garantizadas ni destinos confirmados. Activación y uso sujetos a términos y condiciones completos.
          </p>
        </div>
      </section>
    </div>
  )
}
