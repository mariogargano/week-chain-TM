"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n/config"
import { useLocale, setLocale } from "@/lib/i18n/use-translations"
import { Globe } from "lucide-react"

export function LanguageSelector() {
  const currentLocale = useLocale()

  const switchLanguage = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-2 border-[#C7CEEA]/50 hover:border-[#FF9AA2] hover:bg-[#FF9AA2]/5 bg-white px-4 py-2 min-h-[44px] shadow-sm w-full lg:w-auto"
        >
          <span className="text-lg">{localeFlags[currentLocale]}</span>
          <span className="text-sm font-semibold text-slate-700">{localeNames[currentLocale]}</span>
          <Globe className="h-4 w-4 text-slate-500 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white shadow-xl border border-slate-200 z-[100001]"
        sideOffset={8}
      >
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={`cursor-pointer py-3 px-4 text-base ${
              currentLocale === locale ? "bg-[#FF9AA2]/10 font-semibold text-[#FF9AA2]" : "hover:bg-slate-50"
            }`}
          >
            <span className="mr-3 text-xl">{localeFlags[locale]}</span>
            <span className="flex-1">{localeNames[locale]}</span>
            {currentLocale === locale && <span className="text-[#FF9AA2] text-lg font-bold">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
