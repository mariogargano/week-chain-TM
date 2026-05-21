"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Globe,
  FileCheck,
  Lock,
  CheckCircle,
  Users,
  Scale,
  Building,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Clock,
  X,
  ChevronDown,
  Download,
  FileText,
} from "lucide-react"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Metadata moved to layout.tsx or removed - cannot export from "use client" components

export default function CompliancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6 py-32">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-float-delayed" />

        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-full px-6 py-2 mb-6">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Compliance by Design</span>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl leading-[1.1]">
            Marco de Cumplimiento <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              WEEK-CHAIN
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-pretty text-xl text-slate-300 md:text-2xl leading-relaxed mb-4">
            Entendemos compliance en WEEK-CHAIN como: <strong>protección al consumidor, transparencia total, trazabilidad de evidencias y operación íntegra</strong>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <div className="font-semibold text-white">Consumer-First</div>
                <div className="text-sm text-slate-400">Protección y claridad antes que crecimiento</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <div className="font-semibold text-white">Evidence-Ready</div>
                <div className="text-sm text-slate-400">Cada decisión auditable y rastreable</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <div className="font-semibold text-white">Capacity Integrity</div>
                <div className="text-sm text-slate-400">Sin sobreventa, operación controlada</div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Solicitar Due Diligence Pack <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Qué es WEEK-CHAIN y Qué NO es */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-16 text-center">
            Claridad Comercial: Qué Somos y Qué No Somos
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Qué es */}
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  Qué Es WEEK-CHAIN
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="text-slate-700">
                      <strong>Derechos de uso personal</strong>: SVC representa un derecho personal, temporal (15 años) y revocable de uso vacacional en propiedades seleccionadas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="text-slate-700">
                      <strong>No es propiedad</strong>: No confieren propiedad, equity o derechos reales sobre inmuebles
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="text-slate-700">
                      <strong>Transferible con KYC</strong>: Pueden ser transferidos a terceros con verificación de identidad
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="text-slate-700">
                      <strong>Operado por ecosistema</strong>: Propiedades operadas por hoteles/operadores locales, nosotros coordinamos disponibilidad y certificados
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="text-slate-700">
                      <strong>Regulado como derecho contractual</strong>: Sujeto a leyes de protección al consumidor, no de valores
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Qué NO es */}
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <X className="h-6 w-6 text-red-600" />
                  Qué NO Es WEEK-CHAIN
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-slate-700">
                      <strong>NO es inversión:</strong> SVC no promete retorno, apreciación o ingresos
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-slate-700">
                      <strong>NO es timeshare tradicional:</strong> No opera bajo modelos de Directiva 2008/122/EC europeos (aunque respeta sus principios)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-slate-700">
                      <strong>NO es activo financiero:</strong> No puede usarse como colateral, no tiene rating de crédito, no es securitizable per se
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-slate-700">
                      <strong>NO es garantizado:</strong> Disponibilidad está sujeta a operación normal; no prometemos "resort perfecto" ni disponibilidad 100%
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-slate-700">
                      <strong>NO reemplaza consejo legal/fiscal:</strong> Cada jurisdicción puede tener tratamientos diferentes; recomendamos revisar con abogado local
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Mini-glosario */}
          <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Mini-Glosario</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <div className="font-bold text-slate-900">SVC (Smart Vacational Certificate)</div>
                  <div className="text-slate-600 text-sm">Certificado digital que acredita derechos de uso vacacional</div>
                </div>
                <div className="mb-4">
                  <div className="font-bold text-slate-900">Capacidad</div>
                  <div className="text-slate-600 text-sm">Total de semanas disponibles en una propiedad por año; controlamos para evitar sobreventa</div>
                </div>
                <div className="mb-4">
                  <div className="font-bold text-slate-900">Fulfill</div>
                  <div className="text-slate-600 text-sm">Confirmar una estancia: usuario selecciona semana → lock atómico → confirmación inmediata</div>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <div className="font-bold text-slate-900">Cooling-off</div>
                  <div className="text-slate-600 text-sm">Período de reflexión para cancelar compra sin penalidad (14 días en EU, variable por jurisdicción)</div>
                </div>
                <div className="mb-4">
                  <div className="font-bold text-slate-900">Disclosures</div>
                  <div className="text-slate-600 text-sm">Información precontractual: términos, cancellation policy, costos, derechos de retracto</div>
                </div>
                <div className="mb-4">
                  <div className="font-bold text-slate-900">Audit Trail</div>
                  <div className="text-slate-600 text-sm">Registro completo de cada transacción, decisión y evidencia; base de cumplimiento regulatorio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
