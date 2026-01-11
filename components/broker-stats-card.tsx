"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Network, Home, Users, DollarSign } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BrokerStatsCardProps {
  referrals: any[]
}

export function BrokerStatsCard({ referrals }: BrokerStatsCardProps) {
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()

  const monthlyReferrals = referrals.filter((ref) => {
    const refDate = new Date(ref.created_at)
    return refDate.getMonth() === thisMonth && refDate.getFullYear() === thisYear
  })

  const monthlyCommission = monthlyReferrals.reduce((sum, ref) => sum + (ref.weeks?.price || 0) * 0.05, 0)

  const completedReferrals = referrals.filter((ref) => ref.status === "completed")
  const conversionRate = referrals.length > 0 ? (completedReferrals.length / referrals.length) * 100 : 0

  const level1Referrals = referrals.filter((ref) => ref.referral_level === 1 || !ref.referral_level)
  const level2Referrals = referrals.filter((ref) => ref.referral_level === 2)
  const level3Referrals = referrals.filter((ref) => ref.referral_level === 3)

  const level1Commission = level1Referrals.reduce((sum, ref) => sum + (ref.weeks?.price || 0) * 0.05, 0)
  const level2Commission = level2Referrals.reduce((sum, ref) => sum + (ref.weeks?.price || 0) * 0.02, 0)
  const level3Commission = level3Referrals.reduce((sum, ref) => sum + (ref.weeks?.price || 0) * 0.01, 0)

  const totalCommission = level1Commission + level2Commission + level3Commission

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Métricas de Rendimiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Este Mes</span>
            <span className="text-lg font-bold">{monthlyReferrals.length} referidos</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Comisión Mensual</span>
            <span className="text-lg font-bold text-green-600">${monthlyCommission.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tasa de Conversión</span>
            <span className="text-lg font-bold">{conversionRate.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ventas Completadas</span>
            <span className="text-lg font-bold">{completedReferrals.length}</span>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-semibold">Comisiones por Nivel</h4>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600">Nivel 1 (5%)</span>
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-blue-600">${level1Commission.toLocaleString()}</span>
              </div>
              <Progress value={(level1Commission / (totalCommission || 1)) * 100} className="h-2 bg-blue-100" />
              <p className="text-xs text-muted-foreground mt-1">{level1Referrals.length} ventas directas</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-600">Nivel 2 (2%)</span>
                  <Users className="h-3 w-3 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-purple-600">${level2Commission.toLocaleString()}</span>
              </div>
              <Progress value={(level2Commission / (totalCommission || 1)) * 100} className="h-2 bg-purple-100" />
              <p className="text-xs text-muted-foreground mt-1">{level2Referrals.length} ventas de referidos</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-600">Nivel 3 (1%)</span>
                  <Users className="h-3 w-3 text-indigo-600" />
                </div>
                <span className="text-sm font-bold text-indigo-600">${level3Commission.toLocaleString()}</span>
              </div>
              <Progress value={(level3Commission / (totalCommission || 1)) * 100} className="h-2 bg-indigo-100" />
              <p className="text-xs text-muted-foreground mt-1">{level3Referrals.length} ventas de la red</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold">Total Acumulado</span>
              </div>
              <span className="text-lg font-bold text-green-600">${totalCommission.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold">Beneficio Broker Elite</span>
          </div>
          <p className="text-xs text-muted-foreground">
            2 semanas de temporada baja como beneficio exclusivo de WEEK-CHAIN. Úsalas para vacaciones personales o
            réntalas para generar ingresos pasivos adicionales.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
