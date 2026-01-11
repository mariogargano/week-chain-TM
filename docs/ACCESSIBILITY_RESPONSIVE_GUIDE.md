# Guía de Accesibilidad y Diseño Responsive

## 🎯 Objetivo

Asegurar que WEEK-CHAIN™ sea accesible para todos los usuarios y funcione perfectamente en cualquier dispositivo.

---

## ♿ Accesibilidad (A11y)

### Skip to Main Content

Implementado en `app/layout.tsx`:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
>
  Saltar al contenido principal
</a>
```

**Beneficios:**
- Usuarios de teclado pueden saltar la navegación
- Screen readers pueden navegar más rápido
- Cumple con WCAG 2.1 AA

### Etiquetas ARIA

**Siempre usar:**
```tsx
<button aria-label="Cerrar modal">
  <X className="h-4 w-4" />
</button>

<nav aria-label="Navegación principal">
  {/* ... */}
</nav>

<section aria-labelledby="titulo-seccion">
  <h2 id="titulo-seccion">Título</h2>
</section>
```

### Contraste de Colores

**Mínimos WCAG 2.1 AA:**
- Texto normal: 4.5:1
- Texto grande (18px+): 3:1
- Elementos UI: 3:1

**Verificar con:**
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- axe DevTools

### Navegación por Teclado

**Todos los elementos interactivos deben ser accesibles:**
```tsx
// ✅ Correcto
<button onClick={handleClick}>Acción</button>

// ❌ Incorrecto
<div onClick={handleClick}>Acción</div>

// ✅ Si necesitas div, agrega role y tabIndex
<div role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown}>
  Acción
</div>
```

### Screen Readers

**Texto oculto visualmente pero accesible:**
```tsx
<span className="sr-only">Información para screen readers</span>
```

**Estados dinámicos:**
```tsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

## 📱 Diseño Responsive

### Breakpoints de Tailwind

```
sm: 640px   // Móvil grande
md: 768px   // Tablet
lg: 1024px  // Desktop pequeño
xl: 1280px  // Desktop
2xl: 1536px // Desktop grande
```

### Tablas Responsive

#### Opción 1: Componente ResponsiveTable (Recomendado)

Para tablas nuevas o refactorizaciones completas:

```tsx
import { ResponsiveTable } from "@/components/responsive-table"

const columns = [
  {
    key: "name",
    label: "Nombre",
    render: (item) => item.name,
  },
  {
    key: "email",
    label: "Email",
    render: (item) => item.email,
  },
  {
    key: "status",
    label: "Estado",
    render: (item) => <Badge>{item.status}</Badge>,
  },
]

<ResponsiveTable
  data={users}
  columns={columns}
  keyExtractor={(user) => user.id}
  emptyMessage="No hay usuarios"
/>
```

**Características:**
- Tabla en desktop (md+)
- Cards en móvil
- Loading state
- Empty state
- Totalmente tipado con TypeScript

#### Opción 2: SimpleResponsiveTable (Quick Fix)

Para tablas existentes que solo necesitan scroll horizontal:

```tsx
import { SimpleResponsiveTable } from "@/components/simple-responsive-table"

<SimpleResponsiveTable>
  <table className="w-full">
    {/* ... tabla existente ... */}
  </table>
</SimpleResponsiveTable>
```

#### Opción 3: Patrón Manual

Para casos especiales con diseño custom:

```tsx
{/* Desktop */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    {/* ... */}
  </table>
</div>

{/* Mobile */}
<div className="block md:hidden space-y-4">
  {items.map((item) => (
    <Card key={item.id}>
      <CardContent>
        {/* Custom mobile layout */}
      </CardContent>
    </Card>
  ))}
</div>
```

### Imágenes Responsive

```tsx
// Next.js Image con responsive
<Image
  src="/property.jpg"
  alt="Descripción de la propiedad"
  width={800}
  height={600}
  className="w-full h-auto"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// Background responsive
<div className="bg-cover bg-center h-48 md:h-64 lg:h-96" style={{ backgroundImage: 'url(...)' }} />
```

### Tipografía Responsive

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
  Título Responsive
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Párrafo responsive
</p>
```

### Espaciado Responsive

```tsx
<div className="p-4 md:p-6 lg:p-8">
  <div className="space-y-4 md:space-y-6 lg:space-y-8">
    {/* Contenido */}
  </div>
</div>
```

### Grid Responsive

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {items.map((item) => (
    <Card key={item.id}>{/* ... */}</Card>
  ))}
</div>
```

---

## 🧪 Testing

### Checklist de Accesibilidad

- [ ] Skip to main content funciona
- [ ] Navegación completa por teclado (Tab, Enter, Escape)
- [ ] Contraste de colores cumple WCAG AA
- [ ] Todas las imágenes tienen alt text
- [ ] Formularios tienen labels asociados
- [ ] Estados de error son anunciados
- [ ] Modales atrapan el foco
- [ ] Screen reader puede navegar todo el contenido

### Checklist Responsive

- [ ] Móvil (375px - iPhone SE)
- [ ] Móvil grande (414px - iPhone Pro Max)
- [ ] Tablet (768px - iPad)
- [ ] Desktop (1280px)
- [ ] Desktop grande (1920px)
- [ ] Tablas no causan scroll horizontal no deseado
- [ ] Imágenes se adaptan correctamente
- [ ] Texto es legible en todos los tamaños
- [ ] Botones son fáciles de tocar (min 44x44px)

### Herramientas

**Accesibilidad:**
- Lighthouse (Chrome DevTools)
- axe DevTools (extensión)
- WAVE (extensión)
- Screen reader (NVDA, JAWS, VoiceOver)

**Responsive:**
- Chrome DevTools Device Mode
- Responsive Design Checker
- BrowserStack (testing real devices)

---

## 📋 Mejores Prácticas

### DO ✅

- Usar componentes semánticos (`<button>`, `<nav>`, `<main>`)
- Agregar aria-labels a iconos sin texto
- Probar con teclado y screen reader
- Diseñar mobile-first
- Usar ResponsiveTable para tablas complejas
- Mantener jerarquía de headings (h1 → h2 → h3)
- Agregar estados de loading y error

### DON'T ❌

- Usar `<div>` con onClick sin role/tabIndex
- Olvidar alt text en imágenes
- Usar solo color para transmitir información
- Asumir que todos usan mouse
- Crear tablas que no funcionan en móvil
- Usar texto muy pequeño (<14px)
- Ignorar estados de focus

---

## 🚀 Implementación Gradual

### Fase 1: Crítico (Completado)
- ✅ Skip to main content
- ✅ Componentes ResponsiveTable
- ✅ Documentación

### Fase 2: Páginas Admin (En Progreso)
- [ ] Refactorizar tablas de admin con ResponsiveTable
- [ ] Agregar aria-labels faltantes
- [ ] Mejorar navegación por teclado

### Fase 3: Páginas Públicas
- [ ] Landing page responsive
- [ ] Formularios accesibles
- [ ] Modales con trap focus

### Fase 4: Optimización
- [ ] Audit completo con Lighthouse
- [ ] Testing con usuarios reales
- [ ] Certificación WCAG 2.1 AA

---

## 📚 Referencias

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Accessibility](https://nextjs.org/docs/accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

**Última actualización:** Enero 2025  
**Mantenido por:** Equipo WEEK-CHAIN™
