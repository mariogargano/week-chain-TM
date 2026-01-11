/**
 * Genera un fingerprint único del dispositivo
 * Usado para detección de fraude y usuarios duplicados
 */
export async function getDeviceFingerprint(): Promise<string> {
  const components: string[] = []

  // User agent
  components.push(navigator.userAgent)

  // Idioma
  components.push(navigator.language)

  // Zona horaria
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Resolución de pantalla
  components.push(`${screen.width}x${screen.height}`)
  components.push(`${screen.colorDepth}`)

  // Hardware concurrency
  components.push(`${navigator.hardwareConcurrency || "unknown"}`)

  // Device memory (si está disponible)
  const nav = navigator as any
  if (nav.deviceMemory) {
    components.push(`${nav.deviceMemory}`)
  }

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.textBaseline = "top"
      ctx.font = "14px Arial"
      ctx.fillStyle = "#f60"
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = "#069"
      ctx.fillText("WeekChain", 2, 15)
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
      ctx.fillText("Fingerprint", 4, 17)

      const canvasData = canvas.toDataURL()
      components.push(canvasData.slice(-50)) // Solo últimos 50 chars
    }
  } catch (e) {
    components.push("canvas-error")
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext)
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      }
    }
  } catch (e) {
    components.push("webgl-error")
  }

  // Generar hash del fingerprint
  const fingerprint = components.join("|")
  return await hashString(fingerprint)
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
