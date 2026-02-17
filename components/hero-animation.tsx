"use client"

import { useEffect, useState } from "react"

export function HeroAnimation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#FF9AA2]/20 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#C7CEEA]/20 blur-3xl animate-float-delayed" />
      <div
        className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-[#B5EAD7]/15 blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      {/* Floating NFT cards */}
      <div className="absolute top-1/4 right-1/4 animate-float-slow">
        <div className="glass rounded-2xl p-4 border border-white/40 shadow-xl backdrop-blur-md w-48">
          <div className="h-32 bg-gradient-to-br from-[#FF9AA2] to-[#C7CEEA] rounded-xl mb-3" />
          <div className="h-2 bg-slate-200 rounded mb-2" />
          <div className="h-2 bg-slate-200 rounded w-2/3" />
        </div>
      </div>

      <div className="absolute bottom-1/4 left-1/4 animate-float-slow" style={{ animationDelay: "2s" }}>
        <div className="glass rounded-2xl p-4 border border-white/40 shadow-xl backdrop-blur-md w-48">
          <div className="h-32 bg-gradient-to-br from-[#B5EAD7] to-[#FFB7B2] rounded-xl mb-3" />
          <div className="h-2 bg-slate-200 rounded mb-2" />
          <div className="h-2 bg-slate-200 rounded w-2/3" />
        </div>
      </div>

      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-white/30 animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  )
}
