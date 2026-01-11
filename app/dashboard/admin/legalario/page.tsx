import { createClient } from "@/lib/supabase/server"
import { LegalarioFlow } from "@/components/legalario-flow"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react"

export default async function LegalarioAdminPage() {
  const supabase = await createClient()

  // Get all contracts
  const { data: contracts } = await supabase
    .from("legalario_contracts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  // Get statistics
  const { count: totalContracts } = await supabase
    .from("legalario_contracts")
    .select("*", { count: "exact", head: true })

  const { count: signedContracts } = await supabase
    .from("legalario_contracts")
    .select("*", { count: "exact", head: true })
    .eq("status", "signed")

  const { count: pendingContracts } = await supabase
    .from("legalario_contracts")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Legalario Contract Management</h1>
        <p className="text-slate-600">Manage legal agreements and signature requests</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalContracts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{signedContracts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingContracts || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Send New Contracts */}
      <LegalarioFlow />

      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contracts</CardTitle>
          <CardDescription>Latest signature requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts && contracts.length > 0 ? (
              contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{contract.signer_name}</div>
                    <div className="text-sm text-slate-500">{contract.signer_email}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(contract.created_at).toLocaleDateString()} at{" "}
                      {new Date(contract.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="uppercase">
                      {contract.role}
                    </Badge>
                    {contract.status === "signed" && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Signed
                      </Badge>
                    )}
                    {contract.status === "pending" && (
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {(contract.status === "rejected" || contract.status === "cancelled") && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        {contract.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">No contracts found. Send your first contract above!</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
