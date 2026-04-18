import type React from "react"

interface SimpleResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

/**
 * Simple wrapper for existing tables to make them responsive with horizontal scroll
 * Use this for quick fixes to existing tables without refactoring
 */
export function SimpleResponsiveTable({ children, className = "" }: SimpleResponsiveTableProps) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">{children}</div>
      </div>
    </div>
  )
}
