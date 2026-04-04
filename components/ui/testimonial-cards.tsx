"use client"

import * as React from "react"
import { motion } from "framer-motion"

export function TestimonialCard({
  handleShuffle,
  testimonial,
  position,
  id,
  author,
  role,
}: {
  handleShuffle: () => void
  testimonial: string
  position: "front" | "middle" | "back"
  id: number
  author: string
  role: string
}) {
  const dragRef = React.useRef(0)
  const isFront = position === "front"

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? "2" : position === "middle" ? "1" : "0",
      }}
      animate={{
        rotate: position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "33%" : "66%",
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onDragStart={(e) => {
        dragRef.current = e.clientX
      }}
      onDragEnd={(e) => {
        if (dragRef.current - e.clientX > 150) {
          handleShuffle()
        }
        dragRef.current = 0
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[450px] w-[350px] select-none place-content-center space-y-6 rounded-2xl border-2 border-slate-700 bg-slate-800/20 p-6 shadow-xl backdrop-blur-md ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img
        src={`/.jpg?height=128&width=128&query=${author}`}
        alt={`Avatar de ${author}`}
        className="pointer-events-none mx-auto h-32 w-32 rounded-full border-2 border-slate-700 bg-slate-200 object-cover"
      />
      <span className="text-center text-lg italic text-slate-400">"{testimonial}"</span>
      <div className="text-center">
        <span className="block text-sm font-medium text-indigo-400">{author}</span>
        <span className="block text-xs text-slate-500">{role}</span>
      </div>
    </motion.div>
  )
}

export function ShuffleTestimonials() {
  const [positions, setPositions] = React.useState<("front" | "middle" | "back")[]>(["front", "middle", "back"])

  const testimonials = [
    {
      id: 1,
      testimonial:
        "Tokenizar mi propiedad con WEEK-CHAIN™ fue la mejor decisión. Vendí las 52 semanas en menos de 6 meses y el proceso legal fue impecable.",
      author: "Carlos Mendoza",
      role: "Propietario - Villa en Tulum",
    },
    {
      id: 2,
      testimonial:
        "Como broker, WEEK-CHAIN™ me ha dado acceso a un nuevo mercado de inversión. Mis clientes están fascinados con el concepto de NFTs inmobiliarios.",
      author: "Sofia Ramírez",
      role: "Broker Elite - Ciudad de México",
    },
    {
      id: 3,
      testimonial:
        "Compré 4 semanas en diferentes propiedades y es increíble. Puedo vacacionar en lugares exclusivos sin la carga de mantener una propiedad completa.",
      author: "Marco Bellini",
      role: "Inversor - Portfolio de 8 NFTs",
    },
  ]

  const handleShuffle = () => {
    const newPositions = [...positions]
    newPositions.unshift(newPositions.pop()!)
    setPositions(newPositions)
  }

  return (
    <div className="relative -ml-[100px] h-[450px] w-[350px] md:-ml-[175px]">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard
          key={testimonial.id}
          {...testimonial}
          handleShuffle={handleShuffle}
          position={positions[index]}
        />
      ))}
    </div>
  )
}
