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

        console.log("[v0] Auth check - Session:", session ? "EXISTS" : "NULL")
        console.log("[v0] isAuthenticated will be set to:", !!session?.user)

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
      label: "Nuestros Destinos",
      href: "/properties",
      icon: <MapPin className="w-5 h-5" />,
      color: "text-blue-600",
      hoverColor: "hover:text-blue-700",
      bgHover: "hover:bg-blue-50",
    },
    {
      label: "Cómo Funciona",
      href: "/proceso-completo",
      icon: <Play className="w-5 h-5" />,
      color: "text-emerald-600",
      hoverColor: "hover:text-emerald-700",
      bgHover: "hover:bg-emerald-50",
    },
  ]

  const ecosystemItems = [
    {
      label: "WEEK-In Life",
      href: "/week-in-life",
      icon: <Store className="w-5 h-5" />,
      color: "text-blue-500",
      description: "Blog & Lifestyle",
    },
    {
      label: "WEEK-Management",
      href: "/week-management",
      icon: <Briefcase className="w-5 h-5" />,
      color: "text-purple-500",
      description: "Gestión de certificados",
    },
    {
      label: "WEEK-Agent",
      href: "/broker-programa",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-emerald-500",
      description: "Programa de comisiones 4%",
    },
    {
      label: "WEEK-Wedding",
      href: "/week-wedding",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-pink-500",
      description: "Experiencias especiales",
    },
    {
      label: "WEEK-Service",
      href: "/services",
      icon: <Store className="w-5 h-5" />,
      color: "text-cyan-500",
      description: "Servicios vacacionales",
    },
    {
      label: "WEEK-Booking",
      href: "/week-booking",
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "text-amber-500",
      description: "Sistema de reservas",
    },
    {
      label: "WEEK VA-FI",
      href: "/va-fi",
      icon: <HandCoins className="w-5 h-5" />,
      color: "text-yellow-500",
      description: "Protocolo financiero",
    },
    {
      label: "WEEK-Fundación",
      href: "/fundacion",
      icon: <Globe className="w-5 h-5" />,
      color: "text-rose-500",
      description: "Impacto social",
    },
    {
      label: "WEEK-Insurance",
      href: "/week-insurance",
      icon: <Shield className="w-5 h-5" />,
      color: "text-indigo-500",
      description: "Protección vacacional",
    },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-slate-200" : "bg-white shadow-md"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Enhanced logo with better spacing */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="WEEK-CHAIN Logo"
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 transition-transform group-hover:scale-105"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">WEEK-CHAIN</span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Smart Vacational Certificate</span>
              </div>
            </Link>

            {/* Desktop Navigation - Premium design with better visual hierarchy */}
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

              {/* Mundo-WEEK Dropdown - Enhanced dropdown with premium styling */}
              <DropdownMenu open={ecosystemOpen} onOpenChange={setEcosystemOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-[#FF9AA2] transition-all rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50">
                    <Globe className="w-5 h-5 text-purple-600 group-hover:rotate-12 transition-transform" />
                    <span className="whitespace-nowrap">Mundo-WEEK</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-2 shadow-xl border-slate-200">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-xs font-semibold text-slate-900">Ecosistema WEEK-CHAIN</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Explora todas nuestras plataformas</p>
                  </div>
                  <DropdownMenuSeparator />
                  {ecosystemItems.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                      >
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
            </nav>

            {/* Right Side Actions - Better authentication UI */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSelector />

              <Link href="/auth">
                <Button className="relative bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#FFC3C7] text-white font-black text-lg px-8 py-4 h-auto hover:shadow-2xl transition-all rounded-2xl animate-pulse hover:animate-none hover:scale-105 shadow-lg shadow-pink-300/50 border-2 border-pink-300">
                  <span className="relative z-10">COMENZAR</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 hover:opacity-20 rounded-2xl transition-opacity" />
                </Button>
              </Link>

              {!isAuthenticated ? (
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 font-semibold text-sm px-5 py-2.5 h-auto hover:bg-slate-50 transition-all rounded-xl bg-transparent"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all">
                      <UserCircle className="w-5 h-5" />
                      <span className="max-w-[120px] truncate">{userName || "Usuario"}</span>
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
            </div>

            {/* Mobile Menu Button - Enhanced mobile button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Premium mobile menu design */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold transition-colors ${item.bgHover}`}
                >
                  <span className={item.color}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pt-2 pb-1">
                <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mundo-WEEK</p>
              </div>

              {ecosystemItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className={item.color}>{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#FFC3C7] text-white font-black text-lg py-4 animate-pulse hover:animate-none shadow-lg shadow-pink-300/50 border-2 border-pink-300">
                    <span className="relative z-10">COMENZAR</span>
                  </Button>
                </Link>

                {!isAuthenticated ? (
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      Iniciar Sesión
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <p className="font-semibold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-semibold"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>{nav.myPanel}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50"
                    >
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
    </>
  )
}
