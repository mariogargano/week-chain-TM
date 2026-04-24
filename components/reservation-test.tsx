"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReservationFlow } from "@/components/reservation-flow"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function ReservationTest() {
  const [showFlow, setShowFlow] = useState(false)

  // Test data
  const testWeek = {
    id: "test-week-1",
    propertyId: "test-property-1",
    weekNumber: 25,
    price: 5000,
    propertyName: "Luxury Beach Villa - Miami",
  }

  return (
    <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          Test Reservation Flow
        </CardTitle>
        <CardDescription>Test the complete reservation flow with Solana escrow integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showFlow ? (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This will simulate a complete reservation including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Creating an escrow on Solana blockchain</li>
                  <li>Depositing USDC (simulated)</li>
                  <li>Confirming the transaction</li>
                  <li>Creating the reservation in database</li>
                  <li>Minting an NFT (simulated)</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="rounded-lg bg-slate-50 p-4 space-y-2">
              <h4 className="font-semibold text-slate-900">Test Reservation Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600">Property:</span>
                  <p className="font-medium">{testWeek.propertyName}</p>
                </div>
                <div>
                  <span className="text-slate-600">Week:</span>
                  <p className="font-medium">Week {testWeek.weekNumber}</p>
                </div>
                <div>
                  <span className="text-slate-600">Price:</span>
                  <p className="font-medium">${testWeek.price.toLocaleString()} USDC</p>
                </div>
                <div>
                  <span className="text-slate-600">Network:</span>
                  <p className="font-medium">Solana Devnet</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowFlow(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              Start Test Reservation
            </Button>
          </>
        ) : (
          <ReservationFlow
            weekId={testWeek.id}
            propertyId={testWeek.propertyId}
            weekNumber={testWeek.weekNumber}
            weekPrice={testWeek.price}
            propertyName={testWeek.propertyName}
            onComplete={() => {
              setTimeout(() => {
                setShowFlow(false)
                alert("Test reservation completed! Check your dashboard to see the new reservation.")
              }, 2000)
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
