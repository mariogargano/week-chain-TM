"use client"

export function BetaWatermark() {
  return (
    <div className="fixed bottom-4 right-4 z-30 pointer-events-none select-none">
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-300/30 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-bold text-blue-700/70 tracking-wider">BETA</p>
      </div>
    </div>
  )
}
