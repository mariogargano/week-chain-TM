import Link from "next/link"
import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full overflow-hidden group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#c7ceea]/40 group-hover:shadow-xl group-hover:shadow-[#ff9aa2]/50">
        <Image src="/logo.png" alt="WEEK-CHAIN™ Logo" width={48} height={48} className="object-cover" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-white tracking-tight leading-none">
          WEEK-CHAIN<sup className="text-[10px] ml-0.5">™</sup>
        </span>
        <span className="text-[10px] font-medium text-gray-400 tracking-wide">Smart Vacational Certificate</span>
      </div>
    </Link>
  )
}
