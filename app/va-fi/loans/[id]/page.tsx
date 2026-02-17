import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function LoanDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: loan } = await supabase
    .from("vafi_loans")
    .select("*, nft_mints(*, weeks(*))")
    .eq("id", params.id)
    .eq("borrower_id", user.id)
    .single()

  if (!loan) {
    redirect("/va-fi")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Módulo VA-FI™ No Disponible</h1>
            <p className="text-slate-700 mb-6 max-w-md mx-auto">
              El módulo VA-FI™ no está habilitado actualmente. Esta funcionalidad estará disponible próximamente.
            </p>
            <Button asChild>
              <Link href="/properties">Ver Propiedades Disponibles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
