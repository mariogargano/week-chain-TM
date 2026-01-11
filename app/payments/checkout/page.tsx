import { Suspense } from "react"
import UnifiedCheckout from "@/components/unified-checkout"
import { Card } from "@/components/ui/card"

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">WEEK-CHAIN™ Checkout</h1>
        <p className="text-muted-foreground">The New Standard of Legal Real-Estate Tokenization</p>
      </header>

      <Suspense fallback={<CheckoutSkeleton />}>
        <UnifiedCheckout />
      </Suspense>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        WEEK-CHAIN™, S.A.P.I. de C.V. — Playa del Carmen, Quintana Roo, México
      </footer>
    </div>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 animate-pulse">
        <div className="h-8 bg-muted rounded mb-4" />
        <div className="h-32 bg-muted rounded" />
      </Card>
    </div>
  )
}
