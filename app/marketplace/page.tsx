"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Search, Filter, TrendingUp, MapPin, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Property {
  id: string
  name: string
  location: string
  description: string
  valor_total_usd: number
  image_url: string
  recaudado_actual: number
}

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties")
      const data = await response.json()

      if (data.properties) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error("[v0] Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Store className="h-4 w-4" />
            Marketplace
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Discover Vacation Properties
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Browse and discover tokenized vacation properties from around the world
          </p>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          <Button className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
          <Button className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No properties available yet.</p>
            <p className="text-sm text-slate-500">Check back soon for new listings!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="border-blue-200/50 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div
                    className="h-48 rounded-lg mb-4 bg-cover bg-center"
                    style={{
                      backgroundImage: property.image_url
                        ? `url(${property.image_url})`
                        : "linear-gradient(to bottom right, rgb(191, 219, 254), rgb(221, 214, 254))",
                    }}
                  />
                  <CardTitle className="text-slate-800">{property.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-slate-600">
                    <MapPin className="h-3 w-3" />
                    {property.location}
                  </CardDescription>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{property.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Value</span>
                      <span className="text-lg font-bold text-blue-600 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {property.valor_total_usd.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Raised</span>
                      <span className="text-sm font-semibold text-green-600">
                        ${property.recaudado_actual.toLocaleString()}
                      </span>
                    </div>
                    <Link href={`/property/${property.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                        View Details & Reserve
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
