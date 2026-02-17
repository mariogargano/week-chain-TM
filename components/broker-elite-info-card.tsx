"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, Home, Percent, TrendingUp } from "lucide-react"

export function BrokerEliteInfoCard() {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Network className="h-5 w-5" />
          Broker Elite Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80">
            <Percent className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Comisiones hasta 6%</h4>
              <p className="text-xs text-muted-foreground">6% directo • 4%+2% referido • 3%+2%+1% red</p>
              {/* </CHANGE> */}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80">
            <Home className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Partnership Benefit</h4>
              <p className="text-xs text-muted-foreground">2 low-season weeks at 50% ownership</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80">
            <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Build Your Network</h4>
              <p className="text-xs text-muted-foreground">Earn from your referrals' sales up to 3 levels</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-purple-200">
          <p className="text-xs text-center text-muted-foreground">Upgrade to Broker Elite to unlock all benefits</p>
        </div>
      </CardContent>
    </Card>
  )
}
