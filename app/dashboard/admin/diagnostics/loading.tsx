import { Loader2 } from "lucide-react"

export default function DiagnosticsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <p className="text-lg text-slate-600">Running diagnostics...</p>
      </div>
    </div>
  )
}
