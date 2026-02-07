# 01 - Estrategia de Routing y Navegación

## Situación actual

- La app es single-page: todo vive en `app/page.tsx`
- El `Sidebar` tiene un NavItem "Calendario" con `active={currentPath === '/calendar'}`, pero no navega a ningún sitio
- `NavItem` tiene `href` en su interface pero renderiza un `<button>`, no un `<Link>`
- El layout Sidebar + main content está acoplado dentro de `app/page.tsx`

## Nueva ruta

Crear `app/calendar/page.tsx` usando la convención de App Router:

```
app/
├── layout.tsx          # Root layout (sin cambios)
├── page.tsx            # Vista principal (Mis Tareas) - refactorizar
└── calendar/
    └── page.tsx        # Vista Calendario (nueva)
```

## Estado en URL search params

El tipo de vista y la fecha de referencia se almacenan en URL search params:

```
/calendar                           → vista mes, fecha actual
/calendar?view=month&date=2025-02   → vista mes, febrero 2025
/calendar?view=week&date=2025-02-03 → vista semana que contiene el 3 feb
/calendar?view=day&date=2025-02-06  → vista día, 6 febrero
```

**Ventajas** sobre estado local:
- URLs compartibles/bookmarkeables
- Browser back/forward funciona nativamente
- No necesita localStorage adicional

**Valores por defecto**: `view=month`, `date=<hoy>`

## Componente AppShell

Extraer el layout compartido (Sidebar + `<main>`) en un componente reutilizable.

**Archivo**: `components/layout/AppShell.tsx`

```tsx
interface AppShellProps {
  children: React.ReactNode;
}
```

**Responsabilidades**:
- Renderizar el Sidebar (oculto en mobile, visible en desktop)
- Detectar la ruta activa con `usePathname()` de `next/navigation`
- Pasar `currentPath` al Sidebar
- Wrapper `<main>` con padding responsive

**Ejemplo de uso**:
```tsx
// app/page.tsx
export default function Home() {
  return (
    <AppShell>
      <PageHeader ... />
      <FilterChips ... />
      <TaskList ... />
    </AppShell>
  );
}

// app/calendar/page.tsx
export default function CalendarPage() {
  return (
    <AppShell>
      <CalendarView />
    </AppShell>
  );
}
```

## Modificaciones a NavItem

**Archivo**: `components/layout/NavItem.tsx`

Cambio: cuando `href` existe, renderizar `<Link>` de `next/link` en lugar de `<button>`.

```tsx
import Link from 'next/link';

export function NavItem({ icon, label, href, active, onClick }: NavItemProps) {
  const Icon = ICONS[icon];
  const classes = `flex items-center gap-3 w-full px-3.5 py-3 ...`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-current={active ? 'page' : undefined}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} aria-current={active ? 'page' : undefined}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}
```

## Modificaciones a Sidebar

**Archivo**: `components/layout/Sidebar.tsx`

Cambios:
1. Eliminar prop `currentPath` (se detecta internamente con `usePathname()`)
2. Pasar `href` a los NavItems que tienen ruta

```tsx
import { usePathname } from 'next/navigation';

export function Sidebar({ isOpen, onClose, user }) {
  const currentPath = usePathname();

  return (
    <aside ...>
      <nav>
        <NavItem icon="layout-dashboard" label="Dashboard" href="/" active={currentPath === '/'} />
        <NavItem icon="list-todo" label="Mis Tareas" href="/" active={currentPath === '/tasks'} />
        <NavItem icon="calendar" label="Calendario" href="/calendar" active={currentPath === '/calendar'} />
        <NavItem icon="settings" label="Ajustes" active={currentPath === '/settings'} />
      </nav>
      ...
    </aside>
  );
}
```

> **Nota**: "Dashboard" y "Mis Tareas" apuntan ambos a `/` por ahora (son la misma vista en el MVP).

## Refactor de app/page.tsx

Extraer el wrapper `<div className="flex min-h-screen">` + Sidebar + `<main>` en `AppShell`. La página queda solo con el contenido específico (PageHeader, FilterChips, TaskList, Modal).

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `components/layout/AppShell.tsx` | **Crear** |
| `components/layout/NavItem.tsx` | **Modificar** - soportar `<Link>` |
| `components/layout/Sidebar.tsx` | **Modificar** - `usePathname()`, pasar `href` |
| `components/layout/index.ts` | **Modificar** - exportar AppShell |
| `app/page.tsx` | **Modificar** - usar AppShell |
| `app/calendar/page.tsx` | **Crear** |
