"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, Phone, Gift } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface RegisterFormProps {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (confirmPassword: string) => void
  registerName: string
  setRegisterName: (name: string) => void
  registerPhone: string
  setRegisterPhone: (phone: string) => void
  referralCode: string
  setReferralCode: (code: string) => void
  registerTermsAccepted: boolean
  setRegisterTermsAccepted: (accepted: boolean) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
  onSwitchToLogin: () => void
}

export function RegisterForm({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  registerName,
  setRegisterName,
  registerPhone,
  setRegisterPhone,
  referralCode,
  setReferralCode,
  registerTermsAccepted,
  setRegisterTermsAccepted,
  isLoading,
  onSubmit,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-foreground">Nombre completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="register-name"
            type="text"
            placeholder="Juan Perez"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            required
            disabled={isLoading}
            className="pl-10 h-12 text-base border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-foreground">Correo electronico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="pl-10 h-12 text-base border-border bg-amber-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-phone" className="text-foreground">Telefono</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="register-phone"
            type="tel"
            placeholder="+52 123 456 7890"
            value={registerPhone}
            onChange={(e) => setRegisterPhone(e.target.value)}
            required
            disabled={isLoading}
            className="pl-10 h-12 text-base border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-foreground">Contrasena (min. 6 caracteres)</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Tu contrasena segura"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            className="pl-10 pr-12 h-12 text-base border-border"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-foreground">Confirmar contrasena</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirma tu contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className={`pl-10 pr-12 h-12 text-base border-border ${confirmPassword && password !== confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-500">Las contrasenas no coinciden</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="referral-code" className="text-foreground">Codigo de referido (opcional)</Label>
        <div className="relative">
          <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="referral-code"
            type="text"
            placeholder="ABC123"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            disabled={isLoading}
            className="pl-10 h-12 text-base border-border uppercase"
            maxLength={10}
          />
        </div>
      </div>

      <div className="flex items-start space-x-3 p-4 bg-sky-50/80 rounded-xl border border-sky-200">
        <Checkbox
          id="register-terms"
          checked={registerTermsAccepted}
          onCheckedChange={(checked) => setRegisterTermsAccepted(checked === true)}
          className="mt-0.5 border-sky-400 data-[state=checked]:bg-sky-500"
        />
        <label htmlFor="register-terms" className="text-sm text-slate-700 leading-relaxed">
          Acepto los{" "}
          <Link href="/terminos" className="text-sky-600 underline hover:text-sky-700 font-medium">
            Terminos y Condiciones
          </Link>
          ,{" "}
          <Link href="/privacidad" className="text-sky-600 underline hover:text-sky-700 font-medium">
            Politica de Privacidad
          </Link>{" "}
          y el{" "}
          <Link href="/contrato-adhesion" className="text-sky-600 underline hover:text-sky-700 font-medium">
            Contrato de Adhesion NOM-029
          </Link>
        </label>
      </div>

      <Button
        type="submit"
        className="w-full h-12 mt-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-cyan-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        disabled={isLoading || !registerTermsAccepted || !registerName || !email || !registerPhone || !password || password.length < 6 || password !== confirmPassword}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creando cuenta...
          </span>
        ) : "Crear Cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-4 pb-4">
        {"Ya tienes cuenta? "}
        <button type="button" onClick={onSwitchToLogin} className="text-sky-600 font-semibold hover:text-sky-700 underline underline-offset-2">
          Iniciar sesion
        </button>
      </p>
    </form>
  )
}
