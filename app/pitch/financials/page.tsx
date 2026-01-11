"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calculator, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function FinancialsPage() {
  // Assumptions (editable)
  const [assumptions, setAssumptions] = useState({
    // Growth assumptions
    propertiesYear1: 5,
    propertiesYear2: 20,
    propertiesYear3: 50,
    avgPropertyValue: 500000,
    weeksPerProperty: 52,
    avgWeekPrice: 12000,

    // User growth
    usersYear1: 500,
    usersYear2: 2000,
    usersYear3: 8000,
    conversionRate: 0.15, // 15% of users buy

    // Revenue assumptions
    platformFee: 0.05, // 5% on sales
    managementFee: 0.15, // 15% on rentals
    brokerCommission: 0.08, // 8% total broker commissions
    avgRentalYield: 0.06, // 6% annual rental yield

    // Cost assumptions
    teamSalaries: 300000,
    marketingBudget: 200000,
    techInfra: 50000,
    legalCompliance: 100000,
    operatingExpenses: 150000,
  })

  // Calculate projections
  const calculateProjections = () => {
    const years = [
      { year: "Year 1", properties: assumptions.propertiesYear1, users: assumptions.usersYear1 },
      { year: "Year 2", properties: assumptions.propertiesYear2, users: assumptions.usersYear2 },
      { year: "Year 3", properties: assumptions.propertiesYear3, users: assumptions.usersYear3 },
    ]

    return years.map((y, index) => {
      const totalWeeks = y.properties * assumptions.weeksPerProperty
      const weeksSold = totalWeeks * 0.7 // Assume 70% sell rate
      const buyers = y.users * assumptions.conversionRate

      // Revenue streams
      const primarySalesRevenue = weeksSold * assumptions.avgWeekPrice * assumptions.platformFee
      const secondaryMarketRevenue = weeksSold * 0.3 * assumptions.avgWeekPrice * assumptions.platformFee * 0.5 // 30% resold, 50% of original price
      const managementRevenue =
        y.properties * assumptions.avgPropertyValue * assumptions.avgRentalYield * assumptions.managementFee
      const vafiInterestRevenue = 0 // VA-FI™ module not yet enabled

      const totalRevenue = primarySalesRevenue + secondaryMarketRevenue + managementRevenue + vafiInterestRevenue

      // Costs (scale with growth)
      const scaleFactor = 1 + index * 0.5 // Costs increase 50% per year
      const teamCosts = assumptions.teamSalaries * scaleFactor
      const marketingCosts = assumptions.marketingBudget * scaleFactor
      const techCosts = assumptions.techInfra * scaleFactor
      const legalCosts = assumptions.legalCompliance * (1 + index * 0.2)
      const opexCosts = assumptions.operatingExpenses * scaleFactor
      const brokerCosts = (primarySalesRevenue / assumptions.platformFee) * assumptions.brokerCommission

      const totalCosts = teamCosts + marketingCosts + techCosts + legalCosts + opexCosts + brokerCosts

      const ebitda = totalRevenue - totalCosts
      const ebitdaMargin = (ebitda / totalRevenue) * 100

      return {
        year: y.year,
        properties: y.properties,
        users: y.users,
        weeksSold,
        buyers,
        primarySalesRevenue: Math.round(primarySalesRevenue),
        secondaryMarketRevenue: Math.round(secondaryMarketRevenue),
        managementRevenue: Math.round(managementRevenue),
        vafiInterestRevenue: Math.round(vafiInterestRevenue),
        totalRevenue: Math.round(totalRevenue),
        teamCosts: Math.round(teamCosts),
        marketingCosts: Math.round(marketingCosts),
        techCosts: Math.round(techCosts),
        legalCosts: Math.round(legalCosts),
        opexCosts: Math.round(opexCosts),
        brokerCosts: Math.round(brokerCosts),
        totalCosts: Math.round(totalCosts),
        ebitda: Math.round(ebitda),
        ebitdaMargin: ebitdaMargin.toFixed(1),
      }
    })
  }

  const projections = calculateProjections()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const updateAssumption = (key: string, value: string) => {
    setAssumptions((prev) => ({
      ...prev,
      [key]: Number.parseFloat(value) || 0,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/pitch">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pitch Deck
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Financial Projections Model
          </h1>
          <p className="text-gray-600">Interactive 3-year financial model with editable assumptions</p>
        </div>

        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">VA-FI™ Module Coming Soon</p>
              <p className="text-sm text-amber-700">
                El módulo VA-FI™ no está habilitado actualmente. Los ingresos proyectados de VA-FI se muestran como $0
                hasta que el módulo esté disponible.
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Year 3 Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(projections[2].totalRevenue)}</div>
                  <p className="text-xs text-gray-500 mt-1">Total annual revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Year 3 EBITDA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(projections[2].ebitda)}</div>
                  <p className="text-xs text-gray-500 mt-1">{projections[2].ebitdaMargin}% margin</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{projections[2].properties}</div>
                  <p className="text-xs text-gray-500 mt-1">Tokenized properties</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-600">{projections[2].users.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-1">Active users</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth Trajectory</CardTitle>
                <CardDescription>3-year revenue and EBITDA projection</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Total Revenue"
                    />
                    <Line type="monotone" dataKey="ebitda" stroke="#3b82f6" strokeWidth={2} name="EBITDA" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Metrics Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Properties and user growth over 3 years</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="properties" fill="#8b5cf6" name="Properties" />
                    <Bar yAxisId="right" dataKey="users" fill="#ec4899" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Year-over-year comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Metric</th>
                        {projections.map((p) => (
                          <th key={p.year} className="text-right py-2">
                            {p.year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-medium">Total Revenue</td>
                        {projections.map((p) => (
                          <td key={p.year} className="text-right py-2 text-green-600 font-semibold">
                            {formatCurrency(p.totalRevenue)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Total Costs</td>
                        {projections.map((p) => (
                          <td key={p.year} className="text-right py-2 text-red-600">
                            {formatCurrency(p.totalCosts)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">EBITDA</td>
                        {projections.map((p) => (
                          <td key={p.year} className="text-right py-2 text-blue-600 font-semibold">
                            {formatCurrency(p.ebitda)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">EBITDA Margin</td>
                        {projections.map((p) => (
                          <td key={p.year} className="text-right py-2">
                            {p.ebitdaMargin}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Properties</td>
                        {projections.map((p) => (
                          <td key={p.year} className="text-right py-2">
                            {p.properties}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Users</td>
                        {projections.map((p) => (
                          <td key={p.year} className="text-right py-2">
                            {p.users.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Weeks Sold</td>
                        {projections.map((p) => (
                          <td key={p.year} className="text-right py-2">
                            {Math.round(p.weeksSold)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown by Stream</CardTitle>
                <CardDescription>Multiple revenue streams create diversified income</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="primarySalesRevenue" stackId="a" fill="#10b981" name="Primary Sales (5%)" />
                    <Bar dataKey="secondaryMarketRevenue" stackId="a" fill="#3b82f6" name="Secondary Market (5%)" />
                    <Bar dataKey="managementRevenue" stackId="a" fill="#8b5cf6" name="Management Fees (15%)" />
                    <Bar
                      dataKey="vafiInterestRevenue"
                      stackId="a"
                      fill="#ec4899"
                      name="VA-FI™ Interest (Próximamente)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projections.map((p) => (
                <Card key={p.year}>
                  <CardHeader>
                    <CardTitle>{p.year} Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Primary Sales (5% fee)</span>
                      <span className="font-semibold text-green-600">{formatCurrency(p.primarySalesRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Secondary Market (5% fee)</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(p.secondaryMarketRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Management Fees (15%)</span>
                      <span className="font-semibold text-purple-600">{formatCurrency(p.managementRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                      <span className="text-sm text-gray-600">VA-FI™ Interest (Próximamente)</span>
                      <span className="font-semibold text-pink-600">{formatCurrency(p.vafiInterestRevenue)}</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between items-center">
                      <span className="font-semibold">Total Revenue</span>
                      <span className="font-bold text-lg text-green-600">{formatCurrency(p.totalRevenue)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Structure by Category</CardTitle>
                <CardDescription>Operating expenses scale with growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="teamCosts" stackId="a" fill="#ef4444" name="Team Salaries" />
                    <Bar dataKey="marketingCosts" stackId="a" fill="#f97316" name="Marketing" />
                    <Bar dataKey="brokerCosts" stackId="a" fill="#eab308" name="Broker Commissions" />
                    <Bar dataKey="techCosts" stackId="a" fill="#3b82f6" name="Tech Infrastructure" />
                    <Bar dataKey="legalCosts" stackId="a" fill="#8b5cf6" name="Legal & Compliance" />
                    <Bar dataKey="opexCosts" stackId="a" fill="#6b7280" name="Operating Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projections.map((p) => (
                <Card key={p.year}>
                  <CardHeader>
                    <CardTitle>{p.year} Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Team Salaries</span>
                      <span className="font-semibold">{formatCurrency(p.teamCosts)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Marketing</span>
                      <span className="font-semibold">{formatCurrency(p.marketingCosts)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Broker Commissions</span>
                      <span className="font-semibold">{formatCurrency(p.brokerCosts)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tech Infrastructure</span>
                      <span className="font-semibold">{formatCurrency(p.techCosts)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Legal & Compliance</span>
                      <span className="font-semibold">{formatCurrency(p.legalCosts)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Operating Expenses</span>
                      <span className="font-semibold">{formatCurrency(p.opexCosts)}</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between items-center">
                      <span className="font-semibold">Total Costs</span>
                      <span className="font-bold text-lg text-red-600">{formatCurrency(p.totalCosts)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assumptions Tab */}
          <TabsContent value="assumptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Edit Assumptions
                </CardTitle>
                <CardDescription>Adjust parameters to see how they affect projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Growth Assumptions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-purple-600">Growth Parameters</h3>
                    <div className="space-y-2">
                      <Label>Year 1 Properties</Label>
                      <Input
                        type="number"
                        value={assumptions.propertiesYear1}
                        onChange={(e) => updateAssumption("propertiesYear1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year 2 Properties</Label>
                      <Input
                        type="number"
                        value={assumptions.propertiesYear2}
                        onChange={(e) => updateAssumption("propertiesYear2", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year 3 Properties</Label>
                      <Input
                        type="number"
                        value={assumptions.propertiesYear3}
                        onChange={(e) => updateAssumption("propertiesYear3", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avg Property Value ($)</Label>
                      <Input
                        type="number"
                        value={assumptions.avgPropertyValue}
                        onChange={(e) => updateAssumption("avgPropertyValue", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Revenue Assumptions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-600">Revenue Parameters</h3>
                    <div className="space-y-2">
                      <Label>Avg Week Price ($)</Label>
                      <Input
                        type="number"
                        value={assumptions.avgWeekPrice}
                        onChange={(e) => updateAssumption("avgWeekPrice", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Platform Fee (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={assumptions.platformFee}
                        onChange={(e) => updateAssumption("platformFee", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Management Fee (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={assumptions.managementFee}
                        onChange={(e) => updateAssumption("managementFee", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>User Conversion Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={assumptions.conversionRate}
                        onChange={(e) => updateAssumption("conversionRate", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Cost Assumptions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-red-600">Cost Parameters</h3>
                    <div className="space-y-2">
                      <Label>Team Salaries ($/yr)</Label>
                      <Input
                        type="number"
                        value={assumptions.teamSalaries}
                        onChange={(e) => updateAssumption("teamSalaries", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Marketing Budget ($/yr)</Label>
                      <Input
                        type="number"
                        value={assumptions.marketingBudget}
                        onChange={(e) => updateAssumption("marketingBudget", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tech Infrastructure ($/yr)</Label>
                      <Input
                        type="number"
                        value={assumptions.techInfra}
                        onChange={(e) => updateAssumption("techInfra", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Legal & Compliance ($/yr)</Label>
                      <Input
                        type="number"
                        value={assumptions.legalCompliance}
                        onChange={(e) => updateAssumption("legalCompliance", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
