"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Menu, X, LogIn } from "lucide-react"
import { useState, useEffect } from "react"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
          : "bg-black/40 backdrop-blur-md border-b border-white/10"
      }`}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/properties"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 hover:text-white"
            }`}
          >
            Destinos
          </Link>

          <Link
            href="/services"
            className={`relative text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 hover:text-white"
            }`}
          >
            Servicios
            <span className="absolute -top-2 -right-8 bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          </Link>

          <Link
            href="/broker-programa"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 hover:text-white"
            }`}
          >
            Intermediarios
          </Link>

          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 hover:text-white"
            }`}
          >
            Mi Cuenta
          </Link>

          <Link
            href="/help"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/90 hover:text-white"
            }`}
          >
            Ayuda
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <Button
            asChild
            size="default"
            className="hidden md:flex bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:opacity-90 text-white font-semibold shadow-lg shadow-[#FF9AA2]/20 border-0"
          >
            <Link href="/auth">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden transition-colors ${
              scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Updated with softer colors */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200/50 md:hidden bg-white/95 backdrop-blur-xl">
          <nav className="container mx-auto flex flex-col gap-1 p-4">
            <Link
              href="/properties"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-[#FF9AA2]/10 hover:to-[#C7CEEA]/10 hover:text-slate-900 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Destinos
            </Link>
            <Link
              href="/services"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-[#FF9AA2]/10 hover:to-[#C7CEEA]/10 hover:text-slate-900 transition-all flex items-center justify-between"
              onClick={() => setMobileMenuOpen(false)}
            >
              Servicios
              <span className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                NEW
              </span>
            </Link>
            <Link
              href="/broker-programa"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-[#FF9AA2]/10 hover:to-[#C7CEEA]/10 hover:text-slate-900 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Intermediarios
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-[#FF9AA2]/10 hover:to-[#C7CEEA]/10 hover:text-slate-900 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mi Cuenta
            </Link>
            <Link
              href="/help"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-[#FF9AA2]/10 hover:to-[#C7CEEA]/10 hover:text-slate-900 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ayuda
            </Link>
            <Link
              href="/auth"
              className="mt-3 rounded-xl bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#FF9AA2]/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
