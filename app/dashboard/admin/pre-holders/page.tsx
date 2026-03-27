'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Users } from 'lucide-react'
import { toast } from 'sonner'

interface PreHolder {
  id: string
  email: string
  name: string
  phone: string
  tier: string
  status: string
  priority_number: number
  created_at: string
  completed_at?: string
}

export default function PreHolderManagementPage() {
  const [preHolders, setPreHolders] = useState<PreHolder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreHolders()
  }, [])

  const loadPreHolders = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('pre_holders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPreHolders(data || [])
    } catch (error: any) {
      toast.error('Error cargando pre-holders')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Priority', 'Name', 'Email', 'Phone', 'Tier', 'Status', 'Date']
    const rows = preHolders.map(ph => [
      ph.priority_number,
      ph.name,
      ph.email,
      ph.phone,
      ph.tier,
      ph.status,
      new Date(ph.created_at).toLocaleDateString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pre-holders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: preHolders.length,
    completed: preHolders.filter(ph => ph.status === 'completed').length,
    pending: preHolders.filter(ph => ph.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pre-Holders Management</h1>
          <p className="text-slate-600 mt-1">Gestiona todos los pre-holders del programa</p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pre-Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagos Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Holders List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Cargando...</p>
          ) : preHolders.length === 0 ? (
            <p className="text-slate-500">No hay pre-holders aun</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preHolders.map(ph => (
                    <TableRow key={ph.id}>
                      <TableCell className="font-mono font-bold text-cyan-600">
                        #{ph.priority_number}
                      </TableCell>
                      <TableCell>{ph.name}</TableCell>
                      <TableCell className="text-sm">{ph.email}</TableCell>
                      <TableCell className="text-sm">{ph.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ph.tier}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ph.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {ph.status === 'completed' ? '✓ Pagado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(ph.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
