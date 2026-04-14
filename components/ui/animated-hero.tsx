"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/lib/i18n/use-translations";
import { Play } from "lucide-react";
import Link from "next/link";

const DEFAULT_TITLES = ["Vacaciones", "Certificados Verificados", "Destinos Premium", "15 Años", "Experiencias"]

function AnimatedHero() {
  const t = useTranslations()
  const [titleNumber, setTitleNumber] = useState(0)

  const titlesRef = useRef(DEFAULT_TITLES)

  if (t?.hero?.animatedTitles && JSON.stringify(t?.hero?.animatedTitles) !== JSON.stringify(titlesRef?.current)) {
    titlesRef.current = t?.hero?.animatedTitles
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titlesRef?.current?.length - 1 ? 0 : prev + 1))
    }, 3000)
    return () => clearTimeout(timeoutId)
  }, [titleNumber])

  return (
    <div className="w-full relative overflow-hidden min-h-[100svh] sm:min-h-[90vh] flex items-center justify-center">
      {/* Background - resort hero image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/luxury-resort-hero-background.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>
      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-8 md:px-12 w-full max-w-[90%] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pt-16 sm:pt-12">
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 md:mb-8 text-balance"
        >
          ENJOY YOUR WEEKS
        </motion.h1>

        {/* Animated Word */}
        <div className="relative h-[44px] sm:h-[56px] md:h-[70px] lg:h-[85px] xl:h-[100px] flex items-center justify-center mb-6 sm:mb-8 md:mb-10">
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
              className="absolute text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-black whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #22d3ee 35%, #06b6d4 60%, #0ea5e9 80%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {titlesRef?.current?.[titleNumber]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full bg-sky-500/80 backdrop-blur-sm text-base sm:text-lg md:text-xl lg:text-2xl text-white font-semibold tracking-[0.12em] uppercase shadow-lg shadow-sky-500/30"
        >
          Paga una vez. Disfruta 15 años.
        </motion.p>

        {/* CTA Button - visible on ALL devices including mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 sm:mt-10"
        >
          <Link href="/auth">
            <button className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 hover:shadow-2xl transition-all rounded-2xl hover:scale-105 shadow-xl shadow-sky-500/40 border border-sky-300/50 active:scale-[0.98] min-h-[52px]">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white group-hover:scale-110 transition-transform" />
              <span>COMENZAR</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export { AnimatedHero }
