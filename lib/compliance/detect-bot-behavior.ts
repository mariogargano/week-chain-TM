/**
 * Detecta comportamiento sospechoso de bots o automatización
 */
export interface BotDetectionResult {
  isBot: boolean
  confidence: number // 0-100
  reasons: string[]
}

export function detectBotBehavior(): BotDetectionResult {
  const reasons: string[] = []
  let suspicionScore = 0

  // 1. Verificar user agent
  const ua = navigator.userAgent.toLowerCase()
  const botPatterns = ["bot", "crawl", "spider", "headless", "phantom", "selenium"]
  if (botPatterns.some((pattern) => ua.includes(pattern))) {
    reasons.push("User agent sospechoso")
    suspicionScore += 40
  }

  // 2. Verificar WebDriver
  const nav = navigator as any
  if (nav.webdriver) {
    reasons.push("WebDriver detectado")
    suspicionScore += 50
  }

  // 3. Verificar plugins
  if (navigator.plugins.length === 0) {
    reasons.push("Sin plugins de navegador")
    suspicionScore += 20
  }

  // 4. Verificar idiomas
  if (navigator.languages.length === 0) {
    reasons.push("Sin idiomas configurados")
    suspicionScore += 20
  }

  // 5. Verificar dimensiones de pantalla
  if (screen.width === 0 || screen.height === 0) {
    reasons.push("Dimensiones de pantalla inválidas")
    suspicionScore += 30
  }

  // 6. Verificar Chrome objeto
  if ("chrome" in window) {
    const chrome = (window as any).chrome
    if (!chrome || !chrome.runtime) {
      reasons.push("Chrome runtime ausente")
      suspicionScore += 15
    }
  }

  // 7. Verificar propiedades de automatización
  if (nav.permissions && nav.permissions.query) {
    // Esto es normal, pero combinado con otros factores puede ser sospechoso
  }

  // 8. Verificar tiempo de carga sospechoso
  const loadTime = performance.now()
  if (loadTime < 100) {
    reasons.push("Tiempo de carga extremadamente rápido")
    suspicionScore += 25
  }

  // 9. Verificar errores de JavaScript
  const hasConsoleErrors = (window as any).__consoleErrors > 0
  if (hasConsoleErrors) {
    reasons.push("Errores de JavaScript detectados")
    suspicionScore += 10
  }

  return {
    isBot: suspicionScore >= 50,
    confidence: Math.min(suspicionScore, 100),
    reasons,
  }
}

// Inicializar contador de errores
if (typeof window !== "undefined") {
  ;(window as any).__consoleErrors = 0
  const originalError = console.error
  console.error = (...args: any[]) => {
    ;(window as any).__consoleErrors++
    originalError.apply(console, args)
  }
}
