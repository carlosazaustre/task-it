# Componentes a Modificar

## 1. `app/page.tsx` - Vista Principal

### Cambios Requeridos

**Antes:**
```tsx
<div className="min-h-screen">
  <header className="sticky top-0 ...">
    {/* Header horizontal */}
  </header>
  <main className="container mx-auto px-4 py-6">
    <TaskFilters ... />
    <TaskList ... />
  </main>
  <Modal ... />
</div>
```

**Después:**
```tsx
<MainLayout>
  <div className="p-10 lg:p-12">
    {/* Page Header */}
    <PageHeader
      title="Mis Tareas"
      subtitle="Gestiona y organiza tus tareas diarias"
      searchValue={filters.search}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      actions={
        <Button onClick={handleCreateTask} variant="primary">
          <Plus className="w-5 h-5 mr-1.5" />
          Nueva Tarea
        </Button>
      }
    />

    {/* Filter Chips */}
    <FilterChips
      options={filterOptions}
      selected={selectedFilter}
      onChange={setSelectedFilter}
    />

    {/* Task List */}
    <div className="mt-8">
      <TaskList ... />
    </div>
  </div>
  <Modal ... />
</MainLayout>
```

### Cambios Específicos

1. **Eliminar** header sticky actual
2. **Envolver** en `MainLayout`
3. **Usar** `PageHeader` para título + búsqueda + botón
4. **Reemplazar** `TaskFilters` por `FilterChips` (simplificado)
5. **Ajustar** padding del contenido (40px vertical, 48px horizontal)
6. **Mover** ThemeToggle a otro lugar (settings o sidebar)

---

## 2. `components/task/TaskCard.tsx`

### Cambios de Diseño

| Aspecto | Antes | Después |
|---------|-------|---------|
| Layout | Vertical, multi-sección | Horizontal, 2 columnas |
| Status | Badge clickeable | Checkbox circular |
| Priority | Badge arriba | Eliminar (opcional) |
| Border | border-left por status | Sin border, fondo sólido |
| Actions | Botones visibles | Ocultos (hover/menu) |
| Tags | Múltiples, abajo | Uno principal, derecha |
| Date | Con icono, izquierda | Texto simple, derecha |

### Nueva Estructura

```tsx
export function TaskCard({ task, tags, onStatusChange, onEdit }: TaskCardProps) {
  const mainTag = tags.find(t => task.tags.includes(t.id));
  const isCompleted = task.status === 'completed';

  return (
    <article
      className={cn(
        'flex items-center justify-between p-5 bg-card rounded-[24px]',
        'transition-all hover:shadow-md cursor-pointer',
        isCompleted && 'opacity-60'
      )}
      onClick={() => onEdit(task)}
    >
      {/* Left: Checkbox + Content */}
      <div className="flex items-center gap-4">
        {/* Status Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task.id);
          }}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center',
            'transition-all',
            isCompleted
              ? 'bg-primary'
              : 'border-2 border-border hover:border-primary'
          )}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Task Content */}
        <div className="flex flex-col gap-0.5">
          <h3 className={cn(
            'text-base font-semibold',
            isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
          )}>
            {task.title}
          </h3>
          <p className="text-[13px] text-muted-foreground">
            {mainTag?.name} · {formatTaskMeta(task)}
          </p>
        </div>
      </div>

      {/* Right: Tag Badge + Date */}
      <div className="flex flex-col items-end gap-2">
        {mainTag && (
          <span className={cn(
            'px-2.5 py-1 rounded-xl text-[11px] font-semibold',
            getTagStyles(mainTag.color)
          )}>
            {mainTag.name}
          </span>
        )}
        {task.dueDate && (
          <span className="text-xs font-medium text-[#A1A1AA]">
            {formatShortDate(task.dueDate)}
          </span>
        )}
      </div>
    </article>
  );
}
```

### Helpers Nuevos

```typescript
// lib/dateUtils.ts
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short'
  }).format(date);
}

export function formatTaskMeta(task: Task): string {
  if (task.dueDate) {
    const isToday = isSameDay(task.dueDate, new Date());
    if (isToday) {
      return `Hoy, ${formatTime(task.dueDate)}`;
    }
    return formatShortDate(task.dueDate);
  }
  return 'Sin fecha';
}
```

---

## 3. `components/task/TaskList.tsx`

### Cambios Requeridos

**Antes:**
```tsx
<div className="task-grid"> {/* Grid 3 columnas */}
  {tasks.map(task => <TaskCard ... />)}
</div>
```

**Después:**
```tsx
<div className="flex flex-col gap-3">
  {tasks.map(task => <TaskCard ... />)}
</div>
```

### Cambios Específicos
1. Cambiar de grid a flex vertical
2. Gap de 12px (gap-3)
3. Mantener lógica de loading y empty state

---

## 4. `components/task/TaskFilters.tsx`

### Opción A: Simplificar a FilterChips

Reemplazar completamente por el nuevo componente `FilterChips.tsx`:
- Solo filtros por categoría (tag)
- Sin búsqueda (movida al header)
- Sin filtros de estado/prioridad (o en modal avanzado)

### Opción B: Mantener Filtros Avanzados

Separar en dos componentes:
1. `FilterChips.tsx` - Chips simples visibles
2. `AdvancedFilters.tsx` - Modal/drawer con filtros completos

**Recomendación:** Opción A para MVP, añadir B si se necesita.

### Mapeo de Filtros

El diseño muestra estas categorías:
- Todas
- Trabajo
- Personal
- Urgente
- Reunión
- Idea

Esto implica que los **tags** actuales funcionan como categorías de filtro.

---

## 5. `components/ui/Button.tsx`

### Ajustes Menores

El botón actual ya tiene la variante `primary`. Verificar:
- Border radius: 24px para botón grande (Nueva Tarea)
- Padding: 10px vertical, 18px horizontal
- Gap icono-texto: 6px

```tsx
// Añadir variante o size para el botón del header
const buttonVariants = cva(
  // base styles...
  {
    variants: {
      size: {
        // ...existing
        header: 'px-[18px] py-2.5 gap-1.5 rounded-[24px]',
      }
    }
  }
);
```

---

## 6. `app/globals.css`

### Ajustes de Tipografía

```css
/* Añadir fuente Inter si no está */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@theme inline {
  /* Añadir */
  --font-inter: 'Inter', sans-serif;
}

/* Aplicar a body */
body {
  font-family: var(--font-inter), sans-serif;
}
```

### Clases Utilitarias Nuevas

```css
/* Heading font */
.font-heading {
  font-family: var(--font-jakarta);
}

/* Card sin border */
.card-flat {
  background-color: var(--card);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}
```

---

## 7. `app/layout.tsx`

### Posibles Cambios

- Añadir fuente Inter al `next/font` loader
- Ajustar metadata si es necesario
- Verificar que no hay conflictos con el nuevo layout

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// En el body
<body className={`${geistSans.variable} ${jakarta.variable} ${inter.variable}`}>
```
