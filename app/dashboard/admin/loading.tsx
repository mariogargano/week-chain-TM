import { Loader2 } from "lucide-react"

export default function AdminDashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-slate-600">Cargando dashboard de administrador...</p>
        <p className="mt-2 text-sm text-slate-500">Esto puede tomar unos segundos</p>
      </div>
    </div>
  )
}
