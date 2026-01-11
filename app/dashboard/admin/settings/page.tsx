"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: "WEEK-CHAIN",
    maintenanceMode: false,
    allowRegistrations: true,
    requireKYC: true,
    referralCommission1: 3,
    referralCommission2: 2,
    referralCommission3: 1,
    eliteThreshold: 24,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">System Settings</h1>
          <p className="text-slate-600 mt-2">Configuración general del sistema</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configuración general de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformName">Nombre de la Plataforma</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Mantenimiento</Label>
                <p className="text-sm text-slate-500">Desactivar acceso público temporalmente</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Registros</Label>
                <p className="text-sm text-slate-500">Habilitar nuevos registros de usuarios</p>
              </div>
              <Switch
                checked={settings.allowRegistrations}
                onCheckedChange={(checked) => setSettings({ ...settings, allowRegistrations: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requerir KYC</Label>
                <p className="text-sm text-slate-500">Verificación obligatoria para compras</p>
              </div>
              <Switch
                checked={settings.requireKYC}
                onCheckedChange={(checked) => setSettings({ ...settings, requireKYC: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral System</CardTitle>
            <CardDescription>Configuración del sistema de referidos multinivel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="commission1">Nivel 1 (%)</Label>
                <Input
                  id="commission1"
                  type="number"
                  value={settings.referralCommission1}
                  onChange={(e) => setSettings({ ...settings, referralCommission1: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission2">Nivel 2 (%)</Label>
                <Input
                  id="commission2"
                  type="number"
                  value={settings.referralCommission2}
                  onChange={(e) => setSettings({ ...settings, referralCommission2: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission3">Nivel 3 (%)</Label>
                <Input
                  id="commission3"
                  type="number"
                  value={settings.referralCommission3}
                  onChange={(e) => setSettings({ ...settings, referralCommission3: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eliteThreshold">Elite Broker Threshold (semanas vendidas)</Label>
              <Input
                id="eliteThreshold"
                type="number"
                value={settings.eliteThreshold}
                onChange={(e) => setSettings({ ...settings, eliteThreshold: Number(e.target.value) })}
              />
              <p className="text-sm text-slate-500">Número de semanas vendidas para alcanzar status Elite</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
