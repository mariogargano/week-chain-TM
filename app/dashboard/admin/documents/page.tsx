"use client";
import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Search,
  Filter,
  FolderOpen,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Eye,
  MoreVertical,
  Plus,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DocumentFile {
  pathname: string
  url: string
  size: number
  uploadedAt: Date
  filename: string
  category?: string
}

const DOCUMENT_CATEGORIES = [
  { value: "contracts", label: "Contratos" },
  { value: "legal", label: "Documentos Legales" },
  { value: "kyc", label: "KYC / Identificaciones" },
  { value: "properties", label: "Propiedades" },
  { value: "financial", label: "Financieros" },
  { value: "marketing", label: "Marketing" },
  { value: "compliance", label: "Compliance" },
  { value: "other", label: "Otros" },
]

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [uploadCategory, setUploadCategory] = useState("other")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.files || [])
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast.error("Error al cargar documentos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i])
    }
    formData.append("category", uploadCategory)

    try {
      const response = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success(`${files.length} archivo(s) subido(s) correctamente`)
        setUploadDialogOpen(false)
        fetchDocuments()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al subir archivos")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Error al subir archivos")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (pathname: string) => {
    if (!confirm("Esta seguro de eliminar este documento?")) return

    try {
      const response = await fetch("/api/admin/documents/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname }),
      })

      if (response.ok) {
        toast.success("Documento eliminado")
        fetchDocuments()
      } else {
        toast.error("Error al eliminar documento")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Error al eliminar documento")
    }
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return <ImageIcon className="h-5 w-5 text-purple-500" />
    }
    if (["pdf"].includes(ext || "")) {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    if (["xls", "xlsx", "csv"].includes(ext || "")) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    }
    return <File className="h-5 w-5 text-slate-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    let i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryBadge = (category?: string) => {
    const cat = DOCUMENT_CATEGORIES.find((c) => c.value === category)
    const colors: Record<string, string> = {
      contracts: "bg-blue-100 text-blue-800",
      legal: "bg-purple-100 text-purple-800",
      kyc: "bg-amber-100 text-amber-800",
      properties: "bg-emerald-100 text-emerald-800",
      financial: "bg-green-100 text-green-800",
      marketing: "bg-pink-100 text-pink-800",
      compliance: "bg-red-100 text-red-800",
      other: "bg-slate-100 text-slate-800",
    }
    return (
      <Badge variant="secondary" className={colors[category || "other"]}>
        {cat?.label || "Otros"}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion de Documentos</h1>
          <p className="text-muted-foreground">Administra todos los documentos de la plataforma</p>
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-500 hover:bg-sky-600">
              <Plus className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Documentos</DialogTitle>
              <DialogDescription>
                Selecciona los archivos y la categoria para subir
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Archivos</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-sky-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm text-muted-foreground">
                      {isUploading ? "Subiendo..." : "Click para seleccionar archivos"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, XLS, JPG, PNG (max 10MB)
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 rounded-lg">
                <FolderOpen className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-xs text-muted-foreground">Total Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.category === "contracts").length}
                </p>
                <p className="text-xs text-muted-foreground">Contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.category === "kyc").length}
                </p>
                <p className="text-xs text-muted-foreground">KYC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.category === "legal").length}
                </p>
                <p className="text-xs text-muted-foreground">Legales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorias</SelectItem>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchDocuments} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
          <CardDescription>
            Lista de todos los documentos almacenados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay documentos</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir primer documento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tamano</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.pathname}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.filename)}
                          <span className="font-medium truncate max-w-[200px]">
                            {doc.filename}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(doc.uploadedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a
                                href={`/api/admin/documents/view?pathname=${encodeURIComponent(doc.pathname)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a
                                href={`/api/admin/documents/download?pathname=${encodeURIComponent(doc.pathname)}`}
                                download
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(doc.pathname)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
