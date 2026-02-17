"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  Receipt,
  HelpCircle,
  BookOpen,
  Activity,
  ArrowRight,
  TrendingUp,
  Star,
} from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

export function Footer() {
  const t = useTranslations()

  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.properties, href: "/properties" },
    { label: t.nav.brokerProgram, href: "/broker-programa" },
    { label: t.nav.contact, href: "/contact" },
  ]

  const complianceLinks = [
    { label: "FAQ", href: "/faq", icon: HelpCircle },
    { label: "WEEK-Tracker", href: "/ventas", icon: BookOpen },
    { label: "KYC Compliance", href: "/kyc", icon: Shield },
    { label: "Centro Legal", href: "/legal", icon: FileText },
    { label: "Verificar Certificado", href: "/verify/demo", icon: Receipt },
  ]

  const legalLinks = [
    { label: t.footer.terms, href: "/legal/terms" },
    { label: t.footer.privacy, href: "/legal/privacy" },
    { label: "Cancelaciones", href: "/legal/cancellations" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: t.footer.cookies, href: "/cookies" },
  ]

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/weekchain", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/weekchain", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/weekchain", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/weekchain", label: "LinkedIn" },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      {/* WEEK-Tracker Section */}
      <div className="bg-gradient-to-r from-[#FF6B7A] via-[#FF8A94] to-[#FF6B7A] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/ventas" className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 group">
            {/* Icon container con animación */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center bg-white rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-8 w-8 text-[#FF6B7A]" />
              </div>
            </div>

            {/* Texto principal */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-white font-black text-2xl sm:text-3xl tracking-tight">WEEK-Tracker</span>
                <TrendingUp className="h-6 w-6 text-white animate-bounce" />
              </div>
              <p className="text-white/90 text-sm sm:text-base mt-1">Registro Público de Ventas en Tiempo Real</p>
            </div>

            {/* Botón CTA */}
            <div className="flex items-center gap-2 bg-white text-[#FF6B7A] font-bold text-base sm:text-lg px-6 py-3 rounded-full shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span>VER TRANSACCIONES</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* WEEK Review Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 py-6 sm:py-8 border-b-4 border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/week-review"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 group"
          >
            {/* Icon container con animación */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center bg-white rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Texto principal */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-white font-black text-2xl sm:text-3xl tracking-tight">WEEK Review</span>
                <Star className="h-6 w-6 text-yellow-300 fill-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/90 text-sm sm:text-base mt-1">
                Comparte Tu Experiencia - Solo Certificados Verificados
              </p>
            </div>

            {/* Botón CTA */}
            <div className="flex items-center gap-2 bg-white text-blue-600 font-bold text-base sm:text-lg px-6 py-3 rounded-full shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span>DEJAR REVIEW</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-white p-1">
                <Image src="/logo.png" alt="WEEK-CHAIN" width={44} height={44} className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">
                  WEEK-CHAIN<sup className="text-[8px]">™</sup>
                </span>
                <span className="text-xs text-slate-400 font-medium">Smart Vacational Certificate</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm mb-6">{t.footer.description}</p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#FF9AA2] transition-colors"
                  aria-label={`Síguenos en ${social.label}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-[#FF9AA2] transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Docs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Compliance & Docs</h3>
            <ul className="space-y-3">
              {complianceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#FF9AA2] transition-colors text-sm"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.footer.legal}</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-[#FF9AA2] transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.footer.contact}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@week-chain.com"
                  className="flex items-center gap-3 text-slate-400 hover:text-[#FF9AA2] transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 text-[#FF9AA2]" />
                  info@week-chain.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+529841234567"
                  className="flex items-center gap-3 text-slate-400 hover:text-[#FF9AA2] transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 text-[#FF9AA2]" />
                  +52 984 123 4567
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/place/Playa+del+Carmen,+Quintana+Roo,+Mexico"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-slate-400 hover:text-[#FF9AA2] transition-colors text-sm"
                >
                  <MapPin className="h-4 w-4 text-[#FF9AA2] mt-0.5" />
                  Playa del Carmen, Quintana Roo, México
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} WEEK-CHAIN™. {t.footer.rights}.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-blue-500 text-xs font-mono bg-blue-950 px-2 py-1 rounded">
                v2.0.1 - WEEK Review Added
              </span>
              <Image src="/logo.png" alt="WEEK-CHAIN" width={24} height={24} className="opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
