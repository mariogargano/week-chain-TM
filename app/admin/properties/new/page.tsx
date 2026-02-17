"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, DollarSign, MapPin, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function NewPropertyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalValue, setTotalValue] = useState<number>(0)
  const [pricePerWeek, setPricePerWeek] = useState<number>(0)

  const handleTotalValueChange = (value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setTotalValue(numValue)
    setPricePerWeek(Math.floor(numValue / 52))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const propertyData = {
      name: formData.get("name"),
      location: formData.get("location"),
      description: formData.get("description"),
      valor_total_usd: Number.parseFloat(formData.get("valor_total_usd") as string),
      image_url: formData.get("image_url"),
      status: "active",
      recaudado_actual: 0,
    }

    console.log("[v0] Creating property with data:", propertyData)

    try {
      const response = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyData),
      })

      const result = await response.json()
      console.log("[v0] Property creation response:", result)

      if (response.ok) {
        alert("Property created successfully! 52 weeks have been generated automatically.")
        router.push("/admin/properties")
      } else {
        alert(`Failed to create property: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[v0] Error creating property:", error)
      alert("An error occurred while creating the property")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="border-b bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              WEEK-CHAIN Admin
            </h1>
          </div>
          <Button variant="outline" asChild className="bg-white/90">
            <Link href="/admin/properties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Property</CardTitle>
            <CardDescription>
              Fill in the details below to add a new property to the platform. The system will automatically generate 52
              weeks and calculate the price per week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Building2 className="h-4 w-4" />
                  Basic Information
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Property Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g., Luxury Beach Villa" className="bg-white" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location *
                      </div>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      required
                      placeholder="e.g., Cancun, Mexico"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="Describe the property, its features, amenities, and what makes it special..."
                    rows={4}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_total_usd">Total Property Value (USD) *</Label>
                    <Input
                      id="valor_total_usd"
                      name="valor_total_usd"
                      type="number"
                      required
                      placeholder="1000000"
                      step="0.01"
                      min="0"
                      className="bg-white"
                      onChange={(e) => handleTotalValueChange(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Enter the total value of the property in USD</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Calculated Price per Week</Label>
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-slate-50">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="text-lg font-semibold text-slate-900">
                        {pricePerWeek.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Automatically calculated (Total Value ÷ 52 weeks)</p>
                  </div>
                </div>

                {totalValue > 0 && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">Pricing Summary</h4>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p>
                            • Total Property Value:{" "}
                            <span className="font-semibold">
                              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </p>
                          <p>
                            • Price per Week:{" "}
                            <span className="font-semibold">
                              ${pricePerWeek.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </p>
                          <p>
                            • Total Weeks: <span className="font-semibold">52 weeks/year</span>
                          </p>
                        </div>
                        <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500">
                          52 weeks will be generated automatically
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ImageIcon className="h-4 w-4" />
                  Property Image
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    placeholder="https://example.com/property-image.jpg"
                    className="bg-white"
                  />
                  <p className="text-xs text-slate-500">
                    Enter a URL for the property's main image. You can upload to a service like Imgur or use a direct
                    image link.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || totalValue <= 0}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Property...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Property & Generate Weeks
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild className="flex-1 bg-white">
                  <Link href="/admin/properties">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 border-blue-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">What happens when you create a property?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>✓ The property will be added to the platform with status "active"</p>
            <p>✓ 52 weeks will be automatically generated for the property</p>
            <p>✓ Each week will be priced at (Total Value ÷ 52)</p>
            <p>✓ Weeks will be distributed across seasons: Low, Medium, High, and Corporate</p>
            <p>✓ All weeks will start with status "available" for users to purchase</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
