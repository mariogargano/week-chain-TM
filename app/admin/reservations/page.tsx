import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, DollarSign } from "lucide-react"

export default async function AdminReservationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: reservations } = await supabase
    .from("reservations")
    .select(`
      *,
      weeks (
        week_number,
        price,
        season
      ),
      properties (
        name,
        location
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold">WEEK-CHAIN Admin</h1>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signout">Sign Out</Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Reservations</h2>
          <p className="text-muted-foreground">Manage all reservations on the platform</p>
        </div>

        <div className="space-y-4">
          {reservations && reservations.length > 0 ? (
            reservations.map((reservation: any) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{reservation.properties?.name || "Property"}</CardTitle>
                      <p className="text-sm text-muted-foreground">{reservation.properties?.location}</p>
                    </div>
                    <Badge
                      variant={
                        reservation.status === "completed"
                          ? "default"
                          : reservation.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {reservation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Week {reservation.weeks?.week_number}</span>
                        <Badge variant="outline" className="text-xs">
                          {reservation.weeks?.season}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">${reservation.weeks?.price?.toLocaleString() || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {reservation.status === "pending" && (
                        <Button size="sm" variant="default">
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-muted-foreground">No reservations found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
