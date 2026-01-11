"use client"

import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBgColor } from "@/lib/utils/password-validation"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const validation = validatePassword(password)
  const { requirements, score, message } = validation

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={getPasswordStrengthColor(score)}>{message}</span>
      </div>
      <Progress value={score} className="h-2" indicatorClassName={getPasswordStrengthBgColor(score)} />
      <div className="space-y-1 text-xs">
        <RequirementItem met={requirements.minLength} text="At least 8 characters" />
        <RequirementItem met={requirements.hasUppercase} text="One uppercase letter" />
        <RequirementItem met={requirements.hasLowercase} text="One lowercase letter" />
        <RequirementItem met={requirements.hasNumber} text="One number" />
        <RequirementItem met={requirements.hasSpecialChar} text="One special character (!@#$%^&*)" />
      </div>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-600" />}
      <span className={met ? "text-green-600" : "text-muted-foreground"}>{text}</span>
    </div>
  )
}
