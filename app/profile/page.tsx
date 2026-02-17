import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Bell, Settings, Ticket } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile data
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Fetch user's weeks
  const { data: userWeeks } = await supabase.from("weeks").select("*, properties(*)").eq("owner_id", user.id)

  // Fetch user's reservations
  const { data: reservations } = await supabase
    .from("reservations")
    .select("*, weeks(*, properties(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: vouchers } = await supabase
    .from("purchase_vouchers")
    .select("*, weeks(*, properties(*))")
    .eq("user_wallet", profile?.wallet_address)
    .order("created_at", { ascending: false })

  const initials = user.email?.substring(0, 2).toUpperCase() || "U"

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile?.full_name || "User Profile"}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{profile?.role || "Member"}</Badge>
            {profile?.kyc_verified && (
              <Badge variant="default" className="bg-green-600">
                <Shield className="h-3 w-3 mr-1" />
                KYC Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <User className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Weeks Owned</CardTitle>
                <CardDescription>Total vacation weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{userWeeks?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificados de Compra</CardTitle>
                <CardDescription>Compras completadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{vouchers?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reservations</CardTitle>
                <CardDescription>Active bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{reservations?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions and reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vouchers?.slice(0, 5).map((voucher) => (
                  <div key={voucher.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <Ticket className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{voucher.weeks?.properties?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Semana {voucher.weeks?.week_number} - {voucher.payment_method?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={voucher.status === "redeemed" ? "default" : "secondary"}>
                      {voucher.status === "pending" ? "Pendiente" : "Canjeado"}
                    </Badge>
                  </div>
                ))}
                {(!vouchers || vouchers.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue={profile?.full_name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue={profile?.phone || ""} />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>Complete identity verification to unlock all features</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.kyc_verified ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Your account is verified</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Complete KYC verification to access advanced features and DAO governance.
                  </p>
                  <Button>Start Verification</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reservation Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about booking changes</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">DAO Proposals</p>
                  <p className="text-sm text-muted-foreground">Alerts for new governance proposals</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Updates</p>
                  <p className="text-sm text-muted-foreground">News and promotional content</p>
                </div>
                <Button variant="outline" size="sm">
                  Disable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
