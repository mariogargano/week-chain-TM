"use client";
import { useState, useEffect } from "react";
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

import { FileText, CheckCircle, XCircle, Clock, Search, Send, Download, Eye, QrCode, Shield, Hash, Calendar, FileSignature, Stamp, Lock, RefreshCw, Plus, Copy, ExternalLink, Loader2, Scale, Verified,  } from "lucide-react";

interface Contract {
  id: string
  signer_name: string
  signer_email: string
  role: string
  status: string
  created_at: string
  signed_at?: string
  document_url?: string
  folio?: string
  sha256_hash?: string
  nom151_certified?: boolean
  certified_at?: string
  certified_by?: string
}

interface ContractTemplate {
  id: string
  name: string
  description: string
  version: string
  type: string
  content: string
  active: boolean
  created_at: string
}

export default function LegalarioAdminPage() {
  const [activeTab, setActiveTab] = useState("contracts")
  const [loading, setLoading] = useState(true)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showNewContract, setShowNewContract] = useState(false)
  const [sending, setSending] = useState(false)
  const [newContract, setNewContract] = useState({
    signer_name: "",
    signer_email: "",
    role: "member",
    template_id: ""
  })
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    signed: 0,
    pending: 0,
    rejected: 0,
    nom151Certified: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchContracts()
    fetchTemplates()
  }, [])

  const fetchContracts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("legal_contracts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error

      setContracts(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      const signed = data?.filter(c => c.status === "signed").length || 0
      const pending = data?.filter(c => c.status === "pending").length || 0
      const rejected = data?.filter(c => c.status === "rejected").length || 0
      const nom151Certified = data?.filter(c => c.nom151_certified).length || 0
      
      setStats({ total, signed, pending, rejected, nom151Certified })
    } catch (error) {
      console.error("Error fetching contracts:", error)
    }
    setLoading(false)
  }

  const fetchTemplates = async () => {
    try {
      const { data } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("active", true)
        .order("name")

      setTemplates(data || [])
    } catch (error) {
      // Table might not exist
      setTemplates([])
    }
  }

  const sendContract = async () => {
    if (!newContract.signer_name || !newContract.signer_email) return

    setSending(true)
    try {
      // Create contract record
      const { data: contract, error } = await supabase
        .from("legal_contracts")
        .insert({
          signer_name: newContract.signer_name,
          signer_email: newContract.signer_email,
          role: newContract.role,
          status: "pending",
          template_id: newContract.template_id || null
        })
        .select()
        .single()

      if (error) throw error

      // Call Legalario API to send signature request
      const response = await fetch("/api/legalario/send-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          signerName: newContract.signer_name,
          signerEmail: newContract.signer_email,
          role: newContract.role
        })
      })

      if (!response.ok) throw new Error("Failed to send contract")

      setShowNewContract(false)
      setNewContract({ signer_name: "", signer_email: "", role: "member", template_id: "" })
      fetchContracts()
      alert("Contrato enviado exitosamente")
    } catch (error) {
      console.error("Error sending contract:", error)
      alert("Error al enviar contrato")
    }
    setSending(false)
  }

  const generateNOM151Certificate = async (contractId: string) => {
    try {
      const response = await fetch("/api/legalario/nom151-certify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId })
      })

      if (!response.ok) throw new Error("Certification failed")

      fetchContracts()
      alert("Certificacion NOM-151 generada exitosamente")
    } catch (error) {
      console.error("Error certifying:", error)
      alert("Error al certificar")
    }
  }

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.signer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.signer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.folio?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Firmado</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border border-red-200"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Legalario - Firma Digital</h1>
          <p className="text-slate-500 mt-1">Gestion de contratos y certificacion NOM-151</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchContracts} className="border-sky-500/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setShowNewContract(true)} className="bg-sky-500 hover:bg-sky-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contrato
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50">
                <FileText className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Firmados</p>
                <p className="text-xl font-bold text-emerald-600">{stats.signed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pendientes</p>
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Rechazados</p>
                <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <Stamp className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">NOM-151</p>
                <p className="text-xl font-bold text-violet-600">{stats.nom151Certified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur border border-sky-500/20">
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="nom151">NOM-151 Sellado</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="verify">Verificador</TabsTrigger>
        </TabsList>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre, email o folio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-sky-500/20"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] border-sky-500/20">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="signed">Firmados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Firmante</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>NOM-151</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-500" />
                        </TableCell>
                      </TableRow>
                    ) : filteredContracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No hay contratos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContracts.map(contract => (
                        <TableRow key={contract.id} className="hover:bg-sky-50/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{contract.signer_name}</p>
                              <p className="text-xs text-slate-500">{contract.signer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{contract.role}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(contract.status)}</TableCell>
                          <TableCell>
                            {contract.nom151_certified ? (
                              <Badge className="bg-violet-100 text-violet-700 border border-violet-200">
                                <Verified className="h-3 w-3 mr-1" />
                                Certificado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-400">No certificado</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(contract.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedContract(contract)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {contract.status === "signed" && !contract.nom151_certified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generateNOM151Certificate(contract.id)}
                                  className="h-8 w-8 p-0 text-violet-600 hover:text-violet-700"
                                >
                                  <Stamp className="h-4 w-4" />
                                </Button>
                              )}
                              {contract.document_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(contract.document_url, "_blank")}
                                  className="h-8 w-8 p-0"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOM-151 Tab */}
        <TabsContent value="nom151" className="space-y-4">
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-50/50 to-white backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-100">
                  <Stamp className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <CardTitle>Certificacion NOM-151</CardTitle>
                  <CardDescription>Sellado de tiempo y constancia de conservacion digital</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* NOM-151 Info Banner */}
              <div className="p-4 rounded-lg bg-violet-100/50 border border-violet-200">
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-violet-900">Norma Oficial Mexicana NOM-151-SCFI-2016</p>
                    <p className="text-sm text-violet-700 mt-1">
                      Requisitos que deben observarse para la conservacion de mensajes de datos y digitalizacion de documentos.
                      El sellado de tiempo garantiza la integridad y fecha cierta del documento.
                    </p>
                  </div>
                </div>
              </div>

              {/* Certified Documents */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Documentos Certificados</h3>
                <div className="space-y-3">
                  {contracts.filter(c => c.nom151_certified).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Stamp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p>No hay documentos certificados NOM-151</p>
                    </div>
                  ) : (
                    contracts.filter(c => c.nom151_certified).map(contract => (
                      <div key={contract.id} className="p-4 rounded-lg border border-violet-200 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-violet-50">
                              <FileSignature className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{contract.signer_name}</p>
                              <p className="text-sm text-slate-500">{contract.signer_email}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Certificado: {contract.certified_at ? new Date(contract.certified_at).toLocaleString() : "-"}
                                </span>
                                {contract.folio && (
                                  <span className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    Folio: {contract.folio}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-violet-100 text-violet-700">
                              <Verified className="h-3 w-3 mr-1" />
                              NOM-151
                            </Badge>
                            {contract.sha256_hash && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(contract.sha256_hash || "")}
                                className="text-xs h-7"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copiar Hash
                              </Button>
                            )}
                          </div>
                        </div>
                        {contract.sha256_hash && (
                          <div className="mt-3 p-2 rounded bg-slate-50 font-mono text-xs text-slate-600 break-all">
                            SHA256: {contract.sha256_hash}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Certification */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Pendientes de Certificar</h3>
                <div className="space-y-2">
                  {contracts.filter(c => c.status === "signed" && !c.nom151_certified).length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Todos los contratos firmados estan certificados
                    </p>
                  ) : (
                    contracts.filter(c => c.status === "signed" && !c.nom151_certified).map(contract => (
                      <div key={contract.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                        <div>
                          <p className="font-medium text-slate-900">{contract.signer_name}</p>
                          <p className="text-xs text-slate-500">Firmado el {new Date(contract.signed_at || contract.created_at).toLocaleDateString()}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => generateNOM151Certificate(contract.id)}
                          className="bg-violet-500 hover:bg-violet-600"
                        >
                          <Stamp className="h-4 w-4 mr-2" />
                          Certificar
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plantillas de Contratos</CardTitle>
                  <CardDescription>Gestiona las versiones de contratos y clausulas</CardDescription>
                </div>
                <Button className="bg-sky-500 hover:bg-sky-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "Contrato SVC Member", type: "member", version: "2.1", active: true },
                  { name: "Contrato Owner/Partner", type: "owner", version: "1.5", active: true },
                  { name: "Contrato Broker", type: "broker", version: "1.3", active: true },
                  { name: "Acuerdo de Confidencialidad", type: "nda", version: "1.0", active: true },
                  { name: "Terminos y Condiciones", type: "terms", version: "3.0", active: true },
                  { name: "Aviso de Privacidad", type: "privacy", version: "2.0", active: true },
                ].map((template, idx) => (
                  <Card key={idx} className="border-slate-200 hover:border-sky-500/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-sky-50">
                            <FileText className="h-5 w-5 text-sky-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{template.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{template.type}</Badge>
                              <span className="text-xs text-slate-500">v{template.version}</span>
                            </div>
                          </div>
                        </div>
                        {template.active && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">Activo</Badge>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Descargar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verify Tab */}
        <TabsContent value="verify" className="space-y-4">
          <Card className="border-sky-500/20 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-100">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Verificador de Documentos</CardTitle>
                  <CardDescription>Valida la autenticidad e integridad de contratos firmados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verify by Hash */}
              <div>
                <Label className="text-sm font-medium">Verificar por Hash SHA256</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ingresa el hash SHA256 del documento..."
                    className="font-mono text-sm border-sky-500/20"
                  />
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verificar
                  </Button>
                </div>
              </div>

              {/* Verify by QR */}
              <div className="border-t pt-6">
                <Label className="text-sm font-medium">Verificar por QR o Folio</Label>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-8 border-2 border-dashed rounded-lg text-center hover:border-sky-500/50 transition-colors cursor-pointer">
                    <QrCode className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Arrastra o sube imagen de QR</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG hasta 5MB</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-slate-500">Buscar por Folio</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="Ej: WC-2024-00123" className="border-sky-500/20" />
                        <Button variant="outline" className="border-sky-500/20">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Buscar por Email del Firmante</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="correo@ejemplo.com" className="border-sky-500/20" />
                        <Button variant="outline" className="border-sky-500/20">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Result Placeholder */}
              <div className="p-6 rounded-lg bg-slate-50 border text-center">
                <Lock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Ingresa un hash, folio o QR para verificar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Contract Dialog */}
      <Dialog open={showNewContract} onOpenChange={setShowNewContract}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Nuevo Contrato</DialogTitle>
            <DialogDescription>Envia un contrato para firma digital via Legalario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Firmante</Label>
              <Input
                value={newContract.signer_name}
                onChange={(e) => setNewContract({ ...newContract, signer_name: e.target.value })}
                placeholder="Nombre completo"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email del Firmante</Label>
              <Input
                type="email"
                value={newContract.signer_email}
                onChange={(e) => setNewContract({ ...newContract, signer_email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tipo de Contrato</Label>
              <Select value={newContract.role} onValueChange={(v) => setNewContract({ ...newContract, role: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Contrato Member (SVC)</SelectItem>
                  <SelectItem value="owner">Contrato Owner/Partner</SelectItem>
                  <SelectItem value="broker">Contrato Broker</SelectItem>
                  <SelectItem value="nda">Acuerdo de Confidencialidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNewContract(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={sendContract}
                disabled={sending || !newContract.signer_name || !newContract.signer_email}
                className="flex-1 bg-sky-500 hover:bg-sky-600"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Contrato
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Contrato</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Firmante</Label>
                  <p className="font-medium">{selectedContract.signer_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Email</Label>
                  <p className="font-medium">{selectedContract.signer_email}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Rol</Label>
                  <Badge variant="outline" className="capitalize">{selectedContract.role}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Estado</Label>
                  <div>{getStatusBadge(selectedContract.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Creado</Label>
                  <p className="text-sm">{new Date(selectedContract.created_at).toLocaleString()}</p>
                </div>
                {selectedContract.signed_at && (
                  <div>
                    <Label className="text-xs text-slate-500">Firmado</Label>
                    <p className="text-sm">{new Date(selectedContract.signed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedContract.nom151_certified && (
                <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Stamp className="h-5 w-5 text-violet-600" />
                    <span className="font-medium text-violet-900">Certificacion NOM-151</span>
                  </div>
                  {selectedContract.folio && (
                    <p className="text-sm text-violet-700">Folio: {selectedContract.folio}</p>
                  )}
                  {selectedContract.sha256_hash && (
                    <p className="text-xs text-violet-600 font-mono mt-2 break-all">
                      Hash: {selectedContract.sha256_hash}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {selectedContract.document_url && (
                  <Button variant="outline" className="flex-1" onClick={() => window.open(selectedContract.document_url, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Documento
                  </Button>
                )}
                {selectedContract.status === "signed" && !selectedContract.nom151_certified && (
                  <Button
                    className="flex-1 bg-violet-500 hover:bg-violet-600"
                    onClick={() => {
                      generateNOM151Certificate(selectedContract.id)
                      setSelectedContract(null)
                    }}
                  >
                    <Stamp className="h-4 w-4 mr-2" />
                    Certificar NOM-151
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
