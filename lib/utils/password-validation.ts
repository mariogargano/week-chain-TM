export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export interface PasswordValidationResult {
  isValid: boolean
  requirements: PasswordRequirements
  score: number // 0-100
  message: string
}

export function validatePassword(password: string): PasswordValidationResult {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  }

  const metRequirements = Object.values(requirements).filter(Boolean).length
  const score = (metRequirements / 5) * 100

  let message = ""
  if (score === 100) {
    message = "Strong password"
  } else if (score >= 80) {
    message = "Good password"
  } else if (score >= 60) {
    message = "Fair password"
  } else {
    message = "Weak password"
  }

  return {
    isValid: metRequirements >= 4, // At least 4 out of 5 requirements
    requirements,
    score,
    message,
  }
}

export function getPasswordStrengthColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

export function getPasswordStrengthBgColor(score: number): string {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-yellow-500"
  return "bg-red-500"
}
