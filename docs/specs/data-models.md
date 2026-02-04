# Especificación: Modelos de Datos

## Ubicación
`lib/types.ts`

## Interfaces Principales

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;  // ISO 8601 format
  tags: string[];          // Array de tag IDs
  createdAt: string;       // ISO 8601 format
  updatedAt: string;       // ISO 8601 format
}
```

#### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único (UUID o nanoid) |
| `title` | string | Sí | Título de la tarea (máx. 100 caracteres) |
| `description` | string | No | Descripción detallada (puede estar vacío) |
| `status` | TaskStatus | Sí | Estado actual de la tarea |
| `priority` | TaskPriority | Sí | Nivel de prioridad |
| `dueDate` | string \| null | No | Fecha límite en formato ISO |
| `tags` | string[] | No | IDs de las etiquetas asociadas |
| `createdAt` | string | Sí | Fecha de creación (auto-generada) |
| `updatedAt` | string | Sí | Fecha de última modificación (auto-actualizada) |

### TaskStatus

```typescript
type TaskStatus = 'pending' | 'in_progress' | 'completed';
```

| Valor | Label UI | Descripción |
|-------|----------|-------------|
| `pending` | Pendiente | Tarea por comenzar |
| `in_progress` | En progreso | Tarea en desarrollo |
| `completed` | Completada | Tarea finalizada |

### TaskPriority

```typescript
type TaskPriority = 'high' | 'medium' | 'low';
```

| Valor | Label UI | Descripción |
|-------|----------|-------------|
| `high` | Alta | Prioridad máxima, atender primero |
| `medium` | Media | Prioridad normal |
| `low` | Baja | Puede esperar |

### Tag

```typescript
interface Tag {
  id: string;
  name: string;
  color: TagColor;
}
```

#### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único |
| `name` | string | Sí | Nombre de la etiqueta (máx. 20 caracteres) |
| `color` | TagColor | Sí | Color de la paleta predefinida |

### TagColor

```typescript
type TagColor =
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';
```

## Tipos de Formulario

### TaskFormData

Datos para crear o editar una tarea (sin campos auto-generados).

```typescript
interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
}
```

### TagFormData

```typescript
interface TagFormData {
  name: string;
  color: TagColor;
}
```

## Tipos de Filtros

### TaskFilters

```typescript
interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  tags: string[];          // Tag IDs a incluir
  showOverdue: boolean;    // Mostrar solo vencidas
}
```

## Tipos de Ordenamiento

### TaskSortField

```typescript
type TaskSortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
```

### TaskSortOrder

```typescript
type TaskSortOrder = 'asc' | 'desc';
```

### TaskSort

```typescript
interface TaskSort {
  field: TaskSortField;
  order: TaskSortOrder;
}
```

## Constantes Relacionadas

Ver `lib/constants.ts` para:
- `TASK_STATUSES`: Array con metadata de estados
- `TASK_PRIORITIES`: Array con metadata de prioridades
- `TAG_COLORS`: Array con colores disponibles para tags
- `DEFAULT_TASK`: Valores por defecto para nueva tarea
- `DEFAULT_FILTERS`: Filtros iniciales

## Validaciones

### Task
- `title`: Requerido, 1-100 caracteres
- `description`: Opcional, máximo 500 caracteres
- `dueDate`: Si se proporciona, debe ser fecha válida

### Tag
- `name`: Requerido, 1-20 caracteres, único (case-insensitive)
- `color`: Debe ser un valor válido de `TagColor`

## Persistencia

Los datos se almacenan en localStorage con las siguientes claves:
- `task-it-tasks`: Array de `Task`
- `task-it-tags`: Array de `Tag`

Formato: JSON stringificado.
