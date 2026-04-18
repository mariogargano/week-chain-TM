import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, TrendingUp, Users } from "lucide-react"

interface PropertyStatsProps {
  property: {
    valor_total_usd: number
    recaudado_actual: number
  }
  weeks: Array<{
    status: string
    price: number
  }>
}

export function PropertyStats({ property, weeks }: PropertyStatsProps) {
  const totalWeeks = weeks.length
  const availableWeeks = weeks.filter((w) => w.status === "available").length
  const soldWeeks = weeks.filter((w) => w.status === "sold").length
  const percentageSold = totalWeeks > 0 ? (soldWeeks / totalWeeks) * 100 : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Value</span>
            </div>
            <span className="text-lg font-bold">${property.valor_total_usd?.toLocaleString() || "N/A"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Raised</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              ${property.recaudado_actual?.toLocaleString() || "0"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Available Weeks</span>
            </div>
            <span className="text-lg font-bold">
              {availableWeeks} / {totalWeeks}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Members</span>
            </div>
            <span className="text-lg font-bold">{soldWeeks}</span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">{percentageSold.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-teal-600 transition-all"
                style={{ width: `${Math.min(percentageSold, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Season Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm">Alta (High)</span>
            </div>
            <span className="text-sm font-medium">Premium</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Media (Mid)</span>
            </div>
            <span className="text-sm font-medium">Standard</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Baja (Low)</span>
            </div>
            <span className="text-sm font-medium">Value</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-sm">Empresa (Corp)</span>
            </div>
            <span className="text-sm font-medium">Business</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
