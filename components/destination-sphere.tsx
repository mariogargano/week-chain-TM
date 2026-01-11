"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { AlertCircle } from "lucide-react"

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface SphericalPosition {
  theta: number // Azimuth angle in degrees
  phi: number // Polar angle in degrees
  radius: number // Distance from center
}

export interface WorldPosition extends Position3D {
  scale: number
  zIndex: number
  isVisible: boolean
  fadeOpacity: number
  originalIndex: number
}

export interface SphereImage {
  id: string
  src: string
  alt: string
  title: string
  description?: string
  flagEmoji?: string
  country?: string
  propertyType?: string
  availability?: string
  basePrice?: number
  legalDisclaimer?: string
}

export interface SphereImageGridProps {
  images?: SphereImage[]
  containerSize?: number
  sphereRadius?: number
  dragSensitivity?: number
  momentumDecay?: number
  maxRotationSpeed?: number
  baseImageScale?: number
  hoverScale?: number
  perspective?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
  className?: string
}

interface RotationState {
  x: number
  y: number
  z: number
}

interface VelocityState {
  x: number
  y: number
}

interface MousePosition {
  x: number
  y: number
}

// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================

const SPHERE_MATH = {
  degreesToRadians: (degrees: number): number => degrees * (Math.PI / 180),
  radiansToDegrees: (radians: number): number => radians * (180 / Math.PI),

  sphericalToCartesian: (radius: number, theta: number, phi: number): Position3D => ({
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  }),

  calculateDistance: (pos: Position3D, center: Position3D = { x: 0, y: 0, z: 0 }): number => {
    const dx = pos.x - center.x
    const dy = pos.y - center.y
    const dz = pos.z - center.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  },

  normalizeAngle: (angle: number): number => {
    while (angle > 180) angle -= 360
    while (angle < -180) angle += 360
    return angle
  },
}

export function DestinationSphere({
  images,
  containerSize = 400,
  sphereRadius = 200,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseImageScale = 0.12,
  hoverScale = 1.2,
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  className = "",
}: SphereImageGridProps) {
  const [destinations, setDestinations] = useState<SphereImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const response = await fetch("/api/destinations/catalog")
        const data = await response.json()

        if (data.destinations) {
          // Transform API data to sphere format
          const transformedDestinations: SphereImage[] = data.destinations.map((dest: any) => ({
            id: dest.id,
            src: dest.image_url || "/placeholder.svg?height=400&width=600",
            alt: dest.name,
            title: dest.name,
            description: dest.location,
            flagEmoji: getCountryFlag(dest.location_group),
            country: dest.location_group,
            propertyType: extractPropertyType(dest.name),
            availability: dest.availability_percentage > 30 ? "Disponible" : "Limitado",
            basePrice: dest.base_price_usd,
            legalDisclaimer: dest.legal_disclaimer,
          }))

          setDestinations(transformedDestinations)
        }
      } catch (error) {
        console.error("[v0] Error fetching destinations:", error)
        // Fallback to empty if fetch fails
        setDestinations([])
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

  // Helper functions
  function getCountryFlag(locationGroup: string): string {
    const flagMap: Record<string, string> = {
      "North America": "🇲🇽", // Default Mexico for North America
      "South America": "🇧🇷",
      Europe: "🇮🇹",
      Mexico: "🇲🇽",
      USA: "🇺🇸",
      Canada: "🇨🇦",
      Brazil: "🇧🇷",
      Italy: "🇮🇹",
      Albania: "🇦🇱",
    }
    return flagMap[locationGroup] || "🌍"
  }

  function extractPropertyType(name: string): string {
    if (name.includes("Resort")) return "Resort"
    if (name.includes("Villa")) return "Villa"
    if (name.includes("Condo")) return "Condominio"
    if (name.includes("Apartment")) return "Apartamento"
    if (name.includes("Lodge")) return "Lodge"
    if (name.includes("Penthouse")) return "Penthouse"
    return "Propiedad"
  }

  if (loading) {
    return (
      <div className="relative w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando destinos globales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px]">
      <SphereImageGrid images={destinations} />

      {/* PROFECO Disclaimer */}
      <div className="absolute bottom-4 left-0 right-0 mx-auto max-w-3xl px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Aviso Legal:</strong> Los destinos mostrados operan bajo el modelo REQUEST → OFFER → CONFIRM. Las
            solicitudes están sujetas a disponibilidad sin garantías de confirmación. Este catálogo NO constituye
            propiedad, tiempo compartido ni inversión.
          </p>
        </div>
      </div>
    </div>
  )
}

const SphereImageGrid: React.FC<SphereImageGridProps> = ({
  images,
  containerSize = 400,
  sphereRadius = 200,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseImageScale = 0.12,
  hoverScale = 1.2,
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  className = "",
}) => {
  // ==========================================
  // STATE & REFS
  // ==========================================

  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [rotation, setRotation] = useState<RotationState>({ x: 15, y: 15, z: 0 })
  const [velocity, setVelocity] = useState<VelocityState>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<SphereImage | null>(null)
  const [imagePositions, setImagePositions] = useState<SphericalPosition[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const lastMousePos = useRef<MousePosition>({ x: 0, y: 0 })
  const animationFrame = useRef<number | null>(null)

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const actualSphereRadius = sphereRadius || containerSize * 0.5
  const baseImageSize = containerSize * baseImageScale

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const generateSpherePositions = useCallback((): SphericalPosition[] => {
    const positions: SphericalPosition[] = []
    const imageCount = images.length

    // Use Fibonacci sphere distribution for even coverage
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const angleIncrement = (2 * Math.PI) / goldenRatio

    for (let i = 0; i < imageCount; i++) {
      // Fibonacci sphere distribution
      const t = i / imageCount
      const inclination = Math.acos(1 - 2 * t)
      const azimuth = angleIncrement * i

      // Convert to degrees and focus on front hemisphere
      let phi = inclination * (180 / Math.PI)
      let theta = (azimuth * (180 / Math.PI)) % 360

      // Better pole coverage - reach poles but avoid extreme mathematical issues
      const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35 // Moderate boost toward poles
      if (phi < 90) {
        phi = Math.max(5, phi - poleBonus) // Reach closer to top pole (15° minimum)
      } else {
        phi = Math.min(175, phi + poleBonus) // Reach closer to bottom pole (165° maximum)
      }

      // Map to fuller vertical range - covers poles but avoids extremes
      phi = 15 + (phi / 180) * 150 // Map to 15-165 degrees for pole coverage with stability

      // Add slight randomization to prevent perfect patterns
      const randomOffset = (Math.random() - 0.5) * 20
      theta = (theta + randomOffset) % 360
      phi = Math.max(0, Math.min(180, phi + (Math.random() - 0.5) * 10))

      positions.push({
        theta: theta,
        phi: phi,
        radius: actualSphereRadius,
      })
    }

    return positions
  }, [images.length, actualSphereRadius])

  const calculateWorldPositions = useCallback((): WorldPosition[] => {
    const positions = imagePositions.map((pos, index) => {
      // Apply rotation using proper 3D rotation matrices
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta)
      const phiRad = SPHERE_MATH.degreesToRadians(pos.phi)
      const rotXRad = SPHERE_MATH.degreesToRadians(rotation.x)
      const rotYRad = SPHERE_MATH.degreesToRadians(rotation.y)

      // Initial position on sphere
      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad)
      let y = pos.radius * Math.cos(phiRad)
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad)

      // Apply Y-axis rotation (horizontal drag)
      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad)
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad)
      x = x1
      z = z1

      // Apply X-axis rotation (vertical drag)
      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad)
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad)
      y = y2
      z = z2

      const worldPos: Position3D = { x, y, z }

      // Calculate visibility with smooth fade zones
      const fadeZoneStart = -10 // Start fading out
      const fadeZoneEnd = -30 // Completely hidden
      const isVisible = worldPos.z > fadeZoneEnd

      // Calculate fade opacity based on Z position
      let fadeOpacity = 1
      if (worldPos.z <= fadeZoneStart) {
        // Linear fade from 1 to 0 as Z goes from fadeZoneStart to fadeZoneEnd
        fadeOpacity = Math.max(0, (worldPos.z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd))
      }

      // Check if this image originated from a pole position
      const isPoleImage = pos.phi < 30 || pos.phi > 150 // Images from extreme angles

      // Calculate distance from center for scaling (in 2D screen space)
      const distanceFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.y * worldPos.y)
      const maxDistance = actualSphereRadius
      const distanceRatio = Math.min(distanceFromCenter / maxDistance, 1)

      // Scale based on distance from center - be more forgiving for pole images
      const distancePenalty = isPoleImage ? 0.4 : 0.7 // Less penalty for pole images
      const centerScale = Math.max(0.3, 1 - distanceRatio * distancePenalty)

      // Also consider Z-depth for additional scaling
      const depthScale = (worldPos.z + actualSphereRadius) / (2 * actualSphereRadius)
      const scale = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3)

      return {
        ...worldPos,
        scale,
        zIndex: Math.round(1000 + worldPos.z),
        isVisible,
        fadeOpacity,
        originalIndex: index,
      }
    })

    // Apply collision detection to prevent overlaps
    const adjustedPositions = [...positions]

    for (let i = 0; i < adjustedPositions.length; i++) {
      const pos = adjustedPositions[i]
      if (!pos.isVisible) continue

      let adjustedScale = pos.scale
      const imageSize = baseImageSize * adjustedScale

      // Check for overlaps with other visible images
      for (let j = 0; j < adjustedPositions.length; j++) {
        if (i === j) continue

        const other = adjustedPositions[j]
        if (!other.isVisible) continue

        const otherSize = baseImageSize * other.scale

        // Calculate 2D distance between images on screen
        const dx = pos.x - other.x
        const dy = pos.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Minimum distance to prevent overlap (with more generous padding)
        const minDistance = (imageSize + otherSize) / 2 + 25

        if (distance < minDistance && distance > 0) {
          // More aggressive scale reduction to prevent overlap
          const overlap = minDistance - distance
          const reductionFactor = Math.max(0.4, 1 - (overlap / minDistance) * 0.6)
          adjustedScale = Math.min(adjustedScale, adjustedScale * reductionFactor)
        }
      }

      adjustedPositions[i] = {
        ...pos,
        scale: Math.max(0.25, adjustedScale), // Ensure minimum scale
      }
    }

    return adjustedPositions
  }, [imagePositions, rotation, actualSphereRadius, baseImageSize])

  const clampRotationSpeed = useCallback(
    (speed: number): number => {
      return Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, speed))
    },
    [maxRotationSpeed],
  )

  // ==========================================
  // PHYSICS & MOMENTUM
  // ==========================================

  const updateMomentum = useCallback(() => {
    if (isDragging) return

    setVelocity((prev) => {
      const newVelocity = {
        x: prev.x * momentumDecay,
        y: prev.y * momentumDecay,
      }

      // Stop animation if velocity is too low and auto-rotate is off
      if (!autoRotate && Math.abs(newVelocity.x) < 0.01 && Math.abs(newVelocity.y) < 0.01) {
        return { x: 0, y: 0 }
      }

      return newVelocity
    })

    setRotation((prev) => {
      let newY = prev.y

      // Add auto-rotation to Y axis (horizontal rotation)
      if (autoRotate) {
        newY += autoRotateSpeed
      }

      // Add momentum-based rotation
      newY += clampRotationSpeed(velocity.y)

      return {
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(velocity.x)),
        y: SPHERE_MATH.normalizeAngle(newY),
        z: prev.z,
      }
    })
  }, [isDragging, momentumDecay, velocity, clampRotationSpeed, autoRotate, autoRotateSpeed])

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setVelocity({ x: 0, y: 0 })
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - lastMousePos.current.x
      const deltaY = e.clientY - lastMousePos.current.y

      const rotationDelta = {
        x: -deltaY * dragSensitivity,
        y: deltaX * dragSensitivity,
      }

      setRotation((prev) => ({
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
        y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
        z: prev.z,
      }))

      // Update velocity for momentum
      setVelocity({
        x: clampRotationSpeed(rotationDelta.x),
        y: clampRotationSpeed(rotationDelta.y),
      })

      lastMousePos.current = { x: e.clientX, y: e.clientY }
    },
    [isDragging, dragSensitivity, clampRotationSpeed],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    setVelocity({ x: 0, y: 0 })
    lastMousePos.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const touch = e.touches[0]
      const deltaX = touch.clientX - lastMousePos.current.x
      const deltaY = touch.clientY - lastMousePos.current.y

      const rotationDelta = {
        x: -deltaY * dragSensitivity,
        y: deltaX * dragSensitivity,
      }

      setRotation((prev) => ({
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
        y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
        z: prev.z,
      }))

      setVelocity({
        x: clampRotationSpeed(rotationDelta.x),
        y: clampRotationSpeed(rotationDelta.y),
      })

      lastMousePos.current = { x: touch.clientX, y: touch.clientY }
    },
    [isDragging, dragSensitivity, clampRotationSpeed],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ==========================================
  // EFFECTS & LIFECYCLE
  // ==========================================

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setImagePositions(generateSpherePositions())
  }, [generateSpherePositions])

  useEffect(() => {
    const animate = () => {
      updateMomentum()
      animationFrame.current = requestAnimationFrame(animate)
    }

    if (isMounted) {
      animationFrame.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [isMounted, updateMomentum])

  useEffect(() => {
    if (!isMounted) return

    const container = containerRef.current
    if (!container) return

    // Mouse events
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    // Touch events
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMounted, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  // Calculate world positions once per render
  const worldPositions = calculateWorldPositions()

  const renderImageNode = useCallback(
    (image: SphereImage, index: number) => {
      const position = worldPositions[index]

      if (!position || !position.isVisible) return null

      const imageSize = baseImageSize * position.scale
      const isHovered = hoveredIndex === index
      const finalScale = isHovered ? Math.min(1.2, 1.2 / position.scale) : 1

      const xPercent = ((position.x + actualSphereRadius) / (2 * actualSphereRadius)) * 100
      const yPercent = ((position.y + actualSphereRadius) / (2 * actualSphereRadius)) * 100
      const visibility = position.fadeOpacity

      return (
        <div
          key={image.id}
          className="absolute cursor-pointer transition-all duration-300 group"
          style={{
            left: `${xPercent}%`,
            top: `${yPercent}%`,
            transform: `translate(-50%, -50%) scale(${position.scale})`,
            zIndex: position.zIndex,
            opacity: visibility,
            pointerEvents: visibility > 0.3 ? "auto" : "none",
          }}
          onClick={() => setSelectedImage(image)}
        >
          <div className="relative">
            <img
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              className="rounded-2xl shadow-2xl border-4 border-white group-hover:border-[#B5EAD7] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(181,234,215,0.6)]"
              style={{
                width: `${finalScale * 100}px`,
                height: `${finalScale * 100}px`,
                objectFit: "cover",
              }}
            />
            {image.flagEmoji && (
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl border-2 border-slate-200 group-hover:scale-110 transition-transform">
                {image.flagEmoji}
              </div>
            )}
          </div>
        </div>
      )
    },
    [worldPositions, baseImageSize, containerSize, hoveredIndex],
  )

  const renderSpotlightModal = () => {
    if (!selectedImage) return null

    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
        onClick={() => setSelectedImage(null)}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
            >
              <X className="h-6 w-6 text-slate-700" />
            </button>

            {/* Property image */}
            <div className="relative h-[400px] overflow-hidden">
              <img
                src={selectedImage.src || "/placeholder.svg"}
                alt={selectedImage.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Flag badge on image */}
              {selectedImage.flagEmoji && (
                <div className="absolute top-6 left-6 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-4xl border-4 border-white">
                  {selectedImage.flagEmoji}
                </div>
              )}
            </div>

            {/* Property details */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">{selectedImage.title}</h2>

              {selectedImage.description && (
                <p className="text-xl text-slate-600 mb-6 flex items-center gap-2">
                  <span className="text-2xl">{selectedImage.flagEmoji}</span>
                  {selectedImage.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedImage.country && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500 mb-1">País</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedImage.country}</div>
                  </div>
                )}

                {selectedImage.propertyType && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500 mb-1">Tipo de Propiedad</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedImage.propertyType}</div>
                  </div>
                )}
              </div>

              {selectedImage.availability && (
                <div className="bg-[#B5EAD7]/20 border-2 border-[#B5EAD7] rounded-xl p-4">
                  <div className="text-sm text-slate-600 mb-1">Disponibilidad</div>
                  <div className="text-lg font-semibold text-slate-900">{selectedImage.availability}</div>
                </div>
              )}

              {/* Legal disclaimer */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong>Aviso Legal:</strong> Este destino forma parte de la Red Global WEEK-CHAIN. Las solicitudes
                  están sujetas a disponibilidad y requieren aprobación mediante el flujo REQUEST → OFFER → CONFIRM. No
                  constituye propiedad, tiempo compartido ni garantiza acceso directo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // EARLY RETURNS
  // ==========================================

  if (!isMounted) {
    return (
      <div
        className="bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!images?.length) {
    return (
      <div
        className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        <div className="text-gray-400 text-center">
          <p>No images provided</p>
          <p className="text-sm">Add images to the images prop</p>
        </div>
      </div>
    )
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`relative select-none cursor-grab active:cursor-grabbing ${className}`}
        style={{
          width: containerSize,
          height: containerSize,
          perspective: `${perspective}px`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative w-full h-full" style={{ zIndex: 10 }}>
          {images.map((image, index) => renderImageNode(image, index))}
        </div>
      </div>

      {renderSpotlightModal()}
    </>
  )
}

export default DestinationSphere
