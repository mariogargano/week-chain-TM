# Sistema de Internacionalización (i18n)

## Descripción General

WEEK-CHAIN™ soporta 5 idiomas:
- 🇪🇸 Español (es) - Idioma por defecto
- 🇺🇸 English (en)
- 🇧🇷 Português (pt)
- 🇫🇷 Français (fr)
- 🇮🇹 Italiano (it)

## Arquitectura

### Archivos Principales

\`\`\`
lib/i18n/
├── config.ts           # Configuración de locales
├── translations.ts     # Traducciones por idioma
├── use-translations.ts # Hook para usar traducciones
├── use-locale.ts       # Hook avanzado con formateo
├── locale.ts           # Funciones de detección y cambio
└── format.ts           # Funciones de formateo
\`\`\`

## Uso Básico

### 1. Usar Traducciones en Componentes

\`\`\`typescript
import { useTranslations } from "@/lib/i18n/use-translations"

export function MyComponent() {
  const t = useTranslations()
  
  return (
    <div>
      <h1>{t.nav.home}</h1>
      <p>{t.hero.title}</p>
    </div>
  )
}
\`\`\`

### 2. Usar Hook Avanzado con Formateo

\`\`\`typescript
import { useI18n } from "@/lib/i18n/use-locale"

export function MyComponent() {
  const { t, locale, setLocale, fmtDate, fmtCurrency } = useI18n()
  
  const price = 50000
  const date = new Date()
  
  return (
    <div>
      <h1>{t.hero.title}</h1>
      <p>Precio: {fmtCurrency(price)}</p>
      <p>Fecha: {fmtDate(date)}</p>
      <button onClick={() => setLocale("en")}>
        Switch to English
      </button>
    </div>
  )
}
\`\`\`

## Funciones de Formateo

### fmtDate(date, locale)
Formatea fechas según el locale:
\`\`\`typescript
fmtDate(new Date(), "es") // "29 de enero de 2025"
fmtDate(new Date(), "en") // "January 29, 2025"
\`\`\`

### fmtCurrency(number, locale, currency)
Formatea moneda:
\`\`\`typescript
fmtCurrency(50000, "es", "USD") // "$50,000.00"
fmtCurrency(50000, "en", "USD") // "$50,000.00"
fmtCurrency(50000, "es", "MXN") // "$50,000.00 MXN"
\`\`\`

### fmtNumber(number, locale)
Formatea números:
\`\`\`typescript
fmtNumber(1234567, "es") // "1.234.567"
fmtNumber(1234567, "en") // "1,234,567"
\`\`\`

### fmtPercent(number, locale)
Formatea porcentajes:
\`\`\`typescript
fmtPercent(0.15, "es") // "15,00%"
fmtPercent(0.15, "en") // "15.00%"
\`\`\`

### fmtDateTime(date, locale)
Formatea fecha y hora:
\`\`\`typescript
fmtDateTime(new Date(), "es") // "29 de enero de 2025, 14:30"
fmtDateTime(new Date(), "en") // "January 29, 2025, 2:30 PM"
\`\`\`

### fmtRelativeTime(date, locale)
Formatea tiempo relativo:
\`\`\`typescript
fmtRelativeTime(yesterday, "es") // "hace 1 día"
fmtRelativeTime(yesterday, "en") // "1 day ago"
\`\`\`

## Agregar Nuevas Traducciones

### 1. Editar `lib/i18n/translations.ts`

\`\`\`typescript
export const translations = {
  es: {
    // ... existing translations
    myNewSection: {
      title: "Mi Título",
      description: "Mi Descripción",
    },
  },
  en: {
    // ... existing translations
    myNewSection: {
      title: "My Title",
      description: "My Description",
    },
  },
  // ... otros idiomas
}
\`\`\`

### 2. Usar en Componentes

\`\`\`typescript
const t = useTranslations()
return <h1>{t.myNewSection.title}</h1>
\`\`\`

## Selector de Idioma

El componente `LanguageSelector` ya está integrado en el navbar:

\`\`\`typescript
import { LanguageSelector } from "@/components/language-selector"

<LanguageSelector />
\`\`\`

## Detección Automática

El sistema detecta automáticamente el idioma del navegador:

1. Verifica localStorage
2. Si no existe, detecta idioma del navegador
3. Si no está soportado, usa español (default)

## Cambiar Idioma Programáticamente

\`\`\`typescript
import { setLocale } from "@/lib/i18n/locale"

// Cambiar a inglés
setLocale("en")

// Cambiar a portugués
setLocale("pt")
\`\`\`

## Mejores Prácticas

1. **Siempre usar traducciones**: Nunca hardcodear texto en español
2. **Usar funciones de formateo**: Para fechas, monedas y números
3. **Mantener estructura consistente**: Todas las traducciones deben tener la misma estructura
4. **Agregar traducciones completas**: Cuando agregues una key, agrégala en todos los idiomas

## Testing

Para testear diferentes idiomas:

1. Cambiar idioma en el selector del navbar
2. O usar localStorage:
   \`\`\`javascript
   localStorage.setItem("locale", "en")
   window.location.reload()
   \`\`\`

## Roadmap

- [ ] Agregar más idiomas (alemán, japonés, chino)
- [ ] Implementar traducciones dinámicas desde Supabase
- [ ] Agregar soporte para RTL (árabe, hebreo)
- [ ] Implementar lazy loading de traducciones
- [ ] Agregar herramienta de gestión de traducciones

## Soporte

Para agregar o modificar traducciones, contactar al equipo de desarrollo.
