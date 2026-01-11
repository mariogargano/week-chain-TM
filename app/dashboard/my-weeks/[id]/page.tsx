import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Home, DollarSign, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { OTAListingToggle } from "@/components/ota-listing-toggle"
import { WeekRentalHistory } from "@/components/week-rental-history"

export default async function WeekDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: week } = await supabase
    .from("weeks")
    .select(`
      *,
      properties (
        id,
        name,
        location,
        image_url,
        description
      )
    `)
    .eq("id", id)
    .single()

  if (!week || week.owner_wallet !== user.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold">WEEK-CHAIN</h1>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/my-weeks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Weeks
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {week.properties?.image_url ? (
                  <img
                    src={week.properties.image_url || "/placeholder.svg"}
                    alt={week.properties.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Home className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{week.properties?.name}</CardTitle>
                    <p className="text-muted-foreground">{week.properties?.location}</p>
                  </div>
                  <Badge variant="default">Owned</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{week.properties?.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Week Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Week Number</span>
                  <span className="font-semibold">Week {week.week_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Season</span>
                  <Badge variant="outline">{week.season}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check-in Date</span>
                  <span>{new Date(week.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check-out Date</span>
                  <span>{new Date(week.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Purchase Price</span>
                  <span className="font-bold text-lg">${week.price?.toLocaleString()}</span>
                </div>
                {week.nft_token_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">NFT Token ID</span>
                    <span className="font-mono text-xs">{week.nft_token_id}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <WeekRentalHistory weekId={id} />
          </div>

          <div className="space-y-6">
            <OTAListingToggle weekId={id} currentStatus={week.listed_on_ota || false} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href={`/properties/${week.property_id}`}>
                    <Home className="mr-2 h-4 w-4" />
                    View Property
                  </Link>
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Transfer Week
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  List for Sale
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rental Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Year</span>
                    <span className="text-xl font-bold text-green-600">$0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">All Time</span>
                    <span className="text-xl font-bold">$0</span>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    List your week on OTAs to start earning rental income
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
