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
      label: "WEEK-Style",
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
      href: "/week-agent",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-emerald-500",
      description: "Programa de comisiones 4%",
    },
    {
      label: "WEEK-Wedding",
      href: "/week-wedding",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-sky-500",
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
      color: "text-cyan-500",
      description: "Sistema de reservas",
    },
    {
      label: "WEEK-VA-FI",
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

              <Link href="/auth">
                <button className="group flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 hover:shadow-lg transition-all rounded-xl hover:scale-105 shadow-md shadow-sky-300/40 border border-sky-300">
                  <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span>COMENZAR</span>
                </button>
              </Link>
            </nav>

            {/* Right Side Actions - Solo si esta autenticado */}
            <div className="hidden lg:flex items-center gap-3">
              {!isAuthenticated ? (
                <Link href="/auth">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 font-semibold text-sm px-5 py-2.5 h-auto hover:bg-slate-50 transition-all rounded-lg bg-transparent"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-all">
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
          <div className="lg:hidden border-t border-slate-200 bg-background shadow-xl">
            <div className="container mx-auto px-4 py-4 space-y-1 max-h-[calc(100vh-64px)] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom,16px)]">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-slate-700 font-semibold transition-all active:scale-[0.98] ${item.bgHover} text-base`}
                >
                  <span className={`${item.color}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pt-4 pb-2">
                <p className="px-5 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Ecosistema WEEK</p>
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
                    {/* Google Sign In Button - Mobile */}
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false)
                        const supabase = createClient()
                        await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                            queryParams: { access_type: "offline", prompt: "consent" },
                          },
                        })
                      }}
                      className="w-full flex items-center justify-center gap-3 px-5 py-3 min-h-[48px] bg-background border-2 border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar con Google
                    </button>

                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 text-primary-foreground font-bold text-base min-h-[48px] py-3 hover:shadow-xl transition-all shadow-lg shadow-sky-300/50 border-2 border-sky-200 rounded-xl active:scale-[0.98] mt-3">
                        <Play className="w-6 h-6 fill-white mr-2" />
                        COMENZAR CON EMAIL
                      </Button>
                    </Link>
                  </>
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
