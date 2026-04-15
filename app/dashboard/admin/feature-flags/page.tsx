'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';



import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string
  flag_name: string
  enabled: boolean
  description: string
  updated_at: string
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    try {
      const res = await fetch('/api/admin/feature-flags')
      if (!res.ok) throw new Error('Failed to fetch flags')
      const data = await res.json()
      setFlags(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleFlag = async (flagName: string, currentValue: boolean) => {
    setUpdating(flagName)
    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag_name: flagName, enabled: !currentValue }),
      })
      if (!res.ok) throw new Error('Failed to update flag')
      await fetchFlags()
      toast.success(`${flagName} ${!currentValue ? 'habilitado' : 'deshabilitado'}`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Feature Flags</h1>
        <p className="text-muted-foreground">Controla que características están habilitadas</p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription>
          Los cambios toman efecto inmediatamente. El cliente verifica cada 30 segundos.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {flags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{flag.flag_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                </div>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={() => toggleFlag(flag.flag_name, flag.enabled)}
                  disabled={updating === flag.flag_name}
                />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Última actualización: {new Date(flag.updated_at).toLocaleString('es-MX')}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
