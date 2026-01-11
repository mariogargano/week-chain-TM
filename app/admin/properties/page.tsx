import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"

export default async function AdminPropertiesPage() {
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

  const { data: properties } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Properties</h2>
            <p className="text-muted-foreground">Manage all properties on the platform</p>
          </div>
          <Button asChild>
            <Link href="/admin/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {properties && properties.length > 0 ? (
            properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{property.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                    </div>
                    <Badge variant={property.status === "active" ? "default" : "secondary"}>{property.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Value: </span>
                        <span className="font-semibold">${property.valor_total_usd?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Raised: </span>
                        <span className="font-semibold text-green-600">
                          ${property.recaudado_actual?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">No properties found</p>
                  <Button asChild>
                    <Link href="/admin/properties/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Property
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
