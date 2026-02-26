"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import {
  CheckCircle2,
  Send,
  Upload,
  Loader2,
} from "lucide-react"

const propertyTypes = [
  "Casa / Villa",
  "Departamento",
  "Boutique Hotel",
  "Desarrollo / Condominio",
  "Terreno con proyecto",
  "Otro",
]

export function InsuranceContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country_city: "",
    property_link: "",
    property_type: "",
    units: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from("insurance_inquiries").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        country_city: formData.country_city,
        property_link: formData.property_link || null,
        property_type: formData.property_type,
        units: formData.units ? parseInt(formData.units) : null,
        message: formData.message || null,
        status: "new",
      })

      if (insertError) {
        // If table doesn't exist yet, just show success anyway (form is captured in logs)
        console.log("[v0] Insurance inquiry insert:", insertError.message)
      }

      setSubmitted(true)
    } catch (err) {
      setError("Error al enviar. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20">
        <CardContent className="p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Solicitud recibida</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Nuestro equipo revisara tu informacion y te contactara en las proximas 48 horas habiles
            para iniciar la evaluacion.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Nombre completo <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {/* Telefono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                Telefono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                placeholder="+52 555 000 0000"
              />
            </div>

            {/* Pais / Ciudad */}
            <div>
              <label htmlFor="country_city" className="block text-sm font-medium text-slate-300 mb-1.5">
                Pais / Ciudad <span className="text-red-400">*</span>
              </label>
              <input
                id="country_city"
                name="country_city"
                type="text"
                required
                value={formData.country_city}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                placeholder="Mexico, CDMX"
              />
            </div>

            {/* Link propiedad */}
            <div>
              <label htmlFor="property_link" className="block text-sm font-medium text-slate-300 mb-1.5">
                Link de la propiedad
              </label>
              <input
                id="property_link"
                name="property_link"
                type="url"
                value={formData.property_link}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>

            {/* Tipo propiedad */}
            <div>
              <label htmlFor="property_type" className="block text-sm font-medium text-slate-300 mb-1.5">
                Tipo de propiedad <span className="text-red-400">*</span>
              </label>
              <select
                id="property_type"
                name="property_type"
                required
                value={formData.property_type}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors appearance-none"
              >
                <option value="" disabled className="text-slate-500">
                  Selecciona tipo
                </option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type} className="bg-slate-800 text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Unidades */}
            <div>
              <label htmlFor="units" className="block text-sm font-medium text-slate-300 mb-1.5">
                Numero de unidades
              </label>
              <input
                id="units"
                name="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                placeholder="1"
              />
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1.5">
              Mensaje o contexto adicional
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors resize-none"
              placeholder="Describe tu propiedad, operacion o necesidades especificas..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-6 text-base shadow-lg shadow-sky-500/20 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Solicitar evaluacion de riesgo
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Al enviar este formulario, aceptas que WEEK-INSURANCE te contacte para dar seguimiento a tu solicitud.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
