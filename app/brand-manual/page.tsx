import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export default async function BrandManualPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFDAC1]/30 via-[#B5EAD7]/20 to-[#C7CEEA]/30 px-6 py-32">
        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full glass border border-[#C7CEEA]/30 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
            <FileText className="h-4 w-4 text-[#FF9AA2]" />
            Manual de Marca
          </div>
          <h1 className="mb-6 text-balance text-6xl font-bold tracking-tight text-slate-900 md:text-7xl leading-[1.1]">
            WEEK-CHAIN™ Brand Manual
          </h1>
          <p className="mx-auto max-w-3xl text-pretty text-xl text-slate-600 md:text-2xl leading-relaxed font-medium mb-12">
            Guía completa de identidad corporativa, colores, tipografía y uso de marca
          </p>
          <Button
            asChild
            size="lg"
            className="min-w-[240px] bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:from-[#ff8a92] hover:via-[#ffa7a2] hover:to-[#b7beda] text-white text-base font-semibold h-14 rounded-xl shadow-lg shadow-[#FF9AA2]/25 hover:shadow-xl hover:shadow-[#FF9AA2]/30 transition-all duration-300 hover:scale-105"
          >
            <a href="/WEEK-CHAIN_Brand_Manual.md" download>
              <Download className="mr-2 h-5 w-5" />
              Descargar Brand Manual
            </a>
          </Button>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2>Contenido del Manual</h2>
            <ul>
              <li>Identidad Legal y Corporativa</li>
              <li>Paleta de Colores (6 colores pastel + neutros)</li>
              <li>Tipografía (Inter font family)</li>
              <li>Logo y sus variaciones</li>
              <li>Elementos Visuales (gradientes, sombras, bordes)</li>
              <li>Iconografía (Lucide React)</li>
              <li>Fotografía y estilo visual</li>
              <li>Voz y Tono de comunicación</li>
              <li>Aplicaciones (web, redes sociales, documentos)</li>
              <li>Elementos prohibidos</li>
              <li>Información de contacto</li>
            </ul>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
