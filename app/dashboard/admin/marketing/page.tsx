"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Save, X, MessageSquare, Eye, EyeOff, BarChart3, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface MarketingMessage {
  id: string
  title: string
  message: string
  category: string
  platform: string
  is_active: boolean
  usage_count: number
  created_at: string
}

const CATEGORIES = [
  { value: "general", label: "General", color: "bg-blue-500/20 text-blue-400" },
  { value: "promocion", label: "Promocion", color: "bg-purple-500/20 text-purple-400" },
  { value: "beneficios", label: "Beneficios", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "testimonios", label: "Testimonios", color: "bg-amber-500/20 text-amber-400" },
  { value: "urgencia", label: "Urgente", color: "bg-red-500/20 text-red-400" },
]

const PLATFORMS = [
  { value: "all", label: "Todas las plataformas" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
]

export default function MarketingMessagesPage() {
  const [messages, setMessages] = useState<MarketingMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "general",
    platform: "all",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("marketing_messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Error al cargar mensajes")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Titulo y mensaje son requeridos")
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from("marketing_messages")
          .update({
            title: formData.title,
            message: formData.message,
            category: formData.category,
            platform: formData.platform,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
        toast.success("Mensaje actualizado")
      } else {
        const { error } = await supabase.from("marketing_messages").insert({
          title: formData.title,
          message: formData.message,
          category: formData.category,
          platform: formData.platform,
          is_active: true,
        })

        if (error) throw error
        toast.success("Mensaje creado")
      }

      resetForm()
      fetchMessages()
    } catch (error) {
      console.error("Error saving message:", error)
      toast.error("Error al guardar mensaje")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("marketing_messages").update({ is_active: !currentStatus }).eq("id", id)

      if (error) throw error
      toast.success(currentStatus ? "Mensaje desactivado" : "Mensaje activado")
      fetchMessages()
    } catch (error) {
      toast.error("Error al actualizar estado")
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("¿Estas seguro de eliminar este mensaje?")) return

    try {
      const { error } = await supabase.from("marketing_messages").delete().eq("id", id)

      if (error) throw error
      toast.success("Mensaje eliminado")
      fetchMessages()
    } catch (error) {
      toast.error("Error al eliminar mensaje")
    }
  }

  const editMessage = (msg: MarketingMessage) => {
    setFormData({
      title: msg.title,
      message: msg.message,
      category: msg.category,
      platform: msg.platform,
    })
    setEditingId(msg.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ title: "", message: "", category: "general", platform: "all" })
    setEditingId(null)
    setShowForm(false)
  }

  const getCategoryStyle = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category)
    return cat?.color || "bg-gray-500/20 text-gray-400"
  }

  const totalUsage = messages.reduce((sum, m) => sum + (m.usage_count || 0), 0)
  const activeCount = messages.filter((m) => m.is_active).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/admin" className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Mensajes de Marketing</h1>
              <p className="text-slate-600">Gestiona los mensajes pre-aprobados para promocion social</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mensaje
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{messages.length}</p>
                  <p className="text-sm text-slate-500">Total Mensajes</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                  <p className="text-sm text-slate-500">Activos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totalUsage}</p>
                  <p className="text-sm text-slate-500">Veces Compartido</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{editingId ? "Editar Mensaje" : "Nuevo Mensaje"}</h2>
                  <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Titulo</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Promocion de Verano"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escribe el mensaje que los usuarios podran compartir..."
                      rows={4}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      El enlace de referido se agregara automaticamente al compartir
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plataforma</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {PLATFORMS.map((plat) => (
                          <option key={plat.value} value={plat.value}>
                            {plat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {editingId ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay mensajes creados</h3>
              <p className="text-slate-500 mb-4">
                Crea mensajes pre-aprobados para que tus usuarios puedan promocionar
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Mensaje
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${
                    msg.is_active ? "border-l-emerald-500" : "border-l-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{msg.title}</h3>
                        <Badge className={getCategoryStyle(msg.category)}>
                          {CATEGORIES.find((c) => c.value === msg.category)?.label}
                        </Badge>
                        {!msg.is_active && (
                          <Badge variant="outline" className="text-slate-400">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{msg.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Plataforma: {PLATFORMS.find((p) => p.value === msg.platform)?.label}</span>
                        <span>Compartido: {msg.usage_count || 0} veces</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(msg.id, msg.is_active)}
                        className={msg.is_active ? "text-emerald-600" : "text-slate-400"}
                      >
                        {msg.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => editMessage(msg)} className="text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMessage(msg.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
