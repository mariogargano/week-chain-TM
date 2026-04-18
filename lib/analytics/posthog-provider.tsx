"use client"

import type React from "react"

// PostHog temporarily disabled due to Vercel security scanner false positive
// PostHog tokens are meant to be public, but Vercel flags them as sensitive
// Alternative: Add PostHog via script tag in layout.tsx or use their snippet

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
