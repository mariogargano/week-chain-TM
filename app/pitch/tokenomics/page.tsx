import { ArrowLeft, Coins, Lock, TrendingUp, Users, Zap, Target, Shield, Flame } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function TokenomicsPage() {
  const totalSupply = 1000000000 // 1 billion WEEK tokens

  const distribution = [
    {
      name: "Public Sale",
      percentage: 40,
      amount: 400000000,
      color: "bg-blue-500",
      description: "Available to public participants",
    },
    {
      name: "Team & Advisors",
      percentage: 20,
      amount: 200000000,
      color: "bg-purple-500",
      description: "4-year vesting, 1-year cliff",
    },
    {
      name: "Ecosystem Fund",
      percentage: 15,
      amount: 150000000,
      color: "bg-green-500",
      description: "Community rewards & grants",
    },
    {
      name: "Liquidity Pool",
      percentage: 15,
      amount: 150000000,
      color: "bg-orange-500",
      description: "DEX liquidity provision",
    },
    {
      name: "Early Participants",
      percentage: 10,
      amount: 100000000,
      color: "bg-pink-500",
      description: "2-year vesting",
    },
  ]

  const utilities = [
    { icon: Coins, title: "Payment Currency", description: "Primary currency for purchasing tokenized vacation weeks" },
    { icon: TrendingUp, title: "Staking Rewards", description: "Earn 8-12% APY by staking WEEK tokens" },
    { icon: Users, title: "Governance Rights", description: "Vote on platform decisions and property additions" },
    { icon: Zap, title: "Fee Discounts", description: "50% discount on platform fees for WEEK holders" },
    { icon: Target, title: "Priority Access", description: "Early access to new property launches" },
    {
      icon: Shield,
      title: "VA-FI™ Collateral (Próximamente)",
      description:
        "El módulo VA-FI™ no está habilitado actualmente. Esta funcionalidad estará disponible próximamente.",
    },
  ]

  const valueAccrual = [
    {
      mechanism: "Transaction Burn",
      rate: "0.5%",
      description: "Every transaction burns 0.5% of WEEK tokens, reducing supply over time",
    },
    {
      mechanism: "Buyback & Burn",
      rate: "20% of profits",
      description: "Platform uses 20% of quarterly profits to buy and burn WEEK",
    },
    {
      mechanism: "Staking Lock-up",
      rate: "30% of supply",
      description: "Estimated 30% of tokens locked in staking, reducing circulating supply",
    },
    { mechanism: "Liquidity Mining", rate: "5% APY", description: "Rewards for providing liquidity on DEXs" },
  ]

  const vestingSchedule = [
    { group: "Public Sale", cliff: "0 months", vesting: "Immediate", unlock: "100% at TGE" },
    { group: "Early Participants", cliff: "6 months", vesting: "18 months linear", unlock: "25% at 6mo, then monthly" },
    {
      group: "Team & Advisors",
      cliff: "12 months",
      vesting: "36 months linear",
      unlock: "0% first year, then monthly",
    },
    { group: "Ecosystem Fund", cliff: "0 months", vesting: "48 months linear", unlock: "Monthly release for grants" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/pitch">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pitch Deck
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WEEK Token Economics
          </h1>
          <p className="text-lg text-muted-foreground">Sustainable tokenomics designed for long-term value accrual</p>
        </div>

        {/* Token Overview */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-blue-600" />
              Token Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Token Name</p>
                <p className="text-2xl font-bold">WEEK</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Blockchain</p>
                <p className="text-2xl font-bold">Solana</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                <p className="text-2xl font-bold">1B</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Initial Price</p>
                <p className="text-2xl font-bold">$0.10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
            <CardDescription>How the 1 billion WEEK tokens are allocated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distribution.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{item.percentage}%</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({(item.amount / 1000000).toFixed(0)}M tokens)
                      </span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-3 mb-1" />
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Utility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Token Utility</CardTitle>
            <CardDescription>Multiple use cases driving demand for WEEK tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {utilities.map((utility) => (
                <div key={utility.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <utility.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{utility.title}</h3>
                    <p className="text-sm text-muted-foreground">{utility.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Value Accrual Mechanisms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-600" />
              Value Accrual Mechanisms
            </CardTitle>
            <CardDescription>Deflationary mechanisms designed to increase token value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {valueAccrual.map((item) => (
                <div key={item.mechanism} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{item.mechanism}</h3>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {item.rate}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                Projected Token Burn
              </h3>
              <p className="text-muted-foreground mb-4">Based on projected transaction volume and buyback schedule</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Year 1</p>
                  <p className="text-2xl font-bold text-orange-600">5M tokens</p>
                  <p className="text-xs text-muted-foreground">0.5% of supply</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year 2</p>
                  <p className="text-2xl font-bold text-orange-600">15M tokens</p>
                  <p className="text-xs text-muted-foreground">1.5% of supply</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year 3</p>
                  <p className="text-2xl font-bold text-orange-600">30M tokens</p>
                  <p className="text-xs text-muted-foreground">3% of supply</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vesting Schedule */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-purple-600" />
              Vesting Schedule
            </CardTitle>
            <CardDescription>Aligned incentives with long-term project success</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Group</th>
                    <th className="text-left py-3 px-4">Cliff Period</th>
                    <th className="text-left py-3 px-4">Vesting Duration</th>
                    <th className="text-left py-3 px-4">Unlock Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  {vestingSchedule.map((item) => (
                    <tr key={item.group} className="border-b">
                      <td className="py-3 px-4 font-medium">{item.group}</td>
                      <td className="py-3 px-4">{item.cliff}</td>
                      <td className="py-3 px-4">{item.vesting}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{item.unlock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Token Valuation Model */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Token Valuation Model</CardTitle>
            <CardDescription>Conservative projections based on platform metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Year 1 Target</p>
                  <p className="text-3xl font-bold text-blue-600">$0.15</p>
                  <p className="text-sm text-muted-foreground mt-1">50% increase from launch</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Year 2 Target</p>
                  <p className="text-3xl font-bold text-purple-600">$0.35</p>
                  <p className="text-sm text-muted-foreground mt-1">3.5x from launch</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Year 3 Target</p>
                  <p className="text-3xl font-bold text-pink-600">$0.75</p>
                  <p className="text-sm text-muted-foreground mt-1">7.5x from launch</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2">
                <h3 className="font-bold text-lg mb-4">Valuation Assumptions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Revenue Drivers:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 50 properties tokenized by Year 3</li>
                      <li>• $50M in annual transaction volume</li>
                      <li>• 10,000+ active users</li>
                      <li>• $2.5M in platform fees</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Token Metrics:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 30% of supply staked (locked)</li>
                      <li>• 50M tokens burned cumulatively</li>
                      <li>• P/S ratio of 15-20x (industry standard)</li>
                      <li>• Market cap: $750M at $0.75/token</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Interested in WEEK Token?</h2>
              <p className="text-muted-foreground mb-6">Join our whitelist for early access to the token sale</p>
              <div className="flex gap-4 justify-center">
                <Link href="/pitch">
                  <Button size="lg" variant="outline">
                    View Full Pitch Deck
                  </Button>
                </Link>
                <Link href="/pitch/financials">
                  <Button size="lg">Financial Projections</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
