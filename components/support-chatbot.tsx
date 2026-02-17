"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  suggestions?: string[]
}

const FAQ_RESPONSES: Record<string, { answer: string; suggestions?: string[] }> = {
  "qué es weekchain": {
    answer:
      "WEEK-CHAIN™ es una plataforma de certificados vacacionales inteligentes. Permitimos comprar semanas en alojamientos de lujo respaldadas por Certificados Digitales verificados. No son timeshares tradicionales - tú tienes un certificado real y puedes revender cuando quieras.",
    suggestions: ["¿Cómo funciona?", "¿Cuánto cuesta?", "¿Es legal?"],
  },
  "cómo funciona": {
    answer:
      "Es muy simple: 1) Explora alojamientos disponibles 2) Selecciona las semanas que te interesan 3) Compra con tarjeta, OXXO o SPEI 4) Recibe tu Certificado Digital 5) Disfruta tus vacaciones o revende cuando quieras. Todo el proceso es 100% digital.",
    suggestions: ["Ver alojamientos", "Métodos de pago", "¿Es seguro?"],
  },
  "cuánto cuesta": {
    answer:
      "Las semanas empiezan desde $3,500 USD dependiendo del alojamiento y temporada. Por política WEEK-CHAIN, retenemos 4 semanas de baja temporada para cubrir gastos e incentivar el ecosistema. Esto significa $0 cuotas de mantenimiento y $0 gastos extra - solo pagas una vez y la semana es tuya por 15 años con experiencia sin fricción.",
    suggestions: ["Ver precios", "¿Hay descuentos?", "Métodos de pago"],
  },
  "métodos de pago": {
    answer:
      "Aceptamos: 💳 Tarjetas de crédito/débito, 🏪 OXXO (efectivo), 🏦 SPEI (transferencia bancaria), y 💰 USDC (crypto). Todos los pagos son seguros y procesados por Conekta.",
    suggestions: ["¿Cuánto cuesta?", "¿Es seguro?", "Proceso de compra"],
  },
  "es legal": {
    answer:
      "¡Absolutamente! Todas las transacciones están respaldadas legalmente y notariadas. Los Certificados Digitales cuentan con certificación NOM-151 y cada uno representa un derecho de uso temporal verificado. Cumplimos con todas las regulaciones mexicanas.",
    suggestions: ["Ver documentos legales", "¿Qué es un Certificado Digital?", "¿Es seguro?"],
  },
  "qué es certificado digital": {
    answer:
      "Un Certificado Digital es un documento único y verificado digitalmente que representa el derecho temporal de uso de tus semanas vacacionales. Es como un título digital respaldado por contrato notarizado.",
    suggestions: ["¿Es seguro?", "¿Cómo funciona?"],
  },
  "qué es nft": {
    answer:
      "En WEEK-CHAIN™ utilizamos Certificados Digitales - documentos únicos y verificados que representan el derecho temporal de uso de tus semanas vacacionales. Es como un título digital respaldado por contrato notarizado.",
    suggestions: ["¿Es seguro?", "¿Cómo funciona?"],
  },
  broker: {
    answer:
      "¡Excelente! Como broker en WEEK-CHAIN™ ganas comisiones por cada venta + comisiones multinivel de tu red. Acceso a dashboard profesional para monitorear tus ventas y equipo en tiempo real. ¿Quieres más información?",
    suggestions: ["Aplicar como broker", "Ver comisiones", "Dashboard broker"],
  },
  "comisiones broker": {
    answer:
      "Los brokers ganan: 🎯 10-15% comisión directa por venta, 💎 3-5% comisión de segundo nivel, 📈 Bonos por desempeño, 🌟 Acceso a programa Elite con beneficios exclusivos.",
    suggestions: ["Aplicar como broker", "Programa Elite", "Registrarme"],
  },
  propietario: {
    answer:
      "¿Tienes un alojamiento vacacional? Certifícalo con nosotros y obtén: 💰 Liquidez inmediata sin vender, 📊 Gestión profesional incluida, 🎯 Acceso a nuestra red de compradores, 📈 Incrementa el valor de tu alojamiento.",
    suggestions: ["Registrar alojamiento", "Requisitos", "Beneficios"],
  },
  vender: {
    answer:
      "Puedes revender tus semanas en cualquier momento en nuestro marketplace 24/7. Sin intermediarios, sin comisiones excesivas. Solo listas tu semana, fijas tu precio, y listo. La transacción es segura y automatizada.",
    suggestions: ["Ver marketplace", "¿Cuánto tarda?", "Comisiones por venta"],
  },
  vafi: {
    answer:
      "VA-FI (Vacation Finance) te permite usar tus Certificados Digitales como colateral para obtener préstamos instantáneos sin venderlos. Actualmente está en proceso de cumplimiento regulatorio. ¡Únete a la lista de espera!",
    suggestions: ["¿Cómo funciona VA-FI?", "Ver tasas", "Lista de espera"],
  },
  referidos: {
    answer:
      "¡Gana dinero recomendando WEEK-CHAIN™! Por cada amigo que compre, ganas comisión. Además, ellos también ganan beneficios. Es win-win. No necesitas ser broker para participar.",
    suggestions: ["Crear código de referido", "Ver comisiones", "Compartir enlace"],
  },
  contacto: {
    answer:
      "📧 Email: support@week-chain.com\n📱 WhatsApp: +52 998 123 4567\n🌐 Redes sociales: @weekchain\n\nHorario de atención: Lun-Vie 9am-6pm (México)",
    suggestions: ["Enviar mensaje", "FAQ", "Soporte técnico"],
  },
  "cuotas mantenimiento": {
    answer:
      "¡$0 cuotas de mantenimiento y $0 gastos extra! Por política WEEK-CHAIN, retenemos 4 semanas de baja temporada por alojamiento. Estas se destinan a: 1) Cobertura de gastos (limpieza, seguro, mantenimiento, reparaciones) y 2) Incentivar el ecosistema (desarrollo, soporte 24/7, mejoras). Resultado: experiencia sin fricción por 15 años.",
    suggestions: ["¿Cuánto cuesta?", "¿Cómo funciona?", "Ver alojamientos"],
  },
  mantenimiento: {
    answer:
      "¡$0 cuotas de mantenimiento y $0 gastos extra! Por política WEEK-CHAIN, retenemos 4 semanas de baja temporada por alojamiento. Estas se destinan a: 1) Cobertura de gastos (limpieza, seguro, mantenimiento, reparaciones) y 2) Incentivar el ecosistema (desarrollo, soporte 24/7, mejoras). Resultado: experiencia sin fricción por 15 años.",
    suggestions: ["¿Cuánto cuesta?", "¿Cómo funciona?", "Ver alojamientos"],
  },
}

const QUICK_ACTIONS = [
  { label: "¿Qué es WEEK-CHAIN?", query: "qué es weekchain" },
  { label: "¿Cómo funciona?", query: "cómo funciona" },
  { label: "Métodos de pago", query: "métodos de pago" },
  { label: "Ser Broker", query: "broker" },
  { label: "Contacto", query: "contacto" },
]

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "¡Hola! 👋 Soy el asistente virtual de WEEK-CHAIN™. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
      suggestions: QUICK_ACTIONS.map((a) => a.label),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const findBestMatch = (query: string): { answer: string; suggestions?: string[] } | null => {
    const normalizedQuery = query.toLowerCase().trim()

    for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        return value
      }
    }

    return null
  }

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(
      () => {
        const match = findBestMatch(messageText)

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text:
            match?.answer ||
            "Interesante pregunta. Te recomiendo contactar a nuestro equipo de soporte para una respuesta más específica. 📧 support@week-chain.com o visita nuestra sección de FAQ.",
          sender: "bot",
          timestamp: new Date(),
          suggestions: match?.suggestions || ["Ver FAQ", "Contacto", "Hablar con humano"],
        }

        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleSuggestionClick = (suggestion: string) => {
    const action = QUICK_ACTIONS.find((a) => a.label === suggestion)
    if (action) {
      handleSendMessage(action.query)
    } else {
      handleSendMessage(suggestion)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 hover:shadow-pink-500/50 hover:scale-110 transition-all duration-300"
            >
              <MessageCircle className="h-6 w-6 text-white" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl border-2 border-purple-200/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Soporte WEEK-CHAIN™</CardTitle>
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                        En línea
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea ref={scrollAreaRef} className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.sender === "bot" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}

                        <div className={`flex flex-col gap-2 max-w-[80%]`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.sender === "user"
                                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          </div>

                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs h-7 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>

                        {message.sender === "user" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex gap-2 items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-slate-100 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <span
                              className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-slate-50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Escribe tu pregunta..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
