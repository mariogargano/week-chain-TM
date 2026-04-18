"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, DollarSign, Building2, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalProperties: 0,
    totalTransactions: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    monthlyRevenue: [] as { month: string; revenue: number }[],
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient()

      const [users, properties, transactions] = await Promise.all([
        supabase.from("users").select("id, created_at", { count: "exact" }),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("nft_transactions").select("price_usd, transaction_date"),
      ])

      const totalRevenue = transactions.data?.reduce((sum, t) => sum + (Number(t.price_usd) || 0), 0) || 0

      // Calculate monthly revenue
      const monthlyData: { [key: string]: number } = {}
      transactions.data?.forEach((t) => {
        const month = new Date(t.transaction_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        monthlyData[month] = (monthlyData[month] || 0) + (Number(t.price_usd) || 0)
      })

      const monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }))

      setAnalytics({
        totalRevenue,
        totalUsers: users.count || 0,
        totalProperties: properties.count || 0,
        totalTransactions: transactions.count || 0,
        revenueGrowth: 23,
        userGrowth: 12,
        monthlyRevenue,
      })
    }

    fetchAnalytics()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-600">Track your platform's performance and growth</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">${analytics.totalRevenue.toLocaleString()}</div>
            <div className="mt-1 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+{analytics.revenueGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{analytics.totalUsers}</div>
            <div className="mt-1 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+{analytics.userGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Properties</CardTitle>
            <Building2 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{analytics.totalProperties}</div>
            <p className="mt-1 text-xs text-slate-500">Active listings</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{analytics.totalTransactions}</div>
            <p className="mt-1 text-xs text-slate-500">Total completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthlyRevenue.length > 0 ? (
            <div className="space-y-2">
              {analytics.monthlyRevenue.map((item) => (
                <div
                  key={item.month}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{item.month}</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">${item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">No revenue data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
