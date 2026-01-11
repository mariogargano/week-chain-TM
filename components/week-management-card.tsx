"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"

export function WeekManagementCard() {
  return (
    <Card className="border-indigo-200/50 bg-white/90 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          Gestión de Semanas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">Administra tus semanas NFT, reserva o pon en renta tus vacaciones</p>
        <Button asChild className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90">
          <Link href="/dashboard/user/weeks">Gestionar Semanas</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
