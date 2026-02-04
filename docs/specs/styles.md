# Especificación: Sistema de Estilos

## Ubicación
`app/globals.css` y Tailwind CSS v4

---

## Variables CSS

### Colores Base

```css
:root {
  /* Background & Foreground */
  --background: #ffffff;
  --foreground: #171717;

  /* Primary (Blue) */
  --primary: #2563eb;
  --primary-foreground: #ffffff;

  /* Secondary (Gray) */
  --secondary: #f3f4f6;
  --secondary-foreground: #374151;

  /* Destructive (Red) */
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;

  /* Muted */
  --muted: #f9fafb;
  --muted-foreground: #6b7280;

  /* Border & Ring */
  --border: #e5e7eb;
  --ring: #2563eb;

  /* Status Colors */
  --status-pending: #f59e0b;
  --status-in-progress: #3b82f6;
  --status-completed: #22c55e;

  /* Priority Colors */
  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #9ca3af;

  /* Date Indicators */
  --date-overdue: #dc2626;
  --date-today: #f97316;
  --date-soon: #eab308;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;

    --primary: #3b82f6;
    --primary-foreground: #ffffff;

    --secondary: #27272a;
    --secondary-foreground: #d4d4d8;

    --destructive: #ef4444;
    --destructive-foreground: #ffffff;

    --muted: #18181b;
    --muted-foreground: #a1a1aa;

    --border: #27272a;
    --ring: #3b82f6;
  }
}
```

---

## Tailwind Theme Inline

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);

  --color-status-pending: var(--status-pending);
  --color-status-in-progress: var(--status-in-progress);
  --color-status-completed: var(--status-completed);

  --color-priority-high: var(--priority-high);
  --color-priority-medium: var(--priority-medium);
  --color-priority-low: var(--priority-low);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

---

## Paleta de Colores para Tags

Colores predefinidos para etiquetas (Tailwind colors):

| Nombre | Clase BG | Clase Text |
|--------|----------|------------|
| red | bg-red-100 | text-red-800 |
| orange | bg-orange-100 | text-orange-800 |
| amber | bg-amber-100 | text-amber-800 |
| yellow | bg-yellow-100 | text-yellow-800 |
| lime | bg-lime-100 | text-lime-800 |
| green | bg-green-100 | text-green-800 |
| emerald | bg-emerald-100 | text-emerald-800 |
| teal | bg-teal-100 | text-teal-800 |
| cyan | bg-cyan-100 | text-cyan-800 |
| sky | bg-sky-100 | text-sky-800 |
| blue | bg-blue-100 | text-blue-800 |
| indigo | bg-indigo-100 | text-indigo-800 |
| violet | bg-violet-100 | text-violet-800 |
| purple | bg-purple-100 | text-purple-800 |
| fuchsia | bg-fuchsia-100 | text-fuchsia-800 |
| pink | bg-pink-100 | text-pink-800 |
| rose | bg-rose-100 | text-rose-800 |

### Dark Mode (Tags)

| Nombre | Clase BG Dark | Clase Text Dark |
|--------|---------------|-----------------|
| red | dark:bg-red-900 | dark:text-red-200 |
| ... | ... | ... |

---

## Tipografía

### Font Family

- **Sans**: Geist Sans (variable `--font-geist-sans`)
- **Mono**: Geist Mono (variable `--font-geist-mono`)

### Escala Tipográfica

| Elemento | Clase | Tamaño |
|----------|-------|--------|
| H1 (Page title) | text-2xl font-bold | 24px |
| H2 (Section) | text-xl font-semibold | 20px |
| H3 (Card title) | text-lg font-medium | 18px |
| Body | text-base | 16px |
| Small | text-sm | 14px |
| Caption | text-xs | 12px |

---

## Espaciado

### Sistema de 4px

| Token | Valor | Uso |
|-------|-------|-----|
| 1 | 4px | Gaps mínimos |
| 2 | 8px | Padding interno compacto |
| 3 | 12px | Padding estándar |
| 4 | 16px | Padding generoso |
| 6 | 24px | Separación entre secciones |
| 8 | 32px | Márgenes principales |

---

## Componentes Base

### Cards

```css
.card {
  @apply bg-background rounded-lg border border-border p-4 shadow-sm;
}

.card:hover {
  @apply shadow-md;
}
```

### Inputs

```css
.input {
  @apply w-full rounded-md border border-border bg-background px-3 py-2
         text-foreground placeholder:text-muted-foreground
         focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent;
}

.input-error {
  @apply border-destructive focus:ring-destructive;
}
```

### Buttons

```css
.btn {
  @apply inline-flex items-center justify-center rounded-md font-medium
         transition-colors focus:outline-none focus:ring-2 focus:ring-ring
         disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}

.btn-destructive {
  @apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
}

.btn-ghost {
  @apply bg-transparent hover:bg-secondary;
}
```

---

## Animaciones

### Transiciones

```css
/* Transición estándar para interacciones */
.transition-standard {
  @apply transition-all duration-200 ease-in-out;
}

/* Transición para modales */
.transition-modal {
  @apply transition-all duration-300 ease-out;
}
```

### Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Clases de Animación

```css
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-pulse {
  animation: pulse 2s infinite;
}
```

---

## Responsive Breakpoints

Tailwind defaults:

| Breakpoint | Min Width | Uso |
|------------|-----------|-----|
| `sm` | 640px | Móviles grandes |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Grid de Tareas

```css
.task-grid {
  @apply grid gap-4
         grid-cols-1
         sm:grid-cols-2
         lg:grid-cols-3;
}
```

---

## Z-Index Scale

| Nivel | Valor | Uso |
|-------|-------|-----|
| base | 0 | Contenido normal |
| dropdown | 10 | Dropdowns, tooltips |
| sticky | 20 | Headers sticky |
| modal-backdrop | 40 | Backdrop de modal |
| modal | 50 | Contenido de modal |
| toast | 60 | Notificaciones toast |

---

## Accesibilidad

### Focus Visible

```css
.focus-ring {
  @apply focus:outline-none focus-visible:ring-2
         focus-visible:ring-ring focus-visible:ring-offset-2;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

Todos los colores cumplen WCAG 2.1 AA:
- Texto normal: ratio mínimo 4.5:1
- Texto grande: ratio mínimo 3:1
- Elementos UI: ratio mínimo 3:1
