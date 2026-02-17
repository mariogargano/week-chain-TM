"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface OTAListingToggleProps {
  weekId: string
  currentStatus: boolean
}

export function OTAListingToggle({ weekId, currentStatus }: OTAListingToggleProps) {
  const [isListed, setIsListed] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/weeks/ota-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_id: weekId, listed: checked }),
      })

      if (response.ok) {
        setIsListed(checked)
      } else {
        alert("Failed to update listing status")
      }
    } catch (error) {
      console.error("[v0] OTA listing error:", error)
      alert("An error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">OTA Listing</CardTitle>
        <CardDescription>List your week on vacation rental platforms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="ota-toggle" className="cursor-pointer">
            {isListed ? "Listed on OTAs" : "Not Listed"}
          </Label>
          <Switch id="ota-toggle" checked={isListed} onCheckedChange={handleToggle} disabled={isUpdating} />
        </div>

        {isListed && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your week is listed on:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Airbnb</Badge>
                  <span className="text-sm">Connected</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Booking.com</Badge>
                  <span className="text-sm">Connected</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">VRBO</Badge>
                  <span className="text-sm">Connected</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        {!isListed && (
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Enable OTA listing to automatically sync your week with major vacation rental platforms and start earning
            rental income.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
