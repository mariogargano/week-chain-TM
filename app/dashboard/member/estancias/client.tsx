"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, MapPin, Check, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function EstanciasClient() {
  const [estancias, setEstancias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEstancias()
  }, [])

  const fetchEstancias = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("estancias")
      .select("*")
      .eq("user_id", user.id)
      .order("check_in", { ascending: false })

    setEstancias(data || [])
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Solicitar Nueva Estancia</CardTitle>
          <CardDescription>Elige tu semana y destino favorito del calendario disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Abrir Calendario de Reservas</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {estancias.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No tienes estancias reservadas aún
            </CardContent>
          </Card>
        ) : (
          estancias.map((est) => (
            <Card key={est.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {est.property_name}
                      <Badge variant={est.status === "confirmed" ? "default" : "secondary"}>
                        {est.status === "confirmed" ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        {est.status}
                      </Badge>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" />{est.check_in} a {est.check_out}</div>
                <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" />{est.destination}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
