# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Task-It** es una webapp de gestión de tareas enfocada en el control de pendientes laborales. El desarrollo sigue un enfoque **MVP** (Minimum Viable Product) - implementar solo lo esencial, evitar over-engineering.

### Stack Técnico
- Next.js 16 con App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- lucide-react para iconos

## Development Guidelines

### Principios MVP
- Funcionalidad mínima que aporte valor real
- No añadir features "por si acaso"
- Iterar basándose en uso real

### UI/UX
- Mobile-first approach
- Interfaces limpias y minimalistas
- Feedback visual inmediato en acciones del usuario
- Estados de loading, error y empty states

### Commits
- Seguir Conventional Commits: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- Mensajes en inglés, descriptivos y concisos

## Development Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

- **Framework**: Next.js 16 with App Router (not Pages Router)
- **Styling**: Tailwind CSS v4 with PostCSS, dark mode via CSS variables and class-based toggle
- **Fonts**: Plus Jakarta Sans (headings), Inter (body), Geist (mono) via `next/font`
- **Icons**: lucide-react
- **Path alias**: `@/*` maps to project root

### Directory Structure

```
app/                    # Next.js App Router
├── layout.tsx          # Root layout with fonts and theme script
├── page.tsx            # Main view with Sidebar + TaskList
└── globals.css         # CSS variables and theme definitions

components/
├── layout/             # Layout components (Sidebar, PageHeader, NavItem, UserProfile)
├── task/               # Task-related components (TaskCard, TaskList, FilterChips, etc.)
└── ui/                 # Reusable UI components (Button, Modal, Input, ThemeToggle, etc.)

hooks/
├── useTasks.ts         # Task CRUD operations with localStorage
├── useTags.ts          # Tag management
├── useTaskFilters.ts   # Filtering logic
└── useTheme.ts         # Theme state management (system/light/dark)

lib/
├── types.ts            # TypeScript types
├── constants.ts        # App constants
└── utils.ts            # Utility functions (cn, date formatting)

docs/
├── design/             # Pencil design files (.pen)
└── plan/               # Implementation plans
```

## Configuration

- **TypeScript**: Strict mode enabled, ES2017 target, bundler module resolution
- **ESLint**: Flat config format with next/core-web-vitals and next/typescript presets
- **No testing framework configured yet**

## Design System: V3 Minimal Vibrant

### CSS Variables (defined in globals.css)
```css
/* Light theme (default) */
--background: #FFFFFF
--foreground: #18181B
--primary: #8B5CF6        /* Violet - main accent */
--secondary: #F4F4F5      /* Gray - cards, inputs */
--muted-foreground: #71717A
--border: #E4E4E7
--card: #F4F4F5

/* Dark theme (.dark class) */
--background: #18181B
--foreground: #FAFAFA
--primary: #A78BFA
--secondary: #27272A
--card: #27272A
```

### Border Radius Tokens
- `--radius-sm`: 14px (nav items, inputs)
- `--radius-md`: 20px (filter chips, avatars)
- `--radius-lg`: 24px (cards, buttons)

### Key Components
- **Sidebar**: 260px fixed width, contains nav + theme toggle + user profile
- **PageHeader**: Title + subtitle + search bar + action buttons
- **TaskCard**: Horizontal layout with circular checkbox, tag badge, date
- **FilterChips**: Horizontal tag-based filters

## Correcciones y Lecciones Aprendidas

### NUNCA usar colores hex hardcodeados
**Problema**: Los colores hex como `bg-[#F4F4F5]` o `text-[#71717A]` no responden al cambio de tema.

**Solución**: Siempre usar variables CSS de Tailwind:
```tsx
// ❌ MAL
className="bg-[#F4F4F5] text-[#71717A]"

// ✅ BIEN
className="bg-card text-muted-foreground"
```

**Mapeo de colores:**
| Hex (Light) | Variable Tailwind |
|-------------|-------------------|
| `#FFFFFF` | `bg-background` |
| `#F4F4F5` | `bg-secondary` o `bg-card` |
| `#8B5CF6` | `bg-primary` o `text-primary` |
| `#18181B` | `text-foreground` |
| `#71717A` | `text-muted-foreground` |
| `#E4E4E7` | `border-border` |

### Dark mode en badges de colores
Para tags/badges con colores específicos, añadir variante dark:
```tsx
// Ejemplo para tag naranja
className="bg-orange-500/20 text-orange-600 dark:text-orange-400"
```

### Theme Toggle
El componente `ThemeToggle` está en el Sidebar. Usa el hook `useTheme` que:
- Persiste en localStorage con key `task-it-theme`
- Soporta 3 modos: `system`, `light`, `dark`
- El script inline en layout.tsx previene flash de tema al cargar

### Diseño en Pencil.app
El archivo de diseño está en `docs/design/task-it.pen`. Frame de referencia: "Task Manager App V3 - Minimal Vibrant".
