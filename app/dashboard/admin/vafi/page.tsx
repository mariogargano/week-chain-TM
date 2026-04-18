import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function VAFIPage() {
  const supabase = await createClient()

  const { data: loans } = await supabase
    .from("vafi_loans")
    .select(`
      *,
      users (
        email,
        full_name
      ),
      weeks (
        week_number,
        properties (
          name,
          location
        )
      )
    `)
    .order("created_at", { ascending: false })

  const totalLoaned = loans?.reduce((sum, l) => sum + Number.parseFloat(l.loan_amount), 0) || 0
  const activeLoans = loans?.filter((l) => l.status === "active").length || 0
  const defaultedLoans = loans?.filter((l) => l.status === "defaulted").length || 0
  const totalCollateral = loans?.reduce((sum, l) => sum + Number.parseFloat(l.collateral_value), 0) || 0

  return (
    <div className="space-y-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Volver al Dashboard
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
          <p className="text-sm text-slate-600 mb-8">
            Cuando esté habilitado, aquí podrás gestionar los préstamos con certificados como colateral.
          </p>
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            Volver al Panel de Control
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
