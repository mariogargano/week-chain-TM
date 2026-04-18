"use client"

export function VaFiIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#vafiGradient)" />

      {/* Vacation icon (palm tree) */}
      <path d="M35 60 Q35 45 40 40 L38 35 Q42 38 45 35 L43 40 Q48 45 48 60" fill="white" fillOpacity="0.9" />
      <rect x="42" y="60" width="4" height="15" fill="white" fillOpacity="0.9" />

      {/* Finance icon (dollar sign) */}
      <path
        d="M60 35 L60 65 M55 40 Q55 35 60 35 Q65 35 65 40 Q65 45 60 45 M60 45 Q55 45 55 50 Q55 55 60 55 Q65 55 65 60 Q65 65 60 65"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Connecting line */}
      <line x1="48" y1="50" x2="55" y2="50" stroke="white" strokeWidth="2" strokeDasharray="2 2" />

      <defs>
        <linearGradient id="vafiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B5EAD7" />
          <stop offset="50%" stopColor="#C7CEEA" />
          <stop offset="100%" stopColor="#FF9AA2" />
        </linearGradient>
      </defs>
    </svg>
  )
}
