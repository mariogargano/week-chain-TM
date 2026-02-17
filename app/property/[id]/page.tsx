"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Calendar, CheckCircle, XCircle, Clock, Users, Bed, Bath } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Property {
  id: string
  name: string
  location: string
  description: string
  valor_total_usd: number
  image_url: string
  recaudado_actual: number
  status: string
  price: number
  property_type?: string
  bedrooms?: number
  bathrooms?: number
  max_guests?: number
  amenities?: string[]
  images?: string[]
}

interface Week {
  id: string
  week_number: number
  status: string
  price: number
  season: string
  start_date: string
  end_date: string
  owner_wallet: string | null
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [reserving, setReserving] = useState(false)
  const [filterSeason, setFilterSeason] = useState<string>("all")

  useEffect(() => {
    fetchPropertyDetails()
  }, [params.id])

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`)
      const data = await response.json()

      if (data.property && data.weeks) {
        setProperty(data.property)
        setWeeks(data.weeks)
      }
    } catch (error) {
      console.error("[v0] Error fetching property:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReserveWeek = async (week: Week) => {
    setReserving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth") // Changed /auth/login to /auth
        return
      }

      const { data: profile } = await supabase.from("profiles").select("wallet_address").eq("id", user.id).single()

      const walletAddress = profile?.wallet_address || user.email

      const response = await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_id: week.id,
          property_id: property?.id,
          wallet_address: walletAddress,
          amount_usdc: week.price,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Reservation successful! Your week has been reserved.")
        fetchPropertyDetails()
        setSelectedWeek(null)
      } else {
        alert("Reservation failed: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("[v0] Reservation error:", error)
      alert("Error creating reservation")
    } finally {
      setReserving(false)
    }
  }

  const getSeasonColor = (season: string) => {
    switch (season?.toLowerCase()) {
      case "winter":
        return "bg-blue-100 text-blue-700"
      case "spring":
        return "bg-green-100 text-green-700"
      case "summer":
        return "bg-orange-100 text-orange-700"
      case "fall":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "reserved":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "sold":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const filteredWeeks = filterSeason === "all" ? weeks : weeks.filter((w) => w.season?.toLowerCase() === filterSeason)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <main className="container mx-auto px-6 py-12 pt-32">
          <p className="text-center text-slate-600">Loading property details...</p>
        </main>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <main className="container mx-auto px-6 py-12 pt-32">
          <p className="text-center text-slate-600">Property not found</p>
        </main>
      </div>
    )
  }

  const mainImage = property.images?.[0] || property.image_url

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-blue-200/50 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div
                  className="h-96 rounded-lg mb-4 bg-cover bg-center"
                  style={{
                    backgroundImage: mainImage
                      ? `url(${mainImage})`
                      : "linear-gradient(to bottom right, rgb(191, 219, 254), rgb(221, 214, 254))",
                  }}
                />
                <CardTitle className="text-3xl text-slate-800">{property.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  {property.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">{property.description}</p>

                {(property.bedrooms || property.bathrooms || property.max_guests) && (
                  <div className="flex gap-4 pt-2">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms} beds</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms} baths</span>
                      </div>
                    )}
                    {property.max_guests && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{property.max_guests} guests</span>
                      </div>
                    )}
                  </div>
                )}

                {property.amenities && property.amenities.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-semibold text-slate-800 mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                      <DollarSign className="h-5 w-5" />
                      {property.valor_total_usd?.toLocaleString() || property.price?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Amount Raised</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${property.recaudado_actual?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200/50 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Available Weeks ({filteredWeeks.length})
                </CardTitle>
                <CardDescription>Select a week to reserve</CardDescription>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant={filterSeason === "all" ? "default" : "outline"}
                    onClick={() => setFilterSeason("all")}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filterSeason === "winter" ? "default" : "outline"}
                    onClick={() => setFilterSeason("winter")}
                  >
                    Winter
                  </Button>
                  <Button
                    size="sm"
                    variant={filterSeason === "spring" ? "default" : "outline"}
                    onClick={() => setFilterSeason("spring")}
                  >
                    Spring
                  </Button>
                  <Button
                    size="sm"
                    variant={filterSeason === "summer" ? "default" : "outline"}
                    onClick={() => setFilterSeason("summer")}
                  >
                    Summer
                  </Button>
                  <Button
                    size="sm"
                    variant={filterSeason === "fall" ? "default" : "outline"}
                    onClick={() => setFilterSeason("fall")}
                  >
                    Fall
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filteredWeeks.map((week) => (
                    <button
                      key={week.id}
                      onClick={() => week.status === "available" && setSelectedWeek(week)}
                      disabled={week.status !== "available"}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedWeek?.id === week.id
                          ? "border-blue-500 bg-blue-50"
                          : week.status === "available"
                            ? "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                            : "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800">Week {week.week_number}</span>
                        {getStatusIcon(week.status)}
                      </div>
                      <Badge className={`text-xs ${getSeasonColor(week.season)}`}>{week.season || "N/A"}</Badge>
                      <p className="text-sm font-semibold text-slate-700 mt-2">
                        ${week.price?.toLocaleString() || "N/A"}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-blue-200/50 bg-white/90 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle>Reservation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedWeek ? (
                  <>
                    <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                      <p className="text-sm text-slate-600">Selected Week</p>
                      <p className="text-2xl font-bold text-blue-600">Week {selectedWeek.week_number}</p>
                      <Badge className={getSeasonColor(selectedWeek.season)}>{selectedWeek.season} season</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Price</span>
                        <span className="font-semibold">${selectedWeek.price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Start Date</span>
                        <span className="text-sm">{new Date(selectedWeek.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">End Date</span>
                        <span className="text-sm">{new Date(selectedWeek.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleReserveWeek(selectedWeek)}
                      disabled={reserving}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                    >
                      {reserving ? "Processing..." : "Reserve Week"}
                    </Button>
                    <p className="text-xs text-slate-500 text-center">
                      You will need to connect your wallet and deposit USDC to complete the reservation
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Select a week to see details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
