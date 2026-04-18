"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign } from "lucide-react"

interface WeekRentalHistoryProps {
  weekId: string
}

export function WeekRentalHistory({ weekId }: WeekRentalHistoryProps) {
  // Mock data - in production, fetch from API
  const rentals = [
    {
      id: "1",
      guest_name: "John Doe",
      check_in: "2025-06-01",
      check_out: "2025-06-08",
      amount: 2500,
      platform: "Airbnb",
      status: "completed",
    },
    {
      id: "2",
      guest_name: "Jane Smith",
      check_in: "2025-07-15",
      check_out: "2025-07-22",
      amount: 3000,
      platform: "Booking.com",
      status: "upcoming",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental History</CardTitle>
      </CardHeader>
      <CardContent>
        {rentals.length > 0 ? (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div key={rental.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{rental.guest_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {rental.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(rental.check_in).toLocaleDateString()} -{" "}
                      {new Date(rental.check_out).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-bold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    {rental.amount.toLocaleString()}
                  </div>
                  <Badge variant={rental.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {rental.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No rental history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
