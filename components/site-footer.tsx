"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Send,
  Lock,
  HelpCircle,
  Shield,
  FileText,
  Receipt,
  AlertTriangle,
  Activity,
  Mail,
  Phone,
  MapPin,
  Star,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VirtualOfficeModal } from "@/components/virtual-office-modal"
import { FooterTrustSignal } from "@/components/footer-trust-signal"

export function SiteFooter() {
  const [isVirtualOfficeModalOpen, setIsVirtualOfficeModalOpen] = useState(false)

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12 p-6 bg-amber-900/20 border border-amber-700/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-2">Aviso Legal Importante</p>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                <strong>WEEK-CHAIN opera un sistema de certificados digitales vacacionales.</strong> El usuario adquiere
                derechos personales y temporales de uso vacacional por hasta 15 años, sujetos a disponibilidad y reglas
                operativas del sistema.{" "}
                <strong>
                  NO se adquiere propiedad, copropiedad, fracción inmobiliaria, instrumento financiero, ni expectativa
                  de ganancia.
                </strong>{" "}
                Este certificado NO constituye inversión ni ofrece rendimientos.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12 space-y-6">{/* WEEK-Tracker Banner (Rose/Pink) */}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-xl font-bold">™</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              WEEK-CHAIN™ opera un sistema de certificados digitales que otorgan derechos personales y temporales de uso
              vacacional por hasta 15 años, sujetos a disponibilidad y reglas operativas del sistema.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                aria-label="Síguenos en Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                aria-label="Visita nuestro GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                aria-label="Conéctate en LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                aria-label="Síguenos en Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Updated Resources Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Recursos</h4>
            <ul className="space-y-3 text-sm">
              {/* WEEK-Tracker button with pulse effect */}
              <li>
                <Link
                  href="/ventas"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-semibold rounded-lg transition-all animate-pulse hover:animate-none shadow-lg shadow-[#FF6B6B]/30"
                >
                  <Activity className="h-4 w-4" />
                  WEEK-Tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/week-review"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/30"
                >
                  <Star className="h-4 w-4" />
                  WEEK Review
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">
                  Tutorial
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors">
                  Disclaimer Legal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setIsVirtualOfficeModalOpen(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 font-medium"
                >
                  <Lock className="h-4 w-4" />
                  Oficina Virtual (Equipo)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Compliance & Docs</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/kyc" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  KYC Compliance
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Centro Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/verify/demo"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Verificar Certificado
                </Link>
              </li>
            </ul>
          </div>

          {/* New Contact Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:info@week-chain.com"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-[#FF9AA2]" />
                  info@week-chain.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@week-chain.com"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-[#B5EAD7]" />
                  support@week-chain.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+529981234567"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4 text-[#C7CEEA]" />
                  +52 998 XXX XXXX
                </a>
              </li>
              <li>
                <span className="text-gray-400 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#FFDAC1] mt-0.5" />
                  <span>Cancún, Q. Roo, México</span>
                </span>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-[#FF9AA2] hover:text-[#FFB7B2] transition-colors font-medium"
                >
                  Formulario de Contacto
                  <span className="text-xs">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10 pt-12 mb-12">
          <div className="max-w-md">
            <h4 className="font-semibold text-lg mb-2">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">Get the latest news and updates about WEEK-CHAIN</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <Button className="bg-brand-gradient hover:opacity-90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 space-y-6">
          <div className="mb-6">
            <FooterTrustSignal />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-400">
            <div>
              <p className="font-semibold text-white mb-2">Operaciones en México</p>
              <p className="leading-relaxed">
                <span className="text-white">WEEK-CHAIN SAPI de CV</span>
                <br />
                Cancún, Quintana Roo, México
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center space-y-3">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} WEEK-CHAIN™ — All Rights Reserved</p>
            <p className="text-sm text-gray-400">Operated by WEEK-CHAIN S.A.P.I. de C.V. (Mexico)</p>
            <p className="text-xs text-gray-500 max-w-3xl mx-auto">
              WEEK-CHAIN™ opera un sistema de certificados digitales vacacionales. Los derechos otorgados son
              personales, temporales (hasta 15 años) y sujetos a disponibilidad. NO constituyen propiedad, copropiedad,
              instrumento financiero ni ofrecen rendimientos. Sujeto a términos y condiciones.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <Link href="/terms" className="hover:text-white transition-colors underline">
                Términos y Condiciones
              </Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-white transition-colors underline">
                Aviso de Privacidad
              </Link>
              <span>·</span>
              <Link href="/cancellation" className="hover:text-white transition-colors underline">
                Política de Cancelación
              </Link>
            </div>
          </div>
        </div>
      </div>

      <VirtualOfficeModal isOpen={isVirtualOfficeModalOpen} onClose={() => setIsVirtualOfficeModalOpen(false)} />
    </footer>
  )
}
