"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  Menu,
  X,
  Store,
  UserCircle,
  LogOut,
  HandCoins,
  Briefcase,
  Calendar,
  ShoppingBag,
  Globe,
  TrendingUp,
  Play,
  Mail,
  MapPin,
  ChevronDown,
  Shield,
} from "lucide-react"
import { useState, useEffect } from "react"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslations } from "@/lib/i18n/use-translations"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const fallbackNav = {
  aboutUs: "Nosotros",
  myPanel: "Mi Panel",
  signOut: "Cerrar Sesión",
  language: "Idioma",
  destinations: "Nuestros Destinos",
  howItWorks: "Cómo Funciona",
  start: "COMENZAR",
  login: "Iniciar Sesión",
  createAccount: "Crear Cuenta",
  user: "Usuario",
}

const fallbackEcosystem = {
  title: "Ecosistema WEEK-CHAIN",
  subtitle: "Explora todas nuestras plataformas",
  mundoWeek: "Mundo-WEEK",
  style: { label: "WEEK-Style", desc: "Blog & Lifestyle" },
  management: { label: "WEEK-Management", desc: "Gestión de certificados" },
  agent: { label: "WEEK-Agent", desc: "Programa de comisiones 4%" },
  wedding: { label: "WEEK-Wedding", desc: "Experiencias especiales" },
  service: { label: "WEEK-Service", desc: "Servicios vacacionales" },
  booking: { label: "WEEK-Booking", desc: "Sistema de reservas" },
  vafi: { label: "WEEK-VA-FI", desc: "Protocolo financiero" },
  fundacion: { label: "WEEK-Fundación", desc: "Impacto social" },
  insurance: { label: "WEEK-Insurance", desc: "Protección vacacional" },
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

  const tAny = t as any
  const nav = {
    aboutUs: tAny?.nav?.aboutUs || fallbackNav.aboutUs,
    myPanel: tAny?.nav?.myPanel || fallbackNav.myPanel,
    signOut: tAny?.nav?.signOut || fallbackNav.signOut,
    language: tAny?.nav?.language || fallbackNav.language,
    destinations: tAny?.nav?.destinations || fallbackNav.destinations,
    howItWorks: tAny?.nav?.howItWorks || fallbackNav.howItWorks,
    start: tAny?.nav?.start || fallbackNav.start,
    login: tAny?.nav?.login || fallbackNav.login,
    createAccount: tAny?.nav?.createAccount || fallbackNav.createAccount,
    user: tAny?.nav?.user || fallbackNav.user,
  }

  const eco = {
    title: tAny?.ecosystem?.title || fallbackEcosystem.title,
    subtitle: tAny?.ecosystem?.subtitle || fallbackEcosystem.subtitle,
    mundoWeek: tAny?.ecosystem?.mundoWeek || fallbackEcosystem.mundoWeek,
    style: tAny?.ecosystem?.style || fallbackEcosystem.style,
    management: tAny?.ecosystem?.management || fallbackEcosystem.management,
    agent: tAny?.ecosystem?.agent || fallbackEcosystem.agent,
    wedding: tAny?.ecosystem?.wedding || fallbackEcosystem.wedding,
    service: tAny?.ecosystem?.service || fallbackEcosystem.service,
    booking: tAny?.ecosystem?.booking || fallbackEcosystem.booking,
    vafi: tAny?.ecosystem?.vafi || fallbackEcosystem.vafi,
    fundacion: tAny?.ecosystem?.fundacion || fallbackEcosystem.fundacion,
    insurance: tAny?.ecosystem?.insurance || fallbackEcosystem.insurance,
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
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
    return () => { document.body.style.overflow = "unset" }
  }, [mobileMenuOpen])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
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
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    return () => { subscription.unsubscribe() }
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
    { label: nav.destinations, href: "/properties", icon: <MapPin className="w-5 h-5" />, color: "text-blue-600", hoverColor: "hover:text-blue-700", bgHover: "hover:bg-blue-50" },
    { label: nav.howItWorks, href: "/proceso-completo", icon: <Play className="w-5 h-5" />, color: "text-emerald-600", hoverColor: "hover:text-emerald-700", bgHover: "hover:bg-emerald-50" },
  ]

  const ecosystemItems = [
    { label: eco.style.label, href: "/week-in-life", icon: <Store className="w-5 h-5" />, color: "text-blue-500", description: eco.style.desc },
    { label: eco.management.label, href: "/week-management", icon: <Briefcase className="w-5 h-5" />, color: "text-purple-500", description: eco.management.desc },
    { label: eco.agent.label, href: "/week-agent", icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-500", description: eco.agent.desc },
    { label: eco.wedding.label, href: "/week-wedding", icon: <Calendar className="w-5 h-5" />, color: "text-sky-500", description: eco.wedding.desc },
    { label: eco.service.label, href: "/services", icon: <Store className="w-5 h-5" />, color: "text-cyan-500", description: eco.service.desc },
    { label: eco.booking.label, href: "/week-booking", icon: <ShoppingBag className="w-5 h-5" />, color: "text-cyan-500", description: eco.booking.desc },
    { label: eco.vafi.label, href: "/va-fi", icon: <HandCoins className="w-5 h-5" />, color: "text-yellow-500", description: eco.vafi.desc },
    { label: eco.fundacion.label, href: "/week-fundacion", icon: <Globe className="w-5 h-5" />, color: "text-rose-500", description: eco.fundacion.desc },
    { label: eco.insurance.label, href: "/week-insurance", icon: <Shield className="w-5 h-5" />, color: "text-indigo-500", description: eco.insurance.desc },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-slate-200"
          : "bg-white shadow-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-md shadow-slate-400/30 ring-1 ring-slate-300/50 bg-white transition-transform group-hover:scale-105 flex-shrink-0">
              <Image
                src="/logo-wc.png"
                alt="WEEK-CHAIN Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base sm:text-xl tracking-tight">WEEK-CHAIN</span>
              <span className="text-[9px] sm:text-xs text-slate-500 font-medium hidden sm:block">Smart Vacational Certificate</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all rounded-xl ${item.bgHover} ${item.hoverColor}`}
              >
                <span className={`${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            ))}

            {/* Mundo-WEEK Dropdown */}
            <DropdownMenu open={ecosystemOpen} onOpenChange={setEcosystemOpen}>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-sky-500 transition-all rounded-xl hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50">
                  <Globe className="w-5 h-5 text-sky-600 group-hover:rotate-12 transition-transform" />
                  <span className="whitespace-nowrap">{eco.mundoWeek}</span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-2 shadow-xl border-slate-200">
                <div className="px-3 py-2 mb-2">
                  <p className="text-xs font-semibold text-slate-900">{eco.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{eco.subtitle}</p>
                </div>
                <DropdownMenuSeparator />
                {ecosystemItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.href} className="flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <span className={`${item.color} mt-0.5`}>{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/auth">
              <button className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 hover:shadow-lg transition-all rounded-xl hover:scale-105 shadow-md shadow-sky-300/40 border border-sky-300">
                <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                <span>{nav.start}</span>
              </button>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <Link href="/auth">
                <Button variant="outline" className="font-semibold text-sm px-5 py-2.5 h-auto transition-all rounded-lg bg-transparent border-slate-300 text-slate-700 hover:bg-slate-50">
                  {nav.login}
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-all">
                    <UserCircle className="w-5 h-5" />
                    <span className="max-w-[120px] truncate">{userName || nav.user}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      <span>{nav.myPanel}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>{nav.signOut}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl">
          <div
            className="container mx-auto px-4 py-4 space-y-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom,16px)]"
            style={{ maxHeight: "calc(100dvh - 64px)" }}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-slate-700 font-semibold transition-all active:scale-[0.98] ${item.bgHover} text-base`}
              >
                <span className={item.color}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="pt-4 pb-2">
              <p className="px-5 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{eco.title}</p>
            </div>

            {ecosystemItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                <span className={`${item.color} flex-shrink-0`}>{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                </div>
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t-2 border-slate-200 space-y-3">
              {!isAuthenticated ? (
                <>
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 text-white font-bold text-base min-h-[52px] py-3 hover:shadow-xl transition-all shadow-lg shadow-sky-300/50 border-2 border-sky-200 rounded-xl active:scale-[0.98]">
                      <Play className="w-6 h-6 fill-white mr-2" />
                      {nav.start}
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Link href="/auth?tab=login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[48px] font-semibold text-sm border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl">
                        <Mail className="w-5 h-5 mr-2" />
                        {nav.login}
                      </Button>
                    </Link>
                    <Link href="/auth?tab=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[48px] font-semibold text-sm border-cyan-300 text-cyan-700 hover:bg-cyan-50 rounded-xl">
                        <Shield className="w-5 h-5 mr-2" />
                        {nav.createAccount}
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="font-semibold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold">
                    <UserCircle className="w-5 h-5" />
                    <span>{nav.myPanel}</span>
                  </Link>
                  <button onClick={() => { handleSignOut(); setMobileMenuOpen(false) }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50">
                    <LogOut className="w-5 h-5" />
                    <span>{nav.signOut}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
