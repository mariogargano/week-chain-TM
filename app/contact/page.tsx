"use client"

import type React from "react"
import { useState } from "react"
import {
  Mail,
  MapPin,
  Building2,
  Phone,
  Headphones,
  Shield,
  CreditCard,
  Calendar,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setFormData({ name: "", email: "", phone: "", subject: "", category: "", message: "" })
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        setError(data.error || "Error al enviar el mensaje. Por favor intenta de nuevo.")
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setError("Error de conexión. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Correo Electrónico",
      description: "Respuesta en 24-48 horas",
    },
    {
      icon: Phone,
      title: "Teléfono",
      description: "Llámanos directamente",
    },
    {
      icon: Headphones,
      title: "Soporte",
      description: "Chat en vivo disponible",
    },
    {
      icon: Building2,
      title: "Visita",
      description: "Encuéntranos en nuestra oficina",
    },
    {
      icon: MapPin,
      title: "Ubicación",
      description: "Nuestra dirección exacta",
    },
    {
      icon: Calendar,
      title: "Cita",
      description: "Programa una cita con nosotros",
    },
    {
      icon: Shield,
      title: "Privacidad",
      description: "Protegemos tu información",
    },
    {
      icon: CreditCard,
      title: "Pago",
      description: "Métodos de pago seguros",
    },
    {
      icon: HelpCircle,
      title: "Ayuda",
      description: "Encuentra respuestas a tus preguntas",
    },
    {
      icon: ChevronRight,
      title: "Siguiente",
      description: "Avanza al siguiente paso",
    },
  ]

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
            <CardDescription>
              Por favor, completa el formulario a continuación para ponerte en contacto con nosotros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select name="category" value={formData.category} onChange={handleChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="sales">Ventas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
              {isSuccess && (
                <Badge variant="success" className="mt-4">
                  Mensaje enviado con éxito
                </Badge>
              )}
              {error && (
                <Badge variant="destructive" className="mt-4">
                  {error}
                </Badge>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </>
  )
}
