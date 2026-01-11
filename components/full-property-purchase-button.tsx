"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface FullPropertyPurchaseButtonProps {
  propertyId: string
  propertyName: string
  propertyLocation: string
}

export function FullPropertyPurchaseButton({
  propertyId,
  propertyName,
  propertyLocation,
}: FullPropertyPurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      // Redirect to checkout or open purchase dialog
      window.location.href = `/checkout?propertyId=${propertyId}`
    } catch (error) {
      console.error("[v0] Error iniciando compra:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading}
      size="lg"
      className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] hover:from-[#FF8A92] hover:to-[#FFA7A2] text-white"
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      {isLoading ? "Procesando..." : "Comprar Propiedad Completa"}
    </Button>
  )
}
