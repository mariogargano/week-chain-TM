"use client"

export function WeekTokenIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer circle with gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#weekGradient)" />

      {/* Inner hexagon shape */}
      <path
        d="M50 15 L75 30 L75 60 L50 75 L25 60 L25 30 Z"
        fill="white"
        fillOpacity="0.2"
        stroke="white"
        strokeWidth="2"
      />

      {/* W letter stylized */}
      <path
        d="M30 35 L35 55 L40 40 L45 55 L50 35 L55 55 L60 40 L65 55 L70 35"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small circles for decoration */}
      <circle cx="50" cy="65" r="3" fill="white" />
      <circle cx="40" cy="62" r="2" fill="white" fillOpacity="0.7" />
      <circle cx="60" cy="62" r="2" fill="white" fillOpacity="0.7" />

      <defs>
        <linearGradient id="weekGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9AA2" />
          <stop offset="50%" stopColor="#FFB7B2" />
          <stop offset="100%" stopColor="#C7CEEA" />
        </linearGradient>
      </defs>
    </svg>
  )
}
