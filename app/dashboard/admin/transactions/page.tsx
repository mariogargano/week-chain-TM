"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DollarSign, Calendar, Search, ArrowLeft, ExternalLink, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RoleGuard } from "@/components/role-guard"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"

export default function AdminTransactionsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminTransactionsContent />
    </RoleGuard>
  )
}

function AdminTransactionsContent() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    const fetchTransactions = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("nft_transactions")
        .select("*")
        .order("transaction_date", { ascending: false })

      if (!error && data) {
        setTransactions(data)
        const total = data.reduce((sum, t) => sum + Number(t.price_usd || 0), 0)
        setTotalRevenue(total)
      }
      setLoading(false)
    }

    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.buyer_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.nft_address?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transaction Management
              </h1>
              <p className="text-slate-600">View and manage all platform transactions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-indigo-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">All-time earnings</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{transactions.length}</div>
                <p className="text-xs text-slate-500 mt-1">Completed sales</p>
              </CardContent>
            </Card>

            <Card className="border-pink-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Average Transaction</CardTitle>
                <DollarSign className="h-5 w-5 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  ${transactions.length > 0 ? Math.round(totalRevenue / transactions.length).toLocaleString() : "0"}
                </div>
                <p className="text-xs text-slate-500 mt-1">Per transaction</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-indigo-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by transaction hash, buyer, or NFT address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <Card className="border-indigo-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-slate-600">Loading transactions...</p>
              </CardContent>
            </Card>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <Card
                  key={tx.id}
                  className="border-indigo-200/50 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-slate-900">Transaction</CardTitle>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">Completed</Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Hash:</span>
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {tx.transaction_hash?.slice(0, 16)}...{tx.transaction_hash?.slice(-8)}
                            </code>
                            {tx.transaction_hash && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {tx.buyer_address && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Buyer:</span>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {tx.buyer_address.slice(0, 8)}...{tx.buyer_address.slice(-6)}
                              </code>
                            </div>
                          )}
                          {tx.nft_address && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">NFT:</span>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {tx.nft_address.slice(0, 8)}...{tx.nft_address.slice(-6)}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${Number(tx.price_usd || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tx.transaction_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-indigo-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    {searchTerm ? "No transactions found matching your search" : "No transactions found"}
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
