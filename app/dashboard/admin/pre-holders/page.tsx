'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Search, 
  RefreshCw,
  Loader2,
  AlertCircle,
  Mail,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

const glass = "bg-gradient-to-br from-sky-500/[0.08] to-blue-600/[0.04] backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-[0_4px_24px_rgba(14,165,233,0.1)]"
const glassHover = "hover:shadow-[0_8px_32px_rgba(14,165,233,0.18)] hover:border-sky-400/30 transition-all duration-300"
const glassCard = `${glass} ${glassHover}`

interface PreHolder {
  id: string
  email: string
  name: string
  phone: string
  status: string
  priority_number: number
  created_at: string
  completed_at?: string
  stripe_session_id?: string
  stripe_payment_id?: string
}

const TOTAL_SPOTS = 500
const DEPOSIT_AMOUNT = 100

export default function PreHolderManagementPage() {
  const [preHolders, setPreHolders] = useState<PreHolder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const fetchedRef = useRef(false)

  const loadPreHolders = async () => {
    try {
      setRefreshing(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('pre_holders')
        .select('*')
        .order('priority_number', { ascending: true })

      if (error) throw error
      setPreHolders(data || [])
    } catch (error: any) {
      toast.error('Error cargando pre-holders')
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    loadPreHolders()
  }, [])

  const exportToCSV = () => {
    const headers = ['#', 'Nombre', 'Email', 'Telefono', 'Deposito', 'Status', 'Fecha Registro', 'Fecha Pago']
    const rows = filteredPreHolders.map(ph => [
      ph.priority_number,
      ph.name,
      ph.email,
      ph.phone || 'N/A',
      `$${DEPOSIT_AMOUNT} USD`,
      ph.status === 'completed' ? 'Pagado' : 'Pendiente',
      new Date(ph.created_at).toLocaleDateString('es-MX'),
      ph.completed_at ? new Date(ph.completed_at).toLocaleDateString('es-MX') : 'N/A',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pre-holders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Reporte exportado')
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

  const completedCount = preHolders.filter(ph => ph.status === 'completed').length
  const pendingCount = preHolders.filter(ph => ph.status === 'pending').length
  const availableSpots = TOTAL_SPOTS - completedCount
  const totalRevenue = completedCount * DEPOSIT_AMOUNT

  const filteredPreHolders = preHolders.filter(ph => {
    const matchesSearch = 
      ph.name?.toLowerCase().includes(search.toLowerCase()) ||
      ph.email?.toLowerCase().includes(search.toLowerCase()) ||
      ph.phone?.includes(search)

    if (filter === 'completed') return matchesSearch && ph.status === 'completed'
    if (filter === 'pending') return matchesSearch && ph.status === 'pending'
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`${glass} p-10 text-center`}>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-500" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Cargando pre-holders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Pre-Holders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Depositos de $100 USD - 5% descuento - 2 meses reembolsable</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => { fetchedRef.current = false; loadPreHolders() }}
            disabled={refreshing}
            variant="outline"
            className="border-sky-500/30 text-sky-700 hover:bg-sky-50 rounded-xl text-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-[0_4px_16px_rgba(14,165,233,0.3)] text-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Availability Banner */}
      <div className={`${glass} p-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                <span className="text-2xl text-amber-600">{availableSpots}</span> de {TOTAL_SPOTS} lugares disponibles
              </p>
              <p className="text-xs text-slate-500">Programa Pre-Holder con acceso exclusivo antes del lanzamiento</p>
            </div>
          </div>
          <div className="w-full sm:w-48 h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / TOTAL_SPOTS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-sky-700">{preHolders.length}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Total Registros</p>
        </div>

        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600">{completedCount}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Pagos Completados</p>
        </div>

        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Pendientes</p>
        </div>

        <div className={`${glassCard} p-4 sm:p-5`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-violet-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Depositos Recibidos</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={`${glass} p-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, email o telefono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-sky-500/[0.05] border-sky-500/20 rounded-xl focus:border-sky-500/40 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'completed', 'pending'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs'
                  : 'border-sky-500/20 text-slate-600 hover:bg-sky-50 rounded-xl text-xs'
                }
              >
                {f === 'all' ? 'Todos' : f === 'completed' ? 'Pagados' : 'Pendientes'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-Holders Table */}
      <div className={`${glass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-sky-500/10 hover:bg-transparent">
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">#</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Pre-Holder</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm hidden sm:table-cell">Telefono</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm text-right">Deposito</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm text-right hidden md:table-cell">Fecha</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs sm:text-sm text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPreHolders.length > 0 ? (
                filteredPreHolders.map((ph) => (
                  <TableRow key={ph.id} className="border-sky-500/10 hover:bg-sky-500/[0.04]">
                    <TableCell>
                      <span className="font-mono font-bold text-sky-600 text-sm">#{ph.priority_number}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{ph.name || 'Sin nombre'}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-none">{ph.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{ph.phone || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        ph.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30 text-[10px] sm:text-xs'
                          : 'bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px] sm:text-xs'
                      }>
                        {ph.status === 'completed' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-slate-900 text-sm">{formatCurrency(DEPOSIT_AMOUNT)}</span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <span className="text-sm text-slate-500">
                        {new Date(ph.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-sky-500/10"
                        >
                          <Eye className="h-4 w-4 text-sky-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-sky-500/10"
                        >
                          <Mail className="h-4 w-4 text-sky-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="h-10 w-10 mx-auto mb-3 text-sky-300" />
                    <p className="text-sm font-medium text-slate-500">No se encontraron pre-holders</p>
                    <p className="text-xs text-slate-400 mt-1">Los registros apareceran aqui cuando los usuarios se inscriban</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className={`${glass} p-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
          <div className="text-slate-600">
            Mostrando <span className="font-semibold text-slate-900">{filteredPreHolders.length}</span> de <span className="font-semibold text-slate-900">{preHolders.length}</span> pre-holders
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Reembolso: <span className="font-semibold text-sky-700">hasta 2 meses</span></span>
            <span>Descuento: <span className="font-semibold text-emerald-600">5%</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
