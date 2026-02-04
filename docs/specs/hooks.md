# Especificación: Hooks Personalizados

## Ubicación
`hooks/`

---

## useLocalStorage

**Archivo:** `useLocalStorage.ts`

Hook para persistencia en localStorage con seguridad SSR.

### Firma

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void]
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `key` | string | Clave para localStorage |
| `initialValue` | T | Valor inicial si no existe dato guardado |

### Retorno

| Índice | Tipo | Descripción |
|--------|------|-------------|
| 0 | T | Valor actual |
| 1 | function | Setter (acepta valor o función actualizadora) |

### Comportamiento

1. **Inicialización SSR-safe**:
   - En servidor: retorna `initialValue`
   - En cliente: lee de localStorage o usa `initialValue`

2. **Sincronización**:
   - Actualiza localStorage en cada cambio
   - Escucha eventos `storage` para sincronizar entre tabs

3. **Serialización**:
   - Guarda: `JSON.stringify(value)`
   - Lee: `JSON.parse(stored)` con try-catch

4. **Errores**:
   - Si localStorage no disponible: usa estado en memoria
   - Si JSON inválido: usa `initialValue`

### Ejemplo de Uso

```typescript
const [tasks, setTasks] = useLocalStorage<Task[]>('task-it-tasks', []);

// Añadir tarea
setTasks(prev => [...prev, newTask]);

// Reemplazar todas
setTasks(newTasks);
```

---

## useTasks

**Archivo:** `useTasks.ts`

Hook principal para CRUD de tareas.

### Firma

```typescript
function useTasks(): {
  tasks: Task[];
  isLoading: boolean;
  addTask: (data: TaskFormData) => Task;
  updateTask: (id: string, data: Partial<TaskFormData>) => Task | null;
  deleteTask: (id: string) => boolean;
  getTask: (id: string) => Task | undefined;
  updateStatus: (id: string, status: TaskStatus) => Task | null;
  cycleStatus: (id: string) => Task | null;
}
```

### Métodos

#### `addTask(data: TaskFormData): Task`

Crea una nueva tarea.

- Genera `id` único
- Establece `createdAt` y `updatedAt` al momento actual
- Retorna la tarea creada

#### `updateTask(id: string, data: Partial<TaskFormData>): Task | null`

Actualiza una tarea existente.

- Actualiza solo los campos proporcionados
- Actualiza `updatedAt`
- Retorna la tarea actualizada o `null` si no existe

#### `deleteTask(id: string): boolean`

Elimina una tarea.

- Retorna `true` si se eliminó, `false` si no existía

#### `getTask(id: string): Task | undefined`

Obtiene una tarea por ID.

#### `updateStatus(id: string, status: TaskStatus): Task | null`

Atajo para cambiar solo el estado.

#### `cycleStatus(id: string): Task | null`

Cicla el estado: pending → in_progress → completed → pending.

### Estado `isLoading`

- `true` durante la hidratación inicial (SSR → cliente)
- `false` una vez que los datos están listos

### Persistencia

Usa `useLocalStorage` internamente con clave `'task-it-tasks'`.

---

## useTags

**Archivo:** `useTags.ts`

Hook para CRUD de etiquetas.

### Firma

```typescript
function useTags(): {
  tags: Tag[];
  isLoading: boolean;
  addTag: (data: TagFormData) => Tag;
  updateTag: (id: string, data: Partial<TagFormData>) => Tag | null;
  deleteTag: (id: string) => boolean;
  getTag: (id: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
}
```

### Métodos

#### `addTag(data: TagFormData): Tag`

Crea una nueva etiqueta.

- Genera `id` único
- Valida nombre único (case-insensitive)
- Retorna la etiqueta creada

#### `updateTag(id: string, data: Partial<TagFormData>): Tag | null`

Actualiza una etiqueta existente.

#### `deleteTag(id: string): boolean`

Elimina una etiqueta.

- **Importante**: No elimina la referencia en las tareas automáticamente

#### `getTag(id: string): Tag | undefined`

Obtiene una etiqueta por ID.

#### `getTagsByIds(ids: string[]): Tag[]`

Obtiene múltiples etiquetas por sus IDs.

- Filtra IDs que no existen silenciosamente

### Persistencia

Usa `useLocalStorage` internamente con clave `'task-it-tags'`.

### Tags por Defecto

Si no hay tags guardados, inicializa con tags predefinidos:
- Trabajo (blue)
- Personal (green)
- Urgente (red)
- Reunión (purple)
- Idea (amber)

---

## useTaskFilters

**Archivo:** `useTaskFilters.ts`

Hook para lógica de filtrado de tareas.

### Firma

```typescript
function useTaskFilters(tasks: Task[]): {
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  filteredTasks: Task[];
  counts: {
    total: number;
    filtered: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
  };
}
```

### Estado de Filtros

```typescript
interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  tags: string[];
  showOverdue: boolean;
}
```

### Valores Iniciales

```typescript
const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  tags: [],
  showOverdue: false,
};
```

### Lógica de Filtrado

Los filtros se aplican en orden AND:

1. **search**: Busca en `title` y `description` (case-insensitive)
2. **status**: Filtra por estado exacto (si no es 'all')
3. **priority**: Filtra por prioridad exacta (si no es 'all')
4. **tags**: Tarea debe tener AL MENOS UNO de los tags seleccionados
5. **showOverdue**: Si true, solo muestra tareas con `dueDate` < hoy

### Optimización

- `filteredTasks` se memoriza con `useMemo`
- Debounce en búsqueda (300ms) manejado por el componente padre

### Ejemplo de Uso

```typescript
const { tasks } = useTasks();
const {
  filters,
  setFilters,
  filteredTasks,
  counts
} = useTaskFilters(tasks);

// Cambiar filtro
setFilters({ status: 'pending' });

// Limpiar todos los filtros
resetFilters();

// Mostrar contador
console.log(`Mostrando ${counts.filtered} de ${counts.total} tareas`);
```

---

## useDebounce

**Archivo:** `useDebounce.ts`

Hook auxiliar para debouncing de valores.

### Firma

```typescript
function useDebounce<T>(value: T, delay: number): T
```

### Uso

```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// debouncedSearch solo se actualiza después de 300ms sin cambios
```

---

## Consideraciones de Rendimiento

1. **Memoización**: Todos los hooks memorizan cálculos costosos
2. **Batch updates**: Las actualizaciones múltiples se agrupan
3. **Lazy initialization**: localStorage se lee solo una vez al montar
4. **Referential stability**: Los callbacks se memorizan con `useCallback`
