"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, Download, Upload, RefreshCw, Search, FileText, Edit, AlertTriangle, Clock, Server, HardDrive, Layers, FileSpreadsheet, FolderOpen, Save, Eye, Copy, Loader2,  } from "lucide-react";

interface TableInfo {
  name: string
  count: number
  lastUpdated: string
}

interface DocumentRecord {
  id: string
  name: string
  type: string
  size: number
  url: string
  created_at: string
  uploaded_by: string
  category: string
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("master")
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState("")
  const [tableData, setTableData] = useState<any[]>([])
  const [tableColumns, setTableColumns] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Core business tables
  const businessTables = [
    { name: "users", label: "Usuarios", category: "identity" },
    { name: "properties", label: "Propiedades", category: "properties" },
    { name: "destinations", label: "Destinos", category: "properties" },
    { name: "user_certificates_v2", label: "Certificados", category: "certificates" },
    { name: "certificate_products_v2", label: "Productos SVC", category: "certificates" },
    { name: "reservation_requests", label: "Solicitudes Reserva", category: "reservations" },
    { name: "confirmed_reservations", label: "Reservas Confirmadas", category: "reservations" },
    { name: "payments", label: "Pagos", category: "finance" },
    { name: "intermediary_profiles", label: "Brokers", category: "agents" },
    { name: "legal_contracts", label: "Contratos", category: "legal" },
    { name: "seasons", label: "Temporadas", category: "catalog" },
    { name: "weeks", label: "Semanas", category: "inventory" },
  ]

  useEffect(() => {
    fetchTableStats()
    fetchDocuments()
    fetchAuditLogs()
  }, [])

  const fetchTableStats = async () => {
    setLoading(true)
    try {
      const tableStats: TableInfo[] = []
      
      for (const table of businessTables) {
        const { count } = await supabase
          .from(table.name)
          .select("*", { count: "exact", head: true })
        
        tableStats.push({
          name: table.name,
          count: count || 0,
          lastUpdated: new Date().toISOString()
        })
      }
      
      setTables(tableStats)
    } catch (error) {
      console.error("Error fetching table stats:", error)
    }
    setLoading(false)
  }

  const fetchTableData = async (tableName: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(100)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        setTableColumns(Object.keys(data[0]))
        setTableData(data)
      } else {
        setTableColumns([])
        setTableData([])
      }
      setSelectedTable(tableName)
    } catch (error) {
      console.error("Error fetching table data:", error)
    }
    setLoading(false)
  }

  const fetchDocuments = async () => {
    try {
      const { data } = await supabase
        .from("admin_documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      setDocuments(data || [])
    } catch (error) {
      // Table might not exist yet
      setDocuments([])
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const { data } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      setAuditLogs(data || [])
    } catch (error) {
      setAuditLogs([])
    }
  }

  const exportToCSV = () => {
    if (tableData.length === 0) return

    const headers = tableColumns.join(",")
    const rows = tableData.map(row => 
      tableColumns.map(col => {
        const val = row[col]
        if (val === null) return ""
        if (typeof val === "object") return JSON.stringify(val).replace(/,/g, ";")
        return String(val).replace(/,/g, ";")
      }).join(",")
    )
    
    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedTable}_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedTable) return

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",").map(h => h.trim())
      
      const rows = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(",")
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim() || null
        })
        return obj
      })

      // Upsert data
      const { error } = await supabase
        .from(selectedTable)
        .upsert(rows, { onConflict: "id" })

      if (error) throw error

      alert(`Importados ${rows.length} registros exitosamente`)
      fetchTableData(selectedTable)

      // Log the import
      await supabase.from("admin_activity_logs").insert({
        action: "csv_import",
        table_name: selectedTable,
        details: { rows_imported: rows.length },
        admin_id: (await supabase.auth.getUser()).data.user?.id
      })
    } catch (error) {
      console.error("Import error:", error)
      alert("Error al importar CSV")
    }
    setImporting(false)
    if (csvInputRef.current) csvInputRef.current.value = ""
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("admin-documents")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("admin-documents")
        .getPublicUrl(fileName)

      // Save document record
      await supabase.from("admin_documents").insert({
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        uploaded_by: user?.id,
        category: "general"
      })

      fetchDocuments()
      alert("Documento subido exitosamente")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error al subir documento")
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const updateRecord = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from(selectedTable)
        .update(updates)
        .eq("id", id)

      if (error) throw error

      // Log the edit
      await supabase.from("admin_activity_logs").insert({
        action: "record_update",
        table_name: selectedTable,
        record_id: id,
        details: { changes: updates },
        admin_id: (await supabase.auth.getUser()).data.user?.id
      })

      fetchTableData(selectedTable)
      setEditingRow(null)
      alert("Registro actualizado")
    } catch (error) {
      console.error("Update error:", error)
      alert("Error al actualizar")
    }
  }

  const filteredData = tableData.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Master Data</h1>
          <p className="text-slate-500 mt-1">Gestion centralizada de datos, importacion/exportacion y documentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTableStats} className="border-sky-500/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50">
                <Database className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Tablas</p>
                <p className="text-xl font-bold text-slate-900">{businessTables.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Layers className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Registros Total</p>
                <p className="text-xl font-bold text-slate-900">
                  {tables.reduce((sum, t) => sum + t.count, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Documentos</p>
                <p className="text-xl font-bold text-slate-900">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Server className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Estado</p>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur border border-sky-500/20">
          <TabsTrigger value="master">Master Data</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="backup">Respaldos</TabsTrigger>
        </TabsList>

        {/* Master Data Tab */}
        <TabsContent value="master" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Explorador de Tablas</CardTitle>
              <CardDescription>Selecciona una tabla para ver y editar datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {businessTables.map(table => {
                  const stats = tables.find(t => t.name === table.name)
                  return (
                    <Button
                      key={table.name}
                      variant={selectedTable === table.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchTableData(table.name)}
                      className={selectedTable === table.name ? "bg-sky-500" : "border-sky-500/20"}
                    >
                      {table.label}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {stats?.count || 0}
                      </Badge>
                    </Button>
                  )
                })}
              </div>

              {selectedTable && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar en tabla..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-sky-500/20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={exportToCSV} className="border-sky-500/20">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-auto max-h-[400px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-slate-50">
                        <TableRow>
                          {tableColumns.slice(0, 6).map(col => (
                            <TableHead key={col} className="text-xs font-semibold text-slate-700">
                              {col}
                            </TableHead>
                          ))}
                          <TableHead className="text-xs font-semibold text-slate-700">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                            </TableCell>
                          </TableRow>
                        ) : filteredData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                              No hay datos
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredData.slice(0, 50).map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-sky-50/50">
                              {tableColumns.slice(0, 6).map(col => (
                                <TableCell key={col} className="text-xs max-w-[150px] truncate">
                                  {row[col] === null ? (
                                    <span className="text-slate-300">null</span>
                                  ) : typeof row[col] === "object" ? (
                                    <span className="text-slate-400">[object]</span>
                                  ) : (
                                    String(row[col]).substring(0, 50)
                                  )}
                                </TableCell>
                              ))}
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingRow(row)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(row.id)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-sky-600" />
                  Importar CSV
                </CardTitle>
                <CardDescription>Importa datos desde un archivo CSV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="border-sky-500/20">
                    <SelectValue placeholder="Selecciona tabla destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTables.map(table => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="border-2 border-dashed border-sky-500/30 rounded-lg p-8 text-center hover:border-sky-500/50 transition-colors">
                  <FileSpreadsheet className="h-10 w-10 text-sky-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-3">Arrastra tu archivo CSV aqui</p>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => csvInputRef.current?.click()}
                    disabled={!selectedTable || importing}
                    className="border-sky-500/30"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar Archivo
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>- El archivo debe tener headers en la primera fila</p>
                  <p>- Los campos deben coincidir con las columnas de la tabla</p>
                  <p>- Registros existentes se actualizaran (upsert por ID)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-emerald-600" />
                  Exportar Datos
                </CardTitle>
                <CardDescription>Exporta datos de cualquier tabla a CSV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTable} onValueChange={(v) => fetchTableData(v)}>
                  <SelectTrigger className="border-sky-500/20">
                    <SelectValue placeholder="Selecciona tabla a exportar" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTables.map(table => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTable && (
                  <div className="p-4 rounded-lg bg-slate-50 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{selectedTable}</span>
                      <Badge>{tableData.length} registros</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      {tableColumns.length} columnas disponibles
                    </p>
                    <Button onClick={exportToCSV} className="w-full bg-emerald-500 hover:bg-emerald-600">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar CSV
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Centro de Documentos</CardTitle>
                  <CardDescription>Gestiona contratos, acuerdos y documentos legales</CardDescription>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="doc-upload"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-sky-500 hover:bg-sky-600">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Documento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay documentos subidos</p>
                  <p className="text-sm text-slate-400 mt-1">Sube tu primer documento para empezar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-sky-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-50">
                          <FileText className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-500">
                            {(doc.size / 1024).toFixed(1)} KB - {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, "_blank")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Registro de Cambios (Auditoria)</CardTitle>
              <CardDescription>Historial de modificaciones con trazabilidad completa</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay registros de auditoria</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-sky-50/50">
                      <div className={`p-2 rounded-lg ${
                        log.action === "csv_import" ? "bg-emerald-50" :
                        log.action === "record_update"? "bg-amber-50" : "bg-sky-50"
                      }`}>
                        {log.action === "csv_import" ? (
                          <Upload className="h-4 w-4 text-emerald-600" />
                        ) : log.action === "record_update" ? (
                          <Edit className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Database className="h-4 w-4 text-sky-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{log.action}</span>
                          <Badge variant="outline" className="text-xs">{log.table_name}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-sky-600" />
                  Crear Respaldo
                </CardTitle>
                <CardDescription>Genera un snapshot de la configuracion actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 border">
                    <p className="text-sm font-medium text-slate-900 mb-2">Ultimo respaldo</p>
                    <p className="text-xs text-slate-500">
                      {new Date().toLocaleDateString()} - Automatico
                    </p>
                  </div>
                  <Button className="w-full bg-sky-500 hover:bg-sky-600">
                    <Save className="h-4 w-4 mr-2" />
                    Crear Respaldo Manual
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-50/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Restaurar
                </CardTitle>
                <CardDescription>Restaura datos desde un respaldo anterior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white border border-amber-200">
                    <p className="text-sm text-amber-800">
                      La restauracion sobrescribira los datos actuales. Esta accion requiere doble confirmacion.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-amber-500/30 text-amber-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar Respaldo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Record Dialog */}
      <Dialog open={!!editingRow} onOpenChange={() => setEditingRow(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>Modifica los campos del registro. Los cambios quedan en auditoria.</DialogDescription>
          </DialogHeader>
          {editingRow && (
            <div className="space-y-4">
              {Object.entries(editingRow).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-xs text-slate-500">{key}</Label>
                  {typeof value === "object" ? (
                    <Textarea
                      defaultValue={JSON.stringify(value, null, 2)}
                      className="font-mono text-xs"
                      rows={3}
                    />
                  ) : (
                    <Input
                      defaultValue={String(value || "")}
                      className="border-sky-500/20"
                      disabled={key === "id" || key === "created_at"}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingRow(null)}>
                  Cancelar
                </Button>
                <Button className="bg-sky-500 hover:bg-sky-600" onClick={() => updateRecord(editingRow.id, editingRow)}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
