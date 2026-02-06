# Especificación: Componentes de Tareas

## Ubicación
`components/task/`

Componentes específicos para la gestión de tareas.

---

## TaskCard

**Archivo:** `TaskCard.tsx`

Tarjeta que muestra una tarea individual con toda su información.

### Props

```typescript
interface TaskCardProps {
  task: Task;
  tags: Tag[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}
```

### Estructura Visual

```
┌─────────────────────────────────────────────┐
│ [PriorityIndicator] Title          [Status] │
│                                             │
│ Description preview (truncated)...          │
│                                             │
│ 📅 Due date indicator    [Tag1] [Tag2]      │
│                                             │
│                        [Edit] [Delete]      │
└─────────────────────────────────────────────┘
```

### Comportamiento

- **Click en Status Badge**: Cicla al siguiente estado (pending → in_progress → completed → pending)
- **Click en Edit**: Llama `onEdit` con la tarea
- **Click en Delete**: Muestra confirmación, luego llama `onDelete`
- **Hover**: Sombra elevada, muestra botones de acción

### Estados Visuales

| Estado de Tarea | Estilo |
|-----------------|--------|
| `pending` | Borde izquierdo amber |
| `in_progress` | Borde izquierdo blue |
| `completed` | Borde izquierdo green, texto con opacidad |

### Indicadores de Fecha

| Condición | Indicador |
|-----------|-----------|
| Vencida | Texto rojo, icono de alerta |
| Hoy | Texto naranja |
| Mañana | Texto amarillo |
| Esta semana | Texto normal |
| Sin fecha | No mostrar |

---

## TaskList

**Archivo:** `TaskList.tsx`

Contenedor que renderiza la lista de tareas.

### Props

```typescript
interface TaskListProps {
  tasks: Task[];
  tags: Tag[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}
```

### Comportamiento

- Si `isLoading`: Muestra skeleton loaders
- Si `tasks.length === 0`: Muestra EmptyState
- Renderiza TaskCard para cada tarea
- Layout: Grid responsive (1 col mobile, 2 cols tablet, 3 cols desktop)

### Skeleton

Muestra 3-6 placeholder cards con animación pulse durante la carga inicial.

---

## TaskForm

**Archivo:** `TaskForm.tsx`

Formulario para crear y editar tareas.

### Props

```typescript
interface TaskFormProps {
  task?: Task;  // Si existe, modo edición
  tags: Tag[];
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

### Campos

| Campo | Tipo Input | Validación |
|-------|------------|------------|
| title | Input text | Requerido, máx 100 chars |
| description | Textarea | Opcional, máx 500 chars |
| status | Select | Requerido |
| priority | Select/Radio | Requerido |
| dueDate | Input date | Opcional |
| tags | TaskTagsInput | Opcional |

### Layout del Formulario

```
┌─────────────────────────────────────────────┐
│ Título *                                    │
│ [________________________________]          │
│                                             │
│ Descripción                                 │
│ [________________________________]          │
│ [________________________________]          │
│                                             │
│ Estado         Prioridad                    │
│ [▼ Pendiente]  ○ Alta ● Media ○ Baja       │
│                                             │
│ Fecha límite                                │
│ [📅 dd/mm/yyyy]                             │
│                                             │
│ Etiquetas                                   │
│ [Tag1 ✕] [Tag2 ✕] [+ Añadir]               │
│                                             │
│              [Cancelar] [Guardar]           │
└─────────────────────────────────────────────┘
```

### Comportamiento

- Modo creación: campos vacíos con defaults
- Modo edición: campos pre-poblados con datos de la tarea
- Validación en submit
- `isSubmitting`: deshabilita botones, muestra spinner

---

## TaskFilters

**Archivo:** `TaskFilters.tsx`

Barra de filtros y búsqueda.

### Props

```typescript
interface TaskFiltersProps {
  filters: TaskFilters;
  tags: Tag[];
  onChange: (filters: TaskFilters) => void;
  taskCount: {
    total: number;
    filtered: number;
  };
}
```

### Estructura

```
┌─────────────────────────────────────────────┐
│ [🔍 Buscar tareas...              ]         │
│                                             │
│ Estado: [▼ Todos]  Prioridad: [▼ Todas]    │
│                                             │
│ Tags: [Tag1] [Tag2] [Tag3] ...              │
│                                             │
│ Mostrando 5 de 12 tareas    [Limpiar]       │
└─────────────────────────────────────────────┘
```

### Comportamiento

- Búsqueda: Filtra por título y descripción (debounced 300ms)
- Filtros de estado/prioridad: Selects con opción "Todos"
- Tags: Multi-select, click para toggle
- Contador: Actualiza en tiempo real
- Botón limpiar: Resetea todos los filtros

---

## TaskStatusBadge

**Archivo:** `TaskStatusBadge.tsx`

Badge específico para mostrar el estado de una tarea.

### Props

```typescript
interface TaskStatusBadgeProps {
  status: TaskStatus;
  onClick?: () => void;
  interactive?: boolean;
}
```

### Estilos por Estado

| Estado | Background | Text | Icon |
|--------|------------|------|------|
| `pending` | amber-100 | amber-800 | ○ |
| `in_progress` | blue-100 | blue-800 | ◐ |
| `completed` | green-100 | green-800 | ✓ |

### Comportamiento

- Si `interactive`: cursor pointer, hover effect
- Click dispara ciclo de estados si hay `onClick`

---

## TaskPriorityBadge

**Archivo:** `TaskPriorityBadge.tsx`

Indicador visual de prioridad.

### Props

```typescript
interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
}
```

### Estilos por Prioridad

| Prioridad | Color | Icon |
|-----------|-------|------|
| `high` | red-500 | ▲ |
| `medium` | amber-500 | ● |
| `low` | gray-400 | ▼ |

### Variantes

- Solo icono (default): Compacto, para uso en cards
- Con label (`showLabel`): Icono + texto

---

## TaskTagsInput

**Archivo:** `TaskTagsInput.tsx`

Input para seleccionar y crear tags.

### Props

```typescript
interface TaskTagsInputProps {
  selectedTags: string[];  // IDs
  availableTags: Tag[];
  onChange: (tagIds: string[]) => void;
  onCreateTag?: (name: string) => void;
}
```

### Estructura

```
┌─────────────────────────────────────────────┐
│ [Tag1 ✕] [Tag2 ✕]                           │
│ ┌─────────────────────────────────────────┐ │
│ │ [Buscar o crear tag...]              │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ ○ Existing Tag 1                        │ │
│ │ ○ Existing Tag 2                        │ │
│ │ + Crear "nuevo tag"                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Comportamiento

- Input de búsqueda filtra tags existentes
- Click en tag existente: toggle selección
- Si no hay match: opción "Crear nuevo tag"
- Tags seleccionados muestran badge con X para eliminar
- Dropdown se cierra al seleccionar o click fuera

---

## TaskDueDateIndicator

**Archivo:** `TaskDueDateIndicator.tsx`

Muestra la fecha límite con formato relativo e indicador visual.

### Props

```typescript
interface TaskDueDateIndicatorProps {
  dueDate: string | null;
  compact?: boolean;
}
```

### Formato de Fecha

| Condición | Texto | Estilo |
|-----------|-------|--------|
| Sin fecha | — | gray-400 |
| Vencida | "Vencida hace X días" | red-600, font-bold |
| Hoy | "Vence hoy" | orange-600 |
| Mañana | "Vence mañana" | amber-600 |
| Esta semana | "Vence el [día]" | text normal |
| Más adelante | "Vence el dd/mm" | text normal |

### Modo Compact

Solo muestra icono + fecha corta (para cards).

---

## Accesibilidad

- **TaskCard**: role="article", botones con aria-label
- **TaskForm**: Labels asociados, aria-invalid en errores
- **TaskFilters**: Labels para cada control de filtro
- **TaskTagsInput**: Navegación con teclado, aria-expanded
- **Badges interactivos**: role="button", aria-pressed
