"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { MessageSquare, Facebook, Twitter, Linkedin, Copy, Check, Share2, X, Send, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface MarketingMessage {
  id: string
  title: string
  message: string
  category: string
  platform: string
}

interface SocialShareSidebarProps {
  referralCode: string
  referralUrl: string
  userName: string
}

export function SocialShareSidebar({ referralCode, referralUrl, userName }: SocialShareSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<MarketingMessage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("marketing_messages")
        .select("*")
        .eq("is_active", true)
        .order("category")

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const personalizeMessage = (message: string) => {
    return `${message}\n\nRegistrate aqui: ${referralUrl}\nCodigo: ${referralCode}`
  }

  const copyMessage = async (msg: MarketingMessage) => {
    const personalizedMsg = personalizeMessage(msg.message)
    await navigator.clipboard.writeText(personalizedMsg)
    setCopiedId(msg.id)
    toast.success("Mensaje copiado")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shareToWhatsApp = (msg: MarketingMessage) => {
    const personalizedMsg = personalizeMessage(msg.message)
    window.open(`https://wa.me/?text=${encodeURIComponent(personalizedMsg)}`, "_blank")
  }

  const shareToFacebook = (msg: MarketingMessage) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(msg.message)}`,
      "_blank",
    )
  }

  const shareToTwitter = (msg: MarketingMessage) => {
    const personalizedMsg = `${msg.message}\n\nRegistrate: ${referralUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(personalizedMsg)}`, "_blank")
  }

  const shareToLinkedIn = (msg: MarketingMessage) => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, "_blank")
  }

  const shareToTelegram = (msg: MarketingMessage) => {
    const personalizedMsg = personalizeMessage(msg.message)
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(personalizedMsg)}`,
      "_blank",
    )
  }

  const categories = [
    { id: "all", label: "Todos", color: "bg-slate-600" },
    { id: "general", label: "General", color: "bg-blue-500" },
    { id: "promocion", label: "Promo", color: "bg-purple-500" },
    { id: "beneficios", label: "Beneficios", color: "bg-emerald-500" },
    { id: "urgencia", label: "Urgente", color: "bg-red-500" },
  ]

  const filteredMessages =
    selectedCategory === "all" ? messages : messages.filter((m) => m.category === selectedCategory)

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 bottom-6 z-40 group transition-all duration-300 ${isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"}`}
      >
        <div className="relative">
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-ping opacity-25" />

          {/* Main Button */}
          <div className="relative w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105">
            <Share2 className="w-6 h-6 text-white" />
          </div>

          {/* Badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
            {messages.length}
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Compartir y ganar
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      </button>

      {/* Sidebar Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l border-slate-800 shadow-2xl z-50 transform transition-all duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 border-b border-slate-800/50">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Centro de Promocion</h3>
              <p className="text-slate-400 text-sm">Comparte y gana comisiones</p>
            </div>
          </div>
        </div>

        {/* Referral Card */}
        <div className="mx-6 mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Tu codigo de referido</p>
              <code className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                {referralCode}
              </code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode)
                toast.success("Codigo copiado")
              }}
              className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-colors"
            >
              <Copy className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="px-6 py-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Compartir enlace rapido</p>
          <div className="flex gap-2">
            {[
              {
                icon: MessageSquare,
                color: "bg-green-500 hover:bg-green-600",
                action: () =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(`Unete a WEEK-CHAIN: ${referralUrl}`)}`,
                    "_blank",
                  ),
              },
              {
                icon: Send,
                color: "bg-blue-500 hover:bg-blue-600",
                action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}`, "_blank"),
              },
              {
                icon: Facebook,
                color: "bg-blue-600 hover:bg-blue-700",
                action: () =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
                    "_blank",
                  ),
              },
              {
                icon: Twitter,
                color: "bg-sky-500 hover:bg-sky-600",
                action: () =>
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralUrl)}`, "_blank"),
              },
              {
                icon: Linkedin,
                color: "bg-blue-700 hover:bg-blue-800",
                action: () =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
                    "_blank",
                  ),
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className={`flex-1 p-3 ${item.color} rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <item.icon className="w-5 h-5 text-white mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? `${cat.color} text-white`
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-6 pb-24" style={{ maxHeight: "calc(100vh - 380px)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">No hay mensajes en esta categoria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="group p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all duration-300"
                >
                  <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                    {msg.title}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        msg.category === "urgencia"
                          ? "bg-red-500"
                          : msg.category === "beneficios"
                            ? "bg-emerald-500"
                            : msg.category === "promocion"
                              ? "bg-purple-500"
                              : "bg-blue-500"
                      }`}
                    />
                  </h4>
                  <p className="text-slate-400 text-xs mb-4 line-clamp-2">{msg.message}</p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => shareToWhatsApp(msg)}
                      className="flex-1 p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors group/btn"
                    >
                      <MessageSquare className="w-4 h-4 text-green-400 mx-auto group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => shareToTelegram(msg)}
                      className="flex-1 p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors group/btn"
                    >
                      <Send className="w-4 h-4 text-blue-400 mx-auto group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => shareToFacebook(msg)}
                      className="flex-1 p-2 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg transition-colors group/btn"
                    >
                      <Facebook className="w-4 h-4 text-blue-500 mx-auto group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => shareToTwitter(msg)}
                      className="flex-1 p-2 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg transition-colors group/btn"
                    >
                      <Twitter className="w-4 h-4 text-sky-400 mx-auto group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => shareToLinkedIn(msg)}
                      className="flex-1 p-2 bg-blue-700/10 hover:bg-blue-700/20 rounded-lg transition-colors group/btn"
                    >
                      <Linkedin className="w-4 h-4 text-blue-400 mx-auto group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => copyMessage(msg)}
                      className="flex-1 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group/btn"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 mx-auto group-hover/btn:scale-110 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-8">
          <p className="text-[10px] text-slate-500 text-center">
            Mensajes aprobados por WEEK-CHAIN. Tu enlace se agrega automaticamente.
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
