# Fase 3: Migración del Frontend

> **Estado**: Pendiente
> **Bloquea**: Fase 6
> **Bloqueado por**: Fase 2 (API Core)
> **Paralelizable**: Sí, con Fase 4 y Fase 5

## Objetivo

Reemplazar la persistencia en localStorage por llamadas a la API REST, manteniendo la misma UX que el usuario ya conoce. La migración debe ser transparente: el usuario no debería notar diferencia funcional.

## Estrategia de Migración

### Principio: Hook-level migration

La arquitectura actual encapsula toda la lógica de datos en hooks (`useTasks`, `useTags`, etc.). La migración consiste en **reemplazar la implementación interna de los hooks** sin cambiar sus interfaces públicas. Los componentes que consumen estos hooks no necesitan cambios.

```
ANTES:
  Component → useTasks() → localStorage

DESPUÉS:
  Component → useTasks() → fetch('/api/v1/tasks') → PostgreSQL
```

### Patrón de cada hook migrado

```typescript
function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carga inicial
  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/tasks')
      const { data } = await res.json()
      setTasks(data)
    } catch {
      setError('Error al cargar tareas')
    } finally {
      setIsLoading(false)
    }
  }

  // Operaciones con optimistic updates
  async function addTask(formData: TaskFormData) {
    const optimisticTask = createOptimisticTask(formData)
    setTasks(prev => [optimisticTask, ...prev])

    try {
      const res = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const { data } = await res.json()
      setTasks(prev => prev.map(t => t.id === optimisticTask.id ? data : t))
      return data
    } catch {
      setTasks(prev => prev.filter(t => t.id !== optimisticTask.id))
      throw new Error('Error al crear tarea')
    }
  }

  return { tasks, isLoading, error, addTask, ... }
}
```

## Tareas

### T3.1: Crear capa de API client
**Bloqueante**: Sí (todos los hooks migrados la usarán)
**Paralelo**: No

Crear `lib/api-client.ts`:

```typescript
const API_BASE = '/api/v1'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
      throw new ApiError(error.error, res.status, error.details)
    }

    if (res.status === 204) return undefined as T

    const json = await res.json()
    return json.data ?? json
  }

  // Tasks
  getTasks(params?: TaskQueryParams) { ... }
  getTask(id: string) { ... }
  createTask(data: CreateTaskInput) { ... }
  updateTask(id: string, data: UpdateTaskInput) { ... }
  deleteTask(id: string) { ... }

  // Tags
  getTags() { ... }
  createTag(data: CreateTagInput) { ... }
  updateTag(id: string, data: UpdateTagInput) { ... }
  deleteTag(id: string) { ... }

  // Settings
  getSettings() { ... }
  updateSettings(data: UpdateSettingsInput) { ... }

  // Profile
  getProfile() { ... }
  updateProfile(data: UpdateProfileInput) { ... }
}

export const api = new ApiClient()
```

**Clase ApiError**:
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: object
  ) {
    super(message)
  }
}
```

---

### T3.2: Migrar `useTasks` hook
**Bloqueante**: Sí (componente más crítico)
**Depende de**: T3.1

**Cambios**:
1. Reemplazar `useLocalStorage` por `useState` + `useEffect` fetch
2. Añadir `error` state
3. Implementar optimistic updates para addTask, updateTask, deleteTask
4. Mantener la misma interfaz pública del hook

**Interfaz pública (NO cambia)**:
```typescript
function useTasks(): {
  tasks: Task[]
  isLoading: boolean
  addTask(data: TaskFormData): Promise<Task>
  updateTask(id: string, data: Partial<TaskFormData>): Promise<Task | null>
  deleteTask(id: string): Promise<boolean>
  getTask(id: string): Task | undefined
  updateStatus(id: string, status: TaskStatus): Promise<Task | null>
  cycleStatus(id: string): Promise<Task | null>
}
```

**Nuevo campo añadido**:
```typescript
error: string | null  // Para mostrar errores de API
refetch(): Promise<void>  // Para forzar recarga
```

---

### T3.3: Migrar `useTags` hook
**Bloqueante**: Sí (necesario para TaskForm)
**Paralelo con**: T3.2

**Misma estrategia que T3.2**:
- Fetch inicial de tags
- Optimistic updates
- Validación de nombre único (ahora la DB lo valida)

---

### T3.4: Migrar `useTaskFilters` hook
**Bloqueante**: No
**Depende de**: T3.2

**Decisión de diseño**: Los filtros pueden aplicarse:
1. **En cliente** (como ahora): Filtra sobre los tasks ya cargados
2. **En servidor**: Envía filtros como query params a la API

**Recomendación**: Enfoque híbrido.
- Búsqueda, status, priority → **Server-side** (reduce datos transferidos)
- Tags filter chips → **Client-side** (ya tenemos los datos, UX más rápida)

**Implementación**:
```typescript
function useTaskFilters() {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Debounce search para no hacer requests en cada tecla
  const debouncedSearch = useDebounce(filters.search, 300)

  // Fetch con filtros server-side
  useEffect(() => {
    const params = buildQueryParams({
      search: debouncedSearch,
      status: filters.status !== 'all' ? filters.status : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      overdue: filters.showOverdue || undefined,
    })

    api.getTasks(params).then(setTasks)
  }, [debouncedSearch, filters.status, filters.priority, filters.showOverdue])

  // Filtro client-side para tags (instantáneo)
  const filteredTasks = useMemo(() => {
    if (filters.tags.length === 0) return tasks
    return tasks.filter(t =>
      t.tags.some(tag => filters.tags.includes(tag.id))
    )
  }, [tasks, filters.tags])

  return { filters, setFilters, filteredTasks, isLoading, ... }
}
```

---

### T3.5: Añadir estados de error en componentes
**Bloqueante**: No
**Paralelo con**: T3.2, T3.3

Actualizar componentes para manejar errores de API:

**TaskList.tsx**:
```tsx
if (error) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Error al cargar tareas"
      description={error}
      action={{ label: 'Reintentar', onClick: refetch }}
    />
  )
}
```

**TaskForm.tsx**:
- Mostrar error toast si falla crear/editar
- Deshabilitar botón de submit durante request
- Mantener formulario abierto si falla (no perder datos)

**TaskCard.tsx**:
- Si falla el cycle status, revertir visualmente
- Mostrar indicador de error temporal

---

### T3.6: Migrar `useSettings` hook
**Bloqueante**: No
**Paralelo con**: T3.2, T3.3

**Cambios**:
- Profile: GET/PATCH `/api/v1/settings/profile`
- Settings: GET/PATCH `/api/v1/settings`
- Export/Import: Mantener funcionalidad pero con datos del servidor
- Clear data: Requiere endpoint dedicado

---

### T3.7: Actualizar `useTheme` hook
**Bloqueante**: No
**Paralelo con**: T3.6

**Decisión**: El tema puede seguir en localStorage (no necesita persistir en servidor) O sincronizarse con settings del servidor.

**Recomendación**: Mantener en localStorage para instant theme switching, pero sincronizar con settings del servidor como backup. El localStorage tiene prioridad (UX sin latencia).

---

### T3.8: Actualizar UserProfile con datos de sesión
**Bloqueante**: No
**Depende de**: Fase 1 (Auth)

**Cambios en `UserProfile.tsx`**:
```tsx
import { useSession } from 'next-auth/react'

function UserProfile() {
  const { data: session } = useSession()

  return (
    <div>
      <Avatar initials={getInitials(session?.user?.name)} />
      <span>{session?.user?.name}</span>
      <span>{session?.user?.email}</span>
    </div>
  )
}
```

---

### T3.9: Eliminar dependencia de localStorage para datos principales
**Bloqueante**: No (cleanup)
**Depende de**: T3.2, T3.3, T3.6

Una vez migrados todos los hooks:
1. Eliminar las keys de localStorage usadas para tasks y tags
2. Mantener localStorage solo para:
   - Theme preference (`task-it-theme`)
   - Pomodoro state temporal (timer en ejecución)
3. Actualizar `useLocalStorage` hook: mantenerlo para los casos que aún lo usen
4. Limpiar imports no usados

---

## Orden de ejecución sugerido

```
T3.1 (API Client) ─────────────────────────────────────┐
                                                         │
├─ T3.2 (useTasks) ──────┐                              │
│                          │                              │
├─ T3.3 (useTags) ────── T3.4 (useTaskFilters)          │
│                          │                              │
├─ T3.5 (Error states) ───┤                              │
│                          │                              │
├─ T3.6 (useSettings) ────┤                              │
│                          │                              │
├─ T3.7 (useTheme) ───────┤                              │
│                          │                              │
├─ T3.8 (UserProfile) ────┤                              │
│                          │                              │
└─ T3.9 (Cleanup) ◄───────┘                              │
```

## Criterios de Aceptación

- [ ] La app funciona idénticamente al estado actual
- [ ] Las tareas se persisten en PostgreSQL (verificable con Prisma Studio)
- [ ] Los tags se persisten en PostgreSQL
- [ ] Crear tarea → aparece inmediatamente (optimistic update)
- [ ] Editar tarea → actualiza inmediatamente
- [ ] Borrar tarea → desaparece inmediatamente
- [ ] Si la API falla, se muestra error y se revierte el optimistic update
- [ ] Los filtros funcionan correctamente
- [ ] La búsqueda funciona con debounce
- [ ] El nombre del usuario viene de la sesión, no de localStorage
- [ ] Recargar la página mantiene todos los datos
- [ ] Múltiples pestañas muestran los mismos datos (no localStorage sync, sino misma DB)
- [ ] `npm run build` compila sin errores
- [ ] No hay referencias a localStorage para tasks/tags (excepto theme y pomodoro state)
