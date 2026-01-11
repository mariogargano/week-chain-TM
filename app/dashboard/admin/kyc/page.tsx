"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Calendar, Search, ArrowLeft, CheckCircle, XCircle, Clock, Mail, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"

export default function AdminKYCPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminKYCContent />
    </RoleGuard>
  )
}

function AdminKYCContent() {
  const router = useRouter()
  const [kycUsers, setKycUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    fetchKYCUsers()
  }, [])

  const fetchKYCUsers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("kyc_users").select("*").order("submitted_at", { ascending: false })

    if (!error && data) {
      setKycUsers(data)
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const response = await fetch("/api/admin/kyc/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kycId: id, adminId: user.id }),
    })

    if (response.ok) {
      fetchKYCUsers()
    }
  }

  const handleReject = async (id: string) => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const reason = prompt("Razón del rechazo (opcional):")

    const response = await fetch("/api/admin/kyc/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kycId: id, adminId: user.id, reason }),
    })

    if (response.ok) {
      fetchKYCUsers()
    }
  }

  const filteredKYC = kycUsers.filter((kyc) => {
    const matchesSearch =
      kyc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kyc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kyc.wallet?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === "all" || kyc.status === filter

    return matchesSearch && matchesFilter
  })

  const stats = {
    pending: kycUsers.filter((k) => k.status === "pending").length,
    approved: kycUsers.filter((k) => k.status === "approved").length,
    rejected: kycUsers.filter((k) => k.status === "rejected").length,
  }

  return (
    <>
      <Navbar user={true} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/admin")}
              className="bg-white/90 backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
                KYC Approvals
              </h1>
              <p className="text-slate-600">Review and approve KYC documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-yellow-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.pending}</div>
                <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="border-green-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.approved}</div>
                <p className="text-xs text-slate-500 mt-1">Verified users</p>
              </CardContent>
            </Card>

            <Card className="border-red-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Rejected</CardTitle>
                <XCircle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.rejected}</div>
                <p className="text-xs text-slate-500 mt-1">Not approved</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-pink-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or wallet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className={filter === "all" ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-transparent"}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("pending")}
                    className={
                      filter === "pending" ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-transparent"
                    }
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filter === "approved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("approved")}
                    className={
                      filter === "approved" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-transparent"
                    }
                  >
                    Approved
                  </Button>
                  <Button
                    variant={filter === "rejected" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("rejected")}
                    className={filter === "rejected" ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-transparent"}
                  >
                    Rejected
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <Card className="border-pink-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-slate-600">Loading KYC submissions...</p>
              </CardContent>
            </Card>
          ) : filteredKYC.length > 0 ? (
            <div className="space-y-4">
              {filteredKYC.map((kyc) => (
                <Card
                  key={kyc.id}
                  className="border-pink-200/50 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-slate-900">{kyc.name || "Unknown"}</CardTitle>
                          <Badge
                            className={
                              kyc.status === "pending"
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                : kyc.status === "approved"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                  : "bg-gradient-to-r from-red-500 to-rose-500"
                            }
                          >
                            {kyc.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {kyc.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {kyc.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {kyc.status}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          {kyc.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {kyc.email}
                            </div>
                          )}
                          {kyc.country && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {kyc.country}
                            </div>
                          )}
                          {kyc.wallet && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {kyc.wallet.slice(0, 8)}...{kyc.wallet.slice(-6)}
                              </code>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            Submitted {new Date(kyc.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {kyc.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(kyc.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(kyc.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-pink-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    {searchTerm || filter !== "all"
                      ? "No KYC submissions found matching your criteria"
                      : "No KYC submissions found"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
