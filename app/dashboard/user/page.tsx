"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Building2, Wallet, Calendar, MapPin, Clock, Mail, FileText, Download, CreditCard } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/config/logger"

export default function UserDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("Usuario")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authMethod, setAuthMethod] = useState<"wallet" | "email" | "google">("wallet")
  const [vouchers, setVouchers] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  const [userWeeks, setUserWeeks] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [pastBookings, setPastBookings] = useState<any[]>([])

  const router = useRouter()

  useEffect(() => {
    const initDashboard = async () => {
      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        logger.info("User dashboard loaded via Supabase auth", { email: session.user.email })
        setUserEmail(session.user.email || null)
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuario")
        setUserId(session.user.id)
        setAuthMethod(session.user.app_metadata?.provider === "google" ? "google" : "email")

        await fetchDashboardData(null, session.user.id)
        setIsLoading(false)
        return
      }

      const storedWallet = localStorage.getItem("wallet_address")
      const storedName = localStorage.getItem("user_name")
      const storedUserId = localStorage.getItem("user_id")

      if (!storedWallet && !session) {
        logger.debug("No auth found, redirecting to login")
        router.push("/auth")
        return
      }

      if (storedWallet) {
        logger.info("User dashboard loaded via wallet", { wallet: storedWallet.slice(0, 8) + "..." })
        setWalletAddress(storedWallet)
        setUserName(storedName || "Usuario")
        setUserId(storedUserId)
        setAuthMethod("wallet")

        await fetchDashboardData(storedWallet, storedUserId)
      }

      setIsLoading(false)
    }

    initDashboard()
  }, [router])

  const fetchDashboardData = async (wallet: string | null, uid: string | null) => {
    const supabase = createClient()

    const reservationsQuery = wallet
      ? supabase.from("reservations").select(`*, weeks(*), properties(*)`).eq("user_wallet", wallet)
      : uid
        ? supabase.from("reservations").select(`*, weeks(*), properties(*)`).eq("user_id", uid)
        : null

    const [reservationsData] = await Promise.all([reservationsQuery])

    if (reservationsData?.data) {
      const confirmedReservations = reservationsData.data.filter((r) => r.status === "confirmed")

      const weeks = confirmedReservations.map((r) => ({
        id: r.id,
        weekNumber: r.weeks?.week_number || 1,
        season: r.weeks?.season || "standard",
        property: r.properties?.name || "Destino",
        location: r.properties?.location || "Ubicación",
        image: r.properties?.image_url || "/placeholder.svg?height=200&width=300",
        contractStatus: r.contract_signed ? "firmado" : "pendiente",
        startDate: r.weeks?.start_date,
        endDate: r.weeks?.end_date,
        contractExpiry: r.created_at
          ? new Date(new Date(r.created_at).setFullYear(new Date(r.created_at).getFullYear() + 15)).toISOString()
          : null,
      }))

      setUserWeeks(weeks)

      const now = new Date()
      const upcoming = reservationsData.data.filter((r) => r.weeks?.start_date && new Date(r.weeks.start_date) > now)
      const past = reservationsData.data.filter((r) => r.weeks?.end_date && new Date(r.weeks.end_date) < now)

      setUpcomingBookings(upcoming)
      setPastBookings(past)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF5F5] via-[#F5F0FF] to-[#F0F5FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9AA2]" />
      </div>
    )
  }

  const uniqueDestinations = new Set(userWeeks.map((w) => w.property)).size

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[#FFF5F5] via-[#F5F0FF] to-[#F0F5FF] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] flex items-center justify-center text-white text-2xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">¡Hola, {userName}!</h1>
                <div className="flex items-center gap-2 text-gray-500">
                  {authMethod === "wallet" ? (
                    <>
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm font-mono">
                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </span>
                    </>
                  ) : authMethod === "google" ? (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                      <span className="text-sm">{userEmail}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{userEmail}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Link href="/dashboard/user/certificate">
              <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mb-2">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Mi Certificado</span>
                  <span className="text-xs text-slate-500">Acceso vacacional</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] flex items-center justify-center mb-2">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">Ver Destinos</span>
                  <span className="text-xs text-slate-500">Explora opciones</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/user/request-reservation">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#C7CEEA] to-[#B5EAD7] flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">Estancias Confirmadas</span>
                  <span className="text-xs text-slate-500">{userWeeks.length} reservas</span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Estancias Confirmadas</CardDescription>
                <CardTitle className="text-2xl font-bold text-gray-900">{userWeeks.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-gray-500 text-sm">
                  <Building2 className="h-4 w-4 mr-1" />
                  En {uniqueDestinations} destinos
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardDescription>Próximas Estancias</CardDescription>
                <CardTitle className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Reservaciones activas
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardDescription>Vigencia de Acceso</CardDescription>
                <CardTitle className="text-2xl font-bold text-gray-900">15 años</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-gray-500 text-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Derecho temporal sujeto a disponibilidad
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="weeks" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur p-1 rounded-xl">
              <TabsTrigger value="weeks" className="rounded-lg">
                Reservas Confirmadas
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg">
                Solicitudes Pendientes
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg">
                Documentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weeks" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userWeeks.length > 0 ? (
                  userWeeks.map((week) => (
                    <Card
                      key={week.id}
                      className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={week.image || "/placeholder.svg"}
                          alt={week.property}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800">
                          Estancia {week.weekNumber}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900">{week.property}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {week.location}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Estado:</span>
                            <Badge variant={week.contractStatus === "firmado" ? "default" : "secondary"}>
                              {week.contractStatus === "firmado" ? "Confirmada" : "Pendiente"}
                            </Badge>
                          </div>
                          {week.contractExpiry && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Certificado vigente hasta:</span>
                              <span className="font-medium">{new Date(week.contractExpiry).getFullYear()}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full bg-white/80 backdrop-blur border-0 shadow-lg p-12 text-center">
                    <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes certificados de acceso todavía</h3>
                    <p className="text-gray-500 mb-6">
                      Explora nuestros destinos y obtén tu primer certificado de acceso vacacional
                    </p>
                    <Link href="/properties">
                      <Button className="bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] text-white">
                        Explorar Destinos
                      </Button>
                    </Link>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#FF9AA2]" />
                      Próximas Estancias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingBookings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] flex items-center justify-center text-white font-bold">
                              S{booking.weeks?.week_number || "?"}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{booking.properties?.name || "Destino"}</p>
                              <p className="text-sm text-gray-500">{booking.weeks?.start_date || "Fecha pendiente"}</p>
                            </div>
                            <Badge>Confirmado</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No tienes estancias programadas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      Historial de Estancias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pastBookings.length > 0 ? (
                      <div className="space-y-4">
                        {pastBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                              S{booking.weeks?.week_number || "?"}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{booking.properties?.name || "Destino"}</p>
                              <p className="text-sm text-gray-500">{booking.weeks?.end_date || "Fecha"}</p>
                            </div>
                            <Badge variant="secondary">Completada</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Sin historial de estancias</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Mis Documentos</CardTitle>
                  <CardDescription>Certificados y comprobantes de tus derechos de acceso temporal</CardDescription>
                </CardHeader>
                <CardContent>
                  {userWeeks.length > 0 ? (
                    <div className="space-y-4">
                      {userWeeks.map((week) => (
                        <div key={week.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#FF9AA2]" />
                            <div>
                              <p className="font-medium">Confirmación - {week.property}</p>
                              <p className="text-sm text-gray-500">Estancia {week.weekNumber}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No hay confirmaciones disponibles</p>
                      <p className="text-sm mt-2">Las confirmaciones aparecerán aquí después de aprobar ofertas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
