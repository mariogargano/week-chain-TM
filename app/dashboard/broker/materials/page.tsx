"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Presentation, ImageIcon, Video, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Material {
  id: string
  title: string
  description: string
  type: "pdf" | "ppt" | "image" | "video"
  size: string
  url: string
}

const materials: Material[] = [
  {
    id: "1",
    title: "One-Pager Corporativo",
    description: "Presentación de 1 página del modelo WEEK-CHAIN",
    type: "pdf",
    size: "2.5 MB",
    url: "/marketing/one-pager.pdf",
  },
  {
    id: "2",
    title: "Pitch Deck Completo",
    description: "Presentación de 20 slides para clientes",
    type: "ppt",
    size: "8.3 MB",
    url: "/marketing/pitch-deck.pptx",
  },
  {
    id: "3",
    title: "Logos y Brand Assets",
    description: "Pack de logos en diferentes formatos",
    type: "image",
    size: "5.1 MB",
    url: "/marketing/brand-assets.zip",
  },
  {
    id: "4",
    title: "Video Explicativo",
    description: "Video de 3 minutos sobre el modelo",
    type: "video",
    size: "45 MB",
    url: "/marketing/video-explicativo.mp4",
  },
  {
    id: "5",
    title: "Script de Ventas",
    description: "Guión paso a paso para presentar WEEK-CHAIN",
    type: "pdf",
    size: "1.2 MB",
    url: "/marketing/sales-script.pdf",
  },
  {
    id: "6",
    title: "FAQ para Clientes",
    description: "Respuestas a las 25 preguntas más frecuentes",
    type: "pdf",
    size: "1.8 MB",
    url: "/marketing/faq-holders.pdf",
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5" />
    case "ppt":
      return <Presentation className="h-5 w-5" />
    case "image":
      return <ImageIcon className="h-5 w-5" />
    case "video":
      return <Video className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "pdf":
      return "bg-red-100 text-red-700"
    case "ppt":
      return "bg-orange-100 text-orange-700"
    case "image":
      return "bg-blue-100 text-blue-700"
    case "video":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function BrokerMaterialsPage() {
  const handleDownload = (material: Material) => {
    toast.info(`El archivo "${material.title}" estará disponible próximamente`)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Materiales de Marketing</h1>
        <p className="text-muted-foreground">Descarga recursos para compartir con tus clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${getTypeColor(material.type)}`}>{getIcon(material.type)}</div>
                <span className="text-xs text-muted-foreground">{material.size}</span>
              </div>
              <CardTitle className="text-lg mt-4">{material.title}</CardTitle>
              <CardDescription>{material.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleDownload(material)} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Enlaces Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start bg-transparent" asChild>
            <a href="/pitch" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Pitch Online
            </a>
          </Button>
          <Button variant="outline" className="justify-start bg-transparent" asChild>
            <a href="/properties" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Propiedades
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-[#C7CEEA]/20 to-[#FFB7B2]/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Tip para Brokers</h3>
          <p className="text-sm text-muted-foreground">
            Estos materiales están diseñados para facilitar tu trabajo de venta. Personaliza los scripts con tu estilo y
            comparte los documentos directamente con tus clientes potenciales.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
