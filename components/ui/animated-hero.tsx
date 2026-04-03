"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(() => ["tokenizadas", "líquidas", "rentables", "seguras", "descentralizadas"], [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0)
      } else {
        setTitleNumber(titleNumber + 1)
      }
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex gap-6 md:gap-8 py-12 sm:py-16 md:py-20 lg:py-32 xl:py-40 items-center justify-center flex-col">
          <div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 md:gap-4 bg-white/80 backdrop-blur-sm border border-[#C7CEEA]/30 text-slate-800 hover:bg-white text-xs sm:text-sm px-3 py-2 md:px-4 md:py-2"
            >
              Preventa con Escrow Multisig <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl tracking-tighter text-center font-bold leading-tight">
              <span className="text-slate-900">Vacaciones</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-brand-gradient"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed tracking-tight text-slate-700 max-w-3xl text-center font-medium px-2">
              Cada derecho de uso vacacional se asocia a un certificado digital verificable, que puedes resguardar en tu wallet.
              <span className="block mt-4 text-[10px] sm:text-xs text-slate-500 font-normal leading-tight mx-auto max-w-2xl">
                El resguardo en wallet es solo para verificación y almacenamiento. La cesión/transferencia no es libre y requiere aprobación y validación KYC.
              </span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4">
            <Button
              asChild
              size="lg"
              className="gap-2 md:gap-4 w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px] bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#C7CEEA] hover:from-[#ff8a92] hover:via-[#ffa7a2] hover:to-[#b7beda] text-white text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:shadow-[#FF9AA2]/30 transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth/login">
                Comenzar Ahora <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 md:gap-4 w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px] border-2 border-[#C7CEEA] text-slate-800 hover:bg-[#C7CEEA]/10 hover:border-[#b7beda] text-sm md:text-base font-semibold h-12 md:h-14 rounded-xl md:rounded-2xl transition-all duration-300 glass bg-transparent"
            >
              <Link href="/properties">
                <Globe className="w-4 h-4 md:w-5 md:h-5" />
                Explorar Propiedades
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto mt-8 md:mt-12 w-full px-4">
            {[
              { value: "70+", label: "Propiedades Listas para Tokenizar", color: "#FF9AA2" },
              { value: "21", label: "Brokers Integrados", color: "#FFB7B2" },
              { value: "9", label: "Empresas de Servicios", color: "#B5EAD7" },
              { value: "Beta", label: "Fase Actual", color: "#C7CEEA" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-xl md:rounded-2xl glass border border-slate-200/60 p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                style={{ borderTopColor: stat.color, borderTopWidth: "3px" }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium text-balance">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { AnimatedHero }
