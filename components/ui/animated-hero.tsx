"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "@/lib/i18n/use-translations"

const DEFAULT_TITLES = ["Vacaciones", "Certificados Verificados", "Destinos Premium", "15 Años", "Experiencias"]

function AnimatedHero() {
  const t = useTranslations()
  const [titleNumber, setTitleNumber] = useState(0)

  const titlesRef = useRef(DEFAULT_TITLES)
  const heroTitle = t?.hero?.title || "Democratizando el Acceso a"

  if (t?.hero?.animatedTitles && JSON.stringify(t.hero.animatedTitles) !== JSON.stringify(titlesRef.current)) {
    titlesRef.current = t.hero.animatedTitles
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titlesRef.current.length - 1 ? 0 : prev + 1))
    }, 3000)
    return () => clearTimeout(timeoutId)
  }, [titleNumber]) // Removed titles from dependencies to prevent infinite loop

  return (
    <div className="w-full relative overflow-hidden min-h-[100svh] sm:min-h-[90vh] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/luxury-resort-hero-background.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Content - Simple and Centered */}
      <div className="relative z-10 text-center px-6 sm:px-8 md:px-12 w-full max-w-[90%] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6 md:mb-8 text-balance"
        >
          ENJOY YOUR WEEKS
        </motion.h1>

        {/* Animated Word */}
        <div className="relative h-[40px] xs:h-[48px] sm:h-[56px] md:h-[70px] lg:h-[85px] xl:h-[100px] flex items-center justify-center mb-6 sm:mb-8 md:mb-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={titleNumber}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 15,
              }}
              className="absolute text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-black whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #FF9AA2 0%, #FFB7B2 30%, #FFDAC1 50%, #B5EAD7 70%, #C7CEEA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 4px 30px rgba(255, 154, 162, 0.3)",
              }}
            >
              {titlesRef.current[titleNumber]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Simple Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full bg-[#FF9AA2]/80 backdrop-blur-sm text-base sm:text-lg md:text-xl lg:text-2xl text-white font-semibold tracking-[0.15em] uppercase shadow-lg shadow-[#FF9AA2]/30"
        >
          Paga una vez. Disfruta 15 años.
        </motion.p>
      </div>
    </div>
  )
}

export { AnimatedHero }
