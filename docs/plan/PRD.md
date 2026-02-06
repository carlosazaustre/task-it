# Plan de Implementación: Task-It MVP

## Resumen

Aplicación de gestión de tareas laborales con CRUD completo, estados, prioridades, fechas límite y tags. Persistencia en localStorage, sin autenticación.

## Estructura de Directorios

```
task-it/
├── app/
│   ├── layout.tsx          # Actualizar metadata
│   ├── page.tsx             # Página principal
│   └── globals.css          # Variables CSS adicionales
├── components/
│   ├── ui/                  # Button, Input, Select, Badge, Modal, Spinner, EmptyState
│   └── task/                # TaskList, TaskCard, TaskForm, TaskFilters, TaskStatusBadge, TaskPriorityBadge, TaskTagsInput
├── hooks/
│   ├── useLocalStorage.ts   # Persistencia con SSR safety
│   ├── useTasks.ts          # CRUD y lógica principal
│   ├── useTags.ts           # CRUD de tags
│   └── useTaskFilters.ts    # Lógica de filtrado
└── lib/
    ├── types.ts             # Interfaces TypeScript
    ├── constants.ts         # Estados, prioridades, colores
    └── utils.ts             # Helpers (generateId, formatDate, etc.)
```

## Modelo de Datos Principal

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}
```

## Fases de Implementación

### Fase 1: Fundamentos
- [ ] Crear estructura de directorios
- [ ] `lib/types.ts` - Interfaces y tipos
- [ ] `lib/constants.ts` - Estados, prioridades, colores predefinidos
- [ ] `lib/utils.ts` - generateId, formatRelativeDate
- [ ] `hooks/useLocalStorage.ts` - Hook con SSR safety
- [ ] Actualizar `globals.css` con variables de colores

### Fase 2: Componentes UI Base
- [ ] `components/ui/Button.tsx` - primary, secondary, danger, ghost
- [ ] `components/ui/Input.tsx` - con estados de error
- [ ] `components/ui/Badge.tsx` - para status, priority, tags
- [ ] `components/ui/Modal.tsx` - con backdrop y animación
- [ ] `components/ui/EmptyState.tsx` - mensaje + CTA

### Fase 3: CRUD de Tareas
- [ ] `hooks/useTasks.ts` - crear, leer, actualizar, eliminar
- [ ] `components/task/TaskCard.tsx` - tarjeta individual
- [ ] `components/task/TaskList.tsx` - lista con empty state
- [ ] `components/task/TaskForm.tsx` - formulario crear/editar
- [ ] Integrar en `app/page.tsx`

### Fase 4: Estados y Prioridades
- [ ] `components/task/TaskStatusBadge.tsx` - colores semánticos
- [ ] `components/task/TaskPriorityBadge.tsx` - indicador visual
- [ ] Quick status change en TaskCard (click para ciclar)
- [ ] Visual hierarchy por prioridad

### Fase 5: Fechas Límite
- [ ] DatePicker en TaskForm (input nativo)
- [ ] Mostrar fecha relativa en TaskCard ("Mañana", "En 3 días")
- [ ] Indicadores visuales: overdue (rojo), hoy (naranja), próximo (amarillo)

### Fase 6: Tags/Etiquetas
- [ ] `hooks/useTags.ts` - CRUD de tags
- [ ] `components/task/TaskTagsInput.tsx` - input con autocompletado
- [ ] Badges de tags en TaskCard
- [ ] Colores predefinidos para tags

### Fase 7: Filtros y Búsqueda
- [ ] `hooks/useTaskFilters.ts` - lógica de filtrado
- [ ] `components/task/TaskFilters.tsx` - barra de filtros
- [ ] Búsqueda por texto (título + descripción)
- [ ] Filtros por status, priority, tags
- [ ] Contador "Mostrando X de Y tareas"

### Fase 8: Pulido Final
- [ ] Animaciones de entrada/salida
- [ ] Skeleton loading inicial
- [ ] Responsive testing
- [ ] Accesibilidad (ARIA labels, focus management)

## Paleta de Colores

| Concepto | Color | Uso |
|----------|-------|-----|
| Status Pending | amber-500 | Tareas pendientes |
| Status In Progress | blue-500 | Tareas en curso |
| Status Completed | green-500 | Tareas completadas |
| Priority High | red-500 | Prioridad alta |
| Priority Medium | amber-500 | Prioridad media |
| Priority Low | gray-500 | Prioridad baja |
| Date Overdue | red-500 | Fecha vencida |
| Date Today | orange-500 | Vence hoy |

## Archivos Críticos

1. `lib/types.ts` - Base del modelo de datos
2. `hooks/useLocalStorage.ts` - Persistencia SSR-safe
3. `hooks/useTasks.ts` - Lógica de negocio principal
4. `components/task/TaskCard.tsx` - Componente central de UI
5. `app/page.tsx` - Orquestación de la aplicación

## Verificación

Para verificar cada fase:
1. `npm run dev` - Iniciar servidor de desarrollo
2. `npm run lint` - Verificar errores de linting
3. `npm run build` - Asegurar que compila sin errores
4. Probar manualmente en navegador (desktop y mobile)
5. Verificar persistencia: recargar página y confirmar que los datos persisten
