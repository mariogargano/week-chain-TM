"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  MapPin,
  Globe,
  ArrowLeft,
  Loader2,
  Eye,
  Pause,
  Play,
  Plus,
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Property = {
  id: string
  name: string
  location: string
  country: string
  total_weeks: number
  sold_weeks: number
  status: string
  created_at: string
}

export default function AdminSupplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [countries, setCountries] = useState<{ country: string; count: number; totalWeeks: number }[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/auth"); return }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", user.email?.toLowerCase())
        .eq("status", "active")
        .single()

      if (!adminUser) { router.replace("/dashboard"); return }

      const { data: propsData } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      const props = propsData || []
      setProperties(props)

      const countryMap: Record<string, { count: number; totalWeeks: number }> = {}
      for (const p of props) {
        const c = p.country || "Sin pais"
        if (!countryMap[c]) countryMap[c] = { count: 0, totalWeeks: 0 }
        countryMap[c].count++
        countryMap[c].totalWeeks += p.total_weeks || 0
      }
      setCountries(
        Object.entries(countryMap).map(([country, data]) => ({ country, ...data }))
          .sort((a, b) => b.totalWeeks - a.totalWeeks)
      )

      setLoading(false)
    } catch (err) {
      console.error("Error:", err)
      setLoading(false)
    }
  }

  const togglePropertyStatus = async (id: string, currentStatus: string) => {
    const supabase = createClient()
    const newStatus = currentStatus === "active" ? "paused" : "active"
    await supabase.from("properties").update({ status: newStatus }).eq("id", id)
    await fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    )
  }

  const totalWeeks = properties.reduce((sum, p) => sum + (p.total_weeks || 0), 0)
  const soldWeeks = properties.reduce((sum, p) => sum + (p.sold_weeks || 0), 0)
  const activeProps = properties.filter((p) => p.status === "active").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900/50 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="icon" className="border-sky-400/30 text-sky-300 hover:bg-sky-500/10 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Gestion de Supply
              </h1>
              <p className="text-sky-300/70">Propiedades, paises y semanas disponibles</p>
            </div>
          </div>
          <Link href="/dashboard/admin/properties/new">
            <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white">
              <Plus className="h-4 w-4 mr-2" /> Nueva Propiedad
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20">
                  <Building2 className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs text-sky-300/60 uppercase">Propiedades</p>
                  <p className="text-2xl font-bold text-white">{properties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Play className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-sky-300/60 uppercase">Activas</p>
                  <p className="text-2xl font-bold text-white">{activeProps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Globe className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-sky-300/60 uppercase">Paises</p>
                  <p className="text-2xl font-bold text-white">{countries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <MapPin className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-sky-300/60 uppercase">Semanas</p>
                  <p className="text-2xl font-bold text-white">{totalWeeks}</p>
                  <p className="text-xs text-sky-300/50">{soldWeeks} vendidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Countries */}
        {countries.length > 0 && (
          <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
            <CardHeader className="border-b border-sky-400/20">
              <CardTitle className="text-lg text-white">Distribucion por Pais</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3 md:grid-cols-3">
                {countries.map((c) => (
                  <div key={c.country} className="flex items-center justify-between p-3 rounded-lg border border-sky-400/20 bg-white/5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-sky-400" />
                      <span className="font-medium text-white">{c.country}</span>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-sky-300">{c.count} prop.</p>
                      <p className="text-sky-300/60">{c.totalWeeks} sem.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties List */}
        <Card className="border-sky-400/30 bg-white/5 backdrop-blur-lg">
          <CardHeader className="border-b border-sky-400/20">
            <CardTitle className="text-lg text-white">Propiedades ({properties.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {properties.length === 0 ? (
              <div className="text-center py-12 text-sky-300/60">
                No hay propiedades registradas. Agrega la primera propiedad.
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-sky-400/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-sky-500/20">
                        <Building2 className="h-5 w-5 text-sky-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{prop.name}</p>
                        <p className="text-sm text-sky-300/60">{prop.location}, {prop.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-sky-300">{prop.total_weeks} semanas</p>
                        <p className="text-sky-300/60">{prop.sold_weeks || 0} vendidas</p>
                      </div>
                      <Badge className={prop.status === "active" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-orange-500/20 text-orange-300 border border-orange-500/30"}>
                        {prop.status === "active" ? "Activa" : "Pausada"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePropertyStatus(prop.id, prop.status)}
                        className="border-sky-400/30 text-sky-300 hover:bg-sky-500/10 bg-transparent"
                      >
                        {prop.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Link href={`/dashboard/admin/properties?id=${prop.id}`}>
                        <Button variant="outline" size="sm" className="border-sky-400/30 text-sky-300 hover:bg-sky-500/10 bg-transparent">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
