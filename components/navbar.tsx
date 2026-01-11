"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  Menu,
  X,
  Store,
  LayoutDashboard,
  UserCircle,
  LogOut,
  HandCoins,
  Briefcase,
  Building2,
  ChevronDown,
  Calendar,
  ShoppingBag,
  Globe,
  TrendingUp,
  ArrowLeftRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslations } from "@/lib/i18n/use-translations"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const fallbackNav = {
  aboutUs: "Nosotros",
  myPanel: "Mi Panel",
  signOut: "Cerrar Sesión",
  language: "Idioma",
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [ecosystemOpen, setEcosystemOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const t = useTranslations()

  useEffect(() => {
    console.log("[v0] Navbar component mounted successfully")
  }, [])

  const nav = {
    aboutUs: t?.nav?.aboutUs || fallbackNav.aboutUs,
    myPanel: t?.nav?.myPanel || fallbackNav.myPanel,
    signOut: t?.nav?.signOut || fallbackNav.signOut,
    language: t?.nav?.language || fallbackNav.language,
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setIsAuthenticated(true)
          setUserEmail(session.user.email || null)

          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", session.user.id)
            .single()

          if (profile) {
            setUserRole(profile.role)
            setUserName(profile.full_name || session.user.email?.split("@")[0] || null)
            localStorage.setItem("user_role", profile.role || "user")
            if (profile.full_name) localStorage.setItem("user_name", profile.full_name)
          } else {
            setUserName(session.user.email?.split("@")[0] || null)
          }
        } else {
          setIsAuthenticated(false)
          setUserRole(null)
          setUserName(null)
          setUserEmail(null)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
        setUserEmail(session.user.email || null)
        setUserName(session.user.email?.split("@")[0] || null)
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false)
        setUserRole(null)
        setUserName(null)
        setUserEmail(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.clear()
    setIsAuthenticated(false)
    setUserRole(null)
    setUserName(null)
    setUserEmail(null)
    router.push("/")
  }

  const navItems = [
    {
      label: "Destinos Participantes",
      href: "/properties",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      label: "Servicios",
      href: "/services",
      icon: <Store className="w-4 h-4" />,
    },
    {
      label: "Intermediarios",
      href: "/broker-programa",
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ]

  const ecosystemItems = [
    {
      label: "Administración",
      href: "/week-management",
      icon: <Briefcase className="w-4 h-4" />,
      description: "Administración de certificados",
    },
    {
      label: "Solicitudes",
      href: "/week-booking",
      icon: <ShoppingBag className="w-4 h-4" />,
      description: "Sistema de solicitudes",
    },
    {
      label: "Certificado Bodas",
      href: "/week-wedding",
      icon: <Calendar className="w-4 h-4" />,
      description: "Certificado temático",
    },
    {
      label: "WEEK Live In Style",
      href: "/week-live-style",
      icon: <Store className="w-4 h-4" />,
      description: "Blog & Lifestyle",
    },
    {
      label: "Coordinación",
      href: "/week-market",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      description: "Coordinación de solicitudes",
    },
    {
      label: "VA-FI",
      href: "/va-fi",
      icon: <HandCoins className="w-4 h-4" />,
      description: "Protocolo de verificación",
    },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 bg-white ${
          scrolled ? "shadow-2xl border-b-4 border-[#FF9AA2]" : "shadow-lg"
        }`}
        style={{
          backgroundColor: "#ffffff",
          zIndex: 9999,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative z-[10000]">
              <Image
                src="/logo.png"
                alt="WEEK-CHAIN Logo"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
                priority
              />
              <div>
                <span className="font-bold text-slate-900 text-base sm:text-lg lg:text-xl">WEEK-CHAIN</span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 block -mt-0.5 sm:-mt-1 leading-tight">
                  Smart Vacational Certificate
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 xl:px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-[#FF9AA2] transition-colors rounded-lg hover:bg-slate-50 whitespace-nowrap"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Dropdown Ecosistema Week */}
              <DropdownMenu open={ecosystemOpen} onOpenChange={setEcosystemOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 xl:px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-[#FF9AA2] transition-colors rounded-lg hover:bg-slate-50 whitespace-nowrap">
                    <Globe className="w-4 h-4" /> {/* Changed from Briefcase to Globe icon */}
                    <span>Mundo-WEEK </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${ecosystemOpen ? "rotate-180" : ""}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {ecosystemItems.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href} className="flex items-start gap-3 px-3 py-3 cursor-pointer">
                        <div className="mt-0.5">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/week-fundacion"
                className="flex items-center gap-1.5 px-3 xl:px-4 py-2.5 text-sm font-medium text-[#FF9AA2] hover:text-[#FF8A92] transition-colors rounded-lg hover:bg-pink-50 whitespace-nowrap border border-[#FF9AA2]/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>WEEK Fundación</span>
              </Link>
            </nav>

            {/* Right Side - Desktop */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3 relative z-[60]">
              <LanguageSelector />

              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white gap-2 whitespace-nowrap shadow-sm"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden lg:inline">{nav.myPanel}</span>
                      <span className="lg:hidden">Panel</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white gap-2 whitespace-nowrap shadow-sm"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span className="hidden lg:inline">Comenzar</span>
                    <span className="lg:hidden">Iniciar</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button and Language Selector for Mobile */}
            <div className="flex sm:hidden items-center relative z-[60]">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-slate-100 border-2 border-slate-300 shadow-md min-w-[48px] min-h-[48px] rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-900" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-900" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Content */}
          <div className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 bg-white z-[9999] overflow-y-auto shadow-2xl border-t border-slate-200">
            <div className="container mx-auto px-4 py-6 pb-safe">
              <div className="mb-6 pb-4 border-b border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  {nav.language}
                </div>
                <LanguageSelector />
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-4 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-all active:scale-[0.98] min-h-[56px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-base">{item.label}</span>
                  </Link>
                ))}

                {/* Sección Ecosistema Week en mobile */}
                <div className="border-t border-slate-200 my-4" />
                <div className="px-2 mb-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ecosistema Week</div>
                </div>
                {ecosystemItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-4 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-all active:scale-[0.98] min-h-[56px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] flex items-center justify-center shrink-0 shadow-sm text-white">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-base">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                  </Link>
                ))}

                <div className="border-t border-slate-200 my-4" />
                <Link
                  href="/week-fundacion"
                  className="flex items-center gap-3 px-4 py-4 text-base font-medium text-white bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] rounded-xl shadow-md min-h-[56px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold">WEEK Fundación</div>
                    <div className="text-xs text-white/80">Fundación Humanitaria</div>
                  </div>
                </Link>

                <div className="border-t border-slate-200 my-4" />

                {/* Auth Actions */}
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {userName && (
                      <div className="px-4 py-3 bg-slate-50 rounded-xl">
                        <div className="text-sm font-medium text-slate-900">{userName}</div>
                        {userEmail && <div className="text-xs text-slate-500 mt-0.5">{userEmail}</div>}
                      </div>
                    )}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-4 text-base font-medium bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white rounded-xl shadow-md min-h-[56px]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {nav.myPanel}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors min-h-[56px]"
                    >
                      <LogOut className="w-5 h-5" />
                      {nav.signOut}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center gap-3 px-4 py-4 text-base font-medium bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white rounded-xl shadow-md min-h-[56px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircle className="w-5 h-5" />
                    Comenzar
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}
